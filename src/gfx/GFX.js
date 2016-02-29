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
			camera.position.set(4201066.709676039,165839.9307729964, 4780241.631086124);
                        
                      //  var target = new THREE.Vector3(-3307.55517578125,5222.22021484375, 3558.525634765625);
                        var target = new THREE.Vector3(4201066.709676039,166839.9307729964, 4780241.631086124);
                        camera.lookAt(target);
                        
			scene.add(camera);
                        
			
                        light = new Light(scene, camera);
                        
            		var axisHelper = new THREE.AxisHelper(1000);
        		scene.add( axisHelper );   
                        
			window.addEventListener('resize', resize, false);
                        
                        //this.setScene("models/res1_wgs84_local_coord.nexus");
                        this.setScene("models/ZoneAExporter_pivot.nxs");             
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
        //model.targetError = 1.0;
	//model._targetFps = 25;
	model.open(url);
	//model.onUpdate = onUpdate;
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