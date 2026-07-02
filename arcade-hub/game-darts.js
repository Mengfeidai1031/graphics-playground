import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as TWEEN from "@tweenjs/tween.js";

let scene, renderer, camera, controls;
let target,
  darts = [];
let dartsLeft = 10,
  score = 0;
let canThrow = true;
let mouse = new THREE.Vector2();
let gameStarted = false;

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x5a6c7d); // Gris azulado más claro

  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 2, 10);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Luces
  const ambientLight = new THREE.AmbientLight(0x404040, 1);
  scene.add(ambientLight);

  const spotLight = new THREE.SpotLight(0xffffff, 3);
  spotLight.position.set(0, 10, 5);
  spotLight.castShadow = true;
  scene.add(spotLight);

  const backLight = new THREE.PointLight(0xff00ff, 1.5, 20);
  backLight.position.set(0, 5, -5);
  scene.add(backLight);

  createTarget();
  createRoom();

  // Botón START
  const startButton = document.getElementById("start-button");
  startButton.addEventListener("click", (e) => {
    e.stopPropagation(); // Evitar que se propague el click
    gameStarted = true;
    startButton.style.display = "none";
  });

  // Click para lanzar dardo (no en el botón)
  renderer.domElement.addEventListener("click", throwDart);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("keydown", (e) => {
    if (e.key === "r" || e.key === "R") resetGame();
  });
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function createTarget() {
  const targetGroup = new THREE.Group();

  // Anillos de la diana con colores clásicos de diana profesional
  const rings = [
    { radius: 0.4, color: 0xffff00, points: 100 }, // Centro amarillo (bullseye)
    { radius: 0.7, color: 0xff0000, points: 50 }, // Rojo
    { radius: 1.0, color: 0x0000ff, points: 25 }, // Azul
    { radius: 1.3, color: 0x000000, points: 10 }, // Negro
    { radius: 1.6, color: 0xffffff, points: 5 }, // Blanco exterior
  ];

  // Crear anillos desde el más grande al más pequeño
  for (let i = rings.length - 1; i >= 0; i--) {
    const ring = rings[i];
    const geometry = new THREE.CircleGeometry(ring.radius, 32);
    const material = new THREE.MeshStandardMaterial({
      color: ring.color,
      side: THREE.DoubleSide,
      roughness: 0.7,
      metalness: 0.1,
    });
    const circle = new THREE.Mesh(geometry, material);
    circle.userData.points = ring.points;
    circle.userData.radius = ring.radius;
    targetGroup.add(circle);
  }

  targetGroup.position.set(0, 2, -8);
  targetGroup.rotation.y = 0; // Completamente frontal, sin rotación
  scene.add(targetGroup);
  target = targetGroup;
}

function createRoom() {
  // Suelo
  const floorGeometry = new THREE.PlaneGeometry(20, 20);
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x8b7355 }); // Marrón
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Pared trasera
  const wallGeometry = new THREE.PlaneGeometry(20, 10);
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xd4a574 }); // Beige
  const wall = new THREE.Mesh(wallGeometry, wallMaterial);
  wall.position.set(0, 5, -10);
  scene.add(wall);
}

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function throwDart() {
  if (!canThrow || dartsLeft <= 0 || !gameStarted) return;

  canThrow = false;
  dartsLeft--;

  // Crear dardo
  const dartGeometry = new THREE.ConeGeometry(0.05, 0.5, 8);
  const dartMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
  const dart = new THREE.Mesh(dartGeometry, dartMaterial);

  // Posición inicial del dardo en la posición de la cámara
  const startX = mouse.x * 2;
  const startY = 2 + mouse.y * 2;

  dart.position.set(startX, startY, 5);
  dart.rotation.x = Math.PI / 2;
  scene.add(dart);
  darts.push(dart);

  // Animación de lanzamiento - va directo donde apuntas
  const targetX = mouse.x * 1.5; // Reducir factor para mejor precisión
  const targetY = 2 + mouse.y * 1.5; // Reducir factor para mejor precisión

  const throwTween = new TWEEN.Tween(dart.position)
    .to({ x: targetX, y: targetY, z: -7.9 }, 800)
    .easing(TWEEN.Easing.Quadratic.In)
    .onComplete(() => {
      calculateScore(targetX, targetY);
      canThrow = true;
      updateUI();
    });

  throwTween.start();
}

function calculateScore(x, y) {
  const distance = Math.sqrt(x * x + (y - 2) * (y - 2));
  let points = 0;

  if (distance < 0.4) points = 100; // Centro amarillo
  else if (distance < 0.7) points = 50; // Rojo
  else if (distance < 1.0) points = 25; // Azul
  else if (distance < 1.3) points = 10; // Negro
  else if (distance < 1.6) points = 5; // Blanco

  score += points;
}

function updateUI() {
  document.querySelector("#score").textContent = `PUNTOS: ${score}`;
  document.querySelector(
    "#ui div:nth-child(2)"
  ).textContent = `DARDOS: ${dartsLeft}`;

  if (dartsLeft === 0) {
    setTimeout(() => {
      alert(`¡Juego terminado! Puntuación final: ${score}`);
    }, 500);
  }
}

function resetGame() {
  score = 0;
  dartsLeft = 10;
  darts.forEach((dart) => scene.remove(dart));
  darts = [];
  canThrow = true;
  updateUI();
}

function animate() {
  requestAnimationFrame(animate);
  TWEEN.update();
  controls.update();
  renderer.render(scene, camera);
}
