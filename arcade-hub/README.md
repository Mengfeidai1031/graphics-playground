# Arcade Hub — Menú animado y minijuegos

## Descripción

Este proyecto es un hub de videojuegos arcade que incluye:
- **Menú principal** con personaje 3D animado profesional (modelo Soldier con animaciones)
- **5 minijuegos** diferentes e independientes
- Sistema de animaciones con controles de teclado
- Diseño retro-futurista estilo arcade de los 80s/90s
- Efectos visuales, luces y sombras dinámicas

---

## Enlaces

Codesandbox: https://codesandbox.io/p/sandbox/youthful-roentgen-7n393g

Vídeo en Youtube: https://youtu.be/DdajAcIpRp0

Ejecución: https://7n393g.csb.app/ 

---

## Menú Principal

### Características del Personaje
- **Robot Expresivo animado** - Personaje divertido y colorido
- **Múltiples animaciones expresivas**: Idle, Walking, Running, Dance, Jump, Wave, Yes, No, Punch
- **Sistema robusto de animaciones** que busca automáticamente variaciones
- **Escenario circular** con iluminación ambiental y efectos de neón
- **Esferas flotantes** decorativas con animaciones

### Controles del Personaje
| Tecla | Animación |
|-------|-----------|
| **1** | Idle / Espera |
| **2** | Caminar |
| **3** | Correr |
| **4** | Saltar |
| **5** | Bailar |
| **6** | Vuelta sorpresa |
| **SPACE** | Secuencia completa de animaciones |

### Botón de acceso a los distintos minijuegos
| Tecla | Animación |
|-------|-----------|
| **01** | 🎳 BOLOS |
| **02** | 🎯 DIANA |
| **03** | 🧺 CESTA |
| **04** | 🔫 TIRO AL BLANCO |
| **05** | 📦 APILA CAJAS |

<img width="1919" height="871" alt="image" src="https://github.com/user-attachments/assets/a4a22c1c-0416-4b9d-aa5f-7774a4f90979" />

---

## Personaje

### Modelo del Personaje
El proyecto usa el modelo **Xbot** de los ejemplos oficiales de Three.js, que incluye múltiples animaciones de Mixamo. Puedes reemplazarlo con cualquier modelo GLTF que tenga animaciones.

