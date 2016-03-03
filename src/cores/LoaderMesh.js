define([
    'jquery', 
    'THREE', 
    './State', 
    './Header', 
    './Node', 
    './NodeIndex' , './Patch', './PatchIndex', './Texture', './TextureIndex', './Signature', './PriorityQueue' ,'./saywho'],
function(
        $, 
        THREE, 
        State, 
        Header, 
        Node, 
        NodeIndex, Patch, PatchIndex, Texture, TextureIndex, Signature, PriorityQueue, sayswho){
    
var Debug = {
	nodes: true,    //color each node
	culling: false,  //visibility culling disabled
	draw: false,     //final rendering call disabled
	extract: false,  //no extraction
	request: false,  //no network requests
	worker: false    //no web workers
};

sortPatchesFunction = function (a, b) {
	return ((a.frame != b.frame) ? (b.frame - a.frame) : (b.error - a.error));
};

sortNodesFunction = function (a, b) {
	return a.node.renderError - b.node.renderError;
};

sortNodeCacheFunction = function (a, b) {
	return ((a.renderFrame != b.renderFrame) ? (b.renderFrame - a.renderFrame) : (b.renderError - a.renderError));
	//return b.renderError - a.renderError;
};

var LoaderMesh = function () {
	THREE.Object3D.call( this );
	this._targetError        = State.DEFAULT_TARGET_ERROR;
	this._targetFps          = State.DEFAULT_TARGET_FPS;
	this._maxPendingRequests = State.DEFAULT_MAX_PENDING_REQUESTS;
	this._maxCacheSize       = State.DEFAULT_CACHE_SIZE;
	this.drawBudget         = State.DEFAULT_DRAW_BUDGET;
	this._minDrawBudget      = State.DEFAULT_DRAW_BUDGET / 4;
        this._onUpdate           = null;
	this._onSceneReady       = null;

        this._frustum = new THREE.Frustum();
	this._viewPoint   = new THREE.Vector3();
        
        this.LITTLE_ENDIAN_DATA = State.LITTLE_ENDIAN_DATA;
        this.PADDING            = State.PADDING; 
        
        this._materials = null;
       	this._reset();
};

LoaderMesh.prototype = Object.create(THREE.Object3D.prototype);
LoaderMesh.prototype.constructor = LoaderMesh;

LoaderMesh.prototype._reset = function () {
		this._status  = State.STATUS_NONE;

		this._inBegin = false;

		this._url     = null;

		this._header   = null;
		this._nodes    = null;
		this._patches  = null;
		this._textures = null;

		this._visitedNodes    = null;
		this._blockedNodes    = null;
		this._selectedNodes   = null;

                this._drawSize        = 0; //number of triangle to be rendered
		this._rendered        = 0; //currently rendered triangles
		this._estimatedTpS    = 200000; //in million triangles
		this._cacheSize       = 0;
		this._cachedNodes     = null;
		this._readyNodes      = null;
		this._frame           = 0;

		this._pendingRequests = 0;
		this._candidateNodes  = null;
		this._redrawOnNewNodes = true;

		var that = this;
                
		var path;
		$('script').each(function(a) { var str = $(this).attr('src'); if(!str) return; if(str.search('LoaderMesh.js') >= 0) path = str; });
		path = path.replace('LoaderMesh.js', '../worker/MeshCodeWorker.js'); //meshcoder_worker.js
		this._worker = new Worker(path);
		this._worker.onmessage = function(e) { that._workerFinished(e); };
              
};

LoaderMesh.prototype._requestHeader = function () {
		var offset = 0;
		var size   = Header.SIZEOF;
		var that = this;
		var r = new XMLHttpRequest();
		r.open('GET', this.url(), true);
		r.responseType = 'arraybuffer';
		r.setRequestHeader("Range", "bytes=" + offset + "-" + (offset + size -1));
		r.onload = function () {
			that._handleHeader(r.response);
			that._requestIndex();
		};
		r.send();
};

LoaderMesh.prototype._handleHeader = function (buffer) {
		var view         = new DataView(buffer);
		var offset       = 0;
		var littleEndian = State.LITTLE_ENDIAN_DATA;

		var header = new Header();
		header.import(view, offset, littleEndian);
		this._header = header;
                this._createMaterialForEachPatch();
};


LoaderMesh.prototype._createMaterialForEachPatch = function(){
                var materials = []; 
                for(var i =0; i < this._header.patchesCount; i++){
                      var color = new THREE.Color().setHex( Math.random() * 0xffffff );
                      materials.push(new THREE.MeshBasicMaterial( { color: color} ));//, wireframe: false, side: THREE.DoubleSide, transparent : false, opacity :0.5
                }
                this._materials = new THREE.MultiMaterial(materials);
};

LoaderMesh.prototype._requestIndex = function () {
		var header = this._header;
		var offset = Header.SIZEOF;
		var size   = header.nodesCount * Node.SIZEOF + header.patchesCount * Patch.SIZEOF + header.texturesCount * Texture.SIZEOF;

		var that = this;
		var r = new XMLHttpRequest();
		r.open('GET', this.url(), true);
		r.responseType = 'arraybuffer';
		r.setRequestHeader("Range", "bytes=" + offset + "-" + (offset + size -1));
		r.onload = function () {
			that._handleIndex(r.response);
			that._openReady();
		};
		r.send();
};

LoaderMesh.prototype._handleIndex = function (buffer) {
		var header       = this._header;
		var view         = new DataView(buffer);
		var offset       = 0;
		var littleEndian = State.LITTLE_ENDIAN_DATA;

		var offset = 0;

		this._nodes = new NodeIndex();
		offset += this._nodes.import(header.nodesCount, view, offset, littleEndian);

		this._patches = new PatchIndex();
		offset += this._patches.import(header.patchesCount, view, offset, littleEndian);

		this._textures = new TextureIndex();
		offset += this._textures.import(header.texturesCount, view, offset, littleEndian);
};

LoaderMesh.prototype._openReady = function() {
		var nodesCount = this._nodes.length;
		var nodes      = this._nodes.items;
		for (var i=0; i<nodesCount; ++i) {
			var node = nodes[i];
			node.status      = State._NODE_NONE;
			node.request     = null;
                        node.vbo         = null; 
			node.color       = new THREE.Color();
			node.renderError = 0.0;
			node.renderFrame = 0;
		}

		this._cachedNodes  = [ ];
		this._readyNodes   = [ ];
		//this._pendingNodes = [ ];

		var nodesCount = this._header.nodesCount;
		this._visitedNodes  = new Uint8Array(nodesCount);  //Loader.BoolArray(nodesCount);
		this._blockedNodes  = new Uint8Array(nodesCount);  //new Loader.BoolArray(nodesCount);
		this._selectedNodes = new Uint8Array(nodesCount);  //new Loader.BoolArray(nodesCount);

		this._status = State.STATUS_OPEN;

		if (this._onSceneReady) {
			this._onSceneReady();
		}
};

LoaderMesh.prototype._signalUpdate = function () {
		var upd = this._onUpdate;
		if (upd) {
			upd();
		}
};

LoaderMesh.prototype.url= function() {
		var url = this._url;
		/**Safari PATCH**/
		/**/if (sayswho()[0]==='Safari' && sayswho()[1]!=='9') 
		/**/  url = this._url + '?' + Math.random();
		/**Safari PATCH**/
		return url;
};
        
LoaderMesh.prototype.getStatus = function() {
		return this._status;
};

LoaderMesh.prototype.isClosed = function() {
		return (this._status == State.STATUS_NONE);
};

LoaderMesh.prototype.isOpening = function() {
		return (this._status == State.STATUS_OPENING);
	},

LoaderMesh.prototype.isOpen = function() {
		return (this._status == State.STATUS_OPEN);
	},

LoaderMesh.prototype.isReady = function() {
		return this.isOpen() ;
	},

LoaderMesh.prototype.datasetCenter = function() {
		if (!this.isReady()) return new THREE.Vector3();
		return this._header.sphere.center;
	},

LoaderMesh.prototype.datasetRadius = function() {
		if (!this.isReady()) return 1.0;
		return this._header.sphere.radius;
	},

LoaderMesh.prototype.inBegin = function() {
		return this._inBegin;
	},

LoaderMesh.prototype.getMaxPendingRequests = function() {
		return this._maxPendingRequests;
	},

LoaderMesh.prototype.setMaxPendingRequests = function(r) {
		this._maxPendingRequests = r;
	},

LoaderMesh.prototype.getTargetError = function() {
		return this._targetError;
	},

LoaderMesh.prototype.setTargetError = function(e) {
		this._targetError = e;
	},

LoaderMesh.prototype.destroy = function () {
		this.close();
	},

LoaderMesh.prototype.open = function (url) {
		this.close();
		this._status = State.STATUS_OPENING;
		this._url    = url;
		this._requestHeader();
	},

LoaderMesh.prototype.close = function () {
		if (this.isClosed() ) return;

		if (this.isOpening() ) {
		}
		else if (this.isOpen() ) {
		}

		this._reset();
	},

LoaderMesh.prototype._updateCache = function () {
                var that = this;
		var readyNodes = this._readyNodes;
		if (readyNodes.length <= 0) return;

		var cachedNodes = this._cachedNodes;

		console.log('upateCache', readyNodes);

		var newCache = cachedNodes.concat(readyNodes);
		newCache.sort(sortNodeCacheFunction);

		var maxSize = this._maxCacheSize;
		var size    = 0;

		var firstVictim = -1;
		var newNodes  = [ ];

		for (var i=0, n=newCache.length; i<n; ++i) {
			var node  = newCache[i];
			var nsize = node.lastByte - node.offset + 1;
			if ((size + nsize) > maxSize) {
				firstVictim = i;
				break;
			}
			if (node.request) {
				newNodes.push(node);
			}
			else {
				size += nsize;
			}
		} //end newCache

		if (firstVictim >= 0) {
			for (var i=firstVictim, n=newCache.length; i<n; ++i) {
				var node = newCache[i];
				if (node.vbo) {
                                        //node.vbo.visible = false;
					node.vbo.geometry.dispose(); // node.vbo.destroy();
					node.vbo.material.dispose();
                                        node.vbo = null;
				}

				node.request = null;
				node.buffer = null;
				node.status  = State._NODE_NONE;
			}
			newCache = newCache.slice(0, firstVictim);
		}

		var vertexStride = this._header.signature.vertex.getByteLength();
		var faceStride   = this._header.signature.face.getByteLength();
		//var littleEndian = State.LITTLE_ENDIAN_DATA;
		//var gl           = this._gl;

		for (var i = 0, n = newNodes.length; i < n; ++i) {
			var node    = newNodes[i];
			//console.log("loading node: " + node.index);
			var compressed = Signature.MECO + Signature.CTM1 + Signature.CTM2;

			if(Debug.worker && this._header.signature.flags & compressed) {
				var request = node.request;
				var buffer = request.response;
				var sig = {
					texcoords: this._header.signature.vertex.hasTexCoord(),
					normals: this._header.signature.vertex.hasNormal(),
					colors:  this._header.signature.vertex.hasColor(),
					indices: this._header.signature.face.hasIndex()
				};
				var _node = {
					nvert: node.verticesCount,
					nface: node.facesCount,
					firstPatch: 0, 
					lastPatch: node.lastPatch - node.firstPatch,
					buffer: node.request.response
				};
				var p = [];
				for(var k = node.firstPatch; k < node.lastPatch; k++)
					p.push(this._patches.items[k].lastTriangle);

				if(this._header.signature.flags & Signature.MECO) {
					var now = window.performance.now();
					var coder = new MeshCoder(sig, _node, p);
					node.buffer = coder.decode(buffer);
					var elapsed = window.performance.now() - now;

					console.log("Z Time: " + elapsed + " Size: " + size + " KT/s: " + (node.facesCount/(elapsed)) + " Mbps " + (8*1000*node.buffer.byteLength/elapsed)/(1<<20));
	
				} else {
					node.buffer = ctmDecode(sig, _node, p);
				}
			}

			var nv = node.verticesCount;
			var nf = node.facesCount;

			var vertexOffset = 0;
			var vertexSize   = nv * vertexStride;
			var faceOffset   = vertexOffset + vertexSize;
			var faceSize     = nf * faceStride;

			var vertices = new Uint8Array(node.buffer, vertexOffset, vertexSize);
			var indices  = new Uint8Array(node.buffer, faceOffset,   faceSize);

			//node.vbo = new SglVertexBuffer (gl, {data : vertices});
                        var geometry  = new THREE.BufferGeometry();
 			geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 )); //.setDynamic( true )
			if (this._header.signature.face.hasIndex())
                                geometry.setIndex(new THREE.BufferAttribute( indices, 1));    
                        node.vbo = new THREE.Mesh(geometry, this._materials);
                        node.vbo.name = node.index;
                        this.add(node.vbo);
			node.request = null;
			//STEP 1: if textures not ready this will be delayed
			var isReady = true;	
			//var patches      = this._patches.items;
			for(var k = node.firstPatch; k < node.lastPatch; ++k) {
				var patch = this._patches.items[k];
				if(patch.texture == 0xffffffff) continue;
				if(this._textures.items[patch.texture].status != State._NODE_READY)
					isReady = false;
			}
			if(isReady)
				node.status  = State._NODE_READY;

			var nsize = node.lastByte - node.offset + 1;
			size += nsize;
		}

		this._readyNodes  = [ ];
		this._cachedNodes = newCache;
		this._cacheSize   = size;
	},
        
