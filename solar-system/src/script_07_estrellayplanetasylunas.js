import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let scene, renderer, camera, controls;
let info, grid;
let estrella;
let Planetas = [];
let Lunas = [];
let t0 = 0;
let accglobal = 0.005; // Velocidad más natural y un poco más rápida
let timestamp;

const planetData = [
  {
    nombre: "Mercurio",
    radio: 0.4,
    dist: 6,
    vel: 0.018,
    textura: "2k_mercury.jpg",
    descripcion:
      "Mercurio es el planeta más cercano al Sol y el más pequeño del sistema solar.",
    lunas: [],
  },
  {
    nombre: "Venus",
    radio: 0.7,
    dist: 8.5,
    vel: 0.015,
    textura: "2k_venus_surface.jpg",
    descripcion:
      "Venus es el segundo planeta desde el Sol, conocido por su atmósfera densa y caliente.",
    lunas: [],
  },
  {
    nombre: "Tierra",
    radio: 0.8,
    dist: 11,
    vel: 0.013,
    textura: "earthmap1k.jpg",
    descripcion:
      "La Tierra es nuestro hogar, el único planeta conocido con vida.",
    lunas: [{ radio: 0.15, dist: 1.2, vel: 0.07, col: 0xaaaaaa, angle: 0 }],
  },
  {
    nombre: "Marte",
    radio: 0.6,
    dist: 14,
    vel: 0.011,
    textura: "2k_mars.jpg",
    descripcion:
      "Marte es conocido como el planeta rojo y tiene dos pequeñas lunas.",
    lunas: [
      { radio: 0.08, dist: 0.9, vel: 0.05, col: 0x999999, angle: 0 },
      { radio: 0.06, dist: 1.3, vel: 0.04, col: 0x777777, angle: Math.PI / 2 },
    ],
  },
  {
    nombre: "Júpiter",
    radio: 2.2,
    dist: 19,
    vel: 0.008,
    textura: "2k_jupiter.jpg",
    descripcion:
      "Júpiter es el planeta más grande del sistema solar con muchas lunas.",
    lunas: [
      { radio: 0.3, dist: 2.5, vel: 0.03, col: 0xbbbbbb, angle: 0 },
      { radio: 0.25, dist: 3.2, vel: 0.02, col: 0xdddddd, angle: Math.PI / 3 },
      { radio: 0.2, dist: 4.0, vel: 0.015, col: 0x999999, angle: Math.PI / 6 },
    ],
  },
  {
    nombre: "Saturno",
    radio: 1.9,
    dist: 25,
    vel: 0.006,
    textura: "2k_saturn.jpg",
    descripcion:
      "Saturno es famoso por sus anillos espectaculares y tiene muchas lunas.",
    lunas: [
      { radio: 0.3, dist: 2.4, vel: 0.025, col: 0xbbbbbb, angle: 0 },
      { radio: 0.22, dist: 3.0, vel: 0.02, col: 0xdddddd, angle: Math.PI / 4 },
    ],
  },
  {
    nombre: "Urano",
    radio: 1.4,
    dist: 30,
    vel: 0.005,
    textura: "2k_uranus.jpg",
    descripcion: "Urano es un gigante helado con un eje de rotación inclinado.",
    lunas: [{ radio: 0.18, dist: 2.1, vel: 0.02, col: 0xcccccc, angle: 0 }],
  },
  {
    nombre: "Neptuno",
    radio: 1.3,
    dist: 34,
    vel: 0.004,
    textura: "2k_neptune.jpg",
    descripcion:
      "Neptuno es el planeta más lejano, conocido por sus vientos fuertes.",
    lunas: [{ radio: 0.15, dist: 1.9, vel: 0.018, col: 0xbbbbbb, angle: 0 }],
  },
];

let planetMeshes = [];
let planetLabels = [];
let orbitLines = [];

let cameraInicio = new THREE.Vector3(0, 0, 70);
let cameraLookAtInicio = new THREE.Vector3(0, 0, 0);

let infoPanel;
let planetaSeleccionado = null;
let animacionActiva = false;
let nave,
  mensajeInicialMostrado = false;
