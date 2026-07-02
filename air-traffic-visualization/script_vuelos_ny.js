import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Variables de escena
let scene, renderer, camera, camcontrols;
let mapa, mapsx, mapsy;
const scale = 8;

// Coordenadas del mapa (Nueva York) - Ampliadas para incluir todos los aeropuertos
const minlon = -74.5; // Ampliado desde -74.3000 (incluye MMU)
const maxlon = -73.0; // Ampliado desde -73.7000 (incluye ISP, BDR)
const minlat = 40.6; // Ampliado desde 40.5000 (incluye JFK)
const maxlat = 41.2; // Ampliado desde 40.9000 (incluye HPN, BDR)

// Datos
const aeropuertos = [];
const vuelos = [];
const objetosAeropuertos = [];
const objetosVuelos = [];
const etiquetasAeropuertos = [];

// Control de tiempo y animación
let horaActual = new Date(2024, 0, 1, 8, 0, 0); // 08:00
let velocidadSimulacion = 1; // Minutos por frame
let simulacionPausada = false;
let mostrarEtiquetas = true;

// Colores por tipo de aeropuerto
const coloresAeropuerto = {
  Internacional: 0x00ff00,
  Nacional: 0xffff00,
  Regional: 0xff9900,
  Privado: 0xff00ff,
};

init();
animate();

async function init() {
  // Crear escena
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0e27);
  scene.fog = new THREE.Fog(0x0a0e27, 10, 50);

  // Configurar cámara
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 8);

  // Configurar renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.getElementById("app").appendChild(renderer.domElement);

  // Controles de cámara
  camcontrols = new OrbitControls(camera, renderer.domElement);
  camcontrols.enableDamping = true;
  camcontrols.dampingFactor = 0.05;
  camcontrols.minDistance = 2;
  camcontrols.maxDistance = 20;

  // Iluminación
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 5);
  scene.add(directionalLight);

  // Cargar textura del mapa
  await cargarMapa();

  // Cargar datos
  await cargarAeropuertos();
  await cargarVuelos();

  // Crear geometría de vuelos
  crearRutasVuelos();

  // Ocultar pantalla de carga
  setTimeout(() => {
    document.getElementById("loadingScreen").classList.add("hidden");
  }, 500);

  // Listener para resize
  window.addEventListener("resize", onWindowResize, false);

  // Exponer funciones globales
  window.updateSimulationSpeed = (value) => {
    velocidadSimulacion = parseFloat(value);
    console.log("Velocidad ajustada a:", velocidadSimulacion + "x");
  };
  window.togglePause = () => {
    simulacionPausada = !simulacionPausada;
  };
  window.resetSim = resetSimulation;
  window.toggleLabels = toggleAirportLabels;
  window.setCameraTopView = setCameraTop;
  window.setCameraPerspectiveView = setCameraPerspective;
  window.focusOnAirport = focusOnAirport;
  window.setRotateMode = setRotateMode;
  window.setPanMode = setPanMode;
}

async function cargarMapa() {
  return new Promise((resolve) => {
    const loader = new THREE.TextureLoader();
    loader.load(
      "src/mapa_ny.png", // Necesitarás poner tu imagen aquí
      (texture) => {
        const aspectRatio = texture.image.width / texture.image.height;
        mapsy = scale;
        mapsx = mapsy * aspectRatio;

        const geometry = new THREE.PlaneGeometry(mapsx, mapsy);
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          opacity: 0.9,
        });

        mapa = new THREE.Mesh(geometry, material);
        mapa.position.z = -0.1;
        scene.add(mapa);

        resolve();
      },
      undefined,
      () => {
        // Si falla la carga, crear un plano con color
        mapsy = scale;
        mapsx = mapsy * 1.5;

        const geometry = new THREE.PlaneGeometry(mapsx, mapsy);
        const material = new THREE.MeshBasicMaterial({
          color: 0x1a2332,
          transparent: true,
          opacity: 0.9,
        });

        mapa = new THREE.Mesh(geometry, material);
        mapa.position.z = -0.1;
        scene.add(mapa);

        resolve();
      }
    );
  });
}

async function cargarAeropuertos() {
  try {
    const response = await fetch("src/aeropuertos_ny.csv");
    const text = await response.text();
    procesarCSVAeropuertos(text);
  } catch (error) {
    console.error("Error cargando aeropuertos:", error);
  }
}

