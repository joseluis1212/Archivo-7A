# EL SOL NOS MIENTE · Registro de Anomalías del Eclipse

Archivo colaborativo descentralizado de anomalías ópticas, distorsiones temporales y fenómenos no catalogados observados durante eclipses solares. El proyecto funciona íntegramente en el navegador del usuario, sin servidor, preservando la evidencia en almacenamiento local.

## 🔭 Características

- **Eclipse renderizado en CSS puro** con animaciones de corona, anillos orbitales y tránsito lunar.
- **Ticker de advertencias** con pausa al pasar el cursor.
- **Sistema de carga de evidencia** con drag & drop, validación de formato y simulación de sincronización.
- **Galería filtrable** por categoría (anomalía, entidad, distorsión, censura, sin filtrar).
- **Sistema de testigos** para validar observaciones entre usuarios del mismo dispositivo.
- **Lightbox** accesible con cierre por teclado.
- **Estética analógica** con capas de escaneo, ruido y viñeteado.
- **100% client-side**: sin backend, sin tracking, sin cookies.

## 📂 Estructura
el-sol-nos-miente/
├── index.html       # Estructura + estilos embebidos
├── app.js           # Lógica de la aplicación
├── README.md        # Este archivo
└── .gitignore       # Reglas de exclusión

## 🚀 Despliegue local

```bash
# Opción 1: servidor simple de Python
python -m http.server 8000

# Opción 2: Node
npx serve .

# Opción 3: abrir index.html directamente en el navegador
```

## ☁️ Despliegue en GitHub Pages

1. Crea un repositorio nuevo en [github.com](https://github.com/new).
2. Sube los archivos del proyecto.
3. Ve a **Settings → Pages**.
4. En **Source**, selecciona **Deploy from a branch**.
5. Elige la rama `main` y la carpeta `/ (root)`.
6. Guarda. En 1-2 minutos tu sitio estará disponible en:
   `https://TU-USUARIO.github.io/el-sol-nos-miente/`

## 📜 Licencia

MIT © 2026 · Archivo colectivo
