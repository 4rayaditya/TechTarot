const startBtn = document.getElementById('startBtn');
const cardArea = document.getElementById('cardArea');
const cards = Array.from(document.querySelectorAll('.card'));
const result = document.getElementById('result');
const againBtn = document.getElementById('againBtn');
const modeSelect = document.getElementById('modeSelect');
// const providerSelect = document.getElementById('providerSelect'); // removed
const copyBtn = document.createElement('button');
copyBtn.className = 'btn ghost hidden copy-btn';
copyBtn.innerText = 'Copy reading';
document.querySelector('.container').appendChild(copyBtn);
const deepBtn = document.getElementById('deepBtn');

// visual toggles (persisted) removed
// const togglePlanets = document.getElementById('togglePlanets'); // removed
// const toggleComets = document.getElementById('toggleComets'); // removed
// const toggleMeteors = document.getElementById('toggleMeteors'); // removed

// history UI removed
// history UI removed
// const historyList = document.getElementById('historyList'); // removed
// debug elements intentionally removed; declare nulls to avoid runtime errors
const debugOut = null;
const debugTestBtn = null;

const deck = [
    { title: 'Pivot the product', desc: 'Ignore the roadmap. Build a tiny feature that people love.' },
    { title: 'Burn the backlog', desc: 'Cut it down to 3 items. Ship tomorrow.' },
    { title: 'Hire a mentor', desc: 'Find someone who has failed fast and can laugh about it.' },
    { title: 'Fundraise later', desc: 'Validate one more revenue stream before investor talks.' },
    { title: 'Automate the boring', desc: 'Build a 1-minute script that saves 1 hour/week.' },
    { title: 'Make the docs', desc: 'Write one excellent README — it attracts customers.' },
    { title: 'Timeout for UX', desc: 'Stop adding features. Improve flow and delight.' },
    { title: 'Ship an experiment', desc: 'A tiny A/B beats another meeting.' }
];

// mode preview UI
const modePreview = document.getElementById('modePreview');
async function updateModePreview() {
    if (!modePreview || !modeSelect) return;
    const sampleTitle = 'Prototype test';
    const sampleDesc = 'Validate an idea with quick customer feedback.';
    modePreview.textContent = 'Preview: generating…';
    try {
        const data = await clientMock(sampleTitle, sampleDesc, { mode: modeSelect.value, deep: false });
        // show short snippet of reading
        modePreview.textContent = data.reading.length > 160 ? data.reading.slice(0, 160) + '…' : data.reading;
    } catch (e) {
        modePreview.textContent = 'Preview: (error)';
    }
}

if (modeSelect) {
    modeSelect.addEventListener('change', updateModePreview);
    // initial preview
    updateModePreview();
}

// reveal flow: See your fate -> show tone selector -> show Pull button
const seeBtn = document.getElementById('seeBtn');
const toneBox = document.getElementById('toneBox');
if (seeBtn) {
    seeBtn.addEventListener('click', (e) => {
        // hide the starter button
        try { seeBtn.classList.add('hidden'); seeBtn.setAttribute('aria-hidden', 'true'); } catch { }
        // reveal tone box robustly (inline styles + class removal)
        if (toneBox) {
            toneBox.classList.remove('hidden');
            toneBox.style.display = 'block';
            toneBox.style.opacity = '1';
            toneBox.setAttribute('aria-hidden', 'false');
        }
        // reveal start button robustly
        const start = document.getElementById('startBtn');
        if (start) {
            start.classList.remove('hidden');
            start.style.display = 'inline-block';
            start.style.opacity = '1';
        }
        // focus the select for accessibility
        setTimeout(() => { try { modeSelect?.focus(); } catch { } }, 120);
    });
}

// Floating typing text animation
const typingText = document.getElementById('typingText');
const phrases = ['Away from the Sun', 'Orbiting ideas', 'Ship boldly', 'Stay curious'];
let typingIndex = 0;
let charIndex = 0;
let typingForward = true;

function tickTyping() {
    if (!typingText) return;
    const phrase = phrases[typingIndex];
    if (typingForward) {
        charIndex++;
        typingText.textContent = phrase.slice(0, charIndex);
        if (charIndex >= phrase.length) {
            typingForward = false;
            setTimeout(tickTyping, 1200);
            return;
        }
    } else {
        charIndex--;
        typingText.textContent = phrase.slice(0, charIndex);
        if (charIndex <= 0) {
            typingForward = true;
            typingIndex = (typingIndex + 1) % phrases.length;
        }
    }
    setTimeout(tickTyping, typingForward ? 80 : 30);
}

