# Public Showcase (GitHub Pages)

Ziel: **Dein Hub als read-only Website** (nur **Library + Stats**) veröffentlichen.

Das ist eine **statische HTML-Seite** im Retro-Look – ohne:
- OBS/Overlay
- Installer
- Auto Refresh
- Bearbeiten
- DF Updates

## 1) GitHub Repo + Pages aktivieren
1. Repo auf GitHub erstellen (z.B. `thxel-fangame-hub-public`)
2. Dieses Projekt dorthin pushen/klonen
3. GitHub: **Settings -> Pages**
   - Source: `main` (oder dein Branch)
   - Folder: `/docs`

Dann bekommst du eine URL wie:
`https://DEINNAME.github.io/REPO-NAME/`

## 2) Public Seite erzeugen

Im Projektordner:

```bash
python3 export_public_site.py
```

Das erzeugt:
- `docs/index.html`
- `docs/assets/style.css`
- `docs/assets/thumbs/...` (optional, falls du lokale Thumbnails nutzt)
- `docs/snapshot.json`

## 3) Automatisch publishen (commit + push)

```bash
./publish_public.sh
```

## 4) Automatisch regelmäßig aktualisieren (Linux)

### Cron Beispiel (alle 60 Minuten)

```bash
crontab -e
```

Dann hinzufügen:

```cron
0 * * * * cd /pfad/zu/deinem/repo && ./publish_public.sh >/tmp/hub_public.log 2>&1
```

## Sicherheit
- In der Public Seite werden **keine** Exe-/Wine-Pfade und keine Lutris-configpaths veröffentlicht.
- Wenn du **lokale** Thumbnails nutzt, werden sie nach `docs/assets/thumbs/` kopiert.
- Achte darauf, dass du keine privaten Notizen/Infos in `notes` speicherst, wenn du sie nicht veröffentlichen willst.
