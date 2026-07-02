import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DeviceOrientationControls } from './device-orientation-controls.js';
import { solicitarPermisoGiroscopio } from './gyro-permission.js';
import { loadModel, normalizeAndPlaceModel } from './model-loader.js';

// Escucha el primer evento `deviceorientation` real con datos no nulos.
// En laptop/desktop nunca llega ninguno, así que resuelve `false` tras el
// timeout y se usa OrbitControls en su lugar.
function detectDeviceOrientationAvailable(timeoutMs = 1500) {
  return new Promise((resolve) => {
    if (typeof window.DeviceOrientationEvent === 'undefined') {
      resolve(false);
      return;
    }
    let done = false;
    const handler = (e) => {
      if (e.alpha !== null || e.beta !== null || e.gamma !== null) {
        done = true;
        window.removeEventListener('deviceorientation', handler);
        resolve(true);
      }
    };
    window.addEventListener('deviceorientation', handler);
    setTimeout(() => {
      if (!done) {
        window.removeEventListener('deviceorientation', handler);
        resolve(false);
      }
    }, timeoutMs);
  });
}

export async function startFallbackExperience(container, onProgress) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0f1a); // sin cámara real, fondo sólido
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.0));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
  dirLight.position.set(0.5, 1, 0.25);
  scene.add(dirLight);

  const { scene: modelScene } = await loadModel(onProgress);
  normalizeAndPlaceModel(modelScene, 1.0);
  modelScene.position.set(0, -0.5, -2); // ~2 metros al frente
  scene.add(modelScene);

  // iOS 13+: pedir permiso explícito de giroscopio con el overlay ya probado
  const permisoConcedido = await solicitarPermisoGiroscopio();
  const hayGiroscopioReal = permisoConcedido && (await detectDeviceOrientationAvailable());

  let controls;
  if (hayGiroscopioReal) {
    controls = new DeviceOrientationControls(camera);
  } else {
    // Escritorio / dispositivos sin sensores: orbit manual para pruebas
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, -0.5, -2);
    controls.enablePan = false;
  }

  renderer.setAnimationLoop(() => {
    controls.update();
    renderer.render(scene, camera);
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