// start typing after a short delay
setTimeout(() => { tickTyping(); }, 800);

function shuffle(arr) {
    return arr.slice().sort(() => Math.random() - 0.5);
}

function showCards() {
    cardArea.classList.remove('hidden');
    const sample = shuffle(deck).slice(0, 3);
    cards.forEach((card, i) => {
        const back = card.querySelector('.back');
        back.innerHTML = `<strong>${sample[i].title}</strong><div class="desc">${sample[i].desc}</div>`;
        card.classList.remove('flipped');
        card.style.pointerEvents = 'auto';
        // entrance animation
        setTimeout(() => card.classList.add('enter'), 50 + i * 80);
    });
    result.innerHTML = '';
    againBtn.classList.add('hidden');
    deepBtn.classList.add('hidden');
}

startBtn.addEventListener('click', () => {
    // open the full-page multi-card spread
    window.location.href = 'cards.html';
});

// persistent cache using localStorage with in-memory index for speed
const STORE_KEY = 'tech-tarot-cache-v1';
const cache = new Map(JSON.parse(localStorage.getItem(STORE_KEY) || '[]'));

// persistence helpers for toggles and history removed
// function readBool(key, fallback) { ... } // removed
// function writeBool(key, val) { ... } // removed
// const KEY_PLANETS = 'tt-toggle-planets'; // removed
// const KEY_COMETS = 'tt-toggle-comets'; // removed
// const KEY_METEORS = 'tt-toggle-meteors'; // removed
// // initialize toggle UI from storage removed
// if (togglePlanets) { ... } // removed
// if (toggleComets) { ... } // removed
// if (toggleMeteors) { ... } // removed

// History storage removed
// const KEY_HISTORY = 'tt-reading-history-v1'; // removed
// function loadHistory() { ... } // removed
// function saveHistory(h) { ... } // removed
// function renderHistory() { ... } // removed
// function addHistoryEntry(title, reading) { ... } // removed
function escapeHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

// render existing history now (no-op)
// renderHistory(); // removed

function persistCache() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(Array.from(cache.entries()))); } catch (e) {/* ignore */ }
}

async function clientMock(title, desc, opts) {
    const mode = (opts && opts.mode) || 'witty';
    const deep = !!(opts && opts.deep);

    // small seeded randomness based on title to make results feel varied but reproducible
    function seed(s) {
        let h = 2166136261 >>> 0;
        for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
        return () => (h = Math.imul(h + 0x6D2B79F5, 0x7FFFFFFF) >>> 0) / 0xFFFFFFFF;
    }
    const rnd = seed(title + '|' + mode + '|' + (deep ? '1' : '0'));

    const tones = {
        witty: (t) => `(${t.toUpperCase()}) ${title}: ${desc}. A tiny, cheeky nudge — ${['try this', 'consider that', 'maybe do this'][Math.floor(rnd() * 3)]}.`,
        coach: (t) => `(${t.toUpperCase()}) ${title}: ${desc}. Practical next steps: prioritize one small experiment and measure outcomes.`,
        stern: (t) => `(${t.toUpperCase()}) ${title}: ${desc}. Direct advice: stop overplanning and ship the smallest testable thing.`
    };

    const reading = deep ?
        (tones[mode] ? tones[mode]('deep') : tones.witty('deep')) + ' Deep analysis: ' + (rnd() > 0.5 ? 'Focus on metrics' : 'Consider resource constraints')
        : (tones[mode] ? tones[mode]('short') : tones.witty('short'));

    // generate 3 prioritized actions
    const verbs = ['Run', 'Measure', 'Ask', 'Ship', 'Automate', 'Draft'];
    const nouns = ['a one-day experiment', '3 customers for feedback', 'an A/B test', 'a tiny automation', 'a prioritized backlog'];
    const actions = [];
    for (let i = 0; i < 3; i++) {
        const v = verbs[Math.floor(rnd() * verbs.length)];
        const n = nouns[Math.floor(rnd() * nouns.length)];
        actions.push(`${v} ${n} related to "${title}".`);
    }

    const risks = deep ? [
        rnd() > 0.5 ? 'May distract from core KPIs.' : 'Could increase short-term technical debt.',
        rnd() > 0.6 ? 'Requires alignment with stakeholders.' : 'Might need additional QA.'
    ] : [];

    // small delay to mimic async call
    await new Promise(r => setTimeout(r, 180 + Math.floor(rnd() * 220)));
    return { reading, actions, risks };
}

