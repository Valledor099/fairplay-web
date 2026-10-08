# Publicación en Vercel · 8 de octubre de 2026

- Publicado el build estático actual mediante la CLI oficial de Vercel y Build Output API v3: 72 recursos, 28,07 MB. Configuración para Vite en `vercel.json`; directorios de trabajo y credenciales ignorados por Git.
- URL: https://temporary-nimble-poplar-ews8dj6.vercel.app. Vercel informó `READY` y un vencimiento temporal el 8 de octubre de 2026 a las 02:37 de Argentina. La permanencia requiere que el usuario reclame el proyecto desde su cuenta; enlace de reclamación guardado sólo en `.deploy-tools/deployment.json`, fuera de Git.
- Browser QA público en 1209 × 884 y 390 × 844: HTTP 200, fecha y contador visibles, pasaporte 3D cargado, seis productos con fotografías ampliadas (469 y 248 px de altura) y reserva completa hasta la confirmación con QR. Sin errores de ejecución ni desborde horizontal.
- Evidencias: `evidence/vercel-hero-*.jpg`, `vercel-rewards-*.jpg` y `vercel-qa.json`. El servidor local se mantiene activo.

Las secciones siguientes documentan versiones anteriores.

# Recompensas de mayor tamaño · 8 de octubre de 2026

- Cartas fotográficas mucho mayores: cálculo del tamaño a partir de las esquinas transformadas y de la altura completa del abanico. Base alineada y menor separación/ángulo por carta para conservar el conjunto unido. Encabezado más compacto para dedicar mayor altura a las imágenes.
- La seleccionada continúa centrada, recta y al frente; las seis cartas mantienen una porción visible. Conservados título blanco, foto completa, hover/toque de foto en uso, flechas y selección de una en una.
- Revisados 1864 × 884 y 1209 × 884, y ajuste móvil final en 390 × 844 y 325 × 650. Recorrido 01 → 03 → 06 → 01, siguiente y cambio de imagen correctos; sin errores ni desborde. Muestreo de superficies confirma que ninguna carta queda totalmente oculta. Alternativas sin JavaScript y movimiento reducido comprobadas.
- 22 pruebas aprobadas y build correcto. Capturas actualizadas en `evidence/fullbleed-fan-*.jpg`; `fullbleed-fan-qa.json` registra el ajuste móvil final. Se mantiene activo http://127.0.0.1:4181/.

Las secciones siguientes documentan versiones anteriores.

# Portada y reserva de jornada única · 8 de octubre de 2026

- Evento fijado para el sábado 12 de diciembre de 2026, durante todo el día, en Club Arquitectura, CABA. Configuración única compartida por portada, sección Tickets, reserva, resumen, confirmación y contenido del QR.
- Botón animado de entrada en portada con tickets que se despliegan al recibir hover o foco. Cuenta regresiva de días, horas, minutos y segundos debajo; usa medianoche de Buenos Aires. Durante la jornada muestra «Es hoy. Te esperamos todo el día.» y, al terminar, «El encuentro terminó.», sin números negativos. Actualización integrada en el ticker existente, animación de números sólo al cambiar y alternativa de movimiento reducido.
- Reserva simplificada a cantidad (1–6), nombre, correo y accesibilidad opcional. Eliminados fechas, horarios y fixtures de cupos por turno. Edición y regreso conservan datos durante la sesión; el QR tiene fecha fija y acceso `all-day`, sin horario ni datos personales.
- Actualizados texto, recorrido y diagramas Mermaid de `T. SOP. Informatico/TP3/Flows/TaskFlow.md` y `UserFlow.md`: entrada desde portada/Tickets, formulario único, errores de validación, revisión, edición, confirmación y descarga.
- Browser QA en 1864 × 884, 1209 × 884, 390 × 844 y 325 × 650: CTA separado del título y sobre el contador, sin desborde, segundos avanzando, reserva completa sin turnos, validación, edición, regreso y descarga del QR. También verificados día del evento, finalización, movimiento reducido y fecha visible sin JavaScript. Sin errores de ejecución. Evidencias: `evidence/single-day-*.jpg` y `single-day-qa.json`.
- 22 pruebas aprobadas y build correcto; permanece la advertencia previa del bundle de Three.js. Servidor local activo en http://127.0.0.1:4181/.

Las secciones siguientes documentan versiones anteriores.

# Selección de productos en una mano de cartas · 8 de octubre de 2026

- Cada carta es una fotografía completa, sin marco ni bloque de texto inferior. Nombre blanco superpuesto con degradado para lectura; se conserva el cambio entre producto y foto en uso.
- Las seis cartas permanecen solapadas en un mismo abanico y conservan su orden. Scroll, flechas y gestos desplazan la selección una posición por vez; la elegida queda centrada, recta y al frente. No hay recorrido circular ni salida individual del grupo.
- Browser QA en 1864 × 884, 1209 × 884, 390 × 844 y 325 × 650: recorrido 01 → 03 → 06 → 01, siguiente, hover/toque, título blanco y foto ocupando toda la carta. Comprobado mediante muestreo de las superficies que las seis cartas tienen una porción visible. Sin errores ni desborde horizontal. Alternativas sin JavaScript y con movimiento reducido comprobadas.
- 21 pruebas aprobadas y compilación correcta, con la advertencia previa del bundle de Three.js. Evidencias: `evidence/fullbleed-fan-*.jpg` y `fullbleed-fan-qa.json`. La página sigue en http://127.0.0.1:4181/.

Las secciones siguientes documentan versiones anteriores.

# Nueve ajustes visuales del navegador · 8 de octubre de 2026

