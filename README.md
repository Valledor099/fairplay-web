# FAIR PLAY

## UI kit en SVG para Figma · 15 de octubre de 2026

El UI kit se entrega en [design/ui-kit-svg](design/ui-kit-svg/): 12 láminas SVG con texto en curvas, 12 versiones con elementos de texto, fuentes y licencias, textos copiables y tokens. La página del kit y su enlace en el pie fueron retirados de la web a pedido del usuario.

Se conservan las correcciones basadas en los capítulos 3 y 8 de Marisol Parnofiello: horario visible, etiquetas, puntuación, jerarquía del diálogo y recorrido de foco con teclado. [La documentación del kit](design/ui-kit.md) describe los SVG, el alcance de importación y cómo regenerarlos.

## Cambios a partir del informe de usabilidad · 15 de octubre de 2026

- Acceso «Planificá tu visita» desde la portada y el menú, con fecha, entrada gratuita, cantidad total de personas, sede y enlace oficial para llegar.
- Dirección verificada en https://www.clubarquitectura.com.ar/contacto/: Av. Francisco Beiró 2116, CABA. Apertura propuesta a las 08:00 h por indicación del usuario; no es el horario oficial del club. El contador usa esa apertura en la zona horaria de Buenos Aires.
- Las otras recompensas pueden comprarse en el evento o ganarse en actividades, según la definición del usuario. La camiseta conserva la condición de los tres sellos. Las compras son opcionales y no están incluidas en la entrada gratuita; no se implementó una tienda ni se fijaron precios.
- Botones específicos para cambiar cantidad y corregir correo desde la revisión, conservando el resto de los datos y llevando el foco al campo correspondiente.
- Identificación de la solicitud y el QR como demostración, y ayuda para localizar el PNG descargado.
- El acceso directo al formulario ya no espera a que termine de cargar el pasaporte 3D. Las condiciones de recompensas usan desplegables nativos y recalculan la posición del recorrido al abrirse.

Validación de esta modificación: 19 pruebas técnicas aprobadas y compilación de producción correcta. La verificación visual e interactiva de esta iteración queda pendiente. Los hallazgos iniciales proceden de la revisión de contenidos y las comprobaciones técnicas; no se atribuyen a sesiones con participantes.

Sitio en español sobre deporte, poder y sportswashing. Construido con Vite, GSAP, Lenis y Three.js; tipografías locales Barlow Condensed y Manrope.

## Desarrollo

Requiere Node.js 22.12 o posterior.

```sh
npm ci
npm run dev
```

Vite sirve el proyecto en http://127.0.0.1:4180. `npm test` comprueba los estados e interacciones; `npm run build` genera `dist/` y `npm run preview` permite revisar la compilación.

## Vercel

Importar este repositorio, seleccionar **Vite** y dejar **Root Directory** en la raíz del repositorio (`.`). `vercel.json` configura `npm run build` y la salida `dist`. No se requieren variables de entorno.

## Recorrido

Portada interactiva con acceso animado a entradas y contador → explicación de sportswashing → pasaporte 3D → abanico de recompensas → nosotros → entradas.

La explicación muestra cómo el prestigio deportivo puede ocultar otras historias. Sus ejemplos —F1 en Arabia Saudita, Six Kings Slam y Argentina 1978— muestran una fotografía local al pasar el cursor o recibir foco, y enlazan a sus fuentes. En móvil, «Ver imagen» permite abrir y cerrar la vista previa. `src/sportswashing-cases-data.js` conserva sus destinos y créditos.

El pasaporte se abre, recibe tres sellos y se cierra con el scroll. A continuación, las seis recompensas aparecen como tarjetas fotográficas grandes en una galería horizontal independiente. Deslizar, usar la rueda o las flechas permite pasar de una en una, con la selección centrada. Hover, toque o teclado muestran la fotografía de uso del producto.

Las animaciones respetan movimiento reducido. Sin JavaScript hay contenido legible; sin WebGL se conserva la imagen alternativa del pasaporte.

## Evento y reservas

El evento está fijado para el **12 de diciembre de 2026, durante todo el día**, en Club Arquitectura, CABA. `src/event-config.js` centraliza la fecha, la zona horaria y el contador. El formulario solicita entre una y seis entradas y datos de contacto, sin elegir fecha ni horario.

