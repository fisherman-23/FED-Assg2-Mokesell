/**
 * @fileoverview
 * This script handles the rendering of a 3D model on the canvas element. It uses the Three.js library to load a GLB model, set up lighting, and handle mouse movement for rotation.
 * The model rotates based on the mouse position, and the rotation is smoothed for a more visually appealing effect.
 * The script also includes logic to pause rendering when the canvas is hidden and resume rendering when it becomes visible again.
 * @author Jing Shun, Rafe
 */

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
const rotationSpeed = 0.1;
var XmaxRotation = Math.PI / 12; // 30 degrees
var YmaxRotation = Math.PI / 6;
var rotationSpeedX = 0.1; // Smoothing factor for X rotation
var rotationSpeedY = 0.1; // Smoothing factor for Y rotation;

// Render Loop
let isRendering = true;

function animate() {
  if (!isRendering) return; // Stop rendering when paused

  requestAnimationFrame(animate);

  if (model) {
    // Calculate target rotation based on mouse position
    target.x = -mouse.y * YmaxRotation; // Invert Y-axis for correct orientation
    target.y = mouse.x * XmaxRotation;
    let targetXmaxRotation = Math.PI / 12;
    // Smoothly adjust XmaxRotation based on condition
    if (target.y > -0.3) {
      targetXmaxRotation = Math.PI / 1.5;
    } else {
      targetXmaxRotation = Math.PI / 12;
    }
    XmaxRotation += (targetXmaxRotation - XmaxRotation) * 0.05; // Smooth transition

    // Smoothly interpolate current rotation to target rotation
    if (model.rotation.y > 1) {
      target.x = -target.x;
    }
    model.rotation.x += (target.x - model.rotation.x) * rotationSpeedX;
    model.rotation.y += (target.y - model.rotation.y) * rotationSpeedY;
    // Optional: Add a gentle floating animation
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
