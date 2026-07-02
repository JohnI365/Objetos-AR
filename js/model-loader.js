import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { MODEL_URL, DRACO_DECODER_PATH } from './config.js';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath(DRACO_DECODER_PATH);

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// Max_FCV.glb no tiene animaciones/skeleton, así que `animations` estará
// vacío. Se retorna igual para que agregar un THREE.AnimationMixer a futuro
// (con un modelo animado) sea un cambio trivial en el módulo que consuma esto.
export function loadModel(onProgress) {
  return new Promise((resolve, reject) => {
    gltfLoader.load(
      MODEL_URL,
      (gltf) => {
        fixMaterials(gltf.scene);
        resolve({ scene: gltf.scene, animations: gltf.animations });
      },
      (xhr) => {
        if (onProgress && xhr.lengthComputable) onProgress(xhr.loaded / xhr.total);
      },
      (err) => reject(err)
    );
  });
}

// El modelo solo trae baseColorTexture (sin mapas PBR). Si quedó con
// metalness alto por defecto se ve casi negro sin un environment map, así
// que se fuerza a un acabado "pintado" simple.
function fixMaterials(object3D) {
  object3D.traverse((child) => {
    if (child.isMesh && child.material) {
      child.material.metalness = 0;
      child.material.roughness = 0.85;
    }
  });
}

// Escala el modelo a targetSize metros (dimensión máxima) y lo asienta en
// y=0, centrado en x/z. Útil tanto para el hit-test de AR como para el
// anclaje fijo del modo fallback.
export function normalizeAndPlaceModel(object3D, targetSize) {
  let box = new THREE.Box3().setFromObject(object3D);
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  object3D.scale.setScalar(targetSize / maxDim);

  box = new THREE.Box3().setFromObject(object3D); // recalcular tras escalar
  const center = new THREE.Vector3();
  box.getCenter(center);
  object3D.position.x -= center.x;
  object3D.position.z -= center.z;
  object3D.position.y -= box.min.y; // base apoyada en y=0
}
