precision highp float;                                                
                                                                                  
uniform   mat4 uWorldViewProjectionMatrix;                            
uniform   mat3 uViewSpaceNormalMatrix;                                
                                                                                  
attribute vec3 aPosition;                                             
attribute vec3 aNormal;                                               
attribute vec3 aColor;                                                
attribute float aPointSize;                                           
                                                                                  
varying   vec3 vNormal;                                               
varying   vec3 vColor;                                                
                                                                                  
void main(void)                                                       
{                                                                     
     vNormal     = uViewSpaceNormalMatrix * aNormal;                   
     vColor      = aColor;                                             
                                                                                  
     gl_Position = uWorldViewProjectionMatrix * vec4(aPosition, 1.0);  
     gl_PointSize = 1.5 * aPointSize;								 
}                         