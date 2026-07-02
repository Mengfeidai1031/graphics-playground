import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as TWEEN from "@tweenjs/tween.js";

let scene, renderer, camera, controls;
let character,
  mixer,
  animations = {};
let currentAction = null;
let clock = new THREE.Clock();
let isAnimating = false;

init();
animate();

function init() {
  // Escena
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a1a);
  scene.fog = new THREE.Fog(0x0a0a1a, 10, 50);

  // Cámara
  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 2, 8);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  document.body.appendChild(renderer.domElement);

  // Controles
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2;
  controls.minDistance = 3;
  controls.maxDistance = 15;
  controls.update();

  // Iluminación natural
  const ambientLight = new THREE.AmbientLight(0x808080, 1.8); // Gris medio, natural
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8); // Natural
  directionalLight.position.set(5, 10, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.camera.left = -10;
  directionalLight.shadow.camera.right = 10;
  directionalLight.shadow.camera.top = 10;
  directionalLight.shadow.camera.bottom = -10;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.bias = -0.001;
  scene.add(directionalLight);

  // Luces de colores sutiles para ambiente
  const light1 = new THREE.PointLight(0x00ffff, 1.2, 20);
  light1.position.set(-5, 3, -5);
  scene.add(light1);

  const light2 = new THREE.PointLight(0xff00ff, 1.2, 20);
  light2.position.set(5, 3, -5);
  scene.add(light2);

  const light3 = new THREE.PointLight(0xffff00, 1, 15);
  light3.position.set(0, 5, 5);
  scene.add(light3);

  // Luz frontal suave
  const frontLight = new THREE.DirectionalLight(0xffffff, 1);
  frontLight.position.set(0, 5, 10);
  scene.add(frontLight);

  // Crear suelo
  createFloor();

  // Crear ambiente
  createEnvironment();

  // Cargar personaje
  loadCharacter();

  // Eventos
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("resize", onWindowResize);
}

function createFloor() {
  // Suelo principal
  const floorGeometry = new THREE.CircleGeometry(15, 64);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    roughness: 0.8,
    metalness: 0.2,
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Grid circular
  const divisions = 30;
  const gridHelper = new THREE.PolarGridHelper(
    15,
    divisions,
    divisions,
    64,
    0x00ffff,
    0x004444
  );
  gridHelper.position.y = 0.01;
  scene.add(gridHelper);

  // Líneas decorativas
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const x = Math.cos(angle) * 12;
    const z = Math.sin(angle) * 12;

    const geometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
    const material = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.5,
    });
    const pillar = new THREE.Mesh(geometry, material);
    pillar.position.set(x, 1, z);
    pillar.castShadow = true;
    scene.add(pillar);
  }
}

function createEnvironment() {
  // Esferas flotantes decorativas
  for (let i = 0; i < 12; i++) {
    const geometry = new THREE.SphereGeometry(0.2, 16, 16);
    const material = new THREE.MeshStandardMaterial({
      color: Math.random() > 0.5 ? 0x00ffff : 0xff00ff,
      emissive: Math.random() > 0.5 ? 0x00ffff : 0xff00ff,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2,
    });
    const sphere = new THREE.Mesh(geometry, material);

    const angle = (i / 12) * Math.PI * 2;
    const radius = 10 + Math.random() * 5;
    sphere.position.set(
      Math.cos(angle) * radius,
      2 + Math.random() * 3,
      Math.sin(angle) * radius
    );

    scene.add(sphere);

    // Animación de flotación
    const floatTween = new TWEEN.Tween(sphere.position)
      .to(
        {
          y: sphere.position.y + 0.5 + Math.random() * 0.5,
        },
        2000 + Math.random() * 1000
      )
      .easing(TWEEN.Easing.Sinusoidal.InOut)
      .repeat(Infinity)
      .yoyo(true)
      .start();
  }
}