function procesarCSVAeropuertos(content) {
  const lineas = content.split("\n");
  const encabezados = lineas[0].split(";");

  for (let i = 1; i < lineas.length; i++) {
    const columnas = lineas[i].split(";");
    if (columnas.length > 1) {
      const aeropuerto = {
        codigo: columnas[0].trim(),
        nombre: columnas[1].trim(),
        lat: parseFloat(columnas[2]),
        lon: parseFloat(columnas[3]),
        tipo: columnas[4].trim(),
        capacidad: parseInt(columnas[5]),
      };

      aeropuertos.push(aeropuerto);

      // Crear visualización del aeropuerto
      const mlon = mapToRange(
        aeropuerto.lon,
        minlon,
        maxlon,
        -mapsx / 2,
        mapsx / 2
      );
      const mlat = mapToRange(
        aeropuerto.lat,
        minlat,
        maxlat,
        -mapsy / 2,
        mapsy / 2
      );

      crearAeropuerto(mlon, mlat, aeropuerto);
    }
  }

  console.log(`Cargados ${aeropuertos.length} aeropuertos`);
}

function crearAeropuerto(x, y, aeropuerto) {
  // Crear marcador del aeropuerto
  const tamaño = 0.08;
  const geometry = new THREE.CylinderGeometry(tamaño, tamaño * 0.5, 0.15, 8);
  const material = new THREE.MeshPhongMaterial({
    color: coloresAeropuerto[aeropuerto.tipo] || 0xffffff,
    emissive: coloresAeropuerto[aeropuerto.tipo] || 0xffffff,
    emissiveIntensity: 0.3,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, 0);
  mesh.rotation.x = Math.PI / 2;
  scene.add(mesh);

  // Añadir anillo de pulsación
  const ringGeometry = new THREE.RingGeometry(tamaño * 1.2, tamaño * 1.5, 32);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: coloresAeropuerto[aeropuerto.tipo] || 0xffffff,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.position.set(x, y, 0.01);
  scene.add(ring);

  objetosAeropuertos.push({
    mesh: mesh,
    ring: ring,
    aeropuerto: aeropuerto,
    animacion: 0,
  });

  // Crear etiqueta
  crearEtiqueta(x, y, aeropuerto.codigo, aeropuerto);
}

function crearEtiqueta(x, y, texto, aeropuerto) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = 256;
  canvas.height = 128;

  // Fondo
  context.fillStyle = "rgba(10, 14, 39, 0.9)";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Borde
  context.strokeStyle = "#00d4ff";
  context.lineWidth = 3;
  context.strokeRect(0, 0, canvas.width, canvas.height);

  // Texto código
  context.fillStyle = "#00d4ff";
  context.font = "bold 48px Arial";
  context.textAlign = "center";
  context.fillText(texto, 128, 60);

  // Texto tipo
  context.fillStyle = "#ffffff";
  context.font = "24px Arial";
  context.fillText(aeropuerto.tipo, 128, 95);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
  });
  const sprite = new THREE.Sprite(material);
  sprite.position.set(x, y + 0.3, 0.1);
  sprite.scale.set(0.8, 0.4, 1);

  scene.add(sprite);
  etiquetasAeropuertos.push(sprite);
}

async function cargarVuelos() {
  try {
    const response = await fetch("src/vuelos_ny.csv");
    const text = await response.text();
    procesarCSVVuelos(text);
  } catch (error) {
    console.error("Error cargando vuelos:", error);
  }
}

function procesarCSVVuelos(content) {
  const lineas = content.split("\n");

  for (let i = 1; i < lineas.length; i++) {
    const columnas = lineas[i].split(";");
    if (columnas.length > 1) {
      const vuelo = {
        id: columnas[0].trim(),
        horaSalida: parseHora(columnas[1].trim()),
        horaLlegada: parseHora(columnas[2].trim()),
        origen: columnas[3].trim(),
        destino: columnas[4].trim(),
        pasajeros: parseInt(columnas[5]),
        estado: columnas[6].trim(),
      };

      vuelos.push(vuelo);
    }
  }

  console.log(`Cargados ${vuelos.length} vuelos`);
  document.getElementById("totalFlights").textContent = vuelos.length;
}

function parseHora(horaStr) {
  const [hora, minuto] = horaStr.split(":").map(Number);
  const fecha = new Date(2024, 0, 1, hora, minuto, 0);
  return fecha;
}

