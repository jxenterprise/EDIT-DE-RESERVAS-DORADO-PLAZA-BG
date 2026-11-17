/* =====================================================================
 *  LISTADO DE RESERVAS DP · RECEPCIÓN · HOTEL DORADO PLAZA BOCAGRANDE
 *  tema.js — pone el tema (claro u oscuro) ANTES de pintar la página.
 *
 *  Por qué existe aparte: se carga en el <head> sin «defer» para que la
 *  página nunca «parpadee» en blanco de madrugada cuando toca el modo
 *  noche. Es diminuto a propósito; toda la lógica del tema (botón,
 *  cambio automático por la hora) vive en js/app.js → «Tema».
 *
 *  Reglas (las mismas de app.js, no cambiar solo aquí):
 *   · ajuste guardado «oscuro» o «claro» → ese tema
 *   · «auto» (por defecto) → oscuro de 6:00 p. m. a 6:00 a. m. (hora Colombia)
 *  Depende de: la clave 'reservas-dp-bg:ajustes' de localStorage
 *  y de html[data-tema] en css/estilos.css.
 * ===================================================================== */
(function () {
  'use strict';
  var preferencia = 'auto';
  try {
    var guardado = JSON.parse(localStorage.getItem('reservas-dp-bg:ajustes') || '{}');
    if (guardado && (guardado.tema === 'claro' || guardado.tema === 'oscuro' || guardado.tema === 'auto')) { preferencia = guardado.tema; }
  } catch (e) { /* sin almacenamiento: se usa «auto» */ }
  var tema = preferencia;
  if (preferencia === 'auto') {
    // Colombia es UTC−5 todo el año (no cambia de horario)
    var hora = new Date(Date.now() - 5 * 3600 * 1000).getUTCHours();
    tema = (hora >= 18 || hora < 6) ? 'oscuro' : 'claro';
  }
  document.documentElement.setAttribute('data-tema', tema);
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) { meta.setAttribute('content', tema === 'oscuro' ? '#16120C' : '#FBF8F1'); }
})();