- La escena Censura/Abusos/Silencio reutiliza el retrato conceptual del futbolista al que un político anónimo tapa la boca. El texto queda sobre el lado oscuro y el gesto permanece visible. Retirados la nota bajo Prestigio/Éxito/Gloria, el pie completo de sportswashing, la indicación sobre hover/clic, el enlace de salida al pasaporte y el texto secundario junto a Nosotros.
- Flechas SVG de 54 px en los casos, con giro de 180° y cambio de fondo/color sobre la fila o al recibir foco. Conservados enlaces de contexto y ventana de video. Movimiento reducido cambia de dirección de forma inmediata.
- Abanico de seis productos más abierto, con separación lateral regular y fotografías mayores. Cada carta conserva sólo el nombre; el cálculo de tamaño considera las esquinas rotadas para evitar recortes. En el viewport solicitado de 1864 px el abanico ocupa 813 px, frente al conjunto mucho más compacto de la versión anterior.
- Botón de entrada destacado, cinco tickets con bordes perforados y animación GSAP al hacer hover o recibir foco. Reversión al salir, limpieza de listeners y uso del mismo ticker existente. El enlace sigue abriendo el formulario; sin JavaScript conserva un botón visible y oculta las piezas decorativas.
- Browser QA en 1864 × 884, 1209 × 884, 390 × 844 y 325 × 650: eliminaciones verificadas, foto correcta, flechas y ventana de video, seis cartas completas, despliegue de tickets dentro del ancho y navegación a la reserva. Sin errores de ejecución ni desborde horizontal. Movimiento reducido comprobado para el botón.
- 21 pruebas aprobadas y build correcto. Continúa la advertencia previa del tamaño del bundle. Evidencias: `evidence/comments-*.jpg` y `nine-comments-qa.json`. Servidor con respuesta HTTP 200 en http://127.0.0.1:4181/.

Las secciones siguientes documentan versiones anteriores.

# Comentarios del navegador y mano de cartas · 8 de octubre de 2026

- Retirado el enlace «Profundizá con Amnistía Internacional» y las tres imágenes bajo las estaciones del pasaporte. El pasaporte 3D y los casos con video siguen activos.
- Las recompensas tienen un pivote común, ángulos regulares, igual tamaño y altura uniforme de rótulos. La selección eleva una carta sin alterar el orden ni las proporciones de las demás; fotografías nítidas y radio suave de esquinas.
- Verificados escritorio 1209 × 884 y móviles 390 × 844 y 325 × 650. Seis cartas dentro del viewport; recorrido 01 → 06 → 01, botón siguiente, hover de foto y toque comprobados. Rótulos móviles completos dentro de cada carta. Sin errores de ejecución ni desborde horizontal.
- 21 pruebas aprobadas, incluyendo continuidad del abanico y mantenimiento del orden; compilación final correcta con la advertencia previa del tamaño del bundle. Evidencias: `evidence/card-hand-*.jpg`, `card-hand-qa.json` y `card-hand-captions-qa.json`.
- Servidor local comprobado: respuesta HTTP 200 en http://127.0.0.1:4181/.

Las secciones siguientes documentan versiones anteriores.

# Casos sin miniaturas y hover restaurado · 8 de octubre de 2026

- Retiradas las tres imágenes junto a los títulos y su espacio reservado en escritorio, móvil y alternativa sin JavaScript.
- Corregida la ventana de activación del hover: ahora coincide con el panel de explicación, incluyendo la entrada de los títulos. También se detecta el cursor que ya estaba sobre un enlace cuando se activa el panel.
- Reproducción real de los tres videos comprobada: ventana visible, tiempo avanzando, cierre al salir, foco de teclado y clic hacia el contexto. Sin errores de ejecución. Evidencia: `evidence/hover-restored-*.jpg` y `hover-restored-qa.json`.
- 21 pruebas aprobadas y compilación correcta; permanece la advertencia previa del tamaño del bundle.

Las secciones siguientes documentan versiones anteriores.

# Renovación tipográfica, fotografías y motion design · 8 de octubre de 2026

- Barlow Condensed para títulos y Manrope para lectura y controles; fuentes WOFF2 locales con sus licencias SIL OFL. Ajustados portada, definición, casos, pasaporte, colección, Nosotros, Tickets, pie y reserva.
- Dos imágenes originales creadas con Imagegen: vestuario y sellado del pasaporte. Originales, prompts y derivados WebP en `design/visual-refresh/`; miniaturas de casos e imágenes de estaciones reutilizan recursos existentes.
- Máscaras por palabras, apertura vertical de fotografías, parallax con scroll y puntero, entrada del título de colección, cambios de imagen entre estaciones, cartel de Tickets y fotografía del pie. GSAP usa el ticker y Lenis existentes; las propiedades de cada animación tienen un propietario y limpieza al salir.
- Revisión real a 325 × 650, 390 × 844, 1024 × 768 y 1440 × 900: fuentes cargadas, título principal completo, sin desborde horizontal ni errores de ejecución. Secuencia de imágenes 1 → 2 → 3 verificada contra el estado del pasaporte.
- Reserva móvil comprobada hasta la confirmación con QR. Movimiento reducido y versión sin JavaScript conservan títulos, enlaces y fotografías legibles. Nombres accesibles de los títulos incluyen los espacios entre líneas.
- 21 pruebas aprobadas; build final correcto. Continúa la advertencia previa por el tamaño del bundle Three.js. Evidencias: `evidence/refresh-before-*`, `refresh-after-*`, `refresh-*-final-*.jpg` y `refresh-final-qa.json`.
- Servidor solicitado por el usuario disponible en http://127.0.0.1:4181/.

Las secciones siguientes documentan versiones anteriores.

# Ejemplos con video al pasar el cursor · 8 de octubre de 2026