let detenerAnimacion = false;

init();
animationLoop();

function init() {
  // Info arriba
  info = document.createElement("div");
  info.style.position = "absolute";
  info.style.top = "30px";
  info.style.width = "100%";
  info.style.textAlign = "center";
  info.style.color = "#fff";
  info.style.fontWeight = "bold";
  info.style.backgroundColor = "transparent";
  info.style.zIndex = "1";
  info.style.fontFamily = "Monospace";
  info.innerHTML = "three.js - Sol y Planetas (Meng Fei Dai)";
  document.body.appendChild(info);

  // Panel de descripción en la parte inferior
  infoPanel = document.createElement("div");
  infoPanel.style.position = "absolute";
  infoPanel.style.bottom = "0px";
  infoPanel.style.left = "0";
  infoPanel.style.width = "100%";
  infoPanel.style.minHeight = "80px";
  infoPanel.style.background = "rgba(0,0,0,0.9)";
  infoPanel.style.color = "#eee";
  infoPanel.style.padding = "15px 20px";
  infoPanel.style.fontFamily = "Arial, sans-serif";
  infoPanel.style.fontSize = "16px";
  infoPanel.style.boxSizing = "border-box";
  infoPanel.style.zIndex = "10";
  infoPanel.innerHTML = "<b>Selecciona un planeta para ver su descripción</b>";
  document.body.appendChild(infoPanel);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.copy(cameraInicio);
  camera.lookAt(cameraLookAtInicio);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // NO agregamos la rejilla para que no se vea

  // Luz ambiental
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // Luz puntual para simular el Sol
  const pointLight = new THREE.PointLight(0xffffff, 1.5, 0, 2);
  pointLight.position.set(0, 0, 0);
  scene.add(pointLight);

  crearFondoEstrellado();

  // Crear Sol
  crearEstrella(3, 0xffff00);

  // Crear planetas con texturas, posiciones y lunas
  crearPlanetas();

  // Crear órbitas visibles
  crearOrbitas();

  // Crear UI botones
  crearInterfaz();

  window.addEventListener("resize", onWindowResize);
}

function crearEstrella(radio) {
  const loader = new THREE.TextureLoader();
  const texturaSol = loader.load("src/2k_sun.jpg");

  const geo = new THREE.SphereGeometry(radio, 64, 64);
  const mat = new THREE.MeshStandardMaterial({
    map: texturaSol,
    emissiveMap: texturaSol,
    emissive: 0x888888,
    emissiveIntensity: 2.5,
  });

  estrella = new THREE.Mesh(geo, mat);
  estrella.position.set(0, 0, 0);
  scene.add(estrella);
}

function crearPlanetas() {
  const loader = new THREE.TextureLoader();
  planetData.forEach((p, i) => {
    const textura = loader.load(`src/${p.textura}`);
    const geometry = new THREE.SphereGeometry(p.radio, 40, 40);
    const material = new THREE.MeshStandardMaterial({
      map: textura,
    });
    const planeta = new THREE.Mesh(geometry, material);

    // Posición inicial aleatoria para que no estén en línea
    const anguloInicial = Math.random() * Math.PI * 2;
    planeta.userData = {
      dist: p.dist,
      speed: p.vel,
      angle: anguloInicial,
    };

    // Posicionar inicialmente en la órbita
    planeta.position.x = Math.cos(anguloInicial) * p.dist;
    planeta.position.y = Math.sin(anguloInicial) * p.dist;
    scene.add(planeta);
    Planetas.push(planeta);
    planetMeshes.push(planeta);

    // Crear etiqueta con nombre
    const canvas = crearTextoCanvas(p.nombre);
    const spriteMap = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: spriteMap });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(3, 1.5, 1);
    sprite.position.set(
      planeta.position.x,
      planeta.position.y,
      planeta.position.z
    );
    scene.add(sprite);
    planetLabels.push(sprite);

    // Crear lunas si tiene
    p.lunas.forEach((lunaData) => {
      crearLuna(
        planeta,
        lunaData.radio,
        lunaData.dist,
        lunaData.vel,
        lunaData.col,
        lunaData.angle
      );
    });
  });
}

