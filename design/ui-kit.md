# UI kit de Fair Play

Página de referencia: `/ui-kit.html`. El enlace «UI kit» del pie de la web permite abrirla. Se compila junto con `index.html` y se puede publicar con la configuración Vite/Vercel existente.

El kit describe la web actual: conserva su marca, fotografías, paleta, Barlow Condensed, Manrope y recorrido. La tipografía del manual histórico (Playfair Display y Arial) no reemplaza la de la web ya implementada. Los colores originales del manual son Noche, Carbón, Pizarra, Salvia y Papel; los tonos semánticos adicionales proceden de los estilos actuales de la reserva.

## Fuente y alcance

Se consultó el extracto local `T. SOP. Informatico/Resources/Capitulos_3_y_8_Diseno_de_contenidos.md`, del Vault, correspondiente a los capítulos 3 y 8 de *Diseño de contenidos: notas de oficio sobre UX Content, UX Writing y liderazgo*, de Marisol Parnofiello. Las referencias son por capítulo y apartado: no se inventan páginas ni se reproduce el libro en el repositorio.

El capítulo 3 fundamenta las pautas junto a cada componente, la distinción entre enlaces y botones, las etiquetas predictivas, los errores, el progreso y los diálogos. El capítulo 8 fundamenta las reglas de fechas, tiempo, extranjerismos y puntuación. Las elecciones de fotografía, fuentes, paleta y animación son de Fair Play; no se atribuyen al libro.

## Estructura

- Átomos: cinco colores de marca, tres colores de función, familias tipográficas, escala de espacio, foco, bordes y contrastes calculados.
- Moléculas: enlaces primarios/secundarios, botones, estados no disponibles, campos completos, con error y deshabilitados, selector de cantidad.
- Organismos: formulario de demostración, progreso de tres etapas, navegación, avisos y diálogo de borrado.
- Composiciones: producto y visita, con recursos y configuración del evento existentes.
- Contenido: voz y tono, vocabulario, ejemplos de escritura y tabla de desvíos/correcciones.

Los botones de demostración tienen efecto; los enlaces de navegación llevan al contenido real. La validación de contacto se importa de `booking-model.js`. El indicador y el diálogo se generan desde `booking-components.js`, compartido con la reserva. La muestra del formulario no guarda ni envía datos y no altera la solicitud de la web.

## Desvíos corregidos

| Hallazgo | Corrección | Referencia |
| --- | --- | --- |
| `08:00 h` en el texto del horario | `8:00 h` en portada, visita y reserva. El instante ISO y el contador se conservan | Cap. 8, Algunos consejos sobre tiempo |
| El botón para continuar destacaba más que la confirmación del borrado | «Borrar solicitud» es primario y «Seguir con la solicitud» es secundario. El foco inicial permanece en la alternativa que conserva los datos | Cap. 3, Diálogos |
| «Cancelar» no nombraba la consecuencia inmediata | Título «¿Querés borrar la solicitud?» y botón «Borrar solicitud», con explicación de qué se pierde | Cap. 3, Diálogos y botones |
| El foco podía salir del diálogo al pasar sus extremos con Tab | Tab y Shift+Tab recorren circularmente sus dos botones. Escape cierra y devuelve el foco al origen | Cap. 3, Diálogos, accesibilidad |
| «Sumate a la experiencia» no anticipaba el destino | «Ver entradas» para ir a la sección; «Obtener entradas» sigue abriendo el formulario | Cap. 3, Botones y navegación |
| Punto final en el título «El brillo puede taparlo todo.» | Título sin punto final | Cap. 8, Puntuación |
| Pautas dispersas | Biblioteca navegable con reglas junto al componente y estados funcionales | Cap. 3, Librería de componentes |

Se mantienen las mayúsculas expresivas de marca y títulos editoriales; el criterio explícito de no usar mayúsculas sostenidas en botones se respeta en los controles. El menú superior mantiene «Menú» visible y destinos descriptivos. La prohibición del menú hamburguesa del apartado de navegación lateral no se extrapola a toda navegación.

## Mantenimiento

`src/site-styles.js` reúne el orden de importación de la cascada para ambas páginas. Compartir sólo una parte de los estilos entre las entradas de Vite altera el orden de los archivos extraídos en producción: la secuencia única evita esa regresión.

`src/ui-foundations.css` asigna roles semánticos a la paleta existente y define espacios, foco, estados y altura de controles. No reemplaza las composiciones específicas del sitio. La descarga JSON lee los valores CSS calculados, sin mantener una segunda tabla manual de tokens. Los pares de contraste que se muestran son texto principal/fondo, texto oscuro/acción y error/superficie; no equivalen a una evaluación de todas las combinaciones posibles.

Para cambiar el contenido de pasos o el diálogo, editar `booking-components.js`. Para modificar condiciones reales del evento, editar la configuración y las condiciones de la web; el kit no define precios ni cupos. Para editar la voz, modificar los ejemplos y revisar su uso en la interfaz real.

## Validación reproducible

`npm test` comprueba la lógica existente; `npm run build` compila las dos páginas. `node scripts/qa-ui-kit.mjs` verifica tokens descargables, navegación, validación/foco, cantidades, progreso, diálogo y desborde en escritorio, móvil, móvil pequeño y movimiento reducido. Por defecto usa la compilación en `http://127.0.0.1:4186/`. `FAIRPLAY_QA_URL`, `FAIRPLAY_QA_BROWSER` y `FAIRPLAY_QA_MODULES` permiten adaptar URL, ejecutable y ubicación del módulo Playwright.

`scripts/qa-heuristics.mjs` comprueba el recorrido original. Las capturas y resultados técnicos se guardan en `evidence/`, excluido de Git. Sólo se consideran válidos los resultados de la ejecución final registrada en `QA.md`.

Las comprobaciones técnicas y la revisión visual no son pruebas con participantes. El voseo es la convención del proyecto; la comprensión y el vocabulario siguen pendientes de contrastar mediante investigación cualitativa. El QR permanece como demostración local sin validez de ingreso.
