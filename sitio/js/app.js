/* =====================================================================
 *  LISTADO DE RESERVAS DP · RECEPCIÓN · HOTEL DORADO PLAZA BOCAGRANDE
 *  app.js — todo lo que se mueve en la página.
 *
 *  Une las tres piezas:
 *   · js/lector-excel.js  abre el .xlsx (en este equipo, sin internet)
 *   · js/listado.js       aplica las reglas (una línea por reserva…)
 *   · js/hoja.js          dibuja la hoja y escribe el PDF
 *  y maneja la pantalla: subir, revisar, corregir, imprimir, historial.
 *
 *  Módulos (en este orden):
 *   1 Utilidades            · 2 Almacén (lo que se guarda en el equipo)
 *   3 Fechas (hora Colombia)· 4 Estado
 *   5 Subir y leer el Excel · 6 Pintar (resumen, avisos, novedades, lista, hoja)
 *   7 Corregir, agregar y quitar reservas
 *   8 Salida: imprimir, PDF y compartir
 *   9 Historial             · 10 Tema y ajustes
 *   11 Diálogo de confirmar y aviso flotante · 12 Arranque
 *
 *  Conceptos:
 *   · «listado»: lo que salió de UN Excel (más lo corregido a mano). Tiene
 *     fecha (la que sale en la hoja: por defecto HOY), filas y novedades.
 *   · «actual»: el listado que está en pantalla.
 *   · Se guardan hasta 30 listados en este equipo (historial).
 * ===================================================================== */