- Revisada Work de https://tigranz.com/ en navegador: títulos enlazados, rectángulo flotante y video reproduciéndose durante hover. La adaptación añade tres casos a la derecha de la definición y conserva la identidad visual de Fair Play.
- F1 en Arabia Saudita, Six Kings Slam y Argentina 1978: reproducción real, silenciada, con tiempo de video avanzando; clips de Mercedes-AMG F1, DAZN Sport y Televisión Pública. Un solo iframe reutilizado y cargado bajo demanda. Los tres clics abren sus páginas de contexto verificadas.
- Ventana animada con GSAP que acompaña al cursor; cambio de caso, foco de teclado, salida de lista y cierre al avanzar al pasaporte comprobados. No se incorporan otro ticker ni otro motor de scroll.
- Escritorio 1440 × 900; móviles 390 × 844 y 319 × 650: sin errores de ejecución ni desborde horizontal. En móvil, contenido en columna con desplazamiento nativo y botones «Ver video». Corregidos orden de estilos y seguimiento de posición para evitar solapamientos del contenido y congelación de la ventana.
- Revisión final a 601 y 700 px: ventana dentro del viewport y seguimiento del cursor confirmado. A 319 y 390 px, un gesto de 240 px desplaza solamente el contenido de la explicación, manteniendo fijo el progreso de la historia. Barra inferior con fondo para conservar legibilidad sobre la lista.
- Movimiento reducido respeta reproducción voluntaria. Sin JavaScript siguen presentes los tres enlaces y se ocultan los controles de video. Créditos, fuentes y referencia en `design/sportswashing-case-sources.md`.
- 21 pruebas aprobadas y build de producción correcto. Permanece la advertencia previa del bundle de Three.js. Evidencias en `evidence/sportswashing-case-*.jpg`, `sportswashing-cases-*.jpg`, `sportswashing-definition-*.jpg` y `sportswashing-cases-qa.json`.

Las secciones siguientes documentan versiones anteriores.

# Sportswashing directo al pasaporte · 7 de octubre de 2026

- Retirados del HTML activo el equipo celebrando, el diario THE TIMES, las noticias y su invitación impresa. El orden es portada → sportswashing → pasaporte → recompensas → nosotros → tickets. Los módulos anteriores ya no se importan.
- Nueva animación reversible con una única timeline GSAP controlada por el ticker existente: acercamiento al trofeo en el estadio, palabras censura/abusos/silencio, barrida que las cubre con prestigio/éxito/gloria, levantamiento de la superficie y título Sportswashing. La definición dispone de una pausa de lectura y un enlace a Amnistía Internacional. La salida funde directamente con el modelo real del pasaporte sin capturas de diario ni segundo renderer.
- Browser QA con Chromium instalado: escritorio 1440 × 900, móvil 390 × 844 y móvil pequeño 319 × 650; sin errores de ejecución ni desbordes. La definición termina en 752,5 / 637,3 / 509,7 px respectivamente y permanece completa. El pasaporte abre y muestra el primer sello al avanzar; retroceder recupera la definición y retira la capa fija.
- Movimiento reducido verificado con contenido en flujo normal; alternativa sin JavaScript capturada y legible. Enlaces `#contexto` y «Ir al pasaporte» comprobados hasta los offsets exactos, incluso al recargar con hash. Corregido el contraste de cabecera y controles durante la superficie clara.
- 19 pruebas aprobadas, incluyendo continuidad del fundido, inversión del scroll y regresión estructural. Build final correcto; persiste la advertencia previa de tamaño del bundle Three.js. Los tests de la escena retirada quedan archivados en `design/retired-sequence-tests`.
- Evidencias: `evidence/sportswashing-new-{desktop,mobile,small-mobile}-{concealment,definition,handoff}.jpg`, `sportswashing-new-reduced.jpg`, `sportswashing-new-no-js.jpg` y `sportswashing-new-qa.json`.

Las secciones siguientes documentan versiones anteriores.

# Abanico completo · 7 de octubre de 2026

- Las seis tarjetas permanecen visibles: cada una tiene un lugar fijo en el abanico y pasa al centro y al frente cuando el scroll la selecciona. Sin saltos por envolver los índices ni desaparición de las tarjetas más alejadas.
- Escritorio 1132 × 884: camiseta → tote → camiseta con scroll real; seis tarjetas visibles en los tres estados. Móvil 390 × 844: abanico dentro del ancho, con separación reducida y marco de papel. Se conservan hover, fotos en uso, contador, flechas y recorrido inverso.
- 33 pruebas aprobadas y compilación correcta. Evidencias: `evidence/reward-fan-all-desktop.jpg` y `evidence/reward-fan-all-mobile.jpg`. Persiste la advertencia previa sobre el tamaño del bundle.

# Textos de celebración, pasaporte y abanico de figuritas · 7 de octubre de 2026

- Textos más pequeños en la parte inferior, sin cubrir caras ni copa. Aparición por líneas mediante máscara y desvanecimiento, sin desplazamiento horizontal. Primer texto a la izquierda y pregunta a la derecha en escritorio; ambos a la izquierda en móvil. Estado reversible según scroll.
- Retirado Abrí tu pasaporte del HTML, listeners y actualización del renderer. El pasaporte continúa abriendo con scroll. Verificado cerrado con progreso 0 y sin controles huérfanos.
- Recompensas como abanico de tres tarjetas con marco de papel y fotos existentes. Giro en el borde inferior, tarjeta seleccionada al frente y tarjetas laterales con desenfoque leve. Sin mano ni nuevos activos de imagen. Hover y toque conservan las fotos en uso.
- Scroll real en escritorio 1132 × 884: camiseta → tote → camiseta, con cambio del frente y del contador 01 → 02 → 01. Móvil 390 × 844: tote centrada, abanico completo y textos legibles. Pregunta completa hasta 751 px del viewport. Consola sin errores; viewport restaurado.
- 33 pruebas: secuencia de líneas, foco y simetría del abanico, movimiento continuo y reversibilidad, además de los recorridos existentes. Compilación correcta con advertencia previa del tamaño del bundle.
- Evidencias: evidence/reward-fan-desktop.jpg, evidence/reward-fan-mobile.jpg, evidence/celebration-caption-joy.jpg, evidence/celebration-caption-question.jpg, evidence/celebration-caption-mobile.jpg y evidence/passport-without-open-button.jpg.

Las secciones siguientes documentan versiones anteriores.

# Hamburguesa a la derecha sin texto · 7 de octubre de 2026

- Logo a la izquierda y hamburguesa de tres líneas a la derecha. Retirados el rótulo Menú, el fondo y el borde del control. Área de interacción de 40 × 40 px con icono de 18 × 14 px; nombre accesible conservado.
- Desplegable de 154 px alineado al borde derecho del icono. Comprobado abierto en escritorio y cerrado en móvil 390 × 844. Viewport de prueba restaurado. Build correcto.
- Evidencias: evidence/right-hamburger-desktop.jpg y evidence/right-hamburger-mobile.jpg.

