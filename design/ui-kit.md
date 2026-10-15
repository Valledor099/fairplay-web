# UI kit de Fair Play en SVG

Entrega para Figma en `design/ui-kit-svg/`. La página `ui-kit.html` y el enlace del pie de la web fueron retirados. Las correcciones de contenido de la web se conservan.

## Archivos

- 12 SVG principales: textos convertidos a curvas, formas agrupadas y recursos incrustados. No dependen de fuentes instaladas para conservar la apariencia.
- `con_texto/`: las mismas 12 láminas con elementos SVG de texto. Figma puede convertirlos a vectores al importar; no se garantiza texto nativo editable.
- `fuentes/`: Barlow Condensed y Manrope en TTF, con licencias SIL OFL.
- `textos/`: los textos de cada lámina para copiar y editar en Figma.
- `tokens.json`: paleta, tipografías, espacios y altura de controles.

Arrastrar los 12 SVG principales al lienzo de Figma. Los grupos vectoriales no crean componentes, variantes ni auto-layout nativos: pueden construirse en Figma a partir de esta base. Las fotografías y el símbolo original siguen siendo imágenes incrustadas; los textos de la versión principal son trazados y los controles son formas vectoriales.

## Contenido

Portada, colores/contraste, tipografía/espacio, acciones/estados, campos/selectores, navegación/progreso, mensajes/diálogos, datos/cantidad, revisión/QR, composiciones/responsive, voz/escritura y revisión de Marisol.

Fuente: extracto local del Vault `T. SOP. Informatico/Resources/Capitulos_3_y_8_Diseno_de_contenidos.md`, de Diseño de contenidos de Marisol Parnofiello, capítulos 3 y 8. Las referencias son por apartado, sin páginas inventadas. Las reglas de escritura se vinculan a cada componente. La paleta, las fotografías y las tipografías son decisiones del proyecto, no prescripciones del libro.

## Desvíos corregidos

| Hallazgo | Corrección | Referencia |
| --- | --- | --- |
| `08:00 h` en el texto del horario | `8:00 h` en portada, visita y reserva. El instante ISO y el contador se conservan | Cap. 8, Algunos consejos sobre tiempo |
| El botón para continuar destacaba más que la confirmación del borrado | «Borrar solicitud» es primario y «Seguir con la solicitud» es secundario. El foco inicial permanece en la alternativa que conserva los datos | Cap. 3, Diálogos |
| «Cancelar» no nombraba la consecuencia inmediata | Título «¿Querés borrar la solicitud?» y botón «Borrar solicitud», con explicación de qué se pierde | Cap. 3, Diálogos y botones |
| El foco podía salir del diálogo al pasar sus extremos con Tab | Tab y Shift+Tab recorren circularmente sus dos botones. Escape cierra y devuelve el foco al origen | Cap. 3, Diálogos, accesibilidad |
| «Sumate a la experiencia» no anticipaba el destino | «Ver entradas» para ir a la sección; «Obtener entradas» sigue abriendo el formulario | Cap. 3, Botones y navegación |
| Punto final en el título «El brillo puede taparlo todo.» | Título sin punto final | Cap. 8, Puntuación |
| Pautas dispersas | Biblioteca SVG con reglas junto al componente y sus estados | Cap. 3, Librería de componentes |

Se mantienen las mayúsculas expresivas de marca y títulos editoriales; el criterio explícito de no usar mayúsculas sostenidas en botones se respeta en los controles. El menú superior mantiene «Menú» visible y destinos descriptivos. La prohibición del menú hamburguesa del apartado de navegación lateral no se extrapola a toda navegación.

## Regeneración y validación

Ejecutar `node scripts/prepare-ui-kit-svg.mjs` para preparar la foto PNG y el QR de demostración; luego ejecutar `python scripts/export-ui-kit-svg.py` con FontTools y Brotli disponibles. En el entorno original se usa el Python 3.12 del runtime y dependencias en `tmp/svg-runtime` del Vault. Sharp se obtiene del runtime Node o de `FAIRPLAY_SVG_MODULES`.

El generador valida XML, límites de elementos y glifos, guarda ambas variantes y crea `../FairPlay_UI_Kit_SVG.zip`. El QR se genera desde el modelo de reserva con validForAdmission:false; no es una entrada real.

Las láminas se renderizaron para revisar su composición. Los resultados de la web se registran en QA.md; las capturas están excluidas de Git. No se realizó importación dentro de Figma ni pruebas con participantes.
