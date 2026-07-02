/**
 * Shader Generativo con 4 Patrones Animados
 * Autor: Meng Fei
 * Noviembre 2024
 */

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

void main() {
    // Normaliza coordenadas al rango [0,1]
    vec2 coords = gl_FragCoord.xy / u_resolution;
    
    // Crea grid 9x9 (fract devuelve solo la parte decimal)
    vec2 cell = fract(coords * 9.0);
    
    float time = u_time;
    float pattern = mod(time, 4.0); // Alterna entre 4 patrones
    
    // Coordenadas polares desde el centro de la celda
    vec2 centered = cell - vec2(0.5);
    float dist = length(centered);
    float angle = atan(centered.y, centered.x);
    
    vec3 color;
    
    // Patrón 1: Círculos concéntricos (0-1s)
    if (pattern < 1.0) {
        float red = sin(time + dist * 9.0);
        float green = cos(time);
        float blue = sin(time * 0.7);
        
        vec3 circleColor = vec3(red, green, blue);
        float mask = step(dist, 0.4); // Máscara circular
        
        color = circleColor * mask;
    }
    // Patrón 2: Espiral (1-2s)
    else if (pattern < 2.0) {
        float red = sin(angle * 6.0 + time);   // 6 brazos horarios
        float green = cos(angle * 5.0 - time); // 5 brazos antihorarios
        float blue = 0.5;
        
        color = vec3(red, green, blue);
    }
    // Patrón 3: Diagonal (2-3s)
    else if (pattern < 3.0) {
        vec3 colorA = vec3(sin(time), 0.3, cos(time));
        vec3 colorB = vec3(0.8, sin(time), 0.4);
        
        float factor = step(cell.x, cell.y); // 0 abajo diagonal, 1 arriba
        color = mix(colorA, colorB, factor);
    }
    // Patrón 4: Grid ondulante (3-4s)
    else {
        float red = sin(cell.x * 20.0 + time);   // Ondas verticales
        float green = cos(cell.y * 15.0 - time); // Ondas horizontales
        float blue = 0.6;
        
        color = vec3(red, green, blue);
    }
    
    gl_FragColor = vec4(color, 1.0);
}
