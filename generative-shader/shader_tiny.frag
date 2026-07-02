#ifdef GL_ES
precision mediump float;
#endif
uniform vec2 u_resolution;uniform float u_time;void main(){vec2 s=gl_FragCoord.xy/u_resolution,p=fract(s*9.);float t=u_time,m=mod(t,4.),d=length(p-.5),a=atan(p.y-.5,p.x-.5);vec3 c=m<1.?vec3(sin(t+d*9.),cos(t),sin(t*.7))*step(d,.4):m<2.?vec3(sin(a*6.+t),cos(a*5.-t),.5):m<3.?mix(vec3(sin(t),.3,cos(t)),vec3(.8,sin(t),.4),step(p.x,p.y)):vec3(sin(p.x*20.+t),cos(p.y*15.-t),.6);gl_FragColor=vec4(c,1.);}