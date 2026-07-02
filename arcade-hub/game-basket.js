import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as TWEEN from "@tweenjs/tween.js";

let scene, renderer, camera, controls;
let basket,
  foods = [];
let score = 0,
  missed = 0;
let basketSpeed = 0.15;
let keysPressed = {};
let spawnInterval;
let gameStarted = false;
let timeLeft = 60;
let timerInterval;

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb); // Azul cielo

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 15, 8);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableRotate = false;
  controls.enableZoom = false;

  // Luces
  const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0x00ff00, 2, 30);
  pointLight.position.set(0, 10, 0);
  scene.add(pointLight);

  createBasket();
  createGround();

  // Botón START
  const startButton = document.getElementById("start-button");
  startButton.addEventListener("click", () => {
    gameStarted = true;
    startButton.style.display = "none";
    startSpawning();
    startTimer();
  });

  window.addEventListener("keydown", (e) => {
    keysPressed[e.key.toLowerCase()] = true;
    if (e.key === "r" || e.key === "R") resetGame();
  });
  window.addEventListener("keyup", (e) => {
    keysPressed[e.key.toLowerCase()] = false;
  });
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function createBasket() {
  const basketGroup = new THREE.Group();

  // Base
  const baseGeometry = new THREE.BoxGeometry(2, 0.2, 2);
  const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  basketGroup.add(base);

  // Paredes
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xa0522d });
  const walls = [
    { pos: [0, 0.4, 1], size: [2, 0.6, 0.1] },
    { pos: [0, 0.4, -1], size: [2, 0.6, 0.1] },
    { pos: [1, 0.4, 0], size: [0.1, 0.6, 2] },
    { pos: [-1, 0.4, 0], size: [0.1, 0.6, 2] },
  ];

  walls.forEach((wall) => {
    const geometry = new THREE.BoxGeometry(...wall.size);
    const mesh = new THREE.Mesh(geometry, wallMaterial);
    mesh.position.set(...wall.pos);
    basketGroup.add(mesh);
  });

  basketGroup.position.set(0, 0, 0);
  scene.add(basketGroup);
  basket = basketGroup;
}

function createGround() {
  const groundGeometry = new THREE.PlaneGeometry(20, 20);
  const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x90ee90 }); // Verde pasto
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1;
  ground.receiveShadow = true;
  scene.add(ground);
}

function startSpawning() {
  spawnInterval = setInterval(() => {
    if (gameStarted) spawnFood();
  }, 1200);
}

function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--;
    updateUI();

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  gameStarted = false;
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  setTimeout(() => {
    alert(
      `¡Tiempo agotado! Puntuación final: ${score}\nComida perdida: ${missed}`
    );
  }, 500);
}

function spawnFood() {
  const foodTypes = [
    { geometry: new THREE.SphereGeometry(0.3), color: 0xff0000 }, // Manzana
    { geometry: new THREE.SphereGeometry(0.25), color: 0xffa500 }, // Naranja
    { geometry: new THREE.BoxGeometry(0.4, 0.4, 0.4), color: 0xffff00 }, // Queso
    { geometry: new THREE.ConeGeometry(0.3, 0.5), color: 0xff69b4 }, // Helado
  ];

  const foodType = foodTypes[Math.floor(Math.random() * foodTypes.length)];
  const material = new THREE.MeshStandardMaterial({
    color: foodType.color,
    emissive: foodType.color,
    emissiveIntensity: 0.3,
  });

  const food = new THREE.Mesh(foodType.geometry, material);
  const x = (Math.random() - 0.5) * 8;
  food.position.set(x, 15, 0);
  food.castShadow = true;
  scene.add(food);
  foods.push(food);

  // Animación de caída
  const fallTween = new TWEEN.Tween(food.position)
    .to({ y: -1 }, 3000)
    .easing(TWEEN.Easing.Quadratic.In)
    .onUpdate(() => {
      checkCatch(food);
    })
    .onComplete(() => {
      if (food.userData.caught !== true) {
        missed++;
        updateUI();
      }
      scene.remove(food);
      foods = foods.filter((f) => f !== food);
    });

  const rotateTween = new TWEEN.Tween(food.rotation)
    .to({ y: Math.PI * 4 }, 3000)
    .easing(TWEEN.Easing.Linear.None);

  fallTween.start();
  rotateTween.start();
}

function checkCatch(food) {
  if (food.userData.caught) return;

  const foodBox = new THREE.Box3().setFromObject(food);
  const basketBox = new THREE.Box3().setFromObject(basket);

  if (
    foodBox.intersectsBox(basketBox) &&
    food.position.y < 0.5 &&
    food.position.y > -0.5
  ) {
    food.userData.caught = true;
    score++;
    updateUI();

    // Efecto visual
    food.material.emissiveIntensity = 1;
    setTimeout(() => {
      scene.remove(food);
      foods = foods.filter((f) => f !== food);
    }, 200);
  }
}

function updateBasket() {
  if (keysPressed["arrowleft"] || keysPressed["a"]) {
    basket.position.x -= basketSpeed;
  }
  if (keysPressed["arrowright"] || keysPressed["d"]) {
    basket.position.x += basketSpeed;
  }

  basket.position.x = THREE.MathUtils.clamp(basket.position.x, -7, 7);
}

function updateUI() {
  document.querySelector("#score").textContent = `COMIDA: ${score}`;
  document.querySelector(
    "#ui div:nth-child(2)"
  ).textContent = `PERDIDA: ${missed}`;
  document.querySelector("#timer").textContent = `TIEMPO: ${timeLeft}s`;
}

function resetGame() {
  gameStarted = false;
  score = 0;
  missed = 0;
  timeLeft = 60;
  foods.forEach((food) => scene.remove(food));
  foods = [];
  basket.position.x = 0;
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  updateUI();

  // Mostrar botón START nuevamente
  const startButton = document.getElementById("start-button");
  if (startButton) startButton.style.display = "block";
}

function animate() {
  requestAnimationFrame(animate);
  updateBasket();
  TWEEN.update();
  renderer.render(scene, camera);
}
