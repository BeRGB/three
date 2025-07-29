import * as THREE from 'three';
import { gsap } from 'gsap';

const scene = new THREE.Scene();

// Kamera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 5;

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Tekstura
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('/textures/crate.jpg');

// Kocka
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ map: texture });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Svetlo
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(2, 2, 5);
scene.add(light);

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Scroll animacija
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const scrollProgress = scrollY / maxScroll;

  gsap.to(cube.rotation, {
    y: scrollProgress * Math.PI * 4,
    x: scrollProgress * Math.PI * 2,
    duration: 0.3,
    overwrite: true
  });

  gsap.to(camera.position, {
    z: 5 - scrollProgress * 3,
    duration: 0.3,
    overwrite: true
  });
});

// Loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