**URLs alternativas de modelos:**
- Xbot: `https://threejs.org/examples/models/gltf/Xbot.glb`
- Personajes de Mixamo: [mixamo.com](https://www.mixamo.com/)
- Modelos gratuitos: [sketchfab.com](https://sketchfab.com/)

### Animaciones Esperadas
El código espera estas animaciones en el modelo:
- `idle` - Postura de espera
- `walk` - Caminar
- `run` - Correr
- `jump` - Saltar
- `dance` - Bailar

Si usas otro modelo, ajusta los nombres en `menu.js`.

<img width="301" height="414" alt="image" src="https://github.com/user-attachments/assets/b90a161d-c053-4e99-97cc-036f10e65186" />

---

## LOS 5 MINIJUEGOS

### 1. 🎳 BOLOS (Bowling)
**Objetivo:** Derribar los 10 bolos con la bola

**Controles:**
- **Mouse Move**: Apuntar
- **Click en canvas**: Lanzar bola (NO en botón START)
- **R**: Reiniciar

**Características:**
- Física simulada de colisiones
- Formación triangular de bolos
- Animaciones de caída realistas
- Contador de lanzamientos y bolos derribados
- Click separado del botón START

<img width="1919" height="869" alt="image" src="https://github.com/user-attachments/assets/370f9bce-1dc6-41c1-9420-be5025b425a1" />

---

### 2. 🎯 DIANA (Darts)
**Objetivo:** Lanzar 10 dardos a la diana y conseguir el mayor número de puntos posibles

**Controles:**
- **Mouse Move**: Apuntar
- **Click en canvas**: Lanzar dardos
- **R**: Reiniciar

**Características:**
- Diseño de diana
- Obtención de distinta cantidad de puntos dependiendo de zona de diana
- El lanzamiento de dardos tiene una ligera desviación en la trayectoria con respecto al mouse que el jugador debe descubrir durante la partida
- Contador de puntos y dardos restantes
- Click separado del botón START

<img width="1919" height="865" alt="image" src="https://github.com/user-attachments/assets/78b0d827-00cb-4fbb-ac3e-e214298eb573" />

---

### 3. 🧺 CESTA (Basket Catch)
**Objetivo:** Atrapa la comida que cae del cielo

**Controles:**
- **← → / A D**: Mover cesta
- **R**: Reiniciar

**Características:**
- Comida variada (manzanas, naranjas, queso, helado)
- Sistema de generación automática
- Temporizador de 60 segundos
- Contador de comida atrapada y perdida
- Game over al acabar el tiempo

<img width="1919" height="868" alt="image" src="https://github.com/user-attachments/assets/b741da45-216b-46ee-99d3-638c3c7e4b7a" />

---

### 4. 🔫 TIRO AL BLANCO (Target Shooting)
**Objetivo:** Dispara a los objetivos móviles

**Controles:**
- **Mouse Move**: Apuntar (con mira)
- **Click en canvas**: Disparar (NO en botón START)
- **R**: Reiniciar

**Características:**
- Objetivos móviles con trayectorias
- 20 balas por partida
- Mira personalizada en el centro
- Efectos de explosión al acertar
- Click separado del botón START

<img width="1919" height="860" alt="image" src="https://github.com/user-attachments/assets/50e03cbb-b910-419b-a54e-9219f31c6853" />

---

### 5. 📦 APILA CAJAS (Stack Boxes)
**Objetivo:** Construye una torre de 20 cajas

**Controles:**
- **SPACE**: Soltar caja
- **R**: Reiniciar

**Características:**
- Cajas de colores alternados
- Movimiento oscilante funcional
- Sistema de precisión
- Cámara que sigue la altura
- Meta de 20 cajas para ganar
- Game over si fallas el apilamiento

<img width="1919" height="865" alt="image" src="https://github.com/user-attachments/assets/53b9b038-bcc2-435d-a56d-bf55d65319bd" />

---

## Diseño Visual

### Paleta de Colores
- **Fondo:** Tonos oscuros espaciales (#0a0a1a, #1a0530)
- **Acentos:** Cyan (#00ffff), Magenta (#ff00ff), Amarillo (#ffff00)
- **Efectos:** Neón, sombras, emissive lighting

### Tipografía
- **Títulos:** Press Start 2P (fuente pixelada retro)
- **UI:** Orbitron (fuente futurista)

### Efectos
- Scanlines (líneas de TV antigua)
- Glowing text (texto con brillo neón)
- Sombras dinámicas
- Iluminación de colores
- Animaciones suaves con easing

---

## Tecnologías Utilizadas

### Core
- **Three.js (r170)**: Motor 3D
- **Tween.js (v23.1.3)**: Animaciones e interpolación
- **Vite**: Build tool y dev server

### Módulos de Three.js
- **GLTFLoader**: Carga de modelos 3D
- **OrbitControls**: Control de cámara
- **AnimationMixer**: Gestión de animaciones

### Conceptos Aplicados
- Sistema de partículas
- Raycasting
- Detección de colisiones
- Física simulada
- Sistema de animaciones
- Carga de assets externos
- Iluminación avanzada

---

## Características Destacadas

### Sistema de Animaciones
- **Blending** entre animaciones
- **FadeIn/FadeOut** suaves
- **Loop** para animaciones continuas
- **LoopOnce** para animaciones únicas
- **Secuencias encadenadas** con timing

### Física y Colisiones
- **Raycasting** para disparos
- **Box3** para detección de colisiones
- **Distancia** para colisiones esféricas
- **Simulación** de caída y rebote

### Efectos Visuales
- **Emissive materials** para neón
- **Point lights** de colores
- **Sombras dinámicas** en todos los juegos
- **Fog** para profundidad
- **Partículas** animadas

---

## Fuentes

- Temario de clase
  - S11: https://github.com/otsedom/otsedom.github.io/blob/main/IG/S11/README.md
- Editor para probar y ejecutar el programa: https://codesandbox.io/
- IA (Claude Sonnet 4.5): https://claude.ai/:
  - Diseño de interfaces y estilos
  - Física y Colisiones
  - Efectos Visuales
