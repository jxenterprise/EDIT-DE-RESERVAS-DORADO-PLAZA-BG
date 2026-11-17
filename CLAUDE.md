# CLAUDE.md · Editador de reservas DP · Recepción · Hotel Dorado Plaza Bocagrande

> **Nombre:** el proyecto se llama **«Editador de reservas DP»** (decisión de JX, 2026-11-17; «editador» es el nombre que JX escogió, no corregirlo a «editor»). La HOJA impresa sigue titulada «LISTADO DE RESERVAS» (eso no cambia).

Contexto para que cualquier chat futuro (de Claude u otra IA) retome este proyecto sin adivinar. **Se amplía, nunca se borra lo anterior.**

## 📍 Por dónde vamos (LÉEME PRIMERO) — última actualización: 17 nov 2026, 3:46 p. m. (hora Colombia) · **v1.3**

- **Estado:** **v1.3** en GitHub (rama **`main`**). Funciona completa: subir Excel → lista → corregir/agregar/quitar → hoja → Imprimir / PDF / Compartir → historial, y desde v1.3 **la nube con usuarios** (ver abajo). **No hay errores conocidos abiertos.**
- **☁️ v1.3 · NUBE CON USUARIOS (sesión 3, pedido de JX con un video de su Manual de turnos):** `functions/api/[[ruta]].js` (Cloudflare Pages Functions + base **D1**) con **usuario por persona** (admin + recepción), sesiones con cookie, historial compartido entre equipos, mezcla de cambios de dos equipos, «Quién hizo qué», ajustes de la hoja para todos y **borrado automático a los 30 días**. Si en la dirección no hay nube (doble clic, `python -m http.server`, o Cloudflare sin la base), la página trabaja **sola en el equipo como antes**, sin pedir usuario.
  - **⚠️ LO QUE FALTA (lo hace JX en Cloudflare, una sola vez):** crear la base D1 `editador-reservas-db`, vincularla con el nombre `DB`, poner el secreto `CLAVE_INICIAL` (8+ caracteres) y «Reintentar implementación». Pasos exactos en `README.md` §10 «Activar la nube en Cloudflare». Mientras tanto, `https://editador-reservas-doradoplaza-bg.pages.dev/api/yo` responde 503 `sin-configurar` y la web trabaja sola en cada equipo. **Comprobar en la próxima sesión** con `curl -s <url>/api/yo`: listo = `{"usuario":null,"primera":true,…}`.
  - Después, JX entra con su usuario (p. ej. `jx`) + la `CLAVE_INICIAL` → queda admin → pone su contraseña → crea a los recepcionistas en «Administración». Nombre visible del admin: lo cambia en «Administración → Nombre».
- **⏱️ Pantalla de carga (v1.3):** igual a la del Manual de turnos v1.15 (JX: «me gusta más cómo se mueve el logo»): el % sube PAREJO de 0 a 100 en **2,5 s** sin pausas (`CARGA_TOTAL_MS` en `app.js` + `<script>` en `index.html`), `data-salida="rapida"`. Lo mismo al leer el Excel (`etapas()`). El código del cargador es el mismo de turnos (`cargador-dorado.min.js` idéntico salvo comentarios): lo que cambia es cómo se le da el %.
- **🏷️ VERSIONES (regla de JX, 2026-11-17):** cada cambio que se publica sube la versión: v1.0, v1.1, v1.2, v1.3… (un cambio grande de diseño o de reglas → v2.0, preguntando a JX). En CADA versión se actualizan, con **fecha y hora de Colombia (UTC−5)**: 1) la pastilla bajo el logo en `sitio/index.html` (`.encabezado__version`, zona editable marcada), 2) la tabla «Versiones» del `README.md`, 3) el «Historial» de este archivo y el título de esta sección. La hora es la del commit que publica la versión.
- **🔄 Sincronizar PC ↔ GitHub ↔ nube (pedido de JX el 2026-11-17):** se trabaja en los dos lados con **una sola rama: `main`**. Al EMPEZAR cualquier sesión: `git pull` (traer lo que se hizo en el otro lado). Al TERMINAR: commit + `git push` a `main`. Si una sesión en la nube crea una rama `claude/…`, al final se une a `main` (avance directo) para que la PC la reciba con `git pull`.
  - **En la PC de JX (Windows)** la carpeta es `C:\Users\jampi\Documents\JX COMPANY\PAGINAS WEBS JX\Listado_Reservas_DP_Recepcion_Dorado_Plaza_Bocagrande\Listado_Reservas_DP_Recepcion_Dorado_Plaza_Bocagrande`. GitHub CLI tiene dos cuentas: la activa (`Jampier-Developer`) **no puede subir** a este repo; la que sube es `jxenterprise`. Por eso el repo local usa `origin = https://jxenterprise@github.com/…` y un ayudante de credenciales **local de este repo** que pide `gh auth token -u jxenterprise` al momento (no hay token guardado en archivos). Si un push falla por permisos, revisar con `git config --local --get-all credential.https://github.com.helper`. No cambiar la cuenta activa global de JX sin preguntarle.
- **Sesión 2 (revisión de errores y responsive, prioridad PC):** se probó en 15 pantallas (PC 1024/1280/1366/1536/1920/2560, iPad Mini, Galaxy S9+ 320, Pixel 7, iPhone SE, iPhone 13, iPhone 15 Pro Max, iPhone 13 y Pixel 7 acostados, plegable 280 px), en claro y noche, + 28 pruebas de funciones. Lo corregido está en la tabla de la v1.1 (sección Historial).
- **Publicada:** <https://editador-reservas-doradoplaza-bg.pages.dev> (Cloudflare Pages conectado a GitHub, publica solo con cada push a `main`). **El 2026-11-17 daba 404** porque el «Build output directory» estaba vacío y se publicaba la raíz del repo (y `README.md`/`CLAUDE.md` quedaban públicos). JX puso `sitio` y desde las ~2:50 p. m. la raíz abre el editador (verificado: `/` y `/css/estilos.css` dan 200). **Quedó una copia vieja de `/CLAUDE.md` y `/README.md` en la caché de Cloudflare** (`CF-Cache-Status: HIT`, `s-maxage=604800`): con un parámetro (`/CLAUDE.md?x=1`) ya responde la página del editador, o sea que el archivo NO está en la publicación. Revisar en la próxima sesión con `curl -sI <url>/CLAUDE.md` (debe dejar de ser `text/markdown`); si sigue, pedirle a JX una nueva publicación o esperar a que venza la caché.
- **El repo de GitHub es PÚBLICO**: todo lo que se escriba en `CLAUDE.md` y `README.md` lo puede leer cualquiera. No poner datos sensibles. JX pidió (2026-11-17) que `CLAUDE.md` **no se vea en la web** y solo lo use Claude, y que el README sí sea público: en la página publicada ya no está (solo se publica `sitio/`). **En GitHub sigue visible porque el repo es público** → decisión pendiente de JX (repo privado, o sacar `CLAUDE.md` del repo y perder el contexto en las sesiones en la nube).
- **Lo que falta (no es código, son datos de JX):** los `{POR CONFIRMAR}` del final.
- **Ideas propuestas a JX y aún NO aprobadas** (no construir sin preguntarle, con AskUserQuestion): «Ideas pendientes de aprobar», al final de este archivo.
- **Cómo probar rápido:** `cd sitio && python3 -m http.server 8765` y abrir `http://localhost:8765/`. Para probar en serio: Playwright (viene instalado en las sesiones en la nube) + Excel de prueba hechos con `openpyxl` (fila 1 vacía, títulos en la fila 2: «Nro reserva», «Nro hab», «Agencia», «Titular», «Checkin»…; la celda de reserva tipo `DP130000      Preregistro (EXTRANET)⚠ Incompleto`). Los scripts de prueba NO se suben al repo (regla de archivos de JX).
- **Ojo al medir con scripts:** el panel de «Más ajustes» cerrado (`<details>`) devuelve medidas aunque no se vea; no es un desborde real.

## De qué trata