async function requestReading(title, desc, opts = { mode: 'witty', deep: false }) {
    const key = `${title}||${opts.mode}||${opts.deep ? 'deep' : 'short'}`;
    if (cache.has(key)) return cache.get(key);

    // provider selection removed — always use client-side mock for free/offline use
    let data = await clientMock(title, desc, opts);
    if (!data) data = { reading: 'No reading available' };
    else {
        const payload = { title, desc, mode: opts.mode, deep: opts.deep };
        if (debugOut) {
            debugOut.textContent = `REQUEST:\n${JSON.stringify(payload, null, 2)}\n\nWaiting for response...`;
        }
        // server/provider code removed
    }

    cache.set(key, data);
    persistCache();
    return data;
}

cards.forEach(card => {
    card.addEventListener('click', async () => {
        if (card.classList.contains('flipped')) return;
        // flip locally
        card.classList.add('flipped');
        // reveal immediate message
        const back = card.querySelector('.back');
        const title = back.querySelector('strong').innerText;
        const short = back.querySelector('.desc').innerText;
        const mode = modeSelect?.value || 'witty';
        result.innerHTML = `<h3>${title}</h3><p>${short}</p><p class="loading">Consulting the oracle…</p>`;
        // disable other cards
        cards.forEach(c => c.style.pointerEvents = 'none');

        try {
            const data = await requestReading(title, short, { mode, deep: false });
            // server returns { reading, actions } optionally
            const reading = data.reading || '';
            const actions = data.actions || [];
            result.innerHTML = `<h3>${title}</h3><div class="llm">${reading.replace(/\n/g, '<br>')}</div>` +
                (actions.length ? `<ul class="actions">${actions.map(a => `<li>${a}</li>`).join('')}</ul>` : '');
            // show deep dive button — kept for optional deeper reading
            deepBtn.classList.remove('hidden');
            deepBtn.dataset.title = title;
            deepBtn.dataset.desc = short;
            deepBtn.dataset.mode = mode;
            copyBtn.classList.remove('hidden');
            copyBtn.onclick = () => {
                navigator.clipboard?.writeText((reading + '\n\n' + (actions.join('\n'))).trim());
            };
        } catch (err) {
            result.innerHTML = `<h3>${title}</h3><p class="error">Could not get reading: ${err.message}</p>`;
        }

        againBtn.classList.remove('hidden');
    });
});

againBtn.addEventListener('click', () => {
    showCards();
});

deepBtn.addEventListener('click', async (e) => {
    const title = e.currentTarget.dataset.title;
    const desc = e.currentTarget.dataset.desc;
    const mode = e.currentTarget.dataset.mode || 'witty';
    deepBtn.classList.add('hidden');
    result.innerHTML = `<h3>${title} — deep dive</h3><p class="loading">Asking the oracle for a deep analysis…</p>`;
    try {
        const data = await requestReading(title, desc, { mode, deep: true });
        // render deep structured response if present
        const reading = data.reading || '';
        const actions = data.actions || [];
        const risks = data.risks || [];
        result.innerHTML = `<h3>${title} — deep dive</h3><div class="llm">${reading.replace(/\n/g, '<br>')}</div>` +
            (actions.length ? `<h4>Actions</h4><ul class="actions">${actions.map(a => `<li>${a}</li>`).join('')}</ul>` : '') +
            (risks.length ? `<h4>Risks</h4><ul class="risks">${risks.map(r => `<li>${r}</li>`).join('')}</ul>` : '');
        copyBtn.classList.remove('hidden');
        copyBtn.onclick = () => {
            const out = [reading].concat(actions).concat(risks).join('\n\n');
            navigator.clipboard?.writeText(out.trim());
        };
    } catch (err) {
        result.innerHTML = `<h3>${title}</h3><p class="error">Deep dive failed: ${err.message}</p>`;
    }
});

// keyboard accessibility: press Enter on focused card
cards.forEach(card => {
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter') card.click(); });
});

// debug test button
if (debugTestBtn) {
    debugTestBtn.addEventListener('click', async () => {
        debugOut.textContent = 'Sending test request...';
        try {
            const payload = { title: 'Debug Test', desc: 'quick debug', mode: 'witty', deep: true };
            const resp = await fetch('/api/reading', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const txt = await resp.text();
            debugOut.textContent = `STATUS: ${resp.status}\n\nREQUEST:\n${JSON.stringify(payload, null, 2)}\n\nRESPONSE:\n${txt}`;
        } catch (e) {
            debugOut.textContent = `ERROR: ${e.message}`;
        }
    });
}
