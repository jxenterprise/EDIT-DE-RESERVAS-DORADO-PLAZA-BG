/* =====================================================================
 *  LISTADO DE RESERVAS DP · RECEPCIÓN · HOTEL DORADO PLAZA BOCAGRANDE
 *  listado.js — LAS REGLAS: cómo se convierte el Excel de la extranet en
 *  el listado (una línea por reserva). Aquí no hay pantalla ni botones.
 *
 *  Reglas acordadas con JX (no cambiarlas sin preguntarle):
 *   · Solo se usan 4 columnas: Nro reserva, Nro hab, Agencia y Titular.
 *     Todo lo demás del Excel se descarta. Sirve igual el Excel completo
 *     de la extranet (17 columnas) o uno al que ya le borraron las demás:
 *     las columnas se buscan por su NOMBRE, no por su posición.
 *   · En el Excel cada fila es UNA habitación y la reserva se repite.
 *     Queda UNA línea por reserva, con su «Nro hab» MÁS ALTO; la agencia
 *     y el titular salen de esa misma fila. Orden: de más a menos habitaciones.
 *   · Debajo del código (lo que la extranet pega al código):
 *       «… ⚠ Incompleto» o «Sin preregistro»      → «Sin preregistro»
 *       «Preregistro (…) ✔ Completo»               → «Con preregistro»
 *       «Web check-in ✔ Completo»                  → «Web check-in completo»
 *       cualquier otro estado                       → tal cual (y se avisa)
 *   · Los códigos que no empiezan por DP se incluyen igual (y se avisa).
 *   · Nunca se inventa ni se borra un dato en silencio: lo dudoso se marca
 *     para que la persona lo revise, y lo quitado a mano se puede devolver.
 *
 *  Partes: 1 textos y tildes dañadas · 2 columnas del Excel · 3 celda de
 *  la reserva (código + preregistro) · 4 armar el listado · 5 consultas
 *  (visibles, totales, avisos) · 6 novedades entre dos descargas
 *
 *  Usa: nada. Lo usa: js/app.js (window.ReglasListado).
 * ===================================================================== */