- **Qué es:** herramienta interna de una sola página (HTML + CSS + JS, sin servidor ni librerías). Recepción sube el **Excel del día que descarga de la extranet** (`https://extranet.doradoplaza.com/extranet/`) y la página arma la hoja **«LISTADO DE RESERVAS»** tamaño carta, igual al PDF de referencia de JX (`Reservas_DP_17-11-2026.pdf`, hecho con ReportLab) y a su foto de la hoja del 16-11: logo dorado, título, «Códigos DP · Recepción Hotel Dorado Plaza Bocagrande», fecha, tabla de 4 columnas, totales y pie. Se imprime, se descarga en PDF o se comparte.
- **Para quién:** recepción del Hotel Dorado Plaza **Bocagrande** (Cartagena). JX («Bro jx») y sus compañeros: cada uno procesa el Excel en su propio equipo y lo que se comparte es el PDF.
- **Las 4 columnas (pedido literal de JX):** «solo manejamos Nro reserva, Nro hab, Agencia, Titular… la demás información sí se elimina». El resto de columnas del Excel se **ignora** (no se borra nada del archivo: simplemente no se usa). Sirve el Excel completo (17 columnas) **y** uno ya limpiado a mano de 4 columnas (fila 1 vacía, títulos en la fila 2): las columnas se buscan **por nombre**, no por posición.
- **La regla (JX: «Sí, así es»):** en el Excel cada fila es una habitación y la reserva se repite. Queda **una línea por reserva con su Nro hab más alto**; la agencia y el titular salen de **esa misma fila** (si dos filas empatan, gana la primera). Orden: más habitaciones primero; empates, en el orden del Excel. Nunca se borra ninguno de los 4 datos importantes.
- **Preregistro** (viene pegado en la celda «Nro reserva»; JX: «Dame lo mejor»): «… ⚠ Incompleto» o «Sin preregistro» → **Sin preregistro** · «Preregistro (…) ✔ Completo» o «Con preregistro» → **Con preregistro** · «Web check-in ✔ Completo» → **Web check-in completo** · cualquier otro estado → tal cual (limpio, máx. 40 letras) + aviso en pantalla. Sale en letra pequeña debajo del código, como en el PDF de JX.
- **Crédito:** `Diseño y desarrollo: JX Company` **solo en el pie de la web**, con el formato exacto (`.footer-dev`). **La hoja impresa NO lleva crédito.** Nunca «JX Studio».
- **Proyectos hermanos:** Web Check-in Dorado Plaza (sistema de diseño, letra Karla, pantalla de carga «Trazo de oro» v2.1 con fondo de vidrio) y Manual de turnos de recepción (estructura, `tema.js`, logo «RECEPCIÓN · HOTEL DORADO PLAZA · BOCAGRANDE», crédito). De ahí se copiaron el cargador, el logo WebP, los favicons y Karla.
- **Dónde se publica:** Cloudflare Pages, proyecto `editador-reservas-doradoplaza-bg` → `https://editador-reservas-doradoplaza-bg.pages.dev`, **conectado a GitHub** (rama `main`). Configuración: Framework `None`, Build command vacío, **Build output directory `sitio`**, Root directory vacío. Se publica **solo `sitio/`**.

## Reglas de trabajo con JX

- Tratarlo como **«Bro jx»**, en español informal.
- **Preguntar antes de construir** cualquier cosa nueva: todas las preguntas en una tanda, que se puedan seleccionar (AskUserQuestion), cada una con opciones, la recomendación de Claude («Dame lo mejor») y texto libre. Ante cualquier duda o cosa rara: preguntar, nunca improvisar.
- **Nunca inventar datos.** Lo que falte va `{POR CONFIRMAR}` y se lista aquí y en el README.
- Validar los datos con fuentes web actuales antes de afirmarlos.
- **Privacidad (regla de JX para sus herramientas internas):** `meta robots noindex, nofollow, noarchive, nosnippet, noimageindex` + `meta referrer no-referrer`; **sin** `robots.txt`, `sitemap.xml`, `llms.txt`, Open Graph, `description`, `canonical`, JSON-LD, `_headers`, `404.html`, páginas legales ni banner de cookies (no hay cookies ni analítica). No agregar nada de eso aunque el skill de landings lo pida.
- **Archivos:** solo html, css, js, img + `README.md` + `CLAUDE.md` + (desde v1.3) `functions/api/[[ruta]].js`, que va **fuera** de `sitio/` (Cloudflare la ejecuta en `/api/…` sin publicarla como archivo). Los documentos van **fuera** de `sitio/` para que nunca se publiquen. Las pruebas no se entregan (ver «Pruebas hechas»). No subir `.wrangler/` (carpeta que crea `wrangler pages dev`).
- **El Excel se procesa solo en el navegador; nunca se sube a ningún servidor.** Desde v1.3 (aprobado por JX) a la nube del proyecto (Cloudflare D1) van SOLO: el listado ya armado (reserva, hab, agencia, titular, preregistro), los usuarios (contraseñas con PBKDF2) y «Quién hizo qué»; todo se borra a los 30 días. No agregar otros envíos a internet.
- No guardar en la página contraseñas, documentos de huéspedes, datos de tarjetas ni cifras de caja (la hoja solo lleva reserva, habitaciones, agencia, titular y estado del preregistro).
- Nombres de entregables descriptivos con guion bajo (ej. `Listado_Reservas_DP_Recepcion_Dorado_Plaza_Bocagrande.zip`).
- Usa la marca de una organización real (su empleador): se entrega **como archivo** (ZIP), no se publica como Artifact.
- Si el proxy devuelve 403: no reintentar ni rodearlo; reportar el host bloqueado.
- La clave secreta de Supabase (`sb_secret_…`) del proyecto de check-in **jamás** va en un archivo público (este proyecto no usa Supabase).

## 🖼️ REGLA DE IMÁGENES — SIEMPRE WebP
Todas las imágenes de este proyecto van en **WebP**, sin excepción. Cualquier foto nueva que JX entregue (JPG, PNG, HEIC, capturas, lo que sea) se **convierte a WebP de inmediato** antes de meterla al proyecto, conservando resolución y calidad originales, y se guarda en `img/`. Nunca dejar JPG/PNG en el proyecto ni entregar copias de respaldo en otros formatos.
**Única excepción técnica**: `favicon` (`.ico`/`.png`/`.svg`) y `apple-touch-icon.png`, porque ningún navegador soporta favicons en WebP.

> En este proyecto `img/` es `sitio/img/`. Hoy: `logo-dorado-plaza-recepcion-bocagrande.webp` (1200×878, transparente) + `favicon-dorado-plaza.svg`, `favicon-32.png`, `apple-touch-icon.png` (180×180). El logo de la **hoja** no es una imagen: son vectores (`js/logo-vector.js`), para que salga nítido en la impresora y en el PDF.

## 🎨 REGLA DE DISEÑO — TODO LO NUEVO USA ESTE MISMO DISEÑO
Cualquier sección, componente, botón o página que se agregue a futuro debe usar **exactamente** el diseño de esta web: mismos colores, mismas tipografías, mismos tamaños, radios, sombras y espaciados, y los mismos patrones de componente que ya existen. **Nunca un diseño distinto.** Si algo no alcanza con lo que hay, preguntarle a JX antes de inventar.

**Ficha de diseño de este proyecto — la PÁGINA** (`sitio/css/estilos.css`; **los colores solo salen de variables**, así el modo noche funciona solo):
- **Claro** (`:root`, el del check-in): `--fondo #FBF8F1` · `--fondo-2 #F6EFE1` · `--fondo-borde #F1E9D8` (degradado del fondo, con grano `--grano`) · `--superficie #FFFDF8` tarjetas · `--superficie-2 #FBF6EA` recuadros internos · `--campo #FFFFFF` · `--linea #EFE4CD` · `--linea-2 #DCC9A3` · `--oro #D9B266` · `--oro-claro #EFCB80` · `--oro-palido #F8EDD3` · `--bronce #A87B3F` · `--texto #6B5228` · `--texto-fuerte #3E2E14` · `--texto-suave #7F6435` · `--tinta #2E2414` · `--error #B03A2E`/`--error-fondo #FCEEEA` · `--exito #2F7A4A`/`--exito-fondo #EAF5EE` · marcas `--s-verde #2F9E5B` (nueva) · `--s-amarillo #D99A12` (cambió) · `--s-rojo #C8412F` (revisar) · `--s-gris #B4A281` · `--velo-barra rgba(251,248,241,.92)`.
- **Modo noche** (`html[data-tema="oscuro"]`, oscuro cálido): `--fondo #16120C` · `--fondo-2 #1B150E` · `--fondo-borde #120E09` · `--superficie #221A12` · `--superficie-2 #2A2117` · `--campo #1A140D` · `--linea #3A2E1F` · `--linea-2 #57452D` · `--oro-palido rgba(217,178,102,.14)` · `--bronce #D2A660` · `--texto #E3D3B6` · `--texto-fuerte #F5E9D2` · `--texto-suave #BCA57F` · `--tinta #F7EEDD` · `--error #F08A76` · `--exito #6BD196` · `--s-verde #46C27A` · `--s-amarillo #F2BE45` · `--s-rojo #EC6650` · `--s-gris #7D6A4E` · `--velo-barra rgba(22,18,12,.92)`. **La vista previa de la hoja siempre es papel blanco**, también de noche.
- **Tipografías:** sistema (`--sistema`) para todo el texto (títulos 700–800, etiquetas 650, cuerpo 400); **Karla** (`--karla`, «Karla Dorado», woff2 propio) para los títulos de sección en mayúsculas con espaciado `.2em` y líneas doradas a los lados (`.seccion__titulo`); **«Hoja Sans» = Arimo** 400/700 (woff2 propio, `font-display: block`) **solo para la hoja**, porque mide igual que la Helvetica del PDF.
- **Tamaños:** cuerpo 16 px (campos 16 px: el iPhone no hace zoom), etiquetas 14–14.5 px, ayudas 13 px, h1 `clamp(23px, 6.4vw, 30px)`, totales 34 px (≤ 380) / 40 / 46 px (≥ 760), número de habitaciones en la lista 17–20 px, chips 12.5 px.
- **Radios:** tarjetas `--radio 18px`, campos `--radio-campo 12px`, botones 14 px, avisos 12–14 px, diálogos 20 px, píldoras 999 px.
- **Sombras:** `--sombra` (tarjetas), `--sombra-boton` (botón dorado), `--sombra-papel` (las hojas de la vista previa).
- **Espaciados:** márgenes laterales 16 px (12 px ≤ 380 px) **+ el área segura** (`--izq`/`--der` = `env(safe-area-inset-left/right)`, para el «notch» del iPhone acostado; también en encabezado, pie y barra), tarjetas 16 px de relleno (20 px desde 520 px), ancho máximo del contenido 760 → 820 (≥ 1000 px) → 880 px (≥ 1440 px).
- **Patrones de componente:** `.tarjeta`; botones `.boton--primario` (degradado `--boton-oro`), `.boton--secundario`, `.boton-mini` (píldora 44 px), `.enlace` (`--peligro` en rojo); `.interruptor` (casillas de ajustes); `.ajustes__panel` (panel FLOTANTE de «Más ajustes», centrado bajo los botones, `position:absolute` respecto a `.ajustes-rapidos`: al abrirlo no mueve nada; se cierra tocando fuera o con Escape, en `app.js → eventosAjustes`); `.soltar` (zona punteada dorada para el Excel; se compacta cuando ya hay hoja); `.resumen__total` (número grande + palabra); `.avisos li[data-tipo=bien|info|ojo]`; `.chip` (`--nueva`, `--cambio`, `--revisar`, `--mano`); `.reserva` (botón-tarjeta con círculo del número de habitaciones y borde izquierdo de color según la marca); `.hoja__pagina` (papel 612:792 con sombra); `.historial`; barra `.acciones` fija abajo (desde 760 px, flotante centrada); `<dialog class="dialogo">`; aviso flotante `.aviso` (`--alerta`); pantalla de carga «Trazo de oro» v2.1 (`data-fondo="vidrio"`), oscurecida en modo noche. **v1.3 (nube, `estilos.css` §14b):** `html.pide-entrar` (sin entrar solo se ven el logo, el título y la puerta; tampoco se imprime nada); `.entrar` / `.entrar__caja` (tarjeta de 440 px con escudo `.entrar__icono`); `.campo-clave` + `.campo-clave__ojo` (contraseña con el ojo; el `<label>` va aparte del campo para no tener dos controles en una etiqueta); `.aviso-caja` (recuadro dorado con borde izquierdo); `.punto[data-color=verde|amarillo|rojo|gris]` (estado de la nube); `.cuenta-boton` (píldora con nombre y estado); `.estado-nube`; `.usuarios li` (como `.historial`, desactivado = borde punteado, SIN transparencia por contraste); `.actividad li` (hora + quién + qué). El número de la versión (`.encabezado__version-num`) va en `--texto-fuerte` en claro (el bronce no daba contraste AA) y en `--bronce` de noche.

