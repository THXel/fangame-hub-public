(() => {
  "use strict";
  const cfg = window.PINGULEXA_MISSION_EXTENSION_CONFIG || {};
  const app = document.getElementById("app");
  const $ = (id) => document.getElementById(id);
  let timer = null;
  let authorized = false;

  const fmt = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 });
  const statusText = { active: "AKTIV", paused: "PAUSIERT", completed: "ERFÜLLT", disabled: "DEAKTIVIERT", stale: "VERALTET" };

  function safeUrl(value) {
    try {
      const url = new URL(String(value || ""), window.location.href);
      return url.protocol === "https:" ? url.href : "";
    } catch (_) { return ""; }
  }

  function openExternal(url) {
    const clean = safeUrl(url);
    if (!clean) return;
    if (window.Twitch && Twitch.ext && Twitch.ext.actions && typeof Twitch.ext.actions.openLink === "function") {
      Twitch.ext.actions.openLink(clean);
    } else {
      window.open(clean, "_blank", "noopener,noreferrer");
    }
  }

  async function fetchWithTimeout(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), Number(cfg.requestTimeoutMs || 9000));
    try {
      const join = url.includes("?") ? "&" : "?";
      const response = await fetch(`${url}${join}nocache=${Date.now()}`, { cache: "no-store", signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } finally { clearTimeout(timeout); }
  }

  async function loadSnapshot() {
    const urls = Array.isArray(cfg.snapshotUrls) ? cfg.snapshotUrls : [];
    let lastError = null;
    for (const raw of urls) {
      const url = safeUrl(raw);
      if (!url) continue;
      try { return await fetchWithTimeout(url); }
      catch (error) { lastError = error; }
    }
    throw lastError || new Error("Keine Snapshot-URL konfiguriert");
  }

  function isStale(data) {
    const when = Date.parse(data.generated_at || data.updated_at || "");
    const limit = Math.max(5, Number(data.stale_after_minutes || 180)) * 60000;
    return Number.isFinite(when) && Date.now() - when > limit;
  }

  function setProgress(fill, percent) {
    const value = Math.max(0, Math.min(100, Number(percent || 0)));
    requestAnimationFrame(() => { fill.style.width = `${value}%`; });
    const bar = fill.parentElement;
    if (bar) bar.setAttribute("aria-valuenow", String(value));
  }

  function renderGoals(goals) {
    const root = $("goals");
    root.replaceChildren();
    const sourceGoals = (Array.isArray(goals) ? goals : []).filter((goal) => goal && goal.key !== "combined");
    for (const goal of sourceGoals) {
      const article = document.createElement("article");
      article.className = `goal${goal.complete ? " complete" : ""}`;
      article.dataset.key = String(goal.key || "");
      const head = document.createElement("div"); head.className = "goal-head";
      const label = document.createElement("span"); label.textContent = String(goal.label || "Ziel");
      const percent = document.createElement("strong"); percent.textContent = `${fmt.format(Number(goal.percent || 0))} %`;
      head.append(label, percent);
      const bar = document.createElement("div"); bar.className = "liquid-bar"; bar.setAttribute("role", "progressbar"); bar.setAttribute("aria-valuemin", "0"); bar.setAttribute("aria-valuemax", "100");
      const fill = document.createElement("div"); fill.className = "liquid-fill"; fill.innerHTML = '<span class="wave"></span><span class="shine"></span>'; bar.append(fill);
      const foot = document.createElement("div"); foot.className = "goal-foot";
      const display = document.createElement("span"); display.textContent = String(goal.display || "0 / 0");
      const remaining = document.createElement("span"); remaining.textContent = goal.complete ? "✓ Ziel erreicht" : `Noch ${fmt.format(Number(goal.remaining || 0))}`;
      foot.append(display, remaining);
      article.append(head, bar, foot); root.append(article);
      setProgress(fill, goal.percent);
    }
  }

  function render(data) {
    const stale = isStale(data);
    const status = stale ? "stale" : String(data.status || "paused");
    $("state").className = `state ${status}`;
    $("state").textContent = statusText[status] || status.toUpperCase();
    $("title").textContent = String(data.title || "Community-Mission");
    const description = String(data.description || "");
    $("description").textContent = description || (data.completed ? "Die Community-Mission wurde erfüllt!" : "Gemeinsam das Ziel erreichen.");
    const overall = data.overall || {};
    $("overallLabel").textContent = String(overall.label || "Gesamtfortschritt");
    $("overallPercent").textContent = `${fmt.format(Number(overall.percent || 0))} %`;
    $("overallDisplay").textContent = String(overall.display || "0 / 0");
    $("remaining").textContent = data.completed ? "MISSION COMPLETE" : `${Number(data.contribution_count || 0)} Beiträge`;
    setProgress($("overallFill"), overall.percent);
    renderGoals(data.goals);
    const thumbnail = safeUrl(data.thumbnail_url);
    $("thumb").style.backgroundImage = thumbnail ? `url("${thumbnail.replaceAll('"', '%22')}")` : "none";
    const timestamp = Date.parse(data.generated_at || data.updated_at || "");
    $("updated").textContent = Number.isFinite(timestamp) ? `Stand: ${new Date(timestamp).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })}` : "Stand unbekannt";
    $("error").hidden = true;
    app.classList.remove("is-loading");
  }

  async function refresh() {
    try { render(await loadSnapshot()); }
    catch (error) {
      console.warn("PinguLexa mission snapshot:", error);
      $("error").hidden = false;
      app.classList.remove("is-loading");
    }
  }

  function start() {
    if (timer) clearInterval(timer);
    refresh();
    timer = setInterval(refresh, Math.max(10, Number(cfg.refreshSeconds || 30)) * 1000);
  }

  $("refresh").addEventListener("click", refresh);
  $("hubLink").addEventListener("click", () => openExternal(cfg.hubUrl));
  document.addEventListener("visibilitychange", () => { if (!document.hidden) refresh(); });

  if (window.Twitch && Twitch.ext && typeof Twitch.ext.onAuthorized === "function") {
    Twitch.ext.onAuthorized(() => { if (!authorized) { authorized = true; start(); } });
    setTimeout(() => { if (!authorized) start(); }, 1200);
  } else { start(); }
})();
