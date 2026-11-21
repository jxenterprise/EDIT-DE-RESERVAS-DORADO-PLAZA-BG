/* =====================================================================
 *  LISTADO DE RESERVAS DP · RECEPCIÓN · HOTEL DORADO PLAZA BOCAGRANDE
 *  hoja.js — LA HOJA que se imprime: «LISTADO DE RESERVAS» tamaño carta.
 *
 *  Qué hace: recibe las líneas del listado y
 *   1) las acomoda en la hoja (logo, título, fecha, tabla, totales, pie;
 *      si no caben, pasa a otra página) → maquetar()
 *   2) dibuja cada página como SVG para la vista previa y la impresora → svg()
 *   3) escribe el mismo dibujo como archivo PDF → pdf()
 *  La vista previa, la impresión y el PDF salen del MISMO cálculo, por eso
 *  son iguales. No usa librerías: el PDF se escribe aquí mismo.
 *
 *  Partes: 1 textos y medidas (lo que se puede ajustar) · 2 anchos de las
 *  letras · 3 texto imprimible y renglones · 4 maquetar · 5 SVG · 6 PDF
 *
 *  Usa: window.LogoDoradoVector (js/logo-vector.js).
 *  Lo usa: js/app.js → Hoja.maquetar(), Hoja.svg(), Hoja.pdf()
 *  Letra: Helvetica en el PDF y Arimo (misma medida de letras) en pantalla.
 * ===================================================================== */
