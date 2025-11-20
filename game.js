// VARIABILI GLOBALI
const SECRET_ANSWERS = ["ONLYFANS", "PASSWORD", "SECURITY", "HACKER", "CYBER"];

// Funzioni di Cifratura
function caesarCipher(text, shift = 3, decrypt = false) {
    if (!text) return '';
    return text.replace(/[a-zA-Z]/g, function(c) {
        const base = c < 'a' ? 65 : 97;
        const offset = decrypt ? (26 - shift) % 26 : shift;
        return String.fromCharCode(((c.charCodeAt(0) - base + offset + 26) % 26) + base);
    });
}

function rot13(text) {
    if (!text) return '';
    return text.replace(/[a-zA-Z]/g, function(c) {
        const base = c < 'a' ? 65 : 97;
        return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
    });
}

function atbashCipher(text) {
    if (!text) return '';
    return text.replace(/[a-zA-Z]/g, c => {
        const code = c.charCodeAt(0);
        const base = code < 91 ? 90 : 122;
        return String.fromCharCode(base - (code - (code < 91 ? 65 : 97)));
    });
}

function railFenceCipher(text, rails = 3, decrypt = false) {
    if (!text || rails < 2) return text;
    
    if (!decrypt) {
        const fence = Array(rails).fill().map(() => []);
        let rail = 0, dir = 1;
        
        for (let i = 0; i < text.length; i++) {
            fence[rail].push(text[i]);
            rail += dir;
            if (rail === rails - 1 || rail === 0) dir = -dir;
        }
        return fence.flat().join('');
    } else {
        const fence = Array(rails).fill().map(() => []);
        const pattern = Array(text.length).fill(0);
        let rail = 0, dir = 1;
        
        for (let i = 0; i < text.length; i++) {
            pattern[i] = rail;
            rail += dir;
            if (rail === rails - 1 || rail === 0) dir = -dir;
        }
        
        const chars = [...text];
        for (let r = 0; r < rails; r++) {
            for (let i = 0; i < text.length; i++) {
                if (pattern[i] === r) {
                    fence[r].push(chars.shift());
                }
            }
        }
        
        rail = 0, dir = 1;
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += fence[rail].shift();
            rail += dir;
            if (rail === rails - 1 || rail === 0) dir = -dir;
        }
        return result;
    }
}

function vigenere(text, key, decrypt = false) {
    if (!text || !key) return text;
    
    let result = '';
    const aCode = 'A'.charCodeAt(0);
    const normalizedKey = key.toUpperCase().replace(/[^A-Z]/g, '');
    
    if (!normalizedKey) return text;
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i].toUpperCase();
        if (char < 'A' || char > 'Z') {
            result += text[i];
            continue;
        }
        const keyChar = normalizedKey[i % normalizedKey.length];
        const charCode = char.charCodeAt(0) - aCode;
        const keyCode = keyChar.charCodeAt(0) - aCode;
        let newCode;
        
        if (decrypt) {
            newCode = (charCode - keyCode + 26) % 26;
        } else {
            newCode = (charCode + keyCode) % 26;
        }
        result += String.fromCharCode(newCode + aCode);
    }
    return result;
}

function multiLevelEncodeV2(text, depth = 3) {
    const encodings = [
        { 
            name: 'base64', 
            fn: t => btoa(unescape(encodeURIComponent(t))),
            desc: 'Base64'
        },
        { 
            name: 'hex', 
            fn: t => t.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' '),
            desc: 'Hex'
        },
        { 
            name: 'vigenere', 
            fn: t => {
                const key = 'CYBER';
                return { result: vigenere(t, key), key };
            },
            desc: t => `Vigenere (key: ${t.key})`
        },
        { 
            name: 'reverse', 
            fn: t => t.split('').reverse().join(''),
            desc: 'Reverse'
        },
        { 
            name: 'rot13', 
            fn: rot13,
            desc: 'ROT13'
        },
        {
            name: 'caesar',
            fn: t => {
                const shift = 3;
                return { result: caesarCipher(t, shift), shift };
            },
            desc: t => `Caesar (shift: ${t.shift})`
        },
        {
            name: 'atbash',
            fn: atbashCipher,
            desc: 'Atbash'
        },
        {
            name: 'railfence',
            fn: t => {
                const rails = 3;
                return { result: railFenceCipher(t, rails), rails };
            },
            desc: t => `Rail Fence (${t.rails} rails)`
        }
    ];

    let encodedText = text;
    let appliedEncodings = [];
    const numEncodings = Math.min(depth, 4);

    const safeOrder = encodings.filter(e => ['base64', 'hex', 'vigenere', 'caesar'].includes(e.name));
    const selectedEncodings = [];
    
    for (let i = 0; i < numEncodings && i < safeOrder.length; i++) {
        selectedEncodings.push(safeOrder[i]);
    }

    for (const encoding of selectedEncodings) {
        const result = encoding.fn(encodedText);
        
        if (typeof result === 'object' && result !== null) {
            encodedText = result.result;
            appliedEncodings.push(encoding.desc(result));
        } else {
            encodedText = result;
            appliedEncodings.push(encoding.desc);
        }
    }

    return {
        cipher: encodedText,
        type: `Multi-livello (${appliedEncodings.join(' → ')})`
    };
}