function crearLuna(planeta, radio, dist, vel, col, angle) {
  const pivote = new THREE.Object3D();
  pivote.rotation.x = angle;
  planeta.add(pivote);

  const geometry = new THREE.SphereGeometry(radio, 20, 20);
  const material = new THREE.MeshStandardMaterial({ color: col });
  const luna = new THREE.Mesh(geometry, material);
  luna.userData = { dist, speed: vel };

  // Posición inicial luna
  luna.position.x = dist;
  luna.position.y = 0;
  pivote.add(luna);
  Lunas.push(luna);
}

function crearOrbitas() {
  const material = new THREE.LineBasicMaterial({
    color: 0xffffff,
    opacity: 0.3,
    transparent: true,
  });
  planetData.forEach((p) => {
    const segments = 128;
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * 2 * Math.PI;
      positions.push(p.dist * Math.cos(theta), p.dist * Math.sin(theta), 0);
    }
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    const orbit = new THREE.LineLoop(geometry, material);
    scene.add(orbit);
    orbitLines.push(orbit);
  });
}

function crearInterfaz() {
  // Botón menú principal
  const btnMenu = document.createElement("button");
  btnMenu.textContent = "Menú ▼";
  btnMenu.style.position = "absolute";
  btnMenu.style.top = "10px";
  btnMenu.style.left = "10px";
  btnMenu.style.padding = "8px 16px";
  btnMenu.style.borderRadius = "8px";
  btnMenu.style.border = "none";
  btnMenu.style.cursor = "pointer";
  btnMenu.style.fontWeight = "bold";
  btnMenu.style.backgroundColor = "#444";
  btnMenu.style.color = "#fff";
  btnMenu.style.zIndex = "100";
  document.body.appendChild(btnMenu);

  // Panel que contiene todos los botones
  const panel = document.createElement("div");
  panel.style.position = "absolute";
  panel.style.top = "50px";
  panel.style.left = "10px";
  panel.style.width = "auto";
  panel.style.display = "flex";
  panel.style.flexDirection = "column";
  panel.style.alignItems = "center";
  panel.style.gap = "12px";
  panel.style.zIndex = "99";
  panel.style.backgroundColor = "rgba(0,0,0,0.6)";
  panel.style.padding = "10px";
  panel.style.borderRadius = "8px";
  panel.style.display = "none";
  document.body.appendChild(panel);

  // Función para abrir/cerrar panel
  btnMenu.onclick = () => {
    if (panel.style.display === "none") {
      panel.style.display = "flex";
      btnMenu.textContent = "Menú ▲";
    } else {
      panel.style.display = "none";
      btnMenu.textContent = "Menú ▼";
    }
  };

  // Fila de botones de planetas
  const filaPlanetas = document.createElement("div");
  filaPlanetas.style.display = "flex";
  filaPlanetas.style.justifyContent = "center";
  filaPlanetas.style.gap = "12px";
  panel.appendChild(filaPlanetas);

  planetData.forEach((p, i) => {
    const btn = document.createElement("button");
    btn.style.borderRadius = "50%";
    btn.style.border = "2px solid white";
    btn.style.background = "black";
    btn.style.padding = "0";
    btn.style.width = "56px";
    btn.style.height = "56px";
    btn.style.cursor = "pointer";
    btn.style.overflow = "hidden";
    btn.title = p.nombre;
    btn.style.display = "flex";
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";

    const img = document.createElement("img");
    img.src = `src/${p.textura}`;
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.borderRadius = "50%";
    img.style.objectFit = "cover";
    img.style.display = "block";
    btn.appendChild(img);

    btn.onclick = () => seleccionarPlaneta(i);

    filaPlanetas.appendChild(btn);
  });

  // Fila de botones de acciones
  const filaAcciones = document.createElement("div");
  filaAcciones.style.display = "flex";
  filaAcciones.style.justifyContent = "center";
  filaAcciones.style.gap = "12px";
  panel.appendChild(filaAcciones);

  const crearBoton = (texto, color, hoverColor, onclick) => {
    const btn = document.createElement("button");
    btn.textContent = texto;
    btn.style.padding = "6px 15px";
    btn.style.borderRadius = "8px";
    btn.style.border = "none";
    btn.style.cursor = "pointer";
    btn.style.fontWeight = "bold";
    btn.style.backgroundColor = color;
    btn.style.color = "#fff";
    btn.style.fontFamily = "Arial, sans-serif";
    btn.style.transition = "background-color 0.3s ease";
    btn.onmouseenter = () => (btn.style.backgroundColor = hoverColor);
    btn.onmouseleave = () => (btn.style.backgroundColor = color);
    btn.onclick = onclick;
    return btn;
  };

  filaAcciones.appendChild(
    crearBoton("Vista libre", "#222", "#555", () => vistaLibre())
  );
  filaAcciones.appendChild(
    crearBoton("Ver animación", "#0044aa", "#0066ff", () => iniciarAnimacion())
  );
  filaAcciones.appendChild(
    crearBoton("Detener animación", "#aa0000", "#ff3333", () => {
      if (animacionActiva) {
        detenerAnimacion = true;
        infoPanel.innerHTML =
          "<b>Xing Xing:</b> Animación interrumpida. Volviendo a vista libre...";
        vistaLibre();
      }
    })
  );

  // Fila de botones modo ratón
  const filaMouse = document.createElement("div");
  filaMouse.style.display = "flex";
  filaMouse.style.justifyContent = "center";
  filaMouse.style.gap = "12px";
  panel.appendChild(filaMouse);

  const btnRotar = crearBoton("Rotar", "#228822", "#44cc44", () => {
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN,
    };
  });
  filaMouse.appendChild(btnRotar);

  const btnMover = crearBoton("Mover", "#aaaa22", "#ffff55", () => {
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE,
    };
  });
  filaMouse.appendChild(btnMover);

  // Contenedor ajustes planetas
  const ajustesPanel = document.createElement("div");
  ajustesPanel.style.display = "flex";
  ajustesPanel.style.flexDirection = "column";
  ajustesPanel.style.gap = "8px";
  ajustesPanel.style.marginTop = "10px";
  panel.appendChild(ajustesPanel);

  // Label del slider
  const lblVelocidad = document.createElement("label");
  lblVelocidad.textContent = "Velocidad de órbitas";
  lblVelocidad.style.color = "#fff";
  ajustesPanel.appendChild(lblVelocidad);

  // Slider de velocidad
  const sliderVelocidad = document.createElement("input");
  sliderVelocidad.type = "range";
  sliderVelocidad.min = "0.001";
  sliderVelocidad.max = "0.05";
  sliderVelocidad.step = "0.001";
  sliderVelocidad.value = accglobal;
  ajustesPanel.appendChild(sliderVelocidad);

  // Actualizar velocidad al mover slider
  sliderVelocidad.oninput = () => {
    accglobal = parseFloat(sliderVelocidad.value);
  };
}

