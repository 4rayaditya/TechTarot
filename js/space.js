// Simple animated starfield + drifting planet + comet
(function () {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, stars = [];

    // config tweaks: density, twinkle, palette
    const config = {
        densityDivisor: 4500, // smaller -> more stars
        twinkleSpeedBase: 0.003,
        twinkleAmpBase: 0.7,
        colors: [
            [255, 255, 255], // white
            [200, 220, 255], // pale blue
            [255, 240, 200], // warm amber
            [220, 200, 255]  // soft purple
        ],
        maxStars: 1400,
        planetCount: 2,
        cometChancePerSec: 0.2,
        // reduce meteor frequency significantly: user requested fewer meteors
        meteorChancePerSec: 0,
        // enable an animated, stylized solar system (Sun + 8 planets + some moons)
        enableSolarSystem: true
    };

    // parallax state (for nebula DOM layers)
    const nebulaLayers = Array.from(document.querySelectorAll('.nebula'));
    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0, offsetX = 0, offsetY = 0;

    // extra scene objects
    let planets = [];
    let solarSystem = null;
    let comets = [];
    let meteors = [];
    let lastCometCheck = Date.now();
    let lastMeteorCheck = Date.now();

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        initStars();
        initPlanets();
    }

    function initStars() {
        stars = [];
        const count = Math.min(config.maxStars, Math.floor((w * h) / config.densityDivisor));
        for (let i = 0; i < count; i++) {
            const baseR = Math.random() * 1.6 + 0.3;
            stars.push({
                x: Math.random() * w,
                y: Math.random() * h,
                baseR,
                vx: (Math.random() - 0.5) * 0.05,
                vy: (Math.random() - 0.5) * 0.05,
                twinklePhase: Math.random() * Math.PI * 2,
                twinkleSpeed: config.twinkleSpeedBase * (0.6 + Math.random() * 1.4),
                twinkleAmp: config.twinkleAmpBase * (0.4 + Math.random() * 0.9),
                color: config.colors[Math.floor(Math.random() * config.colors.length)],
                parallax: (Math.random() - 0.5) * 0.6
            });
        }
    }

    function initPlanets() {
        // lightweight planets (kept for decorative mode when solar system is disabled)
        planets = [];
        const pcount = Math.max(1, Math.min(3, config.planetCount));
        // place decorative planets on concentric circular orbits around canvas center
        const center = { cx: w * 0.5, cy: h * 0.48 };
        const baseOrbit = Math.min(w, h) / 10; // base distance from center
        for (let i = 0; i < pcount; i++) {
            const r = (Math.min(w, h) / 16) * (0.6 + Math.random() * 0.9);
            // assign each planet an orbit radius so they don't overlap
            const orbitR = baseOrbit + i * (Math.min(w, h) / 14) + Math.random() * (Math.min(w, h) / 40);
            const angle = Math.random() * Math.PI * 2;
            // speed inversely proportional to orbit radius for nicer motion
            const speed = (0.0006 / (1 + orbitR / baseOrbit)) + (Math.random() - 0.5) * 0.00008;
            const col = [120 + Math.floor(Math.random() * 120), 60 + Math.floor(Math.random() * 120), 80 + Math.floor(Math.random() * 120)];
            planets.push({ center, orbitR, r, color: col, angle, speed });
        }
        // also initialize solar system data if enabled
        if (config.enableSolarSystem) initSolarSystem();
    }

    function initSolarSystem() {
        // create a stylized solar system centered near the canvas center
        const centerX = w * 0.5;
        const centerY = h * 0.48;
        // relative distances (AU-like) for Mercury..Neptune
        const rel = [0.39, 0.72, 1, 1.52, 5.2, 9.58, 19.2, 30.05];
        const names = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
        const colors = [
            [200, 200, 200], // Mercury
            [220, 180, 120], // Venus
            [100, 150, 255], // Earth
            [210, 140, 110], // Mars
            [220, 180, 120], // Jupiter (warm)
            [210, 190, 150], // Saturn
            [170, 220, 240], // Uranus
            [120, 150, 220]  // Neptune
        ];

        // explicit visual size factors per planet (Mercury..Neptune) so Jupiter is largest
        const sizeFactors = [0.6, 0.9, 1.0, 0.7, 3.8, 3.2, 1.5, 1.3];

        const maxRel = Math.max(...rel);
        const minRel = Math.min(...rel);

        // Compute a safe available radius so orbits do not overlap UI (control panel, edges)
        const controlEl = document.querySelector('.control-panel');
        const controlWidth = controlEl ? Math.round(controlEl.getBoundingClientRect().width) : 0;
        const uiRightInset = controlWidth + 40; // leave a margin from the right-side control panel
        const uiLeftInset = 60;
        const uiTopInset = 60;
        const uiBottomInset = 60;

        // distance available from center to each side, subtracting UI insets
        const availLeft = Math.max(80, centerX - uiLeftInset);
        const availRight = Math.max(80, w - centerX - uiRightInset);
        const availTop = Math.max(80, centerY - uiTopInset);
        const availBottom = Math.max(80, h - centerY - uiBottomInset);

        // maximum radius that fits without overlapping UI or exiting canvas
        const availableRadius = Math.max(120, Math.min(availLeft, availRight, availTop, availBottom));

        // map the relative distances into the available radius range with a small inner margin
        const minOrbit = 48; // inner padding from sun
        const maxOrbit = Math.max(minOrbit + 40, availableRadius);
        const orbitRange = Math.max(1, maxRel - minRel);

        solarSystem = {
            cx: centerX,
            cy: centerY,
            sun: { r: Math.max(20, Math.min(w, h) / 18), color: [255, 200, 80] },
            planets: []
        };

        // First pass: compute radii and initial orbitR for all planets
        const tempPlanets = [];
        for (let i = 0; i < rel.length; i++) {
            const d = rel[i];
            const pr = Math.max(2, Math.round(sizeFactors[i] * Math.min(w, h) / 100));
            const norm = (d - minRel) / orbitRange; // 0..1
            const stretch = 3; // >1 pushes outer planets farther out
            const mapped = Math.pow(norm, stretch);
            const separation = i * 12;
            let orbitR = Math.round(minOrbit + mapped * (maxOrbit - minOrbit) + separation);
            if (i === rel.length - 1) orbitR = Math.max(orbitR, maxOrbit - 6);
            tempPlanets.push({ i, d, pr, orbitR });
        }

        // Nudge Mercury slightly away from the Sun for visual clarity
        if (tempPlanets.length > 0) {
            tempPlanets[0].orbitR += 6; // small outward nudge
        }

        // Second pass: enforce minimum gaps between neighbors based on planet radii
        const minGapBase = 8; // base pixel gap
        for (let i = 1; i < tempPlanets.length; i++) {
            const prev = tempPlanets[i - 1];
            const cur = tempPlanets[i];
            const minGap = Math.round(minGapBase + prev.pr + cur.pr);
            if (cur.orbitR - prev.orbitR < minGap) {
                // push current outward to satisfy gap
                cur.orbitR = prev.orbitR + minGap;
            }
        }

        // If outermost exceeds maxOrbit, compress all orbits proportionally to fit
        const outer = tempPlanets[tempPlanets.length - 1];
        if (outer.orbitR > maxOrbit) {
            const scale = (maxOrbit - minOrbit) / (outer.orbitR - minOrbit);
            for (const tp of tempPlanets) {
                tp.orbitR = Math.round(minOrbit + (tp.orbitR - minOrbit) * scale);
            }
        }

        // build final planets array with speeds/angles
        for (const tp of tempPlanets) {
            const speed = 0.0009 / Math.sqrt(tp.d);
            const angle = (tp.i / rel.length) * Math.PI * 2 - Math.PI / 2;
            const planet = {
                name: names[tp.i],
                orbitR: tp.orbitR,
                r: tp.pr,
                color: colors[tp.i] || [180, 180, 200],
                angle,
                speed,
                moons: []
            };
            solarSystem.planets.push(planet);
        }
    }

    function spawnComet() {
        // comets spawn off the left or right and glide mostly horizontally across the screen
        const fromLeft = Math.random() < 0.5;
        const y = Math.random() * h * 0.7 + h * 0.15;
        const x = fromLeft ? -120 - Math.random() * 80 : w + 120 + Math.random() * 80;
        // stronger horizontal velocity, gentle vertical drift
        const baseSpeed = 2 + Math.random() * 3;
        const vx = fromLeft ? (baseSpeed + Math.random() * 4) : -(baseSpeed + Math.random() * 4);
        const vy = (Math.random() - 0.5) * 0.8;
        const len = 220 + Math.random() * 260;
        const col = [255, 240, 200];
        comets.push({ x, y, vx, vy, len, life: 0, maxLife: 14000 + Math.random() * 10000, color: col });
    }

    function spawnMeteor() {
        // fast short-lived meteor — spawn from left or right side and travel horizontally
        const fromLeft = Math.random() < 0.5;
        const startY = Math.random() * h * 0.7 + h * 0.15; // avoid extreme top/bottom
        const startX = fromLeft ? -30 : w + 30;
        // faster horizontal velocity, small vertical variance
        const speed = 6 + Math.random() * 8; // px per frame base
        const vx = fromLeft ? (speed + Math.random() * 4) : -(speed + Math.random() * 4);
        const vy = (Math.random() - 0.5) * 1.5; // slight up/down
        const len = 40 + Math.random() * 80;
        meteors.push({ x: startX, y: startY, vx, vy, len, life: 0, maxLife: 700 + Math.random() * 900 });
    }

    function updateNebulaTransforms() {
        // gentle transform per layer using dataset.parallax or index fallback
        nebulaLayers.forEach((el, idx) => {
            const factor = parseFloat(el.dataset.parallax || (idx === 0 ? '0.02' : '0.04'));
            const tx = offsetX * factor;
            const ty = offsetY * factor;
            const drift = Math.sin(Date.now() * 0.0002 + idx) * 10; // subtle slow drift
            el.style.transform = `translate3d(${tx}px, ${ty + drift}px, 0)`;
        });
    }

    function drawPlanets(dt) {
        // If solar system enabled, render stylized Sun + orbits + planets + moons
        if (config.enableSolarSystem && solarSystem) {
            const s = solarSystem;
            // draw orbit rings (made more visible)
            ctx.save();
            ctx.strokeStyle = 'rgba(255,255,255,0.10)';
            ctx.lineWidth = 1.2;
            for (const pl of s.planets) {
                ctx.beginPath();
                ctx.ellipse(s.cx + offsetX * 0.01, s.cy + offsetY * 0.01, pl.orbitR, pl.orbitR, 0, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();

            // draw Sun glow
            const sun = s.sun;
            const grad = ctx.createRadialGradient(s.cx, s.cy, sun.r * 0.2, s.cx, s.cy, sun.r * 6);
            // brighter sun glow for visibility
            grad.addColorStop(0, `rgba(${sun.color[0]},${sun.color[1]},${sun.color[2]},1.00)`);
            grad.addColorStop(0.35, `rgba(${sun.color[0]},${sun.color[1]},${sun.color[2]},0.28)`);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(s.cx, s.cy, sun.r * 6, 0, Math.PI * 2);
            ctx.fill();

            // sun core
            ctx.beginPath();
            ctx.fillStyle = `rgba(${sun.color[0]},${sun.color[1]},${sun.color[2]},1)`;
            ctx.arc(s.cx, s.cy, sun.r, 0, Math.PI * 2);
            ctx.fill();

            // draw planets and moons
            for (const p of s.planets) {
                // advance using radians-per-ms speeds (dt is ms)
                p.angle += p.speed * dt;
                const px = s.cx + Math.cos(p.angle) * p.orbitR + offsetX * 0.01;
                const py = s.cy + Math.sin(p.angle) * p.orbitR + offsetY * 0.01;

                // planet glow (boosted for visibility)
                const pg = ctx.createRadialGradient(px, py, Math.max(1, p.r * 0.2), px, py, p.r * 3.0);
                pg.addColorStop(0, `rgba(${p.color[0]},${p.color[1]},${p.color[2]},0.98)`);
                pg.addColorStop(0.35, `rgba(${p.color[0]},${p.color[1]},${p.color[2]},0.28)`);
                pg.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = pg;
                ctx.beginPath(); ctx.arc(px, py, Math.max(2, p.r * 3.0), 0, Math.PI * 2); ctx.fill();

                // Saturn ring (draw behind the planet body): draw ring first so the planet appears on top
                if (p.name === 'Saturn') {
                    ctx.save();
                    // much smaller ring geometry so it sits tight around Saturn
                    const ringInner = Math.max(1.2, p.r * 1.25);
                    const ringOuter = Math.max(ringInner + 4, p.r * 1.9);
                    const tilt = 0.6; // subtler tilt
                    ctx.translate(px, py);
                    ctx.rotate(0.18);
                    const ringGrad = ctx.createLinearGradient(-ringOuter, 0, ringOuter, 0);
                    ringGrad.addColorStop(0, 'rgba(200,180,150,0.06)');
                    ringGrad.addColorStop(0.5, 'rgba(240,220,180,0.14)');
                    ringGrad.addColorStop(1, 'rgba(200,180,150,0.06)');
                    ctx.beginPath();
                    ctx.ellipse(0, 0, ringOuter, ringOuter * tilt, 0, 0, Math.PI * 2);
                    ctx.fillStyle = ringGrad;
                    ctx.fill();
                    // carve inner hole to create ring thickness
                    ctx.globalCompositeOperation = 'destination-out';
                    ctx.beginPath();
                    ctx.ellipse(0, 0, ringInner, ringInner * tilt, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.restore();
                }

                // planet body (draw after ring so it sits on top)
                // ensure planet color is vivid and fully opaque for visibility
                const pc = p.color.map((v) => Math.min(255, Math.round(v * 1.05)));
                ctx.beginPath(); ctx.fillStyle = `rgba(${pc[0]},${pc[1]},${pc[2]},1.00)`; ctx.arc(px, py, p.r, 0, Math.PI * 2); ctx.fill();

                // planet labels removed per user request

                // no moons rendered - only Sun + 8 planets
            }
            return;
        }

        // fallback: decorative planets follow precise circular orbits around their assigned center
        const showPlanets = true;
        if (!showPlanets) return;
        for (const p of planets) {
            // time-scaled angular motion for frame-rate independence
            p.angle += p.speed * (dt / 16);
            const px = p.center.cx + Math.cos(p.angle) * p.orbitR + offsetX * 0.02;
            const py = p.center.cy + Math.sin(p.angle) * p.orbitR + offsetY * 0.02;

            // glow
            const grad = ctx.createRadialGradient(px, py, p.r * 0.2, px, py, p.r * 2.6);
            const c = p.color;
            grad.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},0.95)`);
            grad.addColorStop(0.45, `rgba(${c[0]},${c[1]},${c[2]},0.2)`);
            grad.addColorStop(1, 'rgba(10,12,20,0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(px, py, p.r * 2.6, 0, Math.PI * 2);
            ctx.fill();

            // planet body
            ctx.beginPath();
            ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},0.98)`;
            ctx.arc(px, py, p.r, 0, Math.PI * 2);
            ctx.fill();

            // faint ring for some planets (deterministic using angle to avoid flicker)
            if ((Math.floor((p.angle * 1000) % 10) === 0)) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(255,255,255,0.03)`;
                ctx.lineWidth = Math.max(1, p.r * 0.06);
                ctx.ellipse(px, py + p.r * 0.2, p.r * 1.4, p.r * 0.5, 0.4, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    }

    function drawComets(dt) {
        const now = Date.now();
        // spawn occasionally
        const showComets = (function () { try { const v = localStorage.getItem('tt-toggle-comets'); return v === null ? true : v === '1'; } catch (e) { return true } })();
        if (!showComets) return;
        if ((now - lastCometCheck) > 1000) {
            lastCometCheck = now;
            if (Math.random() < config.cometChancePerSec) spawnComet();
        }

        for (let i = comets.length - 1; i >= 0; i--) {
            const c = comets[i];
            c.x += c.vx * (dt / 16);
            c.y += c.vy * (dt / 16);
            c.life += dt;

            // draw tail
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            const hx = c.x, hy = c.y;
            const tx = c.x - c.vx * (c.len / 8);
            const ty = c.y - c.vy * (c.len / 8);
            const grad = ctx.createLinearGradient(hx, hy, tx, ty);
            grad.addColorStop(0, `rgba(${c.color[0]},${c.color[1]},${c.color[2]},1)`);
            grad.addColorStop(0.5, `rgba(${c.color[0]},${c.color[1]},${c.color[2]},0.25)`);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.strokeStyle = grad;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(hx, hy);
            ctx.lineTo(tx, ty);
            ctx.stroke();

            // head
            ctx.beginPath();
            ctx.fillStyle = `rgba(${c.color[0]},${c.color[1]},${c.color[2]},1)`;
            ctx.arc(hx, hy, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            if (c.life > c.maxLife || c.x < -200 || c.x > w + 200 || c.y < -200 || c.y > h + 200) {
                comets.splice(i, 1);
            }
        }
    }

    function drawMeteors(dt) {
        const now = Date.now();
        const showMeteors = (function () { try { const v = localStorage.getItem('tt-toggle-meteors'); return v === null ? true : v === '1'; } catch (e) { return true } })();
        if (!showMeteors) return;
        // check less frequently and limit concurrent meteors
        if ((now - lastMeteorCheck) > 1500) {
            lastMeteorCheck = now;
            // cap concurrent meteors to avoid bursts
            if (meteors.length < 6 && Math.random() < config.meteorChancePerSec) spawnMeteor();
        }

        for (let i = meteors.length - 1; i >= 0; i--) {
            const m = meteors[i];
            m.x += m.vx * (dt / 16);
            m.y += m.vy * (dt / 16);
            m.life += dt;

            // draw bright streak
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            const hx = m.x, hy = m.y;
            const tx = m.x - m.vx * (m.len / 2);
            const ty = m.y - m.vy * (m.len / 2);
            const grad = ctx.createLinearGradient(hx, hy, tx, ty);
            grad.addColorStop(0, 'rgba(255,255,220,1)');
            grad.addColorStop(0.4, 'rgba(255,200,160,0.6)');
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.strokeStyle = grad;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(hx, hy);
            ctx.lineTo(tx, ty);
            ctx.stroke();
            ctx.restore();

            // remove when life expired or fully off horizontal bounds
            if (m.life > m.maxLife || m.x < -300 || m.x > w + 300) {
                meteors.splice(i, 1);
            }
        }
    }

    let lastFrame = Date.now();
    function draw() {
        const now = Date.now();
        const dt = Math.min(60, now - lastFrame);
        lastFrame = now;

        // ease offsets toward target (smooth parallax)
        offsetX += (targetX - offsetX) * 0.08;
        offsetY += (targetY - offsetY) * 0.08;

        ctx.clearRect(0, 0, w, h);
        // richer background gradient (subtle nebula tint)
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, '#060318');
        g.addColorStop(0.5, '#0b1230');
        g.addColorStop(1, '#071021');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);

        // planets behind stars (pass dt for time-scaled motion)
        drawPlanets(dt);

        const time = now;

        // stars
        for (const s of stars) {
            s.x += s.vx; s.y += s.vy;
            // wrap
            if (s.x < -50) s.x = w + 50; if (s.x > w + 50) s.x = -50;
            if (s.y < -50) s.y = h + 50; if (s.y > h + 50) s.y = -50;

            // twinkle
            const t = Math.sin(time * s.twinkleSpeed + s.twinklePhase);
            const r = Math.max(0.1, s.baseR + t * s.twinkleAmp * 0.3);
            const alpha = Math.max(0.12, 0.55 + t * 0.45);

            // parallaxed draw position
            const px = s.x + offsetX * s.parallax;
            const py = s.y + offsetY * s.parallax;

            ctx.beginPath();
            ctx.fillStyle = `rgba(${s.color[0]},${s.color[1]},${s.color[2]},${alpha})`;
            ctx.arc(px, py, r, 0, Math.PI * 2);
            ctx.fill();
        }

        // comets and meteors drawn over stars
        drawComets(dt);
        drawMeteors(dt);

        // update nebula DOM layers to follow mouse (very subtle)
        if (nebulaLayers.length) updateNebulaTransforms();

        requestAnimationFrame(draw);
    }

    // pointer tracking for parallax
    function onPointerMove(e) {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        // convert to -1 .. 1 around center
        const cx = clientX - w / 2;
        const cy = clientY - h / 2;
        targetX = cx / Math.max(300, w) * 60; // scale down
        targetY = cy / Math.max(300, h) * 40;
    }

    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('mouseleave', () => { targetX = 0; targetY = 0; });
    window.addEventListener('resize', resize);
    resize();
    draw();
})();