// Precomputa le cifrature del boss
const BOSS_CIPHERS_META = SECRET_ANSWERS.map(word => ({
    answer: word,
    ...multiLevelEncodeV2(word, 3)
}));

// Variabili di gioco
let guessedWords = [];
let currentBossWordIndex = 0;
let currentLevel = 0;
let failedAttempts = 0;
let totalSolved = 0;
let solvedOptions = {};
let selectedOptionIndex = null;
let bossTimer = 180;
let bossTimerInterval = null;
let bossHealth = 100;
let bossPhase = 1;
let matrixColor = '#0F0';

// Livelli
const levels = [
    {
        title: "LIVELLO 0 - INIZIAZIONE",
        description: "Decodifica la chiave di accesso al sistema. Usa Vigenere con chiave 'HACK'.",
        cipher: vigenere("SYSTEM", "HACK"),
        answer: "SYSTEM",
        type: "input",
        difficulty: 1
    },
    {
        title: "LIVELLO 1 - CIFRATURE BASE",
        description: "Decodifica TUTTE le stringhe utilizzando le tecniche di base.",
        maxOptions: 8,
        options: [
            { cipher: btoa("ADMIN"), answer: "ADMIN", type: "Base64", meme: "Base64? Più come Base-facile! 😎" },
            { cipher: "41 44 4D 49 4E", answer: "ADMIN", type: "Hex", meme: "Hex? Più come ex-facile! 😜" },
            { cipher: vigenere("ROOT", "PASS"), answer: "ROOT", type: "Vigenere (key: PASS)", meme: "La chiave è PASS! 🚫" },
            { cipher: "TOOR", answer: "ROOT", type: "Reverse", meme: "Al contrario è sempre root! 🔄" },
            { cipher: caesarCipher("USER", 3), answer: "USER", type: "Caesar (shift: 3)", meme: "Shifta la tua mente! 🧠" },
            { cipher: atbashCipher("ADMIN"), answer: "ADMIN", type: "Atbash", meme: "Atbash è speculare! 🪞" },
            { cipher: railFenceCipher("ACCESS", 3), answer: "ACCESS", type: "Rail Fence (3 rails)", meme: "Salta come una rana! 🐸" },
            { cipher: rot13("GUEST"), answer: "GUEST", type: "ROT13", meme: "ROT13? Facilissimo! 😅" }
        ],
        type: "options",
        difficulty: 1
    },
    {
        title: "LIVELLO 2 - SCANSIONE PROFONDA",
        description: "Decodifica TUTTE le 10 stringhe! Clicca su una stringa e inserisci la decodifica.",
        maxOptions: 10,
        options: [
            { cipher: btoa("ROOT"), answer: "ROOT", type: "Base64", meme: "Root access! 😜" },
            { cipher: vigenere("FIREWALL", "CYBER"), answer: "FIREWALL", type: "Vigenere (key: CYBER)", meme: "Firewall superato! 👋" },
            { cipher: "444e53", answer: "DNS", type: "Hex", meme: "DNS risolto! 🌌" },
            { cipher: btoa("SSH"), answer: "SSH", type: "Base64", meme: "SSH connesso! 😂" },
            { cipher: "ESREVER", answer: "REVERSE", type: "Reverse", meme: "Invertito! 🗺️" },
            { cipher: btoa("SUBNET"), answer: "SUBNET", type: "Base64", meme: "Subnet trovata! 🤡" },
            { cipher: "485454 5053", answer: "HTTPS", type: "Hex", meme: "HTTPS sicuro! 🤪" },
            { cipher: caesarCipher("ADMIN", 5), answer: "ADMIN", type: "Caesar (shift: 5)", meme: "Admin! 🤔" },
            { cipher: rot13("PROXY"), answer: "PROXY", type: "ROT13", meme: "Proxy attivo! ⏳" },
            { ...multiLevelEncodeV2("SECRET", 2), answer: "SECRET", meme: "Segreto svelato! 🔐" }
        ],
        type: "options",
        difficulty: 2
    },
    {
        title: "LIVELLO 3 - ANALISI FORENSE",
        description: "⚠️ DIFFICOLTÀ AUMENTATA! Decodifica TUTTE le 12 stringhe!",
        maxOptions: 12,
        options: [
            { cipher: btoa("EVIDENCE"), answer: "EVIDENCE", type: "Base64", meme: "Prova trovata! 🕵️" },
            { cipher: vigenere("MALWARE", "VIRUS"), answer: "MALWARE", type: "Vigenere (key: VIRUS)", meme: "Malware rilevato! 🖥️" },
            { cipher: "48415348", answer: "HASH", type: "Hex", meme: "Hash trovato! 🤣" },
            { cipher: btoa("LOGFILE"), answer: "LOGFILE", type: "Base64", meme: "Logfile analizzato! 😂" },
            { cipher: "ERAWOMSNAR", answer: "RANSOMWARE", type: "Reverse", meme: "Ransomware fermato! 📜" },
            { cipher: "50 48 49 53 48 49 4e 47", answer: "PHISHING", type: "Hex", meme: "Phishing rilevato! 🎣" },
            { cipher: btoa(vigenere("EXPLOIT", "HACK")), answer: "EXPLOIT", type: "Base64+Vigenere (key: HACK)", meme: "Exploit trovato! 😆" },
            { ...multiLevelEncodeV2("ENCRYPTION", 2), answer: "ENCRYPTION", meme: "Crittografia! 🔐" },
            { cipher: caesarCipher("TROJAN", 7), answer: "TROJAN", type: "Caesar (shift: 7)", meme: "Trojan! 🐴" },
            { cipher: "42 49 4f 4d 45 54 52 49 43", answer: "BIOMETRIC", type: "Hex", meme: "Biometrico! 😱" },
            { ...multiLevelEncodeV2("FORENSICS", 2), answer: "FORENSICS", meme: "Forense! 🔬" },
            { cipher: vigenere("INTRUSION", "DETECT"), answer: "INTRUSION", type: "Vigenere (key: DETECT)", meme: "Intruso! 👻" }
        ],
        type: "options",
        difficulty: 3
    },
    {
        title: "LIVELLO 4 - CRITTOGRAFIA QUANTISTICA",
        description: "🔴 PERICOLO! Decodifica i frammenti quantistici! 14 stringhe!",
        maxOptions: 14,
        options: [
            { cipher: "51 55 41 4e 54 55 4d", answer: "QUANTUM", type: "Hex", meme: "Quantum! 😉" },
            { ...multiLevelEncodeV2("SUPERPOSITION", 2), answer: "SUPERPOSITION", meme: "Superposizione! ✨" },
            { cipher: "ENTANGLEMENT", answer: "ENTANGLEMENT", type: "Plain", meme: "Entanglement! ✨" },
            { cipher: btoa("DECRYPTION"), answer: "DECRYPTION", type: "Base64", meme: "Decriptato! 🥛" },
            { cipher: "MHTIROGLA", answer: "ALGORITHM", type: "Reverse", meme: "Algoritmo! 🙃" },
            { cipher: "5155 4249 54", answer: "QUBIT", type: "Hex", meme: "Qubit! 🌀" },
            { cipher: rot13("HEISENBERG"), answer: "HEISENBERG", type: "ROT13", meme: "Heisenberg! ⚛️" },
            { ...multiLevelEncodeV2("SCHRODINGER", 2), answer: "SCHRODINGER", meme: "Schrodinger! 🐱" },
            { cipher: "43 4f 4d 50 49 4c 45 52", answer: "COMPILER", type: "Hex", meme: "Compiler! 🧠" },
            { cipher: "KERNEL", answer: "KERNEL", type: "Plain", meme: "Kernel! 💥" },
            { cipher: caesarCipher("CIPHER", 8), answer: "CIPHER", type: "Caesar (shift: 8)", meme: "Cipher! 📜" },
            { cipher: vigenere("KEYSTREAM", "RANDOM"), answer: "KEYSTREAM", type: "Vigenere (key: RANDOM)", meme: "Keystream! 🎲" },
            { cipher: btoa("PARADOX"), answer: "PARADOX", type: "Base64", meme: "Paradosso! 🕰️" },
            { cipher: "4e 45 55 52 4f 4d 41 4e 43 45", answer: "NEUROMANCE", type: "Hex", meme: "Neuromancer! 🤖" }
        ],
        type: "options",
        difficulty: 4
    },
    {
        title: "🔴 LIVELLO FINALE - BOSS EPICO 🔴",
        description: "🔥🔥🔥 SFIDA FINALE! Decodifica TUTTE le 5 parole segrete! 💥",
        options: BOSS_CIPHERS_META.map((meta, i) => ({
            cipher: meta.cipher,
            type: meta.type,
            answer: meta.answer,
            meme: ["Prima parola! 😈", "Due su cinque! 😎", "Metà strada! 🎯", "Quasi! 💪", "Ultima parola! 🔥"][i]
        })),
        maxOptions: 5,
        type: "boss-input",
        difficulty: 5
    }
];