Las secciones siguientes documentan versiones anteriores.

# Menú compacto de secciones · 7 de octubre de 2026

- Retirado el botón independiente Tickets del header. Logo y menú alineados a la izquierda. Control de 60 × 34 px en escritorio y 56 × 32 px en móvil, con lista de 154 px de ancho.
- Todos los enlaces apuntan a destinos existentes; Recompensas utiliza la navegación especial del recorrido actual. El desplegable funciona con details nativo y conserva el estado expandido para tecnologías de asistencia.
- Verificación real en 319 × 884 y 1280 × 720: apertura, navegación a Tickets e Inicio y cierre automático. Escape cierra y devuelve el foco al control; tocar afuera también cierra. Sin barra ni overlay de pantalla completa.
- Compilación correcta, con advertencia previa del tamaño del bundle. Evidencias: evidence/compact-menu-mobile.jpg y evidence/compact-menu-desktop.jpg.

Las secciones siguientes documentan versiones anteriores.

# Cabecera ampliada y celebración a pantalla completa · 7 de octubre de 2026

- THE TIMES y el escudo central ocupan el 94% del ancho de la hoja (1109 px en escritorio y 331 px en móvil). Altura determinada por la proporción original del SVG; margen lateral de 1% respecto al papel. Se reserva espacio sobre la misma noticia original de SportWashing.
- La cámara de celebración cubre el viewport desde el inicio y durante el acercamiento. Se mantiene visible el trofeo, la proyección de su W y el recorrido reversible existente. En móvil se desplazan los textos a la parte inferior para dejar libres la copa y las caras.
- Verificación real en 1280 × 720 y 390 × 844. Foto cubriendo las cuatro orillas; cabecera completa sin deformación ni solapamiento con la noticia. Consola sin errores. Viewport restaurado.
- 31/31 pruebas aprobadas: añadida la cobertura de la cámara y visibilidad del trofeo en cinco proporciones de pantalla. Compilación correcta con advertencia previa del tamaño del bundle.
- Evidencias: evidence/full-width-times-header.jpg, evidence/full-width-times-mobile.jpg, evidence/fullscreen-celebration-desktop.jpg y evidence/fullscreen-celebration-mobile.jpg.

Las secciones siguientes documentan versiones anteriores.

# Noticia FAIR PLAY y transición al pasaporte · 7 de octubre de 2026

- Texto editorial a la izquierda y fotografía del pasaporte a la derecha. Acercamiento de toda la hoja hacia la foto, seguido del fundido al mismo modelo GLB y al mismo canvas de la sección del evento.
- La foto se captura desde el renderer existente, en pose cerrada y con transparencia. Su caja real se mide para ajustar el encuadre: diferencia inferior a 1 px frente al modelo durante el fundido en escritorio.
- Verificación con scroll real en 1280 × 720 y 390 × 844: acercamiento, fundido, controles habilitados al terminar. Abrí tu pasaporte avanza al modelo abierto con progreso 0.345. Retroceder devuelve la imagen al diario y la noticia a su composición original.
- Pantalla habitual 319 × 884: la noticia completa queda dentro de su región (cuerpo hasta 732 px, artículo hasta 770 px). Foto y epígrafe lateral visibles. Viewport de prueba restaurado.
- Retirada la leyenda de fecha y horario a confirmar del diario, tickets y aviso de reserva. Sin fechas nuevas; se conserva el aviso de demostración de las reservas.
- 30/30 pruebas aprobadas y build correcto, con advertencia previa del tamaño del bundle. Consola sin errores ni advertencias. Evidencias: evidence/passport-news-desktop.jpg, evidence/passport-image-to-3d.jpg y evidence/passport-news-mobile.jpg.
- La alternativa estática conserva texto y foto sin acercamiento; si todavía no hay captura del modelo, no se oculta el diario. Se mantiene un solo renderer de pasaporte.

Las secciones siguientes documentan versiones anteriores.

# Noticia del evento y transición directa · 7 de octubre de 2026

- Eliminada la sección «Otra forma de entrar al juego» y su trigger. El evento con el pasaporte sigue directamente al diario.
- La nota final ahora tiene volanta, titular informativo, bajada, firma del equipo, dos párrafos y fecha/horario pendientes. No incluye enlaces ni botones de reserva. Investigación y referencias: `design/news-gallery/editorial-structure.md`.
- Verificación real en escritorio 1280 × 720 y móvil 319 × 884: artículo completo, sin desbordes ni recortes, conservando el foco circular. El siguiente hermano de `#celebracion` es `#evento`. Consola sin errores de trigger por la sección retirada.
- 30/30 pruebas aprobadas y build correcto. Evidencias: `evidence/fairplay-event-news-desktop.jpg` y `evidence/fairplay-event-news-mobile.jpg`. Las secciones siguientes documentan versiones anteriores.

# SportWashing continuo y foco circular · 7 de octubre de 2026

- La misma sección original de SportWashing permanece dentro del diario: mural de fondo, título a la izquierda y explicación completa. Retirada la noticia resumida que la reemplazaba. El alejamiento transforma el contenedor completo; no desvanece ni intercambia la composición.
- THE TIMES con escudo central. Hoja vertical de hasta 1180 px, ocupando el 94% del ancho disponible. La página acompaña verticalmente la lectura; las columnas conservan su posición horizontal.
- Círculo de radio constante en píxeles, máscara circular con borde suave y contorno salvia. El exterior tiene blur de 8 px; las noticias vecinas mantienen hasta 3 px y las catorce notas de relleno conservan 2.3 px incluso dentro del círculo. Las noticias principales usan textos de 16 px en escritorio y 12 px en móvil (11 px bajo 360 px).
- Escritorio 1280 × 720: la noticia original de SportWashing mide 1050 × 598 px y queda completa bajo la cabecera al finalizar el alejamiento. F1 tiene foto cuadrada de 112 px, titular y texto completos; sin desbordes en las cuatro noticias posteriores.
- Móvil 390 × 844 y pantalla habitual de 319 × 884: texto, fotos y fuentes completos, sin desbordes en F1, tenis, Argentina 1978 ni la invitación. La noticia final nombra Club Arquitectura y permite reservar. Retroceso real desde 18.698 a 14.649 vuelve a tenis con blur 0, mientras F1 y Argentina conservan blur 3 px. Notas de relleno verificadas con blur constante.
- 30/30 pruebas aprobadas: continuidad geométrica de la composición original, alejamiento progresivo, columnas sin superposición, trayectoria circular, lectura visible, reversibilidad y límites. Build correcto; consola sin errores ni advertencias. Viewport de prueba restaurado.
- Evidencias actuales: `evidence/continuous-sportwashing-newspaper.jpg`, `evidence/circular-reading-f1.jpg`, `evidence/circular-reading-mobile.jpg`, `evidence/circular-reading-event-mobile.jpg`. Las secciones siguientes documentan versiones anteriores.