LoaderMesh.prototype._hierarchyVisit_isVisible = function (center, radius) {
		if (Debug.culling) return true;
		var sphere = new THREE.Sphere(center,radius);
		return this._frustum.intersectsSphere(sphere);
	},
       
LoaderMesh.prototype._hierarchyVisit_nodeError = function (n) {
		var node   = this._nodes.items[n];
		var sphere = node.sphere;
                // inline distance computation
		var a = sphere.center;
		var b = this._viewPoint;
		var dist = a.distanceTo(b) - sphere.radius;//must be node.tightRadius???
                // end inline
		if (dist < 0.1) dist = 0.1;

		var res   = this._resolution * dist;
		var error = node.error / res;

		if (!this._hierarchyVisit_isVisible(sphere.center, sphere.radius)) {//sphere.radius
			error /= 1000.0;
		}

		return error;
	},

LoaderMesh.prototype._hierarchyVisit_insertChildren = function (n, visitQueue, block) {
		var nodes        = this._nodes.items;
		var node         = nodes[n];
		var patches      = this._patches.items;
		var blockedNodes = this._blockedNodes;
		for(var i = node.firstPatch; i < node.lastPatch; ++i) {
			var patch = patches[i];
			var child = patch.node;
			if (block) blockedNodes[child] = 1;
			this._hierarchyVisit_insertNode(child, visitQueue);
		}
	},


