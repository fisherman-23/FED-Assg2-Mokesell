import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// Get canvas element
const canvas = document.querySelector("#canvas");
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
  antialias: true,
  powerPreference: "high-performance",
  precision: "highp",
  stencil: false,
  depth: true,
  logarithmicDepthBuffer: true,
  preserveDrawingBuffer: false,
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Camera setup with correct aspect ratio
const camera = new THREE.PerspectiveCamera(
  75,
  canvas.clientWidth / canvas.clientHeight,
  0.1,
  1000
);
camera.position.set(0.75, 0.5, 0.75);

// Mouse position tracking
const mouse = new THREE.Vector2();
const target = new THREE.Vector2();
let model = null;

// Track mouse movement
function onMouseMove(event) {
  // Calculate mouse position in normalized device coordinates (-1 to +1)
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

window.addEventListener("mousemove", onMouseMove);

// Handle window resize
function onWindowResize() {
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
}

window.addEventListener("resize", onWindowResize);
onWindowResize();

// Lighting Setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffffff, 1);
mainLight.position.set(5, 5, 5);
mainLight.castShadow = true;

mainLight.shadow.mapSize.width = 2048;
mainLight.shadow.mapSize.height = 2048;
mainLight.shadow.camera.near = 0.1;
mainLight.shadow.camera.far = 10;
mainLight.shadow.camera.left = -5;
mainLight.shadow.camera.right = 5;
mainLight.shadow.camera.top = 5;
mainLight.shadow.camera.bottom = -5;
mainLight.shadow.bias = -0.0001;

scene.add(mainLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
fillLight.position.set(-5, 0, -5);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
rimLight.position.set(0, 3, -5);
scene.add(rimLight);

// Load GLB Model
const loader = new GLTFLoader();
loader.load(
  "very_cute_retro_pc_looking_mascot_for_mokesell.glb",
  (gltf) => {
    model = gltf.scene;

    model.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });

    scene.add(model);
    model.position.set(0, 0, 0);
    camera.lookAt(model.position);
  },
  undefined,
  (error) => {
    console.error("An error occurred while loading the GLB model:", error);
  }
);

// Optional ground plane
const groundGeometry = new THREE.PlaneGeometry(10, 10);
const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0xcccccc,
  roughness: 1,
  metalness: 0,
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.5;
ground.receiveShadow = true;
//scene.add(ground);

// Animation parameters
const rotationSpeed = 0.1;
const maxRotation = Math.PI / 6; // 30 degrees

// Render Loop with smooth animation
function animate() {
  requestAnimationFrame(animate);

  if (model) {
    // Calculate target rotation based on mouse position
    target.x = mouse.x * maxRotation;
    target.y = mouse.y * maxRotation;
    console.log(target.x, target.y);

    // Smoothly interpolate current rotation to target rotation
    model.rotation.y += (target.x - model.rotation.y) * rotationSpeed;
    model.rotation.x += (target.y - model.rotation.x) * rotationSpeed;

    // Optional: Add a gentle floating animation
    model.position.y = Math.sin(Date.now() * 0.001) * 0.05;
  }

  renderer.render(scene, camera);
}

animate();
