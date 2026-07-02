import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as TWEEN from "@tweenjs/tween.js";

let scene, renderer, camera, controls;
let pins = [];
let ball = null;
let ballInMotion = false;
let score = 10;
let throws = 0;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let gameStarted = false;

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x4a5568); // Fondo gris más claro
  scene.fog = new THREE.Fog(0x4a5568, 20, 60);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 5, 15);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, -10);
  controls.maxPolarAngle = Math.PI / 2.2;
  controls.enableDamping = true;
  controls.update();

  // Luces
  const ambientLight = new THREE.AmbientLight(0x404050, 1);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
  directionalLight.position.set(5, 15, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);

  const pointLight1 = new THREE.PointLight(0x00ffff, 2, 30);
  pointLight1.position.set(0, 10, -15);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0xff00ff, 2, 30);
  pointLight2.position.set(0, 10, 5);
  scene.add(pointLight2);

  createLane();
  createPins();
  createBall();

  // Botón START
  const startButton = document.getElementById("start-button");
  startButton.addEventListener("click", (e) => {
    e.stopPropagation(); // Evitar que se propague el click
    gameStarted = true;
    startButton.style.display = "none";
  });

  // Click para lanzar bola (no en el botón)
  renderer.domElement.addEventListener("click", onMouseClick);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("resize", onWindowResize);
}

function createLane() {
  // Pista de bolos
  const laneGeometry = new THREE.BoxGeometry(3, 0.2, 30);
  const laneMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b7355, // Marrón madera
    roughness: 0.3,
    metalness: 0.1,
  });
  const lane = new THREE.Mesh(laneGeometry, laneMaterial);
  lane.position.set(0, 0, -7.5);
  lane.receiveShadow = true;
  scene.add(lane);

  // Bordes
  for (let side of [-1.6, 1.6]) {
    const borderGeometry = new THREE.BoxGeometry(0.2, 1, 30);
    const borderMaterial = new THREE.MeshStandardMaterial({
      color: 0x3b82f6, // Azul brillante
      emissive: 0x3b82f6,
      emissiveIntensity: 0.3,
    });
    const border = new THREE.Mesh(borderGeometry, borderMaterial);
    border.position.set(side, 0.5, -7.5);
    border.castShadow = true;
    scene.add(border);
  }

  // Línea de lanzamiento
  const lineGeometry = new THREE.BoxGeometry(3, 0.05, 0.1);
  const lineMaterial = new THREE.MeshStandardMaterial({
    color: 0xffff00,
    emissive: 0xffff00,
    emissiveIntensity: 0.5,
  });
  const line = new THREE.Mesh(lineGeometry, lineMaterial);
  line.position.set(0, 0.15, 5);
  scene.add(line);

  // Suelo
  const floorGeometry = new THREE.PlaneGeometry(50, 50);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x6b7280, // Gris medio
    roughness: 0.9,
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.1;
  floor.receiveShadow = true;
  scene.add(floor);
}

function createPins() {
  const pinGeometry = new THREE.CylinderGeometry(0.15, 0.2, 1, 12);
  const pinMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.3,
    metalness: 0.2,
  });

  // Formación triangular de bolos
  const positions = [
    [0, -20], // Fila 1
    [-0.4, -21],
    [0.4, -21], // Fila 2
    [-0.8, -22],
    [0, -22],
    [0.8, -22], // Fila 3
    [-1.2, -23],
    [-0.4, -23],
    [0.4, -23],
    [1.2, -23], // Fila 4
  ];

  positions.forEach(([x, z]) => {
    const pin = new THREE.Mesh(pinGeometry, pinMaterial.clone());
    pin.position.set(x, 0.6, z);
    pin.castShadow = true;
    pin.receiveShadow = true;
    pin.userData.standing = true;
    pin.userData.originalPos = pin.position.clone();
    pins.push(pin);
    scene.add(pin);
  });
}

function createBall() {
  const ballGeometry = new THREE.SphereGeometry(0.3, 32, 32);
  const ballMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0066,
    roughness: 0.2,
    metalness: 0.8,
  });
  ball = new THREE.Mesh(ballGeometry, ballMaterial);
  ball.position.set(0, 0.4, 3);
  ball.castShadow = true;
  scene.add(ball);
}

