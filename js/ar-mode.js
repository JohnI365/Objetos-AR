import * as THREE from 'three';
import { ARButton } from 'three/addons/webxr/ARButton.js';
import { loadModel, normalizeAndPlaceModel } from './model-loader.js';

export async function isArSupported() {
  if (!('xr' in navigator)) return false;
  try {
    return await navigator.xr.isSessionSupported('immersive-ar');
  } catch {
    return false;
  }
}

export async function startArExperience(onProgress) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene(); // scene.background queda null => passthrough de cámara
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
  scene.add(camera); // necesario para que lo que cuelgue de la cámara se renderice

  scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.0));
  // La luz direccional cuelga de la cámara para que el objeto se vea siempre
  // bien iluminado sin importar hacia dónde apunte el teléfono.
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
  dirLight.position.set(0.5, 1, 0.25);
  camera.add(dirLight);

  // El botón de ARButton se crea de inmediato: es el que dispara el permiso
  // de cámara/sesión AR del navegador al tocarlo.
  document.body.appendChild(ARButton.createButton(renderer));

  // Sin retícula ni toque para colocar: el modelo aparece anclado frente a
  // la cámara apenas termina de cargar, sin pedirle nada más al usuario.
  const { scene: modelScene } = await loadModel(onProgress);
  normalizeAndPlaceModel(modelScene, 0.5); // ~50cm, tamaño "objeto de mesa", base en y=0
  modelScene.position.y -= 0.15; // ~75cm al frente, un poco abajo del centro de la vista
  modelScene.position.z -= 0.75;
  camera.add(modelScene);

  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
