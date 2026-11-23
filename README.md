# Editador de reservas DP · Recepción Dorado Plaza Bocagrande

**Del Excel de la extranet a la hoja de llegadas lista para imprimir, en segundos.**

Subes el Excel de llegadas que descargas de la extranet y el editador lo limpia, une las habitaciones de cada reserva, te avisa de lo que hay que revisar y te deja corregir antes de sacar la hoja **«LISTADO DE RESERVAS»**. La hoja sale igual a la que ya usa Recepción: logo dorado, fecha, tabla y totales. La puedes imprimir, bajar en PDF o mandar por WhatsApp.

🔗 **Ábrelo aquí:** <https://editador-reservas-doradoplaza-bg.pages.dev>

🏷️ **Versión actual: v2.0** · 23 nov 2026, 12:11 p. m. (hora de Colombia) · [ver todas las versiones](#12-versiones)

| Antes (a mano) | Con el editador |
|---|---|
| Borrar 13 columnas del Excel | Usa solo **Nro reserva, Nro hab, Agencia y Titular**. Lo demás se ignora solo |
| Una fila por **habitación**, la reserva repetida | **Una línea por reserva**, con su número mayor de habitaciones |
| Buscar a ojo tildes dañadas (`MUÃ‘OZ`) | Las arregla solo cuando es seguro, o te las sugiere |
| Comparar a mano la descarga de la mañana con la de la tarde | Marca las **nuevas**, las que **cambiaron** y las que **ya no están** |
| Armar la hoja y sumar los totales | Hoja carta lista, con **total de habitaciones y de reservas** |

- 🔒 **Solo entra recepción:** cada recepcionista entra con **su usuario y contraseña** (los crea el administrador).
- ☁️ **El historial queda en la nube**: cada recepcionista ve **el suyo** en cualquier equipo al entrar (el administrador ve el de todos). Si se borra la caché o cambias de computador, no se pierde nada. Se borra solo a los **30 días**.
- 🔒 **La sesión se cierra sola a las 2 horas sin usar** la página (desde v1.26; antes media hora). **Desde v2.0, cerrar la pestaña, el navegador o apagar el PC ya NO la cierra**: al volver entras directo si no han pasado 2 horas. En un PC compartido, toca **«Salir de este equipo»** al terminar tu turno.
- 📄 **El Excel no sale de tu equipo:** se lee ahí mismo. A la nube solo va el listado ya armado (reserva, habitaciones, agencia y titular).
- 🔗 **El enlace para bajar el Excel está en la misma página** (desde v1.22): desde v1.25 va **debajo de la tarjeta de «Entrar»** y, ya adentro, **debajo de los pasos de «Sube el Excel»**: «Descarga el Excel desde aquí: **extranet.doradoplaza.com**» (se abre en otra pestaña).
- 🛡️ **La administración va aparte** (desde v1.21): usuarios y «Quién hizo qué» están en `…/admin`, solo para el administrador.
- 💻 Hecho primero para el **computador de recepción**; funciona también en el celular (Android e iPhone).

---

## Índice

1. [Uso diario en 6 pasos](#1-uso-diario-en-6-pasos)
2. [Qué hace con el Excel](#2-qué-hace-con-el-excel)
3. [Revisar y corregir antes de imprimir](#3-revisar-y-corregir-antes-de-imprimir)
4. [Cada Excel, un listado aparte · «Guardar y hacer otro»](#4-cada-excel-un-listado-aparte--guardar-y-hacer-otro)
5. [Imprimir, PDF y compartir](#5-imprimir-pdf-y-compartir)
6. [Historial, modo noche y ajustes](#6-historial-modo-noche-y-ajustes)
7. [Entrar con tu usuario y la nube (desde v1.3)](#7-entrar-con-tu-usuario-y-la-nube-desde-v13)
8. [Privacidad](#8-privacidad)
9. [Solución de problemas](#9-solución-de-problemas)
10. [Para quien mantiene la página](#10-para-quien-mantiene-la-página)
11. [Pendientes `{POR CONFIRMAR}`](#11-pendientes-por-confirmar)
12. [Versiones](#12-versiones)
13. [Fuentes, licencias y propiedad](#13-fuentes-licencias-y-propiedad)

---

## 1. Uso diario en 6 pasos

1. En la **extranet** (`https://extranet.doradoplaza.com/extranet/`) descarga el listado de reservas del día, como siempre. El archivo se llama **«EXTRANET  DORADO PLAZA.xlsx»**. El enlace está también **en el editador, debajo de los pasos de «Sube el Excel»** (y en la puerta, debajo de «Entrar»; desde v1.25): «Descarga el Excel desde aquí: **extranet.doradoplaza.com**». Se abre en otra pestaña, así el editador no se cierra.
2. Abre el editador y toca **«Escoge el Excel de la extranet»**. En el computador también puedes arrastrar el archivo encima de la página.
3. Sale la pantalla de carga dorada mientras lee el Excel y arma la hoja: se toma **10 segundos** a propósito (desde v1.11; antes 12). El logo se dibuja completo **4 veces** mientras el % sube parejo hasta 100, y después aparece la lista.
4. Mira el **Resumen** (total de habitaciones y de reservas) y los **avisos**. Si todo está bien, dice «Todo en orden».
5. Repasa **«Revisa la lista»**: así va a salir la hoja. Si algo está mal, toca la reserva y corrígela ([punto 3](#3-revisar-y-corregir-antes-de-imprimir)).
6. Abajo está la **hoja** tal cual sale por la impresora. Usa la barra de abajo: **Imprimir**, **Descargar PDF**, **Compartir** o **Eliminar**.

> **La fecha de la hoja es la de las reservas, la que trae el Excel** (desde v1.10): si subes las llegadas del 22, la hoja dice **«Reservas del: domingo 22/11/2026»**, aunque la saques hoy. Si el Excel no trae fecha de llegada, sale la de hoy. Si un día trae reservas de **varios días** (casi nunca pasa), sale la ventanita **«¿De qué fecha es la hoja?»** para escoger. También la puedes cambiar a mano en **«Fecha que sale en la hoja»** (y si la cambias, sale un aviso con **«Usar DD/MM/AAAA»** para volver a la del Excel).

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
| Nada (Excel limpiado, solo con el código) | Nada |

Además:
- Las columnas se buscan **por su nombre**: no importa si están en otro orden, si hay columnas de más o si los títulos están en la fila 2.
- Los códigos que no empiezan por **DP** se incluyen igual, y te avisa.
- Si la extranet manda letras dañadas (por ejemplo `MUÃ‘OZ`), se arreglan solas cuando es seguro (`MUÑOZ`). Si hay una sola corrección posible, te la sugiere con el botón **«Corregir las sugeridas»**; si no, te avisa para que la corrijas tú.
- Al final van los totales: **TOTAL DE HABITACIONES** y **TOTAL DE RESERVAS**.

## 3. Revisar y corregir antes de imprimir

Toca cualquier reserva de la lista para abrir **Corregir reserva**:

- Cambia la agencia, el titular, el número de habitaciones o el estado del preregistro y toca **Guardar**. Si el Excel traía otra forma de escribirlo, te la ofrece en **«Usar: …»**.
- **Volver a lo del Excel**: deshace lo que corregiste.
- **Quitar de la hoja** (o la **basurita roja** 🗑 que está a la derecha de cada reserva, desde v1.8): pregunta **dos veces** («¿Eliminar esta reserva?» y «¿Segurísimo…?», porque viene del listado original de la extranet). La saca de la hoja: **no sale al imprimir ni en el PDF**. No se borra: queda en **«Quitadas de la hoja»**, con el botón **Devolver a la hoja**, y tienes 10 s para «Deshacer». Las reservas **agregadas a mano** se borran con una sola pregunta.
- **+ Agregar una reserva que falte**: para una reserva que no vino en el Excel (número, habitaciones, agencia, titular y preregistro).

Lo hecho a mano queda **marcado en la pantalla** («Corregida a mano», «Agregada a mano»), **nunca en la hoja**: la hoja sale limpia, igual a las demás.

## 4. Cada Excel, un listado aparte · «Guardar y hacer otro»

Desde **v1.15** (pedido de JX):

- **Cada Excel que subes queda como un listado aparte** en tu historial, aunque sea del mismo día o el mismo archivo otra vez. (Hasta v1.14 un Excel del mismo día reemplazaba al anterior y marcaba «Nueva / Cambió / Ya no está»; eso ya no se usa.)
- **Al entrar, la pantalla sale limpia** para subir un Excel. Lo que hiciste antes está en tu **Historial** (abajo): tócalo en **Abrir** para volver a imprimirlo.
- **«Guardar y hacer otro»** (botón de la barra de abajo, con el ícono de una hoja con «+»; en celular solo el ícono y en tablet «Hacer otro»): el listado en pantalla ya está guardado; el botón lo deja en tu historial, limpia la pantalla y te lleva a **Subir el Excel** para hacer otro. Sale el ✓ «¡Guardado en tu historial!».
- **Recargar** la página (F5) deja el mismo listado en pantalla; una **pestaña nueva** o una **entrada nueva** sale limpia.

## 5. Imprimir, PDF y compartir

- **En cada hoja sale quién y cuándo** (desde v1.10): debajo de «Reservas del: …» va **«Impreso el 21/11/2026, 3:45 p. m.»** (la hora exacta en que tocas Imprimir, Descargar PDF o Compartir) y **«por …»** (quien la sacó). Con la nube es el nombre del usuario que entró. **Sin la nube** sale la ventanita **«¿Quién imprime?»**: el nombre es obligatorio (si lo dejas vacío sale la ✗ «Primero escribe tu nombre») y el equipo lo recuerda para la próxima vez (sale ya escrito, solo confirmas o lo cambias). Ctrl+P también pasa por esa ventanita; si alguien imprime desde el menú del navegador sin haber puesto su nombre, en vez de la hoja sale un aviso para usar el botón «Imprimir».
- **Imprimir**: abre la ventana de impresión con **solo la hoja** (sin botones ni nada de la página), tamaño **carta**. Si escoges «Guardar como PDF», el archivo ya se llama `Reservas_DP_DD-MM-AAAA`.
- **Descargar PDF**: baja `Reservas_DP_DD-MM-AAAA.pdf` (por ejemplo, `Reservas_DP_17-11-2026.pdf`), idéntico a lo que ves en pantalla.
- **Compartir** (en el celular): abre el menú de compartir del teléfono con el PDF, para mandarlo al grupo de WhatsApp. Si el navegador no lo permite (por ejemplo, en el computador), descarga el PDF para que lo adjuntes.
- **Eliminar** (🗑, en rojo; desde v1.4): solo aparece cuando hay un Excel subido. Quita de la pantalla el listado que estás viendo **y también del historial**, después de preguntarte «¿Eliminar…?». Tienes **10 segundos para «Deshacer»**. Sirve si subiste el Excel equivocado. Con la nube activa solo lo ve el administrador (igual que «Borrar» del historial). En el celular se ve solo la basurita; en pantallas más anchas dice «Eliminar».
- Si son muchas reservas, la hoja sigue en otra página («Pág. 1 de 2») con los títulos de la tabla repetidos. Los totales van al final.

## 6. Historial, modo noche y ajustes

- **Historial**: cada Excel que subes queda guardado con sus correcciones. **Con la nube**, desde **v1.15 cada recepcionista ve solo SU historial** (lo que subió él, en cualquier equipo al entrar) y **el administrador ve el de todos**, con «subido … por **Nombre**» y el filtro **«Ver el historial de»** (Todos o una persona). Cada listado se borra solo a los 30 días; solo el administrador puede borrar a mano. Sin la nube queda solo en ese equipo (hasta 30 listados). Toca **Abrir** para volver a imprimir uno.
- **Por día** (desde v1.21, pedido de JX): el historial sale en bloques **«Historial del domingo 22/11/2026»**, con «Hoy» o «Ayer» y cuántos listados tiene. El día más reciente sale **abierto** y los anteriores **cerrados**: tócalos para abrirlos (la página recuerda los que abriste o cerraste mientras sigas en ella).
- Al entrar o abrir una pestaña nueva, la pantalla sale limpia (v1.15); al recargar, sigue el listado que tenías.
- **Tema**: automático (modo noche de 6 p. m. a 6 a. m.), claro o noche. Solo cambia la pantalla: la hoja siempre sale en blanco. **Desde v1.27, con la nube, el tema es de cada cuenta**: el que pongas es solo tuyo, te sigue a cualquier PC o celular donde entres y nadie más te lo cambia (antes era del computador: si un compañero lo cambiaba en un PC compartido, le cambiaba a todos). En la puerta «Entrar» siempre sale el automático. Sin la nube, como antes: es del equipo.
- **Más ajustes** (se abre encima de la página y se cierra tocando fuera o con **Esc**):
  - **Casilla «Llegó» en la hoja** (apagada): agrega una columna con un cuadrito por reserva para chulear con lapicero.
  - **Ahorrar papel** (prendido): si apretando un poco la letra la hoja cabe en menos páginas, la aprieta (por ejemplo, 20 reservas en 1 hoja en vez de 2). Apágalo si quieres siempre el espaciado original.
  - Con la nube, estos dos ajustes son **iguales para todos los equipos** y **solo el administrador** los cambia.
  - **Sonido al imprimir** (prendido; desde v1.27): al cerrarse la ventana de imprimir suena un ruidito de papel saliendo y la campanita de recepción, para saber que la hoja ya se mandó. Al prenderlo suena una vez para que lo escuches. Es **de cada cuenta**, igual que el tema: si lo apagas, solo se apaga para ti. (El navegador no le dice a la página si tocaste «Imprimir» o «Cancelar», así que suena al cerrarse esa ventana.)
- **En el celular:** menú del navegador → **Agregar a la pantalla de inicio**, para abrirlo como una app.

### Ventanitas de confirmación (desde v1.5)

- **Todo lo que se elimina pregunta primero** con una ventanita roja y una basurita que se dibuja: eliminar el listado, borrar del historial (uno o todo), quitar una reserva de la hoja, borrar una reserva agregada a mano y desactivar un usuario. El botón «Sí» no funciona en el primer medio segundo, para que un doble toque no borre sin querer. Después sale **«Deshacer (10)»** por 10 segundos.
- **Todo lo que sale bien muestra un ✓ verde**: listado listo al subir el Excel, reserva guardada o agregada, restaurada, devuelta a la hoja, letras corregidas, fecha cambiada, PDF descargado o compartido, listado abierto del historial, «se deshizo», y con la nube: bienvenida al entrar, contraseña cambiada, usuario creado, administrador, guardado en la nube. **Se quita solo a los 8 segundos** («Entendido (8)»).
- **Los errores (✗ roja) y las preguntas de eliminar se quedan** hasta que la persona las cierre. También la que muestra la contraseña de un usuario nuevo (hay que anotarla).
- **Salir de la cuenta** pregunta con una puerta dorada y al final dice «Sesión cerrada».
- **«Tu hoja está aquí abajo ↓»**: después de subir el Excel, una pastilla dorada a la derecha indica que la hoja está abajo (con la nube dice tu nombre: «Jx, tu hoja está aquí abajo»). Sale **una sola vez por cada vez que entras con tu usuario** (sin la nube, una vez por equipo), nunca al recargar, y se quita sola a los 8 segundos, al bajar hasta la hoja o al tocarla (te lleva a la hoja).

## 7. Entrar con tu usuario y la nube (desde v1.3)

**Entrar.** Al abrir el editador sale la pantalla **Entrar**: escribe **tu nombre y apellido** (por ejemplo «Jaime Valera»; desde v1.13 el usuario ES el nombre, y **no importan las mayúsculas, las tildes ni los espacios de más**: «jaime valera» o «JAIME VALERA» también sirven) y **tu contraseña** (esa sí, exacta). Sin entrar no se ve nada. Al entrar sale al instante la ventanita **«¡Bienvenido, …!»** (desde v1.11 ya no aparece primero la página y después la ventanita); el historial de la nube llega solo en un momento.

**La sesión se cierra sola (v1.15, porque los PC de recepción son compartidos).** Ya no existe «Recordar en este equipo».
- **Desde v2.0, cerrar la pestaña, el navegador o apagar el computador NO la cierra** (JX: «es tedioso estar entrando de nuevo enseguida»): si vuelves antes de 2 horas desde lo último que hiciste, entras directo, sin contraseña. (De v1.15 a v1.27 sí se cerraba al cerrar la pestaña.) Por eso, **en un PC compartido toca «Salir de este equipo» al terminar tu turno**: si no, el siguiente que abra la página antes de 2 horas queda en tu cuenta.
- **A las 2 horas sin tocar nada** (desde v1.26; antes 30 minutos) (ni clic, ni tecla, ni el dedo): 1 minuto antes sale **«¿Sigues ahí?»** con la cuenta atrás → **«Sí, sigo aquí»** (o Esc) sigue 2 horas más; **«Salir ahora»** cierra ya. Si nadie responde, se cierra sola y sale **«Sesión cerrada»**. Lo hecho queda guardado en tu historial.
- La nube también la vence sola a las 2 horas sin usar (desde v2.0 sin el tope de 14 horas), así nadie puede reabrirla con la cookie después de ese tiempo.

**Tu contraseña te la da el administrador** (desde v1.7): entras con esa y listo. Recepción no la puede cambiar; si la olvidas, el administrador te pone una nueva. Solo el administrador, **la primera vez** que entra con la `CLAVE_INICIAL`, pone su propia contraseña.

**El botón con tu nombre** (arriba, junto a «Tema», con una nubecita ☁) dice si todo está guardado. Mientras guarda, el punto **amarillo late**; cuando termina se pone **verde** y dice la hora: «Jx · Guardado · 10:45 a. m.» (desde v1.11, igual que en el Manual de turnos):

| Punto | Dice | Qué significa |
|---|---|---|
| 🟢 | **Guardado · 10:45 a. m.** | Todo está en la nube (y a qué hora fue lo último). |
| 🟡 (latiendo) | **Guardando…** · **Trayendo…** | Está trabajando: en unos segundos queda guardado. |
| 🟡 | **Sin señal** | Se cayó el internet. **Sigue trabajando normal**: todo queda en el equipo y se sube solo cuando vuelva la señal. |
| 🔴 | **No se pudo guardar** | Lo vuelve a intentar solo cada 30 segundos. |

**«✓ Datos guardados exitosamente»** (desde v1.11, igual que en el Manual de turnos): cada vez que guardas algo (subir el Excel, corregir, agregar, quitar, eliminar, tema, casillas) sale **abajo, al centro, encima de la barra** (desde v1.12), una píldora pequeña con el ✓ verde, en pequeño **qué se guardó** y, con la nube, **«☁ Guardando en la nube…»** (amarillo) que cambia a **«☁ También en la nube»** (verde) cuando ya quedó, o **«☁ Sin señal: se sube solo cuando vuelva»** (rojo). Se va sola en unos 2 segundos y no se puede tocar (no estorba). Si hay una ventanita abierta, espera a que la cierres; si abajo está «Deshacer», un aviso o la guía «tu hoja está aquí abajo», se sube un poco para no taparlos.

Al tocarlo se abre **Mi cuenta**: **Guardar ahora**, **Cambiar mi contraseña** (el administrador y la Líder de Recepción) y **Salir de este equipo**; el administrador ve además **«Ir a Administración»** (desde v1.21, la página aparte `…/admin`). Al salir, en ese equipo no queda nada del historial (sigue en la nube).

**Entre varios equipos.** Si entras con tu usuario en el PC y en el celular, lo que haces en uno aparece solo en el otro (cada 45 segundos, o al volver a la pestaña). Si el administrador corrige un listado tuyo mientras tú también lo corriges, se **juntan los dos cambios**: si fue la misma reserva, gana el último.

### Preguntas frecuentes de la nube (respuestas a JX, 21 nov 2026)

- **¿Quién ve «Administración»?** Solo los usuarios de tipo **Administrador**. Desde **v1.21** es una página aparte: **`https://editador-reservas-doradoplaza-bg.pages.dev/admin/`** (en el editador: **Mi cuenta → Ir a Administración**; para volver, **«Volver al editador»**). A recepción y a la Líder no les aparece el enlace; si alguien abre `/admin` igual, sale «Solo para el administrador», y aunque intentara entrar por otro camino, la nube responde «no autorizado». **No hay límite de usuarios.** Siempre queda al menos un administrador activo (la web no deja quitártelo ni desactivarte a ti mismo).
- **¿Dónde se guardan los datos?** En la base **D1** (`editador-reservas-db`) de la cuenta de Cloudflare de JX. Las contraseñas no se guardan tal cual: van cifradas con PBKDF2 (100.000 vueltas), así que nadie puede leerlas, solo cambiarlas. La sesión va en una cookie protegida que la página no puede leer y que solo viaja por HTTPS. 5 contraseñas malas = 15 minutos de espera. El Excel nunca se sube: solo el listado ya armado.
- **¿Alguien puede entrar un día y no encontrar nada?** Desde v1.15 cada uno ve **su** historial (lo que subió él), en cualquier equipo; el administrador ve el de todos. **Los usuarios no se borran nunca** (solo se desactivan). **Los listados y «Quién hizo qué» se borran solos a los 30 días** (por los nombres de los huéspedes, Ley 1581); se puede cambiar a 60 o 90 días si JX lo decide. Sin internet no se pierde nada: queda en el equipo y se sube al volver la señal. Al salir de la cuenta, ese equipo se limpia, pero todo sigue en la nube.
- **¿Hay copia de seguridad?** Sí: Cloudflare guarda el historial de la base y en el plan gratis se puede **volver a cualquier momento de los últimos 7 días** (30 días en el plan de pago). Fuente: [Cloudflare D1 · Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/).

**Tres tipos de permisos (v1.18)** — se escogen al crear el usuario o con el botón **«Permisos»** de cada uno:

| Permiso | Qué puede hacer |
|---|---|
| **Recepción** | Sube el Excel, corrige, imprime, descarga y comparte. Ve **solo su historial**. |
| **Líder de Recepción** | Lo mismo, y además ve **el historial de todos** (con filtro por persona), puede corregir cualquier listado y (desde v1.19) **cambia su propia contraseña** en «Mi cuenta». **No** maneja usuarios, **no** borra, **no** cambia los ajustes de la hoja y, desde v1.21, **no** ve «Quién hizo qué» (quedó solo para el administrador, en `/admin`; de v1.18 a v1.20 sí lo veía). |
| **Administrador** | Todo lo anterior y lo de abajo. |

**Los nombres van siempre con Mayúscula Inicial** (v1.18): aunque se escriba «jaime valera», «Jaime valera» o «JAIME VALERA», queda «Jaime Valera» (las tildes y la ñ se respetan; los usuarios que ya existían se arreglan solos).

**¿Dónde quedan las contraseñas? (explicado para JX)**

- **Cada contraseña vive en la base de datos D1** (`editador-reservas-db`, tabla `usuarios`), en la fila de esa persona. **No se guarda la contraseña**, sino su **huella**: la nube la mezcla 100.000 veces con una «sal» al azar (PBKDF2-SHA256) y guarda la sal y el resultado. Al entrar, hace lo mismo con lo que escribiste y compara. Por eso **nadie puede leerla** (ni el admin, ni Cloudflare, ni quien vea la base).
- **Al cambiar una contraseña** (tú en «Mi cuenta», tú a otra persona con «Contraseña nueva», o la Líder la suya) se **reemplaza** la huella vieja por la nueva en esa misma fila: **la vieja desaparece** (no queda historial de contraseñas) y se cierran las sesiones de esa persona en los demás equipos.
- **`CLAVE_INICIAL` NO es tu contraseña** y **nunca cambia sola**: es una «llave de arranque» guardada como secreto en Cloudflare (el nombre debe ser EXACTO: `CLAVE_INICIAL`). Solo sirve 1) la primera vez de todas (cuando no hay ningún usuario) para crear al administrador, y 2) para el **rescate**, cuando además existe `RESCATE_ADMIN`. Cambiar tu contraseña en la web no la toca, y cambiar su valor en Cloudflare no toca ninguna contraseña. **Desde v1.20, si ya hay usuarios y falta, la nube sigue funcionando** (solo no habría rescate); igual conviene dejarla puesta.
- **«Ver contraseña» (v1.20, solo el administrador):** en Administración, cada compañero tiene **«Ver contraseña»**. Te pide **tu** contraseña (5 intentos malos = 15 minutos de espera) y muestra la de esa persona en una ventanita que no se cierra sola. Funciona porque, desde v1.20, cada contraseña que se pone (usuario nuevo, «Contraseña nueva» o la que cambia la Líder) guarda además una **copia cifrada** (AES-GCM; la llave se creó sola dentro de la base). Las que se pusieron **antes** de v1.20 no tienen copia: sale «No se puede ver» → ponle una «Contraseña nueva» y desde ahí sí. Queda anotado en «Quién hizo qué» («vio la contraseña de…»). Tu propia contraseña no sale ahí: se cambia en «Mi cuenta» y, si la olvidas, el rescate.
- **Quién cambia qué:** el administrador cambia la suya (Mi cuenta, pide la actual) y le pone una nueva a cualquiera (Contraseña nueva, sin pedir la vieja). La **Líder de Recepción** cambia la suya. **Recepción** no cambia la suya: se la pone el administrador.
- Si el administrador olvida la suya: el rescate (ver «Activar la nube», abajo). Copias de la base: Cloudflare D1 Time Travel (7 días en el plan gratis).

**Solo el administrador** — en la página **Administración** (`…/admin/`, desde v1.21; hasta v1.20 era una sección abajo del historial):
- **Usuarios de recepción:** **+ Nuevo usuario** (**nombre y apellido** —con eso entra y así sale en la hoja; desde v1.13 ya no hay un «usuario» aparte; si lo escribes todo en minúsculas, la web le pone las mayúsculas— y **la contraseña que tú escribes**; el dado inventa una si quieres; entrégasela en persona: con esa entra siempre), **Contraseña nueva** (si alguien la olvidó o quieres cambiársela), **Ver contraseña** (v1.20), **Nombre**, **Permisos** (v1.18; antes «Hacer / Quitar administrador») y **Desactivar** (si alguien se va: no puede entrar y lo que hizo queda guardado). Siempre queda al menos un administrador. **Desde v1.27 cada usuario es un desplegable**: cerrado se ve solo el nombre con sus chips (Administrador, Líder de Recepción, Tú…); al tocarlo se abren «Entra con su nombre · creado el…» y sus botones (y sigue abierto después de cambiar algo). **Desde v2.0 esos botones son botones de verdad** (antes texto subrayado); «Desactivar» va en rojo.
- **Quién hizo qué:** quién entró, quién subió cada Excel, quién corrigió, agregó o quitó cada reserva, quién imprimió o descargó el PDF, y a qué hora (últimos 30 días). **Por día** (v1.21): «Historial del domingo 22/11/2026 · N acciones»; **hoy** sale abierto y los días anteriores **cerrados** (al tocar uno se abre y trae lo de ese día). El botón **Actualizar** trae lo último de todos los equipos.
- **Permisos** de cada usuario (Recepción / Líder de Recepción / Administrador). Siempre queda al menos un administrador activo.
- En el **editador** (no en `/admin`): **ver el historial de todos** (filtro «Ver el historial de»), **Borrar** listados del historial, **Eliminar** el que está en pantalla y los **ajustes de la hoja para todos** («Más ajustes»: casilla «Llegó» y «Ahorrar papel»).

> Si la página se abre con doble clic, en el computador de la casa o mientras Cloudflare no tiene la nube lista, funciona **sola en ese equipo**, como antes (sin pedir usuario).

## 8. Privacidad

- **El Excel no sale de tu equipo**: el editador lo lee ahí mismo. A la nube (una base de datos D1 de Cloudflare, del proyecto) solo va el **listado ya armado** —reserva, habitaciones, agencia, titular y estado del preregistro—, quién hizo cada cosa y los usuarios. Las contraseñas se guardan **cifradas** (PBKDF2): ni el administrador puede verlas.
- **Solo entran los usuarios de recepción** y **todo se borra solo a los 30 días** (listados y «Quién hizo qué»). Son nombres de huéspedes (datos personales, Ley 1581 de 2012): conviene que el hotel lo sepa y no guardar más de lo necesario.
- La hoja solo lleva **reserva, habitaciones, agencia, titular y estado del preregistro**. Nada de documentos, teléfonos, saldos ni tarjetas: aunque vengan en el Excel, se ignoran.
- La página les pide a los buscadores que **no la indexen, no la guarden y no muestren nada de ella**. Por eso **no hay `robots.txt`** (Google necesita leer la página para ver esa orden). Tampoco tiene descripción, vista previa para redes, `sitemap` ni nada de SEO, y no les cuenta a otros sitios de dónde vienes (`referrer: no-referrer`).
- Cualquier persona **con el enlace** ve solo la pantalla **Entrar**: sin usuario no ve ningún listado. Después de 5 contraseñas malas seguidas, ese usuario espera 15 minutos.
- El enlace a la extranet (v1.22; desde v1.25 debajo de «Entrar» y de «Sube el Excel») se abre **en otra pestaña** y **no le dice a la extranet de dónde vienes** (`noopener noreferrer`). Allá entras con tu usuario de la extranet, como siempre: el editador no ve ni guarda nada de eso.
- Es una herramienta de apoyo: antes de imprimir, revisa que la lista coincida con la extranet.

## 9. Solución de problemas

| Pasa esto | Haz esto |
|---|---|
| No sé de dónde bajar el Excel | Abajo del todo en el editador, en el pie: **«Descarga el Excel desde aquí: extranet.doradoplaza.com»** (se abre en otra pestaña). Entra con tu usuario de la extranet y descarga el listado del día. |
| «Ese archivo es un Excel antiguo (.xls) o tiene clave» | Descarga otra vez de la extranet el **.xlsx** (no lo abras y guardes en otro formato). |
| ✗ **«Excel incorrecto»** («Ese Excel no es el listado de reservas de la extranet…») | Subiste otro archivo, o le borraron alguna de las 4 columnas (Nro reserva, Nro hab, Agencia, Titular). Descarga otra vez de la extranet **«EXTRANET  DORADO PLAZA.xlsx»** y súbelo tal cual. |
| Aviso amarillo **«Ojo: este archivo no se llama EXTRANET  DORADO PLAZA.xlsx (⚠ se llama «…»)»** (el nombre equivocado sale en rojo) | Se leyó igual porque trae las columnas de la extranet, pero el nombre es otro: revisa que sea el listado de reservas del día. (Si el navegador lo bajó como «… (1).xlsx» no sale el aviso.) |
| «El Excel llegó dañado o incompleto» | Se cortó la descarga: descárgalo otra vez. |
| «El Excel trae los títulos pero ninguna reserva» | No hay llegadas en ese Excel. |
| Falta una reserva que sí está en la extranet | Puede que la descarga sea vieja: baja el Excel otra vez (te marca las novedades) o usa **+ Agregar una reserva que falte**. |
| Sale el aviso de la fecha | Le cambiaste la fecha a mano y ya no es la del Excel: toca **«Usar DD/MM/AAAA»** para volver a la del Excel, o déjala si fue a propósito. |
| Sale «¿Quién imprime?» | No hay nadie con su usuario (sin la nube): escribe tu nombre; sale en la hoja. |
| Un nombre sale con una letra rara | Toca la reserva y corrígelo, o usa **«Corregir las sugeridas»** del aviso. |
| «Este navegador no deja guardar» | Estás en modo incógnito o con el almacenamiento bloqueado: funciona, pero al cerrar se pierde. Imprime o descarga el PDF antes de cerrar, o ábrelo en una ventana normal. |
| Al imprimir salen márgenes raros o la hoja se ve pequeña | En la ventana de impresión: tamaño **Carta**, márgenes **Predeterminados** o **Ninguno**, escala **100 %**. |
| El tema cambió solo | En automático, el modo noche va de 6 p. m. a 6 a. m. Cámbialo con el botón **Tema**. Desde v1.27 es de tu cuenta: lo que cambie un compañero ya no te cambia el tuyo. |
| No suena nada al imprimir | **Más ajustes** → **Sonido al imprimir** prendido, y el volumen del PC arriba (y que no esté en silencio). |
| Quiero la casilla para chulear las llegadas | **Más ajustes** → **Casilla «Llegó» en la hoja**. |
| Con el celular acostado no veo todo el diálogo | **Guardar** y **Cancelar** siempre quedan abajo a la vista; desliza dentro del diálogo para ver los demás campos. |
| «Usuario o contraseña incorrectos» | Las mayúsculas cuentan (usa el 👁 para ver lo que escribes). Si la olvidaste, el administrador te pone una **Contraseña nueva**. |
| «Demasiados intentos: espera 15 minutos» | Se equivocaron 5 veces seguidas con ese usuario. Espera y vuelve a intentar, o pide una contraseña nueva. |
| «Tu sesión se venció: entra otra vez» | Pasó el turno (o el administrador te desactivó o te cambió la contraseña). Entra otra vez: lo que habías hecho se sube al entrar. |
| El botón dice **Sin señal** | Se cayó el internet. Sigue trabajando: todo queda en el equipo y se sube solo cuando vuelva. No toques **Salir** hasta que diga **Guardado**. |
| No sale la pantalla **Entrar** en la dirección publicada | La nube aún no está lista en Cloudflare: la página trabaja sola en cada equipo. Revisa el [punto 10](#10-para-quien-mantiene-la-página) («Activar la nube»). |
| No encuentro «Administración» | Desde v1.21 es una página aparte y es **solo del administrador**: **Mi cuenta → Ir a Administración**, o abre `https://editador-reservas-doradoplaza-bg.pages.dev/admin/`. Si dice «Solo para el administrador», entraste con un usuario de recepción o de Líder. |
| El administrador olvidó su contraseña | Ver «Si el administrador olvida su contraseña» en el [punto 10](#10-para-quien-mantiene-la-página). |
| La dirección del editador da «404» | En Cloudflare falta decir que la página está en la carpeta `sitio` (ver [punto 10](#10-para-quien-mantiene-la-página)). |

## 10. Para quien mantiene la página

### Qué hay en el repositorio

```
EDIT-DE-RESERVAS-DORADO-PLAZA-BG/
├── README.md        ← esta guía
├── CLAUDE.md        ← contexto técnico para trabajar con Claude (NO se publica)
├── functions/
│   └── api/[[ruta]].js  ← LA NUBE (v1.3): usuarios, sesiones y listados en la base D1.
│                          Cloudflare la ejecuta en /api/…, pero no se publica como archivo
└── sitio/           ← LO ÚNICO QUE SE PUBLICA EN CLOUDFLARE PAGES
    ├── index.html                  ← el editador (la página principal)
    ├── admin/                      ← (v1.21) la página de Administración: …/admin/ (solo el administrador)
    │   ├── index.html              ← usuarios y «Quién hizo qué» por día (usa los mismos css/, js/ e img/)
    │   └── admin.js                ← lo que se mueve en /admin (copia de partes de app.js: ver CLAUDE.md)
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

### Probarlo en el computador

- **Rápido:** abre `sitio/index.html` con doble clic. Funciona todo (Excel, hoja, PDF).
- **Igual a como queda publicado** (con Python instalado):
  ```bash
  cd sitio
  python -m http.server 8000
  ```
  y abre `http://localhost:8000`. Así **no hay nube**: la página trabaja sola en el equipo.
- **Con la nube de prueba** (usuarios, historial compartido), con Node instalado, desde la carpeta del repositorio:
  ```bash
  npx wrangler pages dev sitio --port 8788 --d1 DB=editador-local --binding CLAVE_INICIAL=PruebaLocal123
  ```
  y abre `http://localhost:8788` (y `http://localhost:8788/admin/` para la Administración, que **solo funciona con la nube**: sin ella dice «Aquí no hay nube»). Es una base de prueba **en tu computador** (no toca la de verdad). Wrangler crea una carpeta `.wrangler/`: no la subas a GitHub. Desde v1.21 también sirven los puertos 8789 a 8799, para probar varias nubes a la vez.

### Cómo se publica (automático desde GitHub)

El proyecto **editador-reservas-doradoplaza-bg** de Cloudflare Pages está conectado a este repositorio: **cada vez que se sube un cambio a la rama `main`, Cloudflare publica la versión nueva sola** en 1 o 2 minutos. El historial y los ajustes de cada equipo **no se borran** al publicar.

La configuración de compilación tiene que quedar así (Cloudflare → **Workers & Pages** → el proyecto → **Settings** → **Build** → **Build configuration** → **Edit**):

| Campo | Valor |
|---|---|
| Framework preset | `None` |
| Build command | *(vacío)* |
| **Build output directory** | **`sitio`** |
| Root directory (Advanced) | *(vacío)* |

> ⚠️ Si **Build output directory** queda vacío, Cloudflare publica el repositorio entero: la dirección principal da **404** y `README.md` y `CLAUDE.md` quedan a la vista en internet. Después de cambiarlo: **Deployments** → **⋯** → **Retry deployment**.

### Activar la nube en Cloudflare (una sola vez, desde v1.3)

Lo mismo que se hizo en el Manual de turnos, con otros nombres. Mientras no esté, la página sigue funcionando sola en cada equipo.

1. **Crear la base de datos:** dash.cloudflare.com → **Almacenamiento y bases de datos** → **D1 Base de datos SQLite** → **«+ Crear base de datos»** → nombre `editador-reservas-db` → «Ubicación» **sin escoger región** y «Especificar jurisdicción» **sin marcar** → **Crear**. (Las tablas las crea la web sola.)
2. **Vincularla al proyecto:** **Cómputo** → **Workers y Pages** → `editador-reservas-doradoplaza-bg` → pestaña **Configuración** (arriba a la derecha: **Producción**) → **Vinculaciones** → **«+ Agregar»** → **Base de datos D1** → Nombre de variable: `DB` → Base de datos: `editador-reservas-db` → **Guardar**.
3. **Poner la clave inicial:** en la misma pestaña → **Variables y secretos** → **«+ Agregar»** → Tipo **Secreto** → Nombre: `CLAVE_INICIAL` → Valor: una clave de **8 caracteres o más** (mejor 12 a 30, letras y números) → **Guardar**. Debe quedar «🔒 Valor cifrado».
4. **Volver a publicar:** pestaña **Implementaciones** → primera fila → **⋯ → Reintentar implementación**. Las vinculaciones y la clave solo se activan en una publicación nueva.
5. **Crear el administrador:** abre la página. Sale **Entrar** con el aviso «Primera vez». Escribe **tu nombre y apellido** (por ejemplo «Jampier Estrada») y la `CLAVE_INICIAL`. Quedas como **administrador** y la web te pide poner **tu propia contraseña**. Desde ahí la `CLAVE_INICIAL` ya no sirve para entrar.
6. **Crear a los recepcionistas:** página **Administración** (desde v1.21: **Mi cuenta → Ir a Administración**, o abre `…/admin/`) → **+ Nuevo usuario** → su **nombre y apellido** (con eso entra; si dos se llaman igual, agrega el segundo apellido). Escribe tú la contraseña de cada uno y entrégasela en persona: entran con esa y no la pueden cambiar (solo tú, con **Contraseña nueva**).

Para revisar si quedó bien, abre `https://editador-reservas-doradoplaza-bg.pages.dev/api/yo`: con todo listo responde `{"usuario":null,…}`. Si falta algo, responde `{"error":"sin-configurar","falta":[…]}` y dice en `falta` si es `DB`, `CLAVE_INICIAL` o `CLAVE_INICIAL_CORTA`.

**Si el administrador olvida su contraseña:** si hay otro administrador, él le pone una **Contraseña nueva**. Si no, en Cloudflare: **Variables y secretos** → **«+ Agregar»** → Tipo **Texto** → Nombre `RESCATE_ADMIN` → Valor: tu nombre y apellido (por ejemplo «Jampier Estrada»; desde v1.17 también sirve el usuario viejo) → **Guardar** → **Reintentar implementación**. Entra escribiendo tu nombre y apellido y, como contraseña, el valor de `CLAVE_INICIAL`, pon tu contraseña nueva y **borra `RESCATE_ADMIN`** (y vuelve a **Reintentar implementación**). Los datos no se pierden.

**Qué no hacer:** no borres ni le cambies el nombre a la base `editador-reservas-db`, a la vinculación `DB` ni al secreto `CLAVE_INICIAL` (ahí viven los datos y el acceso). No mandes contraseñas por chat ni en capturas. No escribas en el editador documentos de huéspedes, tarjetas ni cifras de caja.

**¿Cuánto cuesta?** Nada con el plan gratis: D1 da 5 millones de lecturas, 100.000 escrituras al día y 5 GB, muchísimo más de lo que usa recepción.

### Trabajar en el computador y en la nube

Una sola rama: **`main`**. Antes de empezar a editar, `git pull` (para traer lo que se hizo en el otro lado); al terminar, commit y `git push` a `main`. Los detalles están en `CLAUDE.md`.

**Cómo trabajamos (resumen; el paso a paso completo está en `CLAUDE.md` → «Cómo trabajamos»):**

1. **Al empezar:** traer lo último de GitHub (JX también trabaja en otras sesiones) y leer `CLAUDE.md`. Revisar que la página publicada esté bien: `…/api/yo` responde `{"usuario":null,"primera":false,…}` y la versión de `/` y `/admin/` es la última.
2. **Antes de construir algo nuevo:** se le pregunta a JX, todo en una sola tanda, con opciones para escoger y la recomendada primero. Nada se inventa: lo que falte queda `{POR CONFIRMAR}`.
3. **Al construir:** el mismo diseño de siempre (colores, letras, botones, modo noche), código para computadores viejos (ES5) y cada parte comentada. Cada cambio publicado sube la versión (v1.22, v1.23…) en las **dos** páginas (`sitio/index.html` y `sitio/admin/index.html`), en este README y en `CLAUDE.md`, con fecha y hora de Colombia.
4. **Antes de subir:** se prueba con el navegador **visible y despacio** (pedido de JX), sin nube y con la nube de prueba, en PC, tabletas, Android e iPhone, en claro y noche, con accesibilidad (WCAG 2.2 AA), HTML válido y la consola limpia (también al recargar). Las pruebas no se suben al repositorio.
5. **Al terminar:** se documenta aquí y en `CLAUDE.md`, y **se sube solo cuando JX lo dice**. Las sesiones en la nube (claude.ai/code) trabajan en una rama `claude/…` y al final la unen a `main`; Cloudflare publica solo en 1–2 minutos y se comprueba que salga la versión nueva.

## 11. Pendientes `{POR CONFIRMAR}`

- ~~Activar la nube en Cloudflare (v1.3)~~ ✅ **activa desde el 21 nov 2026, 10:36 a. m.** (ver «Activar la nube en Cloudflare» en el [punto 10](#10-para-quien-mantiene-la-página)). Si aún no está hecho: que JX cree a los recepcionistas en **Administración** y, si entró con el rescate, que **borre `RESCATE_ADMIN`** en Cloudflare.
- Que el **hotel esté de acuerdo** con guardar 30 días los nombres de los titulares en la nube.
- **Cómo prefieren llamar los estados** del preregistro en la hoja: hoy «Con preregistro» para «Preregistro (…) ✔ Completo» y «Web check-in completo» para «Web check-in ✔ Completo».
- **Otras sedes** (logo, nombre y textos de la hoja): por ahora solo Bocagrande.

## 12. Versiones

En la página, debajo del logo, se ve **solo el número de la versión** con «v» minúscula (desde v1.6, pedido de JX). La fecha y la hora de cada versión se anotan aquí y en `CLAUDE.md`. Horas de Colombia.

| Versión | Fecha y hora | Qué cambió |
|---|---|---|
| **v2.0** | 23 nov 2026, 12:11 p. m. | JX: «quiero que sean botones mejor, así se ve solo algo escrito y ya, muy básico… no dejar ninguno así». **Todo lo que se toca es un botón** (ya no texto subrayado): «Cerrar», «Salir de este equipo» e «Ir a Administración» en **Mi cuenta** (en el editador y en `/admin`), los botones de cada usuario en `/admin`, «Volver a lo del Excel» y «Quitar de la hoja» al corregir, «Usar DD/MM/AAAA» y «Corregir las sugeridas» en los avisos, «Agregarla a mano», «Devolver a la hoja», «Borrar» y «Borrar todo el historial», y «Volver al editador». Lo que borra o saca de la cuenta va en rojo. Se acomodan en todas las pantallas (en celular angosto, uno por renglón). Solo el enlace a la extranet sigue siendo enlace (abre otra página). **La sesión ya no se cierra al cerrar la pestaña, el navegador o apagar el PC: solo a las 2 horas sin usar** (con «¿Sigues ahí?» 1 minuto antes); en un PC compartido, «Salir de este equipo» al terminar el turno. JX dejó el proyecto **en pausa en esta versión** hasta que avise algo nuevo. |
| **v1.27** | 23 nov 2026, 8:27 a. m. | JX: «si Daniel cambió el tema también me apareció a mí y no debería… cada quien con un tema personal», «un sonido de hecho o de listo después de imprimir… en Más ajustes para activarlo y desactivarlo» y «los historiales tienen un desplegable… quiero que también lo tengan los usuarios». **El tema es de cada cuenta** (se guarda en la nube y te sigue a cualquier equipo; en la puerta «Entrar», automático). **Sonido al imprimir** «impresora + campanita» (el n.º 8 que escogió JX en la prueba): **viene prendido** y cada uno lo apaga en **Más ajustes** solo para su cuenta. En `/admin` **cada usuario se despliega** (cerrado: nombre y chips; abierto: sus botones). La casilla «Llegó» y «Ahorrar papel» siguen siendo del administrador para todos. |
| **v1.26** | 23 nov 2026, 6:45 a. m. | JX: «ya no quiero media hora… mejor 2 horas». **La sesión se cierra sola a las 2 horas sin usar la página** (antes 30 minutos), en el editador, en `/admin` y en la nube. «¿Sigues ahí?» sigue saliendo 1 minuto antes. Al cerrar la pestaña se sigue cerrando igual. |
| **v1.25** | 23 nov 2026, 6:36 a. m. | JX: el enlace **«Descarga el Excel desde aquí: extranet.doradoplaza.com»** sube: en la puerta va **debajo de la tarjeta de «Entrar»** (con aire, sin pegarse) y, ya adentro, **debajo de los pasos de «Sube el Excel»**. En el pie ya no va (queda la nota «Herramienta interna…», «Antes de imprimir…» y el crédito). |
| **v1.24** | 22 nov 2026, 9:40 p. m. | JX: «lo único era cambiar el H1». El **título** sigue diciendo **«Editador De Reservas De La Extranet»** y el enlace **«Descarga el Excel desde aquí: extranet.doradoplaza.com»** vuelve **abajo, al pie**, donde estaba en la v1.22 (arriba del título ya no va). El pie: el enlace, la nota de siempre, «Antes de imprimir…» y el crédito. |
| **v1.23** | 22 nov 2026, 9:38 p. m. | **Arreglo de la v1.22** (JX: «el texto era aquí, no allá abajo»): el **título** de arriba ahora dice **«Editador De Reservas De La Extranet»** y el enlace **«Descarga el Excel desde aquí: extranet.doradoplaza.com»** va **encima del título** (también en la pantalla «Entrar»). El pie vuelve a ser el de antes (nota de privacidad, «Antes de imprimir…» y el crédito). La pestaña del navegador y el PDF siguen con el nombre corto «Editador de reservas DP». |
| **v1.22** | 22 nov 2026, 9:26 p. m. | **Pie del editador nuevo** (pedido de JX): arriba, el enlace para bajar el Excel —«Descarga el Excel desde aquí: **extranet.doradoplaza.com**», subrayado en dorado, con un iconito de descarga; se abre en otra pestaña—; debajo, el nombre **«Editador De Reservas De La Extranet»** (en vez de «Herramienta interna de recepción…»), y se queda «Antes de imprimir, revisa que la lista coincida con la extranet.». La página `/admin` conserva su pie. Arreglo de paso: al recargar la página, Chrome mostraba un aviso en la consola por la letra de los títulos (Karla); ya no. Documentado también cómo trabajamos y la v1.21. |
| **v1.21** | 21 nov 2026, 11:04 p. m. | **La Administración pasa a una página aparte: `…/admin`** (pedido de JX: «solo el mío… aparte de la web»): usuarios y «Quién hizo qué», solo para el administrador; en el editador queda **Mi cuenta → Ir a Administración**. **El historial y «Quién hizo qué» van por día** («Historial del domingo 22/11/2026»: el más reciente abierto, los días anteriores cerrados; se abren al tocarlos). «Quién hizo qué» vuelve a ser solo del administrador (la Líder ya no lo ve). (Se hizo en otra sesión; se anotó aquí en la v1.22.) |
| **v1.20** | 21 nov 2026, 10:17 p. m. | **«Ver contraseña»** de cada compañero (solo el administrador, pidiendo su propia contraseña; copia cifrada de las contraseñas que se pongan desde ahora). **`CLAVE_INICIAL` ya no es obligatoria** cuando hay usuarios: si falta o se borra por error, la nube sigue funcionando (con la base vacía sí se necesita, para que nadie más se adueñe de la nube). |
| **v1.19** | 21 nov 2026, 9:55 p. m. | La **Líder de Recepción cambia su propia contraseña** (Mi cuenta). Las sesiones viejas de «Recordar en este equipo» quedan con las reglas nuevas (30 min sin usar, 14 h como máximo). En «Mi cuenta» de recepción: «Tu contraseña te la da Jampier». Explicación de dónde quedan las contraseñas y qué es `CLAVE_INICIAL`. Revisión completa antes de publicar: HTML válido, ES5, accesibilidad AA, 25 + 22 pruebas. |
| **v1.18** | 21 nov 2026, 9:37 p. m. | **Nombres siempre con Mayúscula Inicial** («Jaime valera» → «Jaime Valera»; también los que ya existían) y **permiso nuevo «Líder de Recepción»**: ve el historial de todos y «Quién hizo qué», sin manejar usuarios ni borrar. En Administración, el botón **«Permisos»** reemplaza a «Hacer / Quitar administrador». |
| **v1.17** | 21 nov 2026, 9:32 p. m. | **Todos entran con su nombre y apellido, también los usuarios creados antes de v1.13** (pedido de JX: no podía entrar ni él ni «Jaime Valera»). Los usuarios viejos tenían un «usuario» aparte del nombre (por ejemplo `jx` con el nombre «Jampier Estrada»); la nube ahora los iguala sola al nombre y además deja entrar escribiendo el nombre. El **rescate del admin** sirve escribiendo el nombre o el usuario en `RESCATE_ADMIN`. |
| **v1.16** | 21 nov 2026, 9:23 p. m. | **Pantalla «Entrar» con menos texto** (pedido de JX): se quitó la nota «Por seguridad, la sesión se cierra sola…» y el párrafo de privacidad de la tarjeta (queda el del pie de la página). Cuando la sesión se cierra por cerrar la pestaña ya no sale ningún mensaje: solo pide entrar. |
| **v1.15** | 21 nov 2026, 9:16 p. m. | Pedido de JX: **cada recepcionista ve solo su historial** (el admin ve el de todos y filtra por persona) · **al entrar la pantalla sale limpia** y está el botón **«Guardar y hacer otro»** · **cada Excel queda como un listado aparte** · **la sesión se cierra sola** al cerrar la pestaña o a los **30 min sin usar** (con «¿Sigues ahí?» 1 min antes); ya no hay «Recordar en este equipo». Los listados viejos de la nube quedan con su dueño (por el nombre de quien los subió). |
| **v1.14** | 21 nov 2026, 8:30 p. m. | **Pantalla «Entrar» más limpia:** el logo un poco más pequeño, campanita de recepción en vez del escudo, el ejemplo es «Jampier Estrada», sin el «(no importan las mayúsculas…)» (igual siguen sin importar) y «¿Olvidaste la contraseña?» dice «Pídeselo a Jampier». |
| **v1.13** | 21 nov 2026, 6:17 p. m. | **El usuario es el nombre y apellido** (pedido de JX): se entra escribiendo «Jaime Valera» sin importar mayúsculas, tildes ni espacios de más. Al crear un usuario hay un solo campo (nombre y apellido); «Nombre» en Administración cambia también con qué entra. Los usuarios viejos (sin espacios) siguen entrando igual hasta que les pongas su nombre completo. |
| **v1.12** | 21 nov 2026, 5:56 p. m. | La píldora **«✓ Datos guardados exitosamente»** pasa **abajo**, encima de la barra (como en el Manual de turnos), y se sube sola para no taparse con «Deshacer», los avisos ni la guía. |
| **v1.11** | 21 nov 2026, 11:27 a. m. | Pantalla de carga del Excel de **10 s** (antes 12). **Bienvenida al instante** al entrar (antes salía primero la página). **Nube como en el Manual de turnos:** botón con ☁ y punto amarillo que late mientras guarda → verde «Guardado · hora»; píldora **«✓ Datos guardados exitosamente»** con qué se guardó y «☁ Guardando en la nube…» → «☁ También en la nube». |
| **v1.10** | 21 nov 2026, 10:21 a. m. | **La hoja lleva la fecha de las reservas** (la del Excel, no la de hoy: «Reservas del: domingo 22/11/2026»); con varios días pregunta cuál. **«Impreso el …, h:mm … por …»** en la hoja, el PDF y lo que se comparte: hora exacta y nombre de quien la sacó (el usuario de la nube, o la ventanita obligatoria «¿Quién imprime?» que se recuerda en el equipo). Ctrl+P pasa por la ventanita; desde el menú del navegador sin nombre no sale la hoja. |
| **v1.9** | 17 nov 2026, 7:05 p. m. | **Pantalla de carga del Excel de 12 s** (pedido de JX: «que se tome su tiempo»): el logo se completa y vuelve a empezar, 4 vueltas, mientras el % sube parejo hasta 100; después sale la lista. La carga al abrir la página sigue igual (2,5 s). En el aviso «Ojo», el nombre equivocado del archivo sale **en rojo con un ícono ⚠**. |
| **v1.8** | 17 nov 2026, 6:45 p. m. | **Excel incorrecto**: si suben otro archivo, sale la ✗ roja «Excel incorrecto» pidiendo el verdadero listado de reservas de la extranet (**«EXTRANET  DORADO PLAZA.xlsx»**, nombre que ahora aparece en la zona de subir y en los errores). Si el archivo trae las columnas pero se llama distinto, se lee igual y sale el aviso amarillo «Ojo». **Basurita roja en cada reserva** (a la derecha de «Corregir»): doble pregunta para las de la extranet; quedan en «Quitadas de la hoja» y no salen en la hoja ni en el PDF. Crédito: **JX Enterprise**. |
| **v1.7** | 17 nov 2026, 5:56 p. m. | **Las contraseñas las pone el administrador** (pedido de JX): al crear un usuario escribes tú su contraseña y entra con esa, sin que la web le pida cambiarla; recepción ya no puede cambiar su contraseña (solo el admin, con «Contraseña nueva»). Solo la primera entrada del admin con la `CLAVE_INICIAL` pide poner la suya. |
| **v1.6** | 17 nov 2026, 5:51 p. m. | La versión debajo del logo vuelve a la «v» minúscula (pedido de JX). |
| **v1.5** | 17 nov 2026, 5:40 p. m. | **Ventanitas como las del Manual de turnos**: basurita roja que se dibuja en 360° en todo lo que se elimina (con «Deshacer» 10 s), ✓ verde en todo lo que sale bien (se quita solo a los 8 s), ✗ roja en los errores y puerta dorada al salir. Guía **«Tu hoja está aquí abajo ↓»** (una vez por entrada, 8 s). La versión debajo del logo un poco más pequeña y con «V» mayúscula. Arreglo para Safari: el ✓ de la fecha salía dos veces. |
| **v1.4** | 17 nov 2026, 4:23 p. m. | Botón **Eliminar** (🗑 rojo) en la barra de abajo, junto a Imprimir / PDF / Compartir: solo aparece con un Excel subido y quita ese listado (también del historial) después de confirmar. Debajo del logo queda **solo la versión** (sin fecha ni hora). La barra cabe con 4 botones desde el plegable de 280 px hasta PC. |
| **v1.3** | 17 nov 2026, 3:46 p. m. | **Nube con usuarios** (pedido de JX): cada recepcionista entra con su usuario y contraseña; historial compartido entre todos los equipos (Cloudflare D1) que se borra solo a los 30 días; funciona sin señal y sube al volver; si dos equipos corrigen a la vez se juntan los cambios. **Administrador:** usuarios, «Quién hizo qué», borrar del historial y ajustes de la hoja para todos. **Pantalla de carga** igual a la del Manual de turnos (2,5 s parejos). Contraste del número de versión. |
| **v1.2** | 17 nov 2026, 2:57 p. m. | Ahora se llama **Editador de reservas DP**. Versión y hora de actualización debajo del logo. README nuevo. Publicación en Cloudflare corregida: solo se publica `sitio/` (la dirección principal abre el editador y `CLAUDE.md` ya no sale en la web). Probado también con el motor de Safari de iPhone. |
| **v1.1** | 17 nov 2026, 2:33 p. m. | Revisión de errores y responsive (prioridad PC; también Android e iPhone): «Más ajustes» ya no mueve los botones, el «notch» del iPhone acostado, Guardar/Cancelar siempre visibles en pantallas bajitas, barra más delgada con el celular acostado y fondo sin tirones al hacer scroll. |
| **v1.0** | 17 nov 2026, 2:12 p. m. | Primera versión: del Excel de la extranet a la hoja «LISTADO DE RESERVAS», con corrección, novedades, PDF, impresión, historial y modo noche. |

Cada cambio que se publica sube la versión (v1.23, v1.24…) y se anota aquí.

## 13. Fuentes, licencias y propiedad

- Publicación conectada a Git y configuración de compilación: [Cloudflare Pages · Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/) y [Build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/).
- Nube: [Cloudflare D1](https://developers.cloudflare.com/d1/) ([precios y límites gratis](https://developers.cloudflare.com/d1/platform/pricing/)) y [Pages Functions](https://developers.cloudflare.com/pages/functions/) (la carpeta `functions/` se publica con la conexión a GitHub; arrastrando la carpeta no: [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)).
- Datos personales: [Ley 1581 de 2012](https://www.unidadvictimas.gov.co/wp-content/uploads/Documentos/ley/Ley_1581_2012.pdf) y [concepto de la SIC sobre la nube](https://sedeelectronica.sic.gov.co/sites/default/files/normatividad/Concepto_14-76566.pdf) (no es asesoría legal).
- Privacidad sin `robots.txt`: [Google · Bloquear la indexación con noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing).
- Compartir solo el PDF (sin texto): [WebKit · bug 251500](https://bugs.webkit.org/show_bug.cgi?id=251500).
- Formatos: el .xlsx es Office Open XML ([ECMA-376](https://ecma-international.org/publications-and-standards/standards/ecma-376/)) comprimido con DEFLATE ([RFC 1951](https://www.rfc-editor.org/rfc/rfc1951)); el PDF usa Helvetica, una de las letras estándar que trae todo lector de PDF.

Letras: **Karla** © 2019 The Karla Project Authors y **Arimo** © 2020 The Arimo Project Authors, licencia SIL Open Font License 1.1 (archivos en `sitio/css/fuentes/`).

**Propiedad:** el código es de JX. Se publica en la cuenta de Cloudflare de JX (dirección gratuita `*.pages.dev`, sin dominio). Todos los archivos van sin minificar y comentados para que cualquiera pueda editarlos (el cargador trae también su versión legible). La marca y el logo Dorado Plaza son del hotel.

---

**Diseño y desarrollo: JX Enterprise**