function seleccionarPlaneta(index) {
  planetaSeleccionado = Planetas[index];
  const p = planetData[index];
  infoPanel.innerHTML = `<b>${p.nombre}</b>: ${p.descripcion}`;
  controls.enableZoom = false;
  controls.minDistance = controls.maxDistance = 6;
}

function vistaLibre() {
  planetaSeleccionado = null;
  infoPanel.innerHTML = "<b>Selecciona un planeta para ver su descripción</b>";
  // Restaurar cámara a la posición inicial solo UNA vez
  camera.position.copy(cameraInicio);
  controls.target.copy(cameraLookAtInicio);
  controls.enableZoom = true;
  controls.minDistance = 1;
  controls.maxDistance = 1000;
  controls.update();
  if (nave) {
    scene.remove(nave);
    nave = null;
  }
}

function actualizarPosiciones(delta) {
  Planetas.forEach((planeta, i) => {
    let ud = planeta.userData;
    ud.angle += ud.speed * delta;
    planeta.position.x = Math.cos(ud.angle) * ud.dist;
    planeta.position.y = Math.sin(ud.angle) * ud.dist;

    // Actualizar etiqueta
    planetLabels[i].position.set(
      planeta.position.x,
      planeta.position.y + planetData[i].radio + 0.8,
      0
    );

    // Actualizar lunas
    if (planeta.children.length > 0) {
      planeta.children.forEach((pivote) => {
        pivote.rotation.z += (pivote.children[0].userData.speed || 0) * delta;
      });
    }
  });
}