# Hoja completa y fija en columnas · 7 de octubre de 2026

- Cabecera FAIR PLAY en Times New Roman negrita; la cabecera The Times ya no se carga. Header del sitio conserva solo logo y Tickets flotantes.
- Tres columnas: SportWashing y tenis a la izquierda; F1 en el centro; Argentina 1978 y Censura a la derecha. Titular, foto y texto breve debajo; fuentes conservadas. Hoja completa visible dentro del viewport.
- Transformación del diario constante durante toda la lectura: translate3d(0px, 0px, 0px) scale(1). Scroll cambia exclusivamente el blur de las noticias y la posición del foco periférico. Censura permanece dentro de la hoja, sin acercamiento final.
- Comparación real en escritorio 1280 × 720: F1 a 12.626 y tenis a 14.651 ocupan exactamente los mismos rectángulos; solo cambia el foco. Móvil 390 × 844: Censura nítida a 18.698 con las cinco regiones dentro de la pantalla, sin desbordes del texto. Viewport restaurado al terminar.
- 29/29 pruebas aprobadas: columnas sin superposición, todas visibles, geometría invariable, foco progresivo y reversibilidad. Build correcto; persiste la advertencia previa del tamaño del bundle. Consola sin errores ni advertencias.
- Evidencias actuales: `evidence/full-newspaper-f1.jpg`, `evidence/full-newspaper-tennis.jpg`, `evidence/full-newspaper-mobile.jpg`. Las secciones siguientes corresponden a versiones anteriores.

# Lectura periférica y cabecera The Times · 7 de octubre de 2026

- Cabecera vectorial The Times con sus letras y escudo, sin el logo de FAIR PLAY dentro del diario. Masthead local verificado cargado y completo en escritorio.
- Header del sitio con solo logo de inicio y Tickets; fondo transparente, sin barra, borde ni backdrop-filter entre los controles. El espacio intermedio no intercepta el puntero.
- F1 derecha a distancia 12.625; Six Kings Slam izquierda a 14.650; Argentina 1978 derecha. Todos comparten una sola hoja y desplazamiento vertical; la mirada se desplaza entre columnas mediante una máscara elíptica suave y blur periférico de 7 px.
- Escritorio 1280 × 720: titular, foto, texto y enlaces de F1 y tenis completos. Móvil 390 × 844: tenis completo bajo los controles flotantes, sin corte de textos ni fuentes. Consola sin errores ni advertencias; viewport restaurado.
- 29/29 pruebas aprobadas, incluyendo posición de la mirada, reversibilidad y desaparición del desenfoque periférico al entrar en Censura. Build correcto con la advertencia previa del tamaño del bundle.
- Evidencias: `evidence/times-masthead-reading.jpg`, `evidence/reading-gaze-right.jpg`, `evidence/reading-gaze-left.jpg`, `evidence/reading-gaze-mobile.jpg`. Las secciones siguientes corresponden a versiones anteriores.

# Diario en una sola hoja · 7 de octubre de 2026

- Composición inspirada en la portada aportada por el usuario: una cabecera FAIR PLAY, símbolo central, franja salvia, columnas alternadas, fotos documentales en blanco y negro y seis notas secundarias permanentemente borrosas.
- Solo SportWashing, F1, Six Kings Slam, Argentina 1978 y Censura son destinos del enfoque. Scroll vertical compartido, sin movimiento horizontal entre noticias. Las notas auxiliares son decorativas y quedan fuera del teclado y del árbol accesible.
- Escritorio 1280 × 720: cabecera completa al alejarse a distancia 10.600; F1 nítida a 12.626 con dos notas borrosas a la derecha; tenis nítido a 14.650 con notas borrosas a la izquierda. Texto y fuentes dentro de sus regiones.
- Móvil 390 × 844: titular de tenis completo debajo del header, fotografía, texto y ambas fuentes visibles. Censura nítida ocupa el viewport a 21.396. Retroceso real a Argentina 1978 en 16.674 devuelve blur 0 y conserva texto y fuentes dentro del artículo. Viewport restaurado al terminar.
- 28/28 pruebas aprobadas: geometría sin superposición, cinco destinos, seis notas auxiliares, foco progresivo, cámara vertical compartida, lectura en ambos anchos, reversibilidad y límites. Build correcto; conserva la advertencia previa del tamaño del bundle. Consola sin errores ni advertencias.
- Alternativas de movimiento reducido y sin JavaScript conservan noticias en flujo normal y ocultan las notas decorativas.
- Evidencias actuales: `evidence/newspaper-sheet-opening.jpg`, `evidence/newspaper-sheet-desktop.jpg`, `evidence/newspaper-sheet-tennis.jpg`, `evidence/newspaper-sheet-mobile.jpg`, `evidence/newspaper-sheet-censura.jpg`. El resto de este archivo documenta versiones anteriores.

# Revista continua FAIR PLAY · 7 de octubre de 2026

