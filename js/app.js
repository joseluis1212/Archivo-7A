
/* ============================================================
   ARCHIVO 7A · Lógica principal
   ============================================================ */

(function() {
    'use strict';

    // ---------- Referencias DOM ----------
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const preview = document.getElementById('preview');
    const dzOverlay = document.getElementById('dzOverlay');
    const testimonioInput = document.getElementById('testimonio');
    const testigoInput = document.getElementById('testigo');
    const tipoInput = document.getElementById('tipo');
    const goBtn = document.getElementById('go');
    const progressBar = document.getElementById('progressBar');
    const progressLabel = document.getElementById('progressLabel');
    const statusDiv = document.getElementById('status');
    const gallery = document.getElementById('gallery');
    const galleryCount = document.getElementById('galleryCount');
    const syncLabel = document.getElementById('syncLabel');
    const lightbox = document.getElementById('lightbox');
    const lbImage = document.getElementById('lbImage');
    const lbCaption = document.getElementById('lbCaption');
    const lbMeta = document.getElementById('lbMeta');
    const lbClose = document.getElementById('lbClose');
    const toast = document.getElementById('toast');

    // Estadísticas
    const statTestimonios = document.getElementById('statTestimonios');
    const statSombras = document.getElementById('statSombras');
    const statVerificadas = document.getElementById('statVerificadas');
    const statAlertas = document.getElementById('statAlertas');
    const liveCounter = document.getElementById('liveCounter');

    // Filtros
    const filterButtons = document.querySelectorAll('.filters button[data-filter]');

    // ---------- Estado ----------
    let evidencias = [];
    let currentFilter = 'all';
    let selectedFile = null; // { dataURL, file }

    // ---------- Cargar datos desde localStorage ----------
    function loadData() {
        try {
            const stored = localStorage.getItem('archivo7a_evidencias');
            if (stored) {
                evidencias = JSON.parse(stored);
                // Asegurar que cada evidencia tenga un id único
                evidencias = evidencias.map((e, i) => ({ ...e, id: e.id || Date.now() + i }));
            } else {
                // Datos de ejemplo para mostrar la galería
                evidencias = [
                    {
                        id: 1,
                        testimonio: 'Vi una sombra que se movía al revés durante el eclipse.',
                        testigo: 'Testigo 7A',
                        tipo: 'sombra',
                        fecha: '2026-08-12T18:32:00',
                        imagen: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%230d0605"/%3E%3Ccircle cx="200" cy="150" r="60" fill="%23ffaa00" opacity="0.3"/%3E%3Ccircle cx="200" cy="150" r="30" fill="%23000"/%3E%3C/svg%3E',
                        verificado: false
                    },
                    {
                        id: 2,
                        testimonio: 'El sol parpadeó tres veces y el cielo se puso violeta.',
                        testigo: 'Anónimo',
                        tipo: 'destello',
                        fecha: '2026-08-12T18:45:00',
                        imagen: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%230d0605"/%3E%3Ccircle cx="200" cy="150" r="50" fill="%23ff2a2a" opacity="0.5"/%3E%3Ccircle cx="200" cy="150" r="20" fill="%23fff"/%3E%3C/svg%3E',
                        verificado: true
                    }
                ];
                saveData();
            }
        } catch (e) {
            console.error('Error al cargar datos:', e);
            evidencias = [];
        }
        renderGallery();
        updateStats();
    }

    function saveData() {
        try {
            localStorage.setItem('archivo7a_evidencias', JSON.stringify(evidencias));
        } catch (e) {
            console.error('Error al guardar:', e);
        }
    }

    // ---------- Renderizar galería ----------
    function renderGallery() {
        const filtered = getFilteredEvidencias();
        gallery.innerHTML = '';
        if (filtered.length === 0) {
            gallery.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:var(--muted); padding:2rem 0;">
                🕳️ No hay evidencias con este filtro. Sé el primero en reportar.
            </p>`;
            galleryCount.textContent = '0 evidencias';
            return;
        }

        filtered.forEach((ev, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.style.setProperty('--tilt', (index % 3 === 0 ? 0.7 : index % 4 === 0 ? -0.6 : index % 7 === 0 ? 0.4 : 0) + 'deg');

            const isVerified = ev.verificado || false;
            const tipoLabel = ev.tipo || 'sin clasificar';

            card.innerHTML = `
                <div class="card-media" data-id="${ev.id}" tabindex="0" role="button" aria-label="Ampliar evidencia">
                    <img src="${ev.imagen}" alt="${ev.testimonio}" loading="lazy" decoding="async">
                    <span class="badge-anom ${isVerified ? 'verified' : ''}">
                        <i aria-hidden="true"></i> ${isVerified ? 'VERIFICADA' : 'ANOMALÍA'}
                    </span>
                    <span class="badge-tag ${tipoLabel === 'sin clasificar' ? 'nofiltro' : ''}">${tipoLabel.toUpperCase()}</span>
                    <span class="exp">EXP-${String(ev.id).slice(-4)}</span>
                </div>
                <div class="card-caption">"${ev.testimonio}"</div>
                <div class="card-witness">
                    <span class="w-num">${ev.testigo}</span>
                    <div class="w-label">Testigo</div>
                    <button class="w-btn" data-id="${ev.id}" data-action="verify" ${isVerified ? 'disabled' : ''}>
                        ${isVerified ? '✅ Verificada' : '🔍 Verificar'}
                    </button>
                </div>
                <div class="card-meta">${new Date(ev.fecha).toLocaleString()}</div>
            `;

            gallery.appendChild(card);

            // Evento para abrir lightbox al hacer clic en la imagen
            const media = card.querySelector('.card-media');
            media.addEventListener('click', () => openLightbox(ev));
            media.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(ev);
                }
            });
        });

        galleryCount.textContent = `${filtered.length} evidencias`;

        // Eventos para los botones de verificar
        document.querySelectorAll('.w-btn[data-action="verify"]').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const id = parseInt(this.dataset.id);
                toggleVerify(id);
            });
        });
    }

    function getFilteredEvidencias() {
        if (currentFilter === 'all') return evidencias;
        if (currentFilter === 'verificado') {
            return evidencias.filter(e => e.verificado === true);
        }
        return evidencias.filter(e => (e.tipo || 'otro').toLowerCase() === currentFilter);
    }

    // ---------- Actualizar estadísticas ----------
    function updateStats() {
        const total = evidencias.length;
        const sombras = evidencias.filter(e => (e.tipo || '').toLowerCase() === 'sombra').length;
        const verificadas = evidencias.filter(e => e.verificado === true).length;
        const alertas = evidencias.filter(e => !e.verificado).length;

        statTestimonios.textContent = total;
        statSombras.textContent = sombras;
        statVerificadas.textContent = verificadas;
        statAlertas.textContent = alertas > 0 ? '⚠' : '✓';
        liveCounter.textContent = total;
    }

    // ---------- Verificar evidencia ----------
    function toggleVerify(id) {
        const ev = evidencias.find(e => e.id === id);
        if (!ev) return;
        ev.verificado = !ev.verificado;
        saveData();
        renderGallery();
        updateStats();
        showToast(ev.verificado ? '✅ Evidencia verificada' : '🔍 Verificación retirada');
    }

    // ---------- Lightbox ----------
    function openLightbox(ev) {
        lbImage.src = ev.imagen;
        lbImage.alt = ev.testimonio;
        lbCaption.textContent = `"${ev.testimonio}"`;
        lbMeta.textContent = `${ev.testigo} · ${ev.tipo || 'Sin clasificar'} · ${new Date(ev.fecha).toLocaleString()}`;
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
    }

    lbClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });

    // ---------- Toast ----------
    let toastTimeout;

    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // ---------- Subida de archivos ----------
    function handleFile(file) {
        if (!file) return;
        // Validar tipo y tamaño
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            showToast('⚠️ Formato no permitido. Usa JPG, PNG o WEBP.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showToast('⚠️ El archivo supera los 5MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const dataURL = e.target.result;
            preview.src = dataURL;
            preview.style.display = 'block';
            dropzone.classList.add('has-file');
            selectedFile = { dataURL, file };
            checkFormValidity();
            showToast('📸 Evidencia cargada correctamente');
        };
        reader.onerror = function() {
            showToast('❌ Error al leer el archivo');
        };
        reader.readAsDataURL(file);
    }

    // Drag and drop
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('drag');
    });
    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('drag');
    });
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag');
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    });
    dropzone.addEventListener('click', () => {
        fileInput.click();
    });
    dropzone.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInput.click();
        }
    });
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // ---------- Validación del formulario ----------
    function checkFormValidity() {
        const hasImage = selectedFile !== null;
        const hasTestimonio = testimonioInput.value.trim().length > 0;
        const hasTestigo = testigoInput.value.trim().length > 0;
        goBtn.disabled = !(hasImage && hasTestimonio && hasTestigo);
        return goBtn.disabled;
    }

    testimonioInput.addEventListener('input', checkFormValidity);
    testigoInput.addEventListener('input', checkFormValidity);

    // ---------- Envío del formulario ----------
    document.getElementById('uploadForm').addEventListener('submit', function(e) {
        e.preventDefault();
        if (goBtn.disabled) return;

        // Simular progreso
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            if (progress > 100) progress = 100;
            progressBar.style.width = progress + '%';
            progressLabel.textContent = `Subiendo evidencia... ${progress}%`;
            if (progress === 100) {
                clearInterval(interval);
                // Guardar evidencia
                const nueva = {
                    id: Date.now(),
                    testimonio: testimonioInput.value.trim(),
                    testigo: testigoInput.value.trim(),
                    tipo: tipoInput.value.trim() || 'otro',
                    fecha: new Date().toISOString(),
                    imagen: selectedFile.dataURL,
                    verificado: false
                };
                evidencias.push(nueva);
                saveData();
                renderGallery();
                updateStats();
                showToast('✅ Evidencia enviada al Archivo 7A');

                // Resetear formulario
                resetForm();
            }
        }, 200);
    });

    function resetForm() {
        testimonioInput.value = '';
        testigoInput.value = '';
        tipoInput.value = '';
        selectedFile = null;
        preview.src = '';
        preview.style.display = 'none';
        dropzone.classList.remove('has-file');
        progressBar.style.width = '0%';
        progressLabel.textContent = 'Esperando evidencia...';
        statusDiv.className = 'status';
        statusDiv.textContent = '🟡 Esperando tu testimonio';
        goBtn.disabled = true;
        fileInput.value = '';
    }

    // ---------- Filtros ----------
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            filterButtons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            this.classList.add('active');
            this.setAttribute('aria-selected', 'true');
            currentFilter = this.dataset.filter;
            renderGallery();
            syncLabel.style.animation = 'none';
            setTimeout(() => syncLabel.style.animation = 'blink .5s steps(2) infinite', 10);
            showToast(`🔍 Filtro: ${this.textContent.trim()}`);
        });
    });

    // ---------- Inicialización ----------
    loadData();

    // Sincronización cada 30 segundos (simulación)
    setInterval(() => {
        syncLabel.style.opacity = '0.5';
        setTimeout(() => {
            syncLabel.style.opacity = '1';
            // Aquí se podría hacer una petición a un servidor en el futuro
        }, 800);
    }, 30000);

    // Mostrar versión
    document.getElementById('version').textContent = '0.7.0';

    console.log('📡 Archivo 7A cargado correctamente. El Sol nos miente.');
})();
