/**
 * Adaptado de 0_Mapa_AR/frontend/js/confetti-effect.js.
 * Pequeño wrapper sobre canvas-confetti para mantener la animación
 * de bienvenida desacoplada de la lógica de la pantalla.
 * Se carga via CDN en index.html como `window.confetti`.
 */

export function lanzarConfettiBienvenida() {
  if (typeof window.confetti !== "function") {
    console.warn("canvas-confetti no está disponible todavía.");
    return;
  }

  const duracionMs = 2500;
  const finAt = Date.now() + duracionMs;

  const colores = ["#4f7cff", "#7b5cff", "#ffb84f", "#ffffff"];

  (function disparo() {
    window.confetti({
      particleCount: 4,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.6 },
      colors: colores,
    });
    window.confetti({
      particleCount: 4,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.6 },
      colors: colores,
    });

    if (Date.now() < finAt) {
      requestAnimationFrame(disparo);
    }
  })();

  // Ráfaga inicial más densa, centrada arriba.
  window.confetti({
    particleCount: 90,
    spread: 100,
    origin: { y: 0.3 },
    colors: colores,
  });
}
