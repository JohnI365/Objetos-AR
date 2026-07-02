// Adaptado de 0_Mapa_AR/frontend/js/gyro-permission.js (patrón ya probado
// en producción para pedir permiso de DeviceOrientationEvent en iOS 13+).
export function solicitarPermisoGiroscopio() {
  return new Promise((resolve) => {
    const necesitaPermisoExplicito =
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function';

    if (!necesitaPermisoExplicito) {
      resolve(true);
      return;
    }

    const overlay = document.getElementById('overlay-permiso-giroscopio');
    const boton = document.getElementById('boton-activar-giroscopio');
    overlay.classList.add('visible');

    boton.addEventListener(
      'click',
      async () => {
        let concedido = false;
        try {
          const respuesta = await DeviceOrientationEvent.requestPermission();
          concedido = respuesta === 'granted';
        } catch (err) {
          concedido = false;
        }
        overlay.classList.remove('visible');
        resolve(concedido);
      },
      { once: true }
    );
  });
}