- SportWashing y Censura son las páginas originales dentro de un mismo contenedor; no se duplican ni se intercambian durante las transiciones. La cámara pasa por cinco pliegos unidos con papel, pliegues, márgenes, cabeceras y numeración de la marca.
- Escritorio 1280 × 720: definición inicial completa; alejamiento y primera página vecina a distancia 10.669; artículo F1 centrado a 12.617; Censura impresa en la última página a 18.697; esa misma página ocupa toda la pantalla a 21.357. Retroceso desde 21.357 a 18.697 verificado mediante scroll real.
- Móvil 390 × 844: página de Six Kings Slam centrada a 14.650, con foto, texto y ambos enlaces completos. Las tres noticias mantienen el texto por encima del folio inferior y no hay desborde horizontal. Censura ocupa el viewport completo a 21.396. Viewport restaurado al terminar.
- 26/26 pruebas aprobadas: páginas unidas, cámara compartida, lectura de las cinco páginas en ambos anchos, acercamiento registrado en la misma página de Censura, límites y reversibilidad. Build correcto; persiste la advertencia previa del tamaño del bundle. Consola sin errores ni advertencias.
- Movimiento reducido y alternativa sin JavaScript revisados en código: contenedor sin transformación, noticias apiladas, fotos y texto en flujo normal; los elementos decorativos se ocultan.
- Evidencias actuales: `evidence/magazine-opening-desktop.jpg`, `evidence/magazine-news-desktop.jpg`, `evidence/magazine-censura-preview.jpg`, `evidence/magazine-news-mobile.jpg`, `evidence/magazine-censura-mobile.jpg`. Las validaciones siguientes documentan versiones anteriores.

# Collage horizontal inspirado en Lando Norris · 6 de octubre de 2026

- Referencia inspeccionada con scroll real en https://landonorris.com/: composición de fotografías de distintos tamaños y alturas que avanza conjuntamente. Las noticias ahora comparten una sola pista horizontal con movimiento continuo e inclinaciones leves.
- Escritorio 1280 × 720: F1 y tenis visibles juntos a distancia 13.425, tenis y Argentina 1978 a 14.850. Fotos con proporciones distintas, textos y fuentes debajo. Retroceso desde 14.850 a 13.425 comprobado con scroll real.
- Móvil 390 × 844: tenis con foto, texto y ambos enlaces completos a distancia 14.090, sin desborde horizontal. Censura completa a 21.500. Viewport restaurado al terminar.
- 26/26 pruebas aprobadas: desplazamiento común continuo, vecinos visibles, lectura completa para los tres casos en ambos anchos, enlaces fuera de pantalla desactivados y reversibilidad. Build correcto; persiste la advertencia previa sobre el tamaño del bundle. Consola sin errores ni advertencias.
- Alternativa estática revisada en código: se limpia también la transformación de la pista y todos los textos siguen disponibles. Se conserva el recorrido inicial de la celebración y el alejamiento del cuadro completo de SportWashing.
- Evidencias actuales: `evidence/news-collage-desktop.jpg`, `evidence/news-collage-mobile.jpg` y `evidence/news-collage-censorship-mobile.jpg`. Las validaciones siguientes documentan versiones anteriores.

# Cuadros y noticias reales · 6 de octubre de 2026

- Nuevo recorrido: definición de SportWashing → alejamiento del panel completo (mural, título y texto) hasta 48 % → salida izquierda → fotografías F1 / Six Kings Slam / Argentina 1978 en posiciones y alturas distintas → acercamiento a Censura → definición → introducción al evento → pasaporte.
- Revisado escritorio 1280 × 720: cuadro a distancia de scroll 10.1; lectura F1 a 12.151; tenis a 14.756; Mundial 1978 a 17.349; Censura completa a 21.5. Los casos tienen un tramo de lectura exclusivo y fuentes accesibles. Se corrigieron los recortes para mantener visibles los protagonistas.
- Revisado móvil 390 × 844: Six Kings Slam a distancia 14.755; Censura completa a 21.309; introducción al evento con texto y enlace completos. Sin desborde horizontal. El enlace «Conocé el evento» abre la escena del pasaporte. Al volver a Información regresa la definición antes del alejamiento. El viewport se restaura al terminar.
- Fotografías documentales originales guardadas localmente con créditos, enlaces y manifiesto de procedencia; no se generan imágenes ficticias de los casos. Six Kings Slam se identifica como exhibición, no como Grand Slam. Las fuentes permiten distinguir el hecho deportivo y el contexto de sportswashing.
- 25/25 pruebas aprobadas. Incluyen tramos de lectura, dirección del movimiento, proyección inicial conservada, orden Censura → introducción → evento y reversibilidad. Build correcto. Persiste la advertencia previa del tamaño del bundle. Consola revisada sin errores ni advertencias.
- Movimiento reducido y alternativa sin JavaScript revisados en código; no se modificaron preferencias del sistema ni se desactivó JavaScript en el navegador.
- Evidencias actuales: `news-frame-retreat-desktop.jpg`, `news-f1-desktop.jpg`, `news-six-kings-desktop.jpg`, `news-argentina-1978-desktop.jpg`, `news-gallery-mobile.jpg`, `censorship-approach-desktop.jpg`, `censorship-mobile.jpg`, `event-introduction-mobile.jpg`, dentro de `evidence/`. Las validaciones siguientes son históricas.

# Recorrido continuo · 6 de octubre de 2026

- Activo actual: una sola fotografía 1672 × 941 del mismo equipo con un plato de plata y W frontal. La escena no contiene video, cambio de toma, fotografía macro ni estela. El mural informativo conserva su aparición mediante pintura.
- Escritorio 1280 × 720: equipo y W visibles a progreso 0.413, acercamiento al mismo plato con inscripción vectorial registrada a 0.651, palabra completa centrada a 0.847. La definición completa a 0.995 mantiene el título en Noche y se ubica a la derecha. El encuadre inicial reserva espacio bajo el header.
- Móvil 390 × 844: revisadas pregunta y equipo, inscripción del mismo plato a 0.651 y título con definición completa a 0.995; sin desborde horizontal. Viewport restaurado al terminar.
- Retroceso desde la definición hasta el equipo y avance hasta el título comprobados con scroll real. `#contexto` funciona después de recargar. Consola revisada: sin errores ni advertencias.
- 20/20 pruebas aprobadas: frases, fases, proyección compartida entre foto y W, continuidad en el final del acercamiento, reversibilidad y activo único. Build correcto; persiste la advertencia anterior de tamaño del bundle. Alternativa estática revisada en código, sin cambiar preferencias del sistema.
- Evidencias actuales: `evidence/continuous-team-desktop.jpg`, `evidence/continuous-plate-w-desktop.jpg`, `evidence/continuous-plate-w-mobile.jpg`, `evidence/continuous-wordmark-center.jpg`, `evidence/continuous-wordmark-mobile.jpg`. Las capturas y validaciones siguientes documentan versiones anteriores.

