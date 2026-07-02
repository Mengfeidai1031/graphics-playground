import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";

let scene, renderer, camera;
let targets = [];
let score = 0,
  bullets = 20;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let gameStarted = false;

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x708090); // Gris pizarra

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 2, 10);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Luces
  const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xff0000, 2, 30);
  pointLight.position.set(0, 5, 5);
  scene.add(pointLight);

  createScene();

  // Botón START
  const startButton = document.getElementById("start-button");
  startButton.addEventListener("click", (e) => {
    e.stopPropagation(); // Evitar que se propague el click
    gameStarted = true;
    startButton.style.display = "none";
    spawnTargets();
  });

  // Click para disparar (no en el botón)
  renderer.domElement.addEventListener("click", shoot);
  window.addEventListener("mousemove", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "r" || e.key === "R") resetGame();
  });
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function createScene() {
  // Suelo
  const groundGeometry = new THREE.PlaneGeometry(50, 50);
  const groundMaterial = new THREE.MeshStandardMaterial({ color: 0xb8860b }); // Dorado oscuro
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -2;
  scene.add(ground);

  // Pared trasera
  const wallGeometry = new THREE.PlaneGeometry(30, 15);
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xcd853f }); // Marrón Perú
  const wall = new THREE.Mesh(wallGeometry, wallMaterial);
  wall.position.set(0, 5, -15);
  scene.add(wall);
}

function spawnTargets() {
  for (let i = 0; i < 5; i++) {
    setTimeout(() => createTarget(), i * 1500);
  }
}

function createTarget() {
  const geometry = new THREE.SphereGeometry(0.5, 16, 16);
  const material = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    emissive: 0xff0000,
    emissiveIntensity: 0.5,
  });
  const target = new THREE.Mesh(geometry, material);

  const x = (Math.random() - 0.5) * 10;
  const y = Math.random() * 5 + 2;
  target.position.set(x, y, -12);
  target.userData.active = true;

  scene.add(target);
  targets.push(target);

  // Movimiento lateral
  const direction = Math.random() > 0.5 ? 1 : -1;
  const moveTween = new TWEEN.Tween(target.position)
    .to({ x: target.position.x + direction * 8 }, 3000)
    .easing(TWEEN.Easing.Sinusoidal.InOut)
    .repeat(Infinity)
    .yoyo(true)
    .start();

  // Auto-eliminar después de 20 segundos
  setTimeout(() => {
    if (target.userData.active) {
      scene.remove(target);
      targets = targets.filter((t) => t !== target);
      createTarget(); // Crear nuevo objetivo
    }
  }, 20000);
}

function shoot() {
  if (bullets <= 0 || !gameStarted) return;

  bullets--;
  updateUI();

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(targets);

  if (intersects.length > 0) {
    const target = intersects[0].object;
    if (target.userData.active) {
      hitTarget(target);
    }
  }
}

function hitTarget(target) {
  target.userData.active = false;
  score += 10;
  updateUI();

  // Efecto de explosión
  target.material.color.setHex(0xffff00);
  target.material.emissive.setHex(0xffff00);

  const explodeTween = new TWEEN.Tween(target.scale)
    .to({ x: 2, y: 2, z: 2 }, 200)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onComplete(() => {
      scene.remove(target);
      targets = targets.filter((t) => t !== target);
      createTarget(); // Crear nuevo objetivo
    });

  const fadeTween = new TWEEN.Tween(target.material).to({ opacity: 0 }, 200);

  explodeTween.start();
  fadeTween.start();
}

function updateUI() {
  document.querySelector("#score").textContent = `PUNTOS: ${score}`;
  document.querySelector(
    "#ui div:nth-child(2)"
  ).textContent = `BALAS: ${bullets}`;

  if (bullets === 0) {
    setTimeout(() => {
      alert(`¡Juego terminado! Puntuación: ${score}`);
    }, 500);
  }
}

function resetGame() {
  gameStarted = false;
  score = 0;
  bullets = 20;
  targets.forEach((target) => scene.remove(target));
  targets = [];
  updateUI();

  // Mostrar botón START nuevamente
  const startButton = document.getElementById("start-button");
  if (startButton) startButton.style.display = "block";
}

function animate() {
  requestAnimationFrame(animate);
  TWEEN.update();
  renderer.render(scene, camera);
}
