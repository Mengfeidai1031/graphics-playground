# Generative Shader

## Descripción

Este shader GLSL crea un patrón visual generativo que alterna automáticamente entre 4 diseños diferentes cada segundo.

![shader gif](shader.gif)

## Los 4 Diseños

### Diseño 1: Círculos de Colores

**¿Qué ves?**
- Un círculo en el centro que parece estar "respirando"
- Los colores se mueven desde el centro hacia afuera como ondas en el agua
- Los colores cambian constantemente: rojo, verde y azul pulsando

**¿Cómo funciona?**
1. El programa calcula qué tan lejos está cada punto del centro
2. Los puntos cercanos al centro tienen un color
3. Los puntos más lejanos tienen otro color
4. Todo esto cambia con el tiempo, creando el efecto de "ondas"

**Analogía**: Como tirar una piedra en un lago tranquilo y ver las ondas expandirse, pero con colores en lugar de agua.

### Diseño 2: Espiral Giratoria

**¿Qué ves?**
- Una espiral de colores que gira continuamente
- Parece un remolino o un caramelo de menta
- Los brazos de la espiral tienen diferentes colores

**¿Cómo funciona?**
1. El programa dibuja 6 líneas rojas desde el centro
2. Dibuja 5 líneas verdes también desde el centro
3. Las rojas giran hacia un lado
4. Las verdes giran hacia el otro lado
5. Cuando se cruzan, crean nuevos colores

**Analogía**: Como dos ventiladores girando en direcciones opuestas, cada uno pintando el aire de un color diferente.

### Diseño 3: División Diagonal 

**¿Qué ves?**
- La pantalla dividida en dos triángulos
- Una línea diagonal separa dos colores diferentes
- Los colores de ambos lados cambian con el tiempo

**¿Cómo funciona?**
1. El programa traza una línea imaginaria de esquina a esquina
2. Todo lo que está arriba de esa línea tiene un color
3. Todo lo que está debajo tiene otro color
4. Ambos colores "respiran" (se hacen más claros y más oscuros)

**Analogía**: Como doblar una hoja de papel por la diagonal y pintar cada mitad de un color diferente, pero los colores están vivos y cambian.

### Diseño 4: Ondas Cruzadas

**¿Qué ves?**
- Muchas líneas verticales onduladas
- Líneas horizontales que también ondulan
- Donde se cruzan crean un patrón de cuadrados coloridos
- Todo se mueve como si estuvieras viendo a través de agua en movimiento

**¿Cómo funciona?**
1. El programa dibuja 20 líneas verticales que suben y bajan
2. Dibuja 15 líneas horizontales que van de lado a lado
3. Las verticales se mueven hacia la izquierda
4. Las horizontales se mueven hacia abajo
5. Donde se encuentran, los colores se mezclan

**Analogía**: Como ver dos cortinas transparentes con rayas, una vertical y otra horizontal, moviéndose una sobre la otra.

## ¿Cómo se Crean los Colores?

Los colores en una pantalla se hacen mezclando **tres colores básicos**:
- **Rojo** (Red)
- **Verde** (Green)  
- **Azul** (Blue)

Cada color va de 0 (apagado) a 1 (máximo brillo).

**Ejemplos**:
- Rojo puro: (1, 0, 0)
- Amarillo: (1, 1, 0) → rojo + verde
- Púrpura: (1, 0, 1) → rojo + azul
- Blanco: (1, 1, 1) → todos al máximo
- Negro: (0, 0, 0) → todos apagados

## ¿Cómo Sabe Dónde Pintar Cada Color?

### Sistema de Coordenadas

Imagina la pantalla como un mapa:
- **Eje X**: va de izquierda (0) a derecha (1)
- **Eje Y**: va de abajo (0) a arriba (1)
- El centro está en (0.5, 0.5)

### La Cuadrícula

El programa divide la pantalla en **9×9 = 81 cuadrados** pequeños. Cada cuadrado repite el mismo patrón, pero puede tener diferentes colores.

## El Tiempo y el Movimiento

### ¿Cómo se Animan los Diseños?

El programa usa un **contador de tiempo** que aumenta cada segundo:
- Segundo 0-1: Muestra diseño 1
- Segundo 1-2: Muestra diseño 2
- Segundo 2-3: Muestra diseño 3
- Segundo 3-4: Muestra diseño 4
- Segundo 4-5: Vuelve al diseño 1 (se repite infinitamente)

### El Truco del Movimiento

Los colores cambian usando **funciones matemáticas especiales** que oscilan (van y vienen):

**Función Onda** (seno y coseno) Estas funciones hacen que los colores:
- Suban y bajen suavemente
- Nunca se detengan
- Creen movimientos fluidos

## Ficheros

- Código original del shader
- Código en versión tiny (~444 Bytes)
- Gif del shader

## Fuentes

- Temario de clase
  - S9-10: https://github.com/otsedom/otsedom.github.io/blob/main/IG/S9/README.md
- Editor para probar y ejecutar el shader: https://editor.thebookofshaders.com/
- IA (Claude Sonnet 4.5): https://claude.ai/