const BOSS_LEVEL_INDEX = levels.length - 1;
const STORAGE_KEY = 'cyberChallengeProgressV1';

// Storage functions
function saveGameState() {
    try {
        const state = { currentLevel, failedAttempts, totalSolved, solvedOptions };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error('Errore salvataggio:', e);
    }
}

function loadGameState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        
        const state = JSON.parse(raw);
        if (state.currentLevel >= 0 && state.currentLevel < levels.length) {
            currentLevel = state.currentLevel;
            failedAttempts = state.failedAttempts || 0;
            totalSolved = state.totalSolved || 0;
            solvedOptions = state.solvedOptions || {};
        }
    } catch (e) {
        console.error('Errore caricamento:', e);
    }
}

function clearGameState() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
        console.error('Errore pulizia:', e);
    }
}

function resetGameState() {
    currentLevel = 0;
    failedAttempts = 0;
    totalSolved = 0;
    solvedOptions = {};
    selectedOptionIndex = null;
    bossTimer = 180;
    bossHealth = 100;
    bossPhase = 1;
}

// DOM Elements
const matrixCanvas = document.getElementById('matrix');
const ctx = matrixCanvas.getContext('2d');
const gameContent = document.getElementById('gameContent');
const levelDisplay = document.getElementById('levelDisplay');
const failedAttemptsDisplay = document.getElementById('failedAttempts');
const totalSolvedDisplay = document.getElementById('totalSolved');
const gameContainer = document.getElementById('gameContainer');
const mainTitle = document.getElementById('mainTitle');
const body = document.body;
const startScreen = document.getElementById('startScreen');
const startGameBtn = document.getElementById('startGameBtn');
const continueGameBtn = document.getElementById('continueGameBtn');
const statsPanel = document.getElementById('statsPanel');
const guideFab = document.getElementById('guideFab');

