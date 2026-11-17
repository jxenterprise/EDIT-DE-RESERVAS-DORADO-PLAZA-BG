# CLAUDE.md · Listado de reservas DP · Recepción · Hotel Dorado Plaza Bocagrande

Contexto para que cualquier chat futuro (de Claude u otra IA) retome este proyecto sin adivinar. **Se amplía, nunca se borra lo anterior.**

## De qué trata

- **Qué es:** herramienta interna de una sola página (HTML + CSS + JS, sin servidor ni librerías). Recepción sube el **Excel del día que descarga de la extranet** (`https://extranet.doradoplaza.com/extranet/`) y la página arma la hoja **«LISTADO DE RESERVAS»** tamaño carta, igual al PDF de referencia de JX (`Reservas_DP_17-11-2026.pdf`, hecho con ReportLab) y a su foto de la hoja del 16-11: logo dorado, título, «Códigos DP · Recepción Hotel Dorado Plaza Bocagrande», fecha, tabla de 4 columnas, totales y pie. Se imprime, se descarga en PDF o se comparte.
- **Para quién:** recepción del Hotel Dorado Plaza **Bocagrande** (Cartagena). JX («Bro jx») y sus compañeros: cada uno procesa el Excel en su propio equipo y lo que se comparte es el PDF.
- **Las 4 columnas (pedido literal de JX):** «solo manejamos Nro reserva, Nro hab, Agencia, Titular… la demás información sí se elimina». El resto de columnas del Excel se **ignora** (no se borra nada del archivo: simplemente no se usa). Sirve el Excel completo (17 columnas) **y** uno ya limpiado a mano de 4 columnas (fila 1 vacía, títulos en la fila 2): las columnas se buscan **por nombre**, no por posición.
- **La regla (JX: «Sí, así es»):** en el Excel cada fila es una habitación y la reserva se repite. Queda **una línea por reserva con su Nro hab más alto**; la agencia y el titular salen de **esa misma fila** (si dos filas empatan, gana la primera). Orden: más habitaciones primero; empates, en el orden del Excel. Nunca se borra ninguno de los 4 datos importantes.
- **Preregistro** (viene pegado en la celda «Nro reserva»; JX: «Dame lo mejor»): «… ⚠ Incompleto» o «Sin preregistro» → **Sin preregistro** · «Preregistro (…) ✔ Completo» o «Con preregistro» → **Con preregistro** · «Web check-in ✔ Completo» → **Web check-in completo** · cualquier otro estado → tal cual (limpio, máx. 40 letras) + aviso en pantalla. Sale en letra pequeña debajo del código, como en el PDF de JX.
- **Crédito:** `Diseño y desarrollo: JX Company` **solo en el pie de la web**, con el formato exacto (`.footer-dev`). **La hoja impresa NO lleva crédito.** Nunca «JX Studio».
- **Proyectos hermanos:** Web Check-in Dorado Plaza (sistema de diseño, letra Karla, pantalla de carga «Trazo de oro» v2.1 con fondo de vidrio) y Manual de turnos de recepción (estructura, `tema.js`, logo «RECEPCIÓN · HOTEL DORADO PLAZA · BOCAGRANDE», crédito). De ahí se copiaron el cargador, el logo WebP, los favicons y Karla.
- **Dónde se publica:** Cloudflare Pages, proyecto `reservas-dp-bg` → `https://reservas-dp-bg.pages.dev` {POR CONFIRMAR: la dirección exacta la asigna Cloudflare si el nombre está ocupado}. Se sube **solo la carpeta `sitio/`** (arrastrar y soltar).

## Reglas de trabajo con JX

