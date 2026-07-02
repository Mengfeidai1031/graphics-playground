# Air Traffic Visualization — New York Metropolitan Area

## Descripción

Este proyecto es una visualización 3D interactiva del tráfico aéreo en el área metropolitana de Nueva York utilizando Three.js. Muestra en tiempo real los vuelos entre diferentes aeropuertos, con animaciones fluidas de aviones viajando entre ubicaciones, controles interactivos y estadísticas en tiempo real.

<img width="1333" height="673" alt="image" src="https://github.com/user-attachments/assets/f5e835c1-8de8-4623-b8f1-b66d03ac8424" />

---

## Enlaces

Codesandbox: https://codesandbox.io/p/sandbox/s8-v2-29zj25

Vídeo en Youtube: https://youtu.be/qaZZo8tOBTU

Ejecución: https://29zj25.csb.app/

---

## Datos del Mapa

### Coordenadas del Área Visualizada

**Región:** Área Metropolitana de Nueva York/Nueva Jersey

**Coordenadas para descargar el mapa desde OpenStreetMap:**
- **Latitud mínima:** 40.6000
- **Latitud máxima:** 41.2000
- **Longitud mínima:** -74.5000
- **Longitud máxima:** -73.0000

---

## Fuentes de Datos

### 1. Aeropuertos (aeropuertos_ny.csv)

**Fuente:** Datos compilados manualmente basados en:
- [AirNav.com](https://www.airnav.com/) - Base de datos de aeropuertos de EE.UU.

**Aeropuertos incluidos:**
1. **JFK** - John F. Kennedy International Airport (Internacional)
2. **LGA** - LaGuardia Airport (Nacional)
3. **EWR** - Newark Liberty International Airport (Internacional)
4. **TEB** - Teterboro Airport (Privado)
5. **CDW** - Caldwell Airport (Regional)
6. **MMU** - Morristown Municipal Airport (Regional)
7. **HPN** - Westchester County Airport (Regional)
8. **FRG** - Republic Airport (Regional)
9. **ISP** - Long Island MacArthur Airport (Nacional)
10. **BDR** - Igor I. Sikorsky Memorial Airport (Regional)

**Estructura del CSV:**
```
codigo;nombre;latitud;longitud;tipo;capacidad
```

### 2. Vuelos (vuelos_ny.csv)

**Fuente:** Datos simulados realistas basados en:
- Patrones de tráfico típicos de la región de NY
- Horarios comerciales estándar (08:00 - 19:00)
- Capacidades de pasajeros realistas según tipo de aeronave

**Características:**
- 40 vuelos simulados
- Horarios distribuidos a lo largo del día
- Rutas entre todos los aeropuertos del área
- Número de pasajeros basado en capacidad típica de aeronaves regionales y comerciales

**Estructura del CSV:**
```
vuelo_id;hora_salida;hora_llegada;aeropuerto_origen;aeropuerto_destino;pasajeros;estado
```

---

## Características de la Visualización

### Elementos Visuales

1. **Aeropuertos**
   - Marcadores cilíndricos con colores según tipo:
     - Verde: Internacional
     - Amarillo: Nacional
     - Naranja: Regional
     - Púrpura: Privado
   - Anillos pulsantes alrededor de cada aeropuerto
   - Etiquetas con código IATA y tipo
   - Rotación suave continua

2. **Vuelos**
   - Aviones representados como esferas azules brillantes
   - Trayectorias curvas (curvas de Bézier cuadráticas)
   - Líneas de ruta semi-transparentes
   - Estelas (trails) que siguen a cada avión
   - Animación fluida del recorrido completo

3. **Mapa Base**
   - Textura del mapa de OpenStreetMap
   - Transparencia ajustable
   - Escala correcta según coordenadas geográficas

### Controles Interactivos

#### Panel de Controles (desplegable)
- **Velocidad de Simulación:** Control deslizante de 0.5x a 10x
- **Pausar/Reanudar:** Congela la simulación en cualquier momento
- **Reiniciar:** Vuelve al inicio del día (08:00)
- **Etiquetas:** Muestra/oculta las etiquetas de aeropuertos
- **Rotar:** Permite rotar todo el mapa usando el ratón
- **Mover:** Permite arrastrar y mover por el mapa usando el ratón
- **Vista Superior:** Cámara cenital
- **Vista Perspectiva:** Cámara angular para mejor profundidad

<img width="542" height="606" alt="image" src="https://github.com/user-attachments/assets/7de6317a-7787-4b64-9be1-5ccd24c13dc6" />

#### Panel de Leyenda (desplegable)
- Explicación de colores por tipo de aeropuerto
- Simbología de vuelos y rutas

<img width="320" height="431" alt="image" src="https://github.com/user-attachments/assets/50c16d1f-12ec-42d6-b90d-ccc16b98a228" />

#### Panel de Aeropuertos (desplegable)
- Centrar cámara al aeropuerto seleccionado

<img width="240" height="646" alt="image" src="https://github.com/user-attachments/assets/7a4c5f05-1edf-4990-b072-3ecd313610be" />

#### Panel de Estadísticas (siempre visible)
- Vuelos activos en el momento actual
- Total de vuelos del día
- Número total de pasajeros en vuelos activos

<img width="266" height="176" alt="image" src="https://github.com/user-attachments/assets/52d717b9-42d6-4403-9c17-b944e942166b" />

### Animaciones

**Aviones en Movimiento**
- Siguen trayectorias curvas realistas
- Velocidad proporcional a la duración del vuelo
- Aparecen y desaparecen según horarios

<img width="293" height="190" alt="image" src="https://github.com/user-attachments/assets/98159c1a-915a-4d4f-874e-4b7a3ed8f096" />

---

## Fuentes
- Datos de aeropuertos (aeropuertos_ny.csv): [AirNav.com](https://www.airnav.com/)
- Imagen de mapa: [openstreetmap.org](https://www.openstreetmap.org/#map=10/40.9228/-73.7952)
- Recurso de clase: https://github.com/otsedom/otsedom.github.io/blob/main/IG/S8/README.md
- IA (Claude Sonnet 4.5):
  -  Simulación de datos de vuelo (vuelos_ny.csv)
  -  Estilo y ubicación de botones en HTML
  -  Ayuda en creación de la animación de los vuelos
  -  Corrección de errores de ejecución