LoaderMesh.prototype._hierarchyVisit_insertNode = function (n, visitQueue) {
		if (n == this._nodes.sink) return;

		if (this._visitedNodes[n]) return;
		this._visitedNodes[n] = 1;

		var error = this._hierarchyVisit_nodeError(n);
		if(error < this._targetError*0.8) return;  //2% speed TODO check if needed

		var node  = this._nodes.items[n];
		node.renderError = error;
		node.renderFrame = this._frame;

		var nodeData = {
			node  : node,
			index : n
		};
		visitQueue.push(nodeData);
	},
        

LoaderMesh.prototype._hierarchyVisit_expandNode = function (nodeData) {

		var node  = nodeData.node;
		if(node.renderError < this._targetError) {
//			console.log("Stop becaouse of error: " + node.renderError + " < " + this._targetError);
			return false;
		}
		if(this._drawSize > this.drawBudget) {
//			console.log("Stop because of draw budget: " + this._drawSize  + " > " + this.drawBudget);
			return false;
		}

		var sphere = node.sphere;
		if(this._hierarchyVisit_isVisible(sphere.center, node.tightRadius))
			this._drawSize += node.verticesCount/2; //faces

		if(node.status !== State._NODE_READY) {
//			console.log("Stop because node not ready:" + node.status);
//			here: mark a redraw when new nodes available.
			this._redrawOnNewNodes = true;
			return false;
		}
		return true;
	},
      

