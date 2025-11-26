
Color Sense - Proyecto completo (codigo)
---------------------------------------
Contenido
- backend/: Node.js Express server (endpoints: /api/adapt, /api/profile/:id, /api/describe-image)
- frontend/: Static site (index.html, style.css, app.js)
- ontology/: Turtle ontology fragment (daltonismo.ttl)
- LICENSE, README.md

Instrucciones rápidas (local):
1. Asegúrate de tener Node.js (>=14) instalado.
2. En la carpeta backend: `npm install` para instalar dependencias.
3. Ejecuta `node server.js` para levantar el backend (por defecto puerto 3000).
4. Abre frontend/index.html en tu navegador (puedes abrirlo directamente; si quieres evitar problemas CORS, correr un servidor estático: `npx serve frontend` o `python -m http.server`).
5. Prueba la interfaz: extrae colores y aplica adaptaciones usando el endpoint /api/adapt.

Notas:
- El servidor incluye reglas de adaptación simples y un motor mock que devuelve transformaciones de color basadas en el tipo de daltonismo.
- El archivo ontology/daltonismo.ttl contiene una ontología fragmentaria y sirve como referencia para expandir el motor semántico real.
- Este proyecto está pensado como plantilla mínima e instructiva; para producción necesitarás añadir persistencia, autenticación y pruebas.
