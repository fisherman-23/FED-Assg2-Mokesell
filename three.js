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
// scene.add(ground);

// Animation parameters
const rotationSpeedX = 0.1;
const rotationSpeedY = 0.1;
const XmaxRotation = Math.PI / 12; // 30 degrees
const YmaxRotation = Math.PI / 6;

// Render Loop
let isRendering = true;

function animate() {
  if (!isRendering) return; // Stop rendering when paused

  requestAnimationFrame(animate);

  if (model) {
    target.x = -mouse.y * YmaxRotation;
    target.y = mouse.x * XmaxRotation;

    model.rotation.x += (target.x - model.rotation.x) * rotationSpeedX;
    model.rotation.y += (target.y - model.rotation.y) * rotationSpeedY;

    // Floating animation
    model.position.y = Math.sin(Date.now() * 0.001) * 0.05;
  }

  renderer.render(scene, camera);
}

function checkDisplay() {
  const style = window.getComputedStyle(canvas);
  const display = style.display;

  if (display === "none") {
    if (isRendering) {
      isRendering = false;
      console.log("Canvas hidden. Rendering paused.");
    }
  } else {
    if (!isRendering) {
      console.log("Canvas visible. Rendering resumed.");
      isRendering = true; // Set *before* calling animate
      animate(); // Ensure animation starts if it was paused
    }
  }
}

// Initial check
checkDisplay();

// Start animation loop (but it might not run immediately if isRendering is false)
animate();

// Observe parent elements (including canvas itself)
const observer = new MutationObserver(checkDisplay);

function observeParents(element) {
  if (!element) return;
  observer.observe(element, {
    attributes: true,
    attributeFilter: ["style", "class"],
  });
  observeParents(element.parentElement);
}

observeParents(canvas); // Start observing from the canvas itself

// Periodically check the display property
function periodicCheck() {
  checkDisplay();
  setTimeout(periodicCheck, 5000); // Check every 2000ms
}

periodicCheck();
