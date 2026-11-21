/* =====================================================================
 *  EDITADOR DE RESERVAS DP · RECEPCIÓN · HOTEL DORADO PLAZA BOCAGRANDE
 *  functions/api/[[ruta]].js — LA NUBE (v1.3): usuarios, sesiones y
 *  listados guardados en una base de datos D1 de Cloudflare.
 *
 *  Qué es: el «servidor» de la web. Corre en Cloudflare (Pages Functions)
 *  y responde todo lo que empieza por /api/. Va FUERA de sitio/: Cloudflare
 *  la ejecuta, pero nunca se publica como archivo. Mismo esquema que la
 *  nube del Manual de turnos (functions/api/datos.js), con usuarios.
 *
 *  Reglas acordadas con JX (2026-11-17):
 *   · Cada recepcionista entra con SU usuario y contraseña. El admin (JX)
 *     crea, desactiva y cambia la contraseña de los usuarios.
 *   · Solo el admin: maneja usuarios, ve quién hizo qué (actividad), borra
 *     listados del historial y cambia los ajustes de la hoja para todos.
 *   · El Excel NUNCA llega aquí: se lee en el equipo. Aquí solo llega el
 *     listado ya armado (reserva, habitaciones, agencia, titular, preregistro).
 *   · Lo guardado se BORRA SOLO a los 30 días (son nombres de huéspedes).
 *
 *  Necesita en el proyecto de Cloudflare Pages (una sola vez, ver README):
 *   · Vinculación D1 con el nombre de variable DB
 *   · Secreto CLAVE_INICIAL (8 caracteres o más): con ella el primer usuario
 *     que entre queda como admin. Después ya no sirve para nada, salvo:
 *   · (Solo si el admin olvidó su contraseña) variable RESCATE_ADMIN = su
 *     usuario: así entra con CLAVE_INICIAL y pone una nueva. Luego se borra.
 *  Sin DB o sin CLAVE_INICIAL responde 503 «sin-configurar» y la web
 *  trabaja sola en el equipo, como antes.
 *
 *  Rutas:
 *   GET    /api/yo                → { usuario | null, primera }   (sin sesión: 200, para no ensuciar la consola)
 *   POST   /api/entrar            { usuario, clave, recordar } → cookie de sesión
 *   POST   /api/salir
 *   POST   /api/clave             { actual, nueva }       (la propia)
 *   GET    /api/listados?desde=t  → { ahora, listados: [{ id, datos, v, t, borrado }], ajustes }
 *   PUT    /api/listados/:id      { datos, base, reemplaza?, actividad? } → { v, t } | { cambio: true, listado } (otro equipo lo cambió) | 410
 *   DELETE /api/listados/:id      (admin)   ·   DELETE /api/listados (admin: todos)
 *   POST   /api/actividad         { acciones: [texto] }   (imprimir, PDF, compartir…)
 *   GET    /api/actividad         (admin)
 *   GET    /api/usuarios          (admin)  ·  POST /api/usuarios (admin)  ·  PATCH /api/usuarios/:id (admin)
 *   PUT    /api/ajustes           { casilla, apretar }    (admin)
 *
 *  Seguridad: contraseñas con PBKDF2-SHA256 (100.000 vueltas, el máximo de
 *  Cloudflare) y sal propia; la sesión es una cookie HttpOnly + Secure +
 *  SameSite=Strict y en la base solo queda su huella (SHA-256); 5 intentos
 *  malos seguidos → 15 minutos de espera; todo lo que cambia datos exige el
 *  encabezado «X-Editador: 1» (otra página no puede mandarlo).
 * ===================================================================== */

const DIA = 86400000;
const GUARDAR_DIAS = 30;                       // JX: «30 días» (listados y actividad se borran solos)
const SESION_CORTA = 14 * 3600000;             // sin «Recordar»: un turno con holgura
const SESION_LARGA = 30 * DIA;                 // con «Recordar en este equipo»
const COOKIE = 'dp_sesion';
const VUELTAS = 100000;                        // PBKDF2: Cloudflare no acepta más de 100.000
const MAX_INTENTOS = 5, ESPERA_INTENTOS = 15 * 60000;
const MAX_CUERPO = 2000000, MAX_LISTADO = 1500000;
const ROLES = ['admin', 'recepcion'];

