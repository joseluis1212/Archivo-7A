/* =========================================================
   EL SOL NOS MIENTE · Lógica del Archivo de Anomalías
   ========================================================= */
(() => {
  'use strict';

  const STORAGE_KEY = 'solNosMiente.anomalias.v1';
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ---------- ESTADO ---------- */
  const state = { items: loadItems(), filter: 'all', pendingFile: null };

  function loadItems() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  function saveItems() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items)); }
    catch { toast('⚠ Almacenamiento lleno. Purga registros antiguos.'); }
  }

  /* ---------- TOAST ---------- */
  const toastEl = $('#toast');
  let toastTimer;
  function toast(msg, ms = 2600) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), ms);
  }

  /* ---------- STARFIELD ---------- */
  function initStarfield() {
    const c = $('#starfield');
    const ctx = c.getContext('2d');
    let stars = [];
    const resize = () => {
      c.width = innerWidth; c.height = innerHeight;
      stars = Array.from({ length: 140 }, () => ({
        x: Math.random() * c.width,
        y: Math.random() * c.height,
        r: Math.random() * 1.2 + 0.2,
        a: Math.random() * 0.7 + 0.15,
        s: Math.random() * 0.015 + 0.005
      }));
    };
    const tick = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      stars.forEach(s => {
        s.a += Math.sin(Date.now() * s.s) * 0.005;
        ctx.globalAlpha = Math.max(0.05, Math.min(0.9, s.a));
        ctx.fillStyle = '#ffccaa';
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      });
      requestAnimationFrame(tick);
    };
    addEventListener('resize', resize);
    resize(); tick();
  }

  /* ---------- ZONA DE CARGA ---------- */
  const dropzone = $('#dropzone');
  const fileInput = $('#fileInput');
  const preview = $('#preview');
  const dzOverlay = $('#dzOverlay');
  const submitBtn = $('#go');
  const statusEl = $('#status');
  const progressLabel = $('#progressLabel');
  const progressBar = $('#progressBar');

  function setStatus(msg, type = '') {
    statusEl.className = 'status ' + type;
    statusEl.textContent = msg;
  }

  function setFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      setStatus('Formato inválido. Solo imágenes.', 'bad'); return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setStatus('Archivo demasiado grande (máx 8 MB).', 'bad'); return;
    }
    state.pendingFile = file;
    dzOverlay.textContent = '◉ ' + file.name.toUpperCase();
    dropzone.classList.add('has-file');
    preview.src = URL.createObjectURL(file);
    submitBtn.disabled = false;
    setStatus('Evidencia lista para registrar.', 'ok');
    progressLabel.textContent = 'PREPARADO · ARCHIVO EN MEMORIA';
  }

  function resetDropzone() {
    state.pendingFile = null;
    preview.src = '';
    dropzone.classList.remove('has-file');
    submitBtn.disabled = true;
    progressBar.style.width = '0%';
    progressLabel.textContent = 'ESPERANDO ARCHIVO…';
  }

  dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('drag'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag'));
  dropzone.addEventListener('drop', e => {
    e.preventDefault(); dropzone.classList.remove('drag');
    if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', e => { if (e.target.files[0]) setFile(e.target.files[0]); });

  /* ---------- ENVÍO ---------- */
  $('#uploadForm').addEventListener('submit', async e => {
    e.preventDefault();
    if (!state.pendingFile) return;

    const title = $('#title').value.trim();
    const caption = $('#caption').value.trim();
    const category = $('#category').value;
    const location = $('#location').value.trim() || 'Coordenadas no especificadas';
    if (!title) { toast('⚠ Ingresa un título.'); return; }

    setStatus('Procesando evidencia…', 'blink');
    submitBtn.disabled = true;

    try {
      const dataUrl = await readFileAsDataURL(state.pendingFile);
      for (let p = 0; p <= 100; p += 5) {
        progressBar.style.width = p + '%';
        progressLabel.textContent = 'SINCRONIZANDO… ' + p + '%';
        await new Promise(r => setTimeout(r, 55));
      }

      const item = {
        id: (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now()),
        title, caption, category, location,
        img: dataUrl,
        witnesses: 0,
        witnessed: false,
        timestamp: new Date().toISOString(),
        exposure: randomExposure()
      };

      state.items.unshift(item);
      saveItems();
      renderGallery();
      updateStatCount();

      toast('◉ EVIDENCIA REGISTRADA EN EL ARCHIVO');
      setStatus('Registro completado. Bienvenido, testigo.', 'ok');
      $('#uploadForm').reset();
      resetDropzone();
      scrollToSel('#archivo');
    } catch (err) {
      console.error(err);
      setStatus('Error al procesar la evidencia.', 'bad');
      submitBtn.disabled = false;
    }
  });

  function readFileAsDataURL(file) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  }

  function randomExposure() {
    const f = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16][Math.floor(Math.random() * 8)];
    const s = ['1/1000','1/500','1/250','1/125','1/60','1/30'][Math.floor(Math.random() * 6)];
    const iso = [100,200,400,800][Math.floor(Math.random() * 4)];
    return 'ƒ/' + f + ' · ' + s + 's · ISO ' + iso;
  }

  /* ---------- GALERÍA ---------- */
  const gallery = $('#gallery');
  const galleryCount = $('#galleryCount');

  function renderGallery() {
    const items = state.filter === 'all'
      ? state.items
      : state.items.filter(i => i.category === state.filter);

    gallery.innerHTML = '';
    items.forEach(item => gallery.appendChild(buildCard(item)));
    galleryCount.textContent = '◉ ' + items.length + ' DE ' + state.items.length + ' REGISTROS MOSTRADOS';

    gallery.classList.add('resync');
    setTimeout(() => gallery.classList.remove('resync'), 450);
  }

  function buildCard(item) {
    const card = document.createElement('article');
    card.className = 'card';
    card.dataset.id = item.id;
    const noFiltro = item.category === 'sin filtrar' ? ' nofiltro' : '';
    const verified = item.witnesses >= 5 ? ' verified' : '';

    card.innerHTML =
      '<div class="card-media" tabindex="0" role="button" aria-label="Ampliar evidencia">' +
        '<div class="badge-tag' + noFiltro + '">' + item.category.toUpperCase() + '</div>' +
        '<div class="badge-anom' + verified + '"><i></i>' + item.witnesses + ' TESTIGOS</div>' +
        '<div class="exp">EXP · ' + item.exposure + '</div>' +
        '<img src="' + item.img + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
      '</div>' +
      '<div class="card-caption">' + escapeHtml(item.title) + (item.caption ? ' — ' + escapeHtml(item.caption) : '') + '</div>' +
      '<div class="card-witness">' +
        '<span class="w-num" id="wn-' + item.id + '">' + item.witnesses + '</span>' +
        '<div class="w-label">CONFIRMACIONES DE TESTIGOS</div>' +
        '<button class="w-btn" data-witness="' + item.id + '" ' + (item.witnessed ? 'disabled' : '') + '>' +
          (item.witnessed ? '◉ YA ERES TESTIGO' : '☉ SOY TESTIGO') +
        '</button>' +
      '</div>' +
      '<div class="card-meta">◉ ' + escapeHtml(item.location) + ' · ' + new Date(item.timestamp).toLocaleString('es-MX') + '</div>';

    const media = $('.card-media', card);
    media.addEventListener('click', () => openLightbox(item));
    media.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(item); }
    });

    $('.w-btn', card).addEventListener('click', () => confirmWitness(item.id));
    return card;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  function confirmWitness(id) {
    const item = state.items.find(i => i.id === id);
    if (!item || item.witnessed) return;
    item.witnesses += 1;
    item.witnessed = true;
    saveItems();
    renderGallery();
    const num = document.getElementById('wn-' + id);
    if (num) num.classList.add('pop');
    toast('◉ TU CONFIRMACIÓN HA SIDO REGISTRADA');
  }

  /* ---------- FILTROS ---------- */
  $$('.filters button[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.filters button[data-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.filter = btn.dataset.filter;
      renderGallery();
    });
  });

  $('#clearAll').addEventListener('click', () => {
    if (state.items.length === 0) return toast('El archivo ya está vacío.');
    if (!confirm('¿Purgar TODOS los registros locales? Esta acción no se puede deshacer.')) return;
    state.items = [];
    saveItems();
    renderGallery();
    updateStatCount();
    toast('◉ ARCHIVO PURGADO');
  });

  /* ---------- LIGHTBOX ---------- */
  const lightbox = $('#lightbox');
  function openLightbox(item) {
    $('#lbImg').src = item.img;
    $('#lbCap').textContent = item.title + (item.caption ? ' — ' + item.caption : '');
    $('#lbMeta').textContent = '◉ ' + item.location + ' · ' + item.exposure + ' · ' + item.witnesses + ' testigos';
    lightbox.classList.add('open');
  }
  function closeLightbox() { lightbox.classList.remove('open'); }
  lightbox.addEventListener('click', closeLightbox);
  $('#lbClose').addEventListener('click', closeLightbox);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

  /* ---------- VARIOS ---------- */
  function updateStatCount() { $('#statCount').textContent = state.items.length; }
  function updateClock() { $('#lastSync').textContent = new Date().toLocaleTimeString('es-MX'); }
  function scrollToSel(sel) {
    const el = document.querySelector(sel);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function init() {
    initStarfield();
    renderGallery();
    updateStatCount();
    updateClock();
    setInterval(updateClock, 1000);

    $$('.btn-soul').forEach(a => {
      const href = a.getAttribute('href');
      if (href && href.startsWith('#')) {
        a.addEventListener('click', e => { e.preventDefault(); scrollToSel(href); });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