La reserva y el QR son una **demostración local**: no hay servidor, pagos, correo ni reservas reales. El QR indica `validForAdmission:false` y excluye datos personales. Para habilitar entradas reales se debe conectar un servicio de reservas.

## Repositorios independientes

Este repositorio contiene únicamente el proyecto web y sus recursos de diseño. Las notas de Obsidian se siguen versionando por separado en el repositorio del Vault.

En la instalación original, la carpeta es `output/fairplay-web` dentro del Vault y está excluida del Git padre. Para guardar cambios de la web, ejecutar Git desde esta carpeta; para guardar notas, ejecutarlo desde la raíz del Vault. Cada repositorio tiene sus propios commits y remoto.

`node_modules`, `dist`, capturas de QA, archivos locales de Vercel y credenciales están excluidos de Git. Los originales de imágenes, fuentes y scripts de diseño se conservan como recursos de trabajo en `design` y `blender`; los materiales retirados del diario y celebración no se importan en la experiencia actual.

## Corrección de usabilidad y contenidos · 14 de octubre de 2026

Se aplicó el informe `Informe_heuristico_FairPlay.pdf` actualizado (con el retorno del QR ya corregido) a la web principal. El sustento de contenido son los capítulos 3 y 8 de *Diseño de contenidos*, de Marisol Parnofiello, y el extracto disponible en el Vault. Los criterios del libro orientan el contenido y los componentes; no se atribuyen al libro decisiones sobre el estilo visual o las animaciones.

- H1: sección actual en todas las opciones del menú; pasos «Datos y cantidad → Revisión → Entrada» con etapa y estados; carga y resultado del QR. Los sellos animados se identifican como una vista previa y no como una visita completada.
- H2/H4: «Entradas», «Lavado de imagen», «Bolsa de tela» y «Calcomanías»; voseo, acciones estables y títulos sin punto final. Se mantiene el término inglés explicándolo y marcando su idioma en la palabra gráfica.
- H3/H5/H7: revisión editable con cantidad y datos conservados en memoria; límites del selector; vuelta con destino explícito; cancelación reversible hasta confirmar el borrado. Volver al inicio desde el QR no borra el comprobante mientras la página sigue abierta.
- H6: acción «Abrir pasaporte», enlaces «Cómo usar el pasaporte» y «Ver recompensas». Las flechas anterior/siguiente sólo mueven la galería; el acceso a entradas es un enlace independiente.
- H8: jerarquía de lectura y tamaño de campos y controles; se conserva el diseño existente. Los nuevos textos de ayuda se agrupan junto a la tarea.
- H9: errores específicos junto al campo; fallo de generación con reintento y datos conservados; descarga repetible y alternativa para abrir y guardar el QR. No se afirma que un archivo se haya guardado cuando el navegador sólo recibió la solicitud de descarga.
- H10: instrucciones de pasaporte físico, tres estaciones y tres sellos; el Vestuario no agrega otro sello; condiciones de la camiseta y distinción de los demás productos. En el comprobante se explica la mecánica presencial propuesta y el alcance de la demostración.

Aplicación del capítulo 3: contenido antes que componente, botones con acción y objeto, navegación estable, formulario de una columna agrupado por tema, errores cerca de los campos, diálogo sólo para confirmar el borrado e indicador de pasos con nombres breves. Aplicación del capítulo 8: español comprensible, extranjerismos evitables reemplazados, fechas legibles y puntuación consistente. El voseo conserva la audiencia y el registro ya usados en la web; no sustituye una investigación con personas.

Se mantienen la fecha, sede, gratuidad, límite de seis entradas y mecánica de recompensa de la versión existente. No se verificó su condición de evento real. La demostración no envía datos, no reserva cupos y no crea entradas válidas. Los datos y el QR sólo viven en memoria hasta recargar o cerrar la página. No se incorporó almacenamiento de datos personales.

Validación funcional del navegador: `scripts/qa-heuristics.mjs`, con evidencias en `evidence/heuristics-*`. Se ejecuta contra el servidor local de la compilación (`http://127.0.0.1:4183/` por defecto; configurable con `FAIRPLAY_QA_URL`). Revisa móvil, escritorio y movimiento reducido; entrada inválida, edición, límites, cancelación, descarga, historial y errores provocados de generación/descarga. Estas comprobaciones técnicas no equivalen a pruebas con usuarios.
