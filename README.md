Tech Tarot — lightweight frontend-only static site

What you get:
- `index.html`, `css/styles.css`, `js/script.js` — a single-page playful tarot for tech decisions.
- Client-side mock readings: no server or API keys required.

How to run (frontend-only)

Option A — open locally
- Open `d:/Projects/TechTarot/index.html` in your browser.

Option B — quick local server (Python)

```cmd
cd /d d:\Projects\TechTarot
python -m http.server 8000
```
Then open http://localhost:8000 in your browser.

Option C — with npm (npx)

```cmd
cd /d d:\Projects\TechTarot
npx http-server -c-1
```

Notes
- The project is intentionally frontend-only. All readings are generated in the browser using a deterministic mock so you can run offline with no API keys.
- If you later want server-side or LLM integrations, re-add `server.js` and the `/api/reading` endpoint or use a serverless function.