**Ficha de diseño — la HOJA impresa** (`sitio/js/hoja.js`, sección 1; medidas en puntos, carta 612 × 792, **copiadas del PDF de JX**):
- Colores: bronce `#A67C3D` (marco, línea, banda de la tabla, bordes, subtítulo y números) · tinta `#2E2418` · gris `#7A6E5E` (preregistro y pie) · cebra `#F6EFE2` (filas pares y caja de totales) · rayitas `#E3D5BA` · papel `#FFFFFF`.
- Marco doble 28.8 (1.5 pt) / 33.12 (0.4 pt) · logo vectorial en 50.4, 49.8, ancho 123 · título 21 pt negrita en x 191.4, línea base 86.8 · subtítulo 10 pt bronce en 100.8 · «Fecha: DD/MM/AAAA» 11 pt negrita en 120.8 · regla en 149.8 · tabla desde 165.8 (páginas siguientes: 46.8, sin encabezado) · banda 30 pt con títulos 9.5 pt blancos · filas 29 pt (30 con dos renglones) · código 10.5 pt negrita · preregistro 6.5 pt · número 15 pt bronce · agencia/titular 8.8 pt (interlineado 11) · columnas 144 / 64.8 / 151.2 / 151.2 (con «Llegó»: 120 / 58 / 143.6 / 149.6 / 40) · caja de totales 32 pt, 14 pt debajo de la tabla, 11 pt negrita · pie 7.5 pt en 747.4 con «Pág. N de M».
- Letra: Helvetica / Helvetica-Bold (WinAnsi) en el PDF; Arimo en pantalla.
- **Modo de diseño usado:** 2 — identidad de la marca Dorado Plaza (la misma del check-in y del manual) para la página; la hoja calcada del PDF de referencia de JX.

## Las respuestas de JX y las decisiones (y por qué)

| Decisión | Motivo |
|---|---|
| Una línea por reserva con el Nro hab mayor; agencia/titular de esa fila; orden por habitaciones y luego el del Excel | Pedido de JX («Sí, así es»). Con el Excel del 17-11 da **exactamente** su PDF: 23 reservas, 37 habitaciones, mismo orden, 18 en la página 1. |
| Columnas por nombre (sinónimos en `listado.js → COLUMNAS`) | Sirve el Excel completo o uno limpiado de 4 columnas, aunque cambie el orden (pedido de JX del 17-11). |
| Preregistro: Sin / Con / Web check-in completo / otro tal cual + aviso | JX: «Dame lo mejor». |
| Códigos que no empiezan por DP: se incluyen y se avisa | JX: «Dame lo mejor». Un código debe tener al menos un número (si no, la fila no es una reserva). |
| Corregir a mano: editar, agregar, quitar (con «Volver a lo del Excel» y «Devolver a la hoja»). Lo hecho a mano se marca **en pantalla**, nunca en la hoja | JX: «Dame lo mejor». |
| Salida: Imprimir · Descargar PDF · Compartir (Web Share solo con el archivo; si no se puede, descarga) | JX: «Dame lo mejor». Solo el archivo porque en iPhone, con texto, WhatsApp a veces pierde el PDF (WebKit bug 251500). |
| Cada persona procesa en su equipo; nada se sube a internet; se comparte el PDF | JX: «Dame lo mejor» (entre varios). |
| Solo Bocagrande por ahora | JX: «Dame lo mejor» (sedes). |
| **La fecha de la hoja = hoy** (hora de Colombia), editable | JX: «La fecha de hoy». Si el Excel trae otra fecha de check-in, aviso con botón «Usar DD/MM/AAAA» (típico del turno de noche que saca la hoja del día siguiente). |
| Hoja igual a la foto/PDF con logo dorado | JX: «Dame lo mejor». |
| PDF propio (sin librerías) y vista previa en SVG desde la **misma maqueta** | Lo que se ve = lo que se imprime = el PDF. |
| Crédito solo en la web | JX: «Dame lo mejor». |
| Extras: historial (30 listados), modo noche (auto 6 p. m.–6 a. m.), novedades entre descargas del mismo día, casilla «Llegó» | Pedidos por JX en la lista de extras. |
| **Casilla «Llegó» apagada por defecto** (se prende en «Más ajustes») | Así la hoja sale idéntica a su formato («haga ese formato»); el extra queda a un toque. |
| **«Ahorrar papel» prendido por defecto**: si apretando la letra (densidades compacta/mini) la hoja ocupa MENOS páginas, se aprieta; si no, siempre el espaciado del PDF de JX | Ej.: 20 reservas caben en 1 hoja en vez de 2. Se apaga en «Más ajustes» y queda siempre el espaciado original. |
| «Pág. 1 de 2» (el PDF de JX dice «Pág. 1») | Para que nadie se quede sin la segunda hoja. Se cambia en `hoja.js` (busca `TEXTOS.pagina`). |
| Novedades: la descarga nueva **del mismo día** (misma fecha de check-in; si no trae, subida el mismo día) reemplaza a la anterior y marca Nueva / Cambió / Ya no está; **se conservan** correcciones, agregadas y quitadas | Las reservas cambian durante el día y varios compañeros bajan el Excel. |
| Letras dañadas de la extranet (`Ã‘` → `Ñ`…) se arreglan solas; si solo hay una opción posible en el diccionario, se sugiere («Corregir las sugeridas»); si no, se avisa | No inventar: solo se corrige solo lo que es seguro. |
| Hora de Colombia fija (UTC−5) | La fecha no cambia aunque el equipo esté en otra zona. |
| Al recargar, vuelve el listado de hoy (o con fecha de hoy en adelante) | No perder el trabajo; lo viejo queda en el historial. |
| Sin `robots.txt` | Google necesita leer la página para ver el `noindex`. |
| ES5 (sin flechas, `let/const` ni `?.`), CSS con respaldos | Funciona en los computadores viejos de recepción. (La función de la nube sí usa JS moderno: corre en Cloudflare, no en el navegador.) |
| **v1.3 · Nube con usuario por persona** (no una clave compartida ni Cloudflare Access) | JX: «Usuario por persona (Recomendado)». Se sabe quién hizo qué; si alguien se va, se desactiva sin cambiarle la clave a nadie. |
| **v1.3 · Solo el admin:** manejar usuarios, ver «Quién hizo qué», borrar del historial, ajustes de la hoja para todos | JX escogió las 4 opciones. Recepción: sube, corrige, agrega, quita, imprime, ve el historial. |
| **v1.3 · Se borra solo a los 30 días** (listados y actividad; `GUARDAR_DIAS` en la función) | JX: «30 días (Recomendado)». Son nombres de huéspedes (Ley 1581 de 2012). |
| **v1.3 · Publicación por GitHub** (no arrastrar) | Cloudflare no compila `functions/` arrastrando la carpeta. El proyecto ya estaba conectado a GitHub (respuesta de JX). |
| **v1.3 · Primero en el equipo, luego la nube** (sin señal sigue funcionando; sube al volver) | Lección del Manual de turnos: en recepción se cae el internet. |
| **v1.3 · Dos equipos a la vez → se mezclan** (versión `v` por listado; por reserva gana el cambio más nuevo `tf`; las borradas a mano van en `borradas`) | Varios compañeros bajan y corrigen el Excel el mismo día. La nube responde 200 `{cambio:true, listado}` (no 409) para no ensuciar la consola. |
| **v1.3 · Primer admin con `CLAVE_INICIAL`** (secreto de Cloudflare); rescate con `RESCATE_ADMIN` | Sin usuarios no hay quién cree al primero; la clave no queda en el código (el repo es público). |
| **v1.3 · Sin nube aquí = como antes** (local, doble clic, `python -m http.server`, Cloudflare sin la base) | No romper el uso diario mientras JX activa la base. En `localhost` no se pregunta por la nube (sin 404 en consola) salvo en el puerto **8788** (`wrangler pages dev`). |
| **v1.3 · Al salir se borra el historial del equipo** | El equipo puede ser compartido; los datos siguen en la nube. |
| **v1.3 · Pantalla de carga de 2,5 s pareja** | JX, con el video del Manual de turnos. |

