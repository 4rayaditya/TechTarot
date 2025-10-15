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
// questionnaire inputs removed from DOM — keep null placeholders to avoid ReferenceErrors
const gpaInput = null;
const hobbiesInput = null;

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

// reveal flow: clicking the canvas (visual Sun) reveals the cards page
const toneBox = document.getElementById('toneBox');
const starfield = document.getElementById('starfield');
if (starfield) {
    starfield.style.cursor = 'pointer';
    // clicking the canvas opens the overlay on the index page
    starfield.addEventListener('click', () => {
        const overlay = document.getElementById('cardsOverlay');
        if (overlay) openCardsOverlay();
        else window.location.href = 'cards.html';
    });
}

// Overlay logic: render 22 Major Arcana in the overlay
// Resolve overlay DOM nodes on demand to avoid nulls when script runs early
function getOverlayGrid() { return document.getElementById('overlayGrid'); }
function getCloseOverlay() { return document.getElementById('closeOverlay'); }
function getOverlayPull() { return document.getElementById('overlayPull'); }
function getOverlayReshuffle() { return document.getElementById('overlayReshuffle'); }
function getOverlayResult() { return document.getElementById('overlayResult'); }

// 22-card deck with upright/reversed meanings
const MAJOR_ARCANA = [
    { id: 0, title: 'The Algorithm', upright: 'Destiny, logic patterns, systems in motion', reversed: 'Chaos, unfair biases, broken logic' },
    { id: 1, title: 'The Hacker', upright: 'Ingenuity, breaking boundaries, finding flaws', reversed: 'Exploitation, recklessness, ethical issues' },
    { id: 2, title: 'The UX Oracle', upright: 'Intuition, user-centered design, empathy', reversed: 'Confusion, poor interface, ignoring feedback' },
    { id: 3, title: 'The Cloud', upright: 'Storage, access, decentralization', reversed: 'Data loss, leaks, disconnection' },
    { id: 4, title: 'The Server', upright: 'Stability, infrastructure, power', reversed: 'Crashes, overload, system failure' },
    { id: 5, title: 'The Open Source Sage', upright: 'Collaboration, shared knowledge, freedom', reversed: 'Abandonware, lack of support, chaos' },
    { id: 6, title: 'The Startup', upright: 'New ventures, risk-taking, innovation', reversed: 'Burnout, funding issues, lack of vision' },
    { id: 7, title: 'The VC (Venture Capitalist)', upright: 'Resources, momentum, strategic alliances', reversed: 'Greed, strings attached, shortsightedness' },
    { id: 8, title: 'The Data', upright: 'Truth, analytics, clarity through numbers', reversed: 'Misinterpretation, misinformation, bias' },
    { id: 9, title: 'The AI (Artificial Intelligence)', upright: 'Logic, evolution, advanced intelligence', reversed: 'Over-reliance, loss of control, ethical gray' },
    { id: 10, title: 'The Bug', upright: 'Disruption, flaw in the system, lesson learned', reversed: 'Recurring issues, denial, system instability' },
    { id: 11, title: 'The Patch', upright: 'Healing, fixing, iterative improvement', reversed: 'Hasty solutions, temporary fixes' },
    { id: 12, title: 'The Download', upright: 'Gaining knowledge, new tools, updates', reversed: 'Overwhelm, incompatibility, info dump' },
    { id: 13, title: 'The Shutdown', upright: 'Endings, transition, rebooting', reversed: 'Resistance to change, crash, burnout' },
    { id: 14, title: 'The Beta Tester', upright: 'Feedback, adaptability, improvement', reversed: 'Criticism ignored, lack of user testing' },
    { id: 15, title: 'The Firewall', upright: 'Boundaries, protection, security', reversed: 'Paranoia, blocked growth, false safety' },
    { id: 16, title: 'The Breach', upright: 'Revelation, system exposed, change forced', reversed: 'Loss of control, panic, scandal' },
    { id: 17, title: 'The Uplink', upright: 'Connection, network, synchronicity', reversed: 'Disconnection, weak links, isolation' },
    { id: 18, title: 'The Interface', upright: 'Presentation, interaction, duality', reversed: 'Frustration, poor experience, miscommunication' },
    { id: 19, title: 'The Update', upright: 'Progress, new version, continuous growth', reversed: 'Resistance, bugs introduced, regression' },
    { id: 20, title: 'The Merge', upright: 'Integration, collaboration, unity', reversed: 'Conflicts, incompatibility, version control war' },
    { id: 21, title: 'The Singularity', upright: 'Completion, transcendence, full potential', reversed: 'Fear of the unknown, over-automation' }
];