(function (raiz) {
  'use strict';

  var LOGO = raiz.LogoDoradoVector || (typeof require === 'function' ? require('./logo-vector.js') : null);

  /* ================================================================
   * 1) TEXTOS Y MEDIDAS DE LA HOJA  (zona editable)
   *    Medidas en puntos: 72 puntos = 1 pulgada. Carta = 612 × 792.
   * ================================================================ */
  var TEXTOS = {
    titulo: 'LISTADO DE RESERVAS',
    subtitulo: 'Códigos DP · Recepción Hotel Dorado Plaza Bocagrande',
    fecha: 'Reservas del: ',   // v1.10 (JX): la fecha de las reservas (la del Excel), no la de hoy
    impreso: 'Impreso el ',    // v1.10: «Impreso el 21/11/2026, 3:45 p. m.» (momento exacto de imprimir / PDF / compartir)
    por: 'por ',               // v1.10: «por Jx Martínez» (el usuario que entró, o el nombre de la ventanita «¿Quién imprime?»)
    columnas: { reserva: 'NRO. RESERVA', hab: 'NRO. HAB', agencia: 'AGENCIA', titular: 'TITULAR', casilla: 'LLEGÓ' },
    totalHab: 'TOTAL DE HABITACIONES: ',
    totalRes: 'TOTAL DE RESERVAS: ',
    pie: 'Hotel Dorado Plaza Bocagrande · Cartagena de Indias · Recepción',
    pagina: 'Pág. ',
    vacio: 'No hay reservas en el listado.'
  };
  var PAG = { ancho: 612, alto: 792 };
  /* Colores y medidas tomados del PDF de referencia de JX («Reservas_DP_17-11-2026.pdf»). */
  var COLOR = {
    papel: '#FFFFFF',
    bronce: '#A67C3D',      // marco, línea del encabezado, banda de la tabla, bordes, subtítulo y números
    tinta: '#2E2418',       // título, fecha, códigos, agencias, titulares y textos de los totales
    gris: '#7A6E5E',        // «Sin preregistro» y pie de página
    cebra: '#F6EFE2',       // fondo de las filas pares y de la caja de totales
    linea: '#E3D5BA',       // rayitas entre filas
    bandaTexto: '#FFFFFF'
  };
  var M = {
    marcoFuera: 28.8, marcoDentro: 33.12,       // doble marco de la hoja
    x0: 50.4, x1: 561.6,                        // borde izquierdo y derecho del contenido (511.2 de ancho)
    logoX: 50.4, logoY: 49.8, logoAncho: 123,
    tituloX: 191.4, tituloY: 86.8, tituloTam: 21,
    subY: 100.8, subTam: 10,
    fechaY: 116.6, fechaTam: 11,                // v1.10: sube un poco para que quepan las dos líneas de impresión
    impresoY: 129.8, porY: 140.6, impresoTam: 8,  // «Impreso el …» y «por …», en gris, debajo de la fecha
    reglaY: 149.8,
    tablaY: 165.8,                              // primera página (debajo del encabezado)
    tablaY2: 46.8,                              // páginas siguientes: la tabla arranca arriba (sin encabezado)
    totalAlto: 32, totalSepara: 14, totalTam: 11,
    pieY: 747.4, pieTam: 7.5,
    filasHasta: 724.2                           // las filas (y la caja de totales) no bajan de aquí
  };
  /* «Apretados» de fila. La primera es la del PDF de referencia; las otras dos solo se usan
     si así la hoja ocupa MENOS páginas (por ejemplo, 19 a 21 reservas caben en una sola). */
  /* relleno = aire arriba y abajo del bloque «código + preregistro»; rellenoTexto = el de agencia y titular */
  var DENSIDADES = [
    { nombre: 'amplia', banda: 30, bandaTam: 9.5, fila: 29, letra: 8.8, inter: 11, cod: 10.5, pre: 6.5, num: 15, casilla: 12, relleno: 10.5, rellenoTexto: 8 },
    { nombre: 'compacta', banda: 26, bandaTam: 9, fila: 25, letra: 8.4, inter: 10.2, cod: 10, pre: 6.2, num: 13.5, casilla: 11, relleno: 7.5, rellenoTexto: 6.5 },
    { nombre: 'mini', banda: 22, bandaTam: 8.4, fila: 21.5, letra: 8, inter: 9.4, cod: 9.4, pre: 5.8, num: 12, casilla: 10, relleno: 5.5, rellenoTexto: 5 }
  ];
  /* Anchos de las columnas (suman 511.2 = x1 − x0). Sin casilla = los del PDF de referencia.
     Agencias y titulares muy largos bajan a un segundo renglón (nunca se cortan). */
  var COLUMNAS_SIN_CASILLA = { reserva: 144, hab: 64.8, agencia: 151.2, titular: 151.2, casilla: 0 };
  var COLUMNAS_CON_CASILLA = { reserva: 120, hab: 58, agencia: 143.6, titular: 149.6, casilla: 40 };
  var PADDING = 7;                              // espacio entre el borde de la celda y el texto

  /* ================================================================
   * 2) ANCHOS DE LAS LETRAS (Helvetica y Helvetica-Bold, en milésimas del
   *    tamaño; códigos 32 a 255 de la tabla «WinAnsi»). Son medidas
   *    públicas de Adobe: con ellas se sabe cuánto ocupa cada texto.
   * ================================================================ */
  var ANCHOS = [
    278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
    1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
    333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584, 350,
    556, 350, 222, 556, 333, 1000, 556, 556, 333, 1000, 667, 333, 1000, 350, 611, 350, 350, 222, 222, 333, 333, 350, 556, 1000, 333, 1000, 500, 333, 944, 350, 500, 667,
    278, 333, 556, 556, 556, 556, 260, 556, 333, 737, 370, 556, 584, 333, 737, 333, 400, 584, 333, 333, 333, 556, 537, 278, 333, 333, 365, 556, 834, 834, 834, 611,
    667, 667, 667, 667, 667, 667, 1000, 722, 667, 667, 667, 667, 278, 278, 278, 278, 722, 722, 778, 778, 778, 778, 778, 584, 778, 722, 722, 722, 722, 667, 667, 611,
    556, 556, 556, 556, 556, 556, 889, 500, 556, 556, 556, 556, 278, 278, 278, 278, 556, 556, 556, 556, 556, 556, 556, 584, 611, 556, 556, 556, 556, 500, 556, 500
  ];
  var ANCHOS_NEGRITA = [
    278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611,
    975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556,
    333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611, 611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584, 350,
    556, 350, 278, 556, 500, 1000, 556, 556, 333, 1000, 667, 333, 1000, 350, 611, 350, 350, 278, 278, 500, 500, 350, 556, 1000, 333, 1000, 556, 333, 944, 350, 500, 667,
    278, 333, 556, 556, 556, 556, 280, 556, 333, 737, 370, 556, 584, 333, 737, 333, 400, 584, 333, 333, 333, 611, 556, 278, 333, 333, 365, 556, 834, 834, 834, 611,
    722, 722, 722, 722, 722, 722, 1000, 722, 667, 667, 667, 667, 278, 278, 278, 278, 722, 722, 778, 778, 778, 778, 778, 584, 778, 722, 722, 722, 722, 667, 667, 611,
    556, 556, 556, 556, 556, 556, 889, 556, 556, 556, 556, 556, 278, 278, 278, 278, 611, 611, 611, 611, 611, 611, 611, 584, 611, 611, 611, 611, 611, 556, 611, 556
  ];

  /* ================================================================
   * 3) TEXTO IMPRIMIBLE Y RENGLONES
   *    El PDF usa la tabla de letras «WinAnsi» (la de Windows en español).
   *    Lo que no exista ahí (un emoji, una letra de otro alfabeto) se cambia
   *    por su letra base o por «?», igual en pantalla y en el PDF.
   * ================================================================ */
  // [código Unicode, byte WinAnsi] de los signos que van entre 0x80 y 0x9F
  var EXTRA = [[0x20AC, 0x80], [0x201A, 0x82], [0x0192, 0x83], [0x201E, 0x84], [0x2026, 0x85], [0x2020, 0x86], [0x2021, 0x87], [0x02C6, 0x88],
    [0x2030, 0x89], [0x0160, 0x8A], [0x2039, 0x8B], [0x0152, 0x8C], [0x017D, 0x8E], [0x2018, 0x91], [0x2019, 0x92], [0x201C, 0x93], [0x201D, 0x94],
    [0x2022, 0x95], [0x2013, 0x96], [0x2014, 0x97], [0x02DC, 0x98], [0x2122, 0x99], [0x0161, 0x9A], [0x203A, 0x9B], [0x0153, 0x9C], [0x017E, 0x9E], [0x0178, 0x9F]];
  var BYTE_DE = {};
  EXTRA.forEach(function (p) { BYTE_DE[p[0]] = p[1]; });
  var SIN_BASE = { 0x0141: 'L', 0x0142: 'l', 0x0110: 'D', 0x0111: 'd', 0x0131: 'i', 0x0130: 'I', 0x00A0: ' ' };

  /** Byte WinAnsi de un código Unicode, o -1 si esa letra no existe en la tabla. */
  function byteWin(cp) {
    if ((cp >= 32 && cp <= 126) || (cp >= 161 && cp <= 255)) { return cp; }
    return BYTE_DE[cp] === undefined ? -1 : BYTE_DE[cp];
  }
  /** Devuelve el texto solo con letras que la hoja puede dibujar. */
  function imprimible(s) {
    s = String(s == null ? '' : s);
    var r = '';
    for (var i = 0; i < s.length; i++) {
      var cp = s.charCodeAt(i);
      if (cp >= 0xD800 && cp <= 0xDBFF) { i++; r += '?'; continue; }                 // emoji y similares (ocupan dos posiciones)
      if (byteWin(cp) >= 0) { r += s.charAt(i); continue; }
      if (SIN_BASE[cp]) { r += SIN_BASE[cp]; continue; }
      if (cp < 32 || (cp >= 0x0300 && cp <= 0x036F)) { continue; }                    // controles y tildes sueltas
      var base = s.charAt(i).normalize ? s.charAt(i).normalize('NFD') : s.charAt(i), puso = false;
      for (var k = 0; k < base.length; k++) {
        if (byteWin(base.charCodeAt(k)) >= 0) { r += base.charAt(k); puso = true; }
      }
      if (!puso) { r += '?'; }
    }
    return r;
  }
  /** Ancho en puntos de un texto (ya imprimible) a ese tamaño. */
  function ancho(s, tam, negrita) {
    var t = negrita ? ANCHOS_NEGRITA : ANCHOS, suma = 0;
    for (var i = 0; i < s.length; i++) {
      var b = byteWin(s.charCodeAt(i));
      suma += b >= 32 ? (t[b - 32] || 556) : 556;
    }
    return suma * tam / 1000;
  }
  /** Parte un texto en renglones que quepan en «anchoMax». Nunca recorta: si no cabe, baja de renglón. */
  function renglones(s, anchoMax, tam, negrita) {
    var palabras = s.split(' '), lineas = [], actual = '';
    palabras.forEach(function (p) {
      if (!p) { return; }
      var junto = actual ? actual + ' ' + p : p;
      if (ancho(junto, tam, negrita) <= anchoMax) { actual = junto; return; }
      if (actual) { lineas.push(actual); actual = ''; }
      while (p.length > 1 && ancho(p, tam, negrita) > anchoMax) {                     // una palabra más ancha que la columna
        var k = p.length - 1;
        while (k > 1 && ancho(p.slice(0, k), tam, negrita) > anchoMax) { k--; }
        lineas.push(p.slice(0, k)); p = p.slice(k);
      }
      actual = p;
    });
    if (actual) { lineas.push(actual); }
    return lineas.length ? lineas : [''];
  }

  /* ================================================================
   * 4) MAQUETAR — decide dónde va cada cosa. Devuelve las páginas como
   *    listas de «órdenes de dibujo» (rect, linea, txt, logo) que luego
   *    entienden tanto el SVG como el PDF.
   *
   *    datos = { fecha: '16/11/2026', casilla: true, apretar: true,
   *              filas: [ { cod, hab, ag, ti, pre } ] }   (pre = texto bajo el código)
   *    apretar: false → siempre el espaciado del PDF de referencia, aunque ocupe más hojas.
   * ================================================================ */
  function medirFilas(filas, d, col) {
    return filas.map(function (f) {
      var ag = renglones(imprimible(f.ag || '—'), col.agencia - 2 * PADDING, d.letra, false);
      var ti = renglones(imprimible(f.ti || '—'), col.titular - 2 * PADDING, d.letra, false);
      var cod = imprimible(f.cod || ''), tamCod = d.cod;
      while (tamCod > 8 && ancho(cod, tamCod, true) > col.reserva - 2 * PADDING) { tamCod -= 0.5; }   // códigos largos: letra un poco menor…
      var codL = renglones(cod, col.reserva - 2 * PADDING, tamCod, true);                           // …y si aun así no caben, bajan de renglón
      var pre = imprimible(f.pre || ''), tamPre = d.pre;
      while (tamPre > 5 && ancho(pre, tamPre, false) > col.reserva - 2 * PADDING) { tamPre -= 0.3; }
      var lead = tamCod * 1.1, separa = pre ? d.pre + 1.5 : 0;                                       // separa = del código a «Sin preregistro»
      var hab = f.hab == null ? '—' : String(f.hab), tamHab = d.num;
      while (tamHab > 8 && ancho(hab, tamHab, true) > col.hab - 2 * PADDING) { tamHab -= 0.5; }
      var n = Math.max(ag.length, ti.length);
      return {
        cod: codL, tamCod: tamCod, lead: lead, pre: pre, tamPre: tamPre, separa: separa, hab: hab, tamHab: tamHab, ag: ag, ti: ti,
        alto: Math.max(d.fila, n * d.inter + d.rellenoTexto, (codL.length - 1) * lead + separa + tamCod + d.relleno)   // amplia: 29 pt (30 con dos renglones), como el PDF de referencia
      };
    });
  }
  /** Reparte las filas en páginas. La primera página tiene encabezado; las demás arrancan con la tabla. */
  function repartir(medidas, d) {
    var paginas = [[]], y = M.tablaY + d.banda;
    medidas.forEach(function (m) {
      if (y + m.alto > M.filasHasta && paginas[paginas.length - 1].length) { paginas.push([]); y = M.tablaY2 + d.banda; }
      paginas[paginas.length - 1].push(m); y += m.alto;
    });
    // la caja de totales va después de la última fila; si no cabe, pasa a otra página con la última fila
    if (y + M.totalSepara + M.totalAlto > M.filasHasta) {
      var ultima = paginas[paginas.length - 1];
      paginas.push(ultima.length > 1 ? [ultima.pop()] : []);
    }
    return paginas;
  }

  function maquetar(datos) {
    var filas = datos.filas || [], col = datos.casilla ? COLUMNAS_CON_CASILLA : COLUMNAS_SIN_CASILLA;
    var mejor = null;
    (datos.apretar === false ? DENSIDADES.slice(0, 1) : DENSIDADES).forEach(function (d) {
      var reparto = repartir(medirFilas(filas, d, col), d);
      if (!mejor || reparto.length < mejor.reparto.length) { mejor = { d: d, reparto: reparto }; }
    });
    var d = mejor.d, total = mejor.reparto.length;
    var totalHab = 0;
    filas.forEach(function (f) { totalHab += f.hab || 0; });
    var ancho0 = M.x1 - M.x0;

    // posiciones de las columnas
    var xr = M.x0, xh = xr + col.reserva, xa = xh + col.hab, xt = xa + col.agencia, xc = xt + col.titular;
    var antes = 0;
    var paginas = mejor.reparto.map(function (grupo, np) {
      var o = [];
      /* marco doble */
      o.push({ k: 'rect', x: M.marcoFuera, y: M.marcoFuera, w: PAG.ancho - 2 * M.marcoFuera, h: PAG.alto - 2 * M.marcoFuera, s: COLOR.bronce, g: 1.5 });
      o.push({ k: 'rect', x: M.marcoDentro, y: M.marcoDentro, w: PAG.ancho - 2 * M.marcoDentro, h: PAG.alto - 2 * M.marcoDentro, s: COLOR.bronce, g: 0.4 });
      /* encabezado (solo en la primera página) */
      var yTabla = M.tablaY2;
      if (np === 0) {
        o.push({ k: 'logo', x: M.logoX, y: M.logoY, w: M.logoAncho });
        o.push({ k: 'txt', x: M.tituloX, y: M.tituloY, t: TEXTOS.titulo, z: M.tituloTam, b: 1, c: COLOR.tinta, a: 'i' });
        o.push({ k: 'txt', x: M.tituloX, y: M.subY, t: imprimible(TEXTOS.subtitulo), z: M.subTam, b: 0, c: COLOR.bronce, a: 'i' });
        o.push({ k: 'txt', x: M.tituloX, y: M.fechaY, t: imprimible(TEXTOS.fecha + (datos.fecha || '')), z: M.fechaTam, b: 1, c: COLOR.tinta, a: 'i' });
        if (datos.impreso) { o.push({ k: 'txt', x: M.tituloX, y: M.impresoY, t: imprimible(TEXTOS.impreso + datos.impreso), z: M.impresoTam, b: 0, c: COLOR.gris, a: 'i' }); }
        if (datos.por) { o.push({ k: 'txt', x: M.tituloX, y: M.porY, t: imprimible(TEXTOS.por + datos.por), z: M.impresoTam, b: 1, c: COLOR.gris, a: 'i' }); }
        o.push({ k: 'linea', x1: M.x0, y1: M.reglaY, x2: M.x1, y2: M.reglaY, s: COLOR.bronce, g: 1.5 });
        yTabla = M.tablaY;
      }
      /* banda de títulos de la tabla (se repite en cada página) */
      var y = yTabla, yb = y + d.banda / 2 + d.bandaTam * 0.36;
      o.push({ k: 'rect', x: M.x0, y: y, w: ancho0, h: d.banda, f: COLOR.bronce });
      o.push({ k: 'txt', x: xr + col.reserva / 2, y: yb, t: TEXTOS.columnas.reserva, z: d.bandaTam, b: 1, c: COLOR.bandaTexto, a: 'c' });
      o.push({ k: 'txt', x: xh + col.hab / 2, y: yb, t: TEXTOS.columnas.hab, z: d.bandaTam, b: 1, c: COLOR.bandaTexto, a: 'c' });
      o.push({ k: 'txt', x: xa + col.agencia / 2, y: yb, t: TEXTOS.columnas.agencia, z: d.bandaTam, b: 1, c: COLOR.bandaTexto, a: 'c' });
      o.push({ k: 'txt', x: xt + col.titular / 2, y: yb, t: TEXTOS.columnas.titular, z: d.bandaTam, b: 1, c: COLOR.bandaTexto, a: 'c' });
      if (col.casilla) { o.push({ k: 'txt', x: xc + col.casilla / 2, y: yb, t: imprimible(TEXTOS.columnas.casilla), z: d.bandaTam, b: 1, c: COLOR.bandaTexto, a: 'c' }); }
      y += d.banda;
      /* filas */
      if (!filas.length) {
        o.push({ k: 'txt', x: (M.x0 + M.x1) / 2, y: y + 20, t: imprimible(TEXTOS.vacio), z: d.letra, b: 0, c: COLOR.gris, a: 'c' });
        y += 32;
      }
      grupo.forEach(function (m, i) {
        var yc = y + m.alto / 2;
        if ((antes + i) % 2 === 1) { o.push({ k: 'rect', x: M.x0, y: y, w: ancho0, h: m.alto, f: COLOR.cebra }); }
        if (i > 0) { o.push({ k: 'linea', x1: M.x0, y1: y, x2: M.x1, y2: y, s: COLOR.linea, g: 0.5 }); }
        /* código (y debajo, el preregistro): el bloque va centrado en la fila */
        var yCod = yc - ((m.cod.length - 1) * m.lead + m.separa) / 2 + (m.pre ? m.separa / 2 : m.tamCod * 0.36);
        m.cod.forEach(function (linea, j) {
          o.push({ k: 'txt', x: xr + col.reserva / 2, y: yCod + j * m.lead, t: linea, z: m.tamCod, b: 1, c: COLOR.tinta, a: 'c' });
        });
        if (m.pre) {
          o.push({ k: 'txt', x: xr + col.reserva / 2, y: yCod + (m.cod.length - 1) * m.lead + m.separa, t: m.pre, z: m.tamPre, b: 0, c: COLOR.gris, a: 'c' });
        }
        o.push({ k: 'txt', x: xh + col.hab / 2, y: yc + m.tamHab * 0.4, t: m.hab, z: m.tamHab, b: 1, c: COLOR.bronce, a: 'c' });
        m.ag.forEach(function (linea, j) {
          o.push({ k: 'txt', x: xa + PADDING, y: yc - (m.ag.length - 1) * d.inter / 2 + d.letra * 0.36 + j * d.inter, t: linea, z: d.letra, b: 0, c: COLOR.tinta, a: 'i' });
        });
        m.ti.forEach(function (linea, j) {
          o.push({ k: 'txt', x: xt + PADDING, y: yc - (m.ti.length - 1) * d.inter / 2 + d.letra * 0.36 + j * d.inter, t: linea, z: d.letra, b: 0, c: COLOR.tinta, a: 'i' });
        });
        if (col.casilla) {
          o.push({ k: 'rect', x: xc + (col.casilla - d.casilla) / 2, y: yc - d.casilla / 2, w: d.casilla, h: d.casilla, r: 2, f: COLOR.papel, s: COLOR.bronce, g: 0.8 });
        }
        y += m.alto;
      });
      antes += grupo.length;
      /* borde de la tabla */
      if (y > yTabla + d.banda) { o.push({ k: 'linea', x1: M.x0, y1: yTabla + d.banda, x2: M.x1, y2: yTabla + d.banda, s: COLOR.linea, g: 0.5 }); }
      o.push({ k: 'rect', x: M.x0, y: yTabla, w: ancho0, h: y - yTabla, s: COLOR.bronce, g: 1 });
      /* totales (solo en la última página) */
      if (np === total - 1) {
        var yt = y + M.totalSepara, tz = M.totalTam;
        o.push({ k: 'rect', x: M.x0, y: yt, w: ancho0, h: M.totalAlto, f: COLOR.cebra, s: COLOR.bronce, g: 1 });
        var partes = [
          { t: imprimible(TEXTOS.totalHab), c: COLOR.tinta }, { t: String(totalHab), c: COLOR.bronce },
          { t: '   |   ', c: COLOR.tinta },
          { t: imprimible(TEXTOS.totalRes), c: COLOR.tinta }, { t: String(filas.length), c: COLOR.bronce }
        ];
        var largo = 0;
        partes.forEach(function (q) { q.w = ancho(q.t, tz, true); largo += q.w; });
        var x = (M.x0 + M.x1) / 2 - largo / 2, ybase = yt + M.totalAlto / 2 + tz * 0.36;
        partes.forEach(function (q) { o.push({ k: 'txt', x: x, y: ybase, t: q.t, z: tz, b: 1, c: q.c, a: 'i', fijo: 1 }); x += q.w; });
      }
      /* pie */
      o.push({ k: 'txt', x: PAG.ancho / 2, y: M.pieY, t: imprimible(TEXTOS.pie), z: M.pieTam, b: 0, c: COLOR.gris, a: 'c' });
      o.push({ k: 'txt', x: M.x1, y: M.pieY, t: imprimible(TEXTOS.pagina + (np + 1) + (total > 1 ? ' de ' + total : '')), z: M.pieTam, b: 0, c: COLOR.gris, a: 'd' });
      return o;
    });
    return { paginas: paginas, densidad: d.nombre, totalHab: totalHab, totalRes: filas.length, ancho: PAG.ancho, alto: PAG.alto };
  }

  /* ================================================================
   * 5) SVG — una página para la vista previa y para la impresora
   * ================================================================ */
  function escXml(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function n2(v) { var s = (Math.round(v * 100) / 100).toString(); return s === '-0' ? '0' : s; }

  function logoSvg(o, id) {
    var k = o.w / LOGO.ancho, g = LOGO.degRemolino, li = LOGO.lineaIzq, ld = LOGO.lineaDer;
    return '<defs>' +
      '<linearGradient id="' + id + 'r" gradientUnits="userSpaceOnUse" x1="' + g.x1 + '" y1="' + g.y1 + '" x2="' + g.x2 + '" y2="' + g.y2 + '">' +
        g.paradas.map(function (p) { return '<stop offset="' + p[0] + '" stop-color="' + p[1] + '"/>'; }).join('') + '</linearGradient>' +
      '<linearGradient id="' + id + 'i" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="' + LOGO.colorLinea + '"/></linearGradient>' +
      '<linearGradient id="' + id + 'd" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="' + LOGO.colorLinea + '"/><stop offset="1" stop-color="#FFFFFF"/></linearGradient>' +
      '</defs>' +
      '<g transform="translate(' + n2(o.x) + ' ' + n2(o.y) + ') scale(' + (Math.round(k * 100000) / 100000) + ')">' +
      '<path d="' + LOGO.remolino + '" fill="url(#' + id + 'r)" fill-rule="evenodd"/>' +
      '<path d="' + LOGO.letras + '" fill="' + LOGO.colorLetras + '" fill-rule="evenodd"/>' +
      '<rect x="' + li[0] + '" y="' + li[1] + '" width="' + li[2] + '" height="' + li[3] + '" fill="url(#' + id + 'i)"/>' +
      '<rect x="' + ld[0] + '" y="' + ld[1] + '" width="' + ld[2] + '" height="' + ld[3] + '" fill="url(#' + id + 'd)"/>' +
      '</g>';
  }

  /** maqueta = lo que devuelve maquetar(); n = número de página (desde 0). */
  function svg(maqueta, n) {
    var ops = maqueta.paginas[n], id = 'hoja' + n + '-';
    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + PAG.ancho + ' ' + PAG.alto + '" class="hoja__svg" role="img" ' +
      'aria-label="Hoja ' + (n + 1) + ' de ' + maqueta.paginas.length + ' del listado de reservas" ' +
      'font-family="\'Hoja Sans\', Arial, Helvetica, sans-serif" style="font-kerning:none;font-variant-ligatures:none">' +
      '<rect width="' + PAG.ancho + '" height="' + PAG.alto + '" fill="' + COLOR.papel + '"/>';
    ops.forEach(function (o) {
      if (o.k === 'rect') {
        s += '<rect x="' + n2(o.x) + '" y="' + n2(o.y) + '" width="' + n2(o.w) + '" height="' + n2(o.h) + '"' + (o.r ? ' rx="' + o.r + '"' : '') +
          ' fill="' + (o.f || 'none') + '"' + (o.s ? ' stroke="' + o.s + '" stroke-width="' + o.g + '"' : '') + '/>';
      } else if (o.k === 'linea') {
        s += '<line x1="' + n2(o.x1) + '" y1="' + n2(o.y1) + '" x2="' + n2(o.x2) + '" y2="' + n2(o.y2) + '" stroke="' + o.s + '" stroke-width="' + o.g + '"/>';
      } else if (o.k === 'txt') {
        s += '<text x="' + n2(o.x) + '" y="' + n2(o.y) + '" font-size="' + o.z + '"' + (o.b ? ' font-weight="700"' : '') + ' fill="' + o.c + '"' +
          (o.a === 'c' ? ' text-anchor="middle"' : o.a === 'd' ? ' text-anchor="end"' : '') + (o.fijo ? ' xml:space="preserve"' : '') + '>' + escXml(o.t) + '</text>';
      } else if (o.k === 'logo') {
        s += logoSvg(o, id);
      }
    });
    return s + '</svg>';
  }

  /* ================================================================
   * 6) PDF — el mismo dibujo, escrito como archivo PDF 1.4.
   *    Todo el archivo es texto simple: las tildes van como «\351» (número
   *    del byte), así nunca se dañan. Las letras son Helvetica, que todos
   *    los lectores de PDF traen (no hace falta incrustar la fuente).
   * ================================================================ */
  function rgb(hex) {
    var v = parseInt(hex.slice(1), 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255].map(function (c) { return (Math.round(c / 255 * 1000) / 1000).toString(); }).join(' ');
  }
  function cadenaPdf(s) {                                   // texto → (cadena) de PDF
    var r = '(';
    for (var i = 0; i < s.length; i++) {
      var b = byteWin(s.charCodeAt(i));
      if (b < 0) { b = 63; }
      if (b === 40 || b === 41 || b === 92) { r += '\\' + String.fromCharCode(b); }
      else if (b > 126) { r += '\\' + ('000' + b.toString(8)).slice(-3); }
      else { r += String.fromCharCode(b); }
    }
    return r + ')';
  }
  /** «M1 2C3 4 5 6 7 8L9 9Z» → órdenes de PDF (m, c, l, h). */
  function trazoPdf(d) {
    var r = '', re = /([MLCZ])([^MLCZ]*)/g, m;
    while ((m = re.exec(d))) {
      r += m[1] === 'Z' ? 'h\n' : m[2].trim() + (m[1] === 'M' ? ' m\n' : m[1] === 'L' ? ' l\n' : ' c\n');
    }
    return r;
  }
  function funcionColor(c0, c1) { return '<< /FunctionType 2 /Domain [0 1] /C0 [' + rgb(c0) + '] /C1 [' + rgb(c1) + '] /N 1 >>'; }

  /** maqueta = lo de maquetar(); info = { titulo, asunto, creado: Date }. Devuelve los bytes del PDF (Uint8Array). */
  function pdf(maqueta, info) {
    info = info || {};
    var objetos = [null, null];                              // 1 = catálogo, 2 = lista de páginas (se llenan al final)
    function nuevo(cuerpo) { objetos.push(cuerpo); return objetos.length; }
    function flujo(dic, datos) { return '<< ' + dic + '/Length ' + datos.length + ' >>\nstream\n' + datos + '\nendstream'; }

    var f1 = nuevo('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    var f2 = nuevo('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');

    /* el logo se guarda UNA vez (aunque haya varias páginas) como «formulario» */
    var g = LOGO.degRemolino, li = LOGO.lineaIzq, ld = LOGO.lineaDer;
    var fnRem = nuevo('<< /FunctionType 3 /Domain [0 1] /Functions [' + funcionColor(g.paradas[0][1], g.paradas[1][1]) + ' ' + funcionColor(g.paradas[1][1], g.paradas[2][1]) +
      '] /Bounds [' + g.paradas[1][0] + '] /Encode [0 1 0 1] >>');
    var shRem = nuevo('<< /ShadingType 2 /ColorSpace /DeviceRGB /Coords [' + [g.x1, g.y1, g.x2, g.y2].join(' ') + '] /Function ' + fnRem + ' 0 R /Extend [true true] >>');
    var shIzq = nuevo('<< /ShadingType 2 /ColorSpace /DeviceRGB /Coords [' + [li[0], 0, li[0] + li[2], 0].join(' ') + '] /Function ' + funcionColor('#FFFFFF', LOGO.colorLinea) + ' /Extend [true true] >>');
    var shDer = nuevo('<< /ShadingType 2 /ColorSpace /DeviceRGB /Coords [' + [ld[0], 0, ld[0] + ld[2], 0].join(' ') + '] /Function ' + funcionColor(LOGO.colorLinea, '#FFFFFF') + ' /Extend [true true] >>');
    var dibujoLogo = 'q\n' + trazoPdf(LOGO.remolino) + 'W* n\n/SR sh\nQ\n' +
      rgb(LOGO.colorLetras) + ' rg\n' + trazoPdf(LOGO.letras) + 'f*\n' +
      'q ' + li.join(' ') + ' re W n /SI sh Q\n' + 'q ' + ld.join(' ') + ' re W n /SD sh Q\n';
    var logo = nuevo(flujo('/Type /XObject /Subtype /Form /BBox [0 0 ' + LOGO.ancho + ' ' + LOGO.alto + '] /Matrix [1 0 0 -1 0 ' + LOGO.alto + '] ' +
      '/Resources << /Shading << /SR ' + shRem + ' 0 R /SI ' + shIzq + ' 0 R /SD ' + shDer + ' 0 R >> /ProcSet [/PDF] >> ', dibujoLogo));

    var H = PAG.alto, hijos = [];
    maqueta.paginas.forEach(function (ops) {
      var c = '';
      ops.forEach(function (o) {
        if (o.k === 'rect') {
          var y = H - o.y - o.h, forma;
          if (o.r) {
            var r = o.r, q = r * 0.5523, x = o.x, w = o.w, h = o.h;
            forma = n2(x + r) + ' ' + n2(y) + ' m ' + n2(x + w - r) + ' ' + n2(y) + ' l ' +
              n2(x + w - r + q) + ' ' + n2(y) + ' ' + n2(x + w) + ' ' + n2(y + r - q) + ' ' + n2(x + w) + ' ' + n2(y + r) + ' c ' +
              n2(x + w) + ' ' + n2(y + h - r) + ' l ' +
              n2(x + w) + ' ' + n2(y + h - r + q) + ' ' + n2(x + w - r + q) + ' ' + n2(y + h) + ' ' + n2(x + w - r) + ' ' + n2(y + h) + ' c ' +
              n2(x + r) + ' ' + n2(y + h) + ' l ' +
              n2(x + r - q) + ' ' + n2(y + h) + ' ' + n2(x) + ' ' + n2(y + h - r + q) + ' ' + n2(x) + ' ' + n2(y + h - r) + ' c ' +
              n2(x) + ' ' + n2(y + r) + ' l ' +
              n2(x) + ' ' + n2(y + r - q) + ' ' + n2(x + r - q) + ' ' + n2(y) + ' ' + n2(x + r) + ' ' + n2(y) + ' c h';
          } else {
            forma = n2(o.x) + ' ' + n2(y) + ' ' + n2(o.w) + ' ' + n2(o.h) + ' re';
          }
          c += (o.f ? rgb(o.f) + ' rg ' : '') + (o.s ? rgb(o.s) + ' RG ' + o.g + ' w ' : '') + forma + (o.f && o.s ? ' B' : o.f ? ' f' : ' S') + '\n';
        } else if (o.k === 'linea') {
          c += rgb(o.s) + ' RG ' + o.g + ' w ' + n2(o.x1) + ' ' + n2(H - o.y1) + ' m ' + n2(o.x2) + ' ' + n2(H - o.y2) + ' l S\n';
        } else if (o.k === 'txt') {
          var w2 = o.a === 'i' ? 0 : ancho(o.t, o.z, !!o.b), x2 = o.a === 'c' ? o.x - w2 / 2 : o.a === 'd' ? o.x - w2 : o.x;
          c += 'BT /F' + (o.b ? 2 : 1) + ' ' + o.z + ' Tf ' + rgb(o.c) + ' rg 1 0 0 1 ' + n2(x2) + ' ' + n2(H - o.y) + ' Tm ' + cadenaPdf(o.t) + ' Tj ET\n';
        } else if (o.k === 'logo') {
          var k = o.w / LOGO.ancho;
          c += 'q ' + (Math.round(k * 100000) / 100000) + ' 0 0 ' + (Math.round(k * 100000) / 100000) + ' ' + n2(o.x) + ' ' + n2(H - o.y - LOGO.alto * k) + ' cm /Logo Do Q\n';
        }
      });
      var contenido = nuevo(flujo('', c));
      hijos.push(nuevo('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + PAG.ancho + ' ' + PAG.alto + '] ' +
        '/Resources << /Font << /F1 ' + f1 + ' 0 R /F2 ' + f2 + ' 0 R >> /XObject << /Logo ' + logo + ' 0 R >> /ProcSet [/PDF /Text] >> ' +
        '/Contents ' + contenido + ' 0 R >>'));
    });
    objetos[0] = '<< /Type /Catalog /Pages 2 0 R /Lang (es-CO) >>';
    objetos[1] = '<< /Type /Pages /Count ' + hijos.length + ' /Kids [' + hijos.map(function (h) { return h + ' 0 R'; }).join(' ') + '] >>';

    var f = info.creado instanceof Date ? info.creado : new Date();
    function dos(v) { return (v < 10 ? '0' : '') + v; }
    // fecha del archivo en hora de Colombia (UTC−5)
    var local = new Date(f.getTime() - 5 * 3600000);
    var sello = 'D:' + local.getUTCFullYear() + dos(local.getUTCMonth() + 1) + dos(local.getUTCDate()) + dos(local.getUTCHours()) + dos(local.getUTCMinutes()) + dos(local.getUTCSeconds()) + "-05'00'";
    var datosInfo = nuevo('<< /Title ' + cadenaPdf(imprimible(info.titulo || TEXTOS.titulo)) + ' /Subject ' + cadenaPdf(imprimible(info.asunto || TEXTOS.subtitulo)) +
      ' /Author ' + cadenaPdf(imprimible('Recepción · Hotel Dorado Plaza Bocagrande')) + ' /Creator ' + cadenaPdf('Editador de reservas DP') +
      ' /Producer ' + cadenaPdf('Editador de reservas DP (hoja.js)') + ' /CreationDate (' + sello + ') >>');

    /* armado del archivo: cabecera, objetos, tabla de posiciones y cierre */
    var salida = '%PDF-1.4\n%' + String.fromCharCode(0xE2, 0xE3, 0xCF, 0xD3) + '\n', posiciones = [];
    objetos.forEach(function (cuerpo, i) {
      posiciones.push(salida.length);
      salida += (i + 1) + ' 0 obj\n' + cuerpo + '\nendobj\n';
    });
    var inicioTabla = salida.length;
    salida += 'xref\n0 ' + (objetos.length + 1) + '\n0000000000 65535 f \n';
    posiciones.forEach(function (p) { salida += ('0000000000' + p).slice(-10) + ' 00000 n \n'; });
    // identificador del archivo: una huella sencilla del contenido
    var h1 = 0x811C9DC5, h2 = 0x1B873593;
    for (var i = 0; i < salida.length; i += 3) { h1 = Math.imul(h1 ^ salida.charCodeAt(i), 16777619); h2 = Math.imul(h2 + salida.charCodeAt(i), 0x85EBCA6B) ^ (h2 >>> 13); }
    var huella = ('0000000' + (h1 >>> 0).toString(16)).slice(-8) + ('0000000' + (h2 >>> 0).toString(16)).slice(-8);
    huella = (huella + huella).toUpperCase();
    salida += 'trailer\n<< /Size ' + (objetos.length + 1) + ' /Root 1 0 R /Info ' + datosInfo + ' 0 R /ID [<' + huella + '> <' + huella + '>] >>\nstartxref\n' + inicioTabla + '\n%%EOF\n';

    var bytes = new Uint8Array(salida.length);
    for (var j = 0; j < salida.length; j++) { bytes[j] = salida.charCodeAt(j) & 255; }
    return bytes;
  }

  /** Nombre del archivo PDF, como el que usa recepción: Reservas_DP_17-11-2026.pdf */
  function nombreArchivo(fechaISO) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fechaISO || '');
    return 'Reservas_DP' + (m ? '_' + m[3] + '-' + m[2] + '-' + m[1] : '') + '.pdf';
  }

  var API = { maquetar: maquetar, svg: svg, pdf: pdf, nombreArchivo: nombreArchivo, imprimible: imprimible, ancho: ancho, renglones: renglones, TEXTOS: TEXTOS };
  raiz.Hoja = API;
  if (typeof module !== 'undefined' && module.exports) { module.exports = API; }
})(typeof window !== 'undefined' ? window : globalThis);