## 🗂️ ÍNDICE DE ZONAS EDITABLES

| Zona (archivo → lugar) | Qué contiene | Se repite en |
|---|---|---|
| `js/hoja.js → TEXTOS` | título, subtítulo, «Fecha: », títulos de columnas (incl. `LLEGÓ`), textos de los totales, pie, «Pág. », texto de hoja vacía | — |
| `js/hoja.js → COLOR, M, DENSIDADES, COLUMNAS_*, PADDING` | colores y medidas de la hoja (ver ficha) | — |
| `js/listado.js → COLUMNAS / NOMBRE_COLUMNA` | nombres aceptados de cada columna (sin tildes ni espacios) y cómo se nombran en el error | mensaje `sin-columnas` de `app.js` |
| `js/listado.js → INICIO_ESTADO, clasificarEstado, TEXTO_PRE` | cómo se lee el estado del preregistro y cómo se escribe en la hoja | `#r-pre` (opciones) en `index.html` |
| `js/listado.js → DICCIONARIO` | apellidos y palabras con tilde/Ñ para sugerir correcciones | — |
| `js/app.js → ERRORES` | mensajes de archivos que no sirven | — |
| `js/app.js → MAX_HISTORIAL (30)`, `ajustes` por defecto `{tema:'auto', casilla:false, apretar:true}` | historial y ajustes | texto de `#historial-nota-texto` (lo pone app.js) |
| `js/app.js → etapas()` | tiempos y mensajes de la pantalla de carga al leer el Excel | `data-mensajes` del cargador en `index.html` |
| `js/app.js → CARGA_TOTAL_MS (2500)` | duración de la pantalla de carga al abrir y al leer el Excel | el `/ 25` del `<script>` de la rampa en `index.html` (2500 / 100) |
| `js/app.js → NUBE_SUBIR_MS, NUBE_REINTENTO_MS, NUBE_TRAER_MS, NUBE_ESPERA_MAX_MS, TEXTO_NUBE` | cada cuánto sube / reintenta / trae de la nube y los textos del botón de la cuenta | — |
| `functions/api/[[ruta]].js → GUARDAR_DIAS (30), SESION_CORTA (14 h), SESION_LARGA (30 d), MAX_INTENTOS (5), ESPERA_INTENTOS (15 min)` | reglas de la nube | textos «30 días» en `index.html` (`.entrar__privacidad`) y README (el resto lo dice la nube con `guardarDias`) |
| `index.html` | ENCABEZADO (logo, h1, `#btn-tema`, Más ajustes: `#aj-casilla`, `#aj-apretar`) · SUBIR (`#zona-soltar`, `#input-excel`, `#subir-error`, `.pasos`) · RESUMEN (`#total-hab`, `#total-res`, `#resumen-origen`, `#fecha-hoja`, `#btn-fecha-hoy`, `#fecha-texto`, `#lista-avisos`, `#novedades…`) · REVISA LA LISTA (`#lista-reservas`, `#btn-agregar`, `#quitadas`, `#lista-quitadas`) · HOJA LISTA (`#hoja-ayuda`, `#hojas`) · HISTORIAL (`#lista-historial`, `#historial-nota`, `#btn-borrar-historial`) · PIE (notas + crédito exacto) · BARRA (`#btn-imprimir`, `#btn-pdf`, `#btn-compartir`) · DIÁLOGOS (`#dlg-reserva`: `#r-cod`, `#r-hab`, `#r-ag`, `#r-ti`, `#r-pre`, `#r-restaurar`, `#r-quitar`; `#dlg-confirmar`) · AVISO (`#aviso`). Cada bloque tiene su comentario «Qué es / Depende de». | — |

