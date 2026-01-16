(function(){
  const $lib = document.getElementById('library');
  const $stats = document.getElementById('stats');
  const $search = document.getElementById('search');
  const $last = document.getElementById('lastUpdated');

  let allGames = [];

  function esc(s){
    return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
  }

  function renderLibrary(games){
    if (!Array.isArray(games) || games.length === 0){
      $lib.innerHTML = `
        <div class="empty">
          <div style="font-weight:800;margin-bottom:6px">Keine Daten gefunden</div>
          <div>Ersetze <code>docs/data.json</code> durch den Export aus deinem Hub.</div>
        </div>`;
      return;
    }

    $lib.innerHTML = games.map(g => {
      const name = esc(g.name);
      const cat = esc(g.category || '—');
      const status = esc(g.status || '—');
      const deaths = (g.deaths === null || g.deaths === undefined) ? '—' : esc(g.deaths);
      const time = esc(g.time || '—');
      const thumb = esc(g.thumbnail || 'assets/thumbs/placeholder.png');
      const badges = [];
      if (status && status !== '—') badges.push(`<span class="tag">${status}</span>`);
      if (cat && cat !== '—') badges.push(`<span class="tag">${cat}</span>`);

      const flags = [];
      if (g.completed) flags.push('<span class="badge">BEENDET</span>');
      if (g.in_progress) flags.push('<span class="badge warn">IN ARBEIT</span>');

      return `
        <div class="item">
          <div class="thumb"><img src="${thumb}" alt="" loading="lazy" onerror="this.style.display='none'" /></div>
          <div class="meta">
            <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">
              <div class="name" title="${name}">${name}</div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end">${flags.join('')}</div>
            </div>
            <div class="tags">${badges.join('')}</div>
            <div class="kv">
              <span>Deaths: <b>${deaths}</b></span>
              <span>Time: <b>${time}</b></span>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  function renderStats(s){
    if (!s || typeof s !== 'object'){
      $stats.innerHTML = `<div class="empty">Keine Stats im <code>data.json</code> gefunden.</div>`;
      return;
    }
    const rows = [
      ['Spiele gesamt', s.total_games],
      ['Beendet', s.completed_games],
      ['In Arbeit', s.in_progress_games],
      ['Gesamt-Deaths', s.total_deaths],
      ['Gesamt-Zeit', s.total_time],
      ['Ø Deaths (beendet)', s.avg_deaths_completed],
      ['Ø Zeit (beendet)', s.avg_time_completed],
    ].filter(r => r[1] !== undefined);

    $stats.innerHTML = rows.map(([k,v]) => `
      <div class="statRow">
        <div class="label">${esc(k)}</div>
        <div class="value">${esc(v)}</div>
      </div>
    `).join('');
  }

  function applySearch(){
    const q = ($search.value || '').trim().toLowerCase();
    if (!q){
      renderLibrary(allGames);
      return;
    }
    const filtered = allGames.filter(g => (g.name || '').toLowerCase().includes(q));
    renderLibrary(filtered);
  }

  async function main(){
    try{
      const res = await fetch('data.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();

      allGames = Array.isArray(data.games) ? data.games : [];
      renderLibrary(allGames);
      renderStats(data.stats || {});

      if (data.last_updated){
        $last.textContent = 'Updated: ' + data.last_updated;
      } else {
        $last.textContent = 'Updated: —';
      }

      $search.addEventListener('input', applySearch);
    } catch (e){
      $lib.innerHTML = `<div class="empty"><div style="font-weight:800;margin-bottom:6px">data.json fehlt oder ist kaputt</div><div>Lege eine <code>docs/data.json</code> an (Export aus deinem Hub).</div></div>`;
      $stats.innerHTML = `<div class="empty">—</div>`;
      $last.textContent = 'Updated: —';
      $search.addEventListener('input', applySearch);
    }
  }

  main();
})();
