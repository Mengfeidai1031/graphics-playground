import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as TWEEN from "@tweenjs/tween.js";

let scene, renderer, camera, controls;
let boxes = [];
let currentBox = null;
let height = 0;
let direction = 1;
let boxSize = 2;
let precision = 100;
let gameOver = false;
let gameStarted = false;

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9370db); // Morado medio

  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(5, 8, 10);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Luces
  const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
  directionalLight.position.set(5, 15, 5);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  const pointLight = new THREE.PointLight(0xff00ff, 2, 20);
  pointLight.position.set(0, 10, 0);
  scene.add(pointLight);

  createBase();

  // Botón START
  const startButton = document.getElementById("start-button");
  startButton.addEventListener("click", () => {
    gameStarted = true;
    startButton.style.display = "none";
    createNewBox();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === " " && !gameOver && gameStarted) dropBox();
    if (e.key === "r" || e.key === "R") resetGame();
  });
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function createBase() {
  const geometry = new THREE.BoxGeometry(4, 0.5, 4);
  const material = new THREE.MeshStandardMaterial({ color: 0x2a1a3a });
  const base = new THREE.Mesh(geometry, material);
  base.position.y = -0.25;
  base.receiveShadow = true;
  scene.add(base);
  boxes.push(base);
}

function createNewBox() {
  if (!gameStarted) return;

  const colors = [0xff0066, 0x00ff66, 0x6600ff, 0xffff00, 0x00ffff, 0xff00ff];
  const color = colors[boxes.length % colors.length];

  const geometry = new THREE.BoxGeometry(boxSize, 0.5, boxSize);
  const material = new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 0.3,
  });

  currentBox = new THREE.Mesh(geometry, material);

  // Posición inicial alternando entre X y Z
  const startPos = boxes.length % 2 === 0 ? -5 : 5;
  const axis = boxes.length % 2 === 0 ? "x" : "z";

  if (axis === "x") {
    currentBox.position.set(startPos, height + 0.5, 0);
  } else {
    currentBox.position.set(0, height + 0.5, startPos);
  }

  currentBox.castShadow = true;
  scene.add(currentBox);

  // Animación de movimiento
  const targetPos = startPos * -1;
  const moveTween = new TWEEN.Tween(currentBox.position)
    .to(axis === "x" ? { x: targetPos } : { z: targetPos }, 2000)
    .easing(TWEEN.Easing.Linear.None)
    .repeat(Infinity)
    .yoyo(true)
    .start();

  currentBox.userData.tween = moveTween;
  currentBox.userData.axis = axis;
}

function dropBox() {
  if (!currentBox || gameOver) return;

  currentBox.userData.tween.stop();

  const lastBox = boxes[boxes.length - 1];
  const overlap = calculateOverlap(currentBox, lastBox);

  if (overlap > 0.2) {
    // Éxito - la caja se queda
    height += 0.5;
    boxes.push(currentBox);

    // Calcular precisión
    const overlapPercent = (overlap / boxSize) * 100;
    precision = Math.round((precision + overlapPercent) / 2);

    updateUI();

    // Verificar victoria (21 cajas = 20 apiladas + 1 base)
    if (boxes.length >= 21) {
      gameOver = true;
      setTimeout(() => {
        alert(
          `¡Has completado la torre con ${
            boxes.length - 1
          } cajas!\nPrecisión final: ${precision}%`
        );
      }, 500);
      return;
    }

    // Ajustar cámara
    const camTween = new TWEEN.Tween(camera.position)
      .to({ y: camera.position.y + 0.5 }, 500)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();

    // Crear nueva caja
    setTimeout(() => {
      if (!gameOver) createNewBox();
    }, 300);
  } else {
    // Fallo - la caja cae
    gameOver = true;

    const fallTween = new TWEEN.Tween(currentBox.position)
      .to({ y: -10 }, 1500)
      .easing(TWEEN.Easing.Quadratic.In)
      .start();

    const rotateTween = new TWEEN.Tween(currentBox.rotation)
      .to({ x: Math.PI * 2, z: Math.PI * 2 }, 1500)
      .easing(TWEEN.Easing.Quadratic.In)
      .start();

    setTimeout(() => {
      alert(`¡Juego terminado! Altura alcanzada: ${boxes.length - 1} cajas`);
    }, 1000);
  }
}

function calculateOverlap(box1, box2) {
  const box1Min = box1.position.x - boxSize / 2;
  const box1Max = box1.position.x + boxSize / 2;
  const box2Min = box2.position.x - boxSize / 2;
  const box2Max = box2.position.x + boxSize / 2;

  const overlapX = Math.min(box1Max, box2Max) - Math.max(box1Min, box2Min);

  const box1MinZ = box1.position.z - boxSize / 2;
  const box1MaxZ = box1.position.z + boxSize / 2;
  const box2MinZ = box2.position.z - boxSize / 2;
  const box2MaxZ = box2.position.z + boxSize / 2;

  const overlapZ = Math.min(box1MaxZ, box2MaxZ) - Math.max(box1MinZ, box2MinZ);

  return Math.min(overlapX, overlapZ);
}

function updateUI() {
  document.querySelector("#score").textContent = `ALTURA: ${
    boxes.length - 1
  }/20`;
  document.querySelector(
    "#ui div:nth-child(2)"
  ).textContent = `PRECISIÓN: ${precision}%`;
}

function resetGame() {
  gameOver = false;
  gameStarted = false;
  height = 0;
  precision = 100;

  if (currentBox) {
    if (currentBox.userData.tween) currentBox.userData.tween.stop();
    scene.remove(currentBox);
  }

  boxes.slice(1).forEach((box) => scene.remove(box));
  boxes = boxes.slice(0, 1);

  camera.position.set(5, 8, 10);
  updateUI();

  // Mostrar botón START nuevamente
  const startButton = document.getElementById("start-button");
  if (startButton) startButton.style.display = "block";
}

function animate() {
  requestAnimationFrame(animate);
  TWEEN.update();
  controls.update();
  renderer.render(scene, camera);
}