function onMouseMove(event) {
  if (ballInMotion || !gameStarted) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);

  if (intersects.length > 0) {
    const point = intersects[0].point;
    ball.position.x = THREE.MathUtils.clamp(point.x, -1.2, 1.2);
  }
}

function onMouseClick(event) {
  if (ballInMotion || !gameStarted) return;

  ballInMotion = true;
  throws++;
  updateUI();

  // Animación de lanzamiento
  const targetZ = -25;
  const duration = 2000;

  const throwTween = new TWEEN.Tween(ball.position)
    .to({ z: targetZ }, duration)
    .easing(TWEEN.Easing.Quadratic.In)
    .onUpdate(() => {
      checkCollisions();
    })
    .onComplete(() => {
      setTimeout(() => {
        resetBall();
      }, 1000);
    });

  // Rotación de la bola
  const rotateTween = new TWEEN.Tween(ball.rotation)
    .to({ x: ball.rotation.x - Math.PI * 10 }, duration)
    .easing(TWEEN.Easing.Linear.None);

  throwTween.start();
  rotateTween.start();
}

function checkCollisions() {
  pins.forEach((pin) => {
    if (!pin.userData.standing) return;

    const distance = ball.position.distanceTo(pin.position);
    if (distance < 0.5) {
      knockDownPin(pin);
    }
  });
}

function knockDownPin(pin) {
  pin.userData.standing = false;
  score--;
  updateUI();

  // Animación de caída
  const fallDirection = new THREE.Vector3()
    .subVectors(pin.position, ball.position)
    .normalize();

  const fallTween = new TWEEN.Tween(pin.rotation)
    .to(
      {
        x: (fallDirection.x * Math.PI) / 2,
        z: (fallDirection.z * Math.PI) / 2,
      },
      500
    )
    .easing(TWEEN.Easing.Bounce.Out);

  const moveTween = new TWEEN.Tween(pin.position)
    .to(
      {
        x: pin.position.x + fallDirection.x * 0.5,
        y: 0.1,
        z: pin.position.z + fallDirection.z * 0.5,
      },
      500
    )
    .easing(TWEEN.Easing.Quadratic.Out);

  fallTween.start();
  moveTween.start();

  // Cambiar color
  pin.material.color.setHex(0x666666);
}

function resetBall() {
  ballInMotion = false;

  const resetTween = new TWEEN.Tween(ball.position)
    .to({ x: 0, y: 0.4, z: 3 }, 1000)
    .easing(TWEEN.Easing.Quadratic.Out);

  const resetRotation = new TWEEN.Tween(ball.rotation)
    .to({ x: 0, y: 0, z: 0 }, 1000)
    .easing(TWEEN.Easing.Quadratic.Out);

  resetTween.start();
  resetRotation.start();

  if (score === 0) {
    setTimeout(() => {
      alert("¡STRIKE! ¡Has derribado todos los bolos!");
      resetGame();
    }, 1500);
  }
}

function resetGame() {
  score = 10;
  throws = 0;

  pins.forEach((pin) => {
    pin.userData.standing = true;
    pin.material.color.setHex(0xffffff);

    const resetTween = new TWEEN.Tween(pin.position).to(
      {
        x: pin.userData.originalPos.x,
        y: pin.userData.originalPos.y,
        z: pin.userData.originalPos.z,
      },
      500
    );

    const resetRotation = new TWEEN.Tween(pin.rotation).to(
      { x: 0, y: 0, z: 0 },
      500
    );

    resetTween.start();
    resetRotation.start();
  });

  updateUI();
}

function updateUI() {
  document.querySelector("#score").textContent = `BOLOS: ${score}`;
  document.querySelector(
    "#ui div:nth-child(2)"
  ).textContent = `LANZAMIENTOS: ${throws}`;
}

function onKeyDown(event) {
  if (event.key === "r" || event.key === "R") {
    resetGame();
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  TWEEN.update();
  controls.update();
  renderer.render(scene, camera);
}