# Historial de validaciones · 6 de octubre de 2026

- Transición nueva: el acercamiento del equipo continúa hasta la base de la copa. Una fotografía macro mantiene el detalle y pasa al interior de la O del título «SportWashing». El retroceso revela el mural con ocho pasadas de pintura; la palabra queda centrada, se desplaza a la izquierda y la definición aparece por partes.
- Verificado en escritorio: O con base de copa a progreso 0.728; título completo centrado a 0.852; título a la izquierda y definición completa a 0.995. El regreso por scroll restaura las mismas fases sin depender de temporizadores.
- Verificados viewports 390 × 844 y 320 × 740: título completo, explicación y enlace visibles, sin desborde horizontal ni texto recortado. El texto final termina a 585 px y 678 px respectivamente. El viewport vuelve a su tamaño normal al terminar.
- Acceso `#contexto` desde el header lleva directamente a la definición y funciona después de recargar. Mural y macro son imágenes generadas con originales y prompts archivados en `design/sportswashing-transition/`; la O y la pintura se animan en HTML/SVG con el reloj existente de scroll.
- Compilación correcta; 19/19 pruebas aprobadas. Incluyen el orden copa → O → título → texto y reversibilidad de todas las fases. Consola sin errores ni advertencias en la revisión final. La alternativa estática para movimiento reducido y error de video se revisó en código; no se cambiaron preferencias del sistema.
- Evidencias: `evidence/sportswashing-trophy-closeup.jpg`, `evidence/sportswashing-trophy-o.jpg`, `evidence/sportswashing-title-center.jpg`, `evidence/sportswashing-mural-desktop.jpg` y `evidence/sportswashing-mural-mobile.jpg`.

## Video de celebración y mejoras anteriores

- Recorrido de celebración: reemplazado el equipo 3D por un MP4 de acercamiento, creado a partir de una fotografía original generada. Los jugadores mantienen su pose; el movimiento corresponde a la cámara. El modelo 3D del pasaporte sigue activo.
- Scroll comprobado en escritorio: video a 0 s al entrar, 2.20 s con la primera frase a progreso 0.279 y 6.99 s con la pregunta a progreso 0.880. Al retroceder volvió a 2.24 s y reapareció la primera frase. El video permanece pausado y el scroll controla su posición.
- Las frases entran con desvanecimiento desde lados opuestos. Escritorio de 1280 × 720: primera frase a la izquierda y pregunta a la derecha, sin tapar el equipo. Móvil de 390 × 844: versión de video vertical, textos arriba y equipo debajo; ambas frases completas y sin desborde horizontal.
- Comprobados el enlace hacia la información, la navegación al evento y la carga del pasaporte. Consola sin errores ni advertencias en esta revisión. Viewport restaurado al terminar.
- Compilación correcta y 18/18 pruebas aprobadas, incluyendo fases de texto, recorrido inverso y archivos MP4. Desktop: 3.52 MiB; móvil: 1.56 MiB; ambos H.264, 8 s y 24 fps. Fallback estático previsto para movimiento reducido o error de video; no se cambiaron preferencias del sistema para simularlo.
- Evidencias: `evidence/victory-video-joy-desktop.jpg`, `evidence/victory-video-question-desktop.jpg`, `evidence/victory-video-mobile.jpg` y `evidence/victory-video-question-mobile.jpg`. Fuente, prompt y manifiesto archivados en `design/victory-video/`.

- Estructura actual: portada → video de celebración → información → evento con pasaporte y recompensas → About Us → tickets. Orden comprobado en el DOM y navegación principal actualizada.
- Información: tres bloques sobre sportswashing, censura y derechos en el deporte; fotografías conceptuales originales, dos párrafos por tema y fuentes de Amnistía Internacional y UNESCO. Imágenes WebP cargadas correctamente, con originales y prompts archivados.
- Revisados escritorio de 1280 px y viewports móviles de 390 × 844 y 320 × 740: texto e imagen alternados en escritorio, una columna en móvil, header con cuatro enlaces sin superposición. Se restauró el viewport al terminar.
- Verificados el botón de apertura del pasaporte, el acceso a About Us después de las recompensas, su enlace a tickets y la apertura del formulario de reserva. Se eliminó el traslado del título del hero a About Us para adaptarlo al nuevo orden.
- Compilación final correcta, 15/15 pruebas existentes aprobadas y consola sin errores ni advertencias durante la revisión. Vite conserva su advertencia anterior por tamaño del bundle. Evidencias: `evidence/context-desktop.jpg`, `evidence/context-sportswashing.jpg` y `evidence/context-mobile.jpg`.

- Header: al superar 12 px de scroll pasa a fondo Noche con 45 % de opacidad y desenfoque de fondo de 16 px, mediante una transición suave. Verificados en navegador el cambio al bajar y la restauración al volver al inicio, sin errores de consola; compilación correcta. Captura: `evidence/header-transparent-blur.jpg`.

- Recompensas integradas dentro de la escena fija del pasaporte. El cierre da paso a la colección; el scroll desplaza los seis productos horizontalmente, centra el producto al detenerse y desenfoca los laterales según distancia.
- Comprobados scroll, botones, teclado hasta el sexto producto, salida hacia Tickets y regreso hasta el pasaporte abierto con tres sellos. En móvil 390 × 844: producto centrado, vecinos desenfocados, textos completos, foto alternativa al tocar y ausencia de desborde horizontal. El acceso directo `#recompensas` se revisó tras recargar.
- `npm test`: 15/15 aprobadas, incluyendo transición sólo después del cierre, posiciones del recorrido hacia adelante y atrás, y foco simétrico según distancia. Compilación correcta y consola sin errores ni advertencias. Se conserva la advertencia de tamaño del bundle de Three.js.
- Evidencias actuales: `evidence/passport-rewards-horizontal-desktop.jpg` y `evidence/passport-rewards-horizontal-mobile.jpg`. Las capturas de la colección en grilla documentan la iteración anterior.

