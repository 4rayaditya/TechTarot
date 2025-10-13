require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// simple in-memory cache to reduce LLM calls during development
const cache = new Map();

const MODES = {
    witty: 'playful, witty, short, actionable',
    coach: 'practical, kind, focused on next steps',
    stern: 'direct, concise, points out risks and trade-offs'
};

app.get('/api/modes', (req, res) => {
    return res.json({ modes: Object.keys(MODES) });
});

app.post('/api/reading', async (req, res) => {
    const { title, desc, mode = 'witty', deep = false } = req.body || {};
    if (!title || !desc) return res.status(400).json({ error: 'Missing title or desc' });

    const OPENAI_KEY = process.env.OPENAI_API_KEY;
    const HF_API_TOKEN = process.env.HF_API_TOKEN;
    const HF_MODEL = process.env.HF_MODEL; // e.g. google/flan-t5-large or other HF model
    const TEXT_GEN_URL = process.env.TEXT_GEN_URL; // e.g. http://localhost:7860/api/generate
    const TEXT_GEN_TYPE = (process.env.TEXT_GEN_TYPE || '').toLowerCase(); // e.g. textgen-webui, oobabooga, text-generation-inference
    const enableMock = process.env.ENABLE_MOCK === 'true';

    const key = `${title}||${mode}||${deep}`;
    if (cache.has(key)) return res.json(cache.get(key));

    // If no provider is configured, optionally return a mocked response for local demos
    if (!OPENAI_KEY && !HF_API_TOKEN && !TEXT_GEN_URL && enableMock) {
        const mockReading = `(${mode.toUpperCase()} mode) Mock reading for "${title}" — ${desc}` + (deep ? ' (deep analysis included).' : '');
        const mockActions = [
            `Run a 1-day experiment related to "${title}".`,
            'Collect feedback from 3 users and summarize.',
            'Ship one tiny improvement and measure engagement.'
        ];
        const mockRisks = deep ? ['May distract from core metrics', 'Could delay other prioritized work'] : [];
        const parsed = { reading: mockReading, actions: mockActions, risks: mockRisks };
        cache.set(key, parsed);
        return res.json(parsed);
    }

    if (!OPENAI_KEY && !HF_API_TOKEN && !TEXT_GEN_URL && !enableMock) return res.status(500).json({ error: 'No LLM provider configured. Set OPENAI_API_KEY or HF_API_TOKEN+HF_MODEL or TEXT_GEN_URL, or ENABLE_MOCK=true for demo mode.' });

    try {
        const system = `You are a tarot-style advisor for tech founders. Tone: ${MODES[mode] || MODES.witty}. If asked for a deep analysis, include a short list of risks and 3 prioritized action items.`;

        const userPrompt = deep ?
            `Card: ${title}\nShort: ${desc}\n\nProvide a detailed analysis (3-5 sentences), list 3 prioritized action items (short sentences), and list 2-3 potential risks or trade-offs. Reply in JSON with keys: reading, actions (array), risks (array).` :
            `Card: ${title}\nShort: ${desc}\n\nProvide a 2-3 sentence reading and 3 concrete action items (one sentence each). Reply in JSON with keys: reading, actions (array).`;

        let raw = '';

        // 1) Local text-generation endpoint (TEXT_GEN_URL)
        if (TEXT_GEN_URL) {
            // Support different local server types via TEXT_GEN_TYPE
            let payload;
            if (TEXT_GEN_TYPE === 'textgen-webui') {
                payload = { prompt: `${system}\n\n${userPrompt}`, max_new_tokens: 400 };
            } else {
                // default to generic text-generation-inference / simple POST { inputs }
                payload = { inputs: `${system}\n\n${userPrompt}` };
            }

            const resp = await fetch(TEXT_GEN_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!resp.ok) {
                const errText = await resp.text();
                return res.status(502).json({ error: 'Local text generation error', detail: errText });
            }
            const j = await resp.json();
            // Parse common shapes
            if (TEXT_GEN_TYPE === 'textgen-webui') {
                raw = j.text || j.result || (j.data && j.data[0] && j.data[0].generated_text) || JSON.stringify(j);
            } else if (TEXT_GEN_TYPE === 'oobabooga') {
                raw = j.results && j.results[0] && j.results[0].text ? j.results[0].text : JSON.stringify(j);
            } else {
                raw = j.generated_text || (j.results && j.results[0] && j.results[0].text) || (j.output && j.output[0] && j.output[0].generated_text) || JSON.stringify(j);
            }
        }

        // 2) Hugging Face Inference API
        else if (HF_API_TOKEN && HF_MODEL) {
            const url = `https://api-inference.huggingface.co/models/${HF_MODEL}`;
            const resp = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${HF_API_TOKEN}` },
                body: JSON.stringify({ inputs: `${system}\n\n${userPrompt}` })
            });
            if (!resp.ok) {
                const errText = await resp.text();
                return res.status(502).json({ error: 'Hugging Face inference error', detail: errText });
            }
            const j = await resp.json();
            // HF often returns array or object with generated_text
            if (typeof j === 'string') raw = j;
            else if (Array.isArray(j) && j[0]) raw = j[0].generated_text || j[0].text || JSON.stringify(j[0]);
            else raw = j.generated_text || JSON.stringify(j);
        }

        // 3) OpenAI (fallback)
        else if (OPENAI_KEY) {
            const messages = [
                { role: 'system', content: system },
                { role: 'user', content: userPrompt }
            ];
            const resp = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_KEY}`
                },
                body: JSON.stringify({
                    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
                    messages,
                    max_tokens: deep ? 700 : 300,
                    temperature: 0.7
                })
            });
            if (!resp.ok) {
                const errText = await resp.text();
                return res.status(502).json({ error: 'OpenAI provider error', detail: errText });
            }
            const data = await resp.json();
            raw = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
        }

        // Try to parse JSON if model returned structured output; fallback to plain text
        let parsed = { reading: raw };
        try {
            const jsonMatch = String(raw).match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[0]);
            } else {
                const lines = String(raw).split(/\r?\n/).map(l => l.trim()).filter(Boolean);
                const actions = lines.filter(l => /^(-|\d+\.)/.test(l)).map(l => l.replace(/^(-|\d+\.)\s*/, ''));
                parsed = { reading: lines.slice(0, 2).join(' '), actions };
            }
        } catch (e) {
            parsed = { reading: raw };
        }

        cache.set(key, parsed);
        return res.json(parsed);
    } catch (err) {
        console.error('Error calling LLM:', err);
        return res.status(500).json({ error: 'Server error calling LLM', detail: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Tech Tarot API listening on http://localhost:${PORT}`);
});
