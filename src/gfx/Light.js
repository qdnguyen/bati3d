define(['THREE'], function(THREE){
   /**
    * Init light for scene and mega texture
    * @param {type} options (THREE.scene, camera)
    * @returns {undefined}
    */ 
   
   var lightFront, lightBack;
   
   var Light = function(scene,camera) {
           
          //TODO: method to compute distance lighting to globe surface must be replaced
          //by using ray casting
          lightFront      = new THREE.PointLight(0xffffff, 1.5, 0); 
          lightFront.position.copy(camera.position);
          scene.add(lightFront);
          // light behind of model
          //lightBack = new THREE.PointLight(0xffffff, 1.5, 0); 
          //lightBack.position.set(0, 0, -100);
          //scene.add(lightBack);
          
       
          var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
          directionalLight.position.copy(camera.position);
          directionalLight.name = 'directional';
          scene.add(directionalLight);
        
          this._initilaized = true;
   };
   
    /**
     * This function can resole the updating problem of mipmap level
     * when camere move. It works for every camera's movement, rotate around globe
     * or zoom in and zoom out.
     * @param {type} camera
     * @returns {undefined}
     */
    Light.prototype.isInitialized = function(){
        return this._initilaized;
    };
    
    Light.prototype.attachLightToCameraPosition = function(camera){
             lightFront.position = camera.position;
    };

    return Light;
    
});

