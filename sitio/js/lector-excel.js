/* =====================================================================
 *  LISTADO DE RESERVAS DP · RECEPCIÓN · HOTEL DORADO PLAZA BOCAGRANDE
 *  lector-excel.js — abre el Excel (.xlsx) DENTRO del navegador.
 *
 *  Qué hace: recibe los bytes del archivo que descargas de la extranet y
 *  devuelve sus hojas como tablas (filas y columnas). NO sube nada a
 *  internet y NO usa librerías de terceros: un .xlsx es un ZIP con archivos
 *  XML adentro, y aquí se abre el ZIP, se descomprime y se lee el XML.
 *
 *  Partes (en orden):
 *   1 Errores con mensaje claro      · 2 ZIP (índice de archivos)
 *   3 Descompresor «inflate»         · 4 Comprobación CRC-32
 *   5 XML del libro, textos y hojas  · 6 leer() (lo único que se usa afuera)
 *
 *  Usa: nada (solo funciones del navegador: TextDecoder y DOMParser).
 *  Lo usa: js/app.js → LectorExcel.leer(arrayBuffer)
 *  No sabe nada de reservas: las reglas del listado están en js/listado.js.
 * ===================================================================== */
(function (raiz) {
  'use strict';

  /* ================================================================
   * 1) ERRORES — cada uno con un código para que app.js muestre la
   *    explicación correcta (ver «ERRORES» en app.js).
   * ================================================================ */
  function fallo(codigo, detalle) {
    var e = new Error(detalle || codigo);
    e.codigo = codigo;
    return e;
  }

  /* ================================================================
   * 2) ZIP — lee el «directorio central» (el índice que va al final)
   * ================================================================ */
  function u16(b, o) { return b[o] | (b[o + 1] << 8); }
  function u32(b, o) { return (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0; }

  var TAM_MAXIMO = 60 * 1024 * 1024;       // tope de seguridad por archivo interno (60 MB)

  function abrirZip(bytes) {
    var n = bytes.length;
    if (n < 4) { throw fallo('vacio'); }
    // Excel antiguo (.xls) o protegido con clave: empieza con D0 CF 11 E0
    if (bytes[0] === 0xD0 && bytes[1] === 0xCF && bytes[2] === 0x11 && bytes[3] === 0xE0) { throw fallo('xls-viejo'); }
    if (!(bytes[0] === 0x50 && bytes[1] === 0x4B)) { throw fallo('no-xlsx'); }
    // fin del directorio central: firma 50 4B 05 06, se busca desde el final
    var fin = -1, tope = Math.max(0, n - 22 - 65535);
    for (var i = n - 22; i >= tope; i--) {
      if (bytes[i] === 0x50 && bytes[i + 1] === 0x4B && bytes[i + 2] === 0x05 && bytes[i + 3] === 0x06) { fin = i; break; }
    }
    if (fin < 0) { throw fallo('danado', 'no aparece el índice del ZIP'); }
    var total = u16(bytes, fin + 10), pos = u32(bytes, fin + 16);
    var archivos = {};
    var texto = new TextDecoder('utf-8');
    for (var k = 0; k < total; k++) {
      if (pos + 46 > n || u32(bytes, pos) !== 0x02014B50) { throw fallo('danado', 'índice del ZIP incompleto'); }
      var metodo = u16(bytes, pos + 10), crc = u32(bytes, pos + 16);
      var comp = u32(bytes, pos + 20), tam = u32(bytes, pos + 24);
      var lNombre = u16(bytes, pos + 28), lExtra = u16(bytes, pos + 30), lComentario = u16(bytes, pos + 32);
      var local = u32(bytes, pos + 42);
      var nombre = texto.decode(bytes.subarray(pos + 46, pos + 46 + lNombre)).replace(/\\/g, '/');
      archivos[nombre.toLowerCase()] = { nombre: nombre, metodo: metodo, crc: crc, comp: comp, tam: tam, local: local, cifrado: (u16(bytes, pos + 8) & 1) === 1 };
      pos += 46 + lNombre + lExtra + lComentario;
    }
    return archivos;
  }

  function extraer(bytes, archivos, nombre) {
    var a = archivos[String(nombre).toLowerCase()];
    if (!a) { return null; }
    if (a.cifrado) { throw fallo('xls-viejo'); }
    if (a.tam > TAM_MAXIMO || a.comp === 0xFFFFFFFF) { throw fallo('muy-grande'); }
    var p = a.local;
    if (p + 30 > bytes.length || u32(bytes, p) !== 0x04034B50) { throw fallo('danado', 'archivo interno sin cabecera'); }
    var ini = p + 30 + u16(bytes, p + 26) + u16(bytes, p + 28);
    if (ini + a.comp > bytes.length) { throw fallo('danado', 'archivo interno cortado'); }
    var datos = bytes.subarray(ini, ini + a.comp), salida;
    if (a.metodo === 0) { salida = datos; }
    else if (a.metodo === 8) { salida = inflar(datos, a.tam); }
    else { throw fallo('danado', 'compresión no soportada (' + a.metodo + ')'); }
    if (salida.length !== a.tam || crc32(salida) !== a.crc) { throw fallo('danado', 'el contenido no coincide con su comprobación'); }
    return salida;
  }

  /* ================================================================
   * 3) INFLATE (RFC 1951) — el descompresor estándar de los ZIP.
   *    Lee bit a bit; soporta bloques sin comprimir, Huffman fijo y
   *    Huffman dinámico (los tres tipos que existen).
   * ================================================================ */
  var L_BASE = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258];
  var L_EXTRA = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
  var D_BASE = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577];
  var D_EXTRA = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
  var ORDEN_LONG = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];

  /** Tabla de Huffman «canónica» a partir de la longitud en bits de cada símbolo. */
  function tablaHuffman(longitudes, desde, cuantos) {
    var cuenta = new Uint16Array(16), simbolos = new Uint16Array(cuantos), inicio = new Uint16Array(16), i;
    for (i = 0; i < cuantos; i++) { cuenta[longitudes[desde + i]]++; }
    var libres = 1;
    for (i = 1; i <= 15; i++) {
      libres = (libres << 1) - cuenta[i];
      if (libres < 0) { throw fallo('danado', 'tabla de compresión inválida'); }
    }
    for (i = 1; i < 15; i++) { inicio[i + 1] = inicio[i] + cuenta[i]; }
    for (i = 0; i < cuantos; i++) {
      if (longitudes[desde + i] !== 0) { simbolos[inicio[longitudes[desde + i]]++] = i; }
    }
    return { cuenta: cuenta, simbolos: simbolos };
  }

  var FIJA = null;
  function tablasFijas() {
    if (FIJA) { return FIJA; }
    var l = new Uint8Array(288 + 30), i;
    for (i = 0; i < 144; i++) { l[i] = 8; }
    for (; i < 256; i++) { l[i] = 9; }
    for (; i < 280; i++) { l[i] = 7; }
    for (; i < 288; i++) { l[i] = 8; }
    for (i = 0; i < 30; i++) { l[288 + i] = 5; }
    FIJA = { lit: tablaHuffman(l, 0, 288), dist: tablaHuffman(l, 288, 30) };
    return FIJA;
  }

  function inflar(src, tamEsperado) {
    var fin = src.length, pos = 0, buf = 0, nbits = 0;
    var out = new Uint8Array(tamEsperado > 0 ? tamEsperado : Math.max(1024, fin * 4)), n = 0;

    function bits(cuantos) {                       // lee «cuantos» bits (del menos al más significativo)
      var v = buf;
      while (nbits < cuantos) {
        if (pos >= fin) { throw fallo('danado', 'datos comprimidos cortados'); }
        v |= src[pos++] << nbits; nbits += 8;
      }
      buf = v >>> cuantos; nbits -= cuantos;
      return v & ((1 << cuantos) - 1);
    }
    function simbolo(t) {                          // decodifica un símbolo con la tabla t
      var codigo = 0, primero = 0, indice = 0;
      for (var largo = 1; largo <= 15; largo++) {
        codigo |= bits(1);
        var c = t.cuenta[largo];
        if (codigo - c < primero) { return t.simbolos[indice + (codigo - primero)]; }
        indice += c; primero += c; primero <<= 1; codigo <<= 1;
      }
      throw fallo('danado', 'código de compresión desconocido');
    }
    function espacio(extra) {                      // agranda la salida si hace falta
      if (n + extra <= out.length) { return; }
      if (n + extra > TAM_MAXIMO) { throw fallo('muy-grande'); }
      var mas = new Uint8Array(Math.max(out.length * 2, n + extra));
      mas.set(out.subarray(0, n)); out = mas;
    }
    function bloque(lit, dist) {
      for (;;) {
        var s = simbolo(lit);
        if (s < 256) { espacio(1); out[n++] = s; continue; }
        if (s === 256) { return; }
        s -= 257;
        if (s >= 29) { throw fallo('danado', 'longitud inválida'); }
        var largo = L_BASE[s] + bits(L_EXTRA[s]);
        var d = simbolo(dist);
        if (d >= 30) { throw fallo('danado', 'distancia inválida'); }
        var atras = D_BASE[d] + bits(D_EXTRA[d]);
        if (atras > n) { throw fallo('danado', 'referencia fuera de rango'); }
        espacio(largo);
        for (var k = 0; k < largo; k++) { out[n] = out[n - atras]; n++; }
      }
    }

    var ultimo;
    do {
      ultimo = bits(1);
      var tipo = bits(2);
      if (tipo === 0) {                            // bloque sin comprimir
        buf = 0; nbits = 0;
        if (pos + 4 > fin) { throw fallo('danado', 'bloque cortado'); }
        var largo = src[pos] | (src[pos + 1] << 8), inverso = src[pos + 2] | (src[pos + 3] << 8);
        pos += 4;
        if (largo !== ((~inverso) & 0xFFFF) || pos + largo > fin) { throw fallo('danado', 'bloque inválido'); }
        espacio(largo);
        out.set(src.subarray(pos, pos + largo), n); n += largo; pos += largo;
      } else if (tipo === 1) {                     // Huffman fijo
        var f = tablasFijas(); bloque(f.lit, f.dist);
      } else if (tipo === 2) {                     // Huffman dinámico
        var nLit = bits(5) + 257, nDist = bits(5) + 1, nCod = bits(4) + 4, i;
        if (nLit > 286 || nDist > 30) { throw fallo('danado', 'cabecera de bloque inválida'); }
        var longs = new Uint8Array(320);
        for (i = 0; i < nCod; i++) { longs[ORDEN_LONG[i]] = bits(3); }
        var tCod = tablaHuffman(longs, 0, 19);
        var todas = new Uint8Array(nLit + nDist), idx = 0;
        while (idx < nLit + nDist) {
          var s = simbolo(tCod), rep, val = 0;
          if (s < 16) { todas[idx++] = s; continue; }
          if (s === 16) { if (idx === 0) { throw fallo('danado', 'repetición sin valor'); } val = todas[idx - 1]; rep = 3 + bits(2); }
          else if (s === 17) { rep = 3 + bits(3); }
          else { rep = 11 + bits(7); }
          if (idx + rep > nLit + nDist) { throw fallo('danado', 'demasiadas longitudes'); }
          while (rep--) { todas[idx++] = val; }
        }
        if (todas[256] === 0) { throw fallo('danado', 'falta el fin de bloque'); }
        bloque(tablaHuffman(todas, 0, nLit), tablaHuffman(todas, nLit, nDist));
      } else { throw fallo('danado', 'tipo de bloque inválido'); }
    } while (!ultimo);
    return n === out.length ? out : out.subarray(0, n);
  }

  /* ================================================================
   * 4) CRC-32 — confirma que lo descomprimido es exactamente lo que
   *    guardó el ZIP (detecta descargas cortadas o dañadas).
   * ================================================================ */
  var TABLA_CRC = null;
  function crc32(datos) {
    var t = TABLA_CRC, i, c;
    if (!t) {
      t = TABLA_CRC = new Uint32Array(256);
      for (i = 0; i < 256; i++) {
        c = i;
        for (var k = 0; k < 8; k++) { c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); }
        t[i] = c >>> 0;
      }
    }
    c = 0xFFFFFFFF;
    for (i = 0; i < datos.length; i++) { c = t[(c ^ datos[i]) & 0xFF] ^ (c >>> 8); }
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  /* ================================================================
   * 5) XML — libro (lista de hojas), textos compartidos y celdas
   * ================================================================ */
  function aXml(bytes, cual) {
    var txt = new TextDecoder('utf-8').decode(bytes);
    var doc = new DOMParser().parseFromString(txt, 'application/xml');
    if (doc.getElementsByTagName('parsererror').length) { throw fallo('danado', 'XML inválido en ' + cual); }
    return doc;
  }
  /** Hijos directos con ese nombre (sin importar el prefijo «x:» que usan algunos programas). */
  function hijos(nodo, nombre) {
    var r = [];
    for (var h = nodo.firstElementChild; h; h = h.nextElementSibling) { if (h.localName === nombre) { r.push(h); } }
    return r;
  }
  function todos(nodo, nombre) {
    var lista = nodo.getElementsByTagName('*'), r = [];
    for (var i = 0; i < lista.length; i++) { if (lista[i].localName === nombre) { r.push(lista[i]); } }
    return r;
  }
  /** Excel escribe algunos caracteres especiales como _x000D_ : aquí vuelven a ser el carácter. */
  function sinEscapes(s) {
    return s.indexOf('_x') < 0 ? s : s.replace(/_x([0-9A-Fa-f]{4})_/g, function (m, h) { return String.fromCharCode(parseInt(h, 16)); });
  }
  /** Texto de un <si> o <is>: une todos los <t>, menos los de guía fonética (<rPh>). */
  function textoRico(nodo) {
    var ts = todos(nodo, 't'), s = '';
    for (var i = 0; i < ts.length; i++) {
      var p = ts[i].parentNode;
      if (p && p.localName === 'rPh') { continue; }
      s += ts[i].textContent;
    }
    return sinEscapes(s);
  }
  /** «B3» → 1 (columna B, contando desde 0). */
  function columnaDe(ref) {
    var c = 0, i = 0, ch;
    for (; i < ref.length; i++) {
      ch = ref.charCodeAt(i);
      if (ch >= 65 && ch <= 90) { c = c * 26 + (ch - 64); }
      else if (ch >= 97 && ch <= 122) { c = c * 26 + (ch - 96); }
      else { break; }
    }
    return c - 1;
  }
  function rutaDesde(base, destino) {             // resuelve «worksheets/sheet1.xml» respecto a «xl/»
    if (destino.charAt(0) === '/') { return destino.slice(1); }
    var partes = (base + destino).split('/'), r = [];
    for (var i = 0; i < partes.length; i++) {
      if (partes[i] === '..') { r.pop(); } else if (partes[i] !== '.' && partes[i] !== '') { r.push(partes[i]); }
    }
    return r.join('/');
  }

  function leerHoja(doc, compartidos) {
    var filas = [], lista = todos(doc, 'row'), siguiente = 0;
    for (var i = 0; i < lista.length; i++) {
      var fila = lista[i], nf = parseInt(fila.getAttribute('r'), 10);
      nf = isFinite(nf) && nf > 0 ? nf - 1 : siguiente;
      siguiente = nf + 1;
      var celdas = hijos(fila, 'c'), valores = [], col = 0;
      for (var j = 0; j < celdas.length; j++) {
        var c = celdas[j], ref = c.getAttribute('r');
        if (ref) { var cc = columnaDe(ref); if (cc >= 0) { col = cc; } }
        var tipo = c.getAttribute('t') || 'n', v = hijos(c, 'v')[0], valor = '';
        if (tipo === 'inlineStr') { var is = hijos(c, 'is')[0]; valor = is ? textoRico(is) : ''; }
        else if (tipo === 's') { var ix = v ? parseInt(v.textContent, 10) : -1; valor = ix >= 0 && ix < compartidos.length ? compartidos[ix] : ''; }
        else if (tipo === 'str' || tipo === 'e' || tipo === 'd') { valor = v ? sinEscapes(v.textContent) : ''; }
        else if (tipo === 'b') { valor = !!v && v.textContent === '1'; }
        else if (v && v.textContent !== '') { var num = Number(v.textContent); valor = isFinite(num) ? num : v.textContent; }
        if (col < 16384) { while (valores.length < col) { valores.push(''); } valores[col] = valor; }
        col++;
      }
      if (nf < 1048576) { while (filas.length < nf) { filas.push([]); } filas[nf] = valores; }
    }
    return filas;
  }

  /* ================================================================
   * 6) leer(arrayBuffer) → { hojas: [ { nombre, oculta, filas: [[celdas]] } ] }
   *    Cada celda es un texto, un número, true/false o '' (vacía).
   * ================================================================ */
  function leer(buffer) {
    var bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    var zip = abrirZip(bytes);
    var libroBytes = extraer(bytes, zip, 'xl/workbook.xml');
    if (!libroBytes) { throw fallo('no-xlsx', 'no trae xl/workbook.xml'); }
    var libro = aXml(libroBytes, 'el libro');

    // relaciones: id → archivo de cada hoja y de los textos compartidos
    var rels = {}, rutaCompartidos = 'xl/sharedStrings.xml';
    var relBytes = extraer(bytes, zip, 'xl/_rels/workbook.xml.rels');
    if (relBytes) {
      todos(aXml(relBytes, 'las relaciones'), 'Relationship').forEach(function (r) {
        var destino = rutaDesde('xl/', r.getAttribute('Target') || '');
        rels[r.getAttribute('Id')] = destino;
        if (/sharedStrings$/.test(r.getAttribute('Type') || '')) { rutaCompartidos = destino; }
      });
    }
    var compartidos = [];
    var compBytes = extraer(bytes, zip, rutaCompartidos);
    if (compBytes) { compartidos = todos(aXml(compBytes, 'los textos'), 'si').map(textoRico); }

    var hojas = [];
    todos(libro, 'sheet').forEach(function (h, i) {
      var rid = null;
      for (var a = 0; a < h.attributes.length; a++) { if (h.attributes[a].localName === 'id') { rid = h.attributes[a].value; } }
      var ruta = (rid && rels[rid]) || ('xl/worksheets/sheet' + (i + 1) + '.xml');
      var hb = extraer(bytes, zip, ruta);
      if (!hb) { return; }                           // hojas de gráfico u otras que no son tabla
      hojas.push({
        nombre: h.getAttribute('name') || ('Hoja ' + (i + 1)),
        oculta: /hidden/i.test(h.getAttribute('state') || ''),
        filas: leerHoja(aXml(hb, 'la hoja ' + (i + 1)), compartidos)
      });
    });
    if (!hojas.length) { throw fallo('sin-hojas'); }
    return { hojas: hojas };
  }

  var API = { leer: leer, _inflar: inflar, _crc32: crc32 };   // los «_» son solo para las pruebas
  raiz.LectorExcel = API;
  if (typeof module !== 'undefined' && module.exports) { module.exports = API; }
})(typeof window !== 'undefined' ? window : globalThis);
