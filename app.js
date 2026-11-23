(() => {
  const KEY = 'mycal.events.v1';
  const COLORS = ['#4f46e5', '#059669', '#dc2626', '#d97706', '#db2777', '#0891b2'];
  const $ = (s) => document.querySelector(s);
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(events)); } catch {} }

  let events = load();
  let view = new Date(); view.setDate(1);
  let selected = iso(new Date());
  let editingId = null;
  let color = COLORS[0];

  const REL = window.HOLIDAY_RELIGIONS || {};
  const HKEY = 'mycal.hiddenReligions.v1';
  let hidden = new Set((() => { try { return JSON.parse(localStorage.getItem(HKEY)) || []; } catch { return []; } })());
  const holidays = (d) => (window.holidaysOn ? window.holidaysOn(d) : []).filter((h) => !hidden.has(h.rel));

  function buildChips() {
    const box = $('#chips');
    box.innerHTML = '';
    Object.entries(REL).forEach(([k, r]) => {
      const b = document.createElement('button');
      b.className = 'chip' + (hidden.has(k) ? '' : ' on');
      b.style.setProperty('--c', r.color);
      b.innerHTML = `<i></i>${r.label}`;
      b.onclick = () => {
        hidden.has(k) ? hidden.delete(k) : hidden.add(k);
        try { localStorage.setItem(HKEY, JSON.stringify([...hidden])); } catch {}
        buildChips(); render();
      };
      box.appendChild(b);
    });
  }

  const byDate = (d) => events.filter((e) => e.date === d)
    .sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));

  function render() {
    $('#title').textContent = `${MONTHS[view.getMonth()]} ${view.getFullYear()}`;
    const grid = $('#grid');
    grid.innerHTML = '';
    const start = new Date(view);
    start.setDate(1 - view.getDay());
    const todayIso = iso(new Date());
    for (let i = 0; i < 42; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const k = iso(d);
      const cell = document.createElement('div');
      cell.className = 'cell' + (d.getMonth() !== view.getMonth() ? ' out' : '') +
        (k === todayIso ? ' today' : '') + (k === selected ? ' sel' : '');
      const evs = byDate(k).slice(0, 4);
      const hs = holidays(k);
      const hol = hs.length
        ? `<span class="hol" style="--c:${REL[hs[0].rel].color}">${hs[0].name}${hs.length > 1 ? ' +' + (hs.length - 1) : ''}</span>`
        : '';
      cell.innerHTML = `<span class="num">${d.getDate()}</span>${hol}<span class="dots">${evs.map((e) => `<i style="background:${e.color}"></i>`).join('')}</span>`;
      cell.onclick = () => { selected = k; if (d.getMonth() !== view.getMonth()) { view = new Date(d.getFullYear(), d.getMonth(), 1); } render(); };
      grid.appendChild(cell);
    }
    renderAgenda();
  }

  function renderAgenda() {
    const d = parse(selected);
    $('#agendaTitle').textContent = d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
    const list = $('#agendaList');
    list.innerHTML = '';
    holidays(selected).forEach((h) => {
      const li = document.createElement('li');
      li.className = 'hl';
      li.style.setProperty('--c', REL[h.rel].color);
      li.innerHTML = `<span class="t">${REL[h.rel].label}</span><span class="b">${h.name}</span>`;
      list.appendChild(li);
    });
    const evs = byDate(selected);
    if (!evs.length && !list.children.length) { list.innerHTML = '<li class="empty" style="background:none;border:0;padding:0">No events. Tap + to add one.</li>'; return; }
    evs.forEach((e) => {
      const li = document.createElement('li');
      li.style.setProperty('--c', e.color);
      li.innerHTML = `<span class="t">${e.time || 'All day'}</span><span class="b"></span>`;
      const b = li.querySelector('.b');
      b.textContent = e.title;
      if (e.notes) { const s = document.createElement('small'); s.textContent = e.notes; b.appendChild(s); }
      li.onclick = () => openDlg(e);
      list.appendChild(li);
    });
  }

  function buildColors() {
    const box = $('#colors');
    box.innerHTML = '';
    COLORS.forEach((c) => {
      const b = document.createElement('button');
      b.type = 'button'; b.style.background = c; b.setAttribute('aria-label', 'Color ' + c);
      if (c === color) b.className = 'on';
      b.onclick = () => { color = c; buildColors(); };
      box.appendChild(b);
    });
  }

  function openDlg(ev) {
    editingId = ev ? ev.id : null;
    $('#dlgTitle').textContent = ev ? 'Edit event' : 'New event';
    $('#fTitle').value = ev ? ev.title : '';
    $('#fDate').value = ev ? ev.date : selected;
    $('#fTime').value = ev ? ev.time || '' : '';
    $('#fNotes').value = ev ? ev.notes || '' : '';
    color = ev ? ev.color : COLORS[0];
    $('#delete').hidden = !ev;
    buildColors();
    $('#dlg').showModal();
    if (!ev) $('#fTitle').focus();
  }

  $('#form').addEventListener('submit', () => {
    const data = {
      id: editingId || String(Date.now()) + Math.random().toString(36).slice(2, 6),
      title: $('#fTitle').value.trim(),
      date: $('#fDate').value,
      time: $('#fTime').value,
      notes: $('#fNotes').value.trim(),
      color,
    };
    if (!data.title || !data.date) return;
    events = events.filter((e) => e.id !== data.id).concat(data);
    save();
    selected = data.date;
    const d = parse(data.date);
    view = new Date(d.getFullYear(), d.getMonth(), 1);
    render();
  });

  $('#cancel').onclick = () => $('#dlg').close();
  $('#delete').onclick = () => {
    if (!confirm('Delete this event?')) return;
    events = events.filter((e) => e.id !== editingId);
    save(); $('#dlg').close(); render();
  };
  $('#add').onclick = () => openDlg(null);
  $('#prev').onclick = () => { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); render(); };
  $('#next').onclick = () => { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); render(); };
  $('#today').onclick = () => { const n = new Date(); view = new Date(n.getFullYear(), n.getMonth(), 1); selected = iso(n); render(); };

  $('#export').onclick = () => {
    const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `my-calendar-backup-${iso(new Date())}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  $('#import').onclick = () => $('#file').click();
  $('#file').onchange = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try {
      const arr = JSON.parse(await f.text());
      if (!Array.isArray(arr)) throw 0;
      const map = new Map(events.map((x) => [x.id, x]));
      arr.filter((x) => x && x.id && x.title && x.date).forEach((x) => map.set(x.id, x));
      events = [...map.values()]; save(); render();
    } catch { alert('That file is not a valid backup.'); }
    e.target.value = '';
  };

  buildChips();
  render();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();