(function (window, document) {
  'use strict';

  var Lector = window.LectorExcel, Reglas = window.ReglasListado, Hoja = window.Hoja;
  var nada = function () {};
  var L = window.DoradoLoader || { mostrar: nada, ocultar: nada, mensaje: nada, progreso: nada, seguir: function (p) { return Promise.all(p); } };
  if (!Lector || !Reglas || !Hoja) { return; }

  /* ================================================================
   * 1) UTILIDADES
   * ================================================================ */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  /** Escapa texto para meterlo en HTML (todo lo que viene del Excel o escribe la persona pasa por aquí). */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  /** «1 reserva» / «3 reservas». */
  function plural(n, uno, varios) { return n + ' ' + (n === 1 ? uno : varios); }
  function esObjeto(x) { return !!x && typeof x === 'object' && !Array.isArray(x); }
  function lista(arr, max) {                               // «DP1, DP2 y 3 más»
    var v = arr.slice(0, max || 4).join(', ');
    return arr.length > (max || 4) ? v + ' y ' + (arr.length - (max || 4)) + ' más' : v;
  }

  /* ================================================================
   * 2) ALMACÉN — localStorage con respaldo en memoria
   *    (en modo privado la página funciona igual; solo no recuerda el
   *    historial al cerrar). Claves: «reservas-dp-bg:…».
   * ================================================================ */
  var PREFIJO = 'reservas-dp-bg:';
  var memoria = {}, avisoAlmacenDado = false, guardadoFallo = false;
  /** ¿Este navegador deja guardar? (en modo privado o con el almacenamiento bloqueado, no) */
  var almacenOk = (function () {
    try { var k = PREFIJO + 'prueba'; window.localStorage.setItem(k, '1'); window.localStorage.removeItem(k); return true; } catch (e) { return false; }
  })();
  function leer(k, porDefecto) {
    try {
      var v = window.localStorage.getItem(PREFIJO + k);
      return v ? JSON.parse(v) : porDefecto;
    } catch (e) { return Object.prototype.hasOwnProperty.call(memoria, k) ? memoria[k] : porDefecto; }
  }
  /** Guarda (y devuelve true si quedó guardado). Si no se puede, avisa una sola vez, salvo que se pida silencio. */
  function guardar(k, v, silencio) {
    memoria[k] = v;
    try { window.localStorage.setItem(PREFIJO + k, JSON.stringify(v)); return true; }
    catch (e) { if (!silencio) { avisarNoGuarda(); } return false; }
  }
  function avisarNoGuarda() {
    if (avisoAlmacenDado) { return; }
    avisoAlmacenDado = true;
    aviso('Este navegador no deja guardar el historial: al cerrar la página se pierde lo que no hayas impreso.', 6500, true);
  }

  /* ================================================================
   * 3) FECHAS — siempre en hora de Colombia (UTC−5, sin cambio de horario)
   * ================================================================ */
  var OFFSET = 5 * 3600 * 1000;
  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  function ahora() { return Date.now(); }
  function dos(n) { return (n < 10 ? '0' : '') + n; }
  /** Día (AAAA-MM-DD) de un momento, visto en Colombia. */
  function diaDe(ms) { return new Date(ms - OFFSET).toISOString().slice(0, 10); }
  function hoyISO() { return diaDe(ahora()); }
  /** '2026-11-16' → '16/11/2026' (así sale en la hoja). */
  function fechaTexto(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ''); return m ? m[3] + '/' + m[2] + '/' + m[1] : ''; }
  /** '2026-11-17' → 'martes 17 de noviembre de 2026' (debajo del campo de fecha: el campo puede verse en formato mes/día). */
  function fechaLarga(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    if (!m) { return ''; }
    return DIAS[new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).getUTCDay()] + ' ' + (+m[3]) + ' de ' + MESES[+m[2] - 1] + ' de ' + m[1];
  }
  /** '2026-11-16' → 'lun 16 nov 2026'. */
  function fechaCorta(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    if (!m) { return ''; }
    var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    return DIAS[d.getUTCDay()].slice(0, 3) + ' ' + (+m[3]) + ' ' + MESES[+m[2] - 1].slice(0, 3) + ' ' + m[1];
  }
  /** Hora de un momento: «6:03 p. m.». */
  function horaDe(ms) {
    var d = new Date(ms - OFFSET), h = d.getUTCHours();
    return (h % 12 || 12) + ':' + dos(d.getUTCMinutes()) + (h < 12 ? '\u00A0a.\u00A0m.' : '\u00A0p.\u00A0m.');   // espacios que no parten la hora
  }
  /** «hoy a las 6:03 p. m.» o «el lun 16 nov 2026 a las 6:03 p. m.». */
  function cuando(ms) { return (diaDe(ms) === hoyISO() ? 'hoy' : 'el ' + fechaCorta(diaDe(ms))) + ' a las ' + horaDe(ms); }

  /* ================================================================
   * 4) ESTADO
   * ================================================================ */
  var MAX_HISTORIAL = 30;
  // La casilla «Llegó» viene APAGADA: así la hoja sale igual a la que usa Recepción; se prende en «Más ajustes».
  // «apretar» viene PRENDIDO: con 19 a 22 reservas la letra se aprieta un poco y la hoja cabe en una sola página.
  var ajustes = Object.assign({ tema: 'auto', casilla: false, apretar: true }, esObjeto(leer('ajustes', {})) ? leer('ajustes', {}) : {});
  /* lo guardado se revisa antes de usarlo: un dato viejo o a medias nunca rompe la página */
  function filaSana(f) {
    if (!esObjeto(f) || typeof f.cod !== 'string' || !f.id) { return null; }
    return {
      id: String(f.id), cod: f.cod, hab: typeof f.hab === 'number' && isFinite(f.hab) ? f.hab : null,
      ag: typeof f.ag === 'string' ? f.ag : '', ti: typeof f.ti === 'string' ? f.ti : '',
      pre: f.pre === 'sin' || f.pre === 'con' || f.pre === 'web' || f.pre === 'otro' ? f.pre : '', preTxt: typeof f.preTxt === 'string' ? f.preTxt : '',
      origen: f.origen === 'manual' ? 'manual' : 'excel', base: esObjeto(f.base) ? f.base : null, quitada: !!f.quitada,
      orden: typeof f.orden === 'number' ? f.orden : 0, nFilas: typeof f.nFilas === 'number' ? f.nFilas : 0,
      varAg: Array.isArray(f.varAg) ? f.varAg.filter(function (x) { return typeof x === 'string'; }) : [],
      varTi: Array.isArray(f.varTi) ? f.varTi.filter(function (x) { return typeof x === 'string'; }) : [],
      reparada: !!f.reparada, nov: f.nov === 'nueva' || f.nov === 'cambio' ? f.nov : '', novDetalle: typeof f.novDetalle === 'string' ? f.novDetalle : ''
    };
  }
  function listadoSano(x) {
    if (!esObjeto(x) || !x.id || !/^\d{4}-\d{2}-\d{2}$/.test(x.fecha || '') || !Array.isArray(x.filas)) { return null; }
    var filas = x.filas.map(filaSana).filter(Boolean);
    filas.forEach(function (f) { if (f.origen === 'excel' && !f.base) { f.origen = 'manual'; } });
    var n = esObjeto(x.novedades) ? x.novedades : null;
    return {
      id: String(x.id), fecha: x.fecha, fechaManual: !!x.fechaManual, creado: +x.creado || ahora(), actualizado: +x.actualizado || +x.creado || ahora(),
      archivo: typeof x.archivo === 'string' ? x.archivo : 'Excel', filasExcel: +x.filasExcel || 0, sinCodigo: +x.sinCodigo || 0,
      checkin: Array.isArray(x.checkin) ? x.checkin.filter(function (d) { return /^\d{4}-\d{2}-\d{2}$/.test(d); }) : [],
      filas: filas, seq: +x.seq || 0,
      novedades: n ? {
        hora: +n.hora || 0, nuevas: +n.nuevas || 0, cambiaron: +n.cambiaron || 0,
        yaNo: Array.isArray(n.yaNo) ? n.yaNo.filter(function (y) { return esObjeto(y) && typeof y.cod === 'string'; }) : [],
        conservadas: Object.assign({ correcciones: 0, agregadas: 0, quitadas: 0 }, esObjeto(n.conservadas) ? n.conservadas : {})
      } : null
    };
  }
  var guardados = leer('listados', []);
  var listados = (Array.isArray(guardados) ? guardados : []).map(listadoSano).filter(Boolean).slice(0, MAX_HISTORIAL);
  var actual = null;                                        // el listado en pantalla
  var maqueta = null;                                       // la hoja ya acomodada (lo que devolvió Hoja.maquetar)
  function guardarListados() {
    var bien = guardar('listados', listados, true);
    // si el almacén se llenó: se sueltan los listados más viejos (nunca el que está en pantalla) hasta que quepa
    while (!bien && almacenOk && listados.length > 1) {
      var viejo = listados.length - 1;
      if (actual && listados[viejo].id === actual.id) { viejo -= 1; }
      listados.splice(viejo, 1);
      bien = guardar('listados', listados, true);
    }
    if (!guardar('actual', actual ? actual.id : null, true)) { bien = false; }
    guardadoFallo = !bien;
    if (!bien) { avisarNoGuarda(); }
  }
  /** Anota que el listado cambió y lo guarda. */
  function tocar() { if (actual) { actual.actualizado = ahora(); } guardarListados(); }
  function filaPorId(id) { return actual ? actual.filas.filter(function (f) { return f.id === id; })[0] : null; }

  /* ================================================================
   * 5) SUBIR Y LEER EL EXCEL
   *    Todo pasa en este equipo. La pantalla de carga «se toma su tiempo»
   *    y va contando lo que hace (pedido de JX).
   * ================================================================ */
  var ERRORES = {
    'vacio': 'El archivo está vacío. Descárgalo otra vez de la extranet.',
    'xls-viejo': 'Ese archivo es un Excel antiguo (.xls) o tiene clave. Tiene que ser el .xlsx tal cual lo descarga la extranet.',
    'no-xlsx': 'Ese archivo no es el Excel de la extranet. Tiene que ser el .xlsx tal cual se descarga (no una foto, un PDF ni un Word).',
    'danado': 'El Excel llegó dañado o incompleto. Descárgalo otra vez de la extranet y vuelve a subirlo.',
    'muy-grande': 'El archivo es demasiado grande para ser el listado del día. Revisa que sea el Excel de la extranet.',
    'sin-hojas': 'El Excel no trae ninguna hoja con datos. Descárgalo otra vez de la extranet.',
    'sin-reservas': 'El Excel trae los títulos pero ninguna reserva. Si no hay llegadas, no hay hoja que imprimir.'
  };
  function textoError(e) {
    var c = e && e.codigo;
    if (c === 'sin-columnas') {
      return 'No encontré las columnas de la extranet en ese Excel. ' + (e.faltan && e.faltan.length ? 'Falta' + (e.faltan.length === 1 ? ' la columna ' : 'n las columnas ') + e.faltan.join(', ') + '. ' : '') +
        'Debe ser el listado de llegadas, con Nro reserva, Nro hab, Agencia y Titular.';
    }
    return ERRORES[c] || 'No pude leer ese archivo. Vuelve a descargar el Excel de la extranet e inténtalo otra vez.';
  }
  function mostrarError(texto) {
    var p = $('#subir-error');
    p.textContent = texto || '';
    p.hidden = !texto;
    if (texto) { p.scrollIntoView({ block: 'center' }); }
  }
  function leerBytes(archivo) {
    if (archivo.arrayBuffer) { return archivo.arrayBuffer(); }
    return new Promise(function (ok, mal) {
      var fr = new FileReader();
      fr.onload = function () { ok(fr.result); };
      fr.onerror = function () { mal(fr.error || new Error('lectura')); };
      fr.readAsArrayBuffer(archivo);
    });
  }
  /** Va mostrando en la pantalla de carga cada paso; termina cuando pasó el tiempo de todos. */
  function etapas(t0) {
    var corto = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.45 : 1;
    var pasos = [
      [700, 34, 'Dejando solo reserva, habitaciones, agencia y titular…'],
      [1450, 62, 'Uniendo las habitaciones de cada reserva…'],
      [2150, 88, 'Armando la hoja…'],
      [2800, 97, '']
    ];
    L.progreso(14);
    return new Promise(function (ok) {
      pasos.forEach(function (p, i) {
        setTimeout(function () {
          L.progreso(p[1]);
          if (p[2]) { L.mensaje(p[2]); }
          if (i === pasos.length - 1) { ok(); }
        }, Math.max(0, p[0] * corto - (ahora() - t0)));
      });
    });
  }

  var ocupado = false;
  function procesar(archivo) {
    if (!archivo || ocupado) { return; }
    mostrarError('');
    if (archivo.size > 25 * 1024 * 1024) { mostrarError(ERRORES['muy-grande']); return; }
    ocupado = true;
    var t0 = ahora();
    L.mostrar({ motivo: 'excel', mensaje: 'Leyendo el Excel…' });
    L.progreso(5);
    leerBytes(archivo).then(function (buffer) {
      var armado = Reglas.armar(Lector.leer(buffer));        // aquí se lee y se aplican las reglas (en el equipo)
      return etapas(t0).then(function () { return armado; });
    }).then(function (armado) {
      var nov = cargarListado(armado, archivo.name || 'Excel');
      L.progreso(100);
      L.ocultar({ motivo: 'excel' });
      L.mensaje(null);
      ocupado = false;
      irA('#resumen');
      var t = Reglas.totales(actual.filas);
      aviso('Listo: ' + plural(t.reservas, 'reserva', 'reservas') + ' y ' + plural(t.habitaciones, 'habitación', 'habitaciones') + (nov ? '. Mira las novedades.' : '.'), 3600);
    }).catch(function (e) {
      setTimeout(function () {                               // un instante mínimo para que no parpadee
        L.ocultar({ motivo: 'excel', salida: 'cancelada' });
        L.mensaje(null);
        ocupado = false;
        mostrarError(textoError(e));
      }, Math.max(0, 700 - (ahora() - t0)));
    });
  }

  /** ¿Ese listado guardado es «el mismo día» que el Excel nuevo? (misma fecha de check-in; si no la traen, subido hoy) */
  function esElMismo(x, checkin, hoy) {
    if (x.checkin.length && checkin.length) { return x.checkin.some(function (d) { return checkin.indexOf(d) >= 0; }); }
    return diaDe(x.creado) === hoy;
  }
  /** Crea el listado a partir del Excel ya leído. Si es una descarga más nueva del mismo día, compara y conserva lo hecho a mano. */
  function cargarListado(armado, nombre) {
    var hoy = hoyISO(), momento = ahora();
    var previo = listados.filter(function (x) { return esElMismo(x, armado.checkin, hoy); })[0] || null;
    var nuevo = {
      id: 'l' + momento.toString(36), fecha: hoy, fechaManual: false, creado: momento, actualizado: momento, archivo: nombre,
      filasExcel: armado.filasExcel, sinCodigo: armado.sinCodigo, checkin: armado.checkin, filas: armado.filas, seq: 0, novedades: null
    };
    if (previo) {
      nuevo.novedades = Reglas.fusionar(nuevo.filas, previo.filas, previo.creado);
      nuevo.seq = (previo.seq || 0) + nuevo.novedades.conservadas.agregadas;
      if (previo.fechaManual) { nuevo.fecha = previo.fecha; nuevo.fechaManual = true; }   // si ya le habían cambiado la fecha, se respeta
      listados = listados.filter(function (x) { return x.id !== previo.id; });
    }
    listados.unshift(nuevo);
    listados = listados.slice(0, MAX_HISTORIAL);
    actual = nuevo;
    guardarListados();
    pintarTodo();
    return !!previo;
  }

  function eventosSubir() {
    $('#input-excel').addEventListener('change', function () {
      var f = this.files && this.files[0];
      this.value = '';                                       // así se puede volver a escoger el mismo archivo
      procesar(f);
    });
    /* arrastrar y soltar en cualquier parte de la página */
    var zona = $('#zona-soltar'), dentro = 0;
    function conArchivos(e) { var t = e.dataTransfer && e.dataTransfer.types; return !!t && Array.prototype.indexOf.call(t, 'Files') >= 0; }
    function encima(si) { zona.classList.toggle('soltar--encima', si); document.documentElement.classList.toggle('arrastrando', si); }
    document.addEventListener('dragenter', function (e) { if (conArchivos(e)) { e.preventDefault(); dentro += 1; encima(true); } });
    document.addEventListener('dragover', function (e) { if (conArchivos(e)) { e.preventDefault(); } });
    document.addEventListener('dragleave', function (e) { if (conArchivos(e)) { dentro = Math.max(0, dentro - 1); if (!dentro) { encima(false); } } });
    document.addEventListener('drop', function (e) {
      if (!conArchivos(e)) { return; }
      e.preventDefault(); dentro = 0; encima(false);
      procesar(e.dataTransfer.files && e.dataTransfer.files[0]);
    });
  }

  /* ================================================================
   * 6) PINTAR
   * ================================================================ */
  function pintarTodo() {
    var hay = !!actual;
    document.documentElement.classList.toggle('hay-hoja', hay);
    $('#resumen').hidden = !hay; $('#lista').hidden = !hay; $('#hoja').hidden = !hay; $('#acciones').hidden = !hay;
    $('#soltar-titulo').textContent = hay ? 'Subir otro Excel (uno más nuevo o de otro día)' : 'Escoge el Excel de la extranet';
    if (hay) { pintarListado(); } else { maqueta = null; $('#hojas').innerHTML = ''; }
    pintarHistorial();
  }
  /** Todo lo que depende de las filas del listado actual. */
  function pintarListado() { pintarResumen(); pintarAvisos(); pintarNovedades(); pintarLista(); pintarHoja(); }

  function pintarResumen() {
    var t = Reglas.totales(actual.filas);
    $('#total-hab').textContent = t.habitaciones;
    $('#total-hab-texto').textContent = t.habitaciones === 1 ? 'habitación' : 'habitaciones';
    $('#total-res').textContent = t.reservas;
    $('#total-res-texto').textContent = t.reservas === 1 ? 'reserva' : 'reservas';
    var manual = { corr: 0, agr: 0, quit: 0 };
    actual.filas.forEach(function (f) {
      if (f.quitada) { manual.quit += 1; } else if (f.origen === 'manual') { manual.agr += 1; } else if (Reglas.editada(f)) { manual.corr += 1; }
    });
    var partes = [];
    if (manual.corr) { partes.push(plural(manual.corr, 'corregida', 'corregidas')); }
    if (manual.agr) { partes.push(plural(manual.agr, 'agregada', 'agregadas')); }
    if (manual.quit) { partes.push(plural(manual.quit, 'quitada', 'quitadas')); }
    $('#resumen-origen').innerHTML = 'Excel: <strong>' + esc(actual.archivo) + '</strong> · ' + plural(actual.filasExcel, 'fila de habitación', 'filas de habitación') +
      ' · subido ' + esc(cuando(actual.creado)) + (partes.length ? '<br>Cambios a mano: ' + partes.join(' · ') + '.' : '');
    $('#fecha-hoja').value = actual.fecha;
    $('#btn-fecha-hoy').disabled = actual.fecha === hoyISO();
    $('#fecha-texto').innerHTML = 'En la hoja sale: <strong>Fecha: ' + esc(fechaTexto(actual.fecha)) + '</strong> · ' +
      esc(fechaLarga(actual.fecha)) + (actual.fecha === hoyISO() ? ' (hoy)' : '');
  }

  function pintarAvisos() {
    var a = Reglas.avisos(actual.filas), li = [];
    function linea(tipo, html) { li.push('<li data-tipo="' + tipo + '">' + html + '</li>'); }
    var codigos = function (filas) { return esc(lista(filas.map(function (f) { return f.cod; }))); };
    /* la fecha de la hoja frente al check-in que trae el Excel */
    if (actual.checkin.length && actual.checkin.indexOf(actual.fecha) < 0) {
      // típico del turno de noche: se saca de noche la hoja de las llegadas del día siguiente
      linea('ojo', 'El Excel trae llegadas con check-in del <strong>' + esc(actual.checkin.map(fechaTexto).join(', ')) + '</strong> y la hoja saldrá con fecha <strong>' +
        esc(fechaTexto(actual.fecha)) + '</strong>.' + (actual.checkin.length === 1
          ? ' <button type="button" class="enlace" data-accion="fecha-checkin">Usar ' + esc(fechaTexto(actual.checkin[0])) + '</button>'
          : ' Si es para otro día, cambia la fecha arriba.'));
    } else if (actual.checkin.length > 1) {
      linea('info', 'El Excel trae llegadas de varias fechas: ' + esc(actual.checkin.map(fechaTexto).join(', ')) + '.');
    }
    if (a.sinHab.length) { linea('ojo', plural(a.sinHab.length, 'reserva sin número', 'reservas sin número') + ' de habitaciones: <strong>' + codigos(a.sinHab) + '</strong>. Tócala en la lista para ponerlo.'); }
    if (a.danadas.length) {
      var sug = [];
      a.conSugerencia.forEach(function (f) { Reglas.sugerencias(f.ag + ' ' + f.ti).forEach(function (g) { var t = g.de + ' → ' + g.a; if (sug.indexOf(t) < 0) { sug.push(t); } }); });
      linea('ojo', plural(a.danadas.length, 'reserva trae', 'reservas traen') + ' una letra dañada desde la extranet (tilde o Ñ): <strong>' + codigos(a.danadas) + '</strong>.' +
        (sug.length ? ' <button type="button" class="enlace" data-accion="aplicar-sugerencias">Corregir ' + (sug.length === 1 ? 'la sugerida' : 'las ' + sug.length + ' sugeridas') + '</button><small>' + esc(lista(sug, 3)) + '</small>'
          : ' Tócala en la lista y corrige el nombre.'));
    }
    if (a.noDP.length) { linea('info', plural(a.noDP.length, 'código no empieza', 'códigos no empiezan') + ' por DP: <strong>' + codigos(a.noDP) + '</strong>. ' + (a.noDP.length === 1 ? 'Se incluyó' : 'Se incluyeron') + ' igual en la hoja.'); }
    if (a.otroEstado.length) {
      var estados = [];
      a.otroEstado.forEach(function (f) { if (estados.indexOf('«' + f.preTxt + '»') < 0) { estados.push('«' + f.preTxt + '»'); } });
      linea('info', 'Estado de preregistro distinto a Completo o Incompleto: ' + esc(lista(estados, 3)) + ' (' + codigos(a.otroEstado) + '). Sale tal cual debajo del código.');
    }
    if (a.variantes.length) { linea('info', plural(a.variantes.length, 'reserva trae', 'reservas traen') + ' la agencia o el titular escritos de dos formas en el Excel: <strong>' + codigos(a.variantes) + '</strong>. Se usó la fila del número mayor; tócala para ver la otra forma.'); }
    if (a.reparadas.length) { linea('info', 'Se ' + (a.reparadas.length === 1 ? 'arregló sola una tilde dañada' : 'arreglaron solas las tildes dañadas') + ' en: ' + codigos(a.reparadas) + '.'); }
    if (actual.sinCodigo) { linea('info', 'El Excel traía ' + plural(actual.sinCodigo, 'fila', 'filas') + ' sin código de reserva: no ' + (actual.sinCodigo === 1 ? 'se incluyó' : 'se incluyeron') + '.'); }
    if (!almacenOk || guardadoFallo) {
      linea('ojo', 'Este navegador no deja guardar (¿modo incógnito?): si cierras la página, este listado se pierde. Imprímelo o descarga el PDF antes de cerrar.');
    }
    if (!li.length) { linea('bien', 'Todo en orden: no hay nada raro para revisar.'); }
    $('#lista-avisos').innerHTML = li.join('');
  }

  function pintarNovedades() {
    var n = actual.novedades, caja = $('#novedades');
    if (!n) { caja.hidden = true; return; }
    caja.hidden = false;
    $('#novedades-titulo').textContent = 'Novedades frente a la descarga anterior' + (n.hora ? ' (' + cuando(n.hora).replace(/^hoy a las /, '') + ')' : '');
    var chips = [];
    if (n.nuevas) { chips.push('<span class="chip chip--nueva">' + plural(n.nuevas, 'nueva', 'nuevas') + '</span>'); }
    if (n.cambiaron) { chips.push('<span class="chip chip--cambio">' + plural(n.cambiaron, 'cambió', 'cambiaron') + '</span>'); }
    if (n.yaNo.length) { chips.push('<span class="chip chip--revisar">' + plural(n.yaNo.length, 'ya no está', 'ya no están') + '</span>'); }
    $('#novedades-resumen').innerHTML = chips.length
      ? '<span class="novedades__chips">' + chips.join('') + '</span>' + (n.nuevas || n.cambiaron ? 'Las nuevas y las que cambiaron están marcadas en la lista.' : '')
      : 'Sin cambios: este Excel trae las mismas reservas que el anterior.';
    $('#novedades-lista').innerHTML = n.yaNo.map(function (y, i) {
      return '<li><span><strong>' + esc(y.cod) + '</strong> · ' + (y.hab == null ? 'sin número' : plural(y.hab, 'hab', 'hab')) + ' · ' + esc(y.ag || y.ti || '') +
        ' <small>(ya no viene en el Excel)</small></span><button type="button" class="enlace" data-accion="volver-a-agregar" data-i="' + i + '">Agregarla a mano</button></li>';
    }).join('');
    var c = n.conservadas, partes = [];
    if (c.correcciones) { partes.push(plural(c.correcciones, 'corrección', 'correcciones')); }
    if (c.agregadas) { partes.push(plural(c.agregadas, 'reserva agregada', 'reservas agregadas')); }
    if (c.quitadas) { partes.push(plural(c.quitadas, 'reserva quitada', 'reservas quitadas')); }
    var p = $('#novedades-conservadas');
    p.hidden = !partes.length;
    p.textContent = partes.length ? 'Se conservó lo que habías hecho a mano: ' + partes.join(' · ') + '.' : '';
  }

  function pintarLista() {
    var v = Reglas.visibles(actual.filas);
    $('#lista-reservas').innerHTML = v.length ? v.map(function (f) {
      var marcas = [], marca = '';
      var revisar = Reglas.dudosa(f) || f.hab == null || f.hab < 1;
      if (f.nov === 'nueva') { marcas.push('<span class="chip chip--nueva">Nueva</span>'); marca = 'nueva'; }
      if (f.nov === 'cambio') { marcas.push('<span class="chip chip--cambio">Cambió</span>'); marca = 'cambio'; }
      if (f.origen === 'manual') { marcas.push('<span class="chip chip--mano">Agregada a mano</span>'); }
      else if (Reglas.editada(f)) { marcas.push('<span class="chip chip--mano">Corregida a mano</span>'); }
      if (!Reglas.esDP(f.cod)) { marcas.push('<span class="chip">No es DP</span>'); }
      if (Reglas.dudosa(f)) { marcas.push('<span class="chip chip--revisar">Revisar letra</span>'); }
      if (f.hab == null || f.hab < 1) { marcas.push('<span class="chip chip--revisar">Falta el nro. hab</span>'); }
      if (revisar) { marca = 'revisar'; }
      var pre = Reglas.textoPre(f);
      // el lector de pantalla oye todo («Corregir la reserva DP…, 2 habitaciones, agencia…, titular…, Nueva»); lo «solo-lector» no se ve
      return '<li><button type="button" class="reserva" data-id="' + esc(f.id) + '"' + (marca ? ' data-marca="' + marca + '"' : '') + '>' +
        '<span class="reserva__hab" aria-hidden="true">' + (f.hab == null ? '?' : f.hab) + '</span>' +
        '<span class="reserva__cuerpo">' +
          '<span class="reserva__cod"><span class="solo-lector">Corregir la reserva </span>' + esc(f.cod) +
            (pre ? '<span class="solo-lector">, </span><span class="reserva__pre">' + esc(pre) + '</span>' : '') + '</span>' +
          '<span class="solo-lector">, ' + (f.hab == null ? 'sin número de habitaciones' : plural(f.hab, 'habitación', 'habitaciones')) + ', agencia: </span>' +
          '<span class="reserva__ag">' + (f.ag ? esc(f.ag) : '<small>Sin agencia</small>') + '</span>' +
          '<span class="solo-lector">, titular: </span>' +
          '<span class="reserva__ti">' + (f.ti ? esc(f.ti) : '<small>Sin titular</small>') + '</span>' +
          '<span class="reserva__marcas">' + marcas.join('') + '</span>' +
          (f.novDetalle ? '<span class="reserva__detalle">' + esc(f.novDetalle) + '</span>' : '') +
        '</span><span class="reserva__editar" aria-hidden="true">Corregir</span></button></li>';
    }).join('') : '<li class="tarjeta nota">No queda ninguna reserva en la hoja. Agrega una o devuelve alguna de las quitadas.</li>';
    var q = actual.filas.filter(function (f) { return f.quitada; });
    $('#quitadas').hidden = !q.length;
    $('#quitadas-num').textContent = '(' + q.length + ')';
    $('#lista-quitadas').innerHTML = q.map(function (f) {
      return '<li><span><strong>' + esc(f.cod) + '</strong> · ' + (f.hab == null ? 'sin número' : f.hab + ' hab') + ' · ' + esc(f.ag || f.ti || '') + '</span>' +
        '<button type="button" class="enlace" data-accion="devolver" data-id="' + esc(f.id) + '">Devolver a la hoja</button></li>';
    }).join('');
  }

  /** Acomoda la hoja (js/hoja.js) y la muestra. Lo mismo que se ve es lo que se imprime y lo que va al PDF. */
  function pintarHoja() {
    var v = Reglas.visibles(actual.filas);
    maqueta = Hoja.maquetar({
      fecha: fechaTexto(actual.fecha), casilla: ajustes.casilla === true, apretar: ajustes.apretar !== false,
      filas: v.map(function (f) { return { cod: f.cod, hab: f.hab, ag: f.ag, ti: f.ti, pre: Reglas.textoPre(f) }; })
    });
    $('#hojas').innerHTML = maqueta.paginas.map(function (p, i) { return '<div class="hoja__pagina">' + Hoja.svg(maqueta, i) + '</div>'; }).join('');
    var n = maqueta.paginas.length;
    $('#hoja-ayuda').textContent = 'Así sale por la impresora y en el PDF: ' + plural(n, 'hoja', 'hojas') + ' tamaño carta' +
      (n > 1 ? ' (son muchas reservas y no caben en una).' : maqueta.densidad !== 'amplia' ? ' (con la letra un poco más apretada para que quepa en una).' : '.');
  }

  function irA(sel) {
    var s = $(sel);
    if (s && s.scrollIntoView) { s.scrollIntoView({ block: 'start' }); }
  }

  /* ================================================================
   * 7) CORREGIR, AGREGAR Y QUITAR RESERVAS (diálogo #dlg-reserva)
   *    Lo hecho a mano se marca en pantalla, nunca en la hoja.
   * ================================================================ */
  var editando = null;                                       // id de la fila, o null si es una reserva nueva
  function chipsDe(caja, titulo, valores, campo) {
    caja.hidden = !valores.length;
    caja.innerHTML = valores.length ? '<span>' + titulo + '</span>' + valores.map(function (v) {
      return '<button type="button" class="boton boton--secundario" data-poner="' + campo + '" data-valor="' + esc(v) + '">' + esc(v) + '</button>';
    }).join('') : '';
  }
  /** Sugerencias debajo de cada campo: otra forma que traía el Excel y letras dañadas con arreglo conocido. */
  function pintarSugerencias(f) {
    ['ag', 'ti'].forEach(function (campo) {
      var entrada = $('#r-' + campo), valores = [];
      var arreglado = Reglas.aplicarSugerencias(entrada.value);
      if (arreglado !== entrada.value) { valores.push(arreglado); }
      if (f && f.origen === 'excel') {
        (campo === 'ag' ? f.varAg : f.varTi).forEach(function (x) { if (x !== entrada.value && valores.indexOf(x) < 0) { valores.push(x); } });
        if (f.base && f.base[campo] && f.base[campo] !== entrada.value && valores.indexOf(f.base[campo]) < 0 && (campo === 'ag' ? f.varAg : f.varTi).length) { valores.push(f.base[campo]); }
      }
      chipsDe($('#r-var-' + campo), valores.length ? 'Usar:' : '', valores, campo);
    });
  }
  function abrirEditor(id, prellenar) {
    var f = id ? filaPorId(id) : null, d = f || prellenar || {};
    editando = f ? f.id : null;
    $('#dlg-reserva-titulo').textContent = f ? 'Corregir reserva' : 'Agregar reserva';
    $('#r-origen').textContent = !f ? 'Para una reserva que no vino en el Excel. En pantalla queda marcada como «agregada a mano»; en la hoja sale igual a las demás.'
      : f.origen === 'manual' ? 'Esta reserva la agregaste a mano.'
        : 'Viene del Excel (' + plural(f.nFilas, 'fila', 'filas') + ').' + (Reglas.editada(f) ? ' Tiene cambios hechos a mano.' : '');
    $('#r-cod').value = d.cod || ''; $('#r-hab').value = d.hab == null ? '' : d.hab; $('#r-ag').value = d.ag || ''; $('#r-ti').value = d.ti || '';
    var sel = $('#r-pre'), otra = sel.querySelector('option[value="otro"]');
    if (otra) { otra.remove(); }
    if (d.pre === 'otro' && d.preTxt) {
      var o = document.createElement('option'); o.value = 'otro'; o.textContent = 'Como viene: «' + d.preTxt + '»'; o.setAttribute('data-texto', d.preTxt); sel.appendChild(o);
    }
    sel.value = f || prellenar ? (d.pre || '') : 'sin';
    $('#r-error').hidden = true;
    $('#r-restaurar').hidden = !(f && Reglas.editada(f));
    $('#r-quitar').hidden = !f;
    $('#r-quitar').textContent = f && f.origen === 'manual' ? 'Borrar esta reserva' : 'Quitar de la hoja';
    pintarSugerencias(f);
    var dlg = $('#dlg-reserva');
    if (typeof dlg.showModal === 'function') { dlg.showModal(); } else { dlg.setAttribute('open', ''); }
    // con mouse: el cursor queda listo para escribir. En celular no: el teclado taparía medio diálogo.
    setTimeout(function () {
      var tactil = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
      if (tactil) { $('#dlg-reserva-titulo').focus(); } else { (f ? $('#r-ag') : $('#r-cod')).focus(); }
    }, 30);
  }
  function cerrarEditor() { var dlg = $('#dlg-reserva'); if (dlg.open && dlg.close) { dlg.close(); } else { dlg.removeAttribute('open'); } }
  function errorEditor(texto, campo) { var e = $('#r-error'); e.textContent = texto; e.hidden = false; if (campo) { campo.focus(); } }

  function guardarEditor() {
    var f = editando ? filaPorId(editando) : null;
    var cod = Reglas.limpiar($('#r-cod').value).replace(/\s+/g, '');
    if (!f || cod !== f.cod) { cod = cod.toUpperCase(); }
    if (!cod) { errorEditor('Escribe el número de la reserva (por ejemplo, DP130033).', $('#r-cod')); return; }
    var repetida = actual.filas.filter(function (x) { return x !== f && Reglas.llave(x.cod) === Reglas.llave(cod); })[0];
    if (repetida) {
      errorEditor(repetida.quitada ? 'Esa reserva está en «Quitadas de la hoja»: devuélvela desde ahí.' : 'Ya hay una reserva con ese número en la lista.', $('#r-cod'));
      return;
    }
    var habTxt = Reglas.limpiar($('#r-hab').value), hab = /^\d{1,3}$/.test(habTxt) ? parseInt(habTxt, 10) : 0;
    if (hab < 1) { errorEditor('Escribe cuántas habitaciones tiene (un número del 1 al 999).', $('#r-hab')); return; }
    var sel = $('#r-pre'), pre = sel.value, opcion = sel.options[sel.selectedIndex];
    var datos = { cod: cod, hab: hab, ag: Reglas.limpiar($('#r-ag').value), ti: Reglas.limpiar($('#r-ti').value), pre: pre, preTxt: pre === 'otro' && opcion ? opcion.getAttribute('data-texto') || '' : '' };
    if (f) {
      Reglas.CAMPOS.forEach(function (c) { f[c] = datos[c]; });
      aviso('Reserva ' + cod + ' guardada.', 2200);
    } else {
      actual.seq = (actual.seq || 0) + 1;
      actual.filas.push(Reglas.filaManual(datos, actual.seq));
      aviso('Reserva ' + cod + ' agregada a la hoja.', 2400);
    }
    tocar(); cerrarEditor(); pintarListado(); pintarHistorial();
  }

  function eventosEditar() {
    $('#lista-reservas').addEventListener('click', function (e) {
      var b = e.target.closest('.reserva');
      if (b) { abrirEditor(b.getAttribute('data-id')); }
    });
    $('#btn-agregar').addEventListener('click', function () { abrirEditor(null); });
    $('#r-cancelar').addEventListener('click', cerrarEditor);
    $('#form-reserva').addEventListener('submit', function (e) { e.preventDefault(); guardarEditor(); });
    /* chips «Usar: …» → ponen ese texto en el campo */
    $('#form-reserva').addEventListener('click', function (e) {
      var b = e.target.closest('[data-poner]');
      if (!b) { return; }
      $('#r-' + b.getAttribute('data-poner')).value = b.getAttribute('data-valor');
      pintarSugerencias(editando ? filaPorId(editando) : null);
    });
    ['ag', 'ti'].forEach(function (c) { $('#r-' + c).addEventListener('input', function () { pintarSugerencias(editando ? filaPorId(editando) : null); }); });
    $('#r-restaurar').addEventListener('click', function () {
      var f = editando ? filaPorId(editando) : null;
      if (!f || !f.base) { return; }
      Reglas.CAMPOS.forEach(function (c) { f[c] = f.base[c]; });
      tocar(); cerrarEditor(); pintarListado(); pintarHistorial(); aviso('Volvió a lo que dice el Excel.', 2200);
    });
    $('#r-quitar').addEventListener('click', function () {
      var f = editando ? filaPorId(editando) : null;
      if (!f) { return; }
      cerrarEditor();
      if (f.origen === 'manual') {
        confirmar('¿Borrar la reserva ' + f.cod + '? La agregaste a mano y no se puede recuperar.', 'Borrar').then(function (si) {
          if (!si) { return; }
          actual.filas = actual.filas.filter(function (x) { return x !== f; });
          tocar(); pintarListado(); pintarHistorial(); aviso('Reserva borrada.', 2000);
        });
        return;
      }
      f.quitada = true;
      tocar(); pintarListado(); pintarHistorial();
      aviso('Quitada de la hoja. Puedes devolverla abajo, en «Quitadas de la hoja».', 3600);
    });
    /* acciones de los avisos, las novedades y las quitadas */
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-accion]');
      if (!b || !actual) { return; }
      var acc = b.getAttribute('data-accion');
      if (acc === 'devolver') {
        var f = filaPorId(b.getAttribute('data-id'));
        if (f) { f.quitada = false; tocar(); pintarListado(); pintarHistorial(); aviso('Reserva ' + f.cod + ' devuelta a la hoja.', 2200); }
      } else if (acc === 'aplicar-sugerencias') {
        var n = 0;
        Reglas.avisos(actual.filas).conSugerencia.forEach(function (x) {
          var ag = Reglas.aplicarSugerencias(x.ag), ti = Reglas.aplicarSugerencias(x.ti);
          if (ag !== x.ag || ti !== x.ti) { x.ag = ag; x.ti = ti; n += 1; }
        });
        tocar(); pintarListado(); aviso(plural(n, 'reserva corregida', 'reservas corregidas') + '. Revísalas en la lista.', 2800);
      } else if (acc === 'fecha-checkin') {
        if (actual.checkin.length !== 1) { return; }
        actual.fecha = actual.checkin[0]; actual.fechaManual = actual.fecha !== hoyISO();
        tocar(); pintarResumen(); pintarAvisos(); pintarHoja(); pintarHistorial();
        aviso('La hoja sale con fecha ' + fechaTexto(actual.fecha) + '.', 2400);
      } else if (acc === 'volver-a-agregar') {
        var i = +b.getAttribute('data-i'), y = actual.novedades && actual.novedades.yaNo[i];
        if (!y) { return; }
        actual.seq = (actual.seq || 0) + 1;
        actual.filas.push(Reglas.filaManual(y, actual.seq));
        actual.novedades.yaNo.splice(i, 1);
        tocar(); pintarListado(); pintarHistorial(); aviso('Reserva ' + y.cod + ' agregada a mano.', 2400);
      }
    });
    /* fecha de la hoja */
    $('#fecha-hoja').addEventListener('change', function () {
      if (!actual) { return; }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(this.value)) { this.value = actual.fecha; return; }
      actual.fecha = this.value; actual.fechaManual = this.value !== hoyISO();
      tocar(); pintarResumen(); pintarAvisos(); pintarHoja(); pintarHistorial();
    });
    $('#btn-fecha-hoy').addEventListener('click', function () {
      if (!actual) { return; }
      actual.fecha = hoyISO(); actual.fechaManual = false;
      tocar(); pintarResumen(); pintarAvisos(); pintarHoja(); pintarHistorial();
    });
  }

  /* ================================================================
   * 8) SALIDA — imprimir, descargar PDF y compartir
   * ================================================================ */
  function tituloHoja() { return 'Reservas DP · Hotel Dorado Plaza Bocagrande · ' + fechaTexto(actual.fecha); }
  function hacerPdf() {
    return new Blob([Hoja.pdf(maqueta, { titulo: tituloHoja(), creado: new Date() })], { type: 'application/pdf' });
  }
  function descargar(blob, nombre) {
    var url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = nombre; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 8000);
  }
  function eventosSalida() {
    $('#btn-imprimir').addEventListener('click', function () {
      if (!actual || !maqueta) { return; }
      window.print();                                        // @media print (estilos.css) deja solo la hoja
    });
    // al imprimir (botón o Ctrl+P), «Guardar como PDF» propone el mismo nombre que la descarga
    var tituloPagina = document.title;
    window.addEventListener('beforeprint', function () { if (actual && maqueta) { document.title = Hoja.nombreArchivo(actual.fecha).replace(/\.pdf$/i, ''); } });
    window.addEventListener('afterprint', function () { document.title = tituloPagina; });
    $('#btn-pdf').addEventListener('click', function () {
      if (!actual || !maqueta) { return; }
      var nombre = Hoja.nombreArchivo(actual.fecha);
      descargar(hacerPdf(), nombre);
      aviso('PDF descargado: ' + nombre, 3200);
    });
    $('#btn-compartir').addEventListener('click', function () {
      if (!actual || !maqueta) { return; }
      var nombre = Hoja.nombreArchivo(actual.fecha), blob = hacerPdf(), archivo = null;
      try { archivo = new File([blob], nombre, { type: 'application/pdf' }); } catch (e) { archivo = null; }
      if (archivo && navigator.canShare && navigator.share && navigator.canShare({ files: [archivo] })) {
        // solo el archivo: en iPhone, si va con texto, WhatsApp a veces manda el texto y se pierde el PDF (WebKit, bug 251500)
        navigator.share({ files: [archivo] })
          .catch(function (e) {
            if (e && e.name === 'AbortError') { return; }       // la persona cerró el menú de compartir
            descargar(blob, nombre);
            aviso('No se pudo abrir «Compartir»: se descargó el PDF para que lo adjuntes.', 4600);
          });
      } else {
        descargar(blob, nombre);
        aviso('Este navegador no comparte archivos directamente: se descargó el PDF para que lo adjuntes en WhatsApp.', 5200);
      }
    });
  }

  /* ================================================================
   * 9) HISTORIAL — los listados guardados en este equipo
   * ================================================================ */
  function pintarHistorial() {
    $('#historial-vacio').hidden = listados.length > 0;
    $('#historial-nota').hidden = !listados.length;
    $('#historial-nota-texto').textContent = almacenOk
      ? 'Se guardan hasta ' + MAX_HISTORIAL + ' listados, solo en este equipo. Si el equipo es compartido, bórralos cuando ya no los necesites.'
      : 'Este navegador no deja guardar (¿modo incógnito?): el historial dura solo mientras esta página esté abierta.';
    $('#lista-historial').innerHTML = listados.map(function (x) {
      var t = Reglas.totales(x.filas), enPantalla = actual && actual.id === x.id;
      return '<li' + (enPantalla ? ' aria-current="true"' : '') + '><span class="historial__info">' +
        '<span class="historial__fecha">' + esc(fechaCorta(x.fecha)) + (enPantalla ? ' <span class="chip chip--cambio">En pantalla</span>' : '') + '</span>' +
        '<span class="historial__meta">' + plural(t.habitaciones, 'habitación', 'habitaciones') + ' · ' + plural(t.reservas, 'reserva', 'reservas') + ' · subido ' + esc(cuando(x.creado)) + '</span></span>' +
        '<span class="historial__botones">' +
        (enPantalla ? '' : '<button type="button" class="boton boton--secundario boton--chico" data-historial="abrir" data-id="' + esc(x.id) + '">Abrir</button>') +
        '<button type="button" class="enlace enlace--peligro" data-historial="borrar" data-id="' + esc(x.id) + '" aria-label="Borrar el listado del ' + esc(fechaCorta(x.fecha)) + '">Borrar</button></span></li>';
    }).join('');
  }
  function eventosHistorial() {
    $('#lista-historial').addEventListener('click', function (e) {
      var b = e.target.closest('[data-historial]');
      if (!b) { return; }
      var id = b.getAttribute('data-id'), x = listados.filter(function (l) { return l.id === id; })[0];
      if (!x) { return; }
      if (b.getAttribute('data-historial') === 'abrir') {
        actual = x; guardarListados(); mostrarError(''); pintarTodo(); irA('#resumen');
        aviso('Listado del ' + fechaCorta(x.fecha) + ' en pantalla.', 2400);
        return;
      }
      confirmar('¿Borrar el listado del ' + fechaCorta(x.fecha) + '? No se puede recuperar.', 'Borrar').then(function (si) {
        if (!si) { return; }
        listados = listados.filter(function (l) { return l.id !== id; });
        if (actual && actual.id === id) { actual = null; }
        guardarListados(); pintarTodo(); aviso('Listado borrado.', 2000);
      });
    });
    $('#btn-borrar-historial').addEventListener('click', function () {
      confirmar('¿Borrar los ' + listados.length + ' listados guardados en este equipo? No se pueden recuperar.', 'Borrar todo').then(function (si) {
        if (!si) { return; }
        listados = []; actual = null;
        guardarListados(); pintarTodo(); aviso('Historial borrado.', 2200);
      });
    });
  }

  /* ================================================================
   * 10) TEMA Y AJUSTES
   *     Modo noche automático de 6 p. m. a 6 a. m. (misma regla que
   *     js/tema.js, que lo pone antes de pintar). Solo cambia la pantalla.
   * ================================================================ */
  function temaEfectivo() {
    if (ajustes.tema === 'claro' || ajustes.tema === 'oscuro') { return ajustes.tema; }
    var h = new Date(ahora() - OFFSET).getUTCHours();
    return (h >= 18 || h < 6) ? 'oscuro' : 'claro';
  }
  function aplicarTema() {
    var t = temaEfectivo();
    if (document.documentElement.getAttribute('data-tema') !== t) { document.documentElement.setAttribute('data-tema', t); }
    var meta = $('meta[name="theme-color"]');
    if (meta) { meta.setAttribute('content', t === 'oscuro' ? '#16120C' : '#FBF8F1'); }
    var nombres = { auto: 'automático', claro: 'claro', oscuro: 'noche' };
    $('#btn-tema-texto').textContent = 'Tema: ' + nombres[ajustes.tema] + (ajustes.tema === 'auto' ? (t === 'oscuro' ? ' (noche)' : ' (día)') : '');
  }
  function eventosAjustes() {
    $('#btn-tema').addEventListener('click', function () {
      ajustes.tema = { auto: 'claro', claro: 'oscuro', oscuro: 'auto' }[ajustes.tema] || 'auto';
      guardar('ajustes', ajustes); aplicarTema();
    });
    $('#aj-casilla').checked = ajustes.casilla === true;
    $('#aj-casilla').addEventListener('change', function () {
      ajustes.casilla = this.checked; guardar('ajustes', ajustes);
      if (actual) { pintarHoja(); }
    });
    $('#aj-apretar').checked = ajustes.apretar !== false;
    $('#aj-apretar').addEventListener('change', function () {
      ajustes.apretar = this.checked; guardar('ajustes', ajustes);
      if (actual) { pintarHoja(); }
    });
    setInterval(function () { if (ajustes.tema === 'auto') { aplicarTema(); } }, 60000);
  }

  /* ================================================================
   * 11) DIÁLOGO DE CONFIRMAR Y AVISO FLOTANTE
   * ================================================================ */
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
  var tAviso = 0;
  function aviso(texto, ms, alerta) {
    var el = $('#aviso');
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

  /* ================================================================
   * 12) ARRANQUE
   * ================================================================ */
  function iniciar() {
    aplicarTema();
    eventosSubir(); eventosEditar(); eventosSalida(); eventosHistorial(); eventosAjustes();
    /* si el último listado es de hoy (o tiene fecha de hoy en adelante), vuelve a estar en pantalla */
    var id = leer('actual', null), hoy = hoyISO();
    var ultimo = listados.filter(function (x) { return x.id === id; })[0];
    if (ultimo && (diaDe(ultimo.creado) === hoy || ultimo.fecha >= hoy)) { actual = ultimo; }
    pintarTodo();
    /* la pantalla de carga se va cuando están listas las letras (también las de la hoja) */
    var letras = [];
    if (document.fonts && document.fonts.load) {
      letras.push(document.fonts.load('400 12px "Hoja Sans"').catch(nada), document.fonts.load('700 12px "Hoja Sans"').catch(nada));
      if (document.fonts.ready) { letras.push(Promise.resolve(document.fonts.ready).catch(nada)); }
    }
    L.seguir(letras.length ? letras : [Promise.resolve()], { mensaje: 'Preparando el listado…' });
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', iniciar); } else { iniciar(); }
})(window, document);
