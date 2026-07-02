# Solar System

## Descripción

Este proyecto es una simulación 3D interactiva del sistema solar desarrollada con Three.js. Permite explorar los planetas, sus órbitas y lunas en un entorno espacial realista, con controles de cámara, animaciones y un panel de información dinámico.

<img width="870" height="690" alt="image" src="https://github.com/user-attachments/assets/72cc4f05-246b-416a-b89d-ddcaa8ce3d0d" />

---

## Enlaces

Codesandbox: https://codesandbox.io/p/sandbox/ig2526-s6-forked-qf9vxj 

Vídeo en Youtube: https://youtu.be/1rgkOJaMMng 

Ejecución: https://qf9vxj.csb.app/ 

---

## Funcionalidades

- Representación completa del sistema solar con el Sol, ocho planetas y sus lunas.
- Texturas realistas para cada cuerpo celeste.
- Órbitas visibles que muestran el recorrido de los planetas.
- Panel informativo que muestra la descripción de cada planeta al seleccionarlo.
- Control de velocidad de las órbitas mediante un deslizador.
- Modos de cámara y control ajustables (rotar o mover).
- Animación guiada con la nave “Xing Xing” (estrella en chino), que realiza un recorrido automático visitando cada planeta.

<img width="1891" height="768" alt="image" src="https://github.com/user-attachments/assets/30cbdfc9-5db0-47b2-96ef-aa9b8337ff5f" />

---

## Botones del menú

- Menú: Abre o cierra el panel lateral de control.
- Botones de planetas: Permiten seleccionar y enfocar un planeta para ver su descripción.
- Vista libre: Restaura la cámara para explorar el sistema solar manualmente.
- Ver animación: Inicia el recorrido automático de la nave por los planetas.
- Detener animación: Interrumpe la animación y vuelve a la vista libre.
- Rotar / Mover: Cambia el modo de interacción del ratón (rotación de cámara o desplazamiento).
- Velocidad de órbitas: Control deslizante para aumentar o reducir la velocidad del movimiento planetario.

<img width="733" height="353" alt="image" src="https://github.com/user-attachments/assets/21337850-4aa4-4ce8-bfe4-c5f2cfe0b705" />

---

## Animación

La animación está protagonizada por Xing Xing (estrella en chino), una nave espacial que actúa como guía virtual.
Durante el recorrido, la cámara sigue a la nave mientras visita cada planeta, mostrando información educativa sobre ellos en el panel inferior.
Al finalizar, la animación vuelve automáticamente a la vista libre para seguir explorando manualmente.

<img width="236" height="249" alt="image" src="https://github.com/user-attachments/assets/9bd227e7-8812-4974-8ac3-d061001e7e20" />

---

## Errores

- Retardo y trabas al aumentar la velocidad de órbitas: Cuando se incrementa demasiado la velocidad global de las órbitas mediante el deslizador, la animación puede volverse inestable o entrecortada. El sistema está diseñado para funcionar de forma fluida con velocidades moderadas. Aumentar demasiado el valor del deslizador sobrecarga el cálculo de interpolación de cámara y causa desincronización visual.
- Bug al usar "Vista libre" durante la animación: Durante la animación automática (guiada por la nave Xing Xing), si se presiona el botón “Vista libre” en lugar de “Detener animación”, el sistema puede quedar en un estado inconsistente o “buggeado”. El botón “Vista libre” no detiene el ciclo de animación activo, por lo que ambos sistemas (animación automática y control libre) entran en conflicto.
La solución temporal es usar siempre “Detener animación” antes de volver a la vista libre.

---

## Fuentes

- Texturas (imagenes):
  - Planeta tierra: https://github.com/otsedom/otsedom.github.io/blob/main/IG/S7/README.md 
  - Otros planetas y sol: https://www.solarsystemscope.com/textures/
- Acciones de teclado y ratón: https://www.toptal.com/developers/keycode 
- Temario de clase (sobre todo para texturas y sombras):
  - S6: https://github.com/otsedom/otsedom.github.io/blob/main/IG/S6/README.md
  - S7: https://github.com/otsedom/otsedom.github.io/blob/main/IG/S7/README.md
- Uso de IA (Chatgpt 5.0): https://chatgpt.com/
  - Fondo estrellado
  - Generación de descripción de planetas
  - Diseño de menú y botones (función creaInterfaz())
  - Se apoya para realizar el funcionamiento de la animación tanto en la animación como en detener animación.
- Imagen de Xing Xing:
  - Se hace captura de una imagen de google y se quita su fondo haciendolo un png con: https://www.iloveimg.com/es/eliminar-fondo

