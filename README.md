# EL SOL NOS MIENTE · Registro de Anomalías del Eclipse

> *«Cuando la luz se oculte, no mires hacia otro lado. Documenta.»*

Archivo colaborativo descentralizado de anomalías ópticas, distorsiones temporales y fenómenos no catalogados observados durante eclipses solares. El proyecto funciona íntegramente en el navegador del usuario, sin servidor, preservando la evidencia en almacenamiento local.

**🔴 Sitio en línea:** https://joseluis1212.github.io/Archivo-7A/

---

## 🔭 Características

- **Eclipse renderizado en CSS puro** con animaciones de corona, anillos orbitales y tránsito lunar.
- **Ticker de advertencias** en directo con pausa al pasar el cursor.
- **Sistema de carga de evidencia** con arrastrar y soltar, validación de formato y simulación de sincronización.
- **Galería filtrable** por categoría: anomalía, entidad, distorsión, censura y sin filtrar.
- **Sistema de testigos** para validar observaciones entre usuarios del mismo dispositivo.
- **Lightbox** accesible con cierre por teclado (`Esc`).
- **Estética analógica** con capas de escaneo, ruido, viñeteado y campo estelar animado.
- **100% client-side**: sin backend, sin tracking, sin cookies.

## 📂 Estructura del proyecto

```
Archivo-7A/
├── index.html   # Estructura + estilos embebidos
├── app.js       # Lógica de la aplicación
├── README.md    # Este archivo
└── .gitignore   # Reglas de exclusión
```

## 🚀 Despliegue local

```bash
# Opción 1: servidor simple de Python
python -m http.server 8000

# Opción 2: Node
npx serve .

# Opción 3: abrir index.html directamente en el navegador
```

Luego acceda a `http://localhost:8000`.

## ☁️ Despliegue en GitHub Pages

1. Cree un repositorio nuevo en [github.com](https://github.com/new).
2. Suba los archivos del proyecto.
3. Vaya a **Settings → Pages**.
4. En **Source**, seleccione **Deploy from a branch**.
5. Elija la rama `main` y la carpeta `/ (root)`.
6. Guarde. En 1-2 minutos su sitio estará disponible en:
   `https://SU-USUARIO.github.io/NOMBRE-REPOSITORIO/`

## 🗃️ Uso de la plataforma

1. Pulse **SUBIR EVIDENCIA** o desplácese a la sección *01 · Registro de Evidencia*.
2. Arrastre una imagen (JPG, PNG, WEBP · máx. 8 MB) a la zona de carga.
3. Complete título, descripción, clasificación y ubicación.
4. Pulse **REGISTRAR EN EL ARCHIVO**.
5. En la sección *02 · Archivo de Anomalías* podrá filtrar, ampliar imágenes y confirmar registros con **SOY TESTIGO**.
6. El botón **PURGAR ARCHIVO** elimina todos los registros locales de forma irreversible.

## ⚠️ Nota sobre privacidad

Toda la evidencia se almacena únicamente en el `localStorage` del dispositivo del usuario. Ningún dato abandona su navegador. Este proyecto es una obra de ficción colaborativa / arte conceptual.

## 📜 Licencia

MIT © 2026 · Archivo colectivo · Protocolo 7A
