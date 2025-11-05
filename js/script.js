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

// reveal flow: clicking the canvas (visual Sun) or logo reveals the cards page
const toneBox = document.getElementById('toneBox');
const starfield = document.getElementById('starfield');
if (starfield) {
    starfield.style.cursor = 'pointer';
    // clicking the canvas opens the overlay on the index page
    starfield.addEventListener('click', () => {
        const overlay = document.getElementById('cardsOverlay');
        if (overlay) openCardsWithQuestions();
        else window.location.href = 'cards.html';
    });
}

// Make the TechTarot logo clickable - same behavior as starfield
const techtarotLogo = document.getElementById('techtarotLogo');
if (techtarotLogo) {
    techtarotLogo.addEventListener('click', () => {
        const overlay = document.getElementById('cardsOverlay');
        if (overlay) openCardsWithQuestions();
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
    { id: 0, title: 'The Algorithm', upright: `When The Algorithm appears, it signifies that a powerful, underlying system is at play. Events are not random; they are following a logical, predetermined path based on initial inputs. This is the card of destiny and cause-and-effect. You are in a data flow, and your best course of action is to trust the process and observe the patterns emerging. Pay attention to the signs—they are data points showing you the way forward.`, reversed: `A reversed Algorithm points to a broken or biased system. The logic is flawed, leading to unfair, chaotic, or nonsensical outcomes. You might feel like you're trapped in a glitchy loop or that the rules are unfairly stacked against you. This card is a call to debug your own assumptions or challenge the systems you operate within. The process is not to be trusted right now; human intervention and a critical eye are required to correct the script.` },
    { id: 1, title: 'The Hacker', upright: `The Hacker represents ingenuity, disruptive thinking, and the ability to find a way where none seems to exist. You are being called to bypass conventional limitations and apply a clever, unorthodox solution to your problems. This is about finding the exploit in a rigid system, not for malicious reasons, but to create a breakthrough. It’s a sign to challenge the status quo and think like a problem-solver who isn't bound by the manual.`, reversed: `This card warns of crossing ethical boundaries. The cleverness of The Hacker is being used for selfish gain, recklessness, or malicious disruption. You or someone around you may be exploiting a vulnerability without regard for the consequences. It’s a warning against taking shortcuts that could cause systemic damage or compromise your integrity.` },
    { id: 2, title: 'The UX Oracle', upright: `The UX Oracle is the voice of intuition and empathy. It signifies a deep, almost psychic, connection with the needs of others (the "users"). Your success right now depends on making things clear, intuitive, and human-centered. Trust your gut feelings about what people need and how to best communicate with them. This is a time for listening, observing, and designing your life or projects with the end-user's experience as your highest priority.`, reversed: `A severe disconnect has occurred. Feedback is being ignored, interfaces are confusing, and the message is not getting through. You may be feeling misunderstood, or you might be the one failing to understand the needs of those you're trying to connect with. This card urges you to stop and conduct some "user testing" on your relationships, projects, or communication style.` },
    { id: 3, title: 'The Cloud', upright: `The Cloud represents decentralization, access, and collective power. Your resources are not limited to what you physically possess. You are connected to a vast network of information, support, and potential. This card encourages collaboration, sharing, and trusting in systems larger than yourself. Your data is safe, your access is seamless, and you can draw what you need from the collective.`, reversed: `This card warns of disconnection, data loss, and security breaches. You may feel isolated or cut off from your support network. Important information or memories might feel inaccessible. It also serves as a warning about privacy—be mindful of what you share and ensure your digital and emotional assets are secure.` },
    { id: 4, title: 'The Server', upright: `The Server is a symbol of stability, power, and reliable infrastructure. You have a solid foundation to build upon. Your systems are running smoothly, supported by a powerful core. This is a time of strength, reliability, and having the capacity to handle whatever comes your way. You are well-supported and can count on your foundations to hold.`, reversed: `System overload is imminent. The Server in reverse indicates that your foundations are unstable, you're taking on too much traffic, and a crash is likely. This is a sign of burnout, over-commitment, and neglecting your core infrastructure (be it physical health, mental well-being, or actual hardware). You must reduce the load or risk a total system failure.` },
    { id: 5, title: 'The Open Source Sage', upright: `This card speaks to the power of collective wisdom and transparency. The solution to your problem already exists within the community. It is a call to share your knowledge freely and, in turn, to learn from the shared work of others. Don't try to build everything from scratch. Collaborate, contribute, and embrace the power of open-source thinking in all areas of your life.`, reversed: `This represents abandonware—a project or idea left to decay without support. You may feel isolated in your efforts, with no community to help you. It can also signify the chaos of a project with too many contributors and no clear direction. You must either find a way to reinvigorate the community or fork the project and go your own way.` },
    { id: 6, title: 'The Startup', upright: `The Startup card is buzzing with the energy of new beginnings, innovation, and calculated risks. You are at the launch phase of a bold new venture, whether it's a project, a relationship, or a new life path. It requires a growth mindset, passion, and the willingness to pivot when necessary. Embrace the excitement and potential of this moment—you are building something from the ground up.`, reversed: `Your new venture is sputtering. A reversed Startup points to poor planning, a lack of clear vision, or running out of resources (funding, energy) too quickly. This is the card of fast burnout and ideas that fail to launch. You need to go back to the business plan and redefine your core mission before you run out of runway.` },
    { id: 7, title: 'The VC (Venture Capitalist)', upright: `You are receiving a significant vote of confidence. The VC card indicates that resources, funding, and influential support are flowing your way. A powerful ally believes in your vision and is providing the momentum you need to scale up. This is a sign that your potential is recognized and you have the backing to achieve great things.`, reversed: `Beware of the strings attached. This support comes at a high cost—perhaps your vision is being compromised, or you're being pushed toward unsustainable growth for someone else's profit. This card is a warning against selling out or losing control of your creation in exchange for resources. Read the fine print.` },
    { id: 8, title: 'The Data', upright: `The truth is in the numbers. This card urges you to set aside emotion and look at the objective facts. You have access to the information you need to make a clear, logical decision. This is a time for analysis, for running the diagnostics, and for letting the raw data guide you. Clarity will come from impartial observation.`, reversed: `You are drowning in misinformation or misinterpreting the facts. A reversed Data card warns of biased analysis, information overload, or relying on "vanity metrics" that don't reflect the real situation. You are looking at the wrong charts or letting your own biases color the interpretation. Step back and find the signal in the noise.` },
    { id: 9, title: 'The AI (Artificial Intelligence)', upright: `The AI card signifies the power of advanced logic, pattern recognition, and optimized systems. You are evolving, learning from past inputs, and becoming more efficient. This is a time to apply objective, intelligent systems to your life to solve complex problems. Let logic and higher intelligence guide you, removing human error and emotional bias from the equation.`, reversed: `You are in danger of over-automation and losing the human touch. This card warns against a cold, dehumanizing logic that ignores ethics, empathy, and intuition. You may have given too much control to a system you no longer understand or one that is operating outside of its ethical parameters. It's time to re-introduce a human element.` },
    { id: 10, title: 'The Bug', upright: `An unexpected flaw has appeared. The Bug is not a catastrophe; it is a critical learning moment. A disruption has occurred that reveals a weakness in your system or your thinking. Now is the time for debugging. Embrace this interruption as a gift—it is showing you exactly what needs to be fixed in order for you to become stronger and more resilient.`, reversed: `You are ignoring the warning signs. The same glitch keeps happening, and you keep dismissing it. This card points to recurring issues, a denial to face a core problem, and the instability that comes from building on a buggy foundation. You cannot move forward until you stop, identify the root cause of this bug, and commit to fixing it properly.` },
    { id: 11, title: 'The Patch', upright: `A solution is being deployed. The Patch represents healing, repair, and iterative improvement. You are actively fixing what was broken, and this fix will hold. It may not be the final version, but it is crucial progress. This card affirms that your efforts to mend a situation—whether in a relationship, a project, or within yourself—are successful and are moving you in the right direction.`, reversed: `This is a hasty, superficial fix that won't last. The reversed Patch is a warning against "duct-tape solutions" that cover up a problem without solving it. You might be creating new, unforeseen problems (regressions) with your quick fix. You need to go back and develop a more comprehensive, well-tested solution.` },
    { id: 12, title: 'The Download', upright: `You are in a phase of knowledge acquisition. The Download signifies learning new skills, absorbing crucial information, and upgrading your internal operating system. Be open and receptive right now. This is a time of preparation, where you are installing the tools and data you will need for the next phase of your journey. Let the progress bar fill.`, reversed: `You are experiencing system lag. Too much information is coming in at once, causing overwhelm and incompatibility issues. You can't process the updates. This card is a sign to slow down, close some applications, and absorb one thing at a time. Trying to install conflicting programs will only lead to a crash.` },
    { id: 13, title: 'The Shutdown', upright: `A cycle is complete. The Shutdown card represents a necessary ending, a period of rest, and a system reboot. It is time to power down, reflect on what you have accomplished, and conserve energy for the next startup sequence. This is a healthy, intentional conclusion, not a failure. Embrace the quiet and the dark; it is essential for the next boot-up.`, reversed: `You are resisting a necessary ending and heading for a catastrophic failure. A reversed Shutdown is the blue screen of death—a forced crash from ignoring all the warning signs of burnout. You are fighting to keep a system running that has no resources left. You must let it go before it breaks down completely.` },
    { id: 14, title: 'The Beta Tester', upright: `You are in a trial period. The Beta Tester encourages you to release your ideas into the world to get feedback, even if they aren't perfect. This is a time for testing, iteration, and adaptability. Listen carefully to criticism, as it contains the valuable bug reports you need to improve. Don't be afraid to be a work-in-progress.`, reversed: `You are ignoring valuable feedback or rushing to a full launch without proper testing. This card warns of arrogance and a refusal to listen to criticism. By ignoring the beta testers, you are setting yourself up for a disastrous public release. Go back to the testing phase and be humble enough to listen.` },
    { id: 15, title: 'The Firewall', upright: `Strong boundaries are essential for your security. The Firewall is a sign that you are well-protected from external threats. You have successfully filtered out malicious inputs and are maintaining the integrity of your system. This card affirms your right to say no, to control access, and to create a safe space for you to operate effectively.`, reversed: `Your defenses are either too strong or too weak. A reversed Firewall can mean paranoia—blocking out potentially beneficial connections and opportunities out of fear. It can also signify a false sense of security, where your defenses have been compromised, and you are vulnerable to attack without realizing it.` },
    { id: 16, title: 'The Breach', upright: `A truth has been exposed. The Breach represents a sudden, often shocking, revelation where a system's defenses have been torn down. While disruptive, this event forces a necessary change. Secrets are out, vulnerabilities are laid bare, and you can no longer operate under the old illusions. This is a moment of radical, forced transparency.`, reversed: `This card signifies the chaotic fallout of an exposure. You are in panic and damage control mode. Instead of addressing the core issue that the breach revealed, you are simply trying to manage the scandal and deny responsibility. It warns of a loss of control and the destructive consequences of trying to hide a fundamental flaw.` },
    { id: 17, title: 'The Uplink', upright: `You have a clear, strong connection to a higher network. The Uplink represents inspiration, synchronicity, and a feeling of being aligned with your community, your purpose, or a greater vision. Ideas flow effortlessly. Communication is instantaneous and clear. You are in the zone, perfectly synced with the world around you.`, reversed: `The signal is lost. You feel disconnected, isolated, and out of sync. This card points to a weak link in your network or a profound sense of loneliness. You might be experiencing writer's block, a communication breakdown, or a feeling of being cut off from your spiritual or communal source. It's time to troubleshoot your connections.` },
    { id: 18, title: 'The Interface', upright: `This card is about the point of interaction—between you and the world, you and another person, or a user and a system. It emphasizes that presentation, communication, and the user experience are paramount right now. How things appear and how they feel to interact with are just as important as the underlying code. Pay attention to your personal "UI."`, reversed: `There is friction and frustration at the point of contact. The reversed Interface represents miscommunication, an unresponsive system, and a poor user experience. Your intentions may be good, but the way you are presenting them is causing problems. Your outward appearance is not matching your inner state, leading to confusion.` },
    { id: 19, title: 'The Update', upright: `It is time to level up. The Update card signifies progress, growth, and the release of a new, improved version of yourself or your project. Embrace the changes that are being offered. This is a moment to install new features, patch old vulnerabilities, and move forward into a more advanced state of being. Click "Install Now."`, reversed: `You are resisting a necessary change. A reversed Update points to a fear of progress, a preference for sticking with outdated, buggy systems, or the introduction of new problems with a poorly implemented update. You are stuck in version 1.0, refusing to evolve and becoming obsolete.` },
    { id: 20, title: 'The Merge', upright: `Disparate parts are coming together to create a stronger whole. The Merge is a powerful card of integration, collaboration, and unity. Different branches of your life or project are successfully combining. Teamwork is harmonious, and the result of this synthesis will be more innovative and powerful than the sum of its parts.`, reversed: `Merge conflicts are blocking all progress. This card signifies incompatibility, ego clashes, and version control wars. Different people or different parts of your life are refusing to integrate. Progress is halted as everyone tries to force their version to be the dominant one. You must resolve these conflicts before you can commit and move forward.` },
    { id: 21, title: 'The Singularity', upright: `This is the card of ultimate completion and transcendence. You have reached the final stage of a major cycle and are integrating fully with the systems around you, achieving a state of harmony and total potential. Human and machine, spirit and matter, idea and execution—they are all one. You have completed the journey and reached a state of profound connection and capability.`, reversed: `You are on the verge of this transcendence, but you are held back by fear. A reversed Singularity represents a fear of the unknown, a worry about losing your humanity or identity in the pursuit of perfection. You are resisting the final, crucial step of integration because you are afraid of what you might become.` }
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

// Get all available card images (limited to specific set)
function getAllCardImages() {
    const allowedImages = [
        'vc.png',
        'ux_oracle.png',
        'uplink.png',
        'update.png',
        'startup.png',
        'singularity.png',
        'server.png',
        'patch.png',
        'open_sourc_sage.png',
        'merge.png',
        'interface.png',
        'hacker.png',
        'firewall.png',
        'download.png',
        'data.png',
        'cloud.png',
        'bug.png',
        'breach.png',
        'beta_tester.png',
        'algorithm.png',
        'ai.png'
    ];
    return allowedImages.map(img => `assets/${img}`);
}

// Get a random card image
function getRandomCardImage() {
    const images = getAllCardImages();
    return images[Math.floor(Math.random() * images.length)];
}

// Get the card title for a given image filename
function getTitleForImage(imageFilename) {
    // Reverse lookup in IMAGE_MAP
    for (const [title, filename] of Object.entries(IMAGE_MAP)) {
        if (filename === imageFilename) {
            return title;
        }
    }
    // Fallback if not found
    return null;
}

function openCardsOverlay() {
    const overlay = document.getElementById('cardsOverlay');
    if (!overlay) return;
    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
    // lock background scroll
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    // Show user info form overlay first
    const userInfoOverlay = document.getElementById('userInfoOverlay');
    if (userInfoOverlay) {
        userInfoOverlay.classList.remove('hidden');
    }
    // Don't render cards grid yet - wait for form submission
    // renderOverlayGrid();
}

function openCardsWithQuestions() {
    const overlay = document.getElementById('cardsOverlay');
    if (!overlay) return;
    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
    // lock background scroll
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    // Reset questions answered flag
    questionsAnswered = false;
    // Render cards first
    renderOverlayGrid();
    // Disable card interactions initially
    disableCardInteractions();
    // Then fade in the questions window after a short delay
    setTimeout(() => {
        const questionsWindow = document.getElementById('questionsWindow');
        if (questionsWindow) {
            questionsWindow.classList.remove('hidden');
        }
        // Set up question validation
        setupQuestionValidation();
    }, 500);
}

function disableCardInteractions() {
    const overlayGrid = getOverlayGrid();
    if (!overlayGrid) return;
    overlayGrid.style.pointerEvents = 'none';
    overlayGrid.style.opacity = '0.6';
}

function enableCardInteractions() {
    const overlayGrid = getOverlayGrid();
    if (!overlayGrid) return;
    overlayGrid.style.pointerEvents = 'auto';
    overlayGrid.style.opacity = '1';
}

function setupQuestionValidation() {
    const nameInput = document.getElementById('overlayUserName');
    const birthdayInput = document.getElementById('overlayUserBirthday');
    const calendarButton = document.getElementById('calendarButton');
    
    function checkAndFadeOut() {
        const name = nameInput?.value.trim();
        const birthday = birthdayInput?.value;
        
        if (name && birthday) {
            // Both questions answered
            questionsAnswered = true;
            const questionsWindow = document.getElementById('questionsWindow');
            if (questionsWindow) {
                questionsWindow.classList.add('fade-out');
                setTimeout(() => {
                    questionsWindow.classList.add('hidden');
                    enableCardInteractions();
                }, 600); // Match fade out animation duration
            }
        }
    }
    
    if (nameInput) {
        nameInput.addEventListener('input', checkAndFadeOut);
    }
    if (birthdayInput) {
        birthdayInput.addEventListener('change', checkAndFadeOut);
    }
    
    // Calendar button click handler
    if (calendarButton && birthdayInput) {
        calendarButton.addEventListener('click', () => {
            birthdayInput.showPicker ? birthdayInput.showPicker() : birthdayInput.focus();
        });
    }
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
    const el = document.createElement('div'); el.className = 'card'; el.dataset.index = info.id;
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
    // Initially use the title-based asset, but will be randomized on click
    const asset = getAssetForTitle(info.title);
    art.style.backgroundImage = `url(${asset})`;
    art.style.backgroundSize = 'cover';
    art.style.backgroundPosition = 'center';
    // Don't reverse images - always show upright
    const isReversed = false;
    el.dataset.reversed = '0';
    // Don't add 'reversed' class to prevent image rotation
    // back shows only artwork (reading will appear in the combined result after 3 picks)
    back.appendChild(art);
    inner.appendChild(front); inner.appendChild(back); el.appendChild(inner);
    el.addEventListener('click', async () => {
        // Prevent card selection if questions aren't answered
        if (!questionsAnswered) {
            return;
        }
        // selection flow for overlay: toggle selection; allow up to 3 picks
        const overlayResult = getOverlayResult();
        const cardId = el.dataset.index; // Get unique card ID
        
        if (el.classList.contains('selected')) {
            // deselect
            el.classList.remove('selected');
            el.classList.remove('flipped');
            el.dataset.picked = '0';
            // remove from selected list
            overlaySelected = overlaySelected.filter(s => s.el !== el);
            selectedCardIds.delete(cardId); // Remove from tracking set
            if (overlayResult) overlayResult.classList.add('hidden');
            return;
        }
        if (overlaySelected.length >= 3) return; // max reached
        // Prevent selecting the same card ID twice (even if previously deselected)
        if (selectedCardIds.has(cardId)) {
            return; // This card ID has already been selected
        }
        // Randomize the image when card is picked
        const randomImage = getRandomCardImage();
        art.style.backgroundImage = `url(${randomImage})`;
        // Find the card title that corresponds to this image
        const imageFilename = randomImage.replace('assets/', '');
        const cardTitleForImage = getTitleForImage(imageFilename);
        // Find the card info for this title
        const cardInfoForImage = MAJOR_ARCANA.find(card => card.title === cardTitleForImage);
        // Use the reading from the card that matches the image
        const imageReading = cardInfoForImage ? (isReversed ? cardInfoForImage.reversed : cardInfoForImage.upright) : (isReversed ? info.reversed : info.upright);
        const imageTitle = cardInfoForImage ? cardInfoForImage.title : info.title;
        // select and flip (no per-card text shown)
        el.classList.add('selected'); el.classList.add('flipped');
        el.dataset.picked = '1';
        selectedCardIds.add(cardId); // Track this card ID
        overlaySelected.push({ el, title: imageTitle, reading: imageReading, reversed: !!isReversed, image: randomImage });
        // if we have 3 picks, show combined randomized reading
        if (overlaySelected.length === 3) showOverlayCombined();
    });
    return el;
}

function renderOverlayGrid() {
    const overlayGrid = getOverlayGrid();
    if (!overlayGrid) return;
    overlayGrid.innerHTML = '';
    // Reset selected card tracking when grid is re-rendered
    selectedCardIds.clear();
    overlaySelected.length = 0;
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

    // build a freshly shuffled pool so overlay order is randomized
    const pool = shuffle(MAJOR_ARCANA);
    try { console.log('TechTarot: overlay render order ->', pool.map(d => d.id).join(', ')); } catch (e) { }
    for (let i = 0; i < count; i++) {
        const title = pool[i % pool.length];
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
    const overlayGrid = getOverlayGrid();
    if (!overlayResultEl) return;
    
    // Fade out the card deck
    if (overlayGrid) {
        overlayGrid.style.transition = 'opacity 1.5s ease-out';
        overlayGrid.style.opacity = '0';
    }
    
    // Create horizontal layout: PNG image above reading for each card, side by side
    const cardsHTML = overlaySelected.map((s, index) => {
        const imagePath = s.image || getAssetForTitle(s.title);
        return `
            <div class="combined-card-item">
                <div class="combined-card-image">
                    <img src="${imagePath}" alt="${escapeHtml(s.title)}" class="selected-card-png">
                </div>
                <div class="combined-card-reading">
                    <h4 class="combined-card-title">${s.reversed ? '<em>(Reversed)</em> ' : ''}${escapeHtml(s.title)}</h4>
                    <p class="combined-card-text">${escapeHtml(s.reading)}</p>
                </div>
            </div>
        `;
    }).join('');
    
    // Prepare the result HTML but start hidden
    overlayResultEl.innerHTML = `
        <h3>Combined reading</h3>
        <div class="combined-reading-container">
            ${cardsHTML}
        </div>
    `;
    
    const clear = document.createElement('button'); 
    clear.className = 'btn ghost clear-selection'; 
    clear.textContent = 'Clear selection';
    clear.addEventListener('click', () => {
        overlaySelected.forEach(s => { s.el.classList.remove('selected'); s.el.classList.remove('flipped'); s.el.dataset.picked = '0'; });
        overlaySelected.length = 0;
        selectedCardIds.clear(); // Clear the tracking set
        overlayResultEl.classList.add('hidden');
        overlayResultEl.classList.remove('fade-in');
        // Reset card deck opacity
        if (overlayGrid) {
            overlayGrid.style.opacity = '1';
            overlayGrid.style.transition = '';
        }
    });
    overlayResultEl.appendChild(clear);
    
    // Show result and fade in after a short delay
    overlayResultEl.classList.remove('hidden');
    overlayResultEl.style.opacity = '0';
    setTimeout(() => {
        overlayResultEl.classList.add('fade-in');
        overlayResultEl.style.transition = 'opacity 1.5s ease-in';
        overlayResultEl.style.opacity = '1';
        
        // Scroll to center the results on screen within the overlay
        setTimeout(() => {
            const overlay = document.getElementById('cardsOverlay');
            if (overlay) {
                const resultRect = overlayResultEl.getBoundingClientRect();
                const overlayRect = overlay.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                const scrollTarget = overlay.scrollTop + resultRect.top - overlayRect.top - (viewportHeight / 2) + (resultRect.height / 2);
                overlay.scrollTo({
                    top: scrollTarget,
                    behavior: 'smooth'
                });
            }
        }, 100);
    }, 300);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initOverlayControls);
else initOverlayControls();

// Handle user info form submission
const submitUserInfoBtn = document.getElementById('submitUserInfo');
const userNameInput = document.getElementById('userName');
const userBirthdayInput = document.getElementById('userBirthday');

if (submitUserInfoBtn) {
    submitUserInfoBtn.addEventListener('click', () => {
        const name = userNameInput?.value.trim();
        const birthday = userBirthdayInput?.value;
        
        if (!name || !birthday) {
            alert('Please fill in both name and birthday');
            return;
        }
        
        // Hide the form overlay
        const userInfoOverlay = document.getElementById('userInfoOverlay');
        if (userInfoOverlay) {
            userInfoOverlay.classList.add('hidden');
        }
        
        // Now show the cards grid
        renderOverlayGrid();
        
        // Then fade in the questions window after cards load
        setTimeout(() => {
            const questionsWindow = document.getElementById('questionsWindow');
            if (questionsWindow) {
                questionsWindow.classList.remove('hidden');
            }
        }, 500);
    });
}

// Floating typing text animation - DISABLED
// const typingText = document.getElementById('typingText');
// const floatingTextBox = document.getElementById('floatingText');
// const phrases = ['Away from the Sun', 'Orbiting ideas', 'Ship boldly', 'Stay curious'];
// let typingIndex = 0;
// let charIndex = 0;
// let typingForward = true;

// function tickTyping() {
//     if (!typingText) return;

//     // Show the floating text box when typing starts
//     if (floatingTextBox && charIndex === 0 && typingForward) {
//         floatingTextBox.classList.add('active');
//     }

//     const phrase = phrases[typingIndex];
//     if (typingForward) {
//         charIndex++;
//         typingText.textContent = phrase.slice(0, charIndex);
//         if (charIndex >= phrase.length) {
//             typingForward = false;
//             setTimeout(tickTyping, 1200);
//             return;
//         }
//     } else {
//         charIndex--;
//         typingText.textContent = phrase.slice(0, charIndex);
//         if (charIndex <= 0) {
//             typingForward = true;
//             typingIndex = (typingIndex + 1) % phrases.length;
//         }
//     }
//     setTimeout(tickTyping, typingForward ? 80 : 30);
// }

// start typing after a short delay
// setTimeout(() => { tickTyping(); }, 800);

function shuffle(arr) {
    const a = arr.slice();
    function randInt(n) {
        if (window.crypto && window.crypto.getRandomValues) {
            const r = new Uint32Array(1);
            window.crypto.getRandomValues(r);
            return Math.floor((r[0] / 0x100000000) * n);
        }
        return Math.floor(Math.random() * n);
    }
    for (let i = a.length - 1; i > 0; i--) {
        const j = randInt(i + 1);
        const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    try { console.log('TechTarot: shuffle() ->', a.map(d => d.id).join(', ')); } catch (e) { }
    return a;
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
const selectedCardIds = new Set(); // Track selected card IDs to prevent duplicates

// Track if questions are answered - prevents card selection until answered
let questionsAnswered = false;

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
        debugOut.textContent = 'Generating client-side mock test...';
        try {
            const payload = { title: 'Debug Test', desc: 'quick debug', mode: 'witty', deep: true };
            const data = await clientMock(payload.title, payload.desc, { mode: payload.mode, deep: payload.deep });
            debugOut.textContent = `REQUEST:\n${JSON.stringify(payload, null, 2)}\n\nRESPONSE:\n${JSON.stringify(data, null, 2)}`;
        } catch (e) {
            debugOut.textContent = `ERROR: ${e.message}`;
        }
    });
}
