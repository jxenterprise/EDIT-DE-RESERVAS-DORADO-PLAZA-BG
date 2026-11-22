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
 *   13 Nube y cuenta (v1.3): entrar, guardar en la nube, roles, administración
 *
 *  Conceptos:
 *   · «listado»: lo que salió de UN Excel (más lo corregido a mano). Tiene
 *     fecha (la que sale en la hoja: por defecto HOY), filas y novedades.
 *   · «actual»: el listado que está en pantalla.
 *   · Se guardan hasta 30 listados en este equipo (historial). Con la nube
 *     activa (v1.3) el historial es de todos y dura 30 días (módulo 13).
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
  var MAX_HISTORIAL = 30;                                  // sin nube; con la nube: lo de 30 días (máx. 90 listados)
  function maxHistorial() { return nubeActiva() ? (esAdmin() ? 200 : 90) : MAX_HISTORIAL; }   // v1.15: el admin ve los de todos
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
      reparada: !!f.reparada, nov: f.nov === 'nueva' || f.nov === 'cambio' ? f.nov : '', novDetalle: typeof f.novDetalle === 'string' ? f.novDetalle : '',
      tf: +f.tf || 0                                        // hora del último cambio de esta línea (para mezclar dos equipos, v1.3)
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
      autor: typeof x.autor === 'string' ? x.autor.slice(0, 40) : '',                        // quién subió el Excel (con la nube)
      autorId: +x.autorId || 0,                                                               // v1.15: su número de usuario (dueño)
      borradas: Array.isArray(x.borradas) ? x.borradas.filter(function (b) { return typeof b === 'string'; }).slice(-300) : [],   // líneas borradas a mano
      tFecha: +x.tFecha || 0,
      novedades: n ? {
        hora: +n.hora || 0, nuevas: +n.nuevas || 0, cambiaron: +n.cambiaron || 0,
        yaNo: Array.isArray(n.yaNo) ? n.yaNo.filter(function (y) { return esObjeto(y) && typeof y.cod === 'string'; }) : [],
        conservadas: Object.assign({ correcciones: 0, agregadas: 0, quitadas: 0 }, esObjeto(n.conservadas) ? n.conservadas : {})
      } : null
    };
  }
  var guardados = leer('listados', []);
  var listados = (Array.isArray(guardados) ? guardados : []).map(listadoSano).filter(Boolean).slice(0, 90);
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
    // v1.15 (JX: «cada que entre va a estar ahí esa reserva… es molestoso»): el listado en pantalla se recuerda
    // solo en ESTA pestaña (sessionStorage): al recargar sigue; al entrar o en una pestaña nueva, pantalla limpia.
    sesionGuardar('actual', actual ? actual.id : null);
    guardadoFallo = !bien;
    if (!bien) { avisarNoGuarda(); }
  }
  /** Anota que el listado cambió, lo guarda y (con la nube) programa la subida. «que» = lo que se hizo, para «Quién hizo qué». */
  function tocar(que) {
    if (actual) { actual.actualizado = ahora(); }
    guardarListados();
    if (actual) { nubeCambio(actual, que); }
    if (que) { avisarGuardado(que, true); }                  // v1.11: «Datos guardados exitosamente» (+ nube)
  }
  /** Marca una línea como cambiada ahora (para que gane al mezclar con otro equipo). */
  function marcar(f) { if (f) { f.tf = ahora(); } return f; }
  function filaPorId(id) { return actual ? actual.filas.filter(function (f) { return f.id === id; })[0] : null; }

  /* ================================================================
   * 5) SUBIR Y LEER EL EXCEL
   *    Todo pasa en este equipo. La pantalla de carga «se toma su tiempo»
   *    y va contando lo que hace (pedido de JX).
   * ================================================================ */
  /* v1.8 (JX): el Excel de la extranet siempre se llama así. Se muestra en los textos y en los errores; si el
     archivo se llama distinto se lee igual (lo que decide son las columnas) pero sale un aviso amarillo «Ojo». */
  var NOMBRE_EXCEL = 'EXTRANET  DORADO PLAZA.xlsx';
  /** ¿Ese nombre es el de la extranet? (sin importar mayúsculas, espacios ni el «(1)» que pone el navegador al repetir la descarga) */
  function esNombreExtranet(n) {
    var limpio = String(n || '').toLowerCase().replace(/\.xlsx$/, '').replace(/\s*\(\d+\)\s*$/, '').replace(/[\s_]+/g, ' ').trim();
    return limpio === 'extranet dorado plaza';
  }
  var ERRORES = {
    'vacio': 'El archivo está vacío. Descárgalo otra vez de la extranet.',
    'xls-viejo': 'Ese archivo es un Excel antiguo (.xls) o tiene clave. Tiene que ser el listado de reservas tal cual lo descarga la extranet («' + NOMBRE_EXCEL + '»).',
    'no-xlsx': 'Ese archivo no es un Excel. Sube el listado de reservas tal cual se descarga de la extranet («' + NOMBRE_EXCEL + '»), no una foto, un PDF ni un Word.',
    'danado': 'El Excel llegó dañado o incompleto. Descárgalo otra vez de la extranet y vuelve a subirlo.',
    'muy-grande': 'El archivo es demasiado grande para ser el listado del día. Revisa que sea el Excel de la extranet.',
    'sin-hojas': 'El Excel no trae ninguna hoja con datos. Descarga otra vez de la extranet el listado de reservas («' + NOMBRE_EXCEL + '»).',
    'sin-reservas': 'El Excel trae los títulos pero ninguna reserva. Si no hay llegadas, no hay hoja que imprimir.'
  };
  function textoError(e) {
    var c = e && e.codigo;
    if (c === 'sin-columnas') {
      return 'Ese Excel no es el listado de reservas de la extranet: ' + (e.faltan && e.faltan.length ? 'le falta' + (e.faltan.length === 1 ? ' la columna ' : 'n las columnas ') + e.faltan.join(', ') + '. ' : 'no trae sus columnas. ') +
        'Asegúrate de subir el verdadero listado de reservas que se descarga de la extranet («' + NOMBRE_EXCEL + '»).';
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
  /** Pantalla de carga al leer el Excel (v1.3, igual que al abrir): el % sube PAREJO de 0 a 100 en
   *  2,5 s (CARGA_TOTAL_MS) sin pausas, y va diciendo cada paso. Termina cuando llega a 100. */
  function etapas(t0) {
    // v1.9/v1.11 (JX): al leer el Excel la pantalla de carga se toma 10 s (CARGA_EXCEL_MS) y el logo da VUELTAS_EXCEL vueltas
    // completas (se completa y vuelve a empezar) mientras el % sube parejo hasta 100; la última vuelta termina en 100.
    var total = CARGA_EXCEL_MS * (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.45 : 1);
    var pasos = [[0.16, 'Revisando que sea el listado de la extranet…'], [0.34, 'Dejando solo reserva, habitaciones, agencia y titular…'],
      [0.52, 'Uniendo las habitaciones de cada reserva…'], [0.7, 'Ordenando por habitaciones…'], [0.86, 'Armando la hoja…']];
    return new Promise(function (ok) {
      var dicho = 0, t = setInterval(function () {
        var f = Math.min(1, (ahora() - t0) / total);
        L.progreso(f * 100);
        while (dicho < pasos.length && f >= pasos[dicho][0]) { L.mensaje(pasos[dicho][1]); dicho += 1; }
        if (f >= 1) { clearInterval(t); setTimeout(ok, CARGA_VER_100_MS); }
      }, 40);
    });
  }

  var ocupado = false;
  function procesar(archivo) {
    if (!archivo || ocupado) { return; }
    mostrarError('');
    if (archivo.size > 25 * 1024 * 1024) { mostrarError(ERRORES['muy-grande']); return; }
    ocupado = true;
    var t0 = ahora();
    if (L.configurar) { L.configurar({ vueltas: VUELTAS_EXCEL }); }
    L.mostrar({ motivo: 'excel', mensaje: 'Leyendo el Excel…' });
    L.progreso(100); L.progreso(0);                          // arranca en 0 (el cargador recuerda el % anterior)
    leerBytes(archivo).then(function (buffer) {
      var armado = Reglas.armar(Lector.leer(buffer));        // aquí se lee y se aplican las reglas (en el equipo)
      return etapas(t0).then(function () { return armado; });
    }).then(function (armado) {
      var nov = cargarListado(armado, archivo.name || 'Excel');
      L.progreso(100);
      L.ocultar({ motivo: 'excel' }); vueltasNormales();
      L.mensaje(null);
      ocupado = false;
      irA('#resumen');
      var t = Reglas.totales(actual.filas), lst = actual;
      (lst.checkin.length > 1 && !lst.fechaManual ? elegirFecha(lst) : Promise.resolve()).then(function () {
        return resultado('ok', '¡Listado listo!', plural(t.reservas, 'reserva', 'reservas') + ' y ' + plural(t.habitaciones, 'habitación', 'habitaciones') +
          ' del ' + fechaHoja(lst.fecha) + (nov ? '. Es una descarga más nueva del mismo día: mira las novedades.' : '. Revisa la lista y saca la hoja.'));   // v1.5: ✓ verde (pedido de JX)
      }).then(mostrarGuia);                                  // y al cerrarlo, la guía «tu hoja está aquí abajo» (una vez)
    }).catch(function (e) {
      setTimeout(function () {                               // un instante mínimo para que no parpadee
        L.ocultar({ motivo: 'excel', salida: 'cancelada' }); vueltasNormales();
        L.mensaje(null);
        ocupado = false;
        mostrarError(textoError(e));
        // v1.8 (JX): además la ✗ roja; si es otro archivo, «Excel incorrecto». Se queda hasta que la cierren.
        var c = e && e.codigo, otro = c === 'sin-columnas' || c === 'no-xlsx' || c === 'xls-viejo' || c === 'sin-hojas';
        resultado('error', otro ? 'Excel incorrecto' : 'No se pudo leer el Excel', textoError(e));
      }, Math.max(0, 700 - (ahora() - t0)));
    });
  }

  function idListado() { return 'l' + ahora().toString(36) + Math.floor(Math.random() * 1296).toString(36); }
  /** La fecha que trae el Excel (un solo día de check-in); '' si trae varios; hoy si no trae (v1.10). */
  function fechaDelExcel(l) { return l.checkin.length === 1 ? l.checkin[0] : (l.checkin.length ? '' : hoyISO()); }
  /** «sábado 22/11/2026»: así sale la fecha en la hoja (v1.10). */
  function fechaHoja(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    return m ? DIAS[new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).getUTCDay()] + ' ' + fechaTexto(iso) : fechaTexto(iso);
  }
  /** Varios días en el mismo Excel (casi nunca): «¿De qué fecha es la hoja?» con un botón por fecha. Esc = la primera. */
  function elegirFecha(l) {
    return new Promise(function (ok) {
      var dlg = $('#dlg-fecha'), caja = $('#fecha-opciones');
      caja.innerHTML = l.checkin.slice(0, 6).map(function (d, i) {
        return '<button type="button" class="boton ' + (i ? 'boton--secundario' : 'boton--primario') + '" data-fecha="' + esc(d) + '">' + esc(fechaHoja(d)) + '</button>';
      }).join('');
      function fin(d) {
        caja.removeEventListener('click', alClic); dlg.removeEventListener('cancel', alCancelar);
        if (dlg.open && dlg.close) { dlg.close(); } else { dlg.removeAttribute('open'); }
        if (d && actual === l) {
          l.fecha = d; l.fechaManual = true; l.tFecha = ahora();
          tocar('Escogió la fecha de la hoja: ' + fechaTexto(d)); pintarResumen(); pintarAvisos(); pintarHoja(); pintarHistorial();
        }
        ok();
      }
      function alClic(e) { var b = e.target.closest('[data-fecha]'); if (b) { fin(b.getAttribute('data-fecha')); } }
      function alCancelar(e) { if (e && e.preventDefault) { e.preventDefault(); } fin(null); }
      caja.addEventListener('click', alClic); dlg.addEventListener('cancel', alCancelar);
      abrirDialogo('#dlg-fecha');
      setTimeout(function () { var b = caja.querySelector('button'); if (b) { b.focus(); } }, 40);
    });
  }
  /** Crea el listado a partir del Excel ya leído.
   *  v1.15 (JX: «siempre uno nuevo aparte»): cada Excel que se sube queda como un listado SEPARADO en el
   *  historial, también si es del mismo día (antes se juntaba con el anterior y marcaba las novedades). */
  function cargarListado(armado, nombre) {
    var hoy = hoyISO(), momento = ahora();
    var previo = null;
    var nuevo = {
      // v1.10 (JX): la hoja lleva la fecha de las reservas (la del check-in del Excel), no la de hoy.
      // Sin columna de check-in → hoy. Varios días (casi nunca) → la primera y luego se pregunta (elegirFecha).
      id: idListado(), fecha: armado.checkin.length ? armado.checkin[0] : hoy, fechaManual: false, creado: momento, actualizado: momento, archivo: nombre,
      filasExcel: armado.filasExcel, sinCodigo: armado.sinCodigo, checkin: armado.checkin, filas: armado.filas, seq: 0, novedades: null,
      autor: nube.usuario ? nube.usuario.nombre : '', autorId: nube.usuario ? nube.usuario.id : 0, borradas: [], tFecha: 0
    };
    if (previo) {
      nuevo.novedades = Reglas.fusionar(nuevo.filas, previo.filas, previo.creado);
      nuevo.seq = (previo.seq || 0) + nuevo.novedades.conservadas.agregadas;
      if (previo.fechaManual) { nuevo.fecha = previo.fecha; nuevo.fechaManual = true; }   // si ya le habían cambiado la fecha, se respeta
      listados = listados.filter(function (x) { return x.id !== previo.id; });
    }
    listados.unshift(nuevo);
    listados = listados.slice(0, maxHistorial());
    actual = nuevo;
    guardarListados();
    var t = Reglas.totales(nuevo.filas);
    avisarGuardado('Listado del ' + fechaTexto(nuevo.fecha) + ': ' + plural(t.reservas, 'reserva', 'reservas'), true);   // v1.11
    nubeCambio(nuevo, 'Subió el Excel «' + nombre + '» (' + plural(t.reservas, 'reserva', 'reservas') + ', ' + plural(t.habitaciones, 'habitación', 'habitaciones') + ')' +
      (previo ? ' y reemplazó la descarga anterior del mismo día' : ''), previo ? previo.id : null);
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
      ' · subido ' + esc(cuando(actual.creado)) + (actual.autor ? ' por <strong>' + esc(actual.autor) + '</strong>' : '') + (partes.length ? '<br>Cambios a mano: ' + partes.join(' · ') + '.' : '');
    $('#fecha-hoja').value = actual.fecha;
    $('#btn-fecha-hoy').disabled = actual.fecha === hoyISO();
    var fx = fechaDelExcel(actual);
    $('#fecha-texto').innerHTML = 'En la hoja sale: <strong>Reservas del: ' + esc(fechaHoja(actual.fecha)) + '</strong> · ' +
      esc(fechaLarga(actual.fecha)) + (actual.fecha === hoyISO() ? ' (hoy)' : '') + (actual.fecha === fx ? ' · la fecha que trae el Excel' : '');
  }

  function pintarAvisos() {
    var a = Reglas.avisos(actual.filas), li = [];
    function linea(tipo, html) { li.push('<li data-tipo="' + tipo + '">' + html + '</li>'); }
    var codigos = function (filas) { return esc(lista(filas.map(function (f) { return f.cod; }))); };
    /* v1.8: el archivo no se llama como el de la extranet (se leyó igual porque trae sus columnas) */
    if (actual.archivo && actual.archivo !== 'Excel' && !esNombreExtranet(actual.archivo)) {
      // v1.9 (JX): lo de «(se llama «…»)» en rojo fuerte de peligro, con un ícono dentro del paréntesis
      linea('ojo', 'Ojo: este archivo no se llama <strong>' + esc(NOMBRE_EXCEL) + '</strong> <span class="aviso-nombre-malo">(' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.6 22 20.4H2L12 3.6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 9.6v5M12 17.4v.1" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>' +
        'se llama «' + esc(actual.archivo) + '»)</span>. Revisa que sea el listado de reservas de la extranet.');
    }
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
        '</span><span class="reserva__editar" aria-hidden="true">Corregir</span></button>' +
        // v1.8 (JX): basurita roja «afuerita», después de «Corregir» (un botón no puede ir dentro de otro)
        '<button type="button" class="reserva__borrar" data-borrar="' + esc(f.id) + '" aria-label="Eliminar la reserva ' + esc(f.cod) + '">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 6.5h15M9.5 6.5V4.8c0-.7.6-1.3 1.3-1.3h2.4c.7 0 1.3.6 1.3 1.3v1.7M6.5 6.5l.8 12.2c.1.9.8 1.6 1.7 1.6h6c.9 0 1.6-.7 1.7-1.6l.8-12.2M10.2 10.5v6M13.8 10.5v6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</button></li>';
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
    var cuandoImp = ahora(), quien = nombreImprime();
    minutoHoja = Math.floor(cuandoImp / 60000);
    maqueta = Hoja.maquetar({
      // v1.10 (JX): «reservas del día tal, a la hora tal e impreso por tal persona»
      fecha: fechaHoja(actual.fecha),
      impreso: fechaTexto(diaDe(cuandoImp)) + ', ' + horaDe(cuandoImp).replace(/\u00A0/g, ' '),
      por: quien || '(tu nombre se escribe al imprimir)',
      casilla: ajustes.casilla === true, apretar: ajustes.apretar !== false,
      filas: v.map(function (f) { return { cod: f.cod, hab: f.hab, ag: f.ag, ti: f.ti, pre: Reglas.textoPre(f) }; })
    });
    $('#hojas').innerHTML = maqueta.paginas.map(function (p, i) { return '<div class="hoja__pagina">' + Hoja.svg(maqueta, i) + '</div>'; }).join('');
    var n = maqueta.paginas.length;
    $('#hoja-ayuda').textContent = 'Así sale por la impresora y en el PDF: ' + plural(n, 'hoja', 'hojas') + ' tamaño carta' +
      (n > 1 ? ' (son muchas reservas y no caben en una).' : maqueta.densidad !== 'amplia' ? ' (con la letra un poco más apretada para que quepa en una).' : '.');
  }

  /* ---------- quién imprime (v1.10, pedido de JX: «el nombre de la persona que imprimió… obligatoriamente») ----------
     Con la nube: el usuario que entró. Sin la nube: la ventanita «¿Quién imprime?» (el nombre se recuerda en el equipo). */
  var minutoHoja = 0, impresionPintada = 0, imprimiendo = false;   // v1.10: mientras se imprime no se repinta la hoja
  function nombreImprime() {
    if (nubeActiva() && nube.usuario && nube.usuario.nombre) { return nube.usuario.nombre; }
    return leer('imprime-nombre', '') || '';
  }
  /** Antes de imprimir / PDF / compartir: devuelve (promesa) el nombre de quien imprime, o null si canceló. */
  function conNombre(accion) {
    if (nubeActiva() && nube.usuario && nube.usuario.nombre) { return Promise.resolve(nube.usuario.nombre); }
    return new Promise(function (ok) { abrirNombre(accion, ok); });
  }
  function abrirNombre(accion, ok) {
    var dlg = $('#dlg-nombre'), form = $('#form-nombre'), campo = $('#n-nombre'), no = $('#n-no');
    $('#n-si').textContent = accion;
    campo.value = leer('imprime-nombre', '') || '';
    function soltar() {
      form.removeEventListener('submit', alSi); no.removeEventListener('click', alNo); dlg.removeEventListener('cancel', alNo);
      if (dlg.open && dlg.close) { dlg.close(); } else { dlg.removeAttribute('open'); }
    }
    function alSi(e) {
      if (e && e.preventDefault) { e.preventDefault(); }
      var n = Reglas.limpiar(campo.value).slice(0, 40);
      soltar();
      if (n.length < 2) {                                    // sin nombre no se imprime: ✗ roja y vuelve a preguntar
        resultado('error', 'Primero escribe tu nombre', 'Para imprimir, descargar o compartir la hoja escribe tu nombre: sale impreso en la hoja («Impreso el … por …»).')
          .then(function () { abrirNombre(accion, ok); });
        return;
      }
      guardar('imprime-nombre', n, true);
      ok(n);
    }
    function alNo(e) { if (e && e.preventDefault) { e.preventDefault(); } soltar(); ok(null); }
    form.addEventListener('submit', alSi); no.addEventListener('click', alNo); dlg.addEventListener('cancel', alNo);
    abrirDialogo('#dlg-nombre');
    setTimeout(function () { campo.focus(); campo.select(); }, 40);
  }

  function irA(sel) {
    var s = $(sel);
    if (s && s.scrollIntoView) { s.scrollIntoView({ block: 'start' }); }
  }

  /* ================================================================
   * 7) CORREGIR, AGREGAR Y QUITAR RESERVAS (diálogo #dlg-reserva)
   *    Lo hecho a mano se marca en pantalla, nunca en la hoja.
   * ================================================================ */
  var editando = null, tFechaOk = 0;                                       // id de la fila, o null si es una reserva nueva
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
      var tactil = window.matchMedia && window.matchMedia('(pointer: coarse), (hover: none)').matches;   // celular o tableta
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
    var que, ok;
    if (f) {
      Reglas.CAMPOS.forEach(function (c) { f[c] = datos[c]; });
      marcar(f);
      que = 'Corrigió la reserva ' + cod;
      ok = ['¡Reserva guardada!', cod + (datos.ti ? ' · ' + datos.ti : '') + '. Así sale en la hoja.'];
    } else {
      actual.seq = (actual.seq || 0) + 1;
      actual.filas.push(marcar(Reglas.filaManual(datos, actual.seq)));
      que = 'Agregó a mano la reserva ' + cod;
      ok = ['¡Reserva agregada!', cod + ' (' + plural(hab, 'habitación', 'habitaciones') + ') ya está en la hoja.'];
    }
    tocar(que); cerrarEditor(); pintarListado(); pintarHistorial();
    resultado('ok', ok[0], ok[1]);                             // v1.5: ✓ verde al guardar (pedido de JX)
  }

  function eventosEditar() {
    $('#lista-reservas').addEventListener('click', function (e) {
      var t = e.target.closest('[data-borrar]');
      if (t) { eliminarFila(filaPorId(t.getAttribute('data-borrar'))); return; }   // la basurita (v1.8)
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
      marcar(f);
      tocar('Devolvió la reserva ' + f.cod + ' a lo que dice el Excel'); cerrarEditor(); pintarListado(); pintarHistorial();
      resultado('ok', '¡Reserva restaurada!', f.cod + ' volvió a lo que dice el Excel.');
    });
    $('#r-quitar').addEventListener('click', function () {
      var f = editando ? filaPorId(editando) : null;
      if (!f) { return; }
      cerrarEditor();
      eliminarFila(f);
    });
  }
  /** Eliminar una reserva (basurita de la lista o «Quitar de la hoja» del diálogo). v1.8 (JX): las que vienen del
   *  Excel de la extranet preguntan DOS veces («¿Eliminar?» y «¿Segurísimo?»: es el listado original) y quedan en
   *  «Quitadas de la hoja» para devolverlas; las agregadas a mano se borran. Las dos con «Deshacer» 10 s. */
  function eliminarFila(f) {
    if (!f || !actual) { return; }
    var lst = actual, quien = f.cod + (f.ti ? ' · ' + f.ti : '');
      if (f.origen === 'manual') {
        preguntar({ titulo: '¿Eliminar esta reserva?', texto: quien + '. La agregaste a mano: sale de la hoja y de la lista.', si: 'Sí, eliminar' }).then(function (si) {
          if (!si || actual !== lst) { return; }
          lst.filas = lst.filas.filter(function (x) { return x !== f; });
          lst.borradas = (lst.borradas || []).concat(f.id);         // así otro equipo no la vuelve a traer al mezclar
          tocar('Borró la reserva ' + f.cod + ' (agregada a mano)'); pintarListado(); pintarHistorial();
          conDeshacer('Reserva ' + f.cod + ' eliminada.', function () {
            // vuelve como una línea nueva (con otro id): la vieja ya quedó en «borradas» y otro equipo podría tenerla así
            lst.seq = (lst.seq || 0) + 1;
            lst.filas.push(marcar(Reglas.filaManual(f, lst.seq)));
            cambioEn(lst, 'Deshizo: volvió la reserva ' + f.cod);
            resultado('ok', '¡Listo, se deshizo!', 'La reserva ' + f.cod + ' volvió a la hoja.');
          });
        });
        return;
      }
      preguntar({ titulo: '¿Eliminar esta reserva?', texto: quien + '. Sale de la hoja que se imprime.', si: 'Sí, eliminar' }).then(function (si) {
        if (!si || actual !== lst) { return false; }
        return preguntar({
          titulo: '¿Segurísimo que la quieres quitar?',
          texto: 'Esta reserva viene del listado original de la extranet («' + NOMBRE_EXCEL + '»). Si la quitas no sale en la hoja; queda abajo, en «Quitadas de la hoja», por si te equivocaste.',
          si: 'Sí, quitarla de la hoja', no: 'No, dejarla'
        });
      }).then(function (si) {
        if (!si || actual !== lst) { return; }
        f.quitada = true; marcar(f);
        tocar('Quitó de la hoja la reserva ' + f.cod); pintarListado(); pintarHistorial();
        conDeshacer('Reserva ' + f.cod + ' quitada de la hoja.', function () {
          f.quitada = false; marcar(f);
          cambioEn(lst, 'Deshizo: devolvió a la hoja la reserva ' + f.cod);
          resultado('ok', '¡Listo, se deshizo!', 'La reserva ' + f.cod + ' volvió a la hoja.');
        });
      });
  }
  function eventosEditar2() {
    /* acciones de los avisos, las novedades y las quitadas */
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-accion]');
      if (!b || !actual) { return; }
      var acc = b.getAttribute('data-accion');
      if (acc === 'devolver') {
        var f = filaPorId(b.getAttribute('data-id'));
        if (f) { f.quitada = false; marcar(f); tocar('Devolvió a la hoja la reserva ' + f.cod); pintarListado(); pintarHistorial(); resultado('ok', '¡Reserva devuelta!', f.cod + ' volvió a la hoja.'); }
      } else if (acc === 'aplicar-sugerencias') {
        var n = 0;
        Reglas.avisos(actual.filas).conSugerencia.forEach(function (x) {
          var ag = Reglas.aplicarSugerencias(x.ag), ti = Reglas.aplicarSugerencias(x.ti);
          if (ag !== x.ag || ti !== x.ti) { x.ag = ag; x.ti = ti; marcar(x); n += 1; }
        });
        tocar('Corrigió letras dañadas en ' + plural(n, 'reserva', 'reservas')); pintarListado(); pintarHistorial();
        resultado('ok', '¡Letras corregidas!', plural(n, 'reserva corregida', 'reservas corregidas') + '. Revísalas en la lista.');
      } else if (acc === 'fecha-checkin') {
        if (actual.checkin.length !== 1) { return; }
        actual.fecha = actual.checkin[0]; actual.fechaManual = false; actual.tFecha = ahora();
        tocar('Puso la fecha de la hoja en ' + fechaTexto(actual.fecha)); pintarResumen(); pintarAvisos(); pintarHoja(); pintarHistorial();
        resultado('ok', '¡Fecha cambiada!', 'La hoja sale con fecha ' + fechaTexto(actual.fecha) + '.');
      } else if (acc === 'volver-a-agregar') {
        var i = +b.getAttribute('data-i'), y = actual.novedades && actual.novedades.yaNo[i];
        if (!y) { return; }
        actual.seq = (actual.seq || 0) + 1;
        actual.filas.push(marcar(Reglas.filaManual(y, actual.seq)));
        actual.novedades.yaNo.splice(i, 1);
        tocar('Agregó a mano la reserva ' + y.cod + ' (ya no venía en el Excel)'); pintarListado(); pintarHistorial();
        resultado('ok', '¡Reserva agregada!', y.cod + ' está otra vez en la hoja (agregada a mano).');
      }
    });
    /* fecha de la hoja */
    $('#fecha-hoja').addEventListener('change', function () {
      if (!actual) { return; }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(this.value)) { this.value = actual.fecha; return; }
      if (this.value === actual.fecha) { return; }          // Safari repite «change» al perder el foco (al abrirse el ✓): si no cambió, nada
      actual.fecha = this.value; actual.fechaManual = this.value !== fechaDelExcel(actual); actual.tFecha = ahora();
      tocar('Puso la fecha de la hoja en ' + fechaTexto(actual.fecha)); pintarResumen(); pintarAvisos(); pintarHoja(); pintarHistorial();
      // v1.5: ✓ verde 1,2 s después del último cambio (al escribir la fecha con el teclado, «change» sale con cada número)
      clearTimeout(tFechaOk);
      tFechaOk = setTimeout(function () { if (actual) { resultado('ok', '¡Fecha cambiada!', 'La hoja sale con fecha ' + fechaTexto(actual.fecha) + '.'); } }, 1200);
    });
    $('#btn-fecha-hoy').addEventListener('click', function () {
      if (!actual) { return; }
      clearTimeout(tFechaOk);
      actual.fecha = hoyISO(); actual.fechaManual = actual.fecha !== fechaDelExcel(actual); actual.tFecha = ahora();
      tocar('Puso la fecha de la hoja en hoy (' + fechaTexto(actual.fecha) + ')'); pintarResumen(); pintarAvisos(); pintarHoja(); pintarHistorial();
      resultado('ok', '¡Fecha de hoy!', 'La hoja sale con fecha ' + fechaTexto(actual.fecha) + '.');
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
      conNombre('Imprimir').then(function (n) {
        if (!n || !actual) { return; }
        // v1.10: primero se termina de cerrar la ventanita «¿Quién imprime?» y se pinta la hoja con la hora
        // exacta; DESPUÉS se abre la impresión (si se abría en el mismo instante, Chrome se quedaba en
        // «Cargando vista previa…»). Mientras la impresión está abierta, la hoja no se vuelve a pintar.
        pintarHoja(); impresionPintada = ahora();
        nubeAnotar('Imprimió la hoja del ' + fechaTexto(actual.fecha));
        setTimeout(function () { requestAnimationFrame(function () { window.print(); }); }, 180);   // @media print deja solo la hoja
      });
    });
    /* v1.10: Ctrl+P / Cmd+P pasa por el mismo botón (pide el nombre si hace falta) */
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && (e.key === 'p' || e.key === 'P') && actual && maqueta && !document.querySelector('dialog[open]')) {
        e.preventDefault(); $('#btn-imprimir').click();
      }
    });
    // al imprimir (botón o Ctrl+P), «Guardar como PDF» propone el mismo nombre que la descarga
    var tituloPagina = document.title;
    window.addEventListener('beforeprint', function () {
      if (!actual || !maqueta) { return; }
      document.title = Hoja.nombreArchivo(actual.fecha).replace(/\.pdf$/i, '');
      // v1.10: desde el menú del navegador sin nombre → no sale la hoja, sale el aviso; con nombre → hora exacta
      imprimiendo = true;
      if (!nombreImprime()) { document.documentElement.classList.add('falta-nombre'); }
      else if (ahora() - impresionPintada > 4000) { pintarHoja(); }   // solo desde el menú del navegador (el botón ya la pintó)
    });
    window.addEventListener('afterprint', function () {
      imprimiendo = false; document.title = tituloPagina;
      if (document.documentElement.classList.contains('falta-nombre')) { document.documentElement.classList.remove('falta-nombre'); }
    });
    $('#btn-pdf').addEventListener('click', function () {
      if (!actual || !maqueta) { return; }
      conNombre('Descargar PDF').then(function (n) {
        if (!n || !actual) { return; }
        pintarHoja();                                        // v1.10: hora exacta y nombre en el PDF
        var nombre = Hoja.nombreArchivo(actual.fecha);
        descargar(hacerPdf(), nombre);
        resultado('ok', '¡PDF descargado!', nombre + ' quedó en tus descargas.');
        nubeAnotar('Descargó el PDF ' + nombre);
      });
    });
    /* «Eliminar» (v1.4, pedido de JX): quita el Excel / listado que está en pantalla —también del historial—
       y deja la página lista para subir otro. Pide confirmación porque no se puede recuperar. */
    $('#btn-eliminar').addEventListener('click', function () {
      if (!actual) { return; }
      var id = actual.id, t = Reglas.totales(actual.filas);
      preguntar({
        titulo: '¿Eliminar este listado?',
        texto: 'El del ' + fechaTexto(actual.fecha) + ' que está en pantalla (' + plural(t.reservas, 'reserva', 'reservas') + ', ' + plural(t.habitaciones, 'habitación', 'habitaciones') +
          '). Se quita también del historial' + (nubeActiva() ? ' y de la nube' : '') + '.',
        si: 'Sí, eliminar'
      }).then(function (si) {
        if (!si) { return; }
        return borrarListados([id], false, 'Listado eliminado.').then(function () {
          if (!actual) { irA('#subir'); }
        });
      });
    });
    /* «Guardar y hacer otro» (v1.15, pedido de JX): el listado ya está guardado (en el equipo y en la nube); aquí
       se sube lo que falte, se quita de la pantalla y queda todo listo para subir otro Excel. */
    $('#btn-nuevo').addEventListener('click', function () {
      if (!actual) { return; }
      var lst = actual, t = Reglas.totales(lst.filas);
      if (nubeActiva() && hayPendientes()) { subirNube(); }
      actual = null; maqueta = null; guardarListados(); mostrarError(''); ocultarGuia(); pintarTodo(); irA('#subir');
      resultado('ok', '¡Guardado en tu historial!', 'El listado del ' + fechaTexto(lst.fecha) + ' (' + plural(t.reservas, 'reserva', 'reservas') +
        ') quedó en tu historial, abajo. Ya puedes subir otro Excel.');
    });
    $('#btn-compartir').addEventListener('click', function () {
      if (!actual || !maqueta) { return; }
      conNombre('Compartir').then(function (n) { if (n && actual) { pintarHoja(); compartirHoja(); } });
    });
    function compartirHoja() {
      var nombre = Hoja.nombreArchivo(actual.fecha), blob = hacerPdf(), archivo = null;
      nubeAnotar('Compartió el PDF ' + nombre);
      try { archivo = new File([blob], nombre, { type: 'application/pdf' }); } catch (e) { archivo = null; }
      if (archivo && navigator.canShare && navigator.share && navigator.canShare({ files: [archivo] })) {
        // solo el archivo: en iPhone, si va con texto, WhatsApp a veces manda el texto y se pierde el PDF (WebKit, bug 251500)
        navigator.share({ files: [archivo] })
          .then(function () { resultado('ok', '¡Hoja compartida!', nombre + ' se envió.'); })
          .catch(function (e) {
            if (e && e.name === 'AbortError') { return; }       // la persona cerró el menú de compartir
            descargar(blob, nombre);
            resultado('ok', '¡PDF descargado!', 'No se pudo abrir «Compartir»: ' + nombre + ' quedó en tus descargas para que lo adjuntes.');
          });
      } else {
        descargar(blob, nombre);
        resultado('ok', '¡PDF descargado!', 'Este navegador no comparte archivos directamente: ' + nombre + ' quedó en tus descargas para que lo adjuntes en WhatsApp.');
      }
    }
  }

  /* ================================================================
   * 9) HISTORIAL — los listados guardados en este equipo
   * ================================================================ */
  var filtroHistorial = '';                                  // v1.15: el admin ve el de una persona («» = todos)
  function pintarHistorial() {
    // v1.15 (JX): con la nube, cada recepcionista ve SOLO lo suyo (la nube solo le manda lo suyo); el admin ve todo y filtra por persona
    var autores = [];
    if (esAdmin()) { listados.forEach(function (x) { if (x.autor && autores.indexOf(x.autor) < 0) { autores.push(x.autor); } }); autores.sort(); }
    if (filtroHistorial && autores.indexOf(filtroHistorial) < 0) { filtroHistorial = ''; }
    $('#historial-filtro-caja').hidden = !esAdmin() || autores.length < 2;
    $('#historial-filtro').innerHTML = '<option value="">Todos (' + listados.length + ')</option>' + autores.map(function (a) {
      var n = listados.filter(function (x) { return x.autor === a; }).length;
      return '<option value="' + esc(a) + '"' + (a === filtroHistorial ? ' selected' : '') + '>' + esc(a) + ' (' + n + ')</option>';
    }).join('');
    var ver = filtroHistorial ? listados.filter(function (x) { return x.autor === filtroHistorial; }) : listados;
    $('#historial-vacio').hidden = listados.length > 0;
    $('#historial-nota').hidden = !listados.length;
    $('#historial-nota-texto').textContent = almacenOk
      ? 'Se guardan hasta ' + MAX_HISTORIAL + ' listados, solo en este equipo. Si el equipo es compartido, bórralos cuando ya no los necesites.'
      : 'Este navegador no deja guardar (¿modo incógnito?): el historial dura solo mientras esta página esté abierta.';
    if (nubeActiva()) {
      $('#historial-nota-texto').textContent = esAdmin()
        ? 'Eres administrador: ves los listados de todos (cada uno dice quién lo subió). Se borran solos a los ' + nube.dias + ' días.'
        : 'Tu historial: solo los listados que subiste tú, guardados en la nube (los ves en cualquier equipo al entrar). Se borran solos a los ' + nube.dias + ' días; solo el administrador puede borrar.';
    }
    $('#btn-borrar-historial').hidden = nubeActiva() && !esAdmin();
    var puedeBorrar = !nubeActiva() || esAdmin();
    $('#btn-eliminar').hidden = !puedeBorrar;
    $('#acciones').classList.toggle('acciones--cinco', puedeBorrar);   // v1.15: con 5 botones, en celular los de texto van sin ícono                // «Eliminar» de la barra: mismas reglas que «Borrar» (v1.4)
    var conAutor = !nubeActiva() || esAdmin();               // recepción: todo es suyo, no hace falta «por …»
    $('#lista-historial').innerHTML = ver.map(function (x) {
      var t = Reglas.totales(x.filas), enPantalla = actual && actual.id === x.id;
      return '<li' + (enPantalla ? ' aria-current="true"' : '') + '><span class="historial__info">' +
        '<span class="historial__fecha">' + esc(fechaCorta(x.fecha)) + (enPantalla ? ' <span class="chip chip--cambio">En pantalla</span>' : '') + '</span>' +
        '<span class="historial__meta">' + plural(t.habitaciones, 'habitación', 'habitaciones') + ' · ' + plural(t.reservas, 'reserva', 'reservas') + ' · subido ' + esc(cuando(x.creado)) + (x.autor && conAutor ? ' por <strong>' + esc(x.autor) + '</strong>' : '') + '</span></span>' +
        '<span class="historial__botones">' +
        (enPantalla ? '' : '<button type="button" class="boton boton--secundario boton--chico" data-historial="abrir" data-id="' + esc(x.id) + '">Abrir</button>') +
        (puedeBorrar ? '<button type="button" class="enlace enlace--peligro" data-historial="borrar" data-id="' + esc(x.id) + '" aria-label="Borrar el listado del ' + esc(fechaCorta(x.fecha)) + '">Borrar</button>' : '') + '</span></li>';
    }).join('');
  }
  /** Borra listados (del equipo y, con la nube, de todos los equipos) y ofrece «Deshacer» 10 s.
   *  todo = «Borrar todo» (en la nube borra todos). Lo usan el historial y «Eliminar» de la barra. */
  function borrarListados(ids, todo, textoListo) {
    var quitados = listados.filter(function (l) { return todo || ids.indexOf(l.id) >= 0; }), actualAntes = actual;
    return nubeBorrar(todo ? null : ids[0]).then(function () {
      listados = listados.filter(function (l) { return quitados.indexOf(l) < 0; });
      if (actual && quitados.indexOf(actual) >= 0) { actual = null; }
      guardarListados(); pintarTodo();
      avisarGuardado(textoListo, nubeActiva() ? 'ya' : false);   // v1.11 (en la nube ya se borró)
      conDeshacer(textoListo, function () { devolverListados(quitados, actualAntes); });
    }, function () { resultado('error', 'No se pudo eliminar', 'Revisa la conexión e inténtalo otra vez.'); });
  }
  /** «Deshacer» de borrarListados. Con la nube vuelven con otro id (el viejo ya se borró allá) y se suben otra vez. */
  function devolverListados(quitados, actualAntes) {
    quitados.forEach(function (x) {
      if (indiceDe(x.id) >= 0) { return; }
      var y = x;
      if (nubeActiva()) { y = listadoSano(JSON.parse(JSON.stringify(x))) || x; y.id = idListado(); y.actualizado = ahora(); }
      listados.push(y);
      if (actualAntes === x) { actual = y; }
      if (y !== x) { nubeCambio(y, 'Deshizo: devolvió el listado del ' + fechaTexto(y.fecha)); }
    });
    listados.sort(function (a, b) { return b.creado - a.creado; });
    if (listados.length > maxHistorial()) { listados = listados.slice(0, maxHistorial()); }
    guardarListados(); pintarTodo();
    resultado('ok', '¡Listo, se deshizo!', quitados.length === 1 ? 'El listado volvió.' : 'Los ' + quitados.length + ' listados volvieron.');
  }
  function eventosHistorial() {
    $('#lista-historial').addEventListener('click', function (e) {
      var b = e.target.closest('[data-historial]');
      if (!b) { return; }
      var id = b.getAttribute('data-id'), x = listados.filter(function (l) { return l.id === id; })[0];
      if (!x) { return; }
      if (b.getAttribute('data-historial') === 'abrir') {
        actual = x; guardarListados(); mostrarError(''); pintarTodo(); irA('#resumen');
        resultado('ok', '¡Listado abierto!', 'El del ' + fechaCorta(x.fecha) + ' ya está en pantalla.');
        return;
      }
      var t = Reglas.totales(x.filas);
      preguntar({
        titulo: '¿Eliminar este listado del historial?',
        texto: 'El del ' + fechaCorta(x.fecha) + ' (' + plural(t.reservas, 'reserva', 'reservas') + (x.autor && esAdmin() ? ', de ' + x.autor : '') + ')' + (nubeActiva() ? '. Se borra también de la nube.' : '.'),
        si: 'Sí, eliminar'
      }).then(function (si) {
        if (si) { return borrarListados([id], false, 'Listado eliminado del historial.'); }
      });
    });
    $('#historial-filtro').addEventListener('change', function () { filtroHistorial = this.value; pintarHistorial(); });
    $('#btn-borrar-historial').addEventListener('click', function () {
      preguntar({
        titulo: '¿Eliminar todo el historial?',
        texto: (listados.length === 1 ? 'El listado guardado' : 'Los ' + listados.length + ' listados guardados') + (nubeActiva() ? ' de TODOS los usuarios (también los de tus compañeros), en la nube.' : ' en este equipo.'),
        si: 'Sí, eliminar todo'
      }).then(function (si) {
        if (si) { return borrarListados([], true, 'Historial eliminado.'); }
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
      avisarGuardado($('#btn-tema-texto').textContent, false);   // v1.11 (como en turnos: «Tema: automático»)
    });
    $('#aj-casilla').checked = ajustes.casilla === true;
    $('#aj-casilla').addEventListener('change', function () {
      ajustes.casilla = this.checked; guardar('ajustes', ajustes);
      avisarGuardado('Casilla «Llegó» en la hoja: ' + (this.checked ? 'sí' : 'no'), false);
      if (actual) { pintarHoja(); }
      nubeAjustesHoja();
    });
    $('#aj-apretar').checked = ajustes.apretar !== false;
    $('#aj-apretar').addEventListener('change', function () {
      ajustes.apretar = this.checked; guardar('ajustes', ajustes);
      avisarGuardado('Ahorrar papel: ' + (this.checked ? 'sí' : 'no'), false);
      if (actual) { pintarHoja(); }
      nubeAjustesHoja();
    });
    setInterval(function () { if (ajustes.tema === 'auto') { aplicarTema(); } }, 60000);
    /* «Más ajustes» es un panel flotante: se cierra al tocar fuera de él o con Escape */
    var panel = $('.ajustes');
    document.addEventListener('click', function (e) {
      if (panel.open && !panel.contains(e.target)) { panel.open = false; }
    });
    document.addEventListener('keydown', function (e) {
      if ((e.key === 'Escape' || e.key === 'Esc') && panel.open && !document.querySelector('dialog[open]')) {
        panel.open = false; panel.querySelector('summary').focus();
      }
    });
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
  /* ---------- ventanita de PREGUNTA (v1.5, igual a la de eliminar del Manual de turnos) ----------
     preguntar({ tipo: 'eliminar' | 'salir', titulo, texto, si, no }) → promesa con true / false.
     «Sí» no cuenta en el primer medio segundo (un doble toque o un toque «fantasma» del celular no
     borra sin querer) y el foco empieza en «Cancelar» (Enter no borra). Esc = Cancelar.
     NO se cierra sola: espera a que la persona responda (JX: eliminar y errores «hasta que el usuario los quite»). */
  var PREGUNTA_ESPERA_MS = 500, VENTANITA_SOLA_MS = 8000, finPregunta = null;   // 8 s: solo las de éxito (✓ y «Sesión cerrada»)
  /** Cuenta regresiva en el texto de un botón; al llegar a 0 llama a alFin. Devuelve con qué pararla. */
  function cuentaAtras(boton, texto, alFin) {
    var fin = Date.now() + VENTANITA_SOLA_MS;
    function pintar() { boton.textContent = texto + ' (' + Math.max(1, Math.ceil((fin - Date.now()) / 1000)) + ')'; }
    pintar();
    var tSeg = setInterval(pintar, 250), tFin = setTimeout(alFin, VENTANITA_SOLA_MS);
    return function () { clearInterval(tSeg); clearTimeout(tFin); boton.textContent = texto; };
  }
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
      function alCancelar(e) { if (e && e.preventDefault) { e.preventDefault(); } fin(false); }   // Esc
      function alCerrar() { if (!dlg.open) { fin(false); } }                                     // la cerró otro (p. ej. pedirEntrar)
      finPregunta = fin;
      si.addEventListener('click', alSi); no.addEventListener('click', alNo);
      dlg.addEventListener('cancel', alCancelar); dlg.addEventListener('close', alCerrar);
      abrirAnimada(dlg);
      no.focus();
    });
  }
  /* ---------- ventanita de RESULTADO (v1.5, igual a la del Manual de turnos) ----------
     resultado('ok' | 'error' | 'salir', título, texto, clave?) → ✓ verde, ✗ roja o puerta dorada que se
     dibujan con un círculo de 360°. Se cierra con «Entendido» o Esc; la promesa se cumple al cerrarla.
     clave (opcional) = contraseña temporal que se muestra en grande para entregarla en persona.
     Las de ÉXITO (✓ verde y «Sesión cerrada») se cierran solas a los 8 s con la cuenta en el botón
     («Entendido (8)»), para que no estorben (JX: «solo a los positivos»). La ✗ roja de error se queda hasta
     que la persona la cierre. La que muestra una contraseña temporal también se queda (hay que anotarla). */
  var finResultado = null;
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
      function alCancelar(e) { if (e && e.preventDefault) { e.preventDefault(); } fin(); }   // Esc
      function alCerrar() { if (!dlg.open) { fin(); } }
      finResultado = fin;
      boton.addEventListener('click', fin); dlg.addEventListener('cancel', alCancelar); dlg.addEventListener('close', alCerrar);
      abrirAnimada(dlg);
      setTimeout(function () { boton.focus(); }, 30);
      boton.textContent = 'Entendido';
      if (tipo !== 'error' && !clave) { parar = cuentaAtras(boton, 'Entendido', fin); }
    });
  }
  /** Abre una ventanita y reinicia su animación (si se abre dos veces seguidas, se vuelve a dibujar). */
  function abrirAnimada(dlg) {
    if (dlg.open && dlg.close) { dlg.close(); }
    void dlg.offsetWidth;
    if (typeof dlg.showModal === 'function') { dlg.showModal(); } else { dlg.setAttribute('open', ''); }
  }
  /* ---------- «Deshacer» 10 s (v1.5, como en el Manual de turnos) ---------- */
  var DESHACER_MS = 10000, alDeshacer = null, tDeshacerFin = 0, tDeshacerSeg = 0;
  function conDeshacer(texto, fn) {
    var caja = $('#deshacer'), fin = ahora() + DESHACER_MS;
    clearTimeout(tDeshacerFin); clearInterval(tDeshacerSeg);
    alDeshacer = fn;
    $('#deshacer-texto').textContent = texto;
    function contar() { $('#deshacer-btn').textContent = 'Deshacer (' + Math.max(1, Math.ceil((fin - ahora()) / 1000)) + ')'; }
    contar();
    clearTimeout(tAviso); $('#aviso').hidden = true;
    caja.hidden = false; caja.classList.remove('aviso--fuera');
    reacomodarGuardado();
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
  function eventosDeshacer() {
    $('#deshacer-btn').addEventListener('click', function () {
      var fn = alDeshacer;
      cerrarDeshacer();
      if (fn) { fn(); }
    });
  }
  /* ---------- guía «Tu hoja está aquí abajo» (v1.5, pedido de JX) ----------
     Una vez por entrada del usuario (con nube; la marca se borra al entrar) o una vez por equipo (sin nube).
     Nunca en una recarga. Se quita a los GUIA_MS, al llegar a la hoja o al tocarla (que lleva a la hoja). */
  var GUIA_MS = 8000, tGuia = 0, vigiaGuia = null;
  function mostrarGuia() {
    var g = $('#guia-hoja'), hoja = $('#hoja');
    if (!actual || leer('guia-hoja', false) === true || !g.hidden) { return; }
    if (hoja.getBoundingClientRect().top < window.innerHeight * 0.7) { return; }   // la hoja ya se ve: no hace falta
    guardar('guia-hoja', true, true);
    $('#guia-texto').textContent = (nubeActiva() && nube.usuario ? nube.usuario.nombre + ', tu' : 'Tu') + ' hoja está aquí abajo';
    g.classList.remove('guia-hoja--fuera'); g.hidden = false;
    reacomodarGuardado();                                  // v1.12: si la píldora «Datos guardados» ya está, se sube
    clearTimeout(tGuia); tGuia = setTimeout(ocultarGuia, GUIA_MS);
    if (window.IntersectionObserver) {
      vigiaGuia = new IntersectionObserver(function (e) { if (e[0] && e[0].isIntersecting) { ocultarGuia(); } }, { threshold: 0.12 });
      vigiaGuia.observe(hoja);
    }
  }
  function ocultarGuia() {
    var g = $('#guia-hoja');
    clearTimeout(tGuia);
    if (vigiaGuia) { vigiaGuia.disconnect(); vigiaGuia = null; }
    if (g.hidden) { return; }
    g.classList.add('guia-hoja--fuera');
    setTimeout(function () { g.hidden = true; }, 320);
  }
  function eventosGuia() {
    $('#guia-hoja').addEventListener('click', function () { ocultarGuia(); irA('#hoja'); });
  }
  /* ---------- «✓ Datos guardados exitosamente» (v1.11, como el Manual de turnos) ----------
     avisarGuardado(detalle, nube): nube = true (se está subiendo: espera la confirmación), 'ya' (ya quedó en la
     nube) o false (solo en el equipo). Si hay una ventanita abierta, espera a que se cierre. Varias seguidas = una. */
  var GUARDADO_MS = 2600, GUARDADO_NUBE_MAX = 9000, GUARDADO_NUBE_VER = 1800;
  var guardado = { pendiente: false, detalle: '', nube: false, tEspera: 0, tFuera: 0, tOculta: 0 };
  function avisarGuardado(detalle, conNube) {
    guardado.pendiente = true;
    guardado.detalle = String(detalle || '').slice(0, 90);
    guardado.nube = nubeActiva() ? conNube : false;
    clearTimeout(guardado.tEspera);
    guardado.tEspera = setTimeout(mostrarGuardado, 60);       // varios cambios en un mismo toque = una sola píldora
  }
  function mostrarGuardado() {
    clearTimeout(guardado.tEspera);
    if (!guardado.pendiente) { return; }
    if (document.querySelector('dialog[open]')) { guardado.tEspera = setTimeout(mostrarGuardado, 300); return; }   // no taparse con una ventanita
    guardado.pendiente = false;
    var el = $('#guardado'), det = $('#guardado-detalle'), linea = $('#guardado-nube');
    det.textContent = guardado.detalle; det.hidden = !guardado.detalle;
    var estado = !guardado.nube ? '' : (guardado.nube === 'ya' || (nube.estado === 'al-dia' && !hayPendientes())) ? 'ok'
      : (nube.estado === 'error' || nube.estado === 'sin-conexion') ? 'error' : 'subiendo';
    pintarLineaNube(estado);
    clearTimeout(guardado.tFuera); clearTimeout(guardado.tOculta);
    el.classList.remove('guardado--nuevo', 'guardado--fuera'); void el.offsetWidth; el.classList.add('guardado--nuevo');
    el.hidden = false;
    acomodarGuardado();
    guardado.tFuera = setTimeout(ocultarGuardado, estado === 'subiendo' ? GUARDADO_NUBE_MAX : GUARDADO_MS);
  }
  /** v1.12 (JX: «abajo de todo y que no estorbe»): va abajo, encima de la barra; si a esa altura hay «Deshacer»,
   *  un aviso o la guía «tu hoja está aquí abajo», se sube justo por encima de ellos para no taparlos. */
  /** Si la píldora ya se ve y aparece otra cosa abajo (guía, «Deshacer», aviso), se vuelve a acomodar. */
  function reacomodarGuardado() { if (!$('#guardado').hidden) { requestAnimationFrame(acomodarGuardado); } }
  function acomodarGuardado() {
    var el = $('#guardado'), arriba = Infinity;
    el.style.bottom = '';
    ['#deshacer', '#aviso', '#guia-hoja'].forEach(function (s) {
      var o = $(s);
      if (o && !o.hidden) { var r = o.getBoundingClientRect(); if (r.height) { arriba = Math.min(arriba, r.top); } }
    });
    if (arriba === Infinity) { return; }
    var mio = el.getBoundingClientRect();
    if (mio.bottom > arriba - 6) { el.style.bottom = (window.innerHeight - arriba + 8) + 'px'; }
  }
  function pintarLineaNube(estado) {
    var linea = $('#guardado-nube');
    linea.hidden = !estado;
    if (!estado) { return; }
    linea.setAttribute('data-estado', estado);
    $('#guardado-nube-texto').textContent = estado === 'ok' ? 'También en la nube' : estado === 'error'
      ? (nube.estado === 'sin-conexion' ? 'Sin señal: se sube solo cuando vuelva' : 'No se pudo subir: se reintenta solo') : 'Guardando en la nube…';
  }
  /** Lo llama subirNube al terminar: la línea pasa de amarillo a verde (o rojo) y la píldora se va. */
  function guardadoNube(estado) {
    var el = $('#guardado'), linea = $('#guardado-nube');
    if (el.hidden || linea.hidden || linea.getAttribute('data-estado') !== 'subiendo') { return; }
    pintarLineaNube(estado);
    clearTimeout(guardado.tFuera);
    guardado.tFuera = setTimeout(ocultarGuardado, estado === 'ok' ? GUARDADO_NUBE_VER : 3200);
  }
  function ocultarGuardado() {
    var el = $('#guardado');
    el.classList.add('guardado--fuera');
    guardado.tOculta = setTimeout(function () { el.hidden = true; el.classList.remove('guardado--fuera'); el.style.bottom = ''; }, 260);
  }
  /** Un listado cambió fuera de la pantalla actual (lo usa «Deshacer»): se guarda, se sube y se pinta si está en pantalla. */
  function cambioEn(lst, que) {
    lst.actualizado = ahora();
    guardarListados(); nubeCambio(lst, que);
    if (actual === lst) { pintarListado(); }
    pintarHistorial();
  }

  var tAviso = 0;
  function aviso(texto, ms, alerta) {
    var el = $('#aviso');
    if (!$('#deshacer').hidden) { cerrarDeshacer(); }      // un aviso nuevo reemplaza al «Deshacer» (no se tapan)
    el.textContent = texto;
    el.classList.toggle('aviso--alerta', !!alerta);
    el.hidden = false;
    el.classList.remove('aviso--fuera');
    reacomodarGuardado();                                  // v1.12: la píldora «Datos guardados» no se monta encima
    clearTimeout(tAviso);
    tAviso = setTimeout(function () {
      el.classList.add('aviso--fuera');
      tAviso = setTimeout(function () { el.hidden = true; }, 260);
    }, ms || 3200);
  }

  /* ================================================================
   * 13) NUBE Y CUENTA (v1.3, pedido de JX: «una base de datos en la nube
   *     para abrirla en los demás equipos, que la información no se pierda
   *     y que solo entremos los recepcionistas, con admin y usuario»)
   *
   *  Cómo funciona (la misma idea del Manual de turnos, con usuarios):
   *   · Si en esta dirección hay nube (functions/api/[[ruta]].js con la base
   *     D1), hay que ENTRAR con usuario y contraseña; sin entrar no se ve nada.
   *     Si no hay nube (doble clic, servidor de la casa o Cloudflare sin la
   *     base), la página trabaja sola en el equipo, como siempre.
   *   · Todo se guarda PRIMERO en el equipo (sirve sin internet) y a los
   *     segundos se sube. Cada 45 s, al volver a la pestaña y al volver la
   *     señal se trae lo nuevo de los demás equipos.
   *   · Cada listado lleva su versión (v). Si dos equipos cambian el mismo
   *     listado, la nube avisa ({ cambio: true }) y se MEZCLAN: por cada reserva gana el
   *     cambio más nuevo (fila.tf); las borradas a mano no vuelven (borradas).
   *   · Roles: el admin maneja usuarios, ve «Quién hizo qué», borra del
   *     historial y cambia la casilla «Llegó» y «Ahorrar papel» para todos.
   *   · Lo de la nube se borra solo a los 30 días (lo hace el servidor).
   *  Claves en este equipo: nube-usuario, nube-vers, nube-pend, nube-acciones,
   *  nube-reemplaza, nube-sueltas, nube-desde, nube-ultima.
   * ================================================================ */
  var API = 'api/', NUBE_SUBIR_MS = 1500, NUBE_REINTENTO_MS = 30000, NUBE_TRAER_MS = 45000, NUBE_ESPERA_MAX_MS = 9000;
  var DIA_MS = 86400000;
  function objeto(x) { return esObjeto(x) ? x : {}; }
  function usuarioSano(u) {
    return esObjeto(u) && typeof u.usuario === 'string' && typeof u.nombre === 'string'
      ? { id: +u.id || 0, usuario: u.usuario, nombre: u.nombre.slice(0, 40), rol: u.rol === 'admin' ? 'admin' : 'recepcion', cambiar: !!u.cambiar } : null;
  }
  var nube = {
    modo: 'local',                                          // 'local' (aquí no hay nube) · 'nube'
    usuario: usuarioSano(leer('nube-usuario', null)),       // quién entró en este equipo (para trabajar sin señal)
    estado: 'al-dia', dias: 30, ultima: +leer('nube-ultima', 0) || 0, desde: +leer('nube-desde', 0) || 0,
    vers: objeto(leer('nube-vers', {})),                    // id → versión que tiene la nube
    pend: objeto(leer('nube-pend', {})),                    // id → cambios sin subir
    acciones: objeto(leer('nube-acciones', {})),            // id → [«Corrigió la reserva…»] para «Quién hizo qué»
    reemplaza: objeto(leer('nube-reemplaza', {})),          // id nuevo → id del listado que reemplaza (Excel más nuevo del mismo día)
    sueltas: Array.isArray(leer('nube-sueltas', [])) ? leer('nube-sueltas', []) : [],   // imprimir, PDF, compartir
    tSubir: 0, ocupada: false, admin: { actividad: [], verHasta: 60 }
  };
  /* [texto corto del botón, texto largo de «Mi cuenta», color del punto] */
  var TEXTO_NUBE = {
    'al-dia': ['Guardado', 'Todo está guardado en la nube.', 'verde'],
    pendiente: ['Guardando…', 'Guardado en este equipo; se sube a la nube en unos segundos.', 'amarillo'],
    subiendo: ['Guardando…', 'Guardando en la nube…', 'amarillo'],
    bajando: ['Trayendo…', 'Trayendo lo último de la nube…', 'amarillo'],
    'sin-conexion': ['Sin señal', 'Sin conexión: todo queda guardado en este equipo y se sube solo cuando vuelva la señal.', 'amarillo'],
    error: ['No se pudo guardar', 'No se pudo guardar en la nube: se reintenta solo cada 30 segundos.', 'rojo']
  };
  function nubeActiva() { return nube.modo === 'nube' && !!nube.usuario; }
  function esAdmin() { return nubeActiva() && nube.usuario.rol === 'admin'; }
  function hayPendientes() { return Object.keys(nube.pend).length > 0 || nube.sueltas.length > 0; }
  function guardarNube() {
    guardar('nube-usuario', nube.usuario, true); guardar('nube-vers', nube.vers, true); guardar('nube-pend', nube.pend, true);
    guardar('nube-acciones', nube.acciones, true); guardar('nube-reemplaza', nube.reemplaza, true); guardar('nube-sueltas', nube.sueltas, true);
    guardar('nube-desde', nube.desde, true);
  }

  /** Habla con la nube. Devuelve el JSON, o falla con { tipo, estado, datos }.
   *  tipo: sin-conexion · sin-nube (aquí no hay función: responde la página) · sin-configurar · sesion · el «error» que diga la nube. */
  function pedir(metodo, ruta, cuerpo) {
    var opciones = { method: metodo, credentials: 'same-origin', cache: 'no-store', headers: {} };
    // v1.15: la sesión solo se alarga si la persona tocó algo hace poco (lo automático no la alarga)
    if (ahora() - ultimaActividad() < 2 * 60000) { opciones.headers['X-Activo'] = '1'; }
    if (metodo !== 'GET') {
      opciones.headers['Content-Type'] = 'application/json';
      opciones.headers['X-Editador'] = '1';                // la nube rechaza cambios que no traigan esto (otra página no puede)
      opciones.body = JSON.stringify(cuerpo || {});
    }
    var control = window.AbortController ? new window.AbortController() : null, tEspera = 0;
    if (control) { opciones.signal = control.signal; tEspera = setTimeout(function () { control.abort(); }, NUBE_ESPERA_MAX_MS); }
    return fetch(API + ruta, opciones).then(function (r) {
      clearTimeout(tEspera);
      return r.text().then(function (t) {
        var j = null;
        try { j = JSON.parse(t); } catch (e) { j = null; }
        if (!esObjeto(j)) { throw { tipo: 'sin-nube', estado: r.status }; }        // sin la función, la dirección responde la página
        if (!r.ok) { throw { tipo: j.error || 'error', estado: r.status, datos: j }; }
        return j;
      });
    }, function () { clearTimeout(tEspera); throw { tipo: 'sin-conexion', estado: 0 }; });
  }

  /** ¿Se está viendo desde el computador o la red de la casa (doble clic, python -m http.server…)? Ahí no hay nube
   *  y no se pregunta (evita un 404 en la consola). Excepción: el puerto 8788 = «wrangler pages dev», para probar la nube. */
  function esLocal() {
    var h = location.hostname;
    if (location.port === '8788') { return false; }
    return !h || h === 'localhost' || h === '[::1]' || /^127\./.test(h) || /^(10|192\.168)\./.test(h) || /^172\.(1[6-9]|2\d|3[01])\./.test(h) || /\.local$/.test(h);
  }
  /** Al abrir: ¿hay nube aquí? ¿ya se entró en este equipo? */
  function iniciarNube() {
    if (!/^https?:$/.test(location.protocol) || !window.fetch || esLocal()) { nube.modo = 'local'; pintarNube(); return Promise.resolve(); }
    return pedir('GET', 'yo').then(function (j) {
      if (j.error) { nube.modo = 'local'; pintarNube(); return; }   // «sin-configurar»: la base aún no está en Cloudflare
      nube.modo = 'nube'; nube.dias = +j.guardarDias || 30;
      if (!j.usuario) {
        // v1.15: la sesión ya no está (30 min sin usar, o se salió en otra pestaña): el equipo queda limpio
        if (!hayPendientes()) { olvidarEquipo(); } else { nube.usuario = null; guardarNube(); actual = null; guardarListados(); }
        pedirEntrar(!!j.primera, ''); return;
      }
      // v1.15 (JX: «que se cierre automáticamente… para que otro compañero no esté en una cuenta que no es suya»)
      return sesionSigue().then(function (sigue) {
        if (!sigue.ok) { nube.modo = 'nube'; nube.usuario = usuarioSano(j.usuario); return cerrarSola(sigue.motivo, true); }
        ponerUsuario(j.usuario);
        return bajarNube(true);
      });
    }, function (e) {
      if (e.tipo === 'sin-conexion' && nube.usuario) {      // sin señal pero ya había entrado en ESTA pestaña: se sigue trabajando aquí
        return sesionSigue().then(function (sigue) {
          nube.modo = 'nube';
          if (!sigue.ok) {                                   // pestaña nueva o 30 min sin usar: no se deja entrar sin la nube
            guardar('nube-dueno', nube.usuario.id, true); nube.usuario = null; guardarNube(); actual = null; guardarListados();
            pedirEntrar(false, 'Sin conexión: por seguridad la sesión se cerró. Entra otra vez cuando vuelva la señal.'); return;
          }
          nube.estado = 'sin-conexion'; pintarNube(); empezarVigilancia();
        });
      }
      nube.modo = 'local'; pintarNube();                     // aquí no hay nube (o aún no está lista en Cloudflare): todo en el equipo, como antes
    });
  }

  /* ---------- entrar y salir ---------- */
  function pedirEntrar(primera, mensaje) {
    document.documentElement.classList.add('pide-entrar');
    ['#dlg-reserva', '#dlg-cuenta', '#dlg-usuario', '#dlg-confirmar', '#dlg-pregunta', '#dlg-sigues', '#dlg-nombre', '#dlg-fecha'].forEach(function (s) { var d = $(s); if (d && d.open && d.close) { d.close(); } });
    ocultarGuia(); cerrarDeshacer();
    $('#entrar').hidden = false;
    $('#entrar-primera').hidden = !primera;
    $('#entrar-sub').textContent = primera ? 'Así se crea el acceso a la nube.' : 'Solo para recepción: tu nombre y tu contraseña.';
    var err = $('#e-error'); err.textContent = mensaje || ''; err.hidden = !mensaje;
    $('#e-clave').value = '';
    pintarNube();
    var tactil = window.matchMedia && window.matchMedia('(pointer: coarse), (hover: none)').matches;
    if (!tactil) { setTimeout(function () { ($('#e-usuario').value ? $('#e-clave') : $('#e-usuario')).focus(); }, 60); }
  }
  function ponerUsuario(u) {
    var nuevo = usuarioSano(u), dueno = +leer('nube-dueno', 0) || 0;
    // v1.15: lo que quedó guardado en este equipo es de otra persona → se borra antes de entrar (cada uno ve lo suyo)
    if (dueno && nuevo && dueno !== nuevo.id) { olvidarEquipo(); }
    if (nuevo) { guardar('nube-dueno', nuevo.id, true); }
    nube.usuario = nuevo; nube.modo = 'nube';
    guardarNube();
    empezarVigilancia();
    document.documentElement.classList.remove('pide-entrar');
    $('#entrar').hidden = true;
    pintarNube();
    if (nube.usuario.cambiar) { setTimeout(function () { abrirCuenta(true); }, 50); }
    if (esAdmin()) { cargarAdmin(); }
  }
  function entrar() {
    var usuario = $('#e-usuario').value.replace(/\s+/g, ' ').trim(), clave = $('#e-clave').value, boton = $('#e-entrar');   // v1.13: la nube lo compara sin mayúsculas ni tildes
    var err = $('#e-error');
    if (!usuario || !clave) { err.textContent = 'Escribe tu usuario y tu contraseña.'; err.hidden = false; return; }
    boton.disabled = true; boton.textContent = 'Entrando…'; err.hidden = true;
    pedir('POST', 'entrar', { usuario: usuario, clave: clave }).then(function (j) {
      $('#e-clave').value = '';
      tActividad = 0; marcarActividad(true); latir(true);   // v1.15: empieza a contar los 30 min y esta pestaña queda «viva»
      guardar('guia-hoja', false, true);                     // v1.5: en cada entrada la guía «tu hoja está aquí abajo» sale una vez
      // v1.11 (JX: «entra a la página primero y después carga el modal, y no debería»): el ✓ de bienvenida sale EN EL MISMO
      // instante en que se quita la puerta; lo de la nube se trae detrás (el historial aparece solo cuando llega).
      // Si es la primera vez del admin (contraseña de la CLAVE_INICIAL), primero sale «Mi cuenta» y no la bienvenida.
      var u0 = j.usuario || {};
      if (!u0.cambiar) {
        resultado('ok', '¡Bienvenido, ' + u0.nombre + '!', 'Acceso ' + (u0.rol === 'admin' ? 'de administrador ' : '') + 'conectado: lo que hagas se guarda en este equipo y en la nube de recepción.');
      }
      ponerUsuario(j.usuario);
      // v1.15 (JX): al entrar, la pantalla siempre limpia para subir un Excel; lo anterior está en su historial
      actual = null; guardarListados();
      return bajarNube(true).then(function () { pintarTodo(); });
    }, function (e) {
      var t = {
        clave: 'Usuario o contraseña incorrectos. Las mayúsculas cuentan.',
        espera: 'Demasiados intentos: espera ' + ((e.datos && e.datos.minutos) || 15) + ' minutos e inténtalo otra vez.',
        datos: 'Escribe tu nombre y apellido como te lo dio el administrador.',
        'sin-conexion': 'Sin conexión: revisa el internet e inténtalo otra vez.'
      }[e.tipo] || 'No se pudo entrar. Inténtalo otra vez en un momento.';
      err.textContent = t; err.hidden = false;
      resultado('error', 'No se pudo entrar', t).then(function () { $('#e-clave').focus(); });   // v1.5: ✗ roja
    }).then(function () { boton.disabled = false; boton.textContent = 'Entrar'; });
  }
  /** Borra de este equipo todo lo de la nube (al salir: el equipo puede ser compartido). */
  function olvidarEquipo() {
    listados = []; actual = null; guardarListados();
    guardar('nube-dueno', 0, true);
    nube.usuario = null; nube.vers = {}; nube.pend = {}; nube.acciones = {}; nube.reemplaza = {}; nube.sueltas = []; nube.desde = 0;
    guardarNube();
  }
  /** Salir (v1.5): pregunta con la ventanita de la puerta y al final «Sesión cerrada». */
  function salir() {
    var seguir = hayPendientes() ? subirNube() : Promise.resolve();
    seguir.then(function () {
      var pendientes = hayPendientes();
      return preguntar({
        tipo: pendientes ? 'eliminar' : 'salir',
        titulo: pendientes ? '¿Salir sin subir los cambios?' : '¿Salir de tu cuenta?',
        texto: pendientes ? 'Hay cambios que todavía no se han subido a la nube (¿sin señal?). Si sales ahora se pierden.'
          : 'En este equipo se borra el historial (sigue guardado en la nube). Para volver, entras con tu nombre y tu contraseña.',
        si: pendientes ? 'Salir igual' : 'Sí, salir'
      });
    }).then(function (si) {
      if (!si) { return; }
      cerrarDialogo('#dlg-cuenta');
      var nombre = nube.usuario ? nube.usuario.nombre : '';
      pedir('POST', 'salir', {}).catch(nada).then(function () {
        olvidarEquipo(); pintarTodo(); pedirEntrar(false, '');
        resultado('salir', 'Sesión cerrada', (nombre ? '¡Hasta pronto, ' + nombre + '! ' : '') + 'En este equipo ya no queda nada del historial.');
      });
    });
  }
  function cerrarDialogo(sel) { var d = $(sel); if (d.open && d.close) { d.close(); } else { d.removeAttribute('open'); } }
  function abrirDialogo(sel) { var d = $(sel); if (typeof d.showModal === 'function') { if (!d.open) { d.showModal(); } } else { d.setAttribute('open', ''); } }

  /* ---------- subir y traer ---------- */
  /** Lo llama tocar() y cargarListado(): este listado cambió y hay que subirlo. */
  function nubeCambio(x, que, reemplazaId) {
    if (!nubeActiva() || !x) { return; }
    nube.pend[x.id] = (nube.pend[x.id] || 0) + 1;
    if (que) { (nube.acciones[x.id] = nube.acciones[x.id] || []).push(que); nube.acciones[x.id] = nube.acciones[x.id].slice(-30); }
    if (reemplazaId) {
      if (nube.vers[reemplazaId]) { nube.reemplaza[x.id] = reemplazaId; }   // si nunca se subió, no hay nada que reemplazar en la nube
      delete nube.pend[reemplazaId]; delete nube.vers[reemplazaId];
      if (nube.acciones[reemplazaId]) { nube.acciones[x.id] = nube.acciones[reemplazaId].concat(nube.acciones[x.id] || []); delete nube.acciones[reemplazaId]; }
    }
    guardarNube(); programarSubida(NUBE_SUBIR_MS);
  }
  /** Imprimir, PDF y compartir no cambian el listado pero van a «Quién hizo qué». */
  function nubeAnotar(texto) {
    if (!nubeActiva()) { return; }
    nube.sueltas.push(texto); nube.sueltas = nube.sueltas.slice(-30);
    guardarNube(); programarSubida(NUBE_SUBIR_MS);
  }
  function programarSubida(ms) {
    clearTimeout(nube.tSubir);
    if (!nubeActiva()) { return; }
    if (nube.estado === 'al-dia') { nube.estado = 'pendiente'; }
    nube.tSubir = setTimeout(subirNube, ms);
    pintarNube();
  }
  function indiceDe(id) { for (var i = 0; i < listados.length; i++) { if (listados[i].id === id) { return i; } } return -1; }
  /** Cambia en este equipo un listado por otra versión (la mezclada o la de la nube). */
  function ponerLocal(x) {
    var i = indiceDe(x.id);
    if (i >= 0) { listados[i] = x; } else { listados.push(x); }
    if (actual && actual.id === x.id) { actual = x; return true; }
    return false;
  }
  function quitarLocal(id) {
    var i = indiceDe(id);
    if (i >= 0) { listados.splice(i, 1); }
    delete nube.vers[id]; delete nube.pend[id]; delete nube.acciones[id]; delete nube.reemplaza[id];
    if (actual && actual.id === id) { actual = null; return true; }
    return false;
  }
  /** Mezcla lo de este equipo con lo de la nube: por cada reserva gana el cambio más nuevo. */
  function mezclar(loc, rem) {
    if (!loc) { return rem; }
    var r = listadoSano(JSON.parse(JSON.stringify(rem)));
    if (!r) { return loc; }
    var borr = {}, porId = {};
    (loc.borradas || []).concat(r.borradas || []).forEach(function (b) { borr[b] = true; });
    r.filas.forEach(function (f, i) { porId[f.id] = i; });
    loc.filas.forEach(function (f) {
      if (borr[f.id]) { return; }
      var i = porId[f.id];
      if (i === undefined) { r.filas.push(f); } else if ((f.tf || 0) > (r.filas[i].tf || 0)) { r.filas[i] = f; }
    });
    r.filas = r.filas.filter(function (f) { return !borr[f.id]; });
    r.borradas = Object.keys(borr).slice(-300);
    if ((loc.tFecha || 0) > (r.tFecha || 0)) { r.fecha = loc.fecha; r.fechaManual = loc.fechaManual; r.tFecha = loc.tFecha; }
    r.seq = Math.max(loc.seq || 0, r.seq || 0);
    r.actualizado = Math.max(loc.actualizado || 0, r.actualizado || 0);
    if (r.novedades) {                                       // las que alguien ya volvió a agregar no siguen como «ya no está»
      var hay = {};
      r.filas.forEach(function (f) { hay[Reglas.llave(f.cod)] = true; });
      r.novedades.yaNo = r.novedades.yaNo.filter(function (y) { return !hay[Reglas.llave(y.cod)]; });
    }
    return r;
  }
  function errorNube(e) {
    if (e && e.estado === 401) {                             // la sesión se venció (o el admin desactivó el usuario)
      if (nube.usuario) { guardar('nube-dueno', nube.usuario.id, true); }
      nube.usuario = null; guardarNube(); actual = null; guardarListados(); pintarTodo();
      pedirEntrar(false, 'Tu sesión se cerró: entra otra vez. Lo que hiciste quedó guardado y se sube al entrar.');
      return;
    }
    nube.estado = e && e.tipo === 'sin-conexion' ? 'sin-conexion' : 'error';
  }
  function subirUno(id, vuelta) {
    var x = listados[indiceDe(id)], marca = nube.pend[id];
    if (!x) { delete nube.pend[id]; guardarNube(); return Promise.resolve(); }
    var acc = (nube.acciones[id] || []).slice(), reemplaza = nube.reemplaza[id];
    return pedir('PUT', 'listados/' + encodeURIComponent(id), { datos: x, base: nube.vers[id] || 0, reemplaza: reemplaza || null, actividad: acc }).then(function (r) {
      if (r.cambio) { throw { estado: 409, datos: r }; }   // otro equipo lo cambió (la nube responde 200 para no ensuciar la consola)
      return r;
    }).then(function (r) {
      nube.vers[id] = r.v;
      if (nube.pend[id] === marca) { delete nube.pend[id]; }
      if (nube.acciones[id]) { nube.acciones[id].splice(0, acc.length); if (!nube.acciones[id].length) { delete nube.acciones[id]; } }
      if (reemplaza) { delete nube.reemplaza[id]; }
      guardarNube();
    }, function (e) {
      if (e.estado === 409 && e.datos && e.datos.listado && (vuelta || 0) < 3) {
        // otro equipo lo cambió: se mezcla y se vuelve a subir
        var rem = listadoSano(e.datos.listado.datos);
        if (rem) { if (ponerLocal(mezclar(x, rem))) { pintarListado(); } guardarListados(); }
        nube.vers[id] = e.datos.listado.v; guardarNube();
        return subirUno(id, (vuelta || 0) + 1);
      }
      if (e.estado === 403 && e.tipo === 'ajeno') {          // v1.15: no es suyo (no debería pasar): se quita de este equipo
        if (quitarLocal(id)) { pintarTodo(); } else { pintarHistorial(); }
        guardarNube(); guardarListados(); return;
      }
      if (e.estado === 410) {                                // lo borró el admin (o se venció a los 30 días)
        var eraActual = quitarLocal(id); guardarNube(); guardarListados();
        if (eraActual) { pintarTodo(); aviso('El administrador borró ese listado del historial.', 4200, true); } else { pintarHistorial(); }
        return;
      }
      throw e;
    });
  }
  /** Sube todo lo pendiente (y lo anotado para «Quién hizo qué»). */
  function subirNube() {
    clearTimeout(nube.tSubir);
    if (!nubeActiva()) { return Promise.resolve(); }
    if (nube.ocupada) { programarSubida(NUBE_SUBIR_MS); return Promise.resolve(); }
    if (!hayPendientes()) { nube.estado = 'al-dia'; pintarNube(); return Promise.resolve(); }
    nube.ocupada = true; nube.estado = 'subiendo'; pintarNube();
    var cadena = Promise.resolve();
    Object.keys(nube.pend).forEach(function (id) { cadena = cadena.then(function () { return subirUno(id, 0); }); });
    cadena = cadena.then(function () {
      if (!nube.sueltas.length) { return; }
      var envio = nube.sueltas.slice(0, 30);
      return pedir('POST', 'actividad', { acciones: envio }).then(function () { nube.sueltas.splice(0, envio.length); guardarNube(); });
    });
    return cadena.then(function () {
      nube.estado = hayPendientes() ? 'pendiente' : 'al-dia';
      nube.ultima = ahora(); guardar('nube-ultima', nube.ultima, true);
    }, errorNube).then(function () {
      nube.ocupada = false; pintarNube();
      if (nube.estado === 'al-dia') { guardadoNube('ok'); } else if (nube.estado !== 'pendiente') { guardadoNube('error'); }
      if (nubeActiva() && hayPendientes()) { programarSubida(nube.estado === 'pendiente' ? 300 : NUBE_REINTENTO_MS); }
    });
  }
  /** Trae lo nuevo de la nube. completo = todo (al entrar o al abrir); si no, solo lo cambiado desde la última vez. */
  function bajarNube(completo) {
    if (!nubeActiva() || nube.ocupada) { return Promise.resolve(); }
    nube.ocupada = true; nube.estado = 'bajando'; pintarNube();
    var desde = completo ? 0 : Math.max(0, nube.desde - 5000);
    return pedir('GET', 'listados?desde=' + desde).then(function (r) {
      nube.dias = +r.guardarDias || nube.dias;
      aplicarRemotos(r.listados || [], completo);
      aplicarAjustesHoja(r.ajustes);
      nube.estado = 'al-dia'; nube.ultima = ahora(); guardar('nube-ultima', nube.ultima, true);
      guardarNube();
    }).catch(errorNube).then(function () {
      nube.ocupada = false; pintarNube();
      if (nubeActiva() && hayPendientes()) { return subirNube(); }
    });
  }
  function aplicarRemotos(items, completo) {
    var cambio = false, cambioActual = false, actualAntes = actual ? actual.id : null, vistos = {};
    items.forEach(function (it) {
      if (!it || typeof it.id !== 'string') { return; }
      vistos[it.id] = true;
      nube.desde = Math.max(nube.desde, +it.t || 0);
      var i = indiceDe(it.id);
      if (it.borrado) { if (i >= 0) { if (quitarLocal(it.id)) { cambioActual = true; } cambio = true; } return; }
      if (i >= 0 && nube.vers[it.id] === it.v && !nube.pend[it.id]) { return; }   // ya está igual en este equipo
      var rem = listadoSano(it.datos);
      if (!rem) { return; }
      if (i >= 0 && nube.pend[it.id]) { rem = mezclar(listados[i], rem); }     // cambios sin subir aquí: se mezclan (y luego se suben)
      else if (i >= 0 && (nube.vers[it.id] || 0) > it.v) { return; }
      nube.vers[it.id] = it.v;
      if (ponerLocal(rem)) { cambioActual = true; }
      cambio = true;
    });
    if (completo) {
      listados.slice().forEach(function (x) {
        if (vistos[x.id] || nube.pend[x.id]) { return; }
        if (nube.vers[x.id] || ahora() - x.creado > nube.dias * DIA_MS) {
          // ya estaba en la nube y no volvió: lo borró el admin o se venció a los 30 días
          if (quitarLocal(x.id)) { cambioActual = true; }
          cambio = true;
        } else {
          // hecho en este equipo sin nube o sin señal: se sube para que lo vean los demás
          nube.pend[x.id] = 1;
          (nube.acciones[x.id] = nube.acciones[x.id] || []).push('Subió a la nube un listado hecho en este equipo (' + fechaTexto(x.fecha) + ')');
        }
      });
    }
    listados.sort(function (a, b) { return b.creado - a.creado; });
    if (listados.length > maxHistorial()) { listados = listados.slice(0, maxHistorial()); }
    if (actualAntes && !actual) { aviso('El administrador borró ese listado del historial.', 4200, true); }   // v1.15: cada Excel va aparte (ya no se reemplazan)
    if (!cambio) { return; }
    guardarListados();
    if (cambioActual || actualAntes !== (actual ? actual.id : null)) { pintarTodo(); } else { pintarHistorial(); }
  }
  function nubeBorrar(id) {
    if (!nubeActiva()) { return Promise.resolve(); }
    return pedir('DELETE', 'listados' + (id ? '/' + encodeURIComponent(id) : ''), {}).then(function () {
      if (id) { delete nube.vers[id]; delete nube.pend[id]; delete nube.acciones[id]; delete nube.reemplaza[id]; }
      else { nube.vers = {}; nube.pend = {}; nube.acciones = {}; nube.reemplaza = {}; }
      guardarNube();
    }, function (e) { if (e.estado === 401) { errorNube(e); } throw e; });
  }

  /* ---------- ajustes de la hoja (iguales para todos; los cambia el admin) ---------- */
  function aplicarAjustesHoja(g) {
    if (!esObjeto(g)) { return; }
    var casilla = g.casilla === true, apretar = g.apretar !== false;
    if (ajustes.casilla === casilla && ajustes.apretar === apretar) { return; }
    ajustes.casilla = casilla; ajustes.apretar = apretar; guardar('ajustes', ajustes, true);
    $('#aj-casilla').checked = casilla; $('#aj-apretar').checked = apretar;
    if (actual) { pintarHoja(); }
  }
  function nubeAjustesHoja() {
    if (!esAdmin()) { return; }
    pedir('PUT', 'ajustes', { casilla: ajustes.casilla === true, apretar: ajustes.apretar !== false }).then(function () {
      resultado('ok', '¡Ajuste guardado para todos!', 'Todos los equipos de recepción sacan la hoja así.');
    }, function (e) { errorNube(e); pintarNube(); resultado('error', 'No se pudo guardar el ajuste', 'Revisa la conexión e inténtalo otra vez.'); });
  }

  /* ---------- pintar: botón de cuenta, «Mi cuenta», permisos ---------- */
  function pintarNube() {
    var activa = nubeActiva(), entrando = document.documentElement.classList.contains('pide-entrar');
    $('#btn-cuenta').hidden = !activa;
    $('#admin').hidden = !esAdmin() || entrando;
    var bloqueo = activa && !esAdmin();
    $('#aj-casilla').disabled = bloqueo; $('#aj-apretar').disabled = bloqueo;
    $('#aj-nota-admin').hidden = !activa;
    $('#e-seguridad').hidden = nube.modo !== 'nube';
    $('#aj-nota-admin').textContent = esAdmin() ? 'Eres administrador: lo que cambies en la casilla y en «Ahorrar papel» cambia para todos los equipos.'
      : 'La casilla y «Ahorrar papel» son iguales para todos: solo el administrador los cambia.';
    $('#pie-privacidad').textContent = nube.modo === 'nube'
      ? 'Herramienta interna de recepción. El Excel se lee en tu equipo; en la nube solo queda el listado (reserva, habitaciones, agencia y titular), lo ven solo los usuarios de recepción y se borra solo a los ' + nube.dias + ' días.'
      : 'Herramienta interna de recepción. El Excel se lee en tu equipo y no se sube a internet.';
    if (!activa) { return; }
    var e = TEXTO_NUBE[nube.estado] || TEXTO_NUBE['al-dia'], u = nube.usuario;
    $('#cuenta-punto').setAttribute('data-color', e[2]);
    // v1.11: amarillo que late mientras guarda / trae; verde «Guardado · 10:45 a. m.» cuando ya
    var trabajando = nube.estado === 'subiendo' || nube.estado === 'bajando' || nube.estado === 'pendiente';
    if (trabajando) { $('#cuenta-punto').setAttribute('data-trabajando', ''); } else { $('#cuenta-punto').removeAttribute('data-trabajando'); }
    $('#cuenta-texto').textContent = u.nombre + ' · ' + e[0] + (nube.estado === 'al-dia' && nube.ultima ? ' · ' + horaDe(nube.ultima).replace(/\u00A0/g, ' ') : '');
    $('#btn-cuenta').setAttribute('aria-label', 'Mi cuenta: ' + u.nombre + '. ' + e[1]);
    $('#cuenta-estado-punto').setAttribute('data-color', e[2]);
    $('#cuenta-estado-texto').textContent = e[1] + (nube.ultima && nube.estado !== 'subiendo' && nube.estado !== 'bajando' ? ' Última vez: ' + cuando(nube.ultima) : '');
    $('#cuenta-quien').innerHTML = 'Entraste como <strong>' + esc(u.nombre) + '</strong> · ' + (u.rol === 'admin' ? 'Administrador' : 'Recepción') + '.';
    $('#btn-ir-admin').hidden = !esAdmin();
  }
  function abrirCuenta(obligada) {
    if (!nubeActiva()) { return; }
    pintarNube();
    $('#clave-obligada').hidden = !obligada;
    $('#cuenta-botones').hidden = !!obligada;
    // v1.7: recepción no cambia su contraseña (se la pone el admin); solo el admin ve el formulario
    var puedeCambiar = obligada || esAdmin();
    $('#form-clave').hidden = !puedeCambiar;
    $('#clave-nota-recepcion').hidden = puedeCambiar;
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
      nube.usuario.cambiar = false; guardarNube();
      cerrarDialogo('#dlg-cuenta');
      resultado('ok', '¡Contraseña cambiada!', 'Desde ahora entras con la nueva.' + (nube.usuario ? ' Bienvenido, ' + nube.usuario.nombre + '.' : ''));
    }, function (e) {
      if (e.estado === 401) { errorNube(e); return; }
      mal({ clave: 'La contraseña actual no es correcta.', corta: 'La nueva debe tener 8 o más letras o números.', igual: 'La nueva tiene que ser distinta de la actual.', 'sin-conexion': 'Sin conexión: inténtalo cuando vuelva la señal.' }[e.tipo] || 'No se pudo cambiar. Inténtalo otra vez.');
    }).then(function () { b.disabled = false; });
  }

  /* ---------- administración (solo el admin) ---------- */
  function cargarAdmin() {
    if (!esAdmin()) { return Promise.resolve(); }
    return Promise.all([
      pedir('GET', 'usuarios').then(function (r) { pintarUsuarios(r.usuarios || []); }),
      pedir('GET', 'actividad').then(function (r) { nube.admin.actividad = r.actividad || []; nube.admin.verHasta = 60; pintarActividad(); })
    ]).catch(function (e) { if (e.estado === 401) { errorNube(e); } });
  }
  function pintarUsuarios(lista) {
    var yo = nube.usuario ? nube.usuario.id : 0;
    $('#lista-usuarios').innerHTML = lista.map(function (u) {
      var propio = u.id === yo, chips = [];
      if (u.rol === 'admin') { chips.push('<span class="chip chip--cambio">Administrador</span>'); }
      if (!u.activo) { chips.push('<span class="chip chip--revisar">Desactivado</span>'); }
      if (u.activo && u.cambiar) { chips.push('<span class="chip chip--mano">Falta que ponga su contraseña</span>'); }
      if (propio) { chips.push('<span class="chip">Tú</span>'); }
      var botones = '<button type="button" class="enlace" data-u="nombre">Nombre</button>' + (propio ? '<button type="button" class="enlace" data-u="mia">Cambiar mi contraseña</button>'
        : '<button type="button" class="enlace" data-u="clave">Contraseña nueva</button>' +
          '<button type="button" class="enlace" data-u="rol">' + (u.rol === 'admin' ? 'Quitar administrador' : 'Hacer administrador') + '</button>' +
          '<button type="button" class="enlace' + (u.activo ? ' enlace--peligro' : '') + '" data-u="activo">' + (u.activo ? 'Desactivar' : 'Activar') + '</button>');
      return '<li data-activo="' + (u.activo ? 'si' : 'no') + '" data-id="' + esc(u.id) + '" data-nombre="' + esc(u.nombre) + '" data-usuario="' + esc(u.usuario) + '" data-rol="' + esc(u.rol) + '" data-act="' + (u.activo ? '1' : '0') + '">' +
        '<span class="usuarios__info"><span class="usuarios__nombre">' + esc(u.nombre) + ' ' + chips.join('') + '</span>' +
        '<span class="usuarios__meta">' + (/\s/.test(u.usuario) ? 'Entra con su nombre' : 'Entra con «' + esc(u.usuario) + '» (ponle su nombre completo)') + ' · creado el ' + esc(fechaTexto(diaDe(u.creado))) + '</span></span>' +
        '<span class="usuarios__botones">' + botones + '</span></li>';
    }).join('');
  }
  function pintarActividad() {
    var a = nube.admin.actividad, n = Math.min(a.length, nube.admin.verHasta);
    $('#lista-actividad').innerHTML = a.length ? a.slice(0, n).map(function (x) {
      var accion = String(x.accion || '');
      return '<li><span class="actividad__cuando">' + esc(cuando(x.t).replace(' a las ', ', ')) + '</span>' +
        '<span class="actividad__que"><strong>' + esc(x.nombre || x.usuario || '—') + '</strong>' + esc(accion.charAt(0).toLowerCase() + accion.slice(1)) + '</span></li>';
    }).join('') : '<li><span class="actividad__que nota">Todavía no hay actividad.</span></li>';
    $('#btn-mas-actividad').hidden = n >= a.length;
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
    var nuevo = modo === 'nuevo', soloNombre = modo === 'nombre';
    $('#u-titulo').textContent = nuevo ? 'Nuevo usuario' : soloNombre ? 'Nombre de ' + li.getAttribute('data-nombre') : 'Contraseña nueva para ' + li.getAttribute('data-nombre');
    $('#u-ayuda').textContent = nuevo ? 'La persona entra con su nombre y apellido y la contraseña que escribas aquí. Entrégasela en persona.'
      : soloNombre ? 'Con este nombre entra (sin importar mayúsculas ni tildes) y así sale en la hoja, en el historial y en «Quién hizo qué». La contraseña no cambia.'
        : 'Se cierra su sesión en todos los equipos y desde ahora entra con la contraseña que escribas aquí. Entrégasela en persona.';
    $('#u-datos').hidden = !(nuevo || soloNombre);
    $('#u-rol').closest('.campo').hidden = soloNombre;   // v1.13: el campo «Usuario» ya no se muestra (es el nombre)
    $('#u-clave').closest('.campo').hidden = soloNombre;
    $('#u-nombre').value = soloNombre ? li.getAttribute('data-nombre') : ''; $('#u-usuario').value = ''; $('#u-rol').value = 'recepcion';
    $('#u-clave').value = '';                                // v1.7: la contraseña la escribe el admin (el dado inventa una si quiere)
    $('#u-guardar').textContent = nuevo ? 'Crear usuario' : soloNombre ? 'Guardar nombre' : 'Poner contraseña';
    $('#u-error').hidden = true;
    abrirDialogo('#dlg-usuario');
    setTimeout(function () { (nuevo || soloNombre ? $('#u-nombre') : $('#u-clave')).focus(); }, 40);
  }
  /** v1.13: «jaime valera» → «Jaime Valera» (igual que la nube); si ya trae mayúsculas, se deja como lo escribieron. */
  function nombreBonito(t) {
    return t === t.toLowerCase() ? t.replace(/(^|[\s'-])([a-záéíóúñü])/g, function (m, a, b) { return a + b.toUpperCase(); }) : t;
  }
  function guardarUsuario() {
    var err = $('#u-error'), clave = $('#u-clave').value.trim();
    function mal(t, campo) { err.textContent = t; err.hidden = false; if (campo) { campo.focus(); } }
    var cuerpo, peticion;
    if (dlgUsuario.modo === 'nombre') {
      var nom = nombreBonito(Reglas.limpiar($('#u-nombre').value));
      if (!nom) { mal('Escribe el nombre.', $('#u-nombre')); return; }
      clave = '12345678';                                    // (no se manda: solo para pasar la revisión de abajo)
      cuerpo = { nombre: nom };
      peticion = function () { return pedir('PATCH', 'usuarios/' + dlgUsuario.id, cuerpo); };
    } else if (dlgUsuario.modo === 'nuevo') {
      var nombre = nombreBonito(Reglas.limpiar($('#u-nombre').value)), usuario = nombre;   // v1.13: el usuario es el nombre y apellido
      if (nombre.length < 3 || !/\s/.test(nombre)) { mal('Escribe el nombre y el apellido de la persona (por ejemplo, Jampier Estrada).', $('#u-nombre')); return; }
      cuerpo = { nombre: nombre, usuario: usuario, rol: $('#u-rol').value, clave: clave };
      peticion = function () { return pedir('POST', 'usuarios', cuerpo); };
    } else {
      cuerpo = { clave: clave };
      peticion = function () { return pedir('PATCH', 'usuarios/' + dlgUsuario.id, cuerpo); };
    }
    if (clave.length < 8) { mal(clave ? 'La contraseña debe tener 8 o más letras o números.' : 'Escribe la contraseña (8 o más letras o números).', $('#u-clave')); return; }
    var b = $('#u-guardar'); b.disabled = true;
    peticion().then(function (r) {
      pintarUsuarios(r.usuarios || []);
      cerrarDialogo('#dlg-usuario');
      if (dlgUsuario.modo === 'nombre' && nube.usuario && dlgUsuario.id === nube.usuario.id) {
        // v1.13: si se cambió a sí mismo, desde ahora entra con ese nombre (la nube devuelve cómo quedó)
        var yoNuevo = (r.usuarios || []).filter(function (x) { return x.id === nube.usuario.id; })[0];
        nube.usuario.nombre = yoNuevo ? yoNuevo.nombre : cuerpo.nombre; if (yoNuevo) { nube.usuario.usuario = yoNuevo.usuario; }
        guardarNube(); pintarNube();
      }
      if (dlgUsuario.modo === 'nuevo') {
        resultado('ok', '¡Usuario creado!', 'Entra escribiendo «' + cuerpo.nombre + '» y esta contraseña. Entrégasela en persona:', clave);
      } else if (dlgUsuario.modo === 'nombre') {
        resultado('ok', '¡Nombre guardado!', 'Desde ahora entra escribiendo «' + cuerpo.nombre + '» (con la misma contraseña) y así sale en la hoja, el historial y «Quién hizo qué».');
      } else {
        resultado('ok', '¡Contraseña nueva puesta!', 'Su sesión se cerró en todos los equipos. Desde ahora entra con esta contraseña (entrégasela en persona):', clave);
      }
      cargarAdmin();
    }, function (e) {
      if (e.estado === 401) { errorNube(e); return; }
      mal({ existe: 'Ya hay alguien con ese nombre: agrégale el segundo apellido.', usuario: 'Escribe solo letras, espacios y números (nombre y apellido).', nombre: 'Escribe el nombre de la persona.', corta: 'La contraseña temporal debe tener 8 o más.', 'sin-conexion': 'Sin conexión: inténtalo cuando vuelva la señal.' }[e.tipo] || 'No se pudo guardar. Inténtalo otra vez.');
    }).then(function () { b.disabled = false; });
  }
  function cambiarUsuario(li, que) {
    var id = +li.getAttribute('data-id'), nombre = li.getAttribute('data-nombre'), cuerpo, pregunta, si;
    if (que === 'activo') {
      var activo = li.getAttribute('data-act') === '1';
      cuerpo = { activo: !activo };
      pregunta = activo ? '¿Desactivar a ' + nombre + '? No podrá entrar y se cierra su sesión en todos los equipos. Lo que hizo queda guardado.' : '¿Activar otra vez a ' + nombre + '?';
      si = activo ? 'Desactivar' : 'Activar';
    } else {
      var admin = li.getAttribute('data-rol') === 'admin';
      cuerpo = { rol: admin ? 'recepcion' : 'admin' };
      pregunta = admin ? '¿Quitarle el administrador a ' + nombre + '? Seguirá entrando como recepción.' : '¿Hacer administrador a ' + nombre + '? Podrá crear usuarios, ver la actividad, borrar del historial y cambiar los ajustes de la hoja.';
      si = admin ? 'Quitar administrador' : 'Hacer administrador';
    }
    // v1.5: desactivar = ventanita roja (es «eliminar» el acceso) + Deshacer; lo demás = confirmar + ✓ verde
    var desactivar = que === 'activo' && cuerpo.activo === false;
    var pide = desactivar
      ? preguntar({ titulo: '¿Desactivar a ' + nombre + '?', texto: 'No podrá entrar y se cierra su sesión en todos los equipos. Lo que hizo queda guardado.', si: 'Sí, desactivar' })
      : confirmar(pregunta, si);
    function fallo(e) {
      if (e.estado === 401) { errorNube(e); return; }
      resultado('error', 'No se pudo cambiar', { 'ultimo-admin': 'Debe quedar al menos un administrador activo.', propio: 'No puedes quitarte el administrador ni desactivarte a ti mismo.' }[e.tipo] || 'Revisa la conexión e inténtalo otra vez.');
    }
    pide.then(function (ok) {
      if (!ok) { return; }
      return pedir('PATCH', 'usuarios/' + id, cuerpo).then(function (r) {
        pintarUsuarios(r.usuarios || []); cargarAdmin();
        if (desactivar) {
          conDeshacer(nombre + ' quedó desactivado.', function () {
            pedir('PATCH', 'usuarios/' + id, { activo: true }).then(function (r2) {
              pintarUsuarios(r2.usuarios || []); cargarAdmin(); resultado('ok', '¡Listo, se deshizo!', nombre + ' puede entrar otra vez.');
            }, fallo);
          });
          return;
        }
        resultado('ok', que === 'activo' ? '¡' + nombre + ' está activo otra vez!' : cuerpo.rol === 'admin' ? '¡' + nombre + ' ya es administrador!' : 'Listo: ' + nombre + ' quedó como recepción',
          que === 'activo' ? 'Ya puede entrar con su usuario y su contraseña.' : cuerpo.rol === 'admin' ? 'Puede crear usuarios, ver «Quién hizo qué», borrar del historial y cambiar los ajustes de la hoja.' : 'Sigue entrando, pero ya no maneja usuarios ni borra.');
      }, fallo);
    });
  }

  /* ---------- v1.15: la sesión se cierra sola (los PC de recepción son compartidos) ----------
     JX: «si entra otro compañero a ese computador va a estar en la cuenta de ese otro… que se cierre
     automáticamente… media hora». Y la nube la vence sola a los 30 min sin usar (SESION_INACTIVA).
     · 30 min sin tocar nada (INACTIVO_MS) → se cierra; 1 min antes sale «¿Sigues ahí?» con la cuenta atrás.
       «Tocar» = clic, tecla, rueda, toque o escribir, en CUALQUIER pestaña de la página (se anota en
       localStorage «actividad»). Traer lo de la nube cada 45 s NO cuenta.
     · Al cerrar la pestaña (o el navegador) → la próxima vez que se abra la página, pide entrar.
       Cómo se sabe: la pestaña deja su «latido» en sessionStorage (al recargar sigue ahí, en una pestaña
       nueva no); y si hay OTRA pestaña de la página abierta, contesta un «ping» por localStorage. */
  var INACTIVO_MS = 30 * 60000, AVISO_INACTIVO_MS = 60000, LATIDO_MS = 5000, RECARGA_MS = 20000;
  var tActividad = 0, tLatido = 0, cerrandoSola = false, vigilando = 0;
  function sesionLeer(k) { try { return window.sessionStorage.getItem(PREFIJO + k); } catch (e) { return null; } }
  function sesionGuardar(k, v) {
    try { if (v == null) { window.sessionStorage.removeItem(PREFIJO + k); } else { window.sessionStorage.setItem(PREFIJO + k, String(v)); } } catch (e) { /* sin sessionStorage */ }
  }
  function ultimaActividad() { return Math.max(+leer('actividad', 0) || 0, tActividad); }
  function marcarActividad(forzar) {
    var t = ahora();
    if (!forzar && t - tActividad < 5000) { return; }        // a lo sumo cada 5 s
    tActividad = t; guardar('actividad', t, true);
  }
  function latir(forzar) {
    var t = ahora();
    if (!forzar && t - tLatido < LATIDO_MS) { return; }
    tLatido = t; sesionGuardar('latido', t); guardar('latido', t, true);
  }
  /** ¿Hay otra pestaña de la página abierta? (le pregunta por localStorage; contesta en menos de 0,7 s) */
  function hayOtraPestana() {
    return new Promise(function (ok) {
      var marca = String(Math.random()).slice(2) + ahora(), listo = false;
      function fin(si) { if (listo) { return; } listo = true; window.removeEventListener('storage', alGuardar); ok(si); }
      function alGuardar(e) { if (e.key === PREFIJO + 'pong' && String(e.newValue || '').indexOf(marca) >= 0) { fin(true); } }
      window.addEventListener('storage', alGuardar);
      try { window.localStorage.setItem(PREFIJO + 'ping', marca); } catch (e) { fin(false); return; }
      setTimeout(function () { fin(false); }, 700);
    });
  }
  /** Al abrir la página con la sesión puesta: ¿sigue siendo la misma persona? → { ok, motivo } */
  function sesionSigue() {
    var actividad = +leer('actividad', 0) || 0;
    if (actividad && ahora() - actividad >= INACTIVO_MS) { return Promise.resolve({ ok: false, motivo: 'inactivo' }); }
    var mio = +sesionLeer('latido') || 0;
    if (mio && ahora() - mio < RECARGA_MS) { return Promise.resolve({ ok: true }); }   // recargó esta misma pestaña
    return hayOtraPestana().then(function (si) { return si ? { ok: true } : { ok: false, motivo: 'pestana' }; });
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
    } else if (dlg.open) { cerrarDialogo('#dlg-sigues'); }   // tocó algo (aquí o en otra pestaña)
  }
  /** Cierra la sesión sin preguntar. motivo: 'inactivo' (30 min) · 'pestana' (se cerró la pestaña) · 'manual' («Salir ahora»).
   *  alAbrir = true cuando se detecta al abrir la página (no hay nada en pantalla todavía). */
  function cerrarSola(motivo, alAbrir) {
    if (cerrandoSola) { return Promise.resolve(); }
    cerrandoSola = true;
    var nombre = nube.usuario ? nube.usuario.nombre : '', dueno = nube.usuario ? nube.usuario.id : 0;
    if ($('#dlg-sigues').open) { cerrarDialogo('#dlg-sigues'); }
    var subir = hayPendientes() ? subirNube().catch(nada) : Promise.resolve();
    return subir.then(function () { return pedir('POST', 'salir', { motivo: motivo === 'manual' ? '' : motivo }).catch(nada); }).then(function () {
      if (hayPendientes()) {                                  // sin señal: lo que no se subió queda guardado (escondido) para su dueño
        guardar('nube-dueno', dueno, true); nube.usuario = null; guardarNube(); actual = null; guardarListados();
      } else { olvidarEquipo(); }
      sesionGuardar('latido', null);
      cerrandoSola = false;
      pintarTodo();
      pedirEntrar(false, motivo === 'pestana' ? 'Por seguridad, la sesión se cierra al cerrar la pestaña: entra otra vez con tu nombre y tu contraseña.' : '');
      if (motivo === 'inactivo') {
        resultado('salir', 'Sesión cerrada', 'Pasaron 30 minutos sin usar la página' + (nombre ? ' (' + nombre + ')' : '') +
          ': por seguridad se cerró sola. Para volver, entra con tu nombre y tu contraseña.' + (alAbrir ? '' : ' Todo lo que hiciste quedó guardado en tu historial.'));
      } else if (motivo === 'manual') {
        resultado('salir', 'Sesión cerrada', (nombre ? '¡Hasta pronto, ' + nombre + '! ' : '') + 'Todo quedó guardado en tu historial.');
      }
    });
  }
  function eventosSesion() {
    ['pointerdown', 'keydown', 'wheel', 'touchstart', 'input'].forEach(function (ev) {
      document.addEventListener(ev, function (e) {
        if ($('#dlg-sigues').open && !(e.target && e.target.closest && e.target.closest('#dlg-sigues'))) { return; }   // con «¿Sigues ahí?» abierto solo cuentan sus botones
        if (nubeActiva()) { marcarActividad(false); }
      }, { capture: true, passive: true });
    });
    $('#sig-si').addEventListener('click', function () { marcarActividad(true); cerrarDialogo('#dlg-sigues'); pedir('GET', 'yo').catch(nada); });   // también la alarga en la nube
    $('#sig-salir').addEventListener('click', function () { cerrarSola('manual', false); });
    $('#dlg-sigues').addEventListener('cancel', function (e) { e.preventDefault(); $('#sig-si').click(); });   // Esc = sigo aquí
    window.addEventListener('pagehide', function () { if (nubeActiva()) { latir(true); } });
    document.addEventListener('visibilitychange', function () { if (!document.hidden) { vigilarSesion(); } });
    // otra pestaña nueva pregunta si hay alguna abierta: esta contesta
    window.addEventListener('storage', function (e) {
      if (e.key === PREFIJO + 'ping' && e.newValue && nubeActiva() && !cerrandoSola) {
        try { window.localStorage.setItem(PREFIJO + 'pong', e.newValue + ':' + ahora()); } catch (x) { /* nada */ }
      }
    });
  }

  function eventosNube() {
    $('#form-entrar').addEventListener('submit', function (e) { e.preventDefault(); entrar(); });
    /* el ojo: mostrar / ocultar la contraseña */
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ojo]');
      if (!b) { return; }
      var campo = $('#' + b.getAttribute('data-ojo')), ver = campo.type === 'password';
      campo.type = ver ? 'text' : 'password';
      b.setAttribute('aria-pressed', ver ? 'true' : 'false');
      b.setAttribute('aria-label', ver ? 'Ocultar la contraseña' : 'Mostrar la contraseña');
    });
    /* aviso de MAYÚSCULAS activadas */
    ['keydown', 'keyup'].forEach(function (ev) {
      $('#e-clave').addEventListener(ev, function (e) { if (e.getModifierState) { $('#e-mayus').hidden = !e.getModifierState('CapsLock'); } });
    });
    $('#btn-cuenta').addEventListener('click', function () { abrirCuenta(!!(nube.usuario && nube.usuario.cambiar)); });
    $('#btn-cerrar-cuenta').addEventListener('click', function () { cerrarDialogo('#dlg-cuenta'); });
    $('#dlg-cuenta').addEventListener('cancel', function (e) { if (nube.usuario && nube.usuario.cambiar) { e.preventDefault(); } });   // la primera vez del admin hay que poner la suya
    $('#form-clave').addEventListener('submit', function (e) { e.preventDefault(); cambiarMiClave(); });
    $('#btn-guardar-ahora').addEventListener('click', function () {
      var b = this; b.disabled = true;
      subirNube().then(function () { return bajarNube(false); }).then(function () {
        b.disabled = false;
        if (nube.estado === 'al-dia') { resultado('ok', '¡Todo guardado en la nube!', 'Los demás equipos de recepción ya ven lo mismo que tú.'); }
        else { resultado('error', 'No se pudo guardar en la nube', (TEXTO_NUBE[nube.estado] || TEXTO_NUBE.error)[1] + ' Lo hecho sigue en este equipo y se sube solo cuando vuelva la señal.'); }
      });
    });
    $('#btn-salir').addEventListener('click', salir);
    $('#btn-ir-admin').addEventListener('click', function () { cerrarDialogo('#dlg-cuenta'); irA('#admin'); cargarAdmin(); });
    /* administración */
    $('#btn-nuevo-usuario').addEventListener('click', function () { abrirUsuario('nuevo', null); });
    $('#btn-actualizar-actividad').addEventListener('click', function () { cargarAdmin().then(function () { resultado('ok', '¡Actividad al día!', 'Ya ves lo último que se hizo en todos los equipos.'); }); });
    $('#btn-mas-actividad').addEventListener('click', function () { nube.admin.verHasta += 100; pintarActividad(); });
    $('#lista-usuarios').addEventListener('click', function (e) {
      var b = e.target.closest('[data-u]');
      if (!b) { return; }
      var li = b.closest('li'), que = b.getAttribute('data-u');
      if (que === 'mia') { abrirCuenta(false); } else if (que === 'clave' || que === 'nombre') { abrirUsuario(que, li); } else { cambiarUsuario(li, que); }
    });
    $('#form-usuario').addEventListener('submit', function (e) { e.preventDefault(); guardarUsuario(); });
    $('#u-cancelar').addEventListener('click', function () { cerrarDialogo('#dlg-usuario'); });
    $('#u-azar').addEventListener('click', function () { $('#u-clave').value = claveAlAzar(); });
    /* traer lo de los demás equipos: cada 45 s, al volver a la pestaña y al volver la señal */
    setInterval(function () { if (nubeActiva() && !document.hidden) { bajarNube(false); } }, NUBE_TRAER_MS);
    document.addEventListener('visibilitychange', function () { if (!document.hidden && nubeActiva()) { bajarNube(false); } });
    window.addEventListener('online', function () { if (nubeActiva()) { subirNube().then(function () { return bajarNube(false); }); } });
    window.addEventListener('offline', function () { if (nubeActiva()) { nube.estado = 'sin-conexion'; pintarNube(); } });
  }

  /* ================================================================
   * 12) ARRANQUE
   * ================================================================ */
  /* Pantalla de carga (v1.3, pedido de JX: «me gusta más cómo se mueve el logo en la de turnos»):
     igual que el Manual de turnos v1.15 → el % sube parejo de 0 a 100 en 2,5 s, sin pausas (empieza
     en el <script> de index.html), se alcanza a ver el 100 % y se va con la salida rápida. */
  var CARGA_TOTAL_MS = 2500, CARGA_MIN_MS = 300, CARGA_VER_100_MS = 150, tRampa = 0;
  var CARGA_EXCEL_MS = 10000, VUELTAS_EXCEL = 4;             // v1.11: al leer el Excel, 10 s y 4 vueltas de 2,5 s (JX: «12 es mucho, mejor 10»)
  /** Al irse la pantalla de carga del Excel, el logo vuelve a una sola vuelta (la carga de la página no cambia). */
  function vueltasNormales() { setTimeout(function () { if (L.configurar && !L.estaVisible()) { L.configurar({ vueltas: 1 }); } }, 1600); }
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

  function iniciar() {
    aplicarTema();
    eventosSubir(); eventosEditar(); eventosSalida(); eventosHistorial(); eventosAjustes(); eventosNube(); eventosSesion(); eventosDeshacer(); eventosGuia(); eventosEditar2();
    /* v1.10: la hora de «Impreso el …» de la vista de la hoja se pone al día cada minuto (al imprimir se pone la exacta) */
    setInterval(function () { if (actual && maqueta && !imprimiendo && !document.hidden && Math.floor(ahora() / 60000) !== minutoHoja) { pintarHoja(); } }, 15000);
    /* v1.15: al RECARGAR la misma pestaña vuelve el listado que estaba en pantalla; en una pestaña nueva
       (o al entrar) la pantalla sale limpia para subir otro Excel: lo de antes está en el historial */
    var id = sesionLeer('actual');
    var ultimo = listados.filter(function (x) { return x.id === id; })[0];
    if (ultimo) { actual = ultimo; }
    try { window.localStorage.removeItem(PREFIJO + 'actual'); } catch (e) { /* lo de antes de v1.15 */ }
    /* la nube (si la hay) decide si se pide entrar antes de mostrar los datos */
    var listaNube = iniciarNube().catch(nada).then(function () { pintarTodo(); });
    /* la pantalla de carga se va cuando están listas las letras (también las de la hoja), la nube
       respondió y pasaron 2,5 s desde que se abrió la página */
    var letras = [listaNube];
    if (document.fonts && document.fonts.load) {
      letras.push(document.fonts.load('400 12px "Hoja Sans"').catch(nada), document.fonts.load('700 12px "Hoja Sans"').catch(nada));
      if (document.fonts.ready) { letras.push(Promise.resolve(document.fonts.ready).catch(nada)); }
    }
    var espera = function (ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); };
    var t0 = +document.documentElement.getAttribute('data-carga') || ahora();
    if (window.rampaCargaInicio) { clearInterval(window.rampaCargaInicio); window.rampaCargaInicio = 0; }
    rampaCarga(t0, 95);
    L.seguir([Promise.all(letras.concat(espera(Math.max(CARGA_MIN_MS, CARGA_TOTAL_MS - (ahora() - t0))))).then(function () {
      clearInterval(tRampa); tRampa = 0;
      if (L.progreso) { L.progreso(100); }
      return espera(CARGA_VER_100_MS);                       // que se alcance a ver el 100 % antes de irse
    })], { mensaje: 'Preparando el editador…' });
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', iniciar); } else { iniciar(); }
})(window, document);
