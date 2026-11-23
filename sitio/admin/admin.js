/* =====================================================================
 *  EDITADOR DE RESERVAS DP · ADMINISTRACIÓN (v1.21)
 *  admin/admin.js — todo lo que se mueve en /admin (SOLO el administrador).
 *
 *  JX (21 nov 2026): «ese acceso admin (solo el mío) agregarlo mejor aparte de la web como …/admin…
 *  solamente esta partecita y más nada… una web index aparte, carpeta admin y todo».
 *  Aquí quedó lo que antes era la sección «Administración» de la web principal (js/app.js):
 *   · Usuarios: crear, nombre, ver contraseña (v1.20), contraseña nueva, permisos, activar / desactivar.
 *   · Quién hizo qué, POR DÍA (v1.21, JX: «el historial mejor por día… lo de ayer se queda cerrado y dice
 *     historial del día tal… uno presiona y se abre»): hoy abierto; los días anteriores cerrados.
 *  Usa la MISMA nube (/api/…), la MISMA sesión (cookie dp_sesion) y las MISMAS reglas que la web principal:
 *  se cierra sola SOLO a las 2 horas sin usar (v1.26; «¿Sigues ahí?» 1 min antes; desde v2.0 cerrar la pestaña
 *  o el navegador ya no la cierra).
 *
 *  OJO (mantenimiento): las ventanitas (preguntar, resultado, confirmar, Deshacer), pedir() y la sesión son
 *  COPIA de las de js/app.js (allá están documentadas). Si se cambia algo allá, cambiarlo aquí también
 *  (CLAUDE.md, «Datos que se repiten»). ES5 a propósito (los PC viejos de recepción).
 *
 *  Módulos: 1 utilidades · 2 almacén · 3 fechas · 4 tema · 5 ventanitas · 6 nube · 7 sesión ·
 *           8 entrar y salir · 9 mi cuenta · 10 usuarios · 11 quién hizo qué por día · 12 arranque
 * ===================================================================== */
