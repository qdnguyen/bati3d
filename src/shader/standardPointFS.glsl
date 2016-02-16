precision highp float;                                                
                                                                                  
uniform   vec3 uViewSpaceLightDirection;                              
uniform   float uAlpha;                                               
uniform   bool uUseSolidColor;                                        
uniform   vec3 uSolidColor;                                           
                                                                                  
varying   vec3 vNormal;                                               
varying   vec3 vColor;                                                
#extension GL_EXT_frag_depth : enable			
                                                                                
void main(void)                                                     
{                                                                   
    		float a = pow(2.0*(gl_PointCoord.x - 0.5), 2.0);	
	        float b = pow(2.0*(gl_PointCoord.y - 0.5), 2.0);	
       		float c = 1.0 - (a + b);				
       		if(c < 0.0) { discard; }				
						                                
		vec3 diffuse;                                   
		if(uUseSolidColor)                              
                  diffuse = uSolidColor;                                        
		else                                            
                  diffuse = vColor;                                             
		if(vNormal[0] != 0.0 || vNormal[1] != 0.0 || vNormal[2] != 0.0) { 
  			  vec3  normal  = normalize(vNormal);                             
                          float nDotL   = dot(normal, -uViewSpaceLightDirection);         
                          float lambert = max(0.0, nDotL);                                
                          diffuse = diffuse * lambert;        				
                }                                                               
                gl_FragColor  = vec4(diffuse, uAlpha);                          
	       	gl_FragDepthEXT = gl_FragCoord.z + 0.0001*(1.0-pow(c, 2.0));	  
}                                               