function loadCharacter() {
  const loader = new GLTFLoader();

  // Modelo divertido de robot expresivo con múltiples animaciones
  // Este robot tiene animaciones muy expresivas y divertidas
  // Incluye: Idle, Walking, Running, Dance, Jump, Yes, No, Wave, Punch, etc.
  const modelURL =
    "https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb";

  loader.load(
    modelURL,
    (gltf) => {
      character = gltf.scene;
      character.scale.set(0.6, 0.6, 0.6); // Tamaño equilibrado
      character.position.set(0, 0, 0);

      // Habilitar sombras y brillo natural
      character.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;

          // Brillo natural y sutil
          if (node.material) {
            node.material.emissive = node.material.color;
            node.material.emissiveIntensity = 0.15; // Brillo sutil
            node.material.metalness = 0.1; // Poco metálico
            node.material.roughness = 0.7; // Más mate
          }
        }
      });

      scene.add(character);

      // Configurar animaciones
      mixer = new THREE.AnimationMixer(character);

      // Crear objeto de animaciones con búsqueda flexible
      const animationMap = {};

      gltf.animations.forEach((clip) => {
        const name = clip.name.toLowerCase();
        const action = mixer.clipAction(clip);

        // Mapear con nombre original
        animationMap[name] = action;

        // Mapear variaciones comunes
        if (name.includes("idle") || name.includes("espera")) {
          animationMap["idle"] = action;
        }
        if (
          name.includes("walk") ||
          name.includes("caminar") ||
          name.includes("andar")
        ) {
          animationMap["walk"] = action;
        }
        if (name.includes("run") || name.includes("correr")) {
          animationMap["run"] = action;
        }
        if (name.includes("jump") || name.includes("salto")) {
          animationMap["jump"] = action;
        }
        if (
          name.includes("dance") ||
          name.includes("bail") ||
          name.includes("dancing")
        ) {
          animationMap["dance"] = action;
        }
      });

      animations = animationMap;

      // Iniciar con idle o la primera animación disponible
      const firstAnim = animations["idle"] || Object.values(animations)[0];
      if (firstAnim) {
        currentAction = firstAnim;
        currentAction.play();
      }

      // Ocultar loading
      document.getElementById("loading").classList.add("hidden");

      console.log("Animaciones disponibles:", Object.keys(animations));
    },
    (xhr) => {
      const percentComplete = (xhr.loaded / xhr.total) * 100;
      console.log(Math.round(percentComplete) + "% cargado");
    },
    (error) => {
      console.error("Error al cargar el modelo:", error);
      document.getElementById("loading").textContent = "ERROR AL CARGAR";

      // Fallback: crear un personaje simple si falla la carga
      createFallbackCharacter();
    }
  );
}

function createFallbackCharacter() {
  // Crear personaje simple si falla la carga del modelo
  const group = new THREE.Group();

  // Cuerpo
  const bodyGeo = new THREE.CapsuleGeometry(0.5, 1, 8, 16);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x00ffff });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 1.5;
  body.castShadow = true;
  group.add(body);

  // Cabeza
  const headGeo = new THREE.SphereGeometry(0.4, 16, 16);
  const headMat = new THREE.MeshStandardMaterial({ color: 0xffcc99 });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 2.5;
  head.castShadow = true;
  group.add(head);

  character = group;
  scene.add(character);

  document.getElementById("loading").classList.add("hidden");
  console.log("Usando personaje de respaldo");
}

function playAnimation(animName, skipIdleReturn = false) {
  if (!mixer) return;

  const newAction = animations[animName.toLowerCase()];
  if (!newAction) {
    console.log(
      `Animación "${animName}" no encontrada. Animaciones disponibles:`,
      Object.keys(animations)
    );
    // Intentar buscar animación similar
    const similar = Object.keys(animations).find((key) =>
      key.includes(animName.toLowerCase())
    );
    if (similar) {
      console.log(`Usando animación similar: ${similar}`);
      playAnimation(similar, skipIdleReturn);
      return;
    }
    return;
  }

  if (currentAction && currentAction !== newAction) {
    currentAction.fadeOut(0.3);
  }

  newAction.reset();
  newAction.fadeIn(0.3);
  newAction.setLoop(THREE.LoopOnce);
  newAction.clampWhenFinished = true;
  newAction.play();

  currentAction = newAction;

  // Solo volver a idle si no es parte de una secuencia
  if (!skipIdleReturn) {
    const onFinished = () => {
      if (animations["idle"]) {
        playAnimationLoop("idle");
      }
      mixer.removeEventListener("finished", onFinished);
    };
    mixer.addEventListener("finished", onFinished);
  }
}

function playAnimationLoop(animName) {
  if (!mixer) return;

  const newAction = animations[animName.toLowerCase()];
  if (!newAction) {
    console.log(
      `Animación "${animName}" no encontrada. Animaciones disponibles:`,
      Object.keys(animations)
    );
    // Intentar buscar animación similar
    const similar = Object.keys(animations).find((key) =>
      key.includes(animName.toLowerCase())
    );
    if (similar) {
      console.log(`Usando animación similar: ${similar}`);
      playAnimationLoop(similar);
      return;
    }
    return;
  }

  if (currentAction && currentAction !== newAction) {
    currentAction.fadeOut(0.3);
  }

  newAction.reset();
  newAction.fadeIn(0.3);
  newAction.setLoop(THREE.LoopRepeat);
  newAction.play();

  currentAction = newAction;
}