- Tratarlo como **«Bro jx»**, en español informal.
- **Preguntar antes de construir** cualquier cosa nueva: todas las preguntas en una tanda, que se puedan seleccionar (AskUserQuestion), cada una con opciones, la recomendación de Claude («Dame lo mejor») y texto libre. Ante cualquier duda o cosa rara: preguntar, nunca improvisar.
- **Nunca inventar datos.** Lo que falte va `{POR CONFIRMAR}` y se lista aquí y en el README.
- Validar los datos con fuentes web actuales antes de afirmarlos.
- **Privacidad (regla de JX para sus herramientas internas):** `meta robots noindex, nofollow, noarchive, nosnippet, noimageindex` + `meta referrer no-referrer`; **sin** `robots.txt`, `sitemap.xml`, `llms.txt`, Open Graph, `description`, `canonical`, JSON-LD, `_headers`, `404.html`, páginas legales ni banner de cookies (no hay cookies ni analítica). No agregar nada de eso aunque el skill de landings lo pida.
- **Archivos:** solo html, css, js, img + `README.md` + `CLAUDE.md`. Los documentos van **fuera** de `sitio/` para que nunca se publiquen. Las pruebas no se entregan (ver «Pruebas hechas»).
- **El Excel se procesa solo en el navegador; nunca se sube a ningún servidor.** No agregar envíos a internet.
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
- **Espaciados:** márgenes laterales 16 px (12 px ≤ 380 px), tarjetas 16 px de relleno (20 px desde 520 px), ancho máximo del contenido 760 → 820 (≥ 1000 px) → 880 px (≥ 1440 px).
- **Patrones de componente:** `.tarjeta`; botones `.boton--primario` (degradado `--boton-oro`), `.boton--secundario`, `.boton-mini` (píldora 44 px), `.enlace` (`--peligro` en rojo); `.interruptor` (casillas de ajustes); `.soltar` (zona punteada dorada para el Excel; se compacta cuando ya hay hoja); `.resumen__total` (número grande + palabra); `.avisos li[data-tipo=bien|info|ojo]`; `.chip` (`--nueva`, `--cambio`, `--revisar`, `--mano`); `.reserva` (botón-tarjeta con círculo del número de habitaciones y borde izquierdo de color según la marca); `.hoja__pagina` (papel 612:792 con sombra); `.historial`; barra `.acciones` fija abajo (desde 760 px, flotante centrada); `<dialog class="dialogo">`; aviso flotante `.aviso` (`--alerta`); pantalla de carga «Trazo de oro» v2.1 (`data-fondo="vidrio"`), oscurecida en modo noche.

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
| ES5 (sin flechas, `let/const` ni `?.`), CSS con respaldos | Funciona en los computadores viejos de recepción. |

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
| `index.html` | ENCABEZADO (logo, h1, `#btn-tema`, Más ajustes: `#aj-casilla`, `#aj-apretar`) · SUBIR (`#zona-soltar`, `#input-excel`, `#subir-error`, `.pasos`) · RESUMEN (`#total-hab`, `#total-res`, `#resumen-origen`, `#fecha-hoja`, `#btn-fecha-hoy`, `#fecha-texto`, `#lista-avisos`, `#novedades…`) · REVISA LA LISTA (`#lista-reservas`, `#btn-agregar`, `#quitadas`, `#lista-quitadas`) · HOJA LISTA (`#hoja-ayuda`, `#hojas`) · HISTORIAL (`#lista-historial`, `#historial-nota`, `#btn-borrar-historial`) · PIE (notas + crédito exacto) · BARRA (`#btn-imprimir`, `#btn-pdf`, `#btn-compartir`) · DIÁLOGOS (`#dlg-reserva`: `#r-cod`, `#r-hab`, `#r-ag`, `#r-ti`, `#r-pre`, `#r-restaurar`, `#r-quitar`; `#dlg-confirmar`) · AVISO (`#aviso`). Cada bloque tiene su comentario «Qué es / Depende de». | — |

