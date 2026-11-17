# Listado de reservas DP · Recepción · Hotel Dorado Plaza Bocagrande

Página para recepción: subes el **Excel del día que descargas de la extranet** y te arma la hoja **«LISTADO DE RESERVAS»** lista para imprimir, descargar en PDF o compartir. Igualita a la que ya usan (logo dorado, título, fecha, tabla y totales), con **una línea por reserva** y su **número mayor de habitaciones**.

- Solo usa **Nro reserva, Nro hab, Agencia y Titular**. Las demás columnas del Excel se ignoran solas: puedes subir el Excel completo tal cual sale de la extranet o uno que ya hayas limpiado.
- El Excel **se lee en tu equipo y no se sube a internet**.
- Funciona en el computador de recepción y en el celular.

---

## Índice

1. [Uso diario (paso a paso)](#1-uso-diario-paso-a-paso)
2. [Qué hace con el Excel](#2-qué-hace-con-el-excel)
3. [Revisar y corregir antes de imprimir](#3-revisar-y-corregir-antes-de-imprimir)
4. [Si bajas el Excel otra vez el mismo día (novedades)](#4-si-bajas-el-excel-otra-vez-el-mismo-día-novedades)
5. [Imprimir, PDF y compartir](#5-imprimir-pdf-y-compartir)
6. [Historial, modo noche y ajustes](#6-historial-modo-noche-y-ajustes)
7. [Qué hay en esta carpeta](#7-qué-hay-en-esta-carpeta)
8. [Verla antes de publicar](#8-verla-antes-de-publicar)
9. [Publicarla en Cloudflare Pages (paso a paso)](#9-publicarla-en-cloudflare-pages-paso-a-paso)
10. [Privacidad](#10-privacidad)
11. [Solución de problemas](#11-solución-de-problemas)
12. [Datos pendientes `{POR CONFIRMAR}`](#12-datos-pendientes-por-confirmar)
13. [Fuentes, licencias y propiedad](#13-fuentes-licencias-y-propiedad)

---

## 1. Uso diario (paso a paso)

1. En la **extranet** (`https://extranet.doradoplaza.com/extranet/`) descarga el Excel de las llegadas del día, como siempre.
2. Abre la página y toca **«Escoge el Excel de la extranet»** (o arrastra el archivo encima de la página, en el computador).
3. Sale la pantalla de carga dorada mientras lee el Excel, deja solo las 4 columnas, une las habitaciones de cada reserva y arma la hoja.
4. Mira el **Resumen** (total de habitaciones y de reservas) y los **avisos** (si todo está bien dice «Todo en orden»).
5. Repasa la lista **«Revisa la lista»**: así saldrá en la hoja. Si algo está mal, toca la reserva y corrígela (punto 3).
6. Abajo tienes la **hoja** tal cual sale por la impresora. Usa la barra de abajo: **Imprimir**, **Descargar PDF** o **Compartir**.

> La fecha de la hoja es **la de hoy** (hora de Colombia). Si el Excel trae llegadas de otro día (por ejemplo, en el turno de noche sacas la hoja de mañana), te sale un aviso con el botón **«Usar DD/MM/AAAA»** para ponerle esa fecha con un toque. También la puedes cambiar a mano en **«Fecha que sale en la hoja»**.

## 2. Qué hace con el Excel

| En el Excel | En la hoja |
|---|---|
| Cada fila es **una habitación** y la reserva se repite | **Una línea por reserva**, con su **Nro hab más alto** |
| Agencia y titular de cada fila | Los de la fila del número más alto |
| El orden de la extranet | Primero las reservas con más habitaciones; si empatan, en el orden del Excel |
| 17 columnas (o 4, si ya lo limpiaste) | Solo **Nro reserva · Nro hab · Agencia · Titular** |
| El estado del preregistro pegado al código | Debajo del código, en letra pequeña |

**Estado del preregistro** (lo que trae la celda «Nro reserva»):

| La extranet dice | La hoja dice |
|---|---|
| «Preregistro (…) ⚠ Incompleto» o «Sin preregistro» | **Sin preregistro** |
| «Preregistro (…) ✔ Completo» o «Con preregistro» | **Con preregistro** |
| «Web check-in ✔ Completo» | **Web check-in completo** |
| Cualquier otro estado | Tal cual viene (y te avisa) |
| Nada (Excel limpiado solo con el código) | Nada |

Además:
- Las columnas se buscan **por su nombre**: no importa si están en otro orden, si hay columnas de más o si los títulos están en la fila 2.
- Los códigos que no empiezan por **DP** se incluyen igual y te avisa.
- Si la extranet manda letras dañadas (por ejemplo `MUÃ‘OZ`), se arreglan solas cuando es seguro (`MUÑOZ`); si hay una sola corrección posible te la sugiere con el botón **«Corregir las sugeridas»**; si no, te avisa para que la corrijas tú.
- Al final van los totales: **TOTAL DE HABITACIONES** y **TOTAL DE RESERVAS**.

## 3. Revisar y corregir antes de imprimir

Toca cualquier reserva de la lista para abrir **Corregir reserva**:

- Cambia la agencia, el titular, el número de habitaciones o el estado del preregistro → **Guardar**. Si el Excel traía otra forma de escribirlo, te la ofrece en **«Usar: …»**.
- **Volver a lo del Excel**: deshace lo que corregiste.
- **Quitar de la hoja**: la saca de la hoja (no se borra: queda en **«Quitadas de la hoja»**, con **Devolver a la hoja**).
- **+ Agregar una reserva que falte**: para una reserva que no vino en el Excel (número, habitaciones, agencia, titular y preregistro).

Lo hecho a mano queda **marcado en la pantalla** («Corregida a mano», «Agregada a mano»), **nunca en la hoja**: la hoja sale limpia, igual a las demás.

## 4. Si bajas el Excel otra vez el mismo día (novedades)

Las reservas cambian durante el día. Si subes un Excel **más nuevo del mismo día**, la página lo compara con el anterior:

- Marca en la lista las **Nuevas** (verde) y las que **Cambiaron** (amarillo, con lo que decía antes).
- Te muestra las que **ya no están** en el Excel, con el botón **«Agregarla a mano»** por si igual la necesitas.
- **Conserva lo que hiciste a mano**: correcciones, reservas agregadas y quitadas.

Un Excel de **otro día** crea un listado nuevo (el anterior queda en el historial).

## 5. Imprimir, PDF y compartir

- **Imprimir**: abre la ventana de impresión con **solo la hoja** (sin botones ni nada de la página), tamaño **carta**. Si escoges «Guardar como PDF», el archivo ya se llama `Reservas_DP_DD-MM-AAAA`.
- **Descargar PDF**: baja `Reservas_DP_DD-MM-AAAA.pdf` (por ejemplo `Reservas_DP_17-11-2026.pdf`), idéntico a lo que ves.
- **Compartir** (en el celular): abre el menú de compartir del teléfono con el PDF, para mandarlo por WhatsApp al grupo. Si el navegador no lo permite (por ejemplo, en el computador), descarga el PDF para que lo adjuntes.
- Si son muchas reservas, la hoja sigue en otra página («Pág. 1 de 2») con los títulos de la tabla repetidos; los totales van al final.

## 6. Historial, modo noche y ajustes

- **Historial**: cada Excel que subes queda guardado **en ese equipo** (hasta 30 listados), con sus correcciones. Toca **Abrir** para volver a imprimir uno. Si el equipo es compartido, bórralos cuando ya no los necesites (**Borrar** o **Borrar todo el historial**).
- Al volver a abrir la página el mismo día, sigue en pantalla el listado de hoy.
- **Tema**: automático (modo noche de 6 p. m. a 6 a. m.), claro o noche. Solo cambia la pantalla: la hoja siempre sale en blanco.
- **Más ajustes**:
  - **Casilla «Llegó» en la hoja** (apagada): agrega una columna con un cuadrito por reserva para chulear con lapicero.
  - **Ahorrar papel** (prendido): si apretando un poco la letra la hoja cabe en menos páginas, la aprieta (por ejemplo, 20 reservas en 1 hoja en vez de 2). Apágalo si quieres siempre el espaciado original.

## 7. Qué hay en esta carpeta

```
Listado_Reservas_DP_Recepcion_Dorado_Plaza_Bocagrande/
├── README.md        ← esta guía
├── CLAUDE.md        ← contexto técnico para futuros chats con Claude (no se publica)
└── sitio/           ← LO ÚNICO QUE SE SUBE A CLOUDFLARE PAGES
    ├── index.html                  ← la página
    ├── css/
    │   ├── estilos.css             ← todo el diseño (claro, modo noche e impresión)
    │   ├── cargador-dorado.min.css (+ .css legible)  ← pantalla de carga
    │   └── fuentes/                ← letras Karla y Arimo con sus licencias (OFL)
    ├── js/
    │   ├── lector-excel.js         ← abre el .xlsx en el equipo (sin internet)
    │   ├── listado.js              ← las reglas: una línea por reserva, preregistro, avisos, novedades
    │   ├── hoja.js                 ← dibuja la hoja y escribe el PDF (textos y medidas al inicio)
    │   ├── logo-vector.js          ← el logo de la hoja en vectores (generado)
    │   ├── app.js                  ← lo que se mueve en pantalla
    │   ├── tema.js                 ← pone el modo noche antes de pintar
    │   └── cargador-dorado.min.js (+ .js legible)    ← pantalla de carga «Trazo de oro»
    └── img/
        ├── logo-dorado-plaza-recepcion-bocagrande.webp
        └── favicon-dorado-plaza.svg · favicon-32.png · apple-touch-icon.png
```

`README.md` y `CLAUDE.md` van **fuera** de `sitio/` a propósito: así nunca quedan publicados.

## 8. Verla antes de publicar

- **Rápido:** abre `sitio/index.html` con doble clic. Funciona todo (Excel, hoja, PDF).
- **Igual a como quedará publicada** (en el computador, con Python instalado):
  ```bash
  cd sitio
  python -m http.server 8000
  ```
  y abre `http://localhost:8000` en el navegador.

## 9. Publicarla en Cloudflare Pages (paso a paso)

1. Entra a [dash.cloudflare.com](https://dash.cloudflare.com) (la cuenta gratis sirve).
2. Ve a **Workers & Pages** → **Create application** → **Get started** → **Drag and drop your files**.
3. En el nombre del proyecto escribe **`reservas-dp-bg`** → la dirección será `https://reservas-dp-bg.pages.dev` (si ese nombre ya estuviera ocupado, Cloudflare le agrega unas letras: usa la dirección que te muestre).
4. Arrastra **la carpeta `sitio`** (solo esa; no la carpeta completa ni el ZIP) → **Deploy site** → cuando termine de subir, **Save and Deploy**.
5. Abre la dirección: sale la pantalla de carga «Trazo de oro» y luego la página. Mándales el enlace a tus compañeros de recepción.
6. **En el celular:** menú del navegador → **Agregar a la pantalla de inicio**, para abrirla como una app.

**Para publicar cambios después:** el proyecto → **Create a new deployment** → arrastra otra vez la carpeta `sitio` → **Save and Deploy**. El historial y los ajustes de cada equipo **no se borran** al publicar una versión nueva.

> Límites del arrastrar y soltar: 1.000 archivos y 25 MiB por archivo. Esta página tiene 21 archivos y pesa ~570 KB en total. Un proyecto creado arrastrando archivos no se puede pasar después a GitHub (habría que crear otro).

## 10. Privacidad

- **El Excel no sale de tu equipo**: la página lo lee ahí mismo (no hay servidor, base de datos ni cuentas). Lo que guarda (historial y ajustes) queda solo en ese navegador.
- La hoja solo lleva **reserva, habitaciones, agencia, titular y estado del preregistro**. Nada de documentos, teléfonos, saldos ni tarjetas (aunque vengan en el Excel, se ignoran).
- La página le dice a los buscadores que **no la indexen, no la guarden y no muestren nada de ella**. Por eso **no hay `robots.txt`** (Google necesita leer la página para ver esa orden). No tiene descripción, vista previa para redes, `canonical`, `sitemap` ni nada de SEO, y no le cuenta a otros sitios de dónde vienes (`referrer: no-referrer`).
- Cualquier persona **con el enlace** puede abrirla, pero **no ve tus listados**: cada equipo guarda solo lo suyo.
- **Idea extra (opcional):** Cloudflare permite pedir un código por correo antes de abrir la página (**Cloudflare Access**, gratis hasta 50 usuarios). Si lo quieres, Claude te guía.
- Es una herramienta de apoyo: antes de imprimir, revisa que la lista coincida con la extranet.

## 11. Solución de problemas

| Pasa esto | Haz esto |
|---|---|
| «Ese archivo es un Excel antiguo (.xls) o tiene clave» | Descarga otra vez de la extranet el **.xlsx** (no lo abras y guardes en otro formato). |
| «No encontré las columnas de la extranet» | Ese no es el listado de llegadas, o le borraron alguna de las 4 columnas (Nro reserva, Nro hab, Agencia, Titular). |
| «El Excel llegó dañado o incompleto» | Se cortó la descarga: descárgalo otra vez. |
| «El Excel trae los títulos pero ninguna reserva» | No hay llegadas en ese Excel. |
| Falta una reserva que sí está en la extranet | Puede que la descarga sea vieja: baja el Excel otra vez (te marca las novedades) o usa **+ Agregar una reserva que falte**. |
| Sale el aviso de la fecha | El Excel es de otro día: toca **«Usar DD/MM/AAAA»** o deja la de hoy. |
| Un nombre sale con una letra rara | Toca la reserva y corrígelo, o usa **«Corregir las sugeridas»** del aviso. |
| «Este navegador no deja guardar» | Estás en modo incógnito o con el almacenamiento bloqueado: funciona, pero al cerrar se pierde. Imprime o descarga el PDF antes de cerrar, o ábrela en una ventana normal. |
| Al imprimir salen márgenes raros o la hoja se ve pequeña | En la ventana de impresión: tamaño **Carta**, márgenes **Predeterminados** o **Ninguno**, escala **100 %**. |
| El tema cambió solo | En automático, el modo noche va de 6 p. m. a 6 a. m. Cámbialo con el botón **Tema**. |
| Quiero la casilla para chulear las llegadas | **Más ajustes** → **Casilla «Llegó» en la hoja**. |

## 12. Datos pendientes `{POR CONFIRMAR}`

- **La dirección final** en Cloudflare (`reservas-dp-bg.pages.dev` si el nombre está libre).
- **Cómo prefieren llamar los estados** del preregistro en la hoja: hoy «Con preregistro» para «Preregistro (…) ✔ Completo» y «Web check-in completo» para «Web check-in ✔ Completo».
- **Otras sedes** (logo, nombre y textos de la hoja): por ahora solo Bocagrande.

## 13. Fuentes, licencias y propiedad

- Pasos y límites de publicación: [Cloudflare Pages · Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/).
- Privacidad sin `robots.txt`: [Google · Bloquear la indexación con noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing).
- Compartir solo el PDF (sin texto): [WebKit · bug 251500](https://bugs.webkit.org/show_bug.cgi?id=251500).
- Formatos: el .xlsx es Office Open XML ([ECMA-376](https://ecma-international.org/publications-and-standards/standards/ecma-376/)) comprimido con DEFLATE ([RFC 1951](https://www.rfc-editor.org/rfc/rfc1951)); el PDF usa Helvetica, una de las letras estándar que trae todo lector de PDF.

Letras: **Karla** © 2019 The Karla Project Authors y **Arimo** © 2020 The Arimo Project Authors, licencia SIL Open Font License 1.1 (archivos en `sitio/css/fuentes/`).

**Propiedad:** el código de esta página es tuyo (JX). Se publica en **tu** cuenta de Cloudflare (dirección gratuita `*.pages.dev`, sin dominio). Todos los archivos van sin minificar y comentados para que cualquiera pueda editarlos (el cargador trae también su versión legible). La marca y el logo Dorado Plaza son del hotel.

---

**Diseño y desarrollo: JX Company**
