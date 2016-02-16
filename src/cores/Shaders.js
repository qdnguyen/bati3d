define(['THREE', 'Text!shader/standardPointVS.glsl',  'Text!shader/standardPointFS.glsl', 'Text!shader/b3dShaderVS.glsl', 'Text!shader/b3dShaderFS.glsl'], 
function(THREE, standardPointVS,standardPointFS, b3dShaderVS, b3dShaderFS  ){
    var Shaders = {
            standardPointShader : new THREE.ShaderMaterial({
                                        vertexShader    : standardPointVS,
                                        fragmentShader : standardPointFS,
                                       /* attributes :    {
                                                            aPosition : {type: 'f',value :0.0},
                                                            aNormal   : {type :'f',value :1.0},
                                                            aColor    : {type :'f',value :2.0},
                                                            aPointSize: {type :'f', value : 4.0}
                                                        },*/
                                        uniforms   : {
                                                            uWorldViewProjectionMatrix : {type :'m4', value : new THREE.Matrix4()},
                                                            uViewSpaceNormalMatrix     : {type :'m3', value : new THREE.Matrix3()},
                                                            uViewSpaceLightDirection   : {type : 'v3', value : new THREE.Vector3()},
                                                            uAlpha                     : {type :'f', value : 1.0},
                                                            uUseSolidColor             : {type : 'i',value : 0},
                                                            uSolidColor                : {type : 'c', value: new THREE.Color(1.0,1.0,1.0)}
                                                     }
                            
                                }),
                                
            b3dShader          : new THREE.ShaderMaterial({
                                        vertexShader :   b3dShaderVS,
                                        fragmentShader : b3dShaderFS,
                                       /* attributes : {
                                                         aPosition : {type : 'i', value : 0},
                                                         aNormal   : {type : 'i', value : 1},
                                                         aColor    : {type : 'i', value : 2}
                                                        }, */
                                        uniforms   : {
                                                         uWorldViewProjectionMatrix : {type : 'm4', value : new THREE.Matrix4()},
                                                         uViewSpaceNormalMatrix     : {type : 'm3', value : new THREE.Matrix3()},
                                                         uViewSpaceLightDirection   : {type : 'v3', value : new THREE.Vector3()},
                                                         uAlpha                     : {type: 'f', value : 1.0},
                                                         uUseSolidColor             : {type : 'i', value : 0},
                                                         uSolidColor                : {type : 'c', value : new THREE.Color(1.0,1.0,1.0)}
                                                     }
                                })                    
    };
    
    
    return Shaders;
    
});