**Datos que se repiten en el código:** el modo noche automático (18:00–6:00) está en `js/tema.js` **y** en `app.js → temaEfectivo()`; los colores de `theme-color` (#FBF8F1 / #16120C) en `index.html`, `tema.js` y `app.js → aplicarTema()`; el prefijo `reservas-dp-bg:` en `tema.js` y `app.js`; «Hotel Dorado Plaza Bocagrande» en `hoja.js` (subtítulo y pie), `app.js → tituloHoja()` (título del PDF) e `index.html` (título y textos). Si cambia uno, cambiar todos.

## 🧭 MAPA DEL CÓDIGO

### `sitio/index.html`
Una sola página; en el `<head>`: privacidad (robots/referrer), íconos, `preload` de Karla, `cargador-dorado.min.css`, `estilos.css` y `tema.js` (síncrono). Primer elemento del `<body>`: el cargador con `data-fondo="vidrio" data-auto="inicio" data-inicio="siempre" data-minimo="1500" data-etiqueta="Listado de reservas DP"`. Al final, con `defer` y en este orden: `logo-vector.js`, `lector-excel.js`, `listado.js`, `hoja.js`, `app.js`. Resumen, lista, hoja y barra empiezan `hidden` y aparecen con la clase `html.hay-hoja`.

### `sitio/css/estilos.css` (18 secciones, índice al inicio)
1 variables, temas y letras (Karla y «Hoja Sans») · 2 base · 3 encabezado y ajustes · 4 secciones y tarjetas · 5 campos · 6 botones · 7 subir el Excel (+ velo «Suelta el Excel…» al arrastrar: `html.arrastrando`) · 8 resumen, avisos y novedades · 9 lista de reservas · 10 hoja (papel blanco siempre) · 11 historial · 12 pie y crédito JX (formato exacto) · 13 barra de acciones (columnas `auto` para que ningún botón corte su texto) · 14 diálogos y aviso · 15 cargador en modo noche · 16 pantallas (440: «Descargar PDF» completo; 520, 760, 1000, 1440; ≤ 380) · 17 accesibilidad y movimiento reducido · 18 **impresión** (`@page letter, margin 0`; solo se imprime `#hojas`, cada página 8.5 × 11 in).

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

### `sitio/js/app.js` (un IIFE, 12 módulos en orden)
1. **Utilidades:** `$`, `esc` (todo lo del Excel o de la persona pasa por aquí), `plural`, `lista`.
2. **Almacén:** `leer`/`guardar(k, v, silencio)` con prefijo `reservas-dp-bg:` y respaldo en memoria; `almacenOk`; `avisarNoGuarda` (una vez); si el almacén se llena, `guardarListados` suelta los listados más viejos (nunca el de pantalla).
3. **Fechas (Colombia, UTC−5):** `diaDe`, `hoyISO`, `fechaTexto` (DD/MM/AAAA), `fechaLarga` («martes 17 de noviembre de 2026»), `fechaCorta`, `horaDe`, `cuando`.
4. **Estado:** `ajustes`, saneadores `filaSana`/`listadoSano` (un dato viejo nunca rompe la página), `listados` (máx. 30), `actual`, `maqueta`, `tocar()`.
5. **Subir y leer:** `procesar(archivo)` (máx. 25 MB) → `Lector.leer` → `Reglas.armar` → `etapas()` (mensajes del cargador: «Leyendo el Excel…», «Dejando solo reserva, habitaciones, agencia y titular…», «Uniendo las habitaciones de cada reserva…», «Armando la hoja…») → `cargarListado` (`esElMismo` + `Reglas.fusionar`; respeta una fecha cambiada a mano); errores en `#subir-error`; arrastrar y soltar en toda la página.
6. **Pintar:** `pintarTodo`, `pintarResumen`, `pintarAvisos` (fecha ≠ check-in con botón «Usar…», sin número, letras dañadas con «Corregir las sugeridas», no DP, otro estado, variantes, tildes arregladas, filas sin código, «no deja guardar», «Todo en orden»), `pintarNovedades`, `pintarLista` (botones con nombre completo para lector de pantalla), `pintarHoja`.
7. **Corregir / agregar / quitar:** `abrirEditor` (con mouse el cursor va al campo; en pantallas táctiles al título, para que no salte el teclado), `pintarSugerencias` («Usar: …»), `guardarEditor` (código único, hab 1–999), restaurar, quitar/borrar, acciones `data-accion` (devolver, aplicar-sugerencias, fecha-checkin, volver-a-agregar), fecha y «Hoy».
8. **Salida:** imprimir (`beforeprint` pone el título `Reservas_DP_DD-MM-AAAA` para «Guardar como PDF»), `hacerPdf`, `descargar`, compartir (`navigator.canShare({files})`; si no, descarga y avisa).
9. **Historial:** `pintarHistorial`, abrir, borrar, borrar todo (con confirmación).
10. **Tema y ajustes:** `temaEfectivo`, `aplicarTema`, casilla «Llegó», «Ahorrar papel».
11. **Confirmar y aviso:** `confirmar()` con `<dialog>`, `aviso()` flotante.
12. **Arranque:** `iniciar()` → eventos, recupera el listado de hoy, y `DoradoLoader.seguir([letras de la hoja, document.fonts.ready])` para que la pantalla de carga se vaya cuando todo está listo.

**Claves de `localStorage`:** `reservas-dp-bg:ajustes`, `reservas-dp-bg:listados`, `reservas-dp-bg:actual`. La pantalla de carga usa `sessionStorage` (`dorado-loader:*`).

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

### Auditoría de 24 puntos (skill de JX) — herramienta interna privada
✅ 2 HTML real (la estructura está en el HTML; lo del Excel lo pinta JS porque sale del archivo) · ✅ 4 `<title>` real · ✅ 5 un solo HTML · ✅ 9–10 un `<h1>` · ✅ 14 favicon + apple-touch-icon + theme-color · ✅ 16 `lang="es"`, charset, viewport · ✅ 17 `alt` en el logo · ✅ 18 sin `.map`, `.env` ni carpetas de build · ✅ 19 cero errores y advertencias en consola (servido por http) · ✅ 20 sin frameworks, WebP, `fetchpriority` en el logo, `defer`, fuentes locales · ✅ 23 sin panel (opción c): zonas editables documentadas aquí y en el README · ✅ 24 código sin minificar (el cargador trae su versión legible), propiedad en el README.
➖ No aplican por la regla de privacidad de JX (herramienta interna que no debe aparecer en Google): 1 dominio propio (va en `*.pages.dev`), 3 `404.html`, 6 description, 7 Open Graph, 8 JSON-LD, 11 canonical, 12 `llms.txt`, 13 `robots.txt`, 15 sitemap, 21 páginas legales y cookies (no hay cookies, analítica ni datos que salgan del equipo), 22 Google Analytics.

## `{POR CONFIRMAR}` pendientes

1. **Dirección final en Cloudflare** (`reservas-dp-bg.pages.dev` si el nombre está libre).
2. **Nombre oficial de los estados del preregistro** en el hotel: hoy «Preregistro (…) ✔ Completo» sale «Con preregistro» y «Web check-in ✔ Completo» sale «Web check-in completo». Confirmar con JX que así le sirven (se cambian en `listado.js → TEXTO_PRE`).
3. **Otras sedes** (logo, nombre, subtítulo y pie de la hoja): hoy solo Bocagrande.
4. **Foto del 16-11:** trae 12 reservas / 23 hab; el Excel del 16-11 que mandó JX da 10 / 21 (DP130033 y DP127613 no vienen en ese archivo, y el orden de DP130280/DP125379 difiere). Lo más probable: la foto salió de otra descarga. Con el Excel del 17-11 todo coincide exacto con su PDF.

## Fuentes
Cloudflare Pages · Direct Upload (pasos de arrastrar y soltar, 1.000 archivos / 25 MiB por archivo, actualizado el 21-04-2026): https://developers.cloudflare.com/pages/get-started/direct-upload/ · Google · Bloquear la indexación con noindex: https://developers.google.com/search/docs/crawling-indexing/block-indexing · WebKit bug 251500 (compartir archivo + texto): https://bugs.webkit.org/show_bug.cgi?id=251500 · RFC 1951 (DEFLATE): https://www.rfc-editor.org/rfc/rfc1951 · ECMA-376 (Office Open XML): https://ecma-international.org/publications-and-standards/standards/ecma-376/ · Métricas de Helvetica: las AFM estándar de Adobe (vía ReportLab).

## Historial
- **2026-11-16 · base.** Preguntas a JX y respuestas; lector de Excel, reglas, hoja (SVG + PDF) y logo vectorial.
- **2026-11-17 · v1.** Hoja calcada del PDF de JX (`Reservas_DP_17-11-2026.pdf`); Excel completo y de 4 columnas; estados del preregistro de hoy (incluido «Web check-in completo»); casilla «Llegó» apagada por defecto; «Ahorrar papel»; botón «Usar fecha de llegada»; página probada completa (funciones, impresión, PDF, celular, accesibilidad); README y este archivo.

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