LoaderMesh.prototype._hierarchyVisit = function () {
            if(Debug.extract === true)
                		return;
		this._redrawOnNewNodes = false;

		var visitQueue    = new PriorityQueue();

		var nodesCount = this._nodes.length;
		for(var i = 0; i < nodesCount; i++) {
			this._visitedNodes[i] = 0; 
			this._blockedNodes[i] = 0;
			this._selectedNodes[i] = 0;
		}
		this._hierarchyVisit_insertNode(0, visitQueue);

		//var nodes = this._nodes.items;

		var candidatesCount = 0;
		this._candidateNodes = [ ];
		var candidateNodes = this._candidateNodes;

		this.currentError = 1e20;
		this._drawSize = 0;
		var count = 0;
		while (visitQueue.size() && (count < this._maxPendingRequests)) {
			var nodeData = visitQueue.pop();
			var n        = nodeData.index;
			var node     = nodeData.node;
			if ((candidatesCount < this._maxPendingRequests) && (node.status == State._NODE_NONE)) {
				candidatesCount++;
				candidateNodes.push(node);
			}
			var blocked = this._blockedNodes[n] || !this._hierarchyVisit_expandNode(nodeData);
			if (blocked) {
				count++;
			}
			else {
				this._selectedNodes[n] = 1;
				this.currentError = nodeData.node.renderError; 
			}
			
			this._hierarchyVisit_insertChildren(n, visitQueue, blocked);
		}
	},

