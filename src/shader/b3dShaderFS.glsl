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
                vec3  normal  = normalize(vNormal);                             
                float nDotL   = dot(normal, -uViewSpaceLightDirection);         
				                                                
				vec3  diffuse;                                   
				if(uUseSolidColor)                               
                  diffuse = uSolidColor;                                         
				else                                             
                  diffuse = vColor;                                              
                if(gl_FrontFacing)                                               
                  diffuse = diffuse * max(0.0, nDotL);                           
				else                                             
                  diffuse = diffuse * vec3(0.4, 0.3, 0.3) * abs(nDotL);          
				                                                 
                gl_FragColor  = vec4(diffuse, uAlpha);                           
            }                 
