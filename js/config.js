// Cambiar MODEL_URL para apuntar a un bucket de Cloud Storage en producción
// (ver Arquiectura_Recomendada.png: Storage Cloud separado de Cloud Run).
export const MODEL_URL = './assets/optimized/Max_FCV.glb';

export const THREE_VERSION = '0.185.1';
export const DRACO_DECODER_PATH = `https://unpkg.com/three@${THREE_VERSION}/examples/jsm/libs/draco/`;