/* ---------- respuestas ---------- */
function json(datos, estado, extra) {
  const h = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Robots-Tag': 'noindex, nofollow',
    'X-Content-Type-Options': 'nosniff'
  };
  if (extra) { Object.keys(extra).forEach(function (k) { h[k] = extra[k]; }); }
  return new Response(JSON.stringify(datos), { status: estado || 200, headers: h });
}
const error = (codigo, estado, mas) => json(Object.assign({ error: codigo }, mas || {}), estado);

/* ---------- utilidades de texto y cifrado ---------- */
const cod = new TextEncoder();
function b64(buf) {
  const b = new Uint8Array(buf); let s = '';
  for (let i = 0; i < b.length; i++) { s += String.fromCharCode(b[i]); }
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function desdeB64(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) { s += '='; }
  const t = atob(s), b = new Uint8Array(t.length);
  for (let i = 0; i < t.length; i++) { b[i] = t.charCodeAt(i); }
  return b;
}
function azar(n) { const b = new Uint8Array(n); crypto.getRandomValues(b); return b64(b); }
async function huella(texto) { return b64(await crypto.subtle.digest('SHA-256', cod.encode(texto))); }
async function pbkdf2(clave, sal) {
  const llave = await crypto.subtle.importKey('raw', cod.encode(clave), 'PBKDF2', false, ['deriveBits']);
  return b64(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: desdeB64(sal), iterations: VUELTAS }, llave, 256));
}
/** Compara sin delatar por el tiempo cuántas letras acertó. */
function iguales(a, b) {
  a = String(a); b = String(b);
  let dif = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) { dif |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0); }
  return dif === 0;
}
/** Contraseña lista para comparar: tildes en una sola forma (NFC) y sin espacios en los extremos. */
function limpiaClave(s) { s = String(s == null ? '' : s); try { s = s.normalize('NFC'); } catch (e) { /* tal cual */ } return s.trim(); }
/* v1.13 (JX: «que los usuarios sean igual que los nombres: entrar con “Jampier Estrada”»): el usuario ES el nombre
   y apellido. Para compararlo se guarda «aplanado»: sin tildes, en minúsculas y con un solo espacio
   («Jampier Estrada» = «jampier estrada» = «JAMPIER  ESTRADA» = «jampíer estrada»). Los usuarios viejos sin espacios
   («jx») siguen sirviendo tal cual. */