// Guide Modal
function createGuideModal() {
    const existing = document.getElementById('guideModal');
    if (existing) return;

    const overlay = document.createElement('div');
    overlay.id = 'guideModal';
    overlay.innerHTML = `
        <div class="guide-box">
            <h2 class="guide-title">Guida alle Cifrature</h2>
            <ul class="guide-list">
                <li><strong class="guide-term">Base64:</strong> Codifica testuale (es. "ROOT" → "Um9vdA==")</li>
                <li><strong class="guide-term">Hex:</strong> Rappresentazione esadecimale (es. 41 44 = AD)</li>
                <li><strong class="guide-term">ROT13/Caesar:</strong> Shift alfabetico (es. ROT13: A→N)</li>
                <li><strong class="guide-term">Vigenere:</strong> Cifratura con chiave (richiede la chiave)</li>
                <li><strong class="guide-term">Reverse:</strong> Stringa al contrario</li>
                <li><strong class="guide-term">Atbash:</strong> A↔Z, B↔Y, etc.</li>
                <li><strong class="guide-term">Rail Fence:</strong> Scrittura a zig-zag</li>
                <li><strong class="guide-term">Multi-livello:</strong> Combinazione di più metodi</li>
            </ul>
            <div class="guide-controls">
                <div class="guide-note">Nota: questa guida spiega le cifrature, non mostra le soluzioni.</div>
                <button class="guide-close" onclick="document.getElementById('guideModal').remove()">Chiudi</button>
            </div>
        </div>
    `;
    overlay.addEventListener('click', (e) => { 
        if (e.target === overlay) overlay.remove(); 
    });
    document.body.appendChild(overlay);
}