LoaderMesh.prototype._createNodeHandler = function (node) {
		//compressed use worker:
		var that = this;
		return function () {
//			console.log("received node: " + node.index);
			node.request.buffer = node.request.response;

			var compressed = Signature.MECO + Signature.CTM1 + Signature.CTM2;
			if(!Debug.worker && that._header.signature.flags & compressed) {
				var sig = {
					texcoords: that._header.signature.vertex.hasTexCoord(),
					normals: that._header.signature.vertex.hasNormal(),
					colors:  that._header.signature.vertex.hasColor(),
					indices: that._header.signature.face.hasIndex()
				};
				var _node = {
					index: node.index,
					nvert: node.verticesCount,
					nface: node.facesCount,
					firstPatch: 0, 
					lastPatch: node.lastPatch - node.firstPatch,
					buffer: node.request.response
				};
				var p = [];
				for(var k = node.firstPatch; k < node.lastPatch; k++)
					p.push(that._patches.items[k].lastTriangle);
				if(that._header.signature.flags & Signature.MECO)
					that._worker.postMessage({signature:sig, node:_node, patches:p });
			} else {
				that._workerFinished({data: {index:node.index, buffer:node.request.response}});
			}
		};
	},


LoaderMesh.prototype._workerFinished = function(_node) {
		var node = this._nodes.items[_node.data.index];
		node.buffer = _node.data.buffer;
		this._readyNodes.push(node);
                
		if(this._redrawOnNewNodes) { //redraw only if new nodes might improve rendering
			this._signalUpdate();
		}
	},
        
LoaderMesh.prototype._createTextureHandler = function (tex) {
		var that = this;

		return function () {
			//TODO USE REF COUNTER INSTeAD OF LIST BOTH FOR NODES AND FOR TEXTURES
			var blob = tex.request.response; 
			var urlCreator = window.URL || window.webkitURL;
			tex.img = document.createElement('img');
			tex.img.onerror = function(e) { console.log("Failed loading texture."); };
			tex.img.src = urlCreator.createObjectURL(blob);

			tex.img.onload = function() { 
				urlCreator.revokeObjectURL(tex.img.src); 

				var gl = that._gl;
				tex.texture = gl.createTexture();
				gl.bindTexture(gl.TEXTURE_2D, tex.texture);
                        	var s = gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex.img);
                                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.bindTexture(gl.TEXTURE_2D, null);

				tex.status = State._NODE_READY;
				//find all nodes pending
				for(var i = 0; i < tex.nodes.length; i++) {
					var node = tex.nodes[i];
					if(node.vbo === null) continue; //not loaded still
					var isReady = true;
					for(var k = node.firstPatch; k < node.lastPatch; ++k) {
						var patch = that._patches.items[k];
						if(patch.texture == 0xffffffff) continue;
						var t = that._textures.items[patch.texture];
						if(t.status != State._NODE_READY) {
							isReady = false;
							break;
						}
					} 
					if(isReady) {
						node.status = State._NODE_READY;
					}
				}
			};
		};
	},