function onKeyDown(event) {
  if (isAnimating && event.key !== " ") return;

  switch (event.key) {
    case "1":
      playAnimationLoop("idle");
      break;
    case "2":
      playAnimationLoop("walk");
      break;
    case "3":
      playAnimationLoop("run");
      break;
    case "4":
      playAnimation("jump");
      break;
    case "5":
      playAnimation("dance");
      break;
    case "6":
      runAroundCircle();
      break;
    case "r":
    case "R":
      resetPosition();
      break;
    case " ":
      if (!isAnimating) playSequence();
      break;
  }
}

function runAroundCircle() {
  if (!character || isAnimating) return;

  isAnimating = true;

  // Activar animación de correr - buscar el nombre correcto
  let runAnimName = null;
  if (animations["run"]) {
    runAnimName = "run";
  } else if (animations["running"]) {
    runAnimName = "running";
  } else {
    // Buscar cualquier animación que contenga "run"
    runAnimName = Object.keys(animations).find((k) => k.includes("run"));
  }

  if (runAnimName) {
    playAnimationLoop(runAnimName);
  }

  // Radio del círculo (borde de la plataforma circular)
  const radius = 12;
  const duration = 8000; // 8 segundos para dar la vuelta
  const startAngle = Math.atan2(character.position.z, character.position.x);

  // Animar posición en círculo
  const circleTween = new TWEEN.Tween({ angle: startAngle })
    .to({ angle: startAngle + Math.PI * 2 }, duration)
    .easing(TWEEN.Easing.Linear.None)
    .onUpdate((coords) => {
      // Calcular nueva posición en círculo
      character.position.x = Math.cos(coords.angle) * radius;
      character.position.z = Math.sin(coords.angle) * radius;

      // Rotar personaje para que mire hacia donde va
      character.rotation.y = coords.angle + Math.PI / 2;
    })
    .onComplete(() => {
      // Volver al centro
      const returnTween = new TWEEN.Tween(character.position)
        .to({ x: 0, z: 0 }, 1500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onComplete(() => {
          // Resetear rotación
          const rotateTween = new TWEEN.Tween(character.rotation)
            .to({ y: 0 }, 500)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onComplete(() => {
              isAnimating = false;
              // Volver a idle
              if (animations["idle"]) {
                playAnimationLoop("idle");
              }
            });
          rotateTween.start();
        });
      returnTween.start();
    });

  circleTween.start();
}

function resetPosition() {
  if (!character) return;

  isAnimating = true;

  const resetTween = new TWEEN.Tween(character.position)
    .to({ x: 0, y: 0, z: 0 }, 1000)
    .easing(TWEEN.Easing.Quadratic.InOut);

  const resetRotation = new TWEEN.Tween(character.rotation)
    .to({ x: 0, y: 0, z: 0 }, 1000)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onComplete(() => {
      isAnimating = false;
      if (animations["idle"]) {
        playAnimationLoop("idle");
      }
    });

  resetTween.start();
  resetRotation.start();
}

function playSequence() {
  if (!mixer) return;

  isAnimating = true;

  // Buscar animaciones disponibles de forma flexible
  const getAnimation = (names) => {
    for (let name of names) {
      if (animations[name]) return name;
      // Buscar parcial
      const found = Object.keys(animations).find((key) => key.includes(name));
      if (found) return found;
    }
    return null;
  };

  const sequence = [
    { anim: getAnimation(["idle", "espera"]), duration: 1500, loop: true },
    {
      anim: getAnimation(["walk", "walking", "caminar"]),
      duration: 2000,
      loop: true,
    },
    {
      anim: getAnimation(["run", "running", "correr"]),
      duration: 2000,
      loop: true,
    },
    {
      anim: getAnimation(["jump", "jumping", "salto"]),
      duration: 2000,
      loop: false,
    },
    {
      anim: getAnimation(["dance", "dancing", "baile"]),
      duration: 3500,
      loop: false,
    },
    { anim: getAnimation(["idle", "espera"]), duration: 1000, loop: true },
  ].filter((step) => step.anim); // Filtrar animaciones no encontradas

  let currentIndex = 0;

  const playNext = () => {
    if (currentIndex >= sequence.length) {
      isAnimating = false;
      return;
    }

    const step = sequence[currentIndex];

    if (step.loop) {
      playAnimationLoop(step.anim);
    } else {
      playAnimation(step.anim, true); // skipIdleReturn = true
    }

    setTimeout(() => {
      currentIndex++;
      playNext();
    }, step.duration);
  };

  playNext();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  if (mixer) {
    mixer.update(delta);
  }

  TWEEN.update();
  controls.update();

  renderer.render(scene, camera);
}
