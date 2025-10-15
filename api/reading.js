// api/reading.js neutralized — project is frontend-only.
// All readings are generated client-side with the deterministic clientMock() function.
// If you reintroduce a server, restore the original implementation from git history.

module.exports = async (req, res) => {
  res.statusCode = 404;
  res.end('Not Found: This project is frontend-only');
};

        // Mock path when no provider configured
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
            return res.json ? res.json(parsed) : res.end(JSON.stringify(parsed));
        }

        if (!OPENAI_KEY && !HF_API_TOKEN && !TEXT_GEN_URL && !enableMock) return res.status(500).json ? res.status(500).json({ error: 'No LLM provider configured. Set OPENAI_API_KEY or HF_API_TOKEN+HF_MODEL or TEXT_GEN_URL, or ENABLE_MOCK=true for demo mode.' }) : res.end(JSON.stringify({ error: 'No LLM provider configured. Set OPENAI_API_KEY or HF_API_TOKEN+HF_MODEL or TEXT_GEN_URL, or ENABLE_MOCK=true for demo mode.' }));

        const system = `You are a tarot-style advisor for tech founders. Tone: ${mode}. If asked for a deep analysis, include a short list of risks and 3 prioritized action items.`;
        const userPrompt = deep ?
            `Card: ${title}\nShort: ${desc}\n\nProvide a detailed analysis (3-5 sentences), list 3 prioritized action items (short sentences), and list 2-3 potential risks or trade-offs. Reply in JSON with keys: reading, actions (array), risks (array).` :
            `Card: ${title}\nShort: ${desc}\n\nProvide a 2-3 sentence reading and 3 concrete action items (one sentence each). Reply in JSON with keys: reading, actions (array).`;

        let raw = '';

        // 1) Local TEXT_GEN_URL
        if (TEXT_GEN_URL) {
            let payload;
            if (TEXT_GEN_TYPE === 'textgen-webui') payload = { prompt: `${system}\n\n${userPrompt}`, max_new_tokens: 400 };
            else payload = { inputs: `${system}\n\n${userPrompt}` };

            const resp = await fetch(TEXT_GEN_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!resp.ok) {
                const errText = await resp.text();
                return res.status(502).json ? res.status(502).json({ error: 'Local text generation error', detail: errText }) : res.end(JSON.stringify({ error: 'Local text generation error', detail: errText }));
            }
            const j = await resp.json();
            if (TEXT_GEN_TYPE === 'textgen-webui') raw = j.text || j.result || (j.data && j.data[0] && j.data[0].generated_text) || JSON.stringify(j);
            else if (TEXT_GEN_TYPE === 'oobabooga') raw = j.results && j.results[0] && j.results[0].text ? j.results[0].text : JSON.stringify(j);
            else raw = j.generated_text || (j.results && j.results[0] && j.results[0].text) || (j.output && j.output[0] && j.output[0].generated_text) || JSON.stringify(j);
        }

        // 2) Hugging Face
        else if (HF_API_TOKEN && HF_MODEL) {
            const url = `https://api-inference.huggingface.co/models/${HF_MODEL}`;
            const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${HF_API_TOKEN}` }, body: JSON.stringify({ inputs: `${system}\n\n${userPrompt}` }) });
            if (!resp.ok) {
                const errText = await resp.text();
                return res.status(502).json ? res.status(502).json({ error: 'Hugging Face inference error', detail: errText }) : res.end(JSON.stringify({ error: 'Hugging Face inference error', detail: errText }));
            }
            const j = await resp.json();
            if (typeof j === 'string') raw = j;
            else if (Array.isArray(j) && j[0]) raw = j[0].generated_text || j[0].text || JSON.stringify(j[0]);
            else raw = j.generated_text || JSON.stringify(j);
        }

        // 3) OpenAI
        else if (OPENAI_KEY) {
            const messages = [{ role: 'system', content: system }, { role: 'user', content: userPrompt }];
            const resp = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_KEY}` }, body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', messages, max_tokens: deep ? 700 : 300, temperature: 0.7 }) });
            if (!resp.ok) {
                const errText = await resp.text();
                return res.status(502).json ? res.status(502).json({ error: 'OpenAI provider error', detail: errText }) : res.end(JSON.stringify({ error: 'OpenAI provider error', detail: errText }));
            }
            const data = await resp.json();
            raw = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
        }

        // parse model output into JSON or fallback
        let parsed = { reading: raw };
        try {
            const j = parseJsonSafe(raw);
            if (j) parsed = j;
            else {
                const lines = String(raw).split(/\r?\n/).map(l => l.trim()).filter(Boolean);
                const actions = lines.filter(l => /^(-|\d+\.)/.test(l)).map(l => l.replace(/^(-|\d+\.)\s*/, ''));
                parsed = { reading: lines.slice(0, 2).join(' '), actions };
            }
        } catch (e) { parsed = { reading: raw }; }

        cache.set(key, parsed);
        return res.json ? res.json(parsed) : res.end(JSON.stringify(parsed));
    } catch (err) {
        console.error('Error in /api/reading:', err);
        return res.status(500).json ? res.status(500).json({ error: 'Server error', detail: String(err) }) : res.end(JSON.stringify({ error: 'Server error', detail: String(err) }));
    }
};
