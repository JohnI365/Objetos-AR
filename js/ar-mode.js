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

  scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.0));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
  dirLight.position.set(0.5, 1, 0.25);
  scene.add(dirLight);

  // Retícula: indica dónde se colocará el objeto sobre la superficie detectada
  const reticle = new THREE.Mesh(
    new THREE.RingGeometry(0.06, 0.08, 32).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0x4f7cff })
  );
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add(reticle);

  // El botón de ARButton se crea de inmediato: es el que dispara el permiso
  // de cámara/sesión AR del navegador al tocarlo, en paralelo con la carga
  // del modelo (que corre de fondo mientras el usuario concede el permiso).
  document.body.appendChild(
    ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] })
  );

  let modelScene = null;
  let placementPendiente = null;
  loadModel(onProgress).then((gltf) => {
    modelScene = gltf.scene;
    normalizeAndPlaceModel(modelScene, 0.5); // ~50cm, tamaño "objeto de mesa"
    modelScene.visible = false;
    scene.add(modelScene);

    // El usuario pudo haber tocado para colocar el objeto antes de que
    // terminara de cargar; aplicamos esa colocación pendiente ahora.
    if (placementPendiente) {
      modelScene.position.setFromMatrixPosition(placementPendiente);
      modelScene.quaternion.setFromRotationMatrix(placementPendiente);
      modelScene.visible = true;
    }
  });

  let placed = false;
  const controller = renderer.xr.getController(0);
  controller.addEventListener('select', () => {
    if (!reticle.visible || placed) return;
    placed = true;
    if (modelScene) {
      modelScene.position.setFromMatrixPosition(reticle.matrix);
      modelScene.quaternion.setFromRotationMatrix(reticle.matrix);
      modelScene.visible = true;
    } else {
      // El modelo aún no termina de cargar: recordamos la pose y lo
      // colocamos apenas esté listo (ver arriba).
      placementPendiente = reticle.matrix.clone();
    }
  });
  scene.add(controller);

  let hitTestSource = null;
  let hitTestSourceRequested = false;

  renderer.setAnimationLoop((_, frame) => {
    if (frame) {
      const referenceSpace = renderer.xr.getReferenceSpace();
      const session = renderer.xr.getSession();

      if (!hitTestSourceRequested) {
        session.requestReferenceSpace('viewer').then((viewerSpace) => {
          session.requestHitTestSource({ space: viewerSpace }).then((source) => {
            hitTestSource = source;
          });
        });
        session.addEventListener('end', () => {
          hitTestSourceRequested = false;
          hitTestSource = null;
        });
        hitTestSourceRequested = true;
      }

      if (hitTestSource) {
        const results = frame.getHitTestResults(hitTestSource);
        if (results.length && !placed) {
          reticle.visible = true;
          reticle.matrix.fromArray(results[0].getPose(referenceSpace).transform.matrix);
        } else if (!results.length) {
          reticle.visible = false;
        }
      }
    }
    renderer.render(scene, camera);
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