LoaderMesh.prototype._requestNodes = function () {
		if(Debug.request) {
			this._candidateNodes = [];
			return;
		}
		var candidateNodes = this._candidateNodes;
		if (candidateNodes.length <= 0) return;

		var cachedNodes = this._cachedNodes.slice();
		cachedNodes.sort(this._sortNodeCacheFunction);

		var nodesToRequest = 0;
		var cacheSize = this._cacheSize;
		for (var i=0, n=candidateNodes.length; i<n; ++i) {
			var c = candidateNodes[i];
			var s = this._maxCacheSize - cacheSize;
			var freed = 0;
			var csize = c.lastByte - c.offset + 1;
			var k = cachedNodes.length;
			if (s < csize) {
				for (var j=cachedNodes.length-1; j>=0; --j) {
					var p = cachedNodes[j];
					var psize = p.lastByte - p.offset + 1;
					k = j;
					if (this._sortNodeCacheFunction(c, p) >= 0) break;
					s += psize;
					freed += psize;
					if (s >= csize) break;
				}
			}

			if (s >= csize) {
				nodesToRequest++;
				cachedNodes = cachedNodes.slice(0, k);
				cachedNodes.push(c);
				cacheSize -= freed;
				cacheSize += csize;
			}
			else {
				break;
			}
		}

		var that = this;
		var url = this.url();
		for (var i=0; i<nodesToRequest; ++i) {
			var node   = candidateNodes[i];
			node.status  = State._NODE_PENDING;
			node.request = new XMLHttpRequest();
			node.request.open('GET', url, true);
			node.request.responseType = 'arraybuffer';
			node.request.setRequestHeader("Range", "bytes=" + node.offset + "-" + node.lastByte);
			node.request.onload = this._createNodeHandler(node);
			node.request.onerror= function () { //NODES RECOVERY DRAFT
				for (var j=0, n=candidateNodes.length; j<n; ++j) 
					if(candidateNodes[j].requestError) return;
				that._candidateNodes = candidateNodes;
				for (var j=0, n=candidateNodes.length; j<n; ++j) 
					candidateNodes[j].requestError = true;
				that._requestNodes();
			};
			node.request.onabort= function () { //NODES RECOVERY DRAFT
				for (var j=0, n=candidateNodes.length; j<n; ++j) 
					if(candidateNodes[j].requestCancel) return;
				that._candidateNodes = candidateNodes;
				for (var j=0, n=candidateNodes.length; j<n; ++j) 
					candidateNodes[j].requestCancel = true;
				that._requestNodes();
			};
			node.request.send();

			//check for textures
			var patches      = this._patches.items;
			for(var i = node.firstPatch; i < node.lastPatch; ++i) {
				var patch = patches[i];
				if(patch.texture == 0xffffffff) continue;
				var tex = this._textures.items[patch.texture];
				var that = this;
				if(tex.status == State._NODE_NONE) {
					tex.img = new Image;
					tex.status = State._NODE_PENDING;
					tex.request = new XMLHttpRequest();
					tex.request.open('GET', url, true);
					tex.request.responseType = 'blob';
					tex.request.setRequestHeader("Range", "bytes=" + tex.offset + "-" + tex.lastByte);
					tex.request.onload = this._createTextureHandler(tex);
					tex.request.send();
				}
				//add a 'wakeup call'
				tex.nodes.push(node);
			}
		}
		this._candidateNodes = [];
	},

