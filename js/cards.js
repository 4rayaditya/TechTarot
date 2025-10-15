// Standalone cards page script
(function () {
    // 22-card deck (tech tarot) with user-updated upright/reversed texts
    const deck = [
        { id: 0, title: 'The Algorithm', upright: `Everything is happening for a reason right now. You're in a flow where events are connected, even if you can't see the code behind them. Trust this pattern. Pay attention to the little signs; they're the data points guiding you exactly where you need to be.`, reversed: `It feels like the rules are rigged, doesn't it? The system you're in feels unfair, illogical, or just plain broken. This isn't your fault. It's a sign to stop trusting the process and start questioning the code.` },
        { id: 1, title: 'The Hacker', upright: `Forget thinking outside the box—it's time to realize there is no box. You have a unique ability to find a clever workaround to a problem that has everyone else stumped. Challenge the rules and find that brilliant, unexpected shortcut.`, reversed: `Be careful. Your cleverness might be tempting you to cut corners that feel ethically questionable. Are you exploiting a situation for your own gain? This card is a gut-check on your methods and motives.` },
        { id: 2, title: 'The UX Oracle', upright: `Listen to your gut. You have a deep, almost instinctive understanding of what people need right now. Focus on empathy and clear communication. Making things easy and intuitive for others is your superpower at this moment.`, reversed: `Something is getting lost in translation. You either feel completely misunderstood, or you're struggling to see things from someone else's perspective. The connection is failing. It's time to ask, "What does it feel like to be on the other side of me right now?"` },
        { id: 3, title: 'The Cloud', upright: `You're not alone in this. You have access to a vast network of support, knowledge, and resources. Don't be afraid to reach out and collaborate. Everything you need is available if you just connect to it.`, reversed: `You're feeling disconnected, isolated, or worried about losing something important. It might be time to check your privacy settings—emotionally and digitally. Make sure you feel secure in your connections.` },
        { id: 4, title: 'The Server', upright: `You're on solid ground. You feel supported, stable, and have the energy to handle anything thrown your way. This is your sign that your foundation is strong, so build on it with confidence.`, reversed: `You're running on fumes, with way too many tabs open in your brain. A crash is coming if you don't reduce the load. This is a clear sign of burnout. What can you unplug from to prevent a total system failure?` },
        { id: 5, title: 'The Open Source Sage', upright: `You don't have to invent the wheel. The answer you're looking for is out there in the community. Be open to sharing what you know and learning from others. Collaboration is your key to success.`, reversed: `You feel like you’re working on a project that everyone else has abandoned. It’s lonely and unsupported. You may need to find a new community or decide if this project is still worth your passion.` },
        { id: 6, title: 'The Startup', upright: `This is it—the beginning of something new and exciting. It's a risk, for sure, but the potential for growth is immense. Pour your passion into this venture, stay agile, and enjoy the thrill of the launch.`, reversed: `Your great idea is failing to take off. You might be running out of energy, money, or belief. Before you burn out completely, you need to pause and refine your vision. What is your true mission here?` },
        { id: 7, title: 'The VC (Venture Capitalist)', upright: `Someone important believes in you. Resources, support, and momentum are coming your way from an influential source. This is a powerful vote of confidence in your potential. Accept it and scale up.`, reversed: `This help comes with strings attached. Are you being asked to compromise your vision for someone else's gain? Be wary of support that seeks to control you or pushes you in a direction that doesn't feel right.` },
        { id: 8, title: 'The Data', upright: `Your feelings are valid, but right now, you need to look at the facts. The data holds the truth you've been looking for. Step back from the drama and analyze the situation objectively. The numbers don't lie.`, reversed: `You're drowning in information, or worse, misinformation. You might be focusing on the wrong details or letting your own bias color your judgment. You need to find the real signal in all this noise.` },
        { id: 9, title: 'The AI (Artificial Intelligence)', upright: `It's time to use your head over your heart. A logical, intelligent, and objective approach will solve this problem. You are learning, evolving, and getting smarter from your experiences. Trust your advanced intellect.`, reversed: `You're overthinking things to the point of losing your humanity. Are you being cold, robotic, or ignoring the ethical implications of your choices? Don't let pure logic erase your empathy.` },
        { id: 10, title: 'The Bug', upright: `A glitch has appeared, and it's frustrating, but it's not a disaster. It's a gift. This unexpected problem is showing you exactly where the weakness is in your plan. It's a learning moment—time to debug.`, reversed: `This same problem keeps happening, and you keep ignoring it. You're stuck in a loop of denial. You can't move forward until you finally address the root cause of this recurring bug.` },
        { id: 11, title: 'The Patch', upright: `You're fixing what's broken, and it's working. This is a card of healing, forgiveness, and making things right. Your efforts are creating real, positive change. Acknowledge this progress.`, reversed: `You're just putting a band-aid on a major wound. This quick fix won't hold, and it might even be making things worse under the surface. You need to commit to a deeper, more permanent solution.` },
        { id: 12, title: 'The Download', upright: `Be a sponge. You are in a phase of absorbing new skills and crucial information. Stay open and be ready to learn. You are preparing for your next big level-up. Let the progress bar fill.`, reversed: `You're overwhelmed. It's too much information, too many updates, too many demands at once. You can't process it all. It's okay to pause the download and give yourself time to catch up.` },
        { id: 13, title: 'The Shutdown', upright: `It’s time to power down. This chapter is over, and that's okay. This is a necessary ending that allows you to rest, reset, and conserve your energy for what's next. Embrace the quiet.`, reversed: `You're fighting a necessary ending, and it's leading straight to burnout. You're trying to keep a system running that has nothing left. Let it go before it crashes and burns.` },
        { id: 14, title: 'The Beta Tester', upright: `It's time to put your idea out there, even if it's not perfect. Be open to feedback and willing to make changes. This is a learning phase, and other people's input is the key to your improvement.`, reversed: `You're completely shutting out criticism. By ignoring feedback or refusing to test your ideas, you're setting yourself up for failure. A little humility and listening will go a long way.` },
        { id: 15, title: 'The Firewall', upright: `You are safe and protected. This card is a sign that your boundaries are strong and healthy. You've done a good job of filtering out negativity. Trust in your defenses.`, reversed: `Your walls are either too high, blocking out good things, or they're not high enough, letting in toxic energy. It's time to re-evaluate your boundaries and decide what—and who—gets access to you.` },
        { id: 16, title: 'The Breach', upright: `The truth is out. A sudden, shocking revelation has broken down the walls, and while it's disruptive, it's also necessary. Things can no longer be hidden. Now you can finally deal with what's real.`, reversed: `You're in damage control mode. Instead of dealing with the truth that was exposed, you're panicking and trying to hide the fallout. This will only make the situation worse.` },
        { id: 17, title: 'The Uplink', upright: `You're in sync. Ideas are flowing, communication is effortless, and you feel a powerful connection to your purpose or your community. You're on the right wavelength. Enjoy this clear signal.`, reversed: `The signal is lost. You feel disconnected, lonely, and misunderstood. It’s a frustrating feeling of being out of sync with yourself and the world. It’s time to troubleshoot your connections.` },
        { id: 18, title: 'The Interface', upright: `How you present yourself matters right now. This is about your personal "user interface"—the way you interact with the world. Make sure your outer self is an authentic and clear reflection of your inner self.`, reversed: `You're coming across all wrong. Your intentions might be good, but your delivery is causing frustration and misunderstanding. There's a disconnect between what you mean and what you're showing.` },
        { id: 19, title: 'The Update', upright: `A new version of you is ready to be installed. It’s time to embrace change, let go of old bugs, and level up. This is a powerful opportunity for growth and progress. Say yes to the update.`, reversed: `You are resisting a much-needed change. By clinging to the old, familiar version of yourself or your life, you are choosing to live with known bugs. What are you so afraid of leaving behind?` },
        { id: 20, title: 'The Merge', upright: `It's all coming together. Different parts of your life are integrating beautifully, creating a stronger, more coherent whole. This harmony is the result of successful collaboration, either with others or within yourself.`, reversed: `It feels like a bad code merge. Ideas are clashing, egos are getting in the way, and nothing is compatible. Progress is stalled until you can sort out these conflicts and find a way to work together.` },
        { id: 21, title: 'The Singularity', upright: `You've reached a profound moment of completion and harmony. Everything makes sense. You feel a deep, effortless connection between who you are and what you do. This is you operating at your fullest potential.`, reversed: `You are so close to a massive breakthrough, but you're held back by a fear of losing yourself in the process. Don't be afraid of what you might become. This final step is evolution, not erasure.` }
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
        // store the card's canonical id (0-21) rather than the render index
        el.dataset.index = info.id;
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

        // small debug badge showing canonical card id so shuffle order is visible
        const badge = document.createElement('div');
        badge.className = 'badge';
        badge.textContent = info.id;
        el.appendChild(badge);

        // keyboard accessibility
        el.setAttribute('tabindex', '0');
        el.addEventListener('keydown', (e) => { if (e.key === 'Enter') el.click(); });

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

                // if we have 3 selections, show combined reading after a longer delay
                // so the user can comfortably read the third card's individual reading
                if (selected.length === 3) {
                    setTimeout(() => showCombinedReading(), 1200);
                }
            }, 260);
        });
        // ensure the card accepts pointer events (in case a previous view disabled them)
        el.style.pointerEvents = 'auto';
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
        const clear = document.createElement('button'); clear.className = 'btn ghost clear-selection'; clear.textContent = 'Clear selection';
        clear.addEventListener('click', () => {
            selected.forEach(s => { s.classList.remove('selected'); s.classList.remove('flipped'); });
            selected.length = 0;
            updateSelectHint();
            cardsResult.classList.add('hidden');
            renderGrid();
        });
        cardsResult.appendChild(clear);
    }

    // Fisher-Yates shuffle using crypto-backed randomness when available
    function shuffle(a) {
        const arr = a.slice();
        // helper: random int in [0, n)
        function randInt(n) {
            if (window.crypto && window.crypto.getRandomValues) {
                // use 32-bit unsigned random and scale
                const r = new Uint32Array(1);
                window.crypto.getRandomValues(r);
                return Math.floor((r[0] / 0x100000000) * n);
            }
            return Math.floor(Math.random() * n);
        }
        for (let i = arr.length - 1; i > 0; i--) {
            const j = randInt(i + 1);
            const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
        }
        try { console.log('TechTarot: shuffle() produced ->', arr.map(d => d.id).join(', ')); } catch (e) { }
        return arr;
    }

    // Persisted shuffle order helpers (sessionStorage) so reload preserves the last shuffle
    const SHUFFLE_KEY = 'tt-shuffle-order';
    function writeShuffleOrder(order) { try { sessionStorage.setItem(SHUFFLE_KEY, JSON.stringify(order)); } catch (e) { } }
    function readShuffleOrder() { try { const v = sessionStorage.getItem(SHUFFLE_KEY); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
    function buildPoolFromOrder(forceNew = false) {
        let order = readShuffleOrder();
        if (forceNew || !order || !Array.isArray(order) || order.length !== deck.length) {
            order = shuffle(deck).map(d => d.id);
            writeShuffleOrder(order);
            try { console.log('TechTarot: new shuffle order ->', order.join(', ')); } catch (e) { /* ignore */ }
        } else {
            try { console.log('TechTarot: using persisted shuffle order ->', order.join(', ')); } catch (e) { }
        }
        // map ids to deck entries preserving order
        const map = new Map(deck.map(d => [d.id, d]));
        return order.map(id => map.get(id)).filter(Boolean);
    }

    function renderGrid() {
        // reset UI state before populating
        grid.innerHTML = '';
        selected.length = 0;
        updateSelectHint();
        if (cardsResult) { cardsResult.classList.add('hidden'); cardsResult.innerHTML = ''; }
        grid.classList.remove('spread');
        grid.classList.remove('long-spread');
        grid.classList.remove('fanned');
        // default: use fanned overlapping layout on standalone page
        grid.classList.add('fanned');
        // always use a fresh shuffled pool for immediate randomness
        const pool = shuffle(deck);
        try { console.log('TechTarot: render pool order ->', pool.map(d => d.id).join(', ')); } catch (e) { }
        // render a small debug strip under the grid with the id order
        (function showDebugOrder() {
            try {
                let dbg = document.getElementById('tt-debug-order');
                if (!dbg) {
                    dbg = document.createElement('div'); dbg.id = 'tt-debug-order';
                    dbg.style.cssText = 'font-family:monospace;font-size:12px;color:#ddd;text-align:center;margin:8px 0;';
                    grid.parentNode.insertBefore(dbg, grid.nextSibling);
                }
                dbg.textContent = 'Order: ' + pool.map(d => d.id).join(', ');
            } catch (e) { }
        })();
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
        // clear any prior selections so reshuffling lets users pick again
        selected.length = 0;
        updateSelectHint();

        // size grid to fit stack
        const totalWidth = ((count - 1) * effectiveShift) + cardW;
        grid.style.width = totalWidth + 'px';
        grid.style.height = (cardH + 40) + 'px';
        grid.style.margin = '0 auto';
        cardsResult.classList.add('hidden');
    }

    function pullThree() {
        // reset state and pick 3 random cards and layout side-by-side
        selected.length = 0;
        updateSelectHint();
        if (cardsResult) { cardsResult.classList.add('hidden'); cardsResult.innerHTML = ''; }
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
    // reshuffle: create and persist a new random order then render
    function reshuffleAndRender() {
        const order = shuffle(deck).map(d => d.id);
        writeShuffleOrder(order);
        renderGrid();
    }
    reshuffle.addEventListener('click', reshuffleAndRender);
    pullBtn.addEventListener('click', pullThree);

    // responsive grid styles injection (small) if not present
    const style = document.createElement('style');
    // non-wrapping single-line layout: cards will be scaled to fit into one centered row
    style.textContent = `.cards-grid{display:flex;gap:18px;align-items:center;justify-content:center;margin:22px 0;flex-wrap:nowrap;overflow:hidden}.cards-grid.long-spread{justify-content:center}.cards-page .cards-controls{display:flex;gap:10px;justify-content:center;margin-top:8px}`;
    document.head.appendChild(style);

    renderGrid();
})();