function slugify(title) {
    return title.toLowerCase().replace(/[()]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// map card titles to actual filenames in assets/ (fallback uses slugify)
const IMAGE_MAP = {
    'The Algorithm': 'algorithm.png',
    'The Hacker': 'hacker.png',
    'The UX Oracle': 'ux_oracle.png',
    'The Cloud': 'cloud.png',
    'The Server': 'server.png',
    'The Open Source Sage': 'open_sourc_sage.png',
    'The Startup': 'startup.png',
    'The VC (Venture Capitalist)': 'vc.png',
    'The Data': 'data.png',
    'The AI (Artificial Intelligence)': 'ai.png',
    'The Bug': 'bug.png',
    'The Patch': 'patch.png',
    'The Download': 'download.png',
    'The Shutdown': 'shutdown.png',
    'The Beta Tester': 'beta_tester.png',
    'The Firewall': 'firewall.png',
    'The Breach': 'breach.png',
    'The Uplink': 'uplink.png',
    'The Interface': 'interface.png',
    'The Update': 'update.png',
    'The Merge': 'merge.png',
    'The Singularity': 'singularity.png'
};

function getAssetForTitle(title) {
    const name = IMAGE_MAP[title] || (slugify(title) + '.png');
    return `assets/${name}`;
}

function openCardsOverlay() {
    const overlay = document.getElementById('cardsOverlay');
    if (!overlay) return;
    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
    // lock background scroll
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    renderOverlayGrid();
}

function closeCardsOverlay() {
    const overlay = document.getElementById('cardsOverlay');
    if (!overlay) return;
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
}

function makeOverlayCard(i, info) {
    const el = document.createElement('div'); el.className = 'card'; el.dataset.index = i;
    const inner = document.createElement('div'); inner.className = 'inner';
    // front shows tarot back image before reveal
    const front = document.createElement('div'); front.className = 'front';
    front.style.backgroundImage = `url(assets/tarotback.png)`;
    front.style.backgroundSize = 'cover';
    front.style.backgroundPosition = 'center';
    front.textContent = '';
    // back contains the artwork and the reading
    const back = document.createElement('div'); back.className = 'back';
    const art = document.createElement('div'); art.className = 'art';
    const asset = getAssetForTitle(info.title);
    art.style.backgroundImage = `url(${asset})`;
    art.style.backgroundSize = 'cover';
    art.style.backgroundPosition = 'center';
    // randomly determine orientation
    const isReversed = Math.random() < 0.5;
    el.dataset.reversed = isReversed ? '1' : '0';
    if (isReversed) el.classList.add('reversed');
    // back shows only artwork (reading will appear in the combined result after 3 picks)
    back.appendChild(art);
    inner.appendChild(front); inner.appendChild(back); el.appendChild(inner);
    el.addEventListener('click', async () => {
        // selection flow for overlay: toggle selection; allow up to 3 picks
        const overlayResult = getOverlayResult();
        if (el.classList.contains('selected')) {
            // deselect
            el.classList.remove('selected');
            el.classList.remove('flipped');
            el.dataset.picked = '0';
            // remove from selected list
            overlaySelected = overlaySelected.filter(s => s.el !== el);
            if (overlayResult) overlayResult.classList.add('hidden');
            return;
        }
        if (overlaySelected.length >= 3) return; // max reached
        // select and flip (no per-card text shown)
        el.classList.add('selected'); el.classList.add('flipped');
        el.dataset.picked = '1';
        const reading = isReversed ? info.reversed : info.upright;
        overlaySelected.push({ el, title: info.title, reading, reversed: !!isReversed });
        // if we have 3 picks, show combined randomized reading
        if (overlaySelected.length === 3) showOverlayCombined();
    });
    return el;
}

function renderOverlayGrid() {
    const overlayGrid = getOverlayGrid();
    if (!overlayGrid) return;
    overlayGrid.innerHTML = '';
    const count = 22;
    const gap = 18;
    // switch to fanned overlapping layout inside the overlay
    overlayGrid.classList.add('fanned');
    const containerWidth = (overlayGrid.parentElement && overlayGrid.parentElement.clientWidth) || (window.innerWidth - 160);
    // compute a base card width and overlap so 22 cards visually fit
    const idealCardW = 220;
    const maxCardW = Math.min(220, Math.floor(containerWidth / 6));
    let cardW = Math.max(72, Math.min(idealCardW, maxCardW));
    const cardH = Math.round(cardW * (320 / 220));
    // overlap: how many pixels each card shifts to the right; smaller -> more overlap
    const visibleWidth = containerWidth - 120; // leave some side padding
    const shift = Math.max(28, Math.floor((visibleWidth - cardW) / (count - 1)));
    // ensure positive shift
    const effectiveShift = Math.max(18, Math.min(cardW - 24, shift));

    for (let i = 0; i < count; i++) {
        const title = MAJOR_ARCANA[i % MAJOR_ARCANA.length];
        const c = makeOverlayCard(i, title);
        c.style.width = cardW + 'px'; c.style.height = cardH + 'px';
        // absolute positioning and staggered left
        const left = i * effectiveShift;
        c.style.left = left + 'px';
        // small rotation for visual variety
        const rot = (i - count / 2) * 0.6; // subtle rotation across row
        // start slightly down so entry animation is visible; we'll animate to translateY(0)
        c.style.transform = `translateY(18px) rotate(${rot}deg)`;
        c.style.opacity = '0';
        c.style.zIndex = 100 + i;
        overlayGrid.appendChild(c);
        // animate into place by updating inline styles (keeps rotations intact)
        setTimeout(() => {
            c.style.transition = 'transform 420ms cubic-bezier(.2,.9,.2,1), opacity 360ms ease';
            c.style.transform = `translateY(0px) rotate(${rot}deg)`;
            c.style.opacity = '1';
            c.classList.add('enter');
        }, 20 + i * 8);
    }
    // ensure container is wide enough to hold the fanned stack and center it
    const totalWidth = ((count - 1) * effectiveShift) + cardW;
    overlayGrid.style.width = totalWidth + 'px';
    overlayGrid.style.height = (cardH + 40) + 'px';
    overlayGrid.style.margin = '0 auto';
    const overlayResult = getOverlayResult();
    overlayResult && overlayResult.classList.add('hidden');
}

// attach overlay controls after DOM ready
function initOverlayControls() {
    const closeOverlay = getCloseOverlay();
    const overlayPull = getOverlayPull();
    const overlayReshuffle = getOverlayReshuffle();
    closeOverlay && closeOverlay.addEventListener('click', closeCardsOverlay);
    overlayPull && overlayPull.addEventListener('click', () => { renderOverlayGrid(); });
    overlayReshuffle && overlayReshuffle.addEventListener('click', renderOverlayGrid);
}

function showOverlayCombined() {
    const overlayResultEl = getOverlayResult();
    if (!overlayResultEl) return;
    const parts = shuffle(overlaySelected.slice()).map(s => {
        return `<li>${s.reversed ? '<em>(Reversed)</em> ' : ''}<strong>${escapeHtml(s.title)}</strong>: ${escapeHtml(s.reading)}</li>`;
    });
    overlayResultEl.classList.remove('hidden');
    overlayResultEl.innerHTML = `<h3>Combined reading</h3><ul>${parts.join('')}</ul>`;
    const clear = document.createElement('button'); clear.className = 'btn ghost'; clear.textContent = 'Clear selection';
    clear.addEventListener('click', () => {
        overlaySelected.forEach(s => { s.el.classList.remove('selected'); s.el.classList.remove('flipped'); s.el.dataset.picked = '0'; });
        overlaySelected.length = 0;
        overlayResultEl.classList.add('hidden');
    });
    overlayResultEl.appendChild(clear);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initOverlayControls);
else initOverlayControls();

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

function showCards(inPanel = true) {
    // show cardArea; populate with randomized options
    cardArea.classList.remove('hidden');
    const sample = shuffle(deck).slice(0, 6); // provide more choices visually
    cards.forEach((card, i) => {
        const back = card.querySelector('.back');
        const idx = i % sample.length;
        back.innerHTML = `<strong>${sample[idx].title}</strong><div class="desc">${sample[idx].desc}</div>`;
        card.classList.remove('flipped');
        card.classList.remove('selected');
        card.dataset.picked = '0';
        card.style.pointerEvents = 'auto';
        // entrance animation
        setTimeout(() => card.classList.add('enter'), 50 + i * 80);
    });
    result.innerHTML = '';
    againBtn.classList.add('hidden');
    deepBtn.classList.add('hidden');
    // track selections
    selectedCards.length = 0;
    updateSelectHint();
}

function updateSelectHint() {
    const hint = document.querySelector('.select-instructions');
    if (!hint) return;
    if (selectedCards.length === 0) hint.textContent = 'Pick card #1 — future profession';
    else if (selectedCards.length === 1) hint.textContent = 'Pick card #2 — what you are';
    else if (selectedCards.length === 2) hint.textContent = 'Pick card #3 — wildcard';
    else hint.textContent = 'Reveal to see the combined reading';
}

// startBtn reveals cards directly (no questionnaire)
startBtn.addEventListener('click', (e) => {
    // navigate to the standalone cards page
    window.location.href = 'cards.html';
});

// track up to 3 selections
const selectedCards = [];

// track overlay selections (for the full 22-card overlay)
const overlaySelected = [];

// questionnaire removed — no submit handler

// On load, check for interview from orb page and prefill
try {
    const raw = localStorage.getItem('tt-orb-interview');
    if (raw) {
        const interview = JSON.parse(raw);
        if (gpaInput && interview.gpa) gpaInput.value = interview.gpa;
        if (hobbiesInput && interview.hobbies) hobbiesInput.value = interview.hobbies;
        // surface a tiny preview
        if (interview.summary && result) {
            result.innerHTML = `<div class="personality-result"><strong>Interview summary</strong><div style="margin-top:6px;color:var(--muted);">${escapeHtml(interview.summary).slice(0, 400)}${interview.summary.length > 400 ? '…' : ''}</div></div>`;
        }
    }
} catch (e) { }

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
        // if already selected (picked earlier), ignore
        if (card.dataset.picked === '1' || selectedCards.length >= 3) return;
        // visually mark selected and flip
        card.classList.add('flipped');
        card.classList.add('selected');
        card.dataset.picked = '1';
        const back = card.querySelector('.back');
        const title = back.querySelector('strong').innerText;
        const short = back.querySelector('.desc').innerText;
        selectedCards.push({ title, short });
        updateSelectHint();

        // if three selections made, synthesize combined personality
        if (selectedCards.length === 3) {
            // render loading
            result.innerHTML = `<div class="personality-result"><p class="loading">Weaving the threads of your fate…</p></div>`;
            // build a prompt-like combined title and desc
            const mode = modeSelect?.value || 'witty';
            const gpa = (gpaInput && gpaInput.value) ? gpaInput.value.trim() : 'N/A';
            const hobbies = (hobbiesInput && hobbiesInput.value) ? hobbiesInput.value.trim() : 'not specified';
            const combinedTitle = `Three-card composite for: ${selectedCards.map(s => s.title).join(' | ')}`;
            const combinedDesc = `GPA: ${gpa}. Hobbies: ${hobbies}. Cards: ${selectedCards.map(s => s.short).join(' || ')}`;

            try {
                const data = await clientMock(combinedTitle, combinedDesc, { mode, deep: true });
                // clientMock returns { reading, actions, risks }
                const reading = data.reading || '';
                const actions = data.actions || [];
                const risks = data.risks || [];
                // craft a user-facing personality report
                const personalityHtml = `<h3>Your Combined Reading</h3><div class="llm">${escapeHtml(reading).replace(/\n/g, '<br>')}</div>` +
                    (actions.length ? `<h4>Suggested next steps</h4><ul class="actions">${actions.map(a => `<li>${escapeHtml(a)}</li>`).join('')}</ul>` : '') +
                    (risks.length ? `<h4>Considerations</h4><ul class="risks">${risks.map(r => `<li>${escapeHtml(r)}</li>`).join('')}</ul>` : '');
                result.innerHTML = `<div class="personality-result">${personalityHtml}</div>`;
                copyBtn.classList.remove('hidden');
                copyBtn.onclick = () => navigator.clipboard?.writeText(reading + '\n\n' + actions.join('\n'));
            } catch (err) {
                result.innerHTML = `<div class="personality-result"><p class="error">Failed to synthesize reading: ${err.message}</p></div>`;
            }
            againBtn.classList.remove('hidden');
        }
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