function moverCamara() {
  if (planetaSeleccionado) {
    const targetPos = planetaSeleccionado.position.clone();
    const camTarget = targetPos.clone().add(new THREE.Vector3(0, 0, 6));
    camera.position.lerp(camTarget, 0.15);
    controls.target.lerp(targetPos, 0.2);
    controls.update();
  } else {
    // En vista libre, NO forzar posición ni target para que el usuario controle libremente
    // Solo actualizar controles para que funcionen los movimientos manuales
    controls.update();
  }
}

async function iniciarAnimacion() {
  if (animacionActiva) return;
  animacionActiva = true;
  detenerAnimacion = false;
  crearNave();
  nave.renderOrder = 998;
  mensajeInicialMostrado = false;
  controls.enabled = false;
  infoPanel.innerHTML =
    "<b>Xing Xing:</b> Hola, soy Xing Xing y seré tu guía virtual durante esta presentación sobre el sistema solar";
  await esperar(4000);
  mensajeInicialMostrado = true;

  for (let i = 0; i < planetData.length; i++) {
    if (detenerAnimacion) break;
    await visitarPlaneta(i);
  }

  if (!detenerAnimacion) {
    infoPanel.innerHTML =
      "<b>Xing Xing:</b> ¡Y este es nuestro sistema solar! Espero que hayas disfrutado del viaje";
    await esperar(4000);
  }

  vistaLibre();
  animacionActiva = false;
  controls.enabled = true;
}

async function visitarPlaneta(i) {
  const planeta = Planetas[i];
  const p = planetData[i];
  if (nave) {
    nave.scale.set(0.1, 0.1, 0.1);
  }
  for (let paso = 0; paso < 150; paso++) {
    if (detenerAnimacion) return;
    const targetPos = planeta.position.clone();
    const camTarget = targetPos.clone().add(new THREE.Vector3(0, 0, 8));
    camera.position.lerp(camTarget, 0.1);
    controls.target.lerp(targetPos, 0.1);
    controls.update();

    // Mover y rotar nave
    if (nave) {
      const offset = new THREE.Vector3(
        Math.cos(paso * 0.1) * 2,
        Math.sin(paso * 0.1) * 2,
        0
      );
      nave.position.copy(targetPos.clone().add(offset));
    }
    infoPanel.innerHTML = `<b>${p.nombre}</b>: ${p.descripcion}`;
    await esperar(50);
  }
  if (detenerAnimacion) return;
}

function crearTextoCanvas(text, color = "white") {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 256;
  canvas.height = 128;
  ctx.font = "28px Arial";
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  return canvas;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animationLoop(time = 0) {
  if (!timestamp) timestamp = time;
  const delta = (time - timestamp) * accglobal;
  timestamp = time;

  actualizarPosiciones(delta);
  moverCamara();

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animationLoop);
}

// Fondo estrellado con partículas
function crearFondoEstrellado(cantidad = 2000) {
  const geometriaEstrellas = new THREE.BufferGeometry();
  const posiciones = [];
  for (let i = 0; i < cantidad; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    posiciones.push(x, y, z);
  }
  geometriaEstrellas.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(posiciones, 3)
  );

  const materialEstrellas = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1,
    sizeAttenuation: true,
  });
  const estrellas = new THREE.Points(geometriaEstrellas, materialEstrellas);
  scene.add(estrellas);
}

function crearNave() {
  if (nave) return;
  const loader = new THREE.TextureLoader();
  const texturaNave = loader.load("src/nave.png");
  const geo = new THREE.PlaneGeometry(16, 16);
  const mat = new THREE.MeshBasicMaterial({
    map: texturaNave,
    transparent: true,
    side: THREE.DoubleSide,
    depthTest: false,
  });
  nave = new THREE.Mesh(geo, mat);
  nave.position.set(0, 0, 8);
  scene.add(nave);
}

function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