(function (window, document) {
  'use strict';

  var nada = function () {};
  var L = window.DoradoLoader || { mostrar: nada, ocultar: nada, mensaje: nada, progreso: nada, seguir: function (p) { return Promise.all(p); } };

  /* ================================================================
   * 1) UTILIDADES
   * ================================================================ */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function plural(n, uno, varios) { return n + ' ' + (n === 1 ? uno : varios); }
  function esObjeto(x) { return !!x && typeof x === 'object' && !Array.isArray(x); }
  function tiene(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
  /** Igual que ReglasListado.limpiar (js/listado.js): sin invisibles ni saltos, un solo espacio. */
  function limpiar(v) {
    if (v == null) { return ''; }
    var s = String(v).replace(/[\u00AD\u200B-\u200F\uFEFF]/g, '')
      .replace(/[\u0000-\u001F\u007F-\u009F\u2028\u2029]/g, ' ').replace(/\s+/g, ' ').trim();
    return /^(undefined|null|nan)$/i.test(s) ? '' : s;
  }
  /** v1.18: SIEMPRE Mayúscula Inicial («jaime valera» → «Jaime Valera»), igual que la nube y que js/app.js. */
  function nombreBonito(t) {
    return String(t || '').toLowerCase().replace(/(^|[\s'-])([a-záéíóúñüàèìòùäëïöç])/g, function (m, a, b) { return a + b.toUpperCase(); });
  }

  /* ================================================================
   * 2) ALMACÉN — las MISMAS claves de la web principal («reservas-dp-bg:…»)
   * ================================================================ */
  var PREFIJO = 'reservas-dp-bg:', memoria = {};
  function leer(k, porDefecto) {
    try {
      var v = window.localStorage.getItem(PREFIJO + k);
      return v ? JSON.parse(v) : porDefecto;
    } catch (e) { return tiene(memoria, k) ? memoria[k] : porDefecto; }
  }
  function guardar(k, v) {
    memoria[k] = v;
    try { window.localStorage.setItem(PREFIJO + k, JSON.stringify(v)); return true; } catch (e) { return false; }
  }
  function sesionLeer(k) { try { return window.sessionStorage.getItem(PREFIJO + k); } catch (e) { return null; } }
  function sesionGuardar(k, v) {
    try { if (v == null) { window.sessionStorage.removeItem(PREFIJO + k); } else { window.sessionStorage.setItem(PREFIJO + k, String(v)); } } catch (e) { /* sin sessionStorage */ }
  }

  /* ================================================================
   * 3) FECHAS — hora de Colombia (UTC−5)
   * ================================================================ */
  var OFFSET = 5 * 3600 * 1000, DIA_MS = 86400000;
  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  function ahora() { return Date.now(); }
  function dos(n) { return (n < 10 ? '0' : '') + n; }
  function diaDe(ms) { return new Date(ms - OFFSET).toISOString().slice(0, 10); }
  function hoyISO() { return diaDe(ahora()); }
  function fechaTexto(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ''); return m ? m[3] + '/' + m[2] + '/' + m[1] : ''; }
  /** «sábado 21/11/2026» */
  function fechaDia(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    return m ? DIAS[new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).getUTCDay()] + ' ' + fechaTexto(iso) : fechaTexto(iso);
  }
  /** «6:03 p. m.» (con espacios que no parten la hora) */
  function horaDe(ms) {
    var d = new Date(ms - OFFSET), h = d.getUTCHours();
    return (h % 12 || 12) + ':' + dos(d.getUTCMinutes()) + (h < 12 ? '\u00A0a.\u00A0m.' : '\u00A0p.\u00A0m.');
  }

  /* ================================================================
   * 4) TEMA — el mismo botón y la misma regla de la web principal (comparten el ajuste «tema»)
   *    v1.27: el tema es de CADA CUENTA (se guarda en la nube con PUT /api/preferencias; al entrar llega en
   *    usuario.prefs). En la puerta «Entrar», automático. Igual que en js/app.js → «TEMA Y SONIDO DE CADA CUENTA».
   * ================================================================ */
  function ajustesGuardados() { var a = leer('ajustes', {}); return esObjeto(a) ? a : {}; }
  function temaElegido() { var t = ajustesGuardados().tema; return t === 'claro' || t === 'oscuro' ? t : 'auto'; }
  function temaEfectivo() {
    var t = temaElegido();
    if (t !== 'auto') { return t; }
    var h = new Date(ahora() - OFFSET).getUTCHours();
    return (h >= 18 || h < 6) ? 'oscuro' : 'claro';
  }
  function aplicarTema() {
    var t = temaEfectivo(), elegido = temaElegido();
    if (document.documentElement.getAttribute('data-tema') !== t) { document.documentElement.setAttribute('data-tema', t); }
    var meta = $('meta[name="theme-color"]');
    if (meta) { meta.setAttribute('content', t === 'oscuro' ? '#16120C' : '#FBF8F1'); }
    var nombres = { auto: 'automático', claro: 'claro', oscuro: 'noche' };
    $('#btn-tema-texto').textContent = 'Tema: ' + nombres[elegido] + (elegido === 'auto' ? (t === 'oscuro' ? ' (noche)' : ' (día)') : '');
  }
  function eventosTema() {
    $('#btn-tema').addEventListener('click', function () {
      var a = ajustesGuardados();                            // se conservan «casilla» y «apretar» de la web principal
      a.tema = { auto: 'claro', claro: 'oscuro', oscuro: 'auto' }[temaElegido()] || 'auto';
      guardar('ajustes', a); aplicarTema();
      if (nubeActiva()) {                                   // v1.27: de TU cuenta (el sonido se manda igual, para no tocarlo)
        var p = { tema: a.tema, sonido: a.sonido !== false };
        nube.usuario.prefs = p; guardar('nube-usuario', nube.usuario);
        pedir('PUT', 'preferencias', p).then(nada, function (e) { if (e.estado === 401) { sesionVencida(); } });
      }
    });
    setInterval(function () { if (temaElegido() === 'auto') { aplicarTema(); } }, 60000);
    window.addEventListener('storage', function (e) { if (e.key === PREFIJO + 'ajustes') { aplicarTema(); } });   // si se cambia en otra pestaña
  }
  /** v1.27: pone en el equipo el tema y el sonido de la cuenta que entró (o los de la puerta: automático y sonido prendido) */
  function ponerPrefs(p) {
    if (!esObjeto(p)) { return; }
    var a = ajustesGuardados(), tema = p.tema === 'claro' || p.tema === 'oscuro' ? p.tema : 'auto', sonido = p.sonido !== false;
    if (a.tema === tema && (a.sonido !== false) === sonido) { return; }
    a.tema = tema; a.sonido = sonido; guardar('ajustes', a); aplicarTema();
  }

  /* ================================================================
   * 5) VENTANITAS — copia de js/app.js (módulo 11)
   * ================================================================ */
  function cerrarDialogo(sel) { var d = $(sel); if (d.open && d.close) { d.close(); } else { d.removeAttribute('open'); } }
  function abrirDialogo(sel) { var d = $(sel); if (typeof d.showModal === 'function') { if (!d.open) { d.showModal(); } } else { d.setAttribute('open', ''); } }
  function abrirAnimada(dlg) {
    if (dlg.open && dlg.close) { dlg.close(); }
    void dlg.offsetWidth;
    if (typeof dlg.showModal === 'function') { dlg.showModal(); } else { dlg.setAttribute('open', ''); }
  }
  function confirmar(texto, si) {
    return new Promise(function (ok) {
      var dlg = $('#dlg-confirmar');
      $('#conf-texto').textContent = texto;
      $('#conf-si').textContent = si || 'Sí';
      function fin(v) {
        $('#conf-si').removeEventListener('click', alSi); $('#conf-no').removeEventListener('click', alNo); dlg.removeEventListener('cancel', alNo);
        if (dlg.open && dlg.close) { dlg.close(); } else { dlg.removeAttribute('open'); }
        ok(v);
      }
      function alSi() { fin(true); }
      function alNo(e) { if (e && e.preventDefault) { e.preventDefault(); } fin(false); }
      $('#conf-si').addEventListener('click', alSi); $('#conf-no').addEventListener('click', alNo); dlg.addEventListener('cancel', alNo);
      if (typeof dlg.showModal === 'function') { dlg.showModal(); } else { dlg.setAttribute('open', ''); }
      setTimeout(function () { $('#conf-no').focus(); }, 30);
    });
  }
  var PREGUNTA_ESPERA_MS = 500, VENTANITA_SOLA_MS = 8000, finPregunta = null, finResultado = null;
  function cuentaAtras(boton, texto, alFin) {
    var fin = Date.now() + VENTANITA_SOLA_MS;
    function pintar() { boton.textContent = texto + ' (' + Math.max(1, Math.ceil((fin - Date.now()) / 1000)) + ')'; }
    pintar();
    var tSeg = setInterval(pintar, 250), tFin = setTimeout(alFin, VENTANITA_SOLA_MS);
    return function () { clearInterval(tSeg); clearTimeout(tFin); boton.textContent = texto; };
  }
  /** preguntar({ tipo: 'eliminar' | 'salir', titulo, texto, si, no }) → true / false. «Sí» no cuenta el primer 0,5 s; no se cierra sola. */
  function preguntar(op) {
    op = op || {};
    if (finPregunta) { finPregunta(false); }
    return new Promise(function (ok) {
      var dlg = $('#dlg-pregunta'), si = $('#preg-si'), no = $('#preg-no'), desde = Date.now(), tipo = op.tipo === 'salir' ? 'salir' : 'eliminar';
      dlg.setAttribute('data-tipo', tipo);
      $('#preg-titulo').textContent = op.titulo || (tipo === 'salir' ? '¿Salir?' : '¿Eliminar?');
      $('#preg-texto').textContent = op.texto || '';
      $('#preg-texto').hidden = !op.texto;
      si.textContent = op.si || (tipo === 'salir' ? 'Sí, salir' : 'Sí, eliminar');
      si.className = 'boton ' + (tipo === 'salir' ? 'boton--primario' : 'boton--peligro');
      no.textContent = op.no || 'Cancelar';
      function fin(v) {
        if (finPregunta !== fin) { return; }
        finPregunta = null;
        si.removeEventListener('click', alSi); no.removeEventListener('click', alNo);
        dlg.removeEventListener('cancel', alCancelar); dlg.removeEventListener('close', alCerrar);
        if (dlg.open && dlg.close) { dlg.close(); } else { dlg.removeAttribute('open'); }
        ok(v);
      }
      function alSi() { if (Date.now() - desde >= PREGUNTA_ESPERA_MS) { fin(true); } }
      function alNo() { fin(false); }
      function alCancelar(e) { if (e && e.preventDefault) { e.preventDefault(); } fin(false); }
      function alCerrar() { if (!dlg.open) { fin(false); } }
      finPregunta = fin;
      si.addEventListener('click', alSi); no.addEventListener('click', alNo);
      dlg.addEventListener('cancel', alCancelar); dlg.addEventListener('close', alCerrar);
      abrirAnimada(dlg);
      no.focus();
    });
  }
  /** resultado('ok' | 'error' | 'salir', título, texto, clave?): ✓ / ✗ / puerta. Las de éxito se cierran solas a los 8 s;
   *  la ✗ y la que muestra una contraseña esperan a que la persona la cierre. */
  function resultado(tipo, titulo, texto, clave) {
    if (finResultado) { finResultado(); }
    return new Promise(function (ok) {
      var dlg = $('#dlg-resultado'), boton = $('#res-ok'), caja = $('#res-texto');
      dlg.setAttribute('data-tipo', tipo === 'error' || tipo === 'salir' ? tipo : 'ok');
      $('#res-titulo').textContent = titulo;
      caja.textContent = texto || '';
      if (clave) { var c = document.createElement('span'); c.className = 'resultado__clave'; c.textContent = clave; caja.appendChild(document.createTextNode(' ')); caja.appendChild(c); }
      caja.hidden = !texto && !clave;
      var parar = function () {};
      function fin() {
        if (finResultado !== fin) { return; }
        finResultado = null;
        parar();
        boton.removeEventListener('click', fin); dlg.removeEventListener('cancel', alCancelar); dlg.removeEventListener('close', alCerrar);
        if (dlg.open && dlg.close) { dlg.close(); } else { dlg.removeAttribute('open'); }
        ok();
      }
      function alCancelar(e) { if (e && e.preventDefault) { e.preventDefault(); } fin(); }
      function alCerrar() { if (!dlg.open) { fin(); } }
      finResultado = fin;
      boton.addEventListener('click', fin); dlg.addEventListener('cancel', alCancelar); dlg.addEventListener('close', alCerrar);
      abrirAnimada(dlg);
      setTimeout(function () { boton.focus(); }, 30);
      boton.textContent = 'Entendido';
      if (tipo !== 'error' && !clave) { parar = cuentaAtras(boton, 'Entendido', fin); }
    });
  }
  /* «Deshacer» 10 s y aviso flotante */
  var DESHACER_MS = 10000, alDeshacer = null, tDeshacerFin = 0, tDeshacerSeg = 0, tAviso = 0;
  function conDeshacer(texto, fn) {
    var caja = $('#deshacer'), fin = ahora() + DESHACER_MS;
    clearTimeout(tDeshacerFin); clearInterval(tDeshacerSeg);
    alDeshacer = fn;
    $('#deshacer-texto').textContent = texto;
    function contar() { $('#deshacer-btn').textContent = 'Deshacer (' + Math.max(1, Math.ceil((fin - ahora()) / 1000)) + ')'; }
    contar();
    clearTimeout(tAviso); $('#aviso').hidden = true;
    caja.hidden = false; caja.classList.remove('aviso--fuera');
    tDeshacerSeg = setInterval(contar, 250);
    tDeshacerFin = setTimeout(cerrarDeshacer, DESHACER_MS);
  }
  function cerrarDeshacer() {
    var caja = $('#deshacer');
    clearTimeout(tDeshacerFin); clearInterval(tDeshacerSeg);
    alDeshacer = null;
    caja.classList.add('aviso--fuera');
    setTimeout(function () { if (!alDeshacer) { caja.hidden = true; } }, 260);
  }
  function aviso(texto, ms, alerta) {
    var el = $('#aviso');
    if (!$('#deshacer').hidden) { cerrarDeshacer(); }
    el.textContent = texto;
    el.classList.toggle('aviso--alerta', !!alerta);
    el.hidden = false;
    el.classList.remove('aviso--fuera');
    clearTimeout(tAviso);
    tAviso = setTimeout(function () {
      el.classList.add('aviso--fuera');
      tAviso = setTimeout(function () { el.hidden = true; }, 260);
    }, ms || 3200);
  }
  function eventosVentanitas() {
    $('#deshacer-btn').addEventListener('click', function () { var fn = alDeshacer; cerrarDeshacer(); if (fn) { fn(); } });
    /* el ojo: mostrar / ocultar la contraseña */
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ojo]');
      if (!b) { return; }
      var campo = $('#' + b.getAttribute('data-ojo')), ver = campo.type === 'password';
      campo.type = ver ? 'text' : 'password';
      b.setAttribute('aria-pressed', ver ? 'true' : 'false');
      b.setAttribute('aria-label', ver ? 'Ocultar la contraseña' : 'Mostrar la contraseña');
    });
  }

  /* ================================================================
   * 6) NUBE — copia de pedir() de js/app.js (la API está en la raíz: /api/…)
   * ================================================================ */
  var API = '/api/', NUBE_ESPERA_MAX_MS = 9000;
  var nube = { modo: 'local', usuario: null, dias: 30 };
  var NOMBRE_ROL = { admin: 'Administrador', lider: 'Líder de Recepción', recepcion: 'Recepción' };
  function usuarioSano(u) {
    return esObjeto(u) && typeof u.usuario === 'string' && typeof u.nombre === 'string'
      ? { id: +u.id || 0, usuario: u.usuario, nombre: u.nombre.slice(0, 40), rol: u.rol === 'admin' || u.rol === 'lider' ? u.rol : 'recepcion', cambiar: !!u.cambiar,
        prefs: esObjeto(u.prefs) ? { tema: u.prefs.tema === 'claro' || u.prefs.tema === 'oscuro' ? u.prefs.tema : 'auto', sonido: u.prefs.sonido !== false } : null } : null;   // v1.27
  }
  function nubeActiva() { return nube.modo === 'nube' && !!nube.usuario; }
  function esAdmin() { return nubeActiva() && nube.usuario.rol === 'admin'; }
  function pedir(metodo, ruta, cuerpo) {
    var opciones = { method: metodo, credentials: 'same-origin', cache: 'no-store', headers: {} };
    if (ahora() - ultimaActividad() < 2 * 60000) { opciones.headers['X-Activo'] = '1'; }   // la sesión solo se alarga si la persona tocó algo
    if (metodo !== 'GET') {
      opciones.headers['Content-Type'] = 'application/json';
      opciones.headers['X-Editador'] = '1';
      opciones.body = JSON.stringify(cuerpo || {});
    }
    var control = window.AbortController ? new window.AbortController() : null, tEspera = 0;
    if (control) { opciones.signal = control.signal; tEspera = setTimeout(function () { control.abort(); }, NUBE_ESPERA_MAX_MS); }
    return fetch(API + ruta, opciones).then(function (r) {
      clearTimeout(tEspera);
      return r.text().then(function (t) {
        var j = null;
        try { j = JSON.parse(t); } catch (e) { j = null; }
        if (!esObjeto(j)) { throw { tipo: 'sin-nube', estado: r.status }; }
        if (!r.ok) { throw { tipo: j.error || 'error', estado: r.status, datos: j }; }
        return j;
      });
    }, function () { clearTimeout(tEspera); throw { tipo: 'sin-conexion', estado: 0 }; });
  }
  /** Igual que en js/app.js: en el equipo o la red de la casa no hay nube, salvo con «wrangler pages dev» (puertos 8788 a 8799). */
  function esLocal() {
    var h = location.hostname;
    if (/^87(8[89]|9\d)$/.test(location.port)) { return false; }
    return !h || h === 'localhost' || h === '[::1]' || /^127\./.test(h) || /^(10|192\.168)\./.test(h) || /^172\.(1[6-9]|2\d|3[01])\./.test(h) || /\.local$/.test(h);
  }

  /* ================================================================
   * 7) SESIÓN — copia de js/app.js (v1.15): las MISMAS claves (actividad, latido), así la web
   *    principal y /admin abiertas a la vez cuentan como la misma sesión.
   * ================================================================ */
  var INACTIVO_MS = 2 * 3600000, AVISO_INACTIVO_MS = 60000, LATIDO_MS = 5000;
  var tActividad = 0, tLatido = 0, cerrandoSola = false, vigilando = 0;
  function ultimaActividad() { return Math.max(+leer('actividad', 0) || 0, tActividad); }
  function marcarActividad(forzar) {
    var t = ahora();
    if (!forzar && t - tActividad < 5000) { return; }
    tActividad = t; guardar('actividad', t);
  }
  function latir(forzar) {
    var t = ahora();
    if (!forzar && t - tLatido < LATIDO_MS) { return; }
    tLatido = t; sesionGuardar('latido', t); guardar('latido', t);
  }
  /** Al abrir la página con la sesión puesta: ¿sigue? → { ok, motivo }
   *  v2.0 (JX: «sería mejor que la sesión no se cierre cuando cierren las pestañas o la ventana del navegador…
   *  es tedioso… lo mejor sería dejar solamente lo de las 2 horas»): cerrar la pestaña, el navegador o apagar el PC
   *  YA NO cierra la sesión; solo las 2 horas sin usar la página (INACTIVO_MS, contadas desde lo último que se tocó). */
  function sesionSigue() {
    var actividad = +leer('actividad', 0) || 0;
    if (actividad && ahora() - actividad >= INACTIVO_MS) { return Promise.resolve({ ok: false, motivo: 'inactivo' }); }
    return Promise.resolve({ ok: true });
  }
  function empezarVigilancia() {
    latir(true);
    if (!ultimaActividad()) { marcarActividad(true); }
    if (!vigilando) { vigilando = setInterval(vigilarSesion, 1000); }
  }
  function vigilarSesion() {
    if (!nubeActiva() || cerrandoSola || document.documentElement.classList.contains('pide-entrar')) { return; }
    latir(false);
    var quieto = ahora() - ultimaActividad(), dlg = $('#dlg-sigues');
    if (quieto >= INACTIVO_MS) { cerrarSola('inactivo', false); return; }
    if (quieto >= INACTIVO_MS - AVISO_INACTIVO_MS) {
      if (!dlg.open) { abrirAnimada(dlg); setTimeout(function () { $('#sig-si').focus(); }, 30); }
      $('#sig-seg').textContent = String(Math.max(1, Math.ceil((INACTIVO_MS - quieto) / 1000)));
    } else if (dlg.open) { cerrarDialogo('#dlg-sigues'); }
  }
  /** Cierra la sesión sin preguntar ('inactivo' · 'pestana' · 'manual'). */
  function cerrarSola(motivo) {
    if (cerrandoSola) { return Promise.resolve(); }
    cerrandoSola = true;
    var nombre = nube.usuario ? nube.usuario.nombre : '';
    if ($('#dlg-sigues').open) { cerrarDialogo('#dlg-sigues'); }
    return pedir('POST', 'salir', { motivo: motivo === 'manual' ? '' : motivo }).catch(nada).then(function () {
      olvidarEquipo();
      sesionGuardar('latido', null);
      cerrandoSola = false;
      pedirEntrar(false, '');
      if (motivo === 'inactivo') {
        resultado('salir', 'Sesión cerrada', 'Pasaron 2 horas sin usar la página' + (nombre ? ' (' + nombre + ')' : '') + ': por seguridad se cerró sola. Para volver, entra con tu nombre y tu contraseña.');
      } else if (motivo === 'manual') {
        resultado('salir', 'Sesión cerrada', (nombre ? '¡Hasta pronto, ' + nombre + '! ' : '') + 'Para volver, entra con tu nombre y tu contraseña.');
      }
    });
  }
  function eventosSesion() {
    ['pointerdown', 'keydown', 'wheel', 'touchstart', 'input'].forEach(function (ev) {
      document.addEventListener(ev, function (e) {
        if ($('#dlg-sigues').open && !(e.target && e.target.closest && e.target.closest('#dlg-sigues'))) { return; }
        if (nubeActiva()) { marcarActividad(false); }
      }, { capture: true, passive: true });
    });
    $('#sig-si').addEventListener('click', function () { marcarActividad(true); cerrarDialogo('#dlg-sigues'); pedir('GET', 'yo').catch(nada); });
    $('#sig-salir').addEventListener('click', function () { cerrarSola('manual', false); });
    $('#dlg-sigues').addEventListener('cancel', function (e) { e.preventDefault(); $('#sig-si').click(); });
    window.addEventListener('pagehide', function () { if (nubeActiva()) { latir(true); } });
    document.addEventListener('visibilitychange', function () { if (!document.hidden) { vigilarSesion(); } });
  }

  /* ================================================================
   * 8) ENTRAR Y SALIR
   * ================================================================ */
  /** Muestra UNA de las partes de la página: 'entrar' · 'sin-acceso' · 'sin-nube' · 'panel' (usuarios + quién hizo qué). */
  function mostrarParte(cual) {
    document.documentElement.classList.toggle('pide-entrar', cual === 'entrar');
    $('#entrar').hidden = cual !== 'entrar';
    $('#sin-acceso').hidden = cual !== 'sin-acceso';
    $('#sin-nube').hidden = cual !== 'sin-nube';
    $('#usuarios').hidden = cual !== 'panel';
    $('#actividad').hidden = cual !== 'panel';
    $('#btn-cuenta').hidden = !nubeActiva() || cual === 'entrar';
  }
  /** Lo que la web principal guarda en este equipo se borra al salir (el equipo puede ser compartido; sigue en la nube).
   *  Igual que olvidarEquipo() de js/app.js; si quedó algo sin subir (sin señal), se guarda escondido para su dueño. */
  function olvidarEquipo() {
    var pend = leer('nube-pend', {}), sueltas = leer('nube-sueltas', []), dueno = nube.usuario ? nube.usuario.id : (+leer('nube-dueno', 0) || 0);
    var hayPend = (esObjeto(pend) && Object.keys(pend).length > 0) || (Array.isArray(sueltas) && sueltas.length > 0);
    if (hayPend) {
      guardar('nube-dueno', dueno);
    } else {
      guardar('listados', []); guardar('nube-dueno', 0);
      guardar('nube-vers', {}); guardar('nube-pend', {}); guardar('nube-acciones', {}); guardar('nube-reemplaza', {}); guardar('nube-sueltas', []); guardar('nube-desde', 0);
      sesionGuardar('actual', null);
    }
    guardar('nube-usuario', null);
    nube.usuario = null;
  }
  function pedirEntrar(primera, mensaje) {
    ponerPrefs({ tema: 'auto', sonido: true });            // v1.27: la puerta no se queda con el tema de la cuenta que salió
    ['#dlg-cuenta', '#dlg-usuario', '#dlg-ver', '#dlg-confirmar', '#dlg-pregunta', '#dlg-sigues'].forEach(function (s) { var d = $(s); if (d && d.open && d.close) { d.close(); } });
    cerrarDeshacer();
    mostrarParte('entrar');
    $('#entrar-primera').hidden = !primera;
    $('#entrar-sub').textContent = primera ? 'Así se crea el acceso a la nube.' : 'Solo para el administrador.';
    var err = $('#e-error'); err.textContent = mensaje || ''; err.hidden = !mensaje;
    $('#e-clave').value = '';
    var tactil = window.matchMedia && window.matchMedia('(pointer: coarse), (hover: none)').matches;
    if (!tactil) { setTimeout(function () { ($('#e-usuario').value ? $('#e-clave') : $('#e-usuario')).focus(); }, 60); }
  }
  function ponerUsuario(u) {
    var nuevo = usuarioSano(u), dueno = +leer('nube-dueno', 0) || 0;
    // lo que quedó guardado en este equipo es de otra persona → se borra (igual que en la web principal)
    if (dueno && nuevo && dueno !== nuevo.id) { nube.usuario = null; guardar('nube-pend', {}); guardar('nube-sueltas', []); olvidarEquipo(); }
    nube.usuario = nuevo; nube.modo = 'nube';
    if (nuevo) { guardar('nube-dueno', nuevo.id); guardar('nube-usuario', nuevo); ponerPrefs(nuevo.prefs); }   // v1.27: su tema
    empezarVigilancia();
    pintarCuenta();
    if (!esAdmin()) {
      mostrarParte('sin-acceso');
      $('#sin-acceso-texto').textContent = 'Entraste como ' + nuevo.nombre + ' (' + (NOMBRE_ROL[nuevo.rol] || 'Recepción') + '). Esta parte es solo para el administrador.';
      return Promise.resolve();
    }
    mostrarParte('panel');
    if (nuevo.cambiar) { setTimeout(function () { abrirCuenta(true); }, 50); }
    return Promise.all([cargarUsuarios(), cargarDias()]).catch(nada);   // si falla, ya se mostró (o se reintenta con «Actualizar»)
  }
  function entrar() {
    var usuario = $('#e-usuario').value.replace(/\s+/g, ' ').trim(), clave = $('#e-clave').value, boton = $('#e-entrar');
    var err = $('#e-error');
    if (!usuario || !clave) { err.textContent = 'Escribe tu nombre y tu contraseña.'; err.hidden = false; return; }
    boton.disabled = true; boton.textContent = 'Entrando…'; err.hidden = true;
    pedir('POST', 'entrar', { usuario: usuario, clave: clave }).then(function (j) {
      $('#e-clave').value = '';
      tActividad = 0; marcarActividad(true); latir(true);
      var u0 = j.usuario || {};
      if (u0.rol === 'admin' && !u0.cambiar) {
        resultado('ok', '¡Bienvenido, ' + u0.nombre + '!', 'Acceso de administrador conectado.');
      } else if (u0.rol && u0.rol !== 'admin') {
        resultado('error', 'Solo para el administrador', 'Entraste como ' + u0.nombre + ': esta parte es solo para el administrador. Tu trabajo está en el editador.');
      }
      return ponerUsuario(j.usuario);
    }, function (e) {
      var t = {
        clave: 'Usuario o contraseña incorrectos. Las mayúsculas cuentan.',
        espera: 'Demasiados intentos: espera ' + ((e.datos && e.datos.minutos) || 15) + ' minutos e inténtalo otra vez.',
        datos: 'Escribe tu nombre y apellido.',
        'sin-conexion': 'Sin conexión: revisa el internet e inténtalo otra vez.'
      }[e.tipo] || 'No se pudo entrar. Inténtalo otra vez en un momento.';
      err.textContent = t; err.hidden = false;
      resultado('error', 'No se pudo entrar', t).then(function () { $('#e-clave').focus(); });
    }).then(function () { boton.disabled = false; boton.textContent = 'Entrar'; });
  }
  function salir() {
    preguntar({
      tipo: 'salir', titulo: '¿Salir de tu cuenta?',
      texto: 'Se cierra tu sesión en este equipo (también en el editador). Para volver, entras con tu nombre y tu contraseña.',
      si: 'Sí, salir'
    }).then(function (si) {
      if (!si) { return; }
      cerrarDialogo('#dlg-cuenta');
      var nombre = nube.usuario ? nube.usuario.nombre : '';
      pedir('POST', 'salir', {}).catch(nada).then(function () {
        olvidarEquipo(); sesionGuardar('latido', null); pedirEntrar(false, '');
        resultado('salir', 'Sesión cerrada', (nombre ? '¡Hasta pronto, ' + nombre + '! ' : '') + 'En este equipo ya no queda nada guardado.');
      });
    });
  }
  /** La sesión ya no está (la cerraron en otra pestaña, se venció o desactivaron al usuario). */
  function sesionVencida() {
    olvidarEquipo();
    pedirEntrar(false, 'Tu sesión se cerró: entra otra vez.');
  }
  /** Al abrir: ¿hay nube? ¿ya entró alguien? ¿pasaron 2 horas sin usar? */
  function iniciarNube() {
    if (!/^https?:$/.test(location.protocol) || !window.fetch || esLocal()) { mostrarParte('sin-nube'); return Promise.resolve(); }
    return pedir('GET', 'yo').then(function (j) {
      if (j.error) { mostrarParte('sin-nube'); $('#sin-nube-texto').textContent = 'La nube todavía no está lista en Cloudflare.'; return; }
      nube.modo = 'nube'; nube.dias = +j.guardarDias || 30;
      if (!j.usuario) { if (nube.usuario || leer('nube-usuario', null)) { olvidarEquipo(); } pedirEntrar(!!j.primera, ''); return; }
      return sesionSigue().then(function (sigue) {
        if (!sigue.ok) { nube.usuario = usuarioSano(j.usuario); return cerrarSola(sigue.motivo, true); }
        return ponerUsuario(j.usuario);
      });
    }, function (e) {
      if (e.tipo === 'sin-conexion') { nube.modo = 'nube'; pedirEntrar(false, 'Sin conexión: revisa el internet y vuelve a abrir la página.'); return; }
      mostrarParte('sin-nube');
    });
  }

  /* ================================================================
   * 9) MI CUENTA (el admin cambia la suya; la primera vez es obligatorio)
   * ================================================================ */
  function pintarCuenta() {
    var u = nube.usuario;
    if (!u) { return; }
    $('#cuenta-texto').textContent = u.nombre;
    $('#btn-cuenta').setAttribute('aria-label', 'Mi cuenta: ' + u.nombre);
    $('#cuenta-quien').innerHTML = 'Entraste como <strong>' + esc(u.nombre) + '</strong> · ' + esc(NOMBRE_ROL[u.rol] || 'Recepción') + '.';
  }
  function abrirCuenta(obligada) {
    if (!nubeActiva()) { return; }
    pintarCuenta();
    $('#clave-obligada').hidden = !obligada;
    $('#cuenta-extra').hidden = !!obligada;
    $('#form-clave').hidden = !(obligada || esAdmin());
    $('#clave-titulo').textContent = obligada ? 'Pon tu contraseña' : 'Cambiar mi contraseña';
    $('#c-actual').previousElementSibling.textContent = obligada ? 'Contraseña con la que entraste (la CLAVE_INICIAL)' : 'Contraseña actual';
    $('#c-actual').value = ''; $('#c-nueva').value = ''; $('#c-error').hidden = true;
    abrirDialogo('#dlg-cuenta');
    setTimeout(function () { (obligada ? $('#c-actual') : $('#cuenta-titulo')).focus(); }, 40);
  }
  function cambiarMiClave() {
    var actualC = $('#c-actual').value, nueva = $('#c-nueva').value, err = $('#c-error');
    function mal(t, campo) { err.textContent = t; err.hidden = false; if (campo) { campo.focus(); } }
    if (!actualC) { mal('Escribe tu contraseña actual.', $('#c-actual')); return; }
    if (nueva.trim().length < 8) { mal('La nueva debe tener 8 o más letras o números.', $('#c-nueva')); return; }
    if (nueva.trim() === actualC.trim()) { mal('La nueva tiene que ser distinta de la actual.', $('#c-nueva')); return; }
    var b = $('#btn-cambiar-clave'); b.disabled = true;
    pedir('POST', 'clave', { actual: actualC, nueva: nueva }).then(function () {
      if (nube.usuario) { nube.usuario.cambiar = false; guardar('nube-usuario', nube.usuario); }
      cerrarDialogo('#dlg-cuenta');
      resultado('ok', '¡Contraseña cambiada!', 'Desde ahora entras con la nueva.' + (nube.usuario ? ' Bienvenido, ' + nube.usuario.nombre + '.' : ''));
      refrescarActividad();
    }, function (e) {
      if (e.estado === 401) { sesionVencida(); return; }
      mal({ clave: 'La contraseña actual no es correcta.', corta: 'La nueva debe tener 8 o más letras o números.', igual: 'La nueva tiene que ser distinta de la actual.', 'sin-conexion': 'Sin conexión: inténtalo cuando vuelva la señal.' }[e.tipo] || 'No se pudo cambiar. Inténtalo otra vez.');
    }).then(function () { b.disabled = false; });
  }

  /* ================================================================
   * 10) USUARIOS (antes en js/app.js, sección «Administración»)
   * ================================================================ */
  function cargarUsuarios() {
    if (!esAdmin()) { return Promise.resolve(); }
    return pedir('GET', 'usuarios').then(function (r) { pintarUsuarios(r.usuarios || []); }, function (e) { if (e.estado === 401) { sesionVencida(); } });
  }
  var usuariosAbiertos = {};                                 // v1.27: id → true si el admin lo dejó abierto
  function pintarUsuarios(lista) {
    var yo = nube.usuario ? nube.usuario.id : 0;
    $('#lista-usuarios').innerHTML = lista.map(function (u) {
      var propio = u.id === yo, chips = [];
      if (u.rol === 'admin') { chips.push('<span class="chip chip--cambio">Administrador</span>'); }
      if (u.rol === 'lider') { chips.push('<span class="chip chip--nueva">Líder de Recepción</span>'); }
      if (!u.activo) { chips.push('<span class="chip chip--revisar">Desactivado</span>'); }
      if (u.activo && u.cambiar) { chips.push('<span class="chip chip--mano">Falta que ponga su contraseña</span>'); }
      if (propio) { chips.push('<span class="chip">Tú</span>'); }
      // v2.0 (JX: «que sean botones mejor… así se ve solo algo escrito»): los botones chicos de siempre; «Desactivar» con letra roja
      var B = '<button type="button" class="boton boton--secundario boton--chico" ';
      var botones = B + 'data-u="nombre">Nombre</button>' + (propio ? B + 'data-u="mia">Cambiar mi contraseña</button>'
        : B + 'data-u="ver">Ver contraseña</button>' +
          B + 'data-u="clave">Contraseña nueva</button>' +
          B + 'data-u="rol">Permisos</button>' +
          '<button type="button" class="boton boton--secundario boton--chico' + (u.activo ? ' boton--eliminar' : '') + '" data-u="activo">' + (u.activo ? 'Desactivar' : 'Activar') + '</button>');
      // v1.27 (JX: «los historiales tienen un desplegable… quiero que también lo tengan los usuarios… entre más orden mejor»):
      // cada usuario es un desplegable: cerrado se ve el nombre con sus chips; al tocarlo, cómo entra y sus botones.
      // usuariosAbiertos recuerda cuáles abrió el admin (al volver a pintar después de una acción siguen abiertos).
      return '<li data-activo="' + (u.activo ? 'si' : 'no') + '" data-id="' + esc(u.id) + '" data-nombre="' + esc(u.nombre) + '" data-usuario="' + esc(u.usuario) + '" data-rol="' + esc(u.rol) + '" data-act="' + (u.activo ? '1' : '0') + '">' +
        '<details class="usuario" data-uid="' + esc(u.id) + '"' + (usuariosAbiertos[u.id] ? ' open' : '') + '>' +
        '<summary><span class="usuarios__nombre">' + esc(u.nombre) + ' ' + chips.join('') + '</span></summary>' +
        '<div class="usuario__cuerpo"><span class="usuarios__meta">' + (/\s/.test(u.usuario) ? 'Entra con su nombre' : 'Entra con «' + esc(u.usuario) + '» (ponle su nombre completo)') + ' · creado el ' + esc(fechaTexto(diaDe(u.creado))) + '</span>' +
        '<span class="usuarios__botones">' + botones + '</span></div></details></li>';
    }).join('');
  }
  /* «Ver contraseña» (v1.20): pide TU contraseña; la nube muestra la copia cifrada (solo de las puestas desde v1.20) */
  var dlgVer = { id: 0, nombre: '' };
  function abrirVer(li) {
    dlgVer = { id: +li.getAttribute('data-id'), nombre: li.getAttribute('data-nombre') };
    $('#ver-titulo').textContent = 'Contraseña de ' + dlgVer.nombre;
    $('#v-clave').value = ''; $('#v-clave').type = 'password'; $('#v-error').hidden = true;
    var ojo = $('[data-ojo="v-clave"]'); ojo.setAttribute('aria-pressed', 'false'); ojo.setAttribute('aria-label', 'Mostrar la contraseña');
    abrirDialogo('#dlg-ver');
    setTimeout(function () { $('#v-clave').focus(); }, 40);
  }
  function verContrasena() {
    var clave = $('#v-clave').value, err = $('#v-error'), b = $('#v-si');
    if (!clave) { err.textContent = 'Escribe tu contraseña.'; err.hidden = false; $('#v-clave').focus(); return; }
    b.disabled = true;
    pedir('POST', 'usuarios/' + dlgVer.id + '/ver', { clave: clave }).then(function (r) {
      cerrarDialogo('#dlg-ver'); $('#v-clave').value = '';
      if (r.sinCopia) {
        resultado('error', 'No se puede ver', 'Esa contraseña se puso antes de la v1.20 y no quedó copia. Ponle una «Contraseña nueva» y desde ahí sí la podrás ver.');
      } else {
        resultado('ok', 'Contraseña de ' + (r.nombre || dlgVer.nombre), 'Es esta:', r.clave);
        refrescarActividad();
      }
    }, function (e) {
      if (e.estado === 401) { cerrarDialogo('#dlg-ver'); sesionVencida(); return; }
      err.textContent = { clave: 'Tu contraseña no es correcta.', espera: 'Demasiados intentos: espera ' + ((e.datos && e.datos.minutos) || 15) + ' minutos.', 'sin-conexion': 'Sin conexión: inténtalo cuando vuelva la señal.' }[e.tipo] || 'No se pudo. Inténtalo otra vez.';
      err.hidden = false; $('#v-clave').focus();
    }).then(function () { b.disabled = false; });
  }
  var dlgUsuario = { modo: 'nuevo', id: 0 };
  function claveAlAzar() {
    var letras = 'abcdefghjkmnpqrstuvwxyz23456789', b = new Uint8Array(10), s = '';
    (window.crypto || window.msCrypto).getRandomValues(b);
    for (var i = 0; i < b.length; i++) { s += letras.charAt(b[i] % letras.length); }
    return s;
  }
  function abrirUsuario(modo, li) {
    dlgUsuario = { modo: modo, id: li ? +li.getAttribute('data-id') : 0 };
    var nuevo = modo === 'nuevo', soloNombre = modo === 'nombre', soloRol = modo === 'rol';
    $('#u-titulo').textContent = nuevo ? 'Nuevo usuario' : soloNombre ? 'Nombre de ' + li.getAttribute('data-nombre') : soloRol ? 'Permisos de ' + li.getAttribute('data-nombre') : 'Contraseña nueva para ' + li.getAttribute('data-nombre');
    $('#u-ayuda').textContent = nuevo ? 'La persona entra con su nombre y apellido y la contraseña que escribas aquí. Entrégasela en persona.'
      : soloNombre ? 'Con este nombre entra y así sale en la hoja, en el historial y en «Quién hizo qué». La contraseña no cambia.'
        : soloRol ? 'Escoge qué puede hacer. Su nombre y su contraseña no cambian.'
          : 'Se cierra su sesión en todos los equipos y desde ahora entra con la contraseña que escribas aquí. Entrégasela en persona.';
    $('#u-datos').hidden = !(nuevo || soloNombre || soloRol);
    $('#u-nombre').closest('.campo').hidden = soloRol;
    $('#u-rol').closest('.campo').hidden = soloNombre;
    $('#u-clave').closest('.campo').hidden = soloNombre || soloRol;
    $('#u-nombre').value = soloNombre ? li.getAttribute('data-nombre') : '';
    $('#u-rol').value = soloRol ? li.getAttribute('data-rol') : 'recepcion';
    $('#u-clave').value = '';
    $('#u-guardar').textContent = nuevo ? 'Crear usuario' : soloNombre ? 'Guardar nombre' : soloRol ? 'Guardar permisos' : 'Poner contraseña';
    $('#u-error').hidden = true;
    abrirDialogo('#dlg-usuario');
    setTimeout(function () { (nuevo || soloNombre ? $('#u-nombre') : soloRol ? $('#u-rol') : $('#u-clave')).focus(); }, 40);
  }
  function guardarUsuario() {
    var err = $('#u-error'), clave = $('#u-clave').value.trim();
    function mal(t, campo) { err.textContent = t; err.hidden = false; if (campo) { campo.focus(); } }
    var cuerpo, peticion, conClave = true;
    if (dlgUsuario.modo === 'rol') {
      conClave = false;
      cuerpo = { rol: $('#u-rol').value };
      peticion = function () { return pedir('PATCH', 'usuarios/' + dlgUsuario.id, cuerpo); };
    } else if (dlgUsuario.modo === 'nombre') {
      var nom = nombreBonito(limpiar($('#u-nombre').value));
      if (nom.length < 3 || !/\s/.test(nom)) { mal('Escribe el nombre y el apellido (por ejemplo, Jampier Estrada).', $('#u-nombre')); return; }
      conClave = false;
      cuerpo = { nombre: nom };
      peticion = function () { return pedir('PATCH', 'usuarios/' + dlgUsuario.id, cuerpo); };
    } else if (dlgUsuario.modo === 'nuevo') {
      var nombre = nombreBonito(limpiar($('#u-nombre').value));
      if (nombre.length < 3 || !/\s/.test(nombre)) { mal('Escribe el nombre y el apellido de la persona (por ejemplo, Jampier Estrada).', $('#u-nombre')); return; }
      cuerpo = { nombre: nombre, usuario: nombre, rol: $('#u-rol').value, clave: clave };
      peticion = function () { return pedir('POST', 'usuarios', cuerpo); };
    } else {
      cuerpo = { clave: clave };
      peticion = function () { return pedir('PATCH', 'usuarios/' + dlgUsuario.id, cuerpo); };
    }
    if (conClave && clave.length < 8) { mal(clave ? 'La contraseña debe tener 8 o más letras o números.' : 'Escribe la contraseña (8 o más letras o números).', $('#u-clave')); return; }
    var b = $('#u-guardar'); b.disabled = true;
    peticion().then(function (r) {
      pintarUsuarios(r.usuarios || []);
      cerrarDialogo('#dlg-usuario');
      if (dlgUsuario.modo === 'nombre' && nube.usuario && dlgUsuario.id === nube.usuario.id) {
        // si se cambió el nombre a sí mismo: desde ahora entra con ese nombre (la nube devuelve cómo quedó)
        var yoNuevo = (r.usuarios || []).filter(function (x) { return x.id === nube.usuario.id; })[0];
        nube.usuario.nombre = yoNuevo ? yoNuevo.nombre : cuerpo.nombre; if (yoNuevo) { nube.usuario.usuario = yoNuevo.usuario; }
        guardar('nube-usuario', nube.usuario); pintarCuenta();
      }
      if (dlgUsuario.modo === 'rol') {
        resultado('ok', '¡Permisos guardados!', ({ admin: 'Ahora es Administrador: puede todo (usuarios, «Quién hizo qué», borrar y ajustes de la hoja).',
          lider: 'Ahora es Líder de Recepción: ve los listados de todos y cambia su contraseña. No maneja usuarios ni borra.',
          recepcion: 'Ahora es Recepción: sube, corrige e imprime, y ve solo su historial.' })[cuerpo.rol]);
      } else if (dlgUsuario.modo === 'nuevo') {
        resultado('ok', '¡Usuario creado!', 'Entra escribiendo «' + cuerpo.nombre + '» y esta contraseña. Entrégasela en persona:', clave);
      } else if (dlgUsuario.modo === 'nombre') {
        resultado('ok', '¡Nombre guardado!', 'Desde ahora entra escribiendo «' + cuerpo.nombre + '» (con la misma contraseña) y así sale en la hoja, el historial y «Quién hizo qué».');
      } else {
        resultado('ok', '¡Contraseña nueva puesta!', 'Su sesión se cerró en todos los equipos. Desde ahora entra con esta contraseña (entrégasela en persona):', clave);
      }
      refrescarActividad();
    }, function (e) {
      if (e.estado === 401) { cerrarDialogo('#dlg-usuario'); sesionVencida(); return; }
      mal({ 'ultimo-admin': 'Debe quedar al menos un administrador activo.', propio: 'No puedes cambiarte tus propios permisos.', existe: 'Ya hay alguien con ese nombre: agrégale el segundo apellido.', usuario: 'Escribe solo letras, espacios y números (nombre y apellido).', nombre: 'Escribe el nombre de la persona.', corta: 'La contraseña debe tener 8 o más letras o números.', 'sin-conexion': 'Sin conexión: inténtalo cuando vuelva la señal.' }[e.tipo] || 'No se pudo guardar. Inténtalo otra vez.');
    }).then(function () { b.disabled = false; });
  }
  /** Activar / desactivar (desactivar = ventanita roja + «Deshacer» 10 s; activar = confirmar + ✓). */
  function cambiarActivo(li) {
    var id = +li.getAttribute('data-id'), nombre = li.getAttribute('data-nombre'), activo = li.getAttribute('data-act') === '1';
    var pide = activo
      ? preguntar({ titulo: '¿Desactivar a ' + nombre + '?', texto: 'No podrá entrar y se cierra su sesión en todos los equipos. Lo que hizo queda guardado.', si: 'Sí, desactivar' })
      : confirmar('¿Activar otra vez a ' + nombre + '?', 'Activar');
    function fallo(e) {
      if (e.estado === 401) { sesionVencida(); return; }
      resultado('error', 'No se pudo cambiar', { 'ultimo-admin': 'Debe quedar al menos un administrador activo.', propio: 'No puedes desactivarte a ti mismo.' }[e.tipo] || 'Revisa la conexión e inténtalo otra vez.');
    }
    pide.then(function (si) {
      if (!si) { return; }
      return pedir('PATCH', 'usuarios/' + id, { activo: !activo }).then(function (r) {
        pintarUsuarios(r.usuarios || []); refrescarActividad();
        if (activo) {
          conDeshacer(nombre + ' quedó desactivado.', function () {
            pedir('PATCH', 'usuarios/' + id, { activo: true }).then(function (r2) {
              pintarUsuarios(r2.usuarios || []); refrescarActividad(); resultado('ok', '¡Listo, se deshizo!', nombre + ' puede entrar otra vez.');
            }, fallo);
          });
          return;
        }
        resultado('ok', '¡' + nombre + ' está activo otra vez!', 'Ya puede entrar con su nombre y su contraseña.');
      }, fallo);
    });
  }

  /* ================================================================
   * 11) QUIÉN HIZO QUÉ, POR DÍA (v1.21)
   *     act.dias = [{ dia: 'AAAA-MM-DD', n }] (de la nube) · act.cache[dia] = lo de ese día (se trae al abrirlo)
   *     act.abiertos[dia] = true/false (lo que tocó la persona; si no ha tocado, abierto solo el más reciente)
   * ================================================================ */
  var act = { dias: [], cache: {}, error: {}, cargando: {}, abiertos: {}, limite: 3000 };
  function cabezaDia(iso, n) {
    var hoy = hoyISO(), ayer = diaDe(ahora() - DIA_MS);
    var chip = iso === hoy ? ' <span class="chip chip--cambio">Hoy</span>' : iso === ayer ? ' <span class="chip">Ayer</span>' : '';
    return '<summary><span class="dia__titulo">Historial del ' + esc(fechaDia(iso)) + '</span>' + chip +
      '<span class="dia__n">' + plural(n, 'acción', 'acciones') + '</span></summary>';
  }
  function cuerpoDia(dia) {
    var lista = act.cache[dia];
    if (!lista) { return '<p class="nota dia__nota">' + (act.error[dia] ? 'No se pudo traer este día. Toca «Actualizar».' : 'Cargando…') + '</p>'; }
    if (!lista.length) { return '<p class="nota dia__nota">No hubo actividad este día.</p>'; }
    return '<ol class="actividad">' + lista.map(function (x) {
      var accion = String(x.accion || '');
      return '<li><span class="actividad__cuando">' + esc(horaDe(x.t)) + '</span>' +
        '<span class="actividad__que"><strong>' + esc(nombreBonito(x.nombre || x.usuario || '—')) + '</strong>' + esc(accion.charAt(0).toLowerCase() + accion.slice(1)) + '</span></li>';
    }).join('') + '</ol>' + (lista.length >= act.limite ? '<p class="nota dia__nota">Se ven las ' + act.limite + ' acciones más recientes de este día.</p>' : '');
  }
  function pintarDias() {
    var caja = $('#actividad-dias'), primero = act.dias.length ? act.dias[0].dia : '';
    $('#actividad-vacia').hidden = act.dias.length > 0;
    caja.innerHTML = act.dias.map(function (d) {
      var abierto = tiene(act.abiertos, d.dia) ? act.abiertos[d.dia] : d.dia === primero;
      return '<details class="dia" data-dia="' + esc(d.dia) + '"' + (abierto ? ' open' : '') + '>' + cabezaDia(d.dia, d.n) +
        '<div class="dia__cuerpo" id="dia-' + esc(d.dia) + '">' + cuerpoDia(d.dia) + '</div></details>';
    }).join('');
  }
  function pintarDia(dia) { var cuerpo = document.getElementById('dia-' + dia); if (cuerpo) { cuerpo.innerHTML = cuerpoDia(dia); } }
  /** Trae lo de un día (si ya está, lo vuelve a traer sin quitar lo que se ve mientras llega). */
  function cargarDia(dia) {
    if (act.cargando[dia]) { return act.cargando[dia]; }
    var p = pedir('GET', 'actividad/dia/' + dia).then(function (r) {
      act.cache[dia] = r.actividad || []; act.limite = +r.limite || act.limite; delete act.error[dia];
    }, function (e) {
      if (e.estado === 401) { sesionVencida(); return; }
      if (!act.cache[dia]) { act.error[dia] = true; }
    }).then(function () { delete act.cargando[dia]; pintarDia(dia); });
    act.cargando[dia] = p;
    return p;
  }
  function diasAbiertos() {
    return Array.prototype.map.call(document.querySelectorAll('#actividad-dias .dia[open]'), function (el) { return el.getAttribute('data-dia'); });
  }
  /** Trae la lista de días (con cuántas acciones) y vuelve a traer los días abiertos. */
  function cargarDias() {
    if (!esAdmin()) { return Promise.resolve(); }
    return pedir('GET', 'actividad/dias').then(function (r) {
      act.dias = (r.dias || []).filter(function (d) { return d && /^\d{4}-\d{2}-\d{2}$/.test(d.dia); });
      nube.dias = +r.guardarDias || nube.dias;
      $('#actividad-nota').textContent = 'Entradas, Excel subidos, correcciones, impresiones y PDF de los últimos ' + nube.dias + ' días.';
      pintarDias();
      return Promise.all(diasAbiertos().map(cargarDia));
    }, function (e) { if (e.estado === 401) { sesionVencida(); } throw e; });
  }
  /** Después de cada cosa que hace el admin: se pone al día «Quién hizo qué» (en silencio). */
  function refrescarActividad() { if (esAdmin()) { cargarDias().catch(nada); } }
  function eventosActividad() {
    // «toggle» no burbujea: se escucha en la fase de captura del contenedor
    $('#actividad-dias').addEventListener('toggle', function (e) {
      var el = e.target, dia = el && el.getAttribute && el.getAttribute('data-dia');
      if (!dia) { return; }
      act.abiertos[dia] = el.open;
      if (el.open && !act.cache[dia]) { cargarDia(dia); }
    }, true);
    $('#btn-actualizar-actividad').addEventListener('click', function () {
      var b = this; b.disabled = true;
      cargarDias().then(function () {
        resultado('ok', '¡Actividad al día!', 'Ya ves lo último que se hizo en todos los equipos.');
      }, function () {
        resultado('error', 'No se pudo actualizar', 'Revisa la conexión e inténtalo otra vez.');
      }).then(function () { b.disabled = false; });
    });
  }

  /* ================================================================
   * 12) ARRANQUE (la misma pantalla de carga de la web principal: 2,5 s parejos)
   * ================================================================ */
  var CARGA_TOTAL_MS = 2500, CARGA_MIN_MS = 300, CARGA_VER_100_MS = 150, tRampa = 0;
  function rampaCarga(t0, hasta) {
    clearInterval(tRampa);
    var paso = function () {
      var p = Math.min(hasta, (ahora() - t0) / CARGA_TOTAL_MS * 100);
      if (L.progreso) { L.progreso(p); }
      if (p >= hasta) { clearInterval(tRampa); tRampa = 0; }
    };
    paso();
    tRampa = setInterval(paso, 40);
  }
  function eventos() {
    eventosTema(); eventosVentanitas(); eventosSesion(); eventosActividad();
    $('#form-entrar').addEventListener('submit', function (e) { e.preventDefault(); entrar(); });
    ['keydown', 'keyup'].forEach(function (ev) {
      $('#e-clave').addEventListener(ev, function (e) { if (e.getModifierState) { $('#e-mayus').hidden = !e.getModifierState('CapsLock'); } });
    });
    $('#btn-cuenta').addEventListener('click', function () { abrirCuenta(!!(nube.usuario && nube.usuario.cambiar)); });
    $('#btn-cerrar-cuenta').addEventListener('click', function () { cerrarDialogo('#dlg-cuenta'); });
    $('#dlg-cuenta').addEventListener('cancel', function (e) { if (nube.usuario && nube.usuario.cambiar) { e.preventDefault(); } });
    $('#form-clave').addEventListener('submit', function (e) { e.preventDefault(); cambiarMiClave(); });
    $('#btn-salir').addEventListener('click', salir);
    $('#btn-salir-sin-acceso').addEventListener('click', salir);
    $('#btn-nuevo-usuario').addEventListener('click', function () { abrirUsuario('nuevo', null); });
    // v1.27: se recuerda qué usuario quedó abierto o cerrado («toggle» no sube: se escucha en la captura)
    $('#lista-usuarios').addEventListener('toggle', function (e) {
      var d = e.target;
      if (d && d.getAttribute && d.getAttribute('data-uid')) { usuariosAbiertos[d.getAttribute('data-uid')] = d.open; }
    }, true);
    $('#lista-usuarios').addEventListener('click', function (e) {
      var b = e.target.closest('[data-u]');
      if (!b) { return; }
      var li = b.closest('li'), que = b.getAttribute('data-u');
      if (que === 'ver') { abrirVer(li); } else if (que === 'mia') { abrirCuenta(false); }
      else if (que === 'activo') { cambiarActivo(li); } else { abrirUsuario(que, li); }
    });
    $('#form-usuario').addEventListener('submit', function (e) { e.preventDefault(); guardarUsuario(); });
    $('#u-cancelar').addEventListener('click', function () { cerrarDialogo('#dlg-usuario'); });
    $('#u-azar').addEventListener('click', function () { $('#u-clave').value = claveAlAzar(); });
    $('#form-ver').addEventListener('submit', function (e) { e.preventDefault(); verContrasena(); });
    $('#v-no').addEventListener('click', function () { $('#v-clave').value = ''; cerrarDialogo('#dlg-ver'); });
    $('#dlg-ver').addEventListener('close', function () { $('#v-clave').value = ''; });   // la contraseña escrita no se queda en el campo
    /* al volver a esta pestaña: ¿sigue la sesión? (la pudieron cerrar en el editador) */
    document.addEventListener('visibilitychange', function () {
      if (document.hidden || !nubeActiva()) { return; }
      pedir('GET', 'yo').then(function (j) { if (!j.usuario) { sesionVencida(); } }, nada);
    });
  }
  function iniciar() {
    aplicarTema();
    eventos();
    var listo = iniciarNube().catch(nada);
    var letras = [listo];
    // v1.22: Karla (la de los títulos «Usuarios» y «Quién hizo qué») se pide YA, mientras está la pantalla de carga.
    // Antes iba con «preload» en index.html y, con la letra ya guardada en el navegador, Chrome avisaba en la consola
    // que «no se usó en unos segundos». Ahora no hay preload: se pide aquí y los títulos salen ya con su letra.
    if (document.fonts && document.fonts.load) { letras.push(document.fonts.load('400 13.5px "Karla Dorado"').catch(nada)); }
    if (document.fonts && document.fonts.ready) { letras.push(Promise.resolve(document.fonts.ready).catch(nada)); }
    var espera = function (ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); };
    var t0 = +document.documentElement.getAttribute('data-carga') || ahora();
    if (window.rampaCargaInicio) { clearInterval(window.rampaCargaInicio); window.rampaCargaInicio = 0; }
    rampaCarga(t0, 95);
    L.seguir([Promise.all(letras.concat(espera(Math.max(CARGA_MIN_MS, CARGA_TOTAL_MS - (ahora() - t0))))).then(function () {
      clearInterval(tRampa); tRampa = 0;
      if (L.progreso) { L.progreso(100); }
      return espera(CARGA_VER_100_MS);
    })], { mensaje: 'Preparando la administración…' });
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', iniciar); } else { iniciar(); }
})(window, document);