function limpiaUsuario(s) {
  s = String(s == null ? '' : s);
  try { s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); } catch (e) { /* tal cual */ }
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}
/** El nombre como se ve: si lo escribieron todo en minúsculas, cada palabra empieza con mayúscula. */
function nombreBonito(s) {
  const t = limpiaTexto(s, 40);
  return t === t.toLowerCase() ? t.replace(/(^|[\s'-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase()) : t;
}
function limpiaTexto(s, max) { return String(s == null ? '' : s).replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max || 120); }
const USUARIO_OK = /^[a-z0-9][a-z0-9 ._'-]{1,39}$/;   // v1.13: ya acepta espacios (nombre y apellido); hasta 40
const ID_OK = /^[a-z0-9]{2,40}$/i;

/* ---------- la base ---------- */
/** La base D1: la vinculación DB (si quedó con espacios o en minúsculas, se usa igual; lección del Manual de turnos). */
function baseDe(env) {
  const esD1 = (x) => !!x && typeof x === 'object' && typeof x.prepare === 'function';
  if (esD1(env.DB)) { return env.DB; }
  const parecidas = Object.keys(env).filter((k) => k !== 'ASSETS' && k.trim().toUpperCase() === 'DB' && esD1(env[k]));
  return parecidas.length === 1 ? env[parecidas[0]] : null;
}
function faltaEn(env) {
  const falta = [];
  if (!baseDe(env)) { falta.push('DB'); }
  if (!env.CLAVE_INICIAL) { falta.push('CLAVE_INICIAL'); }
  else if (limpiaClave(env.CLAVE_INICIAL).length < 8) { falta.push('CLAVE_INICIAL_CORTA'); }
  return falta;
}
let tablasListas = false;
async function prepararTablas(db) {
  if (tablasListas) { return; }
  await db.batch([
    db.prepare('CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, usuario TEXT NOT NULL UNIQUE, nombre TEXT NOT NULL, rol TEXT NOT NULL, sal TEXT NOT NULL, hash TEXT NOT NULL, activo INTEGER NOT NULL DEFAULT 1, cambiar INTEGER NOT NULL DEFAULT 0, creado INTEGER NOT NULL)'),
    db.prepare('CREATE TABLE IF NOT EXISTS sesiones (token TEXT PRIMARY KEY, usuario_id INTEGER NOT NULL, creado INTEGER NOT NULL, expira INTEGER NOT NULL)'),
    db.prepare('CREATE TABLE IF NOT EXISTS listados (id TEXT PRIMARY KEY, datos TEXT NOT NULL, fecha TEXT, v INTEGER NOT NULL, t INTEGER NOT NULL, creado INTEGER NOT NULL, borrado INTEGER NOT NULL DEFAULT 0)'),
    db.prepare('CREATE INDEX IF NOT EXISTS listados_t ON listados (t)'),
    db.prepare('CREATE TABLE IF NOT EXISTS actividad (id INTEGER PRIMARY KEY AUTOINCREMENT, t INTEGER NOT NULL, usuario TEXT, nombre TEXT, accion TEXT NOT NULL)'),
    db.prepare('CREATE INDEX IF NOT EXISTS actividad_t ON actividad (t)'),
    db.prepare('CREATE TABLE IF NOT EXISTS ajustes (clave TEXT PRIMARY KEY, valor TEXT NOT NULL, t INTEGER NOT NULL)'),
    db.prepare('CREATE TABLE IF NOT EXISTS intentos (clave TEXT PRIMARY KEY, n INTEGER NOT NULL, desde INTEGER NOT NULL)')
  ]);
  tablasListas = true;
}
/** Borra lo vencido: listados y actividad de más de 30 días, sesiones vencidas e intentos viejos. A lo sumo una vez por hora. */
async function limpiarVencido(db, ahora, forzar) {
  const ultima = await db.prepare("SELECT valor FROM ajustes WHERE clave = 'limpieza'").first();
  if (!forzar && ultima && ahora - (+ultima.valor || 0) < 3600000) { return; }
  const corte = ahora - GUARDAR_DIAS * DIA;
  await db.batch([
    db.prepare('DELETE FROM listados WHERE creado < ?1').bind(corte),
    db.prepare('DELETE FROM actividad WHERE t < ?1').bind(corte),
    db.prepare('DELETE FROM sesiones WHERE expira < ?1').bind(ahora),
    db.prepare('DELETE FROM intentos WHERE desde < ?1').bind(ahora - DIA),
    db.prepare("INSERT INTO ajustes (clave, valor, t) VALUES ('limpieza', ?1, ?1) ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor, t = excluded.t").bind(String(ahora))
  ]);
}
async function anotar(db, quien, acciones, t) {
  const lista = (Array.isArray(acciones) ? acciones : [acciones]).map((a) => limpiaTexto(a, 200)).filter(Boolean).slice(0, 30);
  if (!lista.length) { return; }
  await db.batch(lista.map((a, i) => db.prepare('INSERT INTO actividad (t, usuario, nombre, accion) VALUES (?1, ?2, ?3, ?4)')
    .bind((t || Date.now()) + i, quien ? quien.usuario : null, quien ? quien.nombre : 'Sistema', a)));
}

/* ---------- sesión ---------- */
function leerCookie(request) {
  const c = request.headers.get('Cookie') || '';
  const m = c.split(/;\s*/).filter((p) => p.indexOf(COOKIE + '=') === 0)[0];
  return m ? decodeURIComponent(m.slice(COOKIE.length + 1)) : '';
}
function cookieSesion(token, maxAge) {
  return COOKIE + '=' + token + '; Path=/; HttpOnly; Secure; SameSite=Strict' + (maxAge === null ? '' : '; Max-Age=' + maxAge);
}
async function quienEs(db, request) {
  const token = leerCookie(request);
  if (!token || token.length > 100) { return null; }
  const u = await db.prepare('SELECT u.id, u.usuario, u.nombre, u.rol, u.cambiar, s.token FROM sesiones s JOIN usuarios u ON u.id = s.usuario_id WHERE s.token = ?1 AND s.expira > ?2 AND u.activo = 1')
    .bind(await huella(token), Date.now()).first();
  return u || null;
}
const publico = (u) => ({ id: u.id, usuario: u.usuario, nombre: u.nombre, rol: u.rol, cambiar: !!u.cambiar });

/* ---------- lectura del cuerpo ---------- */
async function cuerpoDe(request) {
  const texto = await request.text();
  if (texto.length > MAX_CUERPO) { throw Object.assign(new Error('grande'), { estado: 413, codigo: 'muy-grande' }); }
  try { return texto ? JSON.parse(texto) : {}; } catch (e) { throw Object.assign(new Error('json'), { estado: 400, codigo: 'datos' }); }
}

/* ================================================================
 *  RUTAS
 * ================================================================ */
async function entrar(db, env, request) {
  const c = await cuerpoDe(request);
  const usuario = limpiaUsuario(c.usuario), clave = limpiaClave(c.clave), ahora = Date.now();
  if (!USUARIO_OK.test(usuario) || !clave) { return error('datos', 400); }
  // freno: 5 intentos malos seguidos para ese usuario → 15 minutos de espera
  const intento = await db.prepare('SELECT n, desde FROM intentos WHERE clave = ?1').bind(usuario).first();
  if (intento && intento.n >= MAX_INTENTOS && ahora - intento.desde < ESPERA_INTENTOS) {
    return error('espera', 429, { minutos: Math.ceil((ESPERA_INTENTOS - (ahora - intento.desde)) / 60000) });
  }
  const inicial = limpiaClave(env.CLAVE_INICIAL);
  const hay = await db.prepare('SELECT COUNT(*) AS n FROM usuarios').first();
  let u = null;
  if (!hay || !hay.n) {
    // primera vez: quien entre con la CLAVE_INICIAL queda como admin (y debe poner su propia contraseña)
    if (iguales(clave, inicial)) {
      const sal = azar(16);
      await db.prepare('INSERT INTO usuarios (usuario, nombre, rol, sal, hash, activo, cambiar, creado) VALUES (?1, ?2, ?3, ?4, ?5, 1, 1, ?6)')
        .bind(usuario, nombreBonito(c.usuario), 'admin', sal, await pbkdf2(clave, sal), ahora).run();
      u = await db.prepare('SELECT * FROM usuarios WHERE usuario = ?1').bind(usuario).first();
      await anotar(db, u, 'Creó la nube y quedó como administrador');
    }
  } else {
    const fila = await db.prepare('SELECT * FROM usuarios WHERE usuario = ?1').bind(usuario).first();
    if (fila && fila.activo && iguales(await pbkdf2(clave, fila.sal), fila.hash)) { u = fila; }
    // rescate (admin que olvidó su contraseña): RESCATE_ADMIN = su usuario + CLAVE_INICIAL
    if (!u && fila && fila.rol === 'admin' && limpiaUsuario(env.RESCATE_ADMIN) === usuario && iguales(clave, inicial)) {
      const sal = azar(16);
      await db.prepare('UPDATE usuarios SET sal = ?1, hash = ?2, activo = 1, cambiar = 1 WHERE id = ?3').bind(sal, await pbkdf2(clave, sal), fila.id).run();
      u = Object.assign({}, fila, { activo: 1, cambiar: 1 });
      await anotar(db, u, 'Entró con el rescate de administrador');
    }
  }
  if (!u) {
    const nuevo = !intento || ahora - intento.desde >= ESPERA_INTENTOS;
    await db.prepare('INSERT INTO intentos (clave, n, desde) VALUES (?1, 1, ?2) ON CONFLICT(clave) DO UPDATE SET n = ' + (nuevo ? '1' : 'n + 1') + ', desde = ' + (nuevo ? '?2' : 'desde'))
      .bind(usuario, ahora).run();
    await new Promise((ok) => setTimeout(ok, 600));          // frena a quien pruebe contraseñas al azar
    return error('clave', 401);
  }
  await db.prepare('DELETE FROM intentos WHERE clave = ?1').bind(usuario).run();
  const token = azar(32), dura = c.recordar ? SESION_LARGA : SESION_CORTA;
  await db.prepare('INSERT INTO sesiones (token, usuario_id, creado, expira) VALUES (?1, ?2, ?3, ?4)').bind(await huella(token), u.id, ahora, ahora + dura).run();
  await anotar(db, u, 'Entró' + (c.recordar ? ' (recordar en este equipo)' : ''));
  await limpiarVencido(db, ahora, false);
  return json({ usuario: publico(u) }, 200, { 'Set-Cookie': cookieSesion(token, c.recordar ? Math.floor(dura / 1000) : null) });
}

async function salir(db, request, quien) {
  const token = leerCookie(request);
  if (token) { await db.prepare('DELETE FROM sesiones WHERE token = ?1').bind(await huella(token)).run(); }
  if (quien) { await anotar(db, quien, 'Salió'); }
  return json({ ok: true }, 200, { 'Set-Cookie': cookieSesion('', 0) });
}

async function cambiarClave(db, request, quien) {
  const c = await cuerpoDe(request);
  const actual = limpiaClave(c.actual), nueva = limpiaClave(c.nueva);
  const fila = await db.prepare('SELECT * FROM usuarios WHERE id = ?1').bind(quien.id).first();
  // v1.7 (JX: «yo agrego los usuarios y la contraseña… yo mismo se las doy»): recepción NO cambia su contraseña;
  // solo el admin (y quien tiene el cambio obligado: el primer admin con CLAVE_INICIAL o el rescate)
  if (fila && fila.rol !== 'admin' && !fila.cambiar) { return error('solo-admin', 403); }
  if (!fila || !iguales(await pbkdf2(actual, fila.sal), fila.hash)) { await new Promise((ok) => setTimeout(ok, 600)); return error('clave', 403); }
  if (nueva.length < 8) { return error('corta', 400); }
  if (nueva === actual) { return error('igual', 400); }
  const sal = azar(16);
  await db.batch([
    db.prepare('UPDATE usuarios SET sal = ?1, hash = ?2, cambiar = 0 WHERE id = ?3').bind(sal, await pbkdf2(nueva, sal), quien.id),
    db.prepare('DELETE FROM sesiones WHERE usuario_id = ?1 AND token <> ?2').bind(quien.id, quien.token)   // cierra sus otros equipos
  ]);
  await anotar(db, quien, 'Cambió su contraseña');
  return json({ ok: true });
}

async function ajustesGlobales(db) {
  const r = await db.prepare("SELECT valor, t FROM ajustes WHERE clave = 'hoja'").first();
  if (!r) { return null; }
  try { return Object.assign(JSON.parse(r.valor), { t: r.t }); } catch (e) { return null; }
}

async function leerListados(db, url) {
  const ahora = Date.now();
  await limpiarVencido(db, ahora, false);
  const desde = Math.max(0, +url.searchParams.get('desde') || 0);
  const consulta = desde
    ? db.prepare('SELECT id, datos, v, t, borrado FROM listados WHERE t > ?1 ORDER BY t').bind(desde)
    : db.prepare('SELECT id, datos, v, t, borrado FROM listados WHERE borrado = 0 ORDER BY t');
  const { results } = await consulta.all();
  return json({
    ahora: ahora, guardarDias: GUARDAR_DIAS, ajustes: await ajustesGlobales(db),
    listados: (results || []).map((r) => {
      let datos = null;
      if (!r.borrado) { try { datos = JSON.parse(r.datos); } catch (e) { datos = null; } }
      return { id: r.id, datos: datos, v: r.v, t: r.t, borrado: !!r.borrado };
    })
  });
}

async function guardarListado(db, request, quien, id) {
  if (!ID_OK.test(id)) { return error('datos', 400); }
  const c = await cuerpoDe(request);
  if (!c.datos || typeof c.datos !== 'object' || Array.isArray(c.datos) || !Array.isArray(c.datos.filas)) { return error('datos', 400); }
  const datos = JSON.stringify(c.datos);
  if (datos.length > MAX_LISTADO) { return error('muy-grande', 413); }
  const base = Math.max(0, Math.floor(+c.base || 0)), ahora = Date.now();
  const fila = await db.prepare('SELECT v, borrado, creado FROM listados WHERE id = ?1').bind(id).first();
  if (fila && fila.borrado) { return error('borrado', 410); }
  if (!fila && base > 0) { return error('borrado', 410); }                       // ya se borró (o se venció a los 30 días)
  if (fila && fila.v !== base) {                                                  // otro equipo lo cambió: que lo mezcle y vuelva a mandar
    const actual = await db.prepare('SELECT id, datos, v, t FROM listados WHERE id = ?1').bind(id).first();
    let d = null; try { d = JSON.parse(actual.datos); } catch (e) { d = null; }
    return json({ cambio: true, listado: { id: id, datos: d, v: actual.v, t: actual.t } });   // 200 (no 409) para no ensuciar la consola
  }
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(c.datos.fecha || '') ? c.datos.fecha : null;
  const v = (fila ? fila.v : 0) + 1;
  const ops = [];
  if (fila) {
    ops.push(db.prepare('UPDATE listados SET datos = ?1, fecha = ?2, v = ?3, t = ?4 WHERE id = ?5 AND v = ?6').bind(datos, fecha, v, ahora, id, base));
  } else {
    ops.push(db.prepare('INSERT INTO listados (id, datos, fecha, v, t, creado, borrado) VALUES (?1, ?2, ?3, 1, ?4, ?4, 0)').bind(id, datos, fecha, ahora));
  }
  // un Excel más nuevo del mismo día reemplaza al listado anterior (ya trae lo que se hizo a mano)
  if (c.reemplaza && ID_OK.test(c.reemplaza) && c.reemplaza !== id) {
    ops.push(db.prepare("UPDATE listados SET borrado = 1, datos = '{}', v = v + 1, t = ?1 WHERE id = ?2 AND borrado = 0").bind(ahora, c.reemplaza));
  }
  const res = await db.batch(ops);
  if (fila && res[0].meta && res[0].meta.changes === 0) {                       // otro equipo guardó en el mismo instante
    const otro = await db.prepare('SELECT id, datos, v, t FROM listados WHERE id = ?1').bind(id).first();
    let d = null; try { d = JSON.parse(otro.datos); } catch (e) { d = null; }
    return json({ cambio: true, listado: { id: id, datos: d, v: otro.v, t: otro.t } });
  }
  await anotar(db, quien, c.actividad, ahora);
  return json({ v: v, t: ahora });
}

async function borrarListados(db, quien, id) {
  const ahora = Date.now();
  if (id) {
    if (!ID_OK.test(id)) { return error('datos', 400); }
    const fila = await db.prepare('SELECT fecha FROM listados WHERE id = ?1 AND borrado = 0').bind(id).first();
    if (!fila) { return json({ ok: true }); }
    await db.prepare("UPDATE listados SET borrado = 1, datos = '{}', v = v + 1, t = ?1 WHERE id = ?2").bind(ahora, id).run();
    await anotar(db, quien, 'Borró del historial el listado del ' + (fila.fecha ? fila.fecha.split('-').reverse().join('/') : '?'));
    return json({ ok: true });
  }
  const r = await db.prepare("UPDATE listados SET borrado = 1, datos = '{}', v = v + 1, t = ?1 WHERE borrado = 0").bind(ahora).run();
  await anotar(db, quien, 'Borró todo el historial (' + ((r.meta && r.meta.changes) || 0) + ' listados)');
  return json({ ok: true });
}

async function verActividad(db) {
  const { results } = await db.prepare('SELECT t, usuario, nombre, accion FROM actividad ORDER BY t DESC LIMIT 400').all();
  return json({ actividad: results || [], guardarDias: GUARDAR_DIAS });
}

async function verUsuarios(db) {
  const { results } = await db.prepare('SELECT id, usuario, nombre, rol, activo, cambiar, creado FROM usuarios ORDER BY activo DESC, rol, nombre').all();
  return json({ usuarios: (results || []).map((u) => ({ id: u.id, usuario: u.usuario, nombre: u.nombre, rol: u.rol, activo: !!u.activo, cambiar: !!u.cambiar, creado: u.creado })) });
}

async function crearUsuario(db, request, quien) {
  const c = await cuerpoDe(request);
  // v1.13: un solo campo: el nombre y apellido es también el usuario para entrar
  const nombre = nombreBonito(c.nombre), usuario = limpiaUsuario(c.usuario || c.nombre), rol = ROLES.indexOf(c.rol) >= 0 ? c.rol : 'recepcion', clave = limpiaClave(c.clave);
  if (!nombre) { return error('nombre', 400); }
  if (!USUARIO_OK.test(usuario)) { return error('usuario', 400); }
  if (clave.length < 8) { return error('corta', 400); }
  const existe = await db.prepare('SELECT id FROM usuarios WHERE usuario = ?1').bind(usuario).first();
  if (existe) { return error('existe', 409); }
  const sal = azar(16);
  // v1.7: cambiar = 0 → entra con la contraseña que le puso el admin, sin que se la pidan cambiar
  await db.prepare('INSERT INTO usuarios (usuario, nombre, rol, sal, hash, activo, cambiar, creado) VALUES (?1, ?2, ?3, ?4, ?5, 1, 0, ?6)')
    .bind(usuario, nombre, rol, sal, await pbkdf2(clave, sal), Date.now()).run();
  await anotar(db, quien, 'Creó el usuario «' + nombre + '»' + (rol === 'admin' ? ' (administrador)' : ''));
  return verUsuarios(db);
}

async function cambiarUsuario(db, request, quien, id) {
  id = Math.floor(+id || 0);
  const c = await cuerpoDe(request);
  const u = await db.prepare('SELECT * FROM usuarios WHERE id = ?1').bind(id).first();
  if (!u) { return error('no-existe', 404); }
  const propio = u.id === quien.id, cambios = [], ops = [], hechos = [];
  if (c.nombre !== undefined) {
    // v1.13: cambiar el nombre cambia también con qué entra (el usuario es el nombre aplanado)
    const n = nombreBonito(c.nombre), nu = limpiaUsuario(n);
    if (!n) { return error('nombre', 400); }
    if (!USUARIO_OK.test(nu)) { return error('usuario', 400); }
    if (nu !== u.usuario) {
      const otro = await db.prepare('SELECT id FROM usuarios WHERE usuario = ?1 AND id <> ?2').bind(nu, id).first();
      if (otro) { return error('existe', 409); }
      cambios.push(['usuario', nu]);
    }
    cambios.push(['nombre', n]); hechos.push('le cambió el nombre a «' + n + '» (entra con ese nombre)');
  }
  if (c.rol !== undefined && c.rol !== u.rol) {
    if (ROLES.indexOf(c.rol) < 0) { return error('datos', 400); }
    if (propio) { return error('propio', 400); }
    cambios.push(['rol', c.rol]); hechos.push(c.rol === 'admin' ? 'lo hizo administrador' : 'le quitó el administrador');
  }
  if (c.activo !== undefined && !!c.activo !== !!u.activo) {
    if (propio) { return error('propio', 400); }
    cambios.push(['activo', c.activo ? 1 : 0]); hechos.push(c.activo ? 'lo activó' : 'lo desactivó');
    if (!c.activo) { ops.push(db.prepare('DELETE FROM sesiones WHERE usuario_id = ?1').bind(id)); }
  }
  if (c.clave !== undefined) {
    const clave = limpiaClave(c.clave);
    if (clave.length < 8) { return error('corta', 400); }
    const sal = azar(16);
    cambios.push(['sal', sal], ['hash', await pbkdf2(clave, sal)], ['cambiar', 0]);   // v1.7: la que pone el admin es la definitiva
    hechos.push('le puso una contraseña nueva');
    if (!propio) { ops.push(db.prepare('DELETE FROM sesiones WHERE usuario_id = ?1').bind(id)); }
  }
  if (!cambios.length) { return verUsuarios(db); }
  // siempre debe quedar al menos un administrador activo
  const quedaAdmin = (cambios.some((x) => x[0] === 'rol' && x[1] !== 'admin') || cambios.some((x) => x[0] === 'activo' && !x[1])) && u.rol === 'admin';
  if (quedaAdmin) {
    const otros = await db.prepare("SELECT COUNT(*) AS n FROM usuarios WHERE rol = 'admin' AND activo = 1 AND id <> ?1").bind(id).first();
    if (!otros || !otros.n) { return error('ultimo-admin', 400); }
  }
  const sets = cambios.map((x, i) => x[0] + ' = ?' + (i + 1)).join(', ');
  ops.unshift(db.prepare('UPDATE usuarios SET ' + sets + ' WHERE id = ?' + (cambios.length + 1)).bind(...cambios.map((x) => x[1]), id));
  await db.batch(ops);
  await anotar(db, quien, 'Cambió el usuario «' + u.nombre + '»: ' + hechos.join(', '));
  return verUsuarios(db);
}

async function guardarAjustes(db, request, quien) {
  const c = await cuerpoDe(request);
  const valor = { casilla: c.casilla === true, apretar: c.apretar !== false }, ahora = Date.now();
  await db.prepare("INSERT INTO ajustes (clave, valor, t) VALUES ('hoja', ?1, ?2) ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor, t = excluded.t")
    .bind(JSON.stringify(valor), ahora).run();
  await anotar(db, quien, 'Cambió los ajustes de la hoja para todos: casilla «Llegó» ' + (valor.casilla ? 'prendida' : 'apagada') + ', «Ahorrar papel» ' + (valor.apretar ? 'prendido' : 'apagado'));
  return json(Object.assign({ t: ahora }, valor));
}

/* ================================================================
 *  ENTRADA: todo lo que llega a /api/…
 * ================================================================ */
export async function onRequest(context) {
  const { request, env, params } = context;
  const ruta = (Array.isArray(params.ruta) ? params.ruta : [params.ruta || '']).filter(Boolean);
  const [r0, r1] = ruta, metodo = request.method, url = new URL(request.url);
  try {
    const falta = faltaEn(env);
    if (falta.length) {
      // GET /api/yo (lo que pregunta la web al abrir) responde 200 para no ensuciar la consola en cada visita
      // mientras JX activa la base; lo demás, 503. En los dos casos: { error: 'sin-configurar', falta }.
      return error('sin-configurar', r0 === 'yo' && metodo === 'GET' ? 200 : 503, { falta: falta });
    }
    // lo que cambia datos solo lo puede mandar la propia web (otra página no puede poner este encabezado)
    if (metodo !== 'GET' && request.headers.get('X-Editador') !== '1') { return error('origen', 403); }
    const db = baseDe(env);
    await prepararTablas(db);

    if (r0 === 'entrar' && metodo === 'POST') { return await entrar(db, env, request); }
    const quien = await quienEs(db, request);
    if (r0 === 'yo' && metodo === 'GET') {
      if (quien) { return json({ usuario: publico(quien), guardarDias: GUARDAR_DIAS }); }
      const hay = await db.prepare('SELECT COUNT(*) AS n FROM usuarios').first();
      return json({ usuario: null, primera: !hay || !hay.n, guardarDias: GUARDAR_DIAS });
    }
    if (r0 === 'salir' && metodo === 'POST') { return await salir(db, request, quien); }
    if (!quien) { return error('sesion', 401); }
    const admin = quien.rol === 'admin';
    const soloAdmin = () => error('admin', 403);

    if (r0 === 'clave' && metodo === 'POST') { return await cambiarClave(db, request, quien); }
    if (r0 === 'listados') {
      if (metodo === 'GET' && !r1) { return await leerListados(db, url); }
      if (metodo === 'PUT' && r1) { return await guardarListado(db, request, quien, r1); }
      if (metodo === 'DELETE') { return admin ? await borrarListados(db, quien, r1) : soloAdmin(); }
    }
    if (r0 === 'actividad') {
      if (metodo === 'POST') { const c = await cuerpoDe(request); await anotar(db, quien, c.acciones); return json({ ok: true }); }
      if (metodo === 'GET') { return admin ? await verActividad(db) : soloAdmin(); }
    }
    if (r0 === 'usuarios') {
      if (!admin) { return soloAdmin(); }
      if (metodo === 'GET' && !r1) { return await verUsuarios(db); }
      if (metodo === 'POST' && !r1) { return await crearUsuario(db, request, quien); }
      if (metodo === 'PATCH' && r1) { return await cambiarUsuario(db, request, quien, r1); }
    }
    if (r0 === 'ajustes' && metodo === 'PUT') { return admin ? await guardarAjustes(db, request, quien) : soloAdmin(); }
    return error('ruta', 404);
  } catch (e) {
    if (e && e.estado) { return error(e.codigo, e.estado); }
    console.error('Nube /api/' + ruta.join('/') + ':', e && e.message);
    return error('base', 500);
  }
}
