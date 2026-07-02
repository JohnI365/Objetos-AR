import * as THREE from 'three';

// Reimplementación manual del antiguo three.js/examples/jsm/controls/
// DeviceOrientationControls.js, removido de three.js por deprecado.
// Convierte alpha/beta/gamma del evento `deviceorientation` + el ángulo de
// orientación de pantalla en un quaternion aplicado a la cámara.
const ZEE = new THREE.Vector3(0, 0, 1);
const EULER = new THREE.Euler();
const Q0 = new THREE.Quaternion();
const Q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // -PI/2 alrededor de X

export class DeviceOrientationControls {
  constructor(camera) {
    this.camera = camera;
    this.camera.rotation.reorder('YXZ');
    this.enabled = true;
    this.deviceOrientation = {};
    this.screenOrientation = screen.orientation?.angle ?? window.orientation ?? 0;

    this._onDeviceOrientation = (event) => {
      this.deviceOrientation = event;
    };
    this._onScreenOrientation = () => {
      this.screenOrientation = screen.orientation?.angle ?? window.orientation ?? 0;
    };

    window.addEventListener('orientationchange', this._onScreenOrientation);
    window.addEventListener('deviceorientation', this._onDeviceOrientation);
  }

  update() {
    if (!this.enabled) return;

    const d = this.deviceOrientation;
    const alpha = d.alpha ? THREE.MathUtils.degToRad(d.alpha) : 0;
    const beta = d.beta ? THREE.MathUtils.degToRad(d.beta) : 0;
    const gamma = d.gamma ? THREE.MathUtils.degToRad(d.gamma) : 0;
    const orient = THREE.MathUtils.degToRad(this.screenOrientation);

    EULER.set(beta, alpha, -gamma, 'YXZ');
    this.camera.quaternion.setFromEuler(EULER);
    this.camera.quaternion.multiply(Q1);
    this.camera.quaternion.multiply(Q0.setFromAxisAngle(ZEE, -orient));
  }

  dispose() {
    window.removeEventListener('orientationchange', this._onScreenOrientation);
    window.removeEventListener('deviceorientation', this._onDeviceOrientation);
  }
}