- Portada: demostración automática mediante un único tajo diagonal, con dibujo rápido, extremos afinados, breve apertura y cierre gradual. Comprobada tras 5 segundos de inactividad, con vuelta a la imagen inicial y pausa entre demostraciones.
- Verificados escritorio y viewport móvil 390 × 844 sin desborde horizontal. Interactuar cancela los cortes y conserva la máscara orgánica manual; el botón permite mostrar y ocultar la segunda imagen. Consola sin errores ni advertencias.
- Retirados los cuatro textos solicitados del hero. `npm test`: 13/13 aprobadas, incluyendo espera, repetición y cancelación de la demostración. Compilación de producción correcta; continúa la advertencia de tamaño del bundle de Three.js.
- Capturas actuales: `evidence/hero-idle-diagonal-slash.jpg` y `evidence/hero-idle-diagonal-mobile.jpg`. Las capturas con franjas verticales pertenecen a la iteración anterior.

- Animación inversa: al retroceder por las zonas, los sellos se deshacen en orden 3 → 2 → 1 con impresión invertida, movimiento contrario del pasaporte y desvanecimiento de la tinta. Al avanzar se imprimen nuevamente.
- El cierre y la reapertura conservan las marcas; sólo retroceder por los puntos de sellado las elimina.
- Navegador verificado: 3 sellos a progreso 0.701, 2 al retroceder a 0.651, 1 a 0.509 y ninguno a 0.402. Al avanzar otra vez hasta 0.847, las tres marcas se ven adheridas a las páginas durante el cierre. Consola sin errores ni advertencias.
- `npm test`: 11/11 aprobadas, incluidas la inversión de escala y movimiento, la desaparición de tinta y el orden inverso de las zonas. Compilación de producción correcta.
- Captura del recorrido invertido: `evidence/passport-reverse-stamps.jpg`.

## Registro de iteraciones anteriores

- Sellos persistentes: las marcas se adhieren a las páginas y acompañan el cierre. La zona 2 tiene una mitad en cada página; las tres zonas conservan su estado al reabrir o retroceder.
- Verificado en navegador: tres sellos a progreso 0.701, visibles durante el cierre a 0.844 y 0.873, tres zonas completas con el pasaporte cerrado a 0.938, y los tres sellos presentes al reabrir y retroceder a 0.434. Consola sin errores ni advertencias.
- `npm test`: 10/10 aprobadas, incluida la retención del estado al cerrar, reabrir y retroceder. Compilación de producción correcta.
- Evidencias: `evidence/passport-marks-closing.jpg` y `evidence/passport-marks-reopened.jpg`.

- Zona 2 corregida: impresión interior continua, títulos y círculos alineados, y superficies impresas sin espacio en el pliegue. Posiciones de los sellos calculadas desde la composición interior.
- Corrección revisada en escritorio y viewport móvil de 390 × 844, con el segundo sello centrado y sin cortes. Consola sin errores ni advertencias; compilación correcta y 9/9 pruebas aprobadas.
- Capturas: `evidence/passport-zone2-aligned-desktop.jpg` y `evidence/passport-zone2-aligned-mobile.jpg`.

- Sellador 3D retirado. Los tres sellos se imprimen automáticamente al cruzar cada zona con el scroll.
- Cada impresión aplica presión y un rebote amortiguado al pasaporte durante 600 ms, independiente de la velocidad del scroll; movimiento reducido no aplica impactos.
- `npm test`: 9/9 pruebas aprobadas, incluyendo presión, rebote y reposo de cada impresión. `npm run build`: correcto; permanece la advertencia de tamaño del bundle de Three.js.
- Vista de escritorio verificada en la compilación local: apertura sin sellador, uno, dos y tres sellos, y eliminación de sellos al retroceder. Consola sin errores ni advertencias.
- Captura actual: `evidence/passport-auto-stamps-desktop.jpg`.

## Validación anterior · 5 de octubre de 2026

- `npm run build`: compilación de producción correcta. Vite mantiene una advertencia de tamaño por el bundle de Three.js del pasaporte.
- `npm test`: 8/8 pruebas aprobadas. Se verifican proyección y sellos del pasaporte, giro limitado, reservas, privacidad del QR, GLB activo y las doce fotografías referenciadas.
- Seis productos con dos fotos cada uno. Los doce WebP son válidos, diferentes entre producto y uso, de 900 × 1200 px y menos de 200 KB cada uno.
- Fotos generadas con Imagegen integrado; originales y prompts guardados en `design/product-photography/`.
- La colección usa HTML, imágenes y CSS. El runtime sólo solicita el GLB del pasaporte; los seis GLB de productos fueron retirados de `public/models/`.
- Hover verificado en escritorio; las fotos alternativas de camiseta, tote, gorra, pulsera, pin y stickers cargan y se muestran correctamente.
- Vista móvil 390 × 844 comprobada, grilla de una columna y sin desborde horizontal. La activación vuelve a la imagen del producto y permite mostrar otra vez la foto en uso.
- Las etiquetas accesibles y el texto alternativo cambian según la imagen visible. El foco es visible y hay alternativa de teclado.
- Movimiento reducido elimina la transición de las fotos mediante CSS. No se modificaron preferencias del sistema ni se afirma haber probado un teléfono físico.
- Consola del navegador sin errores ni advertencias en la revisión de la colección.

## Evidencias locales

`evidence/collection-products-desktop.jpg`, `evidence/collection-hover-desktop.jpg` y `evidence/collection-mobile.jpg` documentan la versión fotográfica. Las capturas anteriores con productos 3D pertenecen a una iteración retirada.