LoaderMesh.prototype._updateView = function (camera, renderer) {
        	
                camera.updateMatrixWorld();
        	var viewI = camera.matrixWorldInverse;
                var world = this.matrixWorld;
                var proj = camera.projectionMatrix;
                var fm = new THREE.Matrix4().multiply(proj).multiply(viewI).multiply(world);
                this._frustum.setFromMatrix( fm );
               
                // camera position in object space
        	var view = camera.matrixWorld;
                var worldI = new THREE.Matrix4().getInverse(world);
                var camMatrixObject = new THREE.Matrix4().multiply(worldI).multiply(view);
                this._viewPoint = new THREE.Vector3().setFromMatrixPosition( camMatrixObject );

                this._resolution =  2;
                
                var fov = camera.fov / 2 * Math.PI / 180.0;
		this._resoltion = 0.5*Math.tan(fov)*renderer.domElement.clientHeight;
        },


LoaderMesh.prototype.update = function(scene, camera, renderer){
                if (!this.isOpen()) return;
		if (this._header.nodesCount <= 0) return;

                this._updateView(camera, renderer);
		this._updateCache();
		this._hierarchyVisit();
		this._requestNodes();
                this._checkVisibilityNodes(scene);
                this._render();
        },

LoaderMesh.prototype._render = function () {
            
		var nodes = this._nodes.items;
		var patches = this._patches.items;
		var selectedNodes = this._selectedNodes;
		var nodesCount = nodes.length;
		this._rendered = 0;

		var last_texture = -1;
		for (var i=0; i<nodesCount; ++i) {
			var node    = nodes[i];
			if(node.vbo)
				node.vbo.visible = false;

			if (!selectedNodes[i]) continue;

			if(this._header.signature.face.hasIndex()) {
				var skipped = true;
				for (var p = node.firstPatch; p < node.lastPatch; ++p) {
					var patch = patches[p];
					if (!selectedNodes[patch.node]) {
						skipped = false;
						break;
					}
				}
				if (skipped) continue;
			}

			if(!this._hierarchyVisit_isVisible(node.sphere.center, node.tightRadius)) 
				continue;

			node.vbo.visible = true;

			//concatenate renderings to remove useless calls. except we have textures.
			var first = 0;
			var last = 0;
                        
                        //clear last drawcall
                        node.vbo.geometry.clearGroups();
			for (var p = node.firstPatch; p < node.lastPatch; ++p) {
				var patch = patches[p];

				if(!selectedNodes[patch.node]) { //skip this patch
					last = patch.lastTriangle;
					if(p < node.lastPatch-1) //if textures we do not join. TODO: should actually check for same texture of last one. 
						continue;
				} 
				if(last > first) {
					//here either we skip or is the last node
					
					if(patch.texture != 0xffffffff && patch.texture != last_texture) { //bind texture
						var tex = this._textures.items[patch.texture].texture;
						//gl.activeTexture(gl.TEXTURE0);
						//gl.bindTexture(gl.TEXTURE_2D, tex);
						//var error = gl.getError(); 
					}
                                        //console.log(first,last, p);
                                        node.vbo.geometry.addGroup( first*3, (last - first) * 3, p);
					this._rendered += last - first;
                                       
				}
				first = patch.lastTriangle;
			}
                        
                        node.vbo.geometry.attributes.position.needsUpdate = true;
                        node.vbo.geometry.index.needsUpdate = true;
                        node.vbo.geometry.groupsNeedUpdate = true;
                        //mesh.geometry.attributes.color.needsUpdate = true;
		}
                //this._checkVisibilityNodes();
	},
        
LoaderMesh.prototype._checkVisibilityNodes = function(scene){
                var selectedNodes = this._selectedNodes;
                for(var i = 0; i < selectedNodes.length; ++i){
                    var inSceneNode =  scene.getObjectByName(i);
                    if(inSceneNode){
                            if (!selectedNodes[i]){
                                   inSceneNode.visible = false;
                            }else{
                                   inSceneNode.visible = true;
                            }
                    }
                }
       },
LoaderMesh.prototype._addNodeIntoScene = function(node){
             var inSceneNode = this._scene.getObjectByName(node.index);
             
             if(inSceneNode instanceof THREE.Mesh){
                 console.log(inSceneNode.id, inSceneNode.name);
                 this._scene.remove(inSceneNode);
                 inSceneNode.geometry.dispose();
                 //inSceneNode.material.dispose();
                 inSceneNode = null;
             }
            this._scene.add(node.vbo); 
};
        
return LoaderMesh;

});
