// Standalone cards page script
(function () {
    // 22-card deck (tech tarot) with upright/reversed meanings
    const deck = [
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
        // show tarot back before reveal
        const front = document.createElement('div'); front.className = 'front';
        front.style.backgroundImage = `url(assets/tarotback.png)`;
        front.style.backgroundSize = 'cover';
        front.style.backgroundPosition = 'center';
        front.textContent = '';
        const back = document.createElement('div'); back.className = 'back';
        const art = document.createElement('div'); art.className = 'art';
        const asset = slugify ? (`assets/${slugify(info.title)}.png`) : (`assets/${info.title}.png`);
        // if getAssetForTitle exists in global scope (from script.js), prefer it
        if (typeof getAssetForTitle === 'function') art.style.backgroundImage = `url(${getAssetForTitle(info.title)})`;
        else art.style.backgroundImage = `url(${asset})`;
        art.style.backgroundSize = 'cover';
        art.style.backgroundPosition = 'center';
        const isReversed = Math.random() < 0.5;
        if (isReversed) el.classList.add('reversed');
        back.innerHTML = `<strong>${info.title}</strong>`;
        const readingDiv = document.createElement('div'); readingDiv.className = 'desc reading';
        readingDiv.innerHTML = isReversed ? info.reversed : info.upright;
        back.appendChild(art);
        // store reading in dataset for combined result
        el.dataset.reading = isReversed ? info.reversed : info.upright;
        el.dataset.title = info.title;
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
            setTimeout(() => {
                el.classList.add('flipped');
                // show per-card result (use precomputed orientation reading)
                const title = info.title;
                const readingText = el.dataset.reading || (el.classList.contains('reversed') ? info.reversed : info.upright);
                cardsResult.classList.remove('hidden');
                cardsResult.innerHTML = `<h3>${title}</h3><div class="llm">${readingText}</div>`;

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
        const parts = selected.map(el => {
            const t = el.dataset.title || el.querySelector('.back strong').innerText;
            const r = el.dataset.reading || el.querySelector('.back .desc')?.innerText || '';
            return `- ${t}: ${r}`;
        });
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
        // default: use fanned overlapping layout on standalone page
        grid.classList.add('fanned');
        const pool = shuffle(deck.slice());
        const count = 22; // show all Major Arcana
        // compute card width so 22 cards fit in one horizontal row within the container
        const containerWidth = Math.max(600, grid.clientWidth || (window.innerWidth - 160));
        // compute card size and overlap so 22 cards fit in a fanned stack
        const idealCardW = 220;
        const maxCardW = Math.min(220, Math.floor(containerWidth / 6));
        let cardW = Math.max(72, Math.min(idealCardW, maxCardW));
        const cardH = Math.round(cardW * (320 / 220));
        const visibleWidth = containerWidth - 120;
        const shift = Math.max(22, Math.floor((visibleWidth - cardW) / (count - 1)));
        const effectiveShift = Math.max(16, Math.min(cardW - 24, shift));
        for (let i = 0; i < count; i++) {
            const info = pool[i % pool.length];
            const card = makeCard(i, info);
            // stacking: lower cards have lower z-index
            card.style.zIndex = 100 + i;
            // size and absolute position
            card.style.width = cardW + 'px';
            card.style.height = cardH + 'px';
            card.style.left = (i * effectiveShift) + 'px';
            const rot = (i - count / 2) * 0.6;
            card.style.transform = `translateY(18px) rotate(${rot}deg)`;
            card.style.opacity = '0';
            grid.appendChild(card);
            setTimeout(() => {
                card.style.transition = 'transform 420ms cubic-bezier(.2,.9,.2,1), opacity 360ms ease';
                card.style.transform = `translateY(0px) rotate(${rot}deg)`;
                card.style.opacity = '1';
                card.classList.add('enter');
            }, 20 + i * 8);
        }
        // size grid to fit stack
        const totalWidth = ((count - 1) * effectiveShift) + cardW;
        grid.style.width = totalWidth + 'px';
        grid.style.height = (cardH + 40) + 'px';
        grid.style.margin = '0 auto';
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
    // non-wrapping single-line layout: cards will be scaled to fit into one centered row
    style.textContent = `.cards-grid{display:flex;gap:18px;align-items:center;justify-content:center;margin:22px 0;flex-wrap:nowrap;overflow:hidden}.cards-grid.long-spread{justify-content:center}.cards-page .cards-controls{display:flex;gap:10px;justify-content:center;margin-top:8px}`;
    document.head.appendChild(style);

    renderGrid();
})();