if (guideFab) {
    guideFab.addEventListener('click', (e) => {
        e.preventDefault();
        createGuideModal();
    });
}

// Event Listeners
if (startGameBtn) {
    startGameBtn.addEventListener('click', () => {
        resetGameState();
        clearGameState();
        saveGameState();
        if (startScreen) startScreen.classList.add('hidden');
        if (statsPanel) statsPanel.classList.remove('hidden');
        renderLevel(currentLevel);
    });
}

if (continueGameBtn) {
    continueGameBtn.addEventListener('click', () => {
        if (startScreen) startScreen.classList.add('hidden');
        if (statsPanel) statsPanel.classList.remove('hidden');
        renderLevel(currentLevel);
    });
}

// Update UI
function updateStats() {
    levelDisplay.textContent = currentLevel + 1;
    failedAttemptsDisplay.textContent = failedAttempts;
    totalSolvedDisplay.textContent = totalSolved;

    const difficulty = levels[currentLevel].difficulty;

    // Reset classes
    body.className = '';
    gameContainer.className = 'container';
    mainTitle.className = '';

    if (currentLevel === BOSS_LEVEL_INDEX) {
        body.classList.add('boss-mode');
        gameContainer.classList.add('boss-mode');
        mainTitle.classList.add('boss-mode');
        matrixColor = '#F00';
    } else if (difficulty >= 3) {
        body.classList.add(`level-${currentLevel}`);
        gameContainer.classList.add(`level-${currentLevel}`);
        mainTitle.classList.add(`level-${currentLevel}`);
        matrixColor = '#F80';
    } else {
        body.classList.add(`level-${currentLevel}`);
        gameContainer.classList.add(`level-${currentLevel}`);
        mainTitle.classList.add(`level-${currentLevel}`);
        matrixColor = ['#0F0', '#7FFF00', '#FFB300'][currentLevel] || '#0F0';
    }
}

function displayFeedback(message, isSuccess) {
    let feedback = document.querySelector('.feedback');
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.classList.add('feedback');
        gameContent.appendChild(feedback);
    }
    feedback.textContent = message;
    feedback.className = 'feedback ' + (isSuccess ? 'success' : 'error');
    
    setTimeout(() => feedback.remove(), 3000);
}

// Matrix Background
matrixCanvas.width = window.innerWidth;
matrixCanvas.height = window.innerHeight;

const matrix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%";
const matrixArray = matrix.split("");
const fontSize = 10;
const columns = matrixCanvas.width / fontSize;
const drops = [];

for(let x = 0; x < columns; x++) {
    drops[x] = 1;
}

