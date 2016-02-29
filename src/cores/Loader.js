define(['jquery', 'THREE', './State', './Header', './Node', './NodeIndex' , './Patch', './PatchIndex', './Texture', './TextureIndex', './Signature', './Queue' , './LRUCache', 'cmd/BinaryRequest'],
function($, THREE, State, Header, Node, NodeIndex, Patch, PatchIndex, Texture, TextureIndex, Signature, Queue, LRUCache, BinaryRequest){
    

var Debug = {
	nodes: false,    //color each node
	culling: false,  //visibility culling disabled
	draw: false,     //final rendering call disabled
	extract: false,  //no extraction
	request: false,  //no network requests
	worker: false    //no web workers
};



var Loader = function (scene) {
	THREE.Object3D.call( this );
        this._scene = scene;
	this._targetError        = State.DEFAULT_TARGET_ERROR;
	this._targetFps          = State.DEFAULT_TARGET_FPS;
	this._maxPendingRequests = State.DEFAULT_MAX_PENDING_REQUESTS;
	this._maxCacheSize       = State.DEFAULT_CACHE_SIZE;
	//this._drawBudget         = State.DEFAULT_DRAW_BUDGET;
	this._minDrawBudget      = State.DEFAULT_DRAW_BUDGET / 4;
        //this._onUpdate           = null;
	this._onSceneReady       = null;

        this._frustum = new THREE.Frustum();
	this._viewPoint   = new THREE.Vector3();
        
        this.LITTLE_ENDIAN_DATA = State.LITTLE_ENDIAN_DATA;
        this.PADDING            = State.PADDING; 
        
        this._nodesIndexToRenderThisFrame = null;

	this._reset();
};
Loader.prototype = Object.create( THREE.Object3D.prototype );
Loader.prototype.constructor = Loader;


Loader._sortPatchesFunction = function (a, b) {
	return ((a.frame != b.frame) ? (b.frame - a.frame) : (b.error - a.error));
};

Loader._sortNodesFunction = function (a, b) {
	return a.node.renderError - b.node.renderError;
};

Loader._sortNodeCacheFunction = function (a, b) {
	return ((a.renderFrame != b.renderFrame) ? (b.renderFrame - a.renderFrame) : (b.renderError - a.renderError));
	//return b.renderError - a.renderError;
};


Loader.prototype = {
	_reset : function () {
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
		//this._redrawOnNewNodes = true;

		var that = this;
                
		var path;
		$('script').each(function(a) { var str = $(this).attr('src'); if(!str) return; if(str.search('Loader.js') >= 0) path = str; });
		path = path.replace('Loader.js', '../worker/MeshCodeWorker.js'); //meshcoder_worker.js
		this._worker = new Worker(path);
		this._worker.onmessage = function(e) { that._workerFinished(e); };
              
	},

	_requestHeader : function () {
		var offset = 0;
		var size   = Header.SIZEOF;

		var that = this;
		var url = this._url;
		/**Safari PATCH**/
		/**/if (navigator.userAgent.toLowerCase().indexOf('safari')!=-1 && navigator.userAgent.toLowerCase().indexOf('chrome')==-1) {
		/**/  url = this._url + '?' + Math.random();
		/**/}
		/**Safari PATCH**/
		var r = new BinaryRequest(url, {
			range : [offset, offset+size-1],
			onSuccess : function () {
				that._handleHeader(r.buffer);
				that._requestIndex();
			}
		});
	},

	_handleHeader : function (buffer) {
		var view         = new DataView(buffer);
		var offset       = 0;
		var littleEndian = State.LITTLE_ENDIAN_DATA;

		var header = new Header();
		header.import(view, offset, littleEndian);
		this._header = header;
                
                this._updateObjectPosition(header);
	},

        _updateObjectPosition: function(header){
                this.position.set(header.offsetX, header.offsetY, header.offsetZ);
        },
        
	_requestIndex : function () {
		var header = this._header;
		var offset = Header.SIZEOF;
		var size   = header.nodesCount * Node.SIZEOF + header.patchesCount * Patch.SIZEOF + header.texturesCount * Texture.SIZEOF;

		var that = this;
		var url = this._url;
		/**Safari PATCH**/
		/**/if (navigator.userAgent.toLowerCase().indexOf('safari')!=-1 && navigator.userAgent.toLowerCase().indexOf('chrome')==-1) {
		/**/  url = this._url + '?' + Math.random();
		/**/}
		/**Safari PATCH**/
		var r = new BinaryRequest(url, {
			range : [offset, offset+size-1],
			onSuccess : function () {
				that._handleIndex(r.buffer);
				that._openReady();
			}
		});
	},

	_handleIndex : function (buffer) {
		var header       = this._header;
		var view         = new DataView(buffer);
		var offset       = 0;
		var littleEndian = State.LITTLE_ENDIAN_DATA;

		var offset = 0;

		this._nodes = new NodeIndex();
		offset += this._nodes.import(header, view, offset, littleEndian);

		this._patches = new PatchIndex();
		offset += this._patches.import(header.patchesCount, view, offset, littleEndian);

		this._textures = new TextureIndex();
		offset += this._textures.import(header.texturesCount, view, offset, littleEndian);
	},

	_openReady : function() {
		var nodesCount = this._nodes.length;
		var nodes      = this._nodes.items;
		for (var i=0; i<nodesCount; ++i) {
			var node = nodes[i];
			node.status      = State._NODE_NONE;
			node.request     = null;
			node.color       = new THREE.Color();
			node.renderError = 0.0;
			node.renderFrame = 0;
		}

		this._cachedNodes  = new LRUCache(nodesCount);
		this._readyNodes   = [ ];
		this._pendingNodes = [ ];

		var nodesCount = this._header.nodesCount;
		this._visitedNodes  = new Uint8Array(nodesCount);  //Loader.BoolArray(nodesCount);
		this._blockedNodes  = new Uint8Array(nodesCount);  //new Loader.BoolArray(nodesCount);
		this._selectedNodes = new Uint8Array(nodesCount);  //new Loader.BoolArray(nodesCount);

		this._status = State.STATUS_OPEN;

		if (this._onSceneReady) {
			this._onSceneReady();
		}
	},

	_signalUpdate : function () {
		var upd = this._onUpdate.bind(this);
		if (upd) {
			upd();
		}
	},

	
	get onSceneReady() {
		return this._onSceneReady;
	},

	set onSceneReady(f) {
		this._onSceneReady = f;
	},
/*
	get onUpdate() {
		return this._onUpdate;
	},

	set onUpdate(f) {
		this._onUpdate = f;
	},
*/
	get status() {
		return this._status;
	},

	get isClosed() {
		return (this._status == State.STATUS_NONE);
	},

	get isOpening() {
		return (this._status == State.STATUS_OPENING);
	},

	get isOpen() {
		return (this._status == State.STATUS_OPEN);
	},

	get url() {
		return this._url;
	},

	get isReady() {
		return this.isOpen;
	},

	get datasetCenter() {
		if (!this.isReady) return [0, 0, 0];
		return this._header.sphere.center.slice(0, 3);
	},

	get datasetRadius() {
		if (!this.isReady) return 1.0;
		return this._header.sphere.radius;
	},

	get inBegin() {
		return this._inBegin;
	},

	get maxPendingRequests() {
		return this._maxPendingRequests;
	},

	set maxPendingRequests(r) {
		this._maxPendingRequests = r;
	},

	get targetError() {
		return this._targetError;
	},

	set targetError(e) {
		this._targetError = e;
	},

	destroy : function () {
		this.close();
	},

	open : function (url) {
		this.close();
		this._status = State.STATUS_OPENING;
		this._url    = url;
		this._requestHeader();
	},

	close : function () {
		if (this.isClosed) return;

		if (this.isOpening) {
		}
		else if (this.isOpen) {
		}

		this._reset();
	},

	
       
        _hierarchyVisit_isVisible : function (n) {
            var node   = this._nodes.items[n];
    	    var sphere = node.sphere;
            return this._frustum.intersectsSphere(sphere);
	},
        
        
        _hierarchyVisit_nodeError: function (n) {
            var node   = this._nodes.items[n];
    	    var sphere = node.sphere;
            // inline distance computation
	    var dist = sphere.center.distanceTo(this._viewPoint) - node.tightRadius;//sphere.radius;

            // end inline
	    if (dist < 0.01) dist = 0.01;

	    return this._resolution *node.error/dist;
	},

        _hierarchyVisit_insertNode : function (n, parent, visitQueue) {
                var node    = this._nodes.items[n];
            	var patches = this._patches.items;

                if(this._hierarchyVisit_isVisible(n)){
                	var error = this._hierarchyVisit_nodeError(n);
                        //if error is less than SSE
                        //so render this node
                        //console.log(error,n)
                        if(error < this._targetError*0.8) {
                                var node  = this._nodes.items[n];
                                node.renderError = error;
                                node.renderFrame = this._frame;
                               
                                node.index = n;
                                node.parent = parent;
                                visitQueue.enqueue(node);
                                return;
                        }else{ //if not render its childs
                                for(var i = node.firstPatch; i < node.lastPatch; ++i) {
                                    var patch = patches[i];
                                    var child = patch.node;
                                    this._hierarchyVisit_insertNode(child, n, visitQueue);
                                }            
                        }//end SSE
                }
	},


	_hierarchyVisit : function () {
                //initializz visit queue for this frame
		var visitQueue    = new Queue();
        	var candidatesCount = 0;
		this._candidateNodes = [ ];
                this._nodesIndexToRenderThisFrame = [];
                //start with root, if tile is not in frustum, does nothing
                //otherwise prepare candidates for loading?
		this._hierarchyVisit_insertNode(0, null, visitQueue);

                var candidateNodes = this._candidateNodes;
                var nodesIndexToRenderThisFrame = this._nodesIndexToRenderThisFrame;
		this.currentError = 1e20;
		var count = 0;
                
		while (visitQueue.getLength() && (count < this._maxPendingRequests)) {
			var node = visitQueue.dequeue();
			//var n        = node.index;
			if ((candidatesCount < this._maxPendingRequests) && (node.status == State._NODE_NONE)) {
				candidatesCount++;
                    		candidateNodes.push(node);
                                nodesIndexToRenderThisFrame.push(node.index);
			}
		}
	},

	_createNodeHandler : function (node) {
		//compressed use worker:
		var that = this;
		return function () {
			that._header.signature.flags & compressed
			var compressed = Signature.MECO + Signature.CTM1 + Signature.CTM2;
			if(!Debug.worker && that._header.signature.flags & compressed) {
				var sig = {
					normals: that._header.signature.vertex.hasNormal,
					colors:  that._header.signature.vertex.hasColor,
					indices: that._header.signature.face.hasIndex
				};
				var _node = {
					index: node.index,
					nvert: node.verticesCount,
					nface: node.facesCount,
					firstPatch: 0, 
					lastPatch: node.lastPatch - node.firstPatch,
					buffer: node.request.buffer
				};
				var p = [];
				for(var k = node.firstPatch; k < node.lastPatch; k++)
					p.push(that._patches.items[k].lastTriangle);
				if(that._header.signature.flags & Signature.MECO)
					that._worker.postMessage({signature:sig, node:_node, patches:p, status :'processing'});
			} else {
          				
                                        that._workerFinished({data: {index:node.index, buffer:node.request.buffer}});
    			}
		};
	},

	_workerFinished: function(_node) {
                if(typeof(_node.data) == "string") return; 
		var node = this._nodes.items[_node.data.index];
		node.buffer = _node.data.buffer;
		this._readyNodes.push(node);
                this._cachedNodes.put(node.index,node);
       	        this._signalUpdate();
	},

	_requestNodes : function () {
            
		var candidateNodes = this._candidateNodes;
		if (candidateNodes.length <= 0) return;

                //first find in cache if node have already loaded yet???
                //if not, save it to nodesToResquest
		var nodesToRequest = [];
		for (var i=0, n=candidateNodes.length; i<n; ++i) {
			var c = candidateNodes[i];
       			if(this._cachedNodes.get(c.index) === undefined){
                            nodesToRequest.push(c);
                        }
		}

		var url = this._url;
		for (var i=0; i< nodesToRequest.length; ++i) {
			/**Safari PATCH**/
			/**/if (navigator.userAgent.toLowerCase().indexOf('safari')!=-1 && navigator.userAgent.toLowerCase().indexOf('chrome')==-1) {
			/**/  url = this._url + '?' + Math.random();
			/**/}
			/**Safari PATCH**/
			var node   = nodesToRequest[i];
			node.status  = State._NODE_PENDING;
			node.request = new BinaryRequest(url, {
				range : [node.offset, node.lastByte],
				onSuccess : this._createNodeHandler(node)
			});
		}
		this._candidateNodes = [];
	},

        _updateView : function (camera, renderer) {
        	
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


        update : function(camera, renderer){
                if (!this.isOpen) return;
		//if (this.inBegin) return;
		//this._inBegin = true;
		if (this._header.nodesCount <= 0) return;
		//this._beginRender();
                this._updateView(camera, renderer);
		//this._updateCache();
		this._hierarchyVisit();
		this._requestNodes();
        },

	_beginRender : function(){
                var sceneChilds = this._scene.children;
                for( var i = sceneChilds.length - 1; i >= 0; i--) {
                    var child = sceneChilds[i];
                    //Must use remove to clean GPU memory
                    //Loader.js must be inherit from THREE.Mesh so 
                    // we can do check THREE.XXXX
                    if(child instanceof THREE.Mesh){
                          child.visible = false; 
                    }
                }
        },
        
        _createMesh : function (sig, node){
                var offset = 0;
		var nv = node.verticesCount;
		var nf = node.facesCount;

                var size = node.verticesCount*12; //float
                var positions = new Float32Array(node.buffer, offset, nv*3);
                var normals, colors, faces;
                if(sig.normals) {
                                normals = new Int16Array(node.buffer, size, nv*3);
                                size += nv*6; //short
                }
                if(sig.colors) {
                                colors = new Uint8ClampedArray(node.buffer, size, nv*4);
                                size += nv*4; //chars
                }
                if(sig.indices) {
                                faces = new Uint16Array(node.buffer, size, nf * 3);
                                size += nf*6; //short
                }

                var geometryNode   =  new THREE.BufferGeometry();

                geometryNode.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
                geometryNode.setIndex(new THREE.BufferAttribute( faces, 1));    

		node.request = null;
            	node.status  = State._NODE_READY;
                var color = new THREE.Color().setHex( Math.random() * 0xffffff );
                var material = new THREE.MeshBasicMaterial( { color: color, wireframe: true, side: THREE.DoubleSide, transparent : false, opacity :0.5} );
                //var material = new THREE.MeshPhongMaterial( { color: color, specular: 0x009900,  shininess: 30, shading: THREE.FlatShading , transparent : false, opacity :0.5} );
                var mesh = new THREE.Mesh( geometryNode, material );
                return mesh;
        },
        
        _onUpdate : function () {
                 //invisibleAll();
                 var sig = {
                                    normals: this._header.signature.vertex.hasNormal,
				    colors:  this._header.signature.vertex.hasColor,
				    indices: this._header.signature.face.hasIndex
                           };
                    
                var nodesIndex = this._nodesIndexToRenderThisFrame;
                    
                for(var i = 0; i < nodesIndex.length; i++){
                        //this variable is never used.
                        var key  = nodesIndex[i];
                        var mesh = this._scene.getObjectByName(key);
                        //if node have not been rendered yet in scene
                        if(!mesh){
                               var node = this._cachedNodes.get(key);
                               if(!node) continue;
                               //set visibility of parent or children in scene
                               this._setVisibilityParentAndChild(key);
                               //create and add mesh into scene
                               mesh = this._createMesh(sig, node);
                               mesh.name = key;
                               mesh.position.copy(this.position);
                               this._scene.add(mesh);
                               
                               this.add(mesh);
                        }       
                }
            
            //reset one time render have finished
            this._nodesIndexToRenderThisFrame = [];
        },
        
        _setVisibilityParentAndChild  : function (key){
                var node    = this._nodes.items[key];
            	var patches = this._patches.items;
                
                var parentKey = node.parent;
                var parent = this._scene.getObjectByName(parentKey);
                //invisible parent before add its child
                if(parent) {parent.visible = false; console.log('remove parent :', parentKey, 'of ', key)}
                
                for(var i = node.firstPatch; i < node.lastPatch; ++i) {
                        var patch    = patches[i];
                        var childKey = patch.node;
                        var child = this._scene.getObjectByName(childKey);
                        if(child) {child.visible = false; console.log('remove children :', childKey, 'of ', key)}
                }     
        }
	
        
        
};

return Loader;

});
