define (['THREE',
         'Detector',
         'cores/Loader',
         'cores/State',
         './Light'
],function (THREE, 
           Detector,
           Loader,
           State,
           Light
                   
) {

  //gfx global objects
  var scene    = undefined;
  var renderer = undefined;
  var camera   = undefined;
  var controls = undefined;
  var light    = undefined;
  var occluder = undefined;
  var clock    = new THREE.Clock();
  
  var domContainer = undefined;
  var model;
  var count = 0;
  
  function resize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
  }

  function render() {
        ++renderer.renderCount;
        renderer.render(scene, camera);
        resize();
  }


  function  run () {
		var delta = clock.getDelta();
		if(controls !== undefined) controls.update(delta);
                if(model)
                    model.update(camera, renderer);
		requestAnimationFrame(run);
		render();
  }


 
  
  
  var GFX = function(options)
  {
        this.meshes  = null;
  }; 	

  GFX.prototype.start = function () {
		domContainer = document.getElementById("canvas_container");

                /*********************************************************************************/
		// if browsers supports webgl   
		if (Detector.webgl) {
			this.startRenderer();

			// create a scene
        		scene = new THREE.Scene();
			// put a camera in the scene
                	camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 5000000);
         
                        //TODO: must be replace by automatic camera postion initialization
			//by using lon/lat
			//camera.position.set(4203240,168454, 4778260);
                        camera.position.set(-3307.55517578125,5222.22021484375, 3658.525634765625);
			//change up to north/z
			//change up axis does not change orbitcontrol 
			//when we have threejs version under 67
			//camera.up.set( 0, 0, 1 );
                        
                        var target = new THREE.Vector3(-3307.55517578125,5222.22021484375, 3558.525634765625);
                        
                        camera.lookAt(target);
                        
			scene.add(camera);
                        
			
                        light = new Light(scene, camera);
                        
            		var axisHelper = new THREE.AxisHelper(1000);
        		scene.add( axisHelper );   
                        
			//window.addEventListener('keydown', onKeyDown, false);
			window.addEventListener('resize', resize, false);
                        
                        this.setScene("models/res1_wgs84_local_coord.nexus");
                                     
                        this.configControls(camera, renderer, target);
                       // start animation frame and rendering
                        run();
                    return true;
		}
                // if browser doesn't support webgl, load this instead
                console.error('There was a problem loading WebGL');
		return false;
};


GFX.prototype.setScene = function(url) {
	if (!url) throw new Error('url is required');
        model = new Loader(scene);
        model.targetError = 1.0;
	model._targetFps = 25;
	model.open(url);
	model.onUpdate = onUpdate;
        

        function createMesh(sig, node){
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
                // var material = new THREE.MeshBasicMaterial( { color: color, wireframe: true, side: THREE.DoubleSide, transparent : false, opacity :0.5} );
                var material = new THREE.MeshPhongMaterial( { color: color, specular: 0x009900,  shininess: 30, shading: THREE.FlatShading , transparent : false, opacity :0.5} );
                var mesh = new THREE.Mesh( geometryNode, material );
                    mesh.name = node.index;
                return mesh;
        } 
    
        function onUpdate() {
                
                 var sig = {
                                    normals: model._header.signature.vertex.hasNormal,
				    colors:  model._header.signature.vertex.hasColor,
				    indices: model._header.signature.face.hasIndex
                           };
                    
                var nodes = model._readyNodes;
                    
                for(var i = 0; i < nodes.length; i++){
                        //this variable is never used.
                        var node = nodes[i];
                        var mesh = createMesh(sig, node);
                        if(node.parent != null){
                		var parent = scene.getObjectByName(node.parent);
                                //avoid a child have same parent with other
                                if(parent) parent.visible = false;
                                scene.add(mesh);
                        }else{
                                scene.add(mesh);
                        }       
            }
        }//end update function
	
         
    
    this._sceneParsed = true;

};


GFX.prototype.startRenderer = function(){
		var width = window.innerWidth;
		var height = window.innerHeight;
		console.log("width:" + width + " height:" + height);
        	renderer = new THREE.WebGLRenderer();
		renderer.gammaInput = true;
		renderer.gammaOutput = true;
		renderer.physicallyBasedShading = true;
		renderer.renderCount = 0;
		renderer.antialias  = true;
		renderer.preserveDrawingBuffer = true; //required to support .toDataURL()
		renderer.alpha  = true;
		renderer.logarithmicDepthBuffer = true;  

									
		renderer.setSize(width, height);
                // OES_standard_derivaties used to compute mip level on mega texturing
		//renderer.context.getExtension("OES_standard_derivatives");
		//renderer.context.getExtension("OES_texture_float");
		//renderer.context.getExtension("OES_texture_float_linear");

		domContainer.appendChild(renderer.domElement);
};

GFX.prototype.configControls = function(camera,renderer, target){
		
                //orbit camera control
		controls = new THREE.OrbitControls(camera, renderer.domElement);
		controls.rotateSpeed = 2;
		controls.zoomSpeed = 5;
		controls.panSpeed = 8;
		controls.enableZoom  = true;
		controls.enablePan  = true;
		controls.enableDamping  = true;
		controls.dampingFactor  = 0.3;
		controls.keys = [65, 83, 68];
		controls.minDistance = 0;
		controls.maxDistance = Infinity;
                controls.target.copy(target);
                controls.update();

};


return GFX;

});