function crearRutasVuelos() {
  vuelos.forEach((vuelo) => {
    const aeropuertoOrigen = aeropuertos.find((a) => a.codigo === vuelo.origen);
    const aeropuertoDestino = aeropuertos.find(
      (a) => a.codigo === vuelo.destino
    );

    if (!aeropuertoOrigen || !aeropuertoDestino) return;

    const origenX = mapToRange(
      aeropuertoOrigen.lon,
      minlon,
      maxlon,
      -mapsx / 2,
      mapsx / 2
    );
    const origenY = mapToRange(
      aeropuertoOrigen.lat,
      minlat,
      maxlat,
      -mapsy / 2,
      mapsy / 2
    );
    const destinoX = mapToRange(
      aeropuertoDestino.lon,
      minlon,
      maxlon,
      -mapsx / 2,
      mapsx / 2
    );
    const destinoY = mapToRange(
      aeropuertoDestino.lat,
      minlat,
      maxlat,
      -mapsy / 2,
      mapsy / 2
    );

    // Crear curva para la ruta
    const start = new THREE.Vector3(origenX, origenY, 0.05);
    const end = new THREE.Vector3(destinoX, destinoY, 0.05);

    const midX = (origenX + destinoX) / 2;
    const midY = (origenY + destinoY) / 2;
    const distance = Math.sqrt(
      Math.pow(destinoX - origenX, 2) + Math.pow(destinoY - origenY, 2)
    );
    const height = distance * 0.3;
    const control = new THREE.Vector3(midX, midY, height);

    const curve = new THREE.QuadraticBezierCurve3(start, control, end);

    // Línea de ruta (invisible al inicio)
    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.2,
    });
    const line = new THREE.Line(geometry, material);
    scene.add(line);

    // Avión (esfera pequeña)
    const avionGeometry = new THREE.SphereGeometry(0.04, 16, 16);
    const avionMaterial = new THREE.MeshPhongMaterial({
      color: 0x00d4ff,
      emissive: 0x00d4ff,
      emissiveIntensity: 0.5,
    });
    const avion = new THREE.Mesh(avionGeometry, avionMaterial);
    avion.visible = false;
    scene.add(avion);

    // Trail del avión
    const trailPoints = [];
    const trailGeometry = new THREE.BufferGeometry();
    const trailMaterial = new THREE.LineBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.6,
    });
    const trail = new THREE.Line(trailGeometry, trailMaterial);
    scene.add(trail);

    objetosVuelos.push({
      vuelo: vuelo,
      linea: line,
      avion: avion,
      trail: trail,
      trailPoints: trailPoints,
      curve: curve,
      progreso: 0,
      activo: false,
    });
  });
}

function actualizarVuelos() {
  let vuelosActivos = 0;
  let totalPasajeros = 0;

  objetosVuelos.forEach((obj) => {
    const vuelo = obj.vuelo;

    // Verificar si el vuelo debe estar activo
    if (horaActual >= vuelo.horaSalida && horaActual <= vuelo.horaLlegada) {
      if (!obj.activo) {
        obj.activo = true;
        obj.progreso = 0;
        obj.trailPoints = [];
      }

      // Calcular progreso del vuelo
      const tiempoTotal = vuelo.horaLlegada - vuelo.horaSalida;
      const tiempoTranscurrido = horaActual - vuelo.horaSalida;
      obj.progreso = tiempoTranscurrido / tiempoTotal;

      if (obj.progreso > 1) obj.progreso = 1;

      // Actualizar posición del avión
      const position = obj.curve.getPoint(obj.progreso);
      obj.avion.position.copy(position);
      obj.avion.visible = true;
      obj.linea.material.opacity = 0.3;

      // Actualizar trail
      obj.trailPoints.push(position.clone());
      if (obj.trailPoints.length > 20) {
        obj.trailPoints.shift();
      }
      obj.trail.geometry.setFromPoints(obj.trailPoints);

      vuelosActivos++;
      totalPasajeros += vuelo.pasajeros;
    } else {
      if (obj.activo && horaActual > vuelo.horaLlegada) {
        obj.activo = false;
        obj.avion.visible = false;
        obj.linea.material.opacity = 0.1;
        obj.trailPoints = [];
        obj.trail.geometry.setFromPoints([]);
      }
    }
  });

  // Actualizar estadísticas
  document.getElementById("activeFlights").textContent = vuelosActivos;
  document.getElementById("totalPassengers").textContent = totalPasajeros;
}

