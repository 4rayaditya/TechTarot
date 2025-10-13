// Standalone cards page script
(function () {
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

    const grid = document.querySelector('.cards-grid');
    const backBtn = document.getElementById('backHome');
    const reshuffle = document.getElementById('reshuffle');
    const pullBtn = document.getElementById('pullBtn');
    const cardsResult = document.getElementById('cardsResult');

    function seedRand(s) {
        let h = 2166136261 >>> 0;
        for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
        return () => (h = Math.imul(h + 0x6D2B79F5, 0x7FFFFFFF) >>> 0) / 0xFFFFFFFF;
    }

    function clientMock(title, desc) {
        const rnd = seedRand(title + '|' + desc + '|' + Date.now());
        const reading = `${title}: ${desc}. ${['Try a small test', 'Focus on one metric', 'Talk to three customers'][Math.floor(rnd() * 3)]}.`;
        const actions = ['Ship a small experiment', 'Measure conversion', 'Talk to 3 users'];
        return new Promise(r => setTimeout(() => r({ reading, actions }), 240 + Math.floor(Math.random() * 320)));
    }

    // selection state (max 3)
    const selected = [];

    function makeCard(i, info) {
        const el = document.createElement('div');
        el.className = 'card';
        el.dataset.index = i;
        const inner = document.createElement('div'); inner.className = 'inner';
        const front = document.createElement('div'); front.className = 'front'; front.textContent = '?';
        const back = document.createElement('div'); back.className = 'back';
        back.innerHTML = `<strong>${info.title}</strong><div class="desc">${info.desc}</div>`;
        inner.appendChild(front); inner.appendChild(back); el.appendChild(inner);

        el.addEventListener('click', async () => {
            // selection flow: allow picking up to 3 cards
            if (el.classList.contains('flipped')) return; // already revealed
            // if already selected, deselect
            if (el.classList.contains('selected')) {
                el.classList.remove('selected');
                const idx = selected.indexOf(el);
                if (idx >= 0) selected.splice(idx, 1);
                updateSelectHint();
                return;
            }

            if (selected.length >= 3) return; // max reached
            // mark selected and pop out
            el.classList.add('selected');
            selected.push(el);
            updateSelectHint();

            // animate flip after a short delay
            setTimeout(async () => {
                el.classList.add('flipped');
                // show per-card result
                const title = info.title;
                cardsResult.classList.remove('hidden');
                cardsResult.innerHTML = `<h3>${title}</h3><p class="loading">Consulting the oracle…</p>`;
                // fetch reading
                const data = await clientMock(title, info.desc);
                cardsResult.innerHTML = `<h3>${title}</h3><div class="llm">${data.reading}</div>` + (data.actions ? `<ul class="actions">${data.actions.map(a => `<li>${a}</li>`).join('')}</ul>` : '');

                // if we have 3 selections, show combined reading
                if (selected.length === 3) {
                    showCombinedReading();
                }
            }, 260);
        });
        return el;
    }

    function updateSelectHint() {
        let hint = document.querySelector('.select-hint');
        if (!hint) {
            hint = document.createElement('div'); hint.className = 'select-hint';
            grid.parentNode.insertBefore(hint, grid.nextSibling);
        }
        const n = selected.length;
        hint.textContent = n === 0 ? 'Choose up to 3 cards to reveal a reading' : `${n} selected — choose ${3 - n} more`;
    }

    async function showCombinedReading() {
        // gather titles
        const titles = selected.map(el => el.querySelector('.back strong').innerText);
        cardsResult.classList.remove('hidden');
        cardsResult.innerHTML = `<h3>Combined reading</h3><p class="loading">Synthesizing the oracle…</p>`;
        // simulate combining by requesting a mock per card and concatenating
        const parts = [];
        for (const el of selected) {
            const title = el.querySelector('.back strong').innerText;
            const desc = el.querySelector('.back .desc').innerText;
            const d = await clientMock(title, desc);
            parts.push(`- ${title}: ${d.reading}`);
        }
        cardsResult.innerHTML = `<h3>Combined reading</h3><div class="llm">${parts.join('<br>')}</div>`;
        // show a button to clear selections
        const clear = document.createElement('button'); clear.className = 'btn ghost'; clear.textContent = 'Clear selection';
        clear.addEventListener('click', () => {
            selected.forEach(s => { s.classList.remove('selected'); s.classList.remove('flipped'); });
            selected.length = 0;
            updateSelectHint();
            cardsResult.classList.add('hidden');
            renderGrid();
        });
        cardsResult.appendChild(clear);
    }

    function shuffle(a) {
        return a.slice().sort(() => Math.random() - 0.5);
    }

    function renderGrid() {
        grid.innerHTML = '';
        grid.classList.remove('spread');
        grid.classList.remove('long-spread');
        grid.classList.remove('fanned');
        // default: fanned overlapping deck look (no scroll)
        grid.classList.add('fanned');
        const pool = shuffle(deck.concat(deck, deck));
        const count = 24;
        for (let i = 0; i < count; i++) {
            const info = pool[i % pool.length];
            const card = makeCard(i, info);
            // stacking: lower cards have lower z-index
            card.style.zIndex = i;
            grid.appendChild(card);
            // place around center by assigning center-* classes for transform presets
            const centerIndex = Math.floor(count / 2);
            const offset = i - centerIndex;
            const posClass = `center${offset >= 0 ? '-' + Math.abs(offset) : offset}`;
            // just add generic enter and set position via left offset after a tick
            setTimeout(() => {
                card.classList.add('enter');
                // distribute horizontally by adjusting left using index
                const spread = (i - centerIndex) * 28;
                card.style.left = `calc(50% + ${spread}px)`;
            }, 10 + i * 16);
        }
        cardsResult.classList.add('hidden');
    }

    function pullThree() {
        // pick 3 random cards and layout side-by-side
        const picks = shuffle(deck).slice(0, 3);
        grid.innerHTML = '';
        grid.classList.remove('fanned');
        grid.classList.add('spread');
        for (let i = 0; i < picks.length; i++) {
            const card = makeCard(i, picks[i]);
            // enlarge for spread
            card.style.width = '260px';
            card.style.height = '360px';
            card.style.transition = 'transform 600ms cubic-bezier(.2,.9,.2,1)';
            grid.appendChild(card);
            setTimeout(() => card.classList.add('enter'), 80 + i * 120);
        }
        // add subtle tech overlay for this view
        document.body.classList.add('tech-overlay');
        cardsResult.classList.add('hidden');
    }

    backBtn.addEventListener('click', () => window.location.href = './');
    reshuffle.addEventListener('click', renderGrid);
    pullBtn.addEventListener('click', pullThree);

    // responsive grid styles injection (small) if not present
    const style = document.createElement('style');
    style.textContent = `.cards-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:18px;align-items:center;justify-items:center;margin:22px 0}.cards-page .cards-controls{display:flex;gap:10px;justify-content:center;margin-top:8px}`;
    document.head.appendChild(style);

    renderGrid();
})();