(function (raiz) {
  'use strict';

  /* ================================================================
   * 1) TEXTOS Y TILDES DAÑADAS
   *    La extranet guarda mal algunas letras: «MUÑOZ» puede llegar como
   *    «MUÃ‘OZ» o como «MUÃOZ». Lo primero se arregla solo (es exacto);
   *    lo segundo NO se adivina: se marca y se sugiere.
   * ================================================================ */
  // caracteres que en Windows-1252 ocupan los bytes 0x80–0x9F
  var CP1252 = { '\u20AC': 0x80, '\u201A': 0x82, '\u0192': 0x83, '\u201E': 0x84, '\u2026': 0x85, '\u2020': 0x86, '\u2021': 0x87, '\u02C6': 0x88, '\u2030': 0x89, '\u0160': 0x8A, '\u2039': 0x8B, '\u0152': 0x8C, '\u017D': 0x8E, '\u2018': 0x91, '\u2019': 0x92, '\u201C': 0x93, '\u201D': 0x94, '\u2022': 0x95, '\u2013': 0x96, '\u2014': 0x97, '\u02DC': 0x98, '\u2122': 0x99, '\u0161': 0x9A, '\u203A': 0x9B, '\u0153': 0x9C, '\u017E': 0x9E, '\u0178': 0x9F };
  /** Byte «de continuación» (0x80–0xBF) que representa ese carácter, o -1. */
  function continuacion(ch) {
    if (ch === undefined) { return -1; }
    var c = ch.charCodeAt(0);
    if (c >= 0x80 && c <= 0xBF) { return c; }
    var b = CP1252[ch];
    return b !== undefined && b <= 0xBF ? b : -1;
  }
  /** Arregla lo que es exacto: «Ã±»→ñ, «Ã‘»→Ñ, «Â°»→°, «â€™»→’. Devuelve { texto, cambio }. */
  function repararTildes(s) {
    s = String(s == null ? '' : s);
    if (!/[\u00C2\u00C3\u00E2]/.test(s)) { return { texto: s, cambio: false }; }
    var r = '', cambio = false;
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i), b1 = continuacion(s.charAt(i + 1));
      if ((ch === '\u00C3' || ch === '\u00C2') && b1 >= 0) {            // Ã? o Â? → una letra
        r += String.fromCharCode(((ch === '\u00C3' ? 0xC3 : 0xC2) & 0x1F) << 6 | (b1 & 0x3F));
        i += 1; cambio = true; continue;
      }
      if (ch === '\u00E2' && b1 === 0x80) {                              // â€? → comillas y rayas tipográficas
        var b2 = continuacion(s.charAt(i + 2));
        if (b2 >= 0) { r += String.fromCharCode((0xE2 & 0x0F) << 12 | (0x80 & 0x3F) << 6 | (b2 & 0x3F)); i += 2; cambio = true; continue; }
      }
      r += ch;
    }
    return { texto: r, cambio: cambio };
  }
  /** Deja el texto limpio para mostrarlo: sin saltos ni espacios dobles; «undefined» = vacío. */
  function limpiar(v) {
    if (v == null) { return ''; }
    var s = String(v).replace(/[\u00AD\u200B-\u200F\uFEFF]/g, '')                              // invisibles: se quitan
      .replace(/[\u0000-\u001F\u007F-\u009F\u2028\u2029]/g, ' ').replace(/\s+/g, ' ').trim();   // saltos y controles: un espacio
    return /^(undefined|null|nan)$/i.test(s) ? '' : s;
  }
  function sinTildes(s) { return String(s).normalize('NFD').replace(/[\u0300-\u036F]/g, ''); }

  /* Palabras frecuentes (apellidos, nombres y palabras de agencias) que llevan
     tilde, Ñ o Ü. Solo sirven para SUGERIR la corrección de una letra dañada. */
  var DICCIONARIO = (
    'ACUÑA AGÜERO ALARCÓN ALBARRACÍN ALCALÁ ÁLVAREZ ARAGÓN ARBELÁEZ ARÉVALO ARGÜELLO ARISTIZÁBAL AVENDAÑO ÁVILA BÁEZ BAÑOS BARÓN BELTRÁN ' +
    'BENÍTEZ BERMÚDEZ BOLAÑOS BOLÍVAR BRICEÑO CÁCERES CALDERÓN CAÑAS CAÑÓN CÁRDENAS CARREÑO CASTAÑEDA CASTAÑO CASTRILLÓN CEDEÑO CHACÓN ' +
    'CHÁVEZ COLÓN CÓRDOBA CÓRDOVA CORTÉS DÁVILA DÍAZ DOMÍNGUEZ DUEÑAS DURÁN ECHEVERRÍA ECHAVARRÍA ESPAÑA ESTÉVEZ FARFÁN FERNÁNDEZ FLÓREZ ' +
    'GAITÁN GALÁN GALVÁN GÁLVEZ GARCÉS GARCÍA GARZÓN GIRÓN GÓMEZ GÓNGORA GONZÁLEZ GUARÍN GUTIÉRREZ GUZMÁN HERNÁNDEZ HERRÁN HOLGUÍN IBÁÑEZ ' +
    'IBARGÜEN JIMÉNEZ GIMÉNEZ LARRAÑAGA LEÓN LONDOÑO LÓPEZ MARÍN MÁRQUEZ MARTÍN MARTÍNEZ MEJÍA MELÉNDEZ MÉNDEZ MILLÁN MONTAÑA MONTAÑEZ ' +
    'MONTAÑO MONTÚFAR MORÁN MUÑOZ NARIÑO NARVÁEZ NIÑO NÚÑEZ OCAÑA ORDÓÑEZ ORDUÑA PÁEZ PATIÑO PAVÓN PEÑA PEÑALOZA PEÑARANDA PEÑUELA PÉREZ ' +
    'PINZÓN PIÑEROS PIÑERES QUIÑONES QUIÑÓNEZ RAMÍREZ RAMÓN RENDÓN RINCÓN RÍOS RODRÍGUEZ ROLDÁN ROMÁN SÁENZ SALDAÑA SÁNCHEZ SANTAMARÍA ' +
    'SEPÚLVEDA SOLÍS SUÁREZ TÉLLEZ TOBÓN TRIVIÑO UMAÑA URUEÑA VALDÉS VÁSQUEZ VÁZQUEZ VELÁSQUEZ VELÁZQUEZ VÉLEZ YÁÑEZ ZÁRATE ZÚÑIGA ' +
    'ADRIÁN AGUSTÍN ÁLVARO ANDRÉS ÁNGEL ÁNGELA ÁNGELES ANÍBAL BÁRBARA BEGOÑA BELÉN BENJAMÍN CÉSAR CONCEPCIÓN CRISTIÁN CRISTÓBAL DARÍO ' +
    'DÉBORA EFRAÍN ELÍAS ENCARNACIÓN ESTEFANÍA FABIÁN FÉLIX FERMÍN GERMÁN HÉCTOR HERNÁN INÉS IVÁN JESÚS JOAQUÍN JOSÉ JULIÁN LUCÍA MARÍA ' +
    'MOISÉS MÓNICA NÉSTOR NICOLÁS NOEMÍ ÓSCAR RAÚL RENÉ ROCÍO RUBÉN SEBASTIÁN SIMÓN SOFÍA TOMÁS VALENTÍN VERÓNICA VÍCTOR ' +
    'AMÉRICA AMÉRICAS MÉXICO PERÚ PANAMÁ BOGOTÁ MEDELLÍN TURÍSTICA TURÍSTICO TURÍSTICAS TURÍSTICOS COMPAÑÍA ESPAÑOL ESPAÑOLA SEÑOR SEÑORA ' +
    'NIÑOS NIÑA NIÑAS AÑO AÑOS MAÑANA EXPEDICIÓN EXCURSIÓN OPERACIÓN PROMOCIÓN ORGANIZACIÓN CORPORACIÓN FUNDACIÓN ASOCIACIÓN EDUCACIÓN ' +
    'RECREACIÓN RECEPCIÓN ATENCIÓN DIVERSIÓN PASIÓN NACIÓN UNIÓN REGIÓN MISIÓN VISIÓN CONEXIÓN SOLUCIÓN GESTIÓN AVIACIÓN NAVEGACIÓN ' +
    'ILUSIÓN EMOCIÓN ÉXITO ÚNICO ÚNICA MÁGICO MÁGICA CLÁSICO CLÁSICA AÉREO AÉREA OCÉANO PACÍFICO ATLÁNTICO ÁFRICA PANAMEÑA PANAMEÑO ' +
    'BRASILEÑA BRASILEÑO CARIBEÑA CARIBEÑO COSTEÑA COSTEÑO ISLEÑA ISLEÑO SUEÑO SUEÑOS ENSUEÑO MONTAÑAS CAMPAÑA DISEÑO DISEÑOS CABAÑA CABAÑAS'
  ).split(' ');
  var EN_DICCIONARIO = {};
  DICCIONARIO.forEach(function (p) { EN_DICCIONARIO[p] = true; });
  var LETRAS_POSIBLES = ['Á', 'É', 'Í', 'Ó', 'Ú', 'Ñ', 'Ü'];

  /** ¿El texto trae una letra que parece dañada? («Ã» o «Â» sueltas, el rombo con interrogación, o «?» entre letras) */
  function pareceDanado(s) {
    return /[\u00C3\u00C2\uFFFD]/.test(s) || /[A-Za-z\u00C0-\u024F]\?[A-Za-z\u00C0-\u024F]/.test(s);
  }
  /** Sugerencias para las palabras con «Ã» suelta: [{ de: 'GONZÃLEZ', a: 'GONZÁLEZ' }] (solo si hay UNA opción). */
  function sugerencias(s) {
    var lista = [], vistas = {};
    String(s).split(/[^A-Za-z\u00C0-\u024F]+/).forEach(function (palabra) {
      if (!palabra || vistas[palabra] || palabra.indexOf('\u00C3') < 0) { return; }
      vistas[palabra] = true;
      var mayus = palabra.toUpperCase(), huecos = mayus.split('\u00C3').length - 1, hallados = [];
      if (huecos > 2) { return; }
      LETRAS_POSIBLES.forEach(function (a) {
        if (huecos === 1) { var c = mayus.replace('\u00C3', a); if (EN_DICCIONARIO[c]) { hallados.push(c); } return; }
        LETRAS_POSIBLES.forEach(function (b) { var c2 = mayus.replace('\u00C3', a).replace('\u00C3', b); if (EN_DICCIONARIO[c2]) { hallados.push(c2); } });
      });
      if (hallados.length !== 1) { return; }
      var bien = hallados[0];
      // respeta cómo venía escrita: «GARCÍA», «García» o «garcía» (se mira el resto de las letras)
      var resto = palabra.split('\u00C3').join('');
      if (resto !== resto.toUpperCase()) {
        bien = resto === resto.toLowerCase() ? bien.toLowerCase() : bien.charAt(0) + bien.slice(1).toLowerCase();
      }
      lista.push({ de: palabra, a: bien });
    });
    return lista;
  }
  function aplicarSugerencias(s) {
    sugerencias(s).forEach(function (g) { s = s.split(g.de).join(g.a); });
    return s;
  }

  /* ================================================================
   * 2) COLUMNAS DEL EXCEL — se buscan por su NOMBRE (no por posición),
   *    así no importa si la extranet cambia el orden.
   * ================================================================ */
  function clave(s) { return sinTildes(String(s == null ? '' : s)).toLowerCase().replace(/[^a-z0-9]/g, ''); }
  var COLUMNAS = {
    reserva: ['nroreserva', 'numeroreserva', 'noreserva', 'nreserva', 'nrodereserva', 'numerodereserva', 'codigoreserva', 'reserva'],
    hab: ['nrohab', 'numerohab', 'nohab', 'nhab', 'nrodehab', 'nrohabitaciones', 'nrohabitacion', 'numerodehabitaciones', 'habitaciones'],
    agencia: ['agencia'],
    titular: ['titular']
  };
  var NOMBRE_COLUMNA = { reserva: 'Nro reserva', hab: 'Nro hab', agencia: 'Agencia', titular: 'Titular' };

  /** Busca la fila de títulos. Devuelve { fila, col: {reserva, hab, agencia, titular}, checkin: [cols] } o { faltan: [...] }. */
  function ubicarColumnas(filas) {
    var mejor = { faltan: Object.keys(COLUMNAS) };
    for (var r = 0; r < filas.length && r < 40; r++) {
      var fila = filas[r] || [], claves = fila.map(clave), col = {}, faltan = [];
      Object.keys(COLUMNAS).forEach(function (campo) {
        var hallada = -1;
        COLUMNAS[campo].some(function (nombre) { hallada = claves.indexOf(nombre); return hallada >= 0; });
        if (hallada >= 0) { col[campo] = hallada; } else { faltan.push(campo); }
      });
      if (!faltan.length) {
        var checkin = [];
        claves.forEach(function (c, i) { if (c === 'checkin' || c === 'fechacheckin' || c === 'llegada' || c === 'fechallegada') { checkin.push(i); } });
        return { fila: r, col: col, checkin: checkin };
      }
      if (faltan.length < mejor.faltan.length) { mejor = { faltan: faltan }; }
    }
    return mejor;
  }

  /* ================================================================
   * 3) LA CELDA «Nro reserva» — trae el código y, pegado, el estado del
   *    preregistro. Lo que trae la extranet hoy (nov-2026):
   *      «DP130002      Preregistro (DESCARGA PREREGISTROS MASIVOS)⚠ Incompleto»
   *      «DP119482      Preregistro (EXTRANET)⚠ Incompleto»
   *      «DP128805      Sin preregistro»
   *      «DP130557      Web check-in✔ Completo»
   *    o solo el código, si alguien ya limpió el Excel a mano.
   * ================================================================ */
  var INICIO_ESTADO = /(?:sin|con)?\s*pre[\s\-]?registro|web[\s\-]?check|check[\s\-]?in|incomplet|complet/i;
  function partirReserva(celda) {
    var s = limpiar(repararTildes(celda).texto);
    // dónde empieza el estado (si lo trae); sirve también si viene pegado al código («DP12Sin preregistro»)
    var donde = s.slice(1).search(INICIO_ESTADO), cabeza = s, estado = '';
    if (donde >= 0) { cabeza = s.slice(0, donde + 1).trim(); estado = s.slice(donde + 1); }
    var m = /^(\S+)(?:\s+(.*))?$/.exec(cabeza);
    // un código de reserva siempre lleva números (DP130002); si no, la fila no es una reserva
    if (!m || !/\d/.test(m[1])) { return { cod: '', pre: '', preTxt: '' }; }
    if (m[2]) { estado = m[2] + ' ' + estado; }          // lo que haya entre el código y el estado
    return Object.assign({ cod: m[1] }, clasificarEstado(estado));
  }
  /** «Preregistro (EXTRANET)⚠ Incompleto» → { pre: 'sin' }, etc. (ver la regla al inicio del archivo). */
  function clasificarEstado(texto) {
    var t = String(texto || '').replace(/\s+/g, ' ').trim();
    if (!t) { return { pre: '', preTxt: '' }; }
    if (/\bsin\s*pre[\s\-]?registro/i.test(t) || /incomplet/i.test(t)) { return { pre: 'sin', preTxt: '' }; }
    if (/complet/i.test(t)) { return { pre: /web[\s\-]?check|check[\s\-]?in/i.test(t) ? 'web' : 'con', preTxt: '' }; }
    if (/\bcon\s*pre[\s\-]?registro/i.test(t)) { return { pre: 'con', preTxt: '' }; }
    // otro estado: se muestra tal cual, sin los símbolos (⚠, ✔…) y sin la palabra «Preregistro (…)» del inicio
    var limpio = t.replace(/^pre[\s\-]?registro\s*/i, '').replace(/^\([^)]*\)\s*/, '')
      .replace(/[^A-Za-z\u00C0-\u024F0-9 ().,:;\/\-]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (!limpio) { return { pre: '', preTxt: '' }; }
    return { pre: 'otro', preTxt: limpio.length > 40 ? limpio.slice(0, 39) + '…' : limpio };
  }
  function numeroHab(v) {
    if (typeof v === 'number') { return isFinite(v) && v >= 0 && v < 100000 && Math.floor(v) === v ? v : null; }
    var s = limpiar(v);
    return /^\d{1,5}$/.test(s) ? parseInt(s, 10) : null;
  }
  /** Fechas de la columna «Checkin» (solo para avisar en pantalla): serie de Excel, 2026-11-16 o 16/11/2026. */
  function fechaDe(v) {
    if (typeof v === 'number' && v > 20000 && v < 90000) {
      return new Date(Date.UTC(1899, 11, 30) + Math.floor(v) * 86400000).toISOString().slice(0, 10);
    }
    var s = limpiar(v), m;
    if ((m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s))) { return m[1] + '-' + m[2] + '-' + m[3]; }
    if ((m = /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})\b/.exec(s))) { return m[3] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[1]).slice(-2); }
    return '';
  }
  function esDP(cod) { return /^DP[-\s]?\d/i.test(String(cod)); }
  function llave(cod) { return String(cod).toUpperCase().replace(/\s+/g, ''); }

  /* ================================================================
   * 4) ARMAR EL LISTADO a partir de lo que leyó lector-excel.js
   *    Devuelve { filas, filasExcel, sinCodigo, checkin, hoja } o lanza
   *    un error con .codigo ('sin-columnas' | 'sin-reservas').
   * ================================================================ */
  var CAMPOS = ['cod', 'hab', 'ag', 'ti', 'pre', 'preTxt'];
  var contador = 0;
  function idNuevo() { contador += 1; return 'f' + Date.now().toString(36) + contador.toString(36); }
  function copiarBase(f) { var b = {}; CAMPOS.forEach(function (c) { b[c] = f[c]; }); return b; }

  function armar(libro) {
    var hojas = (libro && libro.hojas) || [], elegida = null, ubic = null, peor = null;
    hojas.forEach(function (h) {
      if (elegida) { return; }
      var u = ubicarColumnas(h.filas || []);
      if (u.col) { elegida = h; ubic = u; } else if (!peor || u.faltan.length < peor.length) { peor = u.faltan; }
    });
    if (!elegida) {
      var e = new Error('sin-columnas'); e.codigo = 'sin-columnas';
      e.faltan = (peor || Object.keys(COLUMNAS)).map(function (c) { return NOMBRE_COLUMNA[c]; });
      throw e;
    }
    var grupos = {}, orden = [], filasExcel = 0, sinCodigo = 0, fechas = {};
    for (var r = ubic.fila + 1; r < elegida.filas.length; r++) {
      var fila = elegida.filas[r] || [];
      var cruda = { res: fila[ubic.col.reserva], hab: fila[ubic.col.hab], ag: fila[ubic.col.agencia], ti: fila[ubic.col.titular] };
      var agR = repararTildes(cruda.ag), tiR = repararTildes(cruda.ti);
      var ag = limpiar(agR.texto), ti = limpiar(tiR.texto), partes = partirReserva(cruda.res), hab = numeroHab(cruda.hab);
      if (!partes.cod && !ag && !ti && hab === null) { continue; }               // fila vacía
      if (!partes.cod) { sinCodigo += 1; continue; }                             // fila sin código (totales, notas…)
      filasExcel += 1;
      ubic.checkin.forEach(function (c) { var f = fechaDe(fila[c]); if (f) { fechas[f] = true; } });
      var k = llave(partes.cod), g = grupos[k];
      if (!g) { g = grupos[k] = { filas: [], pos: orden.length }; orden.push(k); }
      g.filas.push({ cod: partes.cod, hab: hab, ag: ag, ti: ti, pre: partes.pre, preTxt: partes.preTxt, reparada: agR.cambio || tiR.cambio });
    }
    if (!orden.length) { var e2 = new Error('sin-reservas'); e2.codigo = 'sin-reservas'; throw e2; }

    var filas = orden.map(function (k) {
      var g = grupos[k], mayor = g.filas[0];
      g.filas.forEach(function (x) { if ((x.hab === null ? -1 : x.hab) > (mayor.hab === null ? -1 : mayor.hab)) { mayor = x; } });
      var varAg = [], varTi = [];
      g.filas.forEach(function (x) {
        if (x.ag && x.ag !== mayor.ag && varAg.indexOf(x.ag) < 0) { varAg.push(x.ag); }
        if (x.ti && x.ti !== mayor.ti && varTi.indexOf(x.ti) < 0) { varTi.push(x.ti); }
      });
      var f = {
        id: idNuevo(), cod: mayor.cod, hab: mayor.hab, ag: mayor.ag, ti: mayor.ti, pre: mayor.pre, preTxt: mayor.preTxt,
        origen: 'excel', quitada: false, orden: g.pos, nFilas: g.filas.length,
        varAg: varAg.slice(0, 4), varTi: varTi.slice(0, 4), reparada: !!mayor.reparada, nov: '', novDetalle: ''
      };
      f.base = copiarBase(f);                       // lo que dijo el Excel (para «Restaurar» y para comparar descargas)
      return f;
    });
    return { filas: filas, filasExcel: filasExcel, sinCodigo: sinCodigo, checkin: Object.keys(fechas).sort().slice(0, 12), hoja: elegida.nombre };
  }

  /** Una reserva escrita a mano. */
  function filaManual(datos, n) {
    return {
      id: idNuevo(), cod: limpiar(datos.cod), hab: datos.hab, ag: limpiar(datos.ag), ti: limpiar(datos.ti),
      pre: datos.pre || '', preTxt: datos.preTxt || '', origen: 'manual', base: null, quitada: false,
      orden: 100000 + (n || 0), nFilas: 0, varAg: [], varTi: [], reparada: false, nov: '', novDetalle: ''
    };
  }

  /* ================================================================
   * 5) CONSULTAS sobre un listado ya armado
   * ================================================================ */
  /** Las líneas que salen en la hoja, ya ordenadas: más habitaciones primero; en empate, el orden del Excel. */
  function visibles(filas) {
    return (filas || []).filter(function (f) { return !f.quitada; }).sort(function (a, b) {
      var ha = a.hab == null ? -1 : a.hab, hb = b.hab == null ? -1 : b.hab;
      return (hb - ha) || (a.orden - b.orden);
    });
  }
  function totales(filas) {
    var v = visibles(filas), hab = 0;
    v.forEach(function (f) { hab += f.hab || 0; });
    return { reservas: v.length, habitaciones: hab };
  }
  /** ¿La persona le cambió algo a una línea que vino del Excel? */
  function editada(f) {
    return f.origen === 'excel' && !!f.base && CAMPOS.some(function (c) { return (f[c] == null ? '' : f[c]) !== (f.base[c] == null ? '' : f.base[c]); });
  }
  /** Texto que va debajo del código en la hoja. */
  var TEXTO_PRE = { sin: 'Sin preregistro', con: 'Con preregistro', web: 'Web check-in completo' };
  function textoPre(f) { return f.pre === 'otro' ? (f.preTxt || '') : (TEXTO_PRE[f.pre] || ''); }
  function dudosa(f) { return pareceDanado(f.ag || '') || pareceDanado(f.ti || '') || pareceDanado(f.cod || ''); }
  /** Lo que conviene revisar antes de imprimir (se calcula sobre lo que se ve en la hoja). */
  function avisos(filas) {
    var v = visibles(filas), a = { noDP: [], otroEstado: [], danadas: [], conSugerencia: [], sinHab: [], variantes: [], reparadas: [] };
    v.forEach(function (f) {
      if (!esDP(f.cod)) { a.noDP.push(f); }
      if (f.pre === 'otro' && f.preTxt) { a.otroEstado.push(f); }
      if (dudosa(f)) { a.danadas.push(f); if (sugerencias(f.ag + ' ' + f.ti).length) { a.conSugerencia.push(f); } }
      if (f.hab == null || f.hab < 1) { a.sinHab.push(f); }
      if (f.origen === 'excel' && ((f.varAg && f.varAg.length) || (f.varTi && f.varTi.length))) { a.variantes.push(f); }
      if (f.reparada) { a.reparadas.push(f); }
    });
    return a;
  }

  /* ================================================================
   * 6) NOVEDADES ENTRE DOS DESCARGAS DEL MISMO DÍA
   *    Compara el Excel nuevo con el listado anterior y:
   *     · marca las reservas nuevas y las que cambiaron,
   *     · lista las que ya no vienen,
   *     · CONSERVA lo que la persona había hecho a mano (correcciones,
   *       reservas agregadas y reservas quitadas) cuando el Excel sigue igual.
   *    Modifica nuevas[] y devuelve el resumen.
   * ================================================================ */
  function fusionar(nuevas, previas, horaPrevia) {
    var porBase = {}, manuales = {}, vistas = {};
    (previas || []).forEach(function (p) {
      if (p.origen === 'excel' && p.base) { porBase[llave(p.base.cod)] = p; } else { manuales[llave(p.cod)] = p; }
    });
    var nov = { hora: horaPrevia || 0, nuevas: 0, cambiaron: 0, yaNo: [], conservadas: { correcciones: 0, agregadas: 0, quitadas: 0 } };
    nuevas.forEach(function (f) {
      var k = llave(f.cod), p = porBase[k];
      if (!p) {
        f.nov = 'nueva'; nov.nuevas += 1;
        if (manuales[k]) { vistas[manuales[k].id] = true; f.novDetalle = 'Antes la habías agregado a mano; ya viene en el Excel.'; }
        return;
      }
      vistas[p.id] = true;
      var pb = p.base, cambios = [];
      if (pb.hab !== f.hab) { cambios.push('antes: ' + (pb.hab == null ? 'sin número' : pb.hab + ' hab')); }
      if (pb.ag !== f.ag) { cambios.push('agencia antes: ' + (pb.ag || '(vacía)')); }
      if (pb.ti !== f.ti) { cambios.push('titular antes: ' + (pb.ti || '(vacío)')); }
      // el preregistro solo se compara si los dos Excel lo traen (un Excel «limpiado» a mano puede no traerlo)
      if (pb.pre && f.pre && (pb.pre !== f.pre || pb.preTxt !== f.preTxt)) { cambios.push('preregistro antes: ' + textoPre(pb)); }
      if (cambios.length) { f.nov = 'cambio'; f.novDetalle = cambios.join(' · '); nov.cambiaron += 1; }
      var conservo = false;
      CAMPOS.forEach(function (c) {                 // tu corrección se queda si el Excel sigue diciendo lo mismo
        if (p[c] !== pb[c] && pb[c] === f.base[c]) { f[c] = p[c]; conservo = true; }
      });
      if (conservo) { nov.conservadas.correcciones += 1; }
      if (p.quitada) { f.quitada = true; nov.conservadas.quitadas += 1; }
    });
    var n = 0;
    (previas || []).forEach(function (p) {
      if (vistas[p.id]) { return; }
      if (p.origen !== 'excel') {                   // agregada a mano: sigue en la hoja
        if (!p.quitada) { n += 1; var m = filaManual(p, n); m.orden = 100000 + n; nuevas.push(m); nov.conservadas.agregadas += 1; }
        return;
      }
      if (!p.quitada) { nov.yaNo.push({ cod: p.cod, hab: p.hab, ag: p.ag, ti: p.ti, pre: p.pre, preTxt: p.preTxt }); }
    });
    return nov;
  }

  var API = {
    armar: armar, filaManual: filaManual, visibles: visibles, totales: totales, editada: editada, textoPre: textoPre,
    avisos: avisos, dudosa: dudosa, fusionar: fusionar, esDP: esDP, llave: llave, limpiar: limpiar,
    repararTildes: repararTildes, sugerencias: sugerencias, aplicarSugerencias: aplicarSugerencias, pareceDanado: pareceDanado,
    partirReserva: partirReserva, clasificarEstado: clasificarEstado, TEXTO_PRE: TEXTO_PRE, ubicarColumnas: ubicarColumnas, numeroHab: numeroHab, fechaDe: fechaDe, CAMPOS: CAMPOS
  };
  raiz.ReglasListado = API;
  if (typeof module !== 'undefined' && module.exports) { module.exports = API; }
})(typeof window !== 'undefined' ? window : globalThis);
