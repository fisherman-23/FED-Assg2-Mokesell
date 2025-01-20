import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#canvas"),
  alpha: true,
});
renderer.setSize(
  document.querySelector("#canvas").clientWidth,
  document.querySelector("#canvas").clientHeight
);

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0.75, 0.5, 0.75); // Adjust position as needed

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// Load GLB Model
const loader = new GLTFLoader();
loader.load(
  "very_cute_retro_pc_looking_mascot_for_mokesell.glb", // Replace with the actual path to your .glb file
  (gltf) => {
    const model = gltf.scene;
    scene.add(model);
    model.position.set(0, 0, 0); // Adjust model's position if necessary

    // Make the camera look at the model
    camera.lookAt(model.position);
  },
  undefined,
  (error) => {
    console.error("An error occurred while loading the GLB model:", error);
  }
);

// Render Loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