**Datos que se repiten en el código:** la **versión** (`v1.N` + fecha y hora) en `index.html → .encabezado__version`, `README.md → Versiones` y este archivo; el nombre «Editador de reservas DP» en `index.html` (`<title>`, `h1`, `data-etiqueta` del cargador) y `hoja.js` (metadatos del PDF); el modo noche automático (18:00–6:00) está en `js/tema.js` **y** en `app.js → temaEfectivo()`; los colores de `theme-color` (#FBF8F1 / #16120C) en `index.html`, `tema.js` y `app.js → aplicarTema()`; el prefijo `reservas-dp-bg:` en `tema.js` y `app.js`; los «30 días» de la nube en la función (`GUARDAR_DIAS`), `index.html` (`.entrar__privacidad`) y el README; el encabezado `X-Editador: 1` en la función y en `app.js → pedir()`; «Hotel Dorado Plaza Bocagrande» en `hoja.js` (subtítulo y pie), `app.js → tituloHoja()` (título del PDF) e `index.html` (título y textos). Si cambia uno, cambiar todos.

## 🧭 MAPA DEL CÓDIGO

### `sitio/index.html`
Una sola página; en el `<head>`: privacidad (robots/referrer), íconos, `preload` de Karla, `cargador-dorado.min.css`, `estilos.css` y `tema.js` (síncrono). Primer elemento del `<body>`: el cargador con `data-fondo="vidrio" data-auto="inicio" data-inicio="siempre" data-minimo="1500" data-etiqueta="Listado de reservas DP"`. Al final, con `defer` y en este orden: `logo-vector.js`, `lector-excel.js`, `listado.js`, `hoja.js`, `app.js`. Resumen, lista, hoja y barra empiezan `hidden` y aparecen con la clase `html.hay-hoja`.

### `sitio/css/estilos.css` (18 secciones, índice al inicio)
1 variables, temas y letras (Karla y «Hoja Sans»; `--abajo`, `--izq`, `--der` = áreas seguras) · 2 base (el fondo marfil va en `body::before` fijo, NO con `background-attachment: fixed`) · 3 encabezado y ajustes · 4 secciones y tarjetas · 5 campos · 6 botones · 7 subir el Excel (+ velo «Suelta el Excel…» al arrastrar: `html.arrastrando`) · 8 resumen, avisos y novedades · 9 lista de reservas · 10 hoja (papel blanco siempre) · 11 historial · 12 pie y crédito JX (formato exacto) · 13 barra de acciones (columnas `auto` para que ningún botón corte su texto) · 14 diálogos y aviso · 15 cargador en modo noche · 16 pantallas (440: «Descargar PDF» completo; 520, 760, 1000, 1440; ≤ 380; **bajitas**: `max-height: 640px` → Guardar/Cancelar del diálogo pegados abajo (sticky); `max-height: 500px` acostado → barra de 62 px y logo de 180 px) · 17 accesibilidad y movimiento reducido · 18 **impresión** (`@page letter, margin 0`; solo se imprime `#hojas`, cada página 8.5 × 11 in; `body::before` escondido).

### `sitio/js/tema.js`
Lee `reservas-dp-bg:ajustes.tema` y pone `data-tema` + `theme-color` antes de pintar (sin destello blanco de noche).

### `sitio/js/lector-excel.js` → `window.LectorExcel`
Lee el .xlsx **sin librerías** (un .xlsx es un ZIP con XML): 1 errores con código (`vacio`, `xls-viejo` para .xls/OLE o con clave, `no-xlsx`, `danado`, `muy-grande`, `sin-hojas`) · 2 ZIP (directorio central) · 3 INFLATE RFC 1951 (guardado, Huffman fijo y dinámico) · 4 CRC-32 · 5 XML con `DOMParser` (libro, `sharedStrings`, `inlineStr`, números, booleanos, `_xHHHH_`) · 6 `leer(arrayBuffer) → { hojas: [{ nombre, oculta, filas }] }`.

### `sitio/js/listado.js` → `window.ReglasListado` (también `module.exports` para pruebas en Node)
1 textos y tildes dañadas (`repararTildes`: UTF-8 leído como Windows-1252; `pareceDanado`; `sugerencias`/`aplicarSugerencias` con `DICCIONARIO`, respeta mayúsculas/minúsculas; `limpiar`) · 2 columnas por nombre (`ubicarColumnas`, primeras 40 filas, todas las hojas; columnas de check-in solo para avisos) · 3 la celda «Nro reserva» (`partirReserva`, `clasificarEstado`, `TEXTO_PRE`, `textoPre`) · 4 `armar(libro)` → `{ filas, filasExcel, sinCodigo, checkin }` (agrupa por código en mayúsculas, máx. hab, variantes `varAg/varTi`, copia `base` para restaurar y comparar; `numeroHab`, `fechaDe` con fechas seriales de Excel) · 5 consultas (`visibles` ordenadas, `totales`, `editada`, `avisos`, `dudosa`, `esDP`, `llave`, `filaManual`) · 6 `fusionar(nuevas, previas, hora)` → novedades (nueva / cambio / ya no está; conserva correcciones, agregadas y quitadas; el preregistro solo se compara si los dos Excel lo traen).

### `sitio/js/hoja.js` → `window.Hoja`
1 textos y medidas (zona editable) · 2 anchos de Helvetica/Helvetica-Bold (tablas de métricas, WinAnsi 32–255) · 3 `imprimible` (lo que no existe en WinAnsi pasa a su letra base o «?», igual en pantalla y en el PDF) y `renglones` (nunca recorta: baja de renglón; códigos largos achican la letra hasta 8 pt y luego bajan) · 4 `maquetar(datos)` → órdenes de dibujo (`rect`, `linea`, `txt`, `logo`) por página; prueba las densidades (solo la amplia si `apretar === false`) y se queda con la que da menos páginas; encabezado solo en la página 1, banda en todas, totales en la última · 5 `svg(maqueta, n)` (vista previa e impresora, letra «Hoja Sans») · 6 `pdf(maqueta, {titulo, creado})` → PDF 1.4 escrito a mano (Helvetica sin incrustar, escapes octales, logo como Form XObject con degradados axiales, tabla xref, `/ID`, `/Info`, fecha en hora de Colombia) · `nombreArchivo('2026-11-17')` → `Reservas_DP_17-11-2026.pdf`.

### `sitio/js/logo-vector.js` → `window.LogoDoradoVector` (GENERADO, no editar a mano)
El logo de la hoja en vectores (`ancho 997.8`, `alto 730.1`, `remolino` con degradado `#F4D28B → #E0BA6B → #BB954A`, `letras` en `#A87B3F`, rayitas `#CEA860`), solo con órdenes absolutas M/L/C/Z. Se generó con el script del **Anexo** (al final de este archivo) a partir de la geometría `var GEO` de `js/cargador-dorado.js` (la del logo «RECEPCIÓN · HOTEL DORADO PLAZA · BOCAGRANDE»): `node construir_logo.js sitio/js/cargador-dorado.js sitio/js/logo-vector.js [prueba.svg]`.

### `functions/api/[[ruta]].js` — LA NUBE (v1.3, fuera de `sitio/`)
Pages Function que atiende todo `/api/*` (`[[ruta]]` = cualquier ruta). Necesita la vinculación D1 `DB` y el secreto `CLAVE_INICIAL` (8+); sin eso → 503 `{error:'sin-configurar', falta}`. Crea sus tablas sola (`usuarios`, `sesiones`, `listados`, `actividad`, `ajustes`, `intentos`) y borra lo vencido a lo sumo una vez por hora (`limpiarVencido`: listados por `creado` y actividad de más de 30 días, sesiones vencidas). Rutas: `GET yo` (200 también sin sesión: `{usuario:null, primera}`), `POST entrar` (primera vez: el primer usuario con `CLAVE_INICIAL` queda admin con `cambiar=1`; rescate `RESCATE_ADMIN`; 5 malos → 429 15 min; 600 ms de freno), `POST salir`, `POST clave`, `GET listados?desde=t` (incluye borrados para que los equipos los quiten), `PUT listados/:id {datos, base, reemplaza, actividad}` (control de versión: `base ≠ v` → 200 `{cambio:true, listado}`; borrado → 410), `DELETE listados[/:id]` (admin), `POST/GET actividad` (GET admin), `GET/POST usuarios`, `PATCH usuarios/:id` (admin; nunca deja sin admin activo; no se quita el admin a sí mismo), `PUT ajustes` (admin). Todo lo que no es GET exige `X-Editador: 1`. Cookie `dp_sesion` (HttpOnly, Secure, SameSite=Strict); en la base solo la huella SHA-256 del token. Contraseñas: PBKDF2-SHA256, 100.000 vueltas (máximo de Workers), sal de 16 bytes.

### `sitio/js/app.js` (un IIFE, 13 módulos en orden)
1. **Utilidades:** `$`, `esc` (todo lo del Excel o de la persona pasa por aquí), `plural`, `lista`.
2. **Almacén:** `leer`/`guardar(k, v, silencio)` con prefijo `reservas-dp-bg:` y respaldo en memoria; `almacenOk`; `avisarNoGuarda` (una vez); si el almacén se llena, `guardarListados` suelta los listados más viejos (nunca el de pantalla).
3. **Fechas (Colombia, UTC−5):** `diaDe`, `hoyISO`, `fechaTexto` (DD/MM/AAAA), `fechaLarga` («martes 17 de noviembre de 2026»), `fechaCorta`, `horaDe`, `cuando`.
4. **Estado:** `ajustes`, saneadores `filaSana`/`listadoSano` (un dato viejo nunca rompe la página), `listados` (máx. 30), `actual`, `maqueta`, `tocar()`.
5. **Subir y leer:** `procesar(archivo)` (máx. 25 MB) → `Lector.leer` → `Reglas.armar` → `etapas()` (mensajes del cargador: «Leyendo el Excel…», «Dejando solo reserva, habitaciones, agencia y titular…», «Uniendo las habitaciones de cada reserva…», «Armando la hoja…») → `cargarListado` (`esElMismo` + `Reglas.fusionar`; respeta una fecha cambiada a mano); errores en `#subir-error`; arrastrar y soltar en toda la página.
6. **Pintar:** `pintarTodo`, `pintarResumen`, `pintarAvisos` (fecha ≠ check-in con botón «Usar…», sin número, letras dañadas con «Corregir las sugeridas», no DP, otro estado, variantes, tildes arregladas, filas sin código, «no deja guardar», «Todo en orden»), `pintarNovedades`, `pintarLista` (botones con nombre completo para lector de pantalla), `pintarHoja`.
7. **Corregir / agregar / quitar:** `abrirEditor` (con mouse el cursor va al campo; en pantallas táctiles — `(pointer: coarse), (hover: none)` — al título, para que no salte el teclado), `pintarSugerencias` («Usar: …»), `guardarEditor` (código único, hab 1–999), restaurar, quitar/borrar, acciones `data-accion` (devolver, aplicar-sugerencias, fecha-checkin, volver-a-agregar), fecha y «Hoy».
8. **Salida:** imprimir (`beforeprint` pone el título `Reservas_DP_DD-MM-AAAA` para «Guardar como PDF»), `hacerPdf`, `descargar`, compartir (`navigator.canShare({files})`; si no, descarga y avisa).
9. **Historial:** `pintarHistorial`, abrir, borrar, borrar todo (con confirmación).
10. **Tema y ajustes:** `temaEfectivo`, `aplicarTema`, casilla «Llegó», «Ahorrar papel», cerrar «Más ajustes» al tocar fuera / Escape.
11. **Confirmar y aviso:** `confirmar()` con `<dialog>`, `aviso()` flotante.
12. **Arranque:** `iniciar()` → eventos, recupera el listado de hoy, `iniciarNube()` y `DoradoLoader.seguir([nube, letras de la hoja, document.fonts.ready, 2,5 s])` con la rampa pareja (`rampaCarga`) para que la pantalla de carga se vaya cuando todo está listo.
13. **Nube y cuenta (v1.3):** `pedir()` (fetch con 9 s máximo; falla con `{tipo, estado, datos}`; respuesta no-JSON = aquí no hay nube) · `esLocal()` · `iniciarNube()` (sin nube → modo local; sin sesión → `pedirEntrar()`; sin señal pero con usuario guardado → sigue en el equipo) · `entrar()` / `salir()` (`olvidarEquipo()` borra el historial local) · `nubeCambio(listado, que, reemplazaId)` (lo llaman `tocar(que)` y `cargarListado`) · `nubeAnotar()` (imprimir/PDF/compartir) · `subirNube()` / `subirUno()` (PUT por listado, mezcla con `mezclar()` si otro equipo lo cambió, 410 → lo quita) · `bajarNube(completo)` / `aplicarRemotos()` (si el listado en pantalla fue reemplazado por un Excel más nuevo de un compañero, pone el más nuevo de hoy; al entrar sube lo hecho sin nube en ese equipo) · `aplicarAjustesHoja()` / `nubeAjustesHoja()` · `pintarNube()` (botón de cuenta, permisos, textos de privacidad) · «Mi cuenta» (`abrirCuenta(obligada)`, `cambiarMiClave()`) · Administración (`cargarAdmin`, `pintarUsuarios`, `pintarActividad`, `abrirUsuario(nuevo|clave|nombre)`, `cambiarUsuario`) · `eventosNube()` (traer cada 45 s, al volver a la pestaña y con `online`). En cada listado se guardan además `autor`, `borradas`, `tFecha` y en cada fila `tf` (hora del último cambio). `tocar(que)` y `marcar(fila)` son los puntos donde se anota cada cambio.

**Claves de `localStorage`:** `reservas-dp-bg:ajustes`, `reservas-dp-bg:listados`, `reservas-dp-bg:actual` + (v1.3) `nube-usuario`, `nube-vers`, `nube-pend`, `nube-acciones`, `nube-reemplaza`, `nube-sueltas`, `nube-desde`, `nube-ultima` (todas con el prefijo). Cookie de la nube: `dp_sesion` (HttpOnly: JS no la ve). La pantalla de carga usa `sessionStorage` (`dorado-loader:*`).

### Pantalla de carga y logo (`sitio/js/cargador-dorado(.min).js`, `sitio/css/cargador-dorado(.min).css`, `sitio/img/`)
Copiados tal cual del Manual de turnos (generados con las herramientas de `fuente/cargador/` del proyecto Web Check-in). API usada: `DoradoLoader.mostrar({motivo, mensaje})`, `progreso(n)`, `mensaje(t)`, `ocultar({motivo, salida:'cancelada'})`, `seguir([promesas], {mensaje})`, `estaVisible()`; evento `dorado-loader:ocultar`. Los `.js`/`.css` legibles se dejan junto a los `.min` como referencia.

### Pruebas hechas (2026-11-17, Chromium + Playwright, servidor local sobre `sitio/`)
- **Reglas (Node, 103 comprobaciones, 0 fallos):** Excel real del 16-11 (10 reservas / 21 hab, orden, variantes), celdas de preregistro (incompleto, completo, web check-in, pegados, solo código), códigos sin número, columnas desordenadas, tildes dañadas y sugerencias, novedades.
- **Lector:** 7.100 casos de inflate correctos y 409 archivos dañados controlados (sin cuelgues).
- **Página (25 + 87 comprobaciones, 0 fallos):** el Excel del 17-11 completo, el de 4 columnas solo con código y el de 4 columnas con estado dan **23 reservas / 37 habitaciones, mismo orden que el PDF de JX y las mismas 18 reservas en la página 1**; PDF válido (`qpdf --check`), carta, 2 páginas, nombre `Reservas_DP_17-11-2026.pdf`; impresión (solo la hoja, 2 páginas carta); compartir sin soporte → descarga; corregir, restaurar, agregar, validar (código repetido, sin habitaciones), Escape, quitar y devolver; novedades (1 nueva, 2 cambiaron, 1 ya no está, se conservan corrección/agregada/quitada; «Agregarla a mano»); recargar; fecha (aviso y «Usar 17/11/2026», PDF con la fecha de la hoja); casilla «Llegó» (hoja y PDF); «Ahorrar papel» (20 reservas: 1 hoja / apagado 2); tema; historial (otro día = otro listado; abrir, borrar, cancelar, borrar todo); letras dañadas (3 avisadas, 2 sugeridas corregidas respetando minúsculas, `MUÃ‘OZ` arreglada sola), código BK…, estado «En revisión»; 7 archivos malos (vacío, .xls, no es Excel, cortado, dañado, sin columnas, solo títulos) sin dañar el listado; columnas desordenadas; arrastrar y soltar; almacenamiento bloqueado; celular 360 × 740 táctil (diálogo cabe, botones ≥ 44 px).
- **Excel grande:** 214 reservas / 421 filas en ~4 s (con la pantalla de carga), 10 páginas, PDF válido; `&`, `<`, comillas, paréntesis y `\` bien escapados; letras fuera de WinAnsi → letra base o «?».
- **Responsive:** 300, 320, 340, 360, 381, 420, 439, 440, 480, 600, 759, 760, 768, 1280 y 1920 px en claro y noche: sin scroll horizontal, sin textos cortados en la barra, sin errores de consola.
- **Accesibilidad (axe-core 4.10, WCAG 2.2 AA + buenas prácticas):** 0 problemas en claro y noche, con y sin Excel, con «Más ajustes» abierto y con el diálogo abierto. **HTML (html-validate 8):** sin errores (regla `no-redundant-for` apagada a propósito: etiquetas con `for` y campo adentro, más compatibles con lectores viejos).
- Abierta con doble clic (`file://`): funciona todo (Excel, hoja, PDF); solo el `preload` de Karla da un aviso de CORS en la consola.
- Los scripts de prueba no se entregan (regla de archivos de JX). Para repetirlas: servir `sitio/` con `python3 -m http.server`, Playwright + los Excel de ejemplo de JX.

### Pruebas de la sesión 2 (2026-11-17, Chromium + Playwright 1.63, `python3 -m http.server`)
- **Pantallas (claro y noche):** PC 1024×768, 1280×720, 1366×768, 1536×864, 1920×1080, 2560×1440 · iPad Mini · Galaxy S9+ (320) · Pixel 7 · iPhone SE · iPhone 13 · iPhone 15 Pro Max · iPhone 13 y Pixel 7 acostados · plegable 280 px. En todas: sin scroll horizontal, nada se sale, la barra no tapa el pie, el diálogo cabe (acostado: Guardar/Cancelar visibles sin scroll), 0 errores ni advertencias en consola. Con 8, 23 y 60 reservas.
- **Funciones (28/28):** «Más ajustes» no mueve los botones, se cierra fuera/Escape y no al tocar dentro · 2 archivos malos con su mensaje · 23 reservas / 42 hab en 2 hojas · «Corregir la sugerida» · agregar · código repetido · corregir y «Volver a lo del Excel» · quitar y devolver · PDF `Reservas_DP_17-11-2026.pdf` · impresión: solo la hoja, 2 páginas carta, sin el fondo · novedades con un segundo Excel (conserva la agregada) · Excel del 18 → «Usar 18/11/2026» · historial (2 listados, abrir) · recargar · 60 reservas en 3 hojas. ESLint en modo ES5: 0 errores.
- **No se pudo probar aquí:** Safari real de iPhone (solo hay Chromium; se emularon los tamaños) ni el «notch» real (`env(safe-area-inset-*)` vale 0 en Chromium). Si JX ve algo raro en su iPhone, pedirle captura.

### Pruebas de la sesión 3 · v1.3 nube (2026-11-17, Chromium + Playwright 1.63 + `wrangler pages dev` 4.164 con D1 local)
- **Función (curl):** primera vez con `CLAVE_INICIAL` → admin con `cambiar`; clave mala 401; crear usuario; versión (`base` vieja → cambio); recepción no ve actividad ni borra (403 `admin`); no desactivarse a sí mismo; sin `X-Editador` → 403; sin sesión → 401.
- **Dos equipos (PC 1366 del admin + iPhone 13 de «Ana»), 28/28:** carga ~2,5 s · sin entrar solo la puerta · primera vez · clave mala · contraseña obligada (Escape no cierra) · crear usuario (repetido avisa) · Excel → nube «por Jx» · Ana ve el listado, sin Administración, sin borrar, ajustes bloqueados · los dos corrigen a la vez → **los dos cambios en los dos** · casilla del admin llega al iPhone · «Quién hizo qué» con Excel, corrección y PDF · Excel nuevo de Ana reemplaza al anterior en el PC · Ana desactivada → su iPhone vuelve a la puerta y no entra · admin borra · recargar sigue dentro · salir deja el equipo limpio y al volver a entrar todo vuelve. Consola limpia (solo los 401/409 provocados a propósito: clave mala y usuario repetido).
- **Sin señal (3/3):** corregir sin internet → «Sin señal», el cambio queda en el equipo, sobrevive la recarga y al volver la señal se sube (otro equipo lo ve).
- **Sin nube (`python -m http.server`), 28/28:** todo lo de siempre igual que v1.1, sin pedir usuario y sin errores en consola.
- **Responsive de lo nuevo** (puerta, dentro, Mi cuenta, Administración, Nuevo usuario) en PC 1366/1920, Galaxy S9+ 320, iPhone SE, iPhone 13, iPhone 13 acostado y plegable 280, en claro y noche: sin scroll de lado, diálogos dentro de la pantalla, 0 errores. + las 15 pantallas de la sesión 2 otra vez: bien.
- **axe-core 4.10 (WCAG 2.2 AA + buenas prácticas):** 0 problemas (puerta, dentro con Administración, Mi cuenta, Nuevo usuario; 1366 y 360; claro y noche) después de arreglar el contraste del número de versión y de los usuarios desactivados. **html-validate 8:** sin errores. ESLint ES5: sin errores de sintaxis.
- **No probado aquí:** la base D1 real en Cloudflare (falta que JX la cree) ni Safari real. Cuando JX active la nube: abrir `/api/yo`, entrar, subir un Excel en el PC y verlo en el celular.
- **Cómo repetirlas:** `npx wrangler pages dev sitio --port 8788 --d1 DB=editador-local --binding CLAVE_INICIAL=… --persist-to <scratchpad>` desde la raíz del repo (si se corre desde otra carpeta no encuentra `functions/` y `/api/*` devuelve la página) + Playwright con dos contextos.

### Auditoría de 24 puntos (skill de JX) — herramienta interna privada
✅ 2 HTML real (la estructura está en el HTML; lo del Excel lo pinta JS porque sale del archivo) · ✅ 4 `<title>` real · ✅ 5 un solo HTML · ✅ 9–10 un `<h1>` · ✅ 14 favicon + apple-touch-icon + theme-color · ✅ 16 `lang="es"`, charset, viewport · ✅ 17 `alt` en el logo · ✅ 18 sin `.map`, `.env` ni carpetas de build · ✅ 19 cero errores y advertencias en consola (servido por http) · ✅ 20 sin frameworks, WebP, `fetchpriority` en el logo, `defer`, fuentes locales · ✅ 23 sin panel (opción c): zonas editables documentadas aquí y en el README · ✅ 24 código sin minificar (el cargador trae su versión legible), propiedad en el README.
➖ No aplican por la regla de privacidad de JX (herramienta interna que no debe aparecer en Google): 1 dominio propio (va en `*.pages.dev`), 3 `404.html`, 6 description, 7 Open Graph, 8 JSON-LD, 11 canonical, 12 `llms.txt`, 13 `robots.txt`, 15 sitemap, 21 páginas legales y cookies (no hay cookies, analítica ni datos que salgan del equipo), 22 Google Analytics.

## `{POR CONFIRMAR}` pendientes

0. **(v1.3) Activar la nube en Cloudflare** (lo hace JX: D1 `editador-reservas-db` + vinculación `DB` + secreto `CLAVE_INICIAL` + Reintentar implementación; README §10). Y **que el hotel esté de acuerdo** con guardar 30 días en Cloudflare los nombres de los titulares (Ley 1581 de 2012; no es asesoría legal).

1. **Nombre oficial de los estados del preregistro** en el hotel: hoy «Preregistro (…) ✔ Completo» sale «Con preregistro» y «Web check-in ✔ Completo» sale «Web check-in completo». Confirmar con JX que así le sirven (se cambian en `listado.js → TEXTO_PRE`).
2. **Otras sedes** (logo, nombre, subtítulo y pie de la hoja): hoy solo Bocagrande.
3. **Foto del 16-11:** trae 12 reservas / 23 hab; el Excel del 16-11 que mandó JX da 10 / 21 (DP130033 y DP127613 no vienen en ese archivo, y el orden de DP130280/DP125379 difiere). Lo más probable: la foto salió de otra descarga. Con el Excel del 17-11 todo coincide exacto con su PDF.

## Fuentes
(v1.3) Cloudflare D1 (límites gratis: 5 M lecturas y 100.000 escrituras por día, 5 GB; desde el 1-sep-2026 se cortan al pasarse): https://developers.cloudflare.com/d1/platform/pricing/ · https://developers.cloudflare.com/changelog/post/2026-09-01-d1-free-tier-limit-enforcement/ · Pages Functions (arrastrando la carpeta no se compila `functions/`; con Git sí): https://developers.cloudflare.com/pages/get-started/direct-upload/ · https://developers.cloudflare.com/pages/platform/known-issues/ · Cloudflare Access gratis < 50 usuarios (opción descartada por JX): https://www.cloudflare.com/en-gb/products/zero-trust/access · Ley 1581 de 2012: https://www.unidadvictimas.gov.co/wp-content/uploads/Documentos/ley/Ley_1581_2012.pdf · SIC, nube = encargado: https://sedeelectronica.sic.gov.co/sites/default/files/normatividad/Concepto_14-76566.pdf · Referencia de la nube y de la pantalla de carga: repo `jxenterprise/Turnos_recepcion_del_Hotel_Dorado_BG` (`functions/api/datos.js`, `sitio/index.html`, `app.js → CARGA_TOTAL_MS`).
`background-attachment: fixed` en iOS (soporte parcial con fallas; se usa `::before` fijo): https://caniuse.com/mdn-css_properties_background-attachment_fixed · https://bugs.webkit.org/show_bug.cgi?id=275247 · Áreas seguras con `env(safe-area-inset-*)` y `viewport-fit=cover`: https://css-tricks.com/?p=260090 · https://web.dev/learn/design/screen-configurations · Cloudflare Pages · Git integration y Build configuration (root directory vacío = raíz del repo; output directory = carpeta que se publica): https://developers.cloudflare.com/pages/get-started/git-integration/ · https://developers.cloudflare.com/pages/configuration/build-configuration/ · Google · Bloquear la indexación con noindex: https://developers.google.com/search/docs/crawling-indexing/block-indexing · WebKit bug 251500 (compartir archivo + texto): https://bugs.webkit.org/show_bug.cgi?id=251500 · RFC 1951 (DEFLATE): https://www.rfc-editor.org/rfc/rfc1951 · ECMA-376 (Office Open XML): https://ecma-international.org/publications-and-standards/standards/ecma-376/ · Métricas de Helvetica: las AFM estándar de Adobe (vía ReportLab).

## Historial
- **2026-11-16 · base.** Preguntas a JX y respuestas; lector de Excel, reglas, hoja (SVG + PDF) y logo vectorial.
- **2026-11-17, 2:12 p. m. · v1.0.** (Subida a GitHub a las 2:12 p. m.) Hoja calcada del PDF de JX (`Reservas_DP_17-11-2026.pdf`); Excel completo y de 4 columnas; estados del preregistro de hoy (incluido «Web check-in completo»); casilla «Llegó» apagada por defecto; «Ahorrar papel»; botón «Usar fecha de llegada»; página probada completa (funciones, impresión, PDF, celular, accesibilidad); README y este archivo.
- **2026-11-17, 2:33 p. m. · v1.1 (sesión 2) · revisión de errores y responsive.** JX pidió «busca errores, el más mínimo, y responsive para Android e iPhone, prioridad PC». La hoja, las reglas y el PDF NO se tocaron.

  | Error corregido | Dónde | Arreglo |
  |---|---|---|
  | Al abrir «Más ajustes» los botones saltaban (en PC «Tema» se corría a la izquierda; en celular «Más ajustes» se bajaba de renglón bajo el dedo) | `estilos.css` §3, `app.js` §10 | Panel flotante centrado (`position:absolute`), se cierra tocando fuera o con Escape |
  | iPhone acostado: con `viewport-fit=cover` el contenido podía quedar debajo del «notch» | `estilos.css` §1, 3, 4, 12, 13, 16 | Márgenes laterales + `env(safe-area-inset-left/right)` |
  | Celular acostado e iPhone SE: Guardar/Cancelar del diálogo quedaban fuera de la vista | `estilos.css` §16 | Botones del diálogo pegados abajo (sticky) con ≤ 640 px de alto |
  | Celular acostado: la barra de abajo ocupaba ~22 % de la pantalla | `estilos.css` §16 | Barra de 62 px y logo más pequeño con ≤ 500 px de alto |
  | Fondo con `background-attachment: fixed`: tirones al hacer scroll en Android y degradado estirado en iPhone | `estilos.css` §2 y §18 | Fondo en `body::before` fijo (oculto al imprimir) |
  | `100dvh` sin respaldo (navegadores viejos ignoraban el alto máximo del diálogo) | `estilos.css` §14 | `max-height: calc(100vh - 24px)` antes del `dvh` |
  | Algunos celulares/tabletas no se detectaban como táctiles y el teclado saltaba al abrir el diálogo | `app.js` §7 | `(pointer: coarse), (hover: none)` |
  | «Corregir las sugeridas» no refrescaba el historial | `app.js` §7 | `pintarHistorial()` |
- **2026-11-17, 2:40 p. m.** · Carpeta local de la PC de JX conectada a GitHub (rama `main`, push con la cuenta `jxenterprise`).
- **2026-11-17, 2:57 p. m. · v1.2 · nombre, versión y publicación.** Pedidos de JX: «no es listado, es editador de reservas por DP», versiones v1.0, v1.1, v1.2… debajo del logo, `CLAUDE.md` fuera de la web y README mucho mejor.
  - La página se llama **«Editador de reservas DP»** (`<title>`, `h1`, cargador y metadatos del PDF). La hoja impresa sigue «LISTADO DE RESERVAS».
  - **Pastilla de versión bajo el logo** (`.encabezado__version` en `estilos.css` §3): «v1.2 · actualizado el 17 nov 2026, 2:57 p. m.».
  - **README reescrito**: tabla antes/después, enlace a la página, publicación conectada a GitHub con `Build output directory = sitio`, trabajo en PC y nube y tabla de versiones.
  - Cloudflare: JX corrigió la configuración (ver «Publicada» arriba).
  - **Probado con el motor de Safari (WebKit) por primera vez**, en la PC de JX: iPhone SE, 13, 15 Pro Max y 13 acostado + Chromium (PC 1366, Pixel 7, Galaxy S9+, plegable 280): sin scroll de lado, sin errores, la versión y el título dentro de la pantalla. En la PC de JX hay navegadores de Playwright en `%LOCALAPPDATA%\ms-playwright`: `chromium-1243` va con `playwright@1.63.0` y `webkit-2215` con `playwright@1.56.1` (instalarlos en el scratchpad, nunca en el repo).
- **2026-11-17, 3:46 p. m. · v1.3 · nube con usuarios + pantalla de carga de turnos (sesión 3).** JX mandó un video de su Manual de turnos: «me gusta más el logo como se mueve… tiene 2,5 s… tiene una base de datos en la nube para abrirla en demás dispositivos… que solo entremos los recepcionistas, con admin y usuario». Se revisó el repo de turnos (D1 + una sola `CLAVE`) y se le preguntó a JX (AskUserQuestion): usuario por persona · admin con las 4 facultades · 30 días · ya conectado a GitHub.
  - Nuevo: `functions/api/[[ruta]].js`; en `index.html` la puerta `#entrar`, `#btn-cuenta`, `#dlg-cuenta`, `#admin`, `#dlg-usuario`, `#aj-nota-admin`, `#pie-privacidad` y la rampa de la pantalla de carga; en `estilos.css` §14b; en `app.js` el módulo 13 y los ganchos `tocar(que)` / `marcar(fila)` / `nubeCambio` / `nubeAnotar` / `nubeBorrar` / `nubeAjustesHoja`.
  - Historial: con la nube es de todos los equipos (hasta 90 listados en el equipo; la nube guarda 30 días), «subido por», solo el admin borra.
  - Accesibilidad: el número de versión (de la v1.2) no daba contraste AA en claro → `--texto-fuerte` en claro.
  - Falta: que JX active la base en Cloudflare (ver «Por dónde vamos»).
  - Publicada en Cloudflare y verificada: la página dice v1.3 y `/api/yo` responde `{"error":"sin-configurar","falta":["DB","CLAVE_INICIAL"]}` (con **200**, para que la consola quede limpia en cada visita mientras no esté la base; las demás rutas, 503) → la página trabaja sola en cada equipo, sin pedir usuario, hasta que JX active la base.

---

## Anexo · `construir_logo.js` (genera `sitio/js/logo-vector.js`)

```js
#!/usr/bin/env node
/* Genera sitio/js/logo-vector.js a partir de la geometría del logo que ya trae
 * la pantalla de carga del Manual de turnos (RECEPCIÓN · HOTEL DORADO PLAZA · BOCAGRANDE).
 * Uso:  node construir_logo.js <cargador-dorado.js> <salida logo-vector.js> [svg de prueba]
 * Resultado: el logo completo «aplanado» (sin transformaciones, sin <use>), con
 * solo órdenes absolutas M / L / C / Z, para poder dibujarlo igual en SVG y en el PDF. */
const fs = require('fs');
const [, , rutaCargador, rutaSalida, rutaSvg] = process.argv;
const fuente = fs.readFileSync(rutaCargador, 'utf8');
const ini = fuente.indexOf('var GEO = {');
const fin = fuente.indexOf('\n  };', ini);
if (ini < 0 || fin < 0) { throw new Error('No encontré la geometría (var GEO) en el cargador'); }
const GEO = new Function('return ' + fuente.slice(ini + 'var GEO = '.length, fin + 4))();
const R = GEO.remolino, M = GEO.marca;

/* lector de trazados SVG → órdenes absolutas M/L/C/Z */
function absolutizar(d) {
  const fichas = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g) || [];
  let i = 0, cmd = '', x = 0, y = 0, x0 = 0, y0 = 0, pcx = null, pcy = null, pqx = null, pqy = null;
  const sal = [];
  const n = () => parseFloat(fichas[i++]);
  const esNum = () => i < fichas.length && !/^[a-zA-Z]$/.test(fichas[i]);
  while (i < fichas.length) {
    if (/^[a-zA-Z]$/.test(fichas[i])) { cmd = fichas[i++]; }
    const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase();
    if (C === 'Z') { sal.push(['Z']); x = x0; y = y0; pcx = pqx = null; continue; }
    if (!esNum()) { throw new Error('Trazado inválido cerca de ' + cmd); }
    if (C === 'M') {
      let px = n(), py = n(); if (rel) { px += x; py += y; }
      sal.push(['M', px, py]); x = x0 = px; y = y0 = py; cmd = rel ? 'l' : 'L'; pcx = pqx = null;
    } else if (C === 'L') {
      let px = n(), py = n(); if (rel) { px += x; py += y; }
      sal.push(['L', px, py]); x = px; y = py; pcx = pqx = null;
    } else if (C === 'H') { let px = n(); if (rel) { px += x; } sal.push(['L', px, y]); x = px; pcx = pqx = null;
    } else if (C === 'V') { let py = n(); if (rel) { py += y; } sal.push(['L', x, py]); y = py; pcx = pqx = null;
    } else if (C === 'C') {
      let a = n(), b = n(), c = n(), d2 = n(), e = n(), f = n();
      if (rel) { a += x; b += y; c += x; d2 += y; e += x; f += y; }
      sal.push(['C', a, b, c, d2, e, f]); pcx = c; pcy = d2; x = e; y = f; pqx = null;
    } else if (C === 'S') {
      let c = n(), d2 = n(), e = n(), f = n();
      if (rel) { c += x; d2 += y; e += x; f += y; }
      const a = pcx == null ? x : 2 * x - pcx, b = pcx == null ? y : 2 * y - pcy;
      sal.push(['C', a, b, c, d2, e, f]); pcx = c; pcy = d2; x = e; y = f; pqx = null;
    } else if (C === 'Q' || C === 'T') {
      let qx, qy;
      if (C === 'Q') { qx = n(); qy = n(); if (rel) { qx += x; qy += y; } }
      else { qx = pqx == null ? x : 2 * x - pqx; qy = pqx == null ? y : 2 * y - pqy; }
      let e = n(), f = n(); if (rel) { e += x; f += y; }
      sal.push(['C', x + 2 / 3 * (qx - x), y + 2 / 3 * (qy - y), e + 2 / 3 * (qx - e), f + 2 / 3 * (qy - f), e, f]);
      pqx = qx; pqy = qy; x = e; y = f; pcx = null;
    } else { throw new Error('Orden de trazado no soportada: ' + cmd); }
  }
  return sal;
}
function transformar(ordenes, k, dx, dy) {
  return ordenes.map((o) => o.length === 1 ? o : [o[0]].concat(o.slice(1).map((v, j) => (j % 2 === 0 ? v * k + dx : v * k + dy))));
}
const r1 = (v) => { const s = (Math.round(v * 10) / 10).toFixed(1).replace(/\.0$/, ''); return s === '-0' ? '0' : s; };
function texto(ordenes) { return ordenes.map((o) => o[0] + o.slice(1).map(r1).join(' ')).join(''); }

/* composición: la misma del logo estático de las otras webs */
const W = M.vb[2];
const k = (W / 2.02) / R.vb[2];
const rx = (W - R.vb[2] * k) / 2;
const altoRem = R.vb[3] * k;
const my = altoRem + 0.22 * R.vb[2] * k;
const H = my + M.vb[3];
const remolino = texto(transformar(absolutizar(R.contorno), k, rx, 0));
const letras = M.letras.map((L) => {
  if (!M.glifos[L.g]) { throw new Error('Falta el glifo ' + L.g); }
  return texto(transformar(absolutizar(M.glifos[L.g]), 1, L.x, L.y + my));
}).join('');
const ln = M.lineas;
const lineaIzq = [ln.izqFin - ln.largo, my + ln.y - 1.6, ln.largo, 3.2].map((v) => Math.round(v * 10) / 10);
const lineaDer = [ln.derIni, my + ln.y - 1.6, ln.largo, 3.2].map((v) => Math.round(v * 10) / 10);
const dRem = { x1: rx + 8 * k, y1: 14 * k, x2: rx + 178 * k, y2: 166 * k };
for (const q in dRem) { dRem[q] = Math.round(dRem[q] * 10) / 10; }

// La salida es el archivo sitio/js/logo-vector.js tal como está hoy: su encabezado de comentarios y
// window.LogoDoradoVector = { ancho: r1(W), alto: r1(H), remolino, degRemolino: { …dRem, paradas: [[0,'#F4D28B'],[0.48,'#E0BA6B'],[1,'#BB954A']] },
//   letras, colorLetras: '#A87B3F', lineaIzq, lineaDer, colorLinea: '#CEA860' } (+ module.exports para Node).
// Copiar el encabezado y la forma del objeto del logo-vector.js actual al escribir la salida.
```

## 💡 Ideas pendientes de aprobar (propuestas a JX en las sesiones 2 y 3 — NO construir sin su «sí»)
(Sesión 3, nuevas) A. **Avisar en pantalla cuando un compañero cambia algo** («Ana corrigió DP130000 hace 1 min»). B. **Exportar «Quién hizo qué»** a PDF/CSV para el jefe de recepción. C. **Copia de seguridad** de la base D1 (D1 trae «Time Travel» para volver la base a un momento anterior: verificar cuántos días da el plan gratis antes de prometerlo). D. **Otras sedes** con la misma nube (una base por sede o una columna «sede»).

1. **Atajos de teclado en PC** (Ctrl+P ya imprime; agregar p. ej. Ctrl+S = descargar PDF, Ctrl+O = subir Excel).
2. **Buscador en «Revisa la lista»** (por código, agencia o titular) para listas largas en temporada alta.
3. **Resumen por agencia** en pantalla (cuántas reservas/habitaciones trae cada agencia), sin cambiar la hoja.
4. **Abrir sin internet (PWA con service worker)**: implica `sw.js` y `manifest`, que hoy no permite la regla de archivos → preguntar.
5. **Marcar llegadas en pantalla** (la casilla «Llegó» digital, guardada en el equipo) y ver «faltan N por llegar».
6. **Comparar con el día anterior** desde el historial.
7. **Exportar CSV** del listado limpio (las 4 columnas).
