# FAIR PLAY

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

La explicación muestra cómo el prestigio deportivo puede ocultar otras historias. Sus ejemplos —F1 en Arabia Saudita, Six Kings Slam y Argentina 1978— abren una vista previa de video al pasar el cursor o recibir foco, y enlazan a sus fuentes. Los videos se incrustan desde YouTube y dependen de su disponibilidad. `src/sportswashing-cases-data.js` conserva sus destinos y créditos.

El pasaporte se abre, recibe tres sellos y se cierra con el scroll. Las seis recompensas forman una mano de cartas fotográficas: la selección avanza de una en una y mantiene la carta activa en el centro. Hover, toque o teclado muestran la fotografía de uso del producto.

Las animaciones respetan movimiento reducido. Sin JavaScript hay contenido legible; sin WebGL se conserva la imagen alternativa del pasaporte.

## Evento y reservas

El evento está fijado para el **12 de diciembre de 2026, durante todo el día**, en Club Arquitectura, CABA. `src/event-config.js` centraliza la fecha, la zona horaria y el contador. El formulario solicita entre una y seis entradas y datos de contacto, sin elegir fecha ni horario.

La reserva y el QR son una **demostración local**: no hay servidor, pagos, correo ni reservas reales. El QR indica `validForAdmission:false` y excluye datos personales. Para habilitar entradas reales se debe conectar un servicio de reservas.

## Repositorios independientes

Este repositorio contiene únicamente el proyecto web y sus recursos de diseño. Las notas de Obsidian se siguen versionando por separado en el repositorio del Vault.

En la instalación original, la carpeta es `output/fairplay-web` dentro del Vault y está excluida del Git padre. Para guardar cambios de la web, ejecutar Git desde esta carpeta; para guardar notas, ejecutarlo desde la raíz del Vault. Cada repositorio tiene sus propios commits y remoto.

`node_modules`, `dist`, capturas de QA, archivos locales de Vercel y credenciales están excluidos de Git. Los originales de imágenes, fuentes y scripts de diseño se conservan como recursos de trabajo en `design` y `blender`; los materiales retirados del diario y celebración no se importan en la experiencia actual.
