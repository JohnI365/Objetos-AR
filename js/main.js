import { isArSupported, startArExperience } from './ar-mode.js';
import { startFallbackExperience } from './fallback-mode.js';
import { lanzarConfettiBienvenida } from './confetti-effect.js';

// Efecto de aparición + confetti de bienvenida, apenas carga la pantalla de
// inicio (mismo timing que 0_Demo/demo.html).
setTimeout(() => {
  document.querySelector('.welcome-card')?.classList.add('visible');
  document.querySelector('.pop-boton')?.classList.add('visible');
  lanzarConfettiBienvenida();
}, 500);

const pantallaInicio = document.getElementById('pantalla-inicio');
const overlayCargando = document.getElementById('overlay-cargando');
const textoProgreso = document.getElementById('texto-progreso');
const contenedor = document.getElementById('contenedor-escena-3d');
const botonIniciar = document.getElementById('boton-iniciar');

botonIniciar.addEventListener('click', async () => {
  botonIniciar.disabled = true;
  pantallaInicio.classList.add('oculto');
  overlayCargando.classList.remove('oculto');

  const onProgress = (f) => {
    textoProgreso.textContent = `Cargando modelo 3D... ${Math.round(f * 100)}%`;
  };

  try {
    const arSupported = await isArSupported();

    if (arSupported) {
      await startArExperience(onProgress);
    } else {
      contenedor.classList.remove('oculto');
      await startFallbackExperience(contenedor, onProgress);
    }
  } catch (err) {
    console.error('Error iniciando la experiencia AR:', err);
    textoProgreso.textContent = 'Ocurrió un error al cargar la experiencia. Intenta recargar la página.';
    return;
  }

  overlayCargando.classList.add('oculto');
});