function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    ctx.fillStyle = matrixColor;
    ctx.font = fontSize + 'px monospace';

    for(let i = 0; i < drops.length; i++) {
        const text = matrixArray[Math.floor(Math.random() * matrixArray.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if(drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

setInterval(drawMatrix, 35);

window.onresize = () => {
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
};

// Game Logic
function checkInput(inputAnswer, expectedAnswer) {
    if (inputAnswer.toUpperCase() === expectedAnswer.toUpperCase()) {
        window.playCorrectSound();
        displayFeedback("✅ Accesso Autorizzato. Livello Completato!", true);
        totalSolved++;
        nextLevel();
    } else {
        window.playIncorrectSound();
        failedAttempts++;
        updateStats();
        displayFeedback("❌ Accesso Negato. Riprova.", false);
    }
}

function selectOption(levelIndex, optionIndex) {
    if (solvedOptions[levelIndex] && solvedOptions[levelIndex][optionIndex]) {
        displayFeedback("Questa cifratura è già stata risolta.", true);
        return;
    }

    if (selectedOptionIndex !== null) {
        const prevCard = document.getElementById(`option-${selectedOptionIndex}`);
        if(prevCard) prevCard.classList.remove('selected');
    }

    selectedOptionIndex = optionIndex;
    const card = document.getElementById(`option-${optionIndex}`);
    if (card) card.classList.add('selected');
    
    const verifyBtn = document.getElementById('verifyOptionBtn');
    if (verifyBtn) verifyBtn.disabled = false;

    const level = levels[levelIndex];
    const opt = level.options[optionIndex];
    displayFeedback(`Selezionato: ${opt.type}. Inserisci la decodifica.`, true);
    
    const input = document.getElementById('optionInput');
    if (input) input.focus();
}

function checkOptionInput() {
    if (selectedOptionIndex === null) {
        displayFeedback("❌ Seleziona una cifratura prima.", false);
        return;
    }
    
    const inputElement = document.getElementById('optionInput');
    const input = inputElement ? inputElement.value.toUpperCase().trim() : '';
    const levelData = levels[currentLevel];
    const optionData = levelData.options[selectedOptionIndex];
    
    if (input === optionData.answer.toUpperCase()) {
        window.playCorrectSound();
        
        if (!solvedOptions[currentLevel]) {
            solvedOptions[currentLevel] = {};
        }
        
        solvedOptions[currentLevel][selectedOptionIndex] = true;
        totalSolved++;
        updateStats();
        saveGameState();
        
        const card = document.getElementById(`option-${selectedOptionIndex}`);
        if(card) {
            card.classList.remove('selected');
            card.classList.add('solved');
        }
        
        displayFeedback(`✅ Corretto! ${optionData.meme}`, true);
        
        if (inputElement) inputElement.value = '';
        selectedOptionIndex = null;
        
        const verifyBtn = document.getElementById('verifyOptionBtn');
        if (verifyBtn) verifyBtn.disabled = true;
        
        const solvedCount = Object.keys(solvedOptions[currentLevel]).length;
        updateProgressBar(currentLevel);
        
        if (solvedCount === levelData.maxOptions) {
            window.playLevelUpSound();
            setTimeout(() => {
                displayFeedback(`🎉 Livello completato!`, true);
                setTimeout(nextLevel, 1000);
            }, 500);
        }
    } else {
        window.playIncorrectSound();
        failedAttempts++;
        updateStats();
        displayFeedback("❌ Decodifica errata. Riprova.", false);
    }
}

function nextLevel() {
    if (currentLevel === BOSS_LEVEL_INDEX) {
        clearInterval(bossTimerInterval);
    }

    currentLevel++;
    if (currentLevel < levels.length) {
        selectedOptionIndex = null;
        if (!solvedOptions[currentLevel]) {
            solvedOptions[currentLevel] = {};
        }

        renderLevel(currentLevel);
        saveGameState();
    }
}

function updateProgressBar(levelIndex) {
    const levelData = levels[levelIndex];
    const solvedCount = Object.keys(solvedOptions[levelIndex] || {}).length;
    const percentage = (solvedCount / levelData.maxOptions) * 100;

    const progressFillInner = document.getElementById('progressFillInner');
    const solvedCountDisplay = document.getElementById('solvedCountDisplay');

    if (progressFillInner) progressFillInner.style.width = `${percentage}%`;
    if (solvedCountDisplay) solvedCountDisplay.textContent = `${solvedCount} / ${levelData.maxOptions} Decodificazioni`;
}

// Boss Fight
function startBossTimer() {
    bossTimer = 180;
    const timerDisplay = document.getElementById('bossTimerDisplay');
    
    if (bossTimerInterval) {
        clearInterval(bossTimerInterval);
    }

    bossTimerInterval = setInterval(() => {
        bossTimer--;
        const minutes = Math.floor(bossTimer / 60).toString().padStart(2, '0');
        const seconds = (bossTimer % 60).toString().padStart(2, '0');
        
        if (timerDisplay) {
            timerDisplay.textContent = `Tempo Rimanente: ${minutes}:${seconds}`;
        }

        if (bossTimer <= 0) {
            clearInterval(bossTimerInterval);
            bossTimerInterval = null;
            handleBossDefeat();
        }
    }, 1000);
}

function updateBossUI() {
    const healthFill = document.getElementById('bossHealthFill');
    const phaseDisplay = document.getElementById('bossPhaseDisplay');
    const wordsProgressFill = document.getElementById('bossWordsProgressFill');
    const wordsProgressText = document.getElementById('bossWordsProgressText');

    const health = Math.max(0, Math.min(100, bossHealth));
    if (healthFill) {
        healthFill.style.width = `${health}%`;
        healthFill.textContent = `${Math.round(health)}%`;
    }

    let phase = 1;
    if (health <= 66 && health > 33) phase = 2;
    else if (health <= 33) phase = 3;
    bossPhase = phase;

    if (phaseDisplay) {
        phaseDisplay.textContent = `Fase Boss: ${phase}`;
    }

    const solved = currentBossWordIndex;
    const total = SECRET_ANSWERS.length;
    const wordsPercent = (solved / total) * 100;

    if (wordsProgressFill) {
        wordsProgressFill.style.width = `${wordsPercent}%`;
    }
    if (wordsProgressText) {
        wordsProgressText.textContent = `Parole decodificate: ${solved} / ${total}`;
    }
}

function damageBoss() {
    const damagePerWord = 100 / SECRET_ANSWERS.length;
    bossHealth = Math.max(0, bossHealth - damagePerWord);
    updateBossUI();

    if (bossHealth <= 0) {
        handleBossVictory();
    }
}

function handleBossDefeat() {
    displayFeedback("⏱️ Il tempo è scaduto! Il Boss ti ha sconfitto.", false);
    failedAttempts++;
    updateStats();
    clearGameState();
    setTimeout(() => {
        resetGameState();
        if (statsPanel) statsPanel.classList.add('hidden');
        if (startScreen) startScreen.classList.remove('hidden');
        gameContent.innerHTML = '';
    }, 2000);
}

function handleBossVictory() {
    if (bossTimerInterval) {
        clearInterval(bossTimerInterval);
        bossTimerInterval = null;
    }
    totalSolved += SECRET_ANSWERS.length - currentBossWordIndex;
    updateStats();
    clearGameState();

    gameContent.innerHTML = `
        <div class="victory">
            <h2>🏆 BOSS SCONFITTO! 🏆</h2>
            <p class="meme">Hai decodificato tutte le parole segrete!</p>
            <p>Parole: ${SECRET_ANSWERS.join(', ')}</p>
            <button id="restartGameBtn">Ricomincia la Sfida</button>
        </div>
    `;

    const restartBtn = document.getElementById('restartGameBtn');
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            resetGameState();
            clearGameState();
            saveGameState();
            if (startScreen) startScreen.classList.add('hidden');
            if (statsPanel) statsPanel.classList.remove('hidden');
            renderLevel(currentLevel);
        });
    }
}

function renderLevel(levelIndex) {
    const level = levels[levelIndex];
    if (!level) return;

    gameContent.innerHTML = '';
    updateStats();

    if (level.type === 'input') {
        renderInputLevel(level);
    } else if (level.type === 'options') {
        renderOptionsLevel(levelIndex, level);
    } else if (level.type === 'boss-input') {
        renderBossLevel(level);
    }
}

function renderInputLevel(level) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
        <div class="level-info">
            <h2>${level.title}</h2>
            <p>${level.description}</p>
        </div>
        <div class="cipher-text">${level.cipher}</div>
        <div class="input-group">
            <input type="text" id="singleInput" placeholder="Inserisci la decodifica qui">
        </div>
        <button id="verifySingleInputBtn">Verifica</button>
    `;
    gameContent.appendChild(wrapper);

    const input = document.getElementById('singleInput');
    const btn = document.getElementById('verifySingleInputBtn');

    if (btn && input) {
        const handler = () => {
            checkInput(input.value.trim(), level.answer);
        };
        btn.addEventListener('click', handler);
        input.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                handler();
            }
        });
        input.focus();
    }
}

function renderOptionsLevel(levelIndex, level) {
    const wrapper = document.createElement('div');
    const optionsHtml = level.options.map((opt, i) => {
        const solved = solvedOptions[levelIndex] && solvedOptions[levelIndex][i];
        const solvedClass = solved ? 'solved' : '';
        return `
            <div class="option-card ${solvedClass}" id="option-${i}">
                <h3>${opt.type}</h3>
                <p>${opt.cipher}</p>
            </div>
        `;
    }).join('');

    wrapper.innerHTML = `
        <div class="level-info">
            <h2>${level.title}</h2>
            <p>${level.description}</p>
        </div>
        <div class="options-grid">
            ${optionsHtml}
        </div>
        <div class="progress-bar">
            <div class="progress-text" id="solvedCountDisplay"></div>
            <div class="progress-fill">
                <div class="progress-fill-inner" id="progressFillInner"></div>
            </div>
        </div>
        <div class="options-input-area">
            <input type="text" id="optionInput" placeholder="Inserisci la decodifica per la cifratura selezionata">
        </div>
        <button id="verifyOptionBtn" disabled>Verifica decodifica</button>
    `;
    gameContent.appendChild(wrapper);

    level.options.forEach((_, i) => {
        const card = document.getElementById(`option-${i}`);
        if (card) {
            card.addEventListener('click', () => selectOption(levelIndex, i));
        }
    });

    const verifyBtn = document.getElementById('verifyOptionBtn');
    if (verifyBtn) {
        verifyBtn.addEventListener('click', () => checkOptionInput());
    }

    const input = document.getElementById('optionInput');
    if (input) {
        input.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                checkOptionInput();
            }
        });
    }

    updateProgressBar(levelIndex);
}

function renderBossLevel(level) {
    currentBossWordIndex = 0;
    guessedWords = [];
    bossHealth = 100;
    bossPhase = 1;

    const options = level.options;
    gameContent.innerHTML = `
        <div class="boss-timer" id="bossTimerDisplay">Tempo Rimanente: 03:00</div>
        <div class="boss-phase" id="bossPhaseDisplay">Fase Boss: 1</div>
        <div class="boss-health">
            <div class="health-bar">
                <div class="health-bar-fill" id="bossHealthFill">100%</div>
            </div>
        </div>
        <div class="boss-progress">
            <div class="progress-text" id="bossWordsProgressText"></div>
            <div class="progress-bar">
                <div class="progress-fill" id="bossWordsProgressFill"></div>
            </div>
        </div>
        <div class="level-info">
            <h2>${level.title}</h2>
            <p>${level.description}</p>
        </div>
        <div class="cipher-text boss-cipher" id="bossCipherText"></div>
        <div class="cipher-meta-info" id="bossCipherMeta"></div>
        <div class="boss-input-container">
            <input type="text" id="bossInput" placeholder="Decodifica la parola segreta">
            <button id="bossVerifyBtn">Attacca il Boss</button>
        </div>
    `;

    function renderCurrentBossCipher() {
        const option = options[currentBossWordIndex];
        const cipherText = document.getElementById('bossCipherText');
        const cipherMeta = document.getElementById('bossCipherMeta');

        if (cipherText) cipherText.textContent = option.cipher;
        if (cipherMeta) cipherMeta.textContent = option.type;
    }

    const verifyBtn = document.getElementById('bossVerifyBtn');
    const input = document.getElementById('bossInput');

    if (verifyBtn && input) {
        verifyBtn.addEventListener('click', () => {
            const value = input.value.trim().toUpperCase();
            const expected = options[currentBossWordIndex].answer.toUpperCase();

            if (value === expected) {
                window.playCorrectSound();
                guessedWords.push(value);
                currentBossWordIndex++;
                damageBoss();
                input.value = '';

                if (currentBossWordIndex >= options.length) {
                    handleBossVictory();
                } else {
                    const lastOption = options[currentBossWordIndex - 1];
                    renderCurrentBossCipher();
                    displayFeedback(lastOption.meme || "Corretto!", true);
                }
            } else {
                window.playIncorrectSound();
                failedAttempts++;
                updateStats();
                displayFeedback("❌ Parola errata! Il Boss ride di te...", false);
            }
        });

        input.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                verifyBtn.click();
            }
        });

        input.focus();
    }

    renderCurrentBossCipher();
    updateBossUI();
    startBossTimer();
}

loadGameState();

const hasSavedGame = (() => {
    try {
        return !!localStorage.getItem(STORAGE_KEY);
    } catch (e) {
        return false;
    }
})();

if (hasSavedGame && continueGameBtn) {
    continueGameBtn.classList.remove('hidden');
}

if (!hasSavedGame && startScreen) {
    startScreen.classList.remove('hidden');
}