function actualizarAnimacionesAeropuertos() {
  objetosAeropuertos.forEach((obj) => {
    obj.animacion += 0.02;

    // Animación de pulsación del anillo
    const scale = 1 + Math.sin(obj.animacion) * 0.1;
    obj.ring.scale.set(scale, scale, 1);

    // Rotación suave del marcador
    obj.mesh.rotation.z += 0.01;
  });
}

function actualizarTiempo() {
  if (!simulacionPausada) {
    horaActual = new Date(horaActual.getTime() + velocidadSimulacion * 60000);

    // Si llegamos al final del día, reiniciar
    if (horaActual.getHours() >= 20) {
      horaActual = new Date(2024, 0, 1, 8, 0, 0);
    }

    // Actualizar display
    const horas = String(horaActual.getHours()).padStart(2, "0");
    const minutos = String(horaActual.getMinutes()).padStart(2, "0");
    const segundos = String(horaActual.getSeconds()).padStart(2, "0");
    document.getElementById(
      "timeDisplay"
    ).textContent = `${horas}:${minutos}:${segundos}`;
  }
}

function mapToRange(val, vmin, vmax, dmin, dmax) {
  const t = 1 - (vmax - val) / (vmax - vmin);
  return dmin + t * (dmax - dmin);
}

function resetSimulation() {
  horaActual = new Date(2024, 0, 1, 8, 0, 0);
  objetosVuelos.forEach((obj) => {
    obj.activo = false;
    obj.progreso = 0;
    obj.avion.visible = false;
    obj.linea.material.opacity = 0.1;
    obj.trailPoints = [];
    obj.trail.geometry.setFromPoints([]);
  });
}

function toggleAirportLabels() {
  mostrarEtiquetas = !mostrarEtiquetas;
  etiquetasAeropuertos.forEach((etiqueta) => {
    etiqueta.visible = mostrarEtiquetas;
  });
}

function setCameraTop() {
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);
}

function setCameraPerspective() {
  camera.position.set(5, -5, 8);
  camera.lookAt(0, 0, 0);
}

function focusOnAirport(code) {
  // Buscar el aeropuerto por código
  const aeropuerto = aeropuertos.find((a) => a.codigo === code);

  if (!aeropuerto) {
    console.log("Aeropuerto no encontrado:", code);
    return;
  }

  // Convertir coordenadas del aeropuerto a posición en el mapa
  const mlon = mapToRange(
    aeropuerto.lon,
    minlon,
    maxlon,
    -mapsx / 2,
    mapsx / 2
  );
  const mlat = mapToRange(
    aeropuerto.lat,
    minlat,
    maxlat,
    -mapsy / 2,
    mapsy / 2
  );

  // Animar la cámara hacia el aeropuerto
  const targetPosition = new THREE.Vector3(mlon, mlat, 3);

  // Animación suave de la cámara
  const startPosition = camera.position.clone();
  const duration = 1000; // 1 segundo
  const startTime = Date.now();

  function animateCamera() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Interpolación suave (ease-out)
    const eased = 1 - Math.pow(1 - progress, 3);

    camera.position.lerpVectors(startPosition, targetPosition, eased);
    camera.lookAt(mlon, mlat, 0);

    if (progress < 1) {
      requestAnimationFrame(animateCamera);
    } else {
      // Actualizar el target de los controles
      camcontrols.target.set(mlon, mlat, 0);
      camcontrols.update();
    }
  }

  animateCamera();
  console.log(`Enfocando en ${aeropuerto.nombre} (${code})`);
}

function setRotateMode() {
  // Habilitar rotación con botón izquierdo, pan con botón derecho (modo por defecto)
  camcontrols.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.PAN,
  };
  console.log("Modo: ROTAR (click izquierdo rota, click derecho mueve)");
}

function setPanMode() {
  // Habilitar pan con botón izquierdo, desactivar rotación
  camcontrols.mouseButtons = {
    LEFT: THREE.MOUSE.PAN,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.ROTATE,
  };
  console.log("Modo: MOVER (click izquierdo mueve, click derecho rota)");
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  actualizarTiempo();
  actualizarVuelos();
  actualizarAnimacionesAeropuertos();

  camcontrols.update();
  renderer.render(scene, camera);
}
