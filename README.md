Tech Tarot — lightweight static site

What you get:
- `index.html`, `css/styles.css`, `js/script.js` — a single-page playful tarot for tech decisions
- small interactive card-pull with 3 cards and short "tech" fortunes

How to run

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

Next steps you might want:
- Replace placeholder SVG artwork with full-resolution assets
- Add more tarot cards and share/print options
- Improve animations and add sound effects

Using the LLM API (optional)

- A small Node server is included at `server.js` that proxies card data to an LLM provider (OpenAI). It expects an `OPENAI_API_KEY` in the environment.
- Copy `.env.example` to `.env` and set your key:

```cmd
cd /d d:\Projects\TechTarot
copy .env.example .env
rem edit .env and set OPENAI_API_KEY
```

- Install Node dependencies (none required for fetch if using Node 18+). Start the API:

```cmd
cd /d d:\Projects\TechTarot
npm run start:api
```

- Open http://localhost:3000 and use the site. When you click a card the client will POST to `/api/reading` and return an LLM-generated expanded reading.

New features (added):

- Modes: use the selector to choose between "Witty coach", "Practical coach", and "Stern advisor". The server adjusts the system prompt accordingly.
- Deep dive: after pulling a card, click "Deep dive" to ask the LLM for a longer analysis. The server requests structured JSON (reading, actions, risks) when deep=true.
- Caching: the server caches recent responses (in-memory) to reduce LLM calls during development.

- Provider selector & client mock: you can now choose the provider from the site UI. The options are:
	- `Server` — the default; calls the `/api/reading` endpoint on the server (which may use OpenAI, HF, or local TEXT_GEN_URL depending on your `.env`).
	- `Client mock` — runs a deterministic mock on the browser (zero-cost, offline) so you can demo without any server.

- Client-side persistent cache: the client stores past readings in `localStorage` so repeated pulls are instant and work offline for cached entries.

Mock mode for demos

If you don't have an OpenAI key or want to demo without making external calls, enable mock responses:

```cmd
set ENABLE_MOCK=true
node server.js
```

This returns a structured mock response for `/api/reading` so the UI features (deep dive, modes) can be exercised offline.

- Alternative providers (free/self-hosted)

If you prefer not to use OpenAI, you have two common options:

- Hugging Face Inference API (may be free under limited quota):
	- Set `HF_API_TOKEN` and `HF_MODEL` in your `.env`.
	- Example `.env` entries:

		HF_API_TOKEN=hf_...your_token_here
		HF_MODEL=google/flan-t5-large

	- The server will call the HF inference endpoint and try to extract generated text.

- Local text-generation endpoint (self-hosted, free models):
	- Run a local text generation service such as text-generation-webui, llama.cpp web UI, or another local server exposing a simple POST endpoint that accepts `{ inputs: "..." }` and returns generated text.
	- Set `TEXT_GEN_URL` in `.env`, e.g.:

		TEXT_GEN_URL=http://localhost:7860/api/generate

	- This is the most cost-free option if you can run a model locally (CPU/GPU may be required depending on the model).

	- Supported local server types (set `TEXT_GEN_TYPE` to help the server parse responses):
		- `textgen-webui` — popular web UI for many local models. Example: run the web UI and set `TEXT_GEN_TYPE=textgen-webui`.
		- `oobabooga` — if using an oobabooga-based UI, set `TEXT_GEN_TYPE=oobabooga`.
		- `text-generation-inference` — generic inference endpoints (default parsing).

	- Quick start with text-generation-webui (example):
		1. Follow text-generation-webui installation instructions (requires models, optionally GPU).
		2. Start the web UI locally (usually serves at http://localhost:7860).
		3. Set `.env` values:

			 TEXT_GEN_URL=http://localhost:7860/api/generate
			 TEXT_GEN_TYPE=textgen-webui

		4. Start the API server and interact with the UI; the server will POST your combined prompt to the local endpoint.

API behavior:
- POST /api/reading accepts { title, desc, mode, deep }
- Successful response will attempt to return structured JSON: { reading: string, actions?: string[], risks?: string[] }

Notes:
- The server extracts JSON from the LLM response where possible. If the LLM returns plain text, the server will attempt a best-effort parse.
- For production use, replace the simple in-memory cache with Redis or another datastore and secure your API key.

Puppeteer demo (optional)

If you want an automated demo that captures screenshots of the flow (client-mock provider), install puppeteer and run the demo script:

```cmd
cd /d d:\Projects\TechTarot
npm install --no-audit --no-fund
npm run demo
```

This will produce `screenshot-1.png`, `screenshot-2.png`, and `screenshot-3.png` showing: initial page, after pulling a card, and after deep dive.
