// VARIABILI GLOBALI E DATI DEL GIOCO NASCOSTI
const SECRET_ANSWERS = [
    "ONLYFANS",
    "PASSWORD",
    "SECURITY",
    "HACKER", 
    "CYBER"
]; // Le parole finali per sconfiggere il boss

// Funzioni di Cifratura Avanzate
function caesarCipher(text, shift, decrypt = false) {
    return text.replace(/[a-zA-Z]/g, function(c) {
        const base = c < 'a' ? 65 : 97;
        const offset = decrypt ? (26 - shift) % 26 : shift;
        return String.fromCharCode(((c.charCodeAt(0) - base + offset + 26) % 26) + base);
    });
}

// Funzione per decodificare ROT13 (caso speciale di Caesar con shift 13)
function rot13(text) {
    return text.replace(/[a-zA-Z]/g, function(c) {
        const base = c < 'a' ? 65 : 97;
        return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
    });
}

function atbashCipher(text) {
    return text.replace(/[a-zA-Z]/g, c => {
        const code = c.charCodeAt(0);
        const base = code < 91 ? 90 : 122;
        return String.fromCharCode(base - (code - (code < 91 ? 65 : 97)));
    });
}

function railFenceCipher(text, rails = 3, decrypt = false) {
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
    let result = '';
    const aCode = 'A'.charCodeAt(0);
    for (let i = 0; i < text.length; i++) {
        const char = text[i].toUpperCase();
        if (char < 'A' || char > 'Z') {
            result += text[i];
            continue;
        }
        const keyChar = key[i % key.length].toUpperCase();
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
            decode: t => decodeURIComponent(escape(atob(t))),
            desc: 'Base64'
        },
        { 
            name: 'hex', 
            fn: t => t.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' '),
            decode: t => t.split(' ').map(h => String.fromCharCode(parseInt(h, 16))).join(''),
            desc: 'Hex'
        },
        { 
            name: 'vigenere', 
            fn: t => {
                const key = 'CYBER';
                return { result: vigenere(t, key), key };
            },
            decode: (t, key) => vigenere(t, key, true),
            desc: t => `Vigenère (key: ${t.key})`
        },
        { 
            name: 'reverse', 
            fn: t => t.split('').reverse().join(''),
            decode: t => t.split('').reverse().join(''),
            desc: 'Reverse'
        },
        { 
            name: 'rot13', 
            fn: rot13,
            decode: rot13,
            desc: 'ROT13'
        },
        {
            name: 'caesar',
            fn: t => {
                const shift = 3; // Shift fisso per maggiore affidabilità
                return { result: caesarCipher(t, shift), shift };
            },
            decode: (t, shift) => caesarCipher(t, shift, true),
            desc: t => `Caesar (shift: ${t.shift})`
        },
        {
            name: 'atbash',
            fn: atbashCipher,
            decode: atbashCipher, // Atbash è auto-reversibile
            desc: 'Atbash'
        },
        {
            name: 'railfence',
            fn: t => {
                const rails = 3; // Numero fisso di rails per maggiore affidabilità
                return { result: railFenceCipher(t, rails), rails };
            },
            decode: (t, rails) => railFenceCipher(t, rails, true),
            desc: t => `Rail Fence (${t.rails} rails)`
        }
    ];

    let encodedText = text;
    let appliedEncodings = [];
    const usedEncodings = [];
    const numEncodings = Math.min(depth, 4); // Massimo 4 cifrature per stabilità

    // Assicurati che le cifrature siano applicate in un ordine decodificabile
    const safeOrder = [
        encodings.find(e => e.name === 'base64'),
        encodings.find(e => e.name === 'hex'),
        encodings.find(e => e.name === 'vigenere'),
        encodings.find(e => e.name === 'caesar'),
        encodings.find(e => e.name === 'atbash'),
        encodings.find(e => e.name === 'railfence'),
        encodings.find(e => e.name === 'reverse'),
        encodings.find(e => e.name === 'rot13')
    ].filter(Boolean);

    // Prendi un sottoinsieme casuale mantenendo l'ordine sicuro
    const selectedEncodings = [];
    for (let i = 0; i < numEncodings; i++) {
        const available = safeOrder.filter(e => !selectedEncodings.includes(e));
        if (available.length === 0) break;
        const encoding = available[Math.floor(Math.random() * available.length)];
        selectedEncodings.push(encoding);
    }

    // Applica le cifrature in ordine
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

function matrixEncode(text) {
    const matrixChars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789';
    let encoded = '';
    for(let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        encoded += matrixChars[charCode % matrixChars.length];
    }
    return encoded;
}


// Precomputa le cifrature multi-livello del boss
const BOSS_CIPHERS_META = SECRET_ANSWERS.map(word => ({
    answer: word,
    ...multiLevelEncodeV2(word)
}));

// Variabili per tenere traccia delle parole indovinate
let guessedWords = [];
let currentBossWordIndex = 0;

const levels = [
    {
        title: "LIVELLO 0 - INIZIAZIONE",
        description: "Decodifica la chiave di accesso al sistema. Sembra un Vigenère con chiave 'HACK'.",
        cipher: vigenere("SYSTEM", "HACK"),
        answer: "SYSTEM",
        type: "input",
        cipherMeta: "Vigenère (key: HACK)",
        difficulty: 1
    },
    {
        title: "LIVELLO 1 - CIFRATURE BASE",
        description: "Decodifica TUTTE le stringhe utilizzando le tecniche di base.",
        maxOptions: 8,
        options: [
            { 
                cipher: btoa(unescape(encodeURIComponent("ADMIN"))), 
                answer: "ADMIN", 
                type: "Base64", 
                meme: "Base64? Più come Base-facile! 😎" 
            },
            { 
                cipher: "41 44 4D 49 4E", 
                answer: "ADMIN", 
                type: "Hex", 
                meme: "Hex? Più come ex-facile! 😜" 
            },
            { 
                cipher: vigenere("ROOT", "PASS"), 
                answer: "ROOT", 
                type: "Vigenère (key: PASS)", 
                meme: "La chiave è PASS, ma non passare oltre! 🚫" 
            },
            { 
                cipher: "TOOR", 
                answer: "ROOT", 
                type: "Reverse", 
                meme: "Al contrario è sempre root! 🔄" 
            },
            { 
                cipher: caesarCipher("USER", 3), 
                answer: "USER", 
                type: "Caesar (shift: 3)", 
                meme: "Shifta la tua mente! 🧠" 
            },
            { 
                cipher: atbashCipher("ADMIN"), 
                answer: "ADMIN", 
                type: "Atbash", 
                meme: "Atbash è speculare! 🪞" 
            },
            { 
                cipher: railFenceCipher("ACCESS", 3), 
                answer: "ACCESS", 
                type: "Rail Fence (3 rails)", 
                meme: "Salta come una rana! 🐸" 
            },
            { 
                cipher: rot13("GUEST"), 
                answer: "GUEST", 
                type: "ROT13", 
                meme: "ROT13? Più come ROT-13-volte più facile! 😅" 
            }
        ],
        type: "options",
        difficulty: 1
    },
    {
        title: "LIVELLO 1 - SCANSIONE PROFONDA",
        description: "Decodifica TUTTE le 10 stringhe di sicurezza per procedere! Clicca su una stringa, inserisci la decodifica nel campo sottostante e verifica.",
        maxOptions: 10,
        options: [
            { cipher: "Um9vdA==", answer: "ROOT", type: "Base64", meme: "Accesso come root... ma non qui! 😜" },
            { cipher: vigenere("FIREWALL", "CYBER"), answer: "FIREWALL", type: "Vigenère (key: CYBER)", meme: "Il firewall ti saluta! 👋" },
            { cipher: "-.. -. ...", answer: "DNS", type: "Morse", meme: "DNS risolto... in un altro universo! 🌌" },
            { cipher: btoa("SSH"), answer: "SSH", type: "Base64", meme: "SSH? Secure Shell... o forse 'Super Sbagliato Oggi'? 😂" },
            { cipher: "ESREVER", answer: "REVERSE", type: "Reverse", meme: "Hai invertito la rotta, ma sei fuori strada! 🗺️" },
            { cipher: "U1VCTkVU", answer: "SUBNET", type: "Base64", meme: "Questa subnet mask non copre i tuoi errori! 🤡" },
            { cipher: "01001000 01010100 01010100 01010000", answer: "HTTP", type: "Binary", meme: "HTTP... HyperText Transfer... Pasticcio! 🤪" },
            { cipher: "JVVRU", answer: "HTTPS", type: "ROT-2", meme: "ROT-2? Prova con qualcosa di più moderno! ⏳" },
            { cipher: "ADMIN".split('').map(c => c.charCodeAt(0).toString(16)).join(''), answer: "ADMIN", type: "Hex", meme: "Un admin con un hex non standard? Interessante... ma no. 🤔" },
            { ...multiLevelEncodeV2("SECRET"), answer: "SECRET" }
        ],
        type: "options",
        difficulty: 1
    },
    {
        title: "LIVELLO 2 - ANALISI FORENSE",
        description: "⚠️ DIFFICOLTÀ AUMENTATA! Decodifica TUTTE le 14 stringhe di analisi forense! Clicca su una stringa, inserisci la decodifica nel campo sottostante e verifica.",
        maxOptions: 14,
        options: [
            { cipher: "01000101 01010110 01001001 01000100 01000101 01001110 01000011 01000101", answer: "EVIDENCE", type: "Binary", meme: "Prova trovata! Ma non è quella che ti serve. 🕵️" },
            { cipher: vigenere("MALWARE", "VIRUS"), answer: "MALWARE", type: "Vigenère (key: VIRUS)", meme: "Malware rilevato! Il tuo antivirus è in ferie. 🏖️" },
            { cipher: ".... .- ... ....", answer: "HASH", type: "Morse", meme: "Hai trovato un hash! Ma è solo un hashtag. #fail 🤣" },
            { cipher: btoa("LOGFILE"), answer: "LOGFILE", type: "Base64", meme: "Logfile analizzato. Dice solo 'LOL'. 😂" },
            { cipher: "ERAWOMSNAR", answer: "RANSOMWARE", type: "Reverse", meme: "Hai fermato il ransomware! Ma era solo un file .txt. 📜" },
            { cipher: "50 48 49 53 48 49 4e 47", answer: "PHISHING", type: "Hex", meme: "Abcoccato all'amo del phishing! 🎣" },
            { cipher: btoa(vigenere("EXPLOIT", "HACK")), answer: "EXPLOIT", type: "Base64+Vigenère", meme: "Exploit? Fammi ridere! 😆" },
            { ...multiLevelEncodeV2("ENCRYPTION"), answer: "ENCRYPTION" },
            { cipher: matrixEncode("STEGANOGRAPHY"), answer: "STEGANOGRAPHY", type: "Matrix", meme: "Messaggio nascosto trovato! Dice 'Se leggi sei un boomer'. 👴" },
            { cipher: "00110100 00110000 00110100", answer: "404", type: "Binary", meme: "Errore 404: Prova non trovata. 🤷" },
            { cipher: "TROJAN", answer: "TROJAN", type: "Plain", meme: "Cavallo di Troia rilevato! Ma è un pony. 🐴" },
            { cipher: "42 49 4f 4d 45 54 52 49 43", answer: "BIOMETRIC", type: "Hex", meme: "Riconoscimento facciale disattivato! Troppo brutto. 😝" },
            { ...multiLevelEncodeV2("FORENSICS"), answer: "FORENSICS" },
            { cipher: vigenere("INTRUSION", "DETECT"), answer: "INTRUSION", type: "Vigenère (key: DETECT)", meme: "Intruso rilevato! Sei tu! 👻" }
        ],
        type: "options",
        difficulty: 2
    },
    {
        title: "LIVELLO 3 - CRITTOGRAFIA QUANTISTICA",
        description: "🔴 PERICOLO! Decifra i frammenti di dati quantistici! Decodifica TUTTE le 18 stringhe! Il sistema inizia a glitchare...",
        maxOptions: 18,
        options: [
            { cipher: "51 55 41 4e 54 55 4d", answer: "QUANTUM", type: "Hex", meme: "Quantum! Ma solo di 'quanto basta' per sbagliare. 😉" },
            { ...multiLevelEncodeV2("SUPERPOSITION"), answer: "SUPERPOSITION" },
            { cipher: "ENTANGLEMENT", answer: "ENTANGLEMENT", type: "Plain", meme: "Le tue risposte sono entangled con l'errore. ✨" },
            { cipher: btoa("DECRYPTION"), answer: "DECRYPTION", type: "Base64", meme: "Decriptazione riuscita! Il messaggio è 'Compra il latte'. 🥛" },
            { cipher: "MHTIROGLA", answer: "ALGORITHM", type: "Reverse", meme: "L'algoritmo è corretto, ma al contrario! 🙃" },
            { cipher: "01010001 01010101 01000010 01001001 01010100", answer: "QUBIT", type: "Binary", meme: "Un qubit può essere 0, 1 o entrambi. La tua risposta è solo 0. 🍌" },
            { cipher: ".... . .. ... . -. -... . .-. --.", answer: "HEISENBERG", type: "Morse", meme: "Conosci la sua posizione o la sua velocità, non entrambe. Tu nessuna. ⚛️" },
            { ...multiLevelEncodeV2("SCHRODINGER"), answer: "SCHRODINGER" },
            { cipher: "43 4f 4d 50 49 4c 45 52", answer: "COMPILER", type: "Hex", meme: "Errore di compilazione: intelligenza non definita. 🧠" },
            { cipher: "KERNEL", answer: "KERNEL", type: "Plain", meme: "Kernel panic! Il sistema è crollato per la tua risposta. 💥" },
            { cipher: matrixEncode("ASCIITABLE"), answer: "ASCIITABLE", type: "Matrix", meme: "Hai consultato la tabella ASCII? Forse dovevi. 📜" },
            { cipher: "UTF8", answer: "UTF8", type: "Plain", meme: "UTF-8? More like WTF-8. 🤯" },
            { ...multiLevelEncodeV2("CIPHER"), answer: "CIPHER" },
            { cipher: vigenere("KEYSTREAM", "RANDOM"), answer: "KEYSTREAM", type: "Vigenère (key: RANDOM)", meme: "Il keystream è pseudo-casuale, il tuo errore è certo. 🎲" },
            { cipher: "01000101 01011000 01001000 00100000 01000111 01000001 01001101 01000101", answer: "EXH GAME", type: "Binary", meme: "EXH GAME? Forse intendevi 'EXIT GAME'? 🚪" },
            { cipher: btoa(vigenere("PARADOX", "TIME")), answer: "PARADOX", type: "Base64+Vigenère", meme: "Paradosso temporale! Il tuo errore viene dal futuro. 🕰️" },
            { cipher: "4e 45 55 52 4f 4d 41 4e 43 45", answer: "NEUROMANCE", type: "Hex", meme: "Neuromancer? Più come 'Errore-mantaro'... 🤖" },
            { cipher: vigenere(matrixEncode("NEXUS"), "CYBER"), answer: "NEXUS", type: "Matrix+Vigenère", meme: "Il nexus è collassato! Proprio come la tua logica. 🌀" }
        ],
        type: "options",
        difficulty: 3
    },
    {
        title: "LIVELLO 4 - CIFRATURE AVANZATE",
        description: "⚠️ DIFFICOLTÀ ELEVATA! Decodifica TUTTE le stringhe utilizzando cifrature avanzate e multiple.",
        maxOptions: 12,
        options: [
            { ...multiLevelEncodeV2("FIREWALL", 3), answer: "FIREWALL", meme: "Il firewall ti saluta! 👋" },
            { ...multiLevelEncodeV2("ENCRYPTION", 4), answer: "ENCRYPTION", meme: "Crittografia a livelli multipli! �" },
            { ...multiLevelEncodeV2("CYBERSECURITY", 4), answer: "CYBERSECURITY", meme: "Sicurezza a prova di bomba! 💣" },
            { ...multiLevelEncodeV2("AUTHENTICATION", 4), answer: "AUTHENTICATION", meme: "Autenticazione a più fattori! 🔑" },
            { ...multiLevelEncodeV2("VULNERABILITY", 5), answer: "VULNERABILITY", meme: "Hai trovato una vulnerabilità! 🎯" },
            { ...multiLevelEncodeV2("PENETRATION", 5), answer: "PENETRATION", meme: "Penetrazione riuscita! 🎯" },
            { 
                cipher: railFenceCipher(vigenere("ENCRYPTED", "SECRET"), 3), 
                answer: "ENCRYPTED", 
                type: "Rail Fence + Vigenère",
                meme: "Doppio strato di sicurezza! �️"
            },
            { 
                cipher: atbashCipher(caesarCipher("SECURE", 10)), 
                answer: "SECURE", 
                type: "Atbash + Caesar",
                meme: "Mischia e mescola! 🎲"
            },
            { 
                cipher: multiLevelEncodeV2("MULTILAYER", 3).cipher, 
                answer: "MULTILAYER", 
                type: "Multi-livello avanzato",
                meme: "Quanti livelli! 🎚️"
            },
            { 
                cipher: btoa(railFenceCipher("COMPLEXITY", 4)), 
                answer: "COMPLEXITY", 
                type: "Base64 + Rail Fence",
                meme: "Complessità alle stelle! ⭐"
            },
            { 
                cipher: vigenere(caesarCipher("CHALLENGE", 7), "HARD"), 
                answer: "CHALLENGE", 
                type: "Vigenère + Caesar",
                meme: "Sfida accettata! �"
            },
            { 
                cipher: multiLevelEncodeV2("IMPOSSIBLE", 5).cipher, 
                answer: "IMPOSSIBLE", 
                type: "Multi-livello estremo",
                meme: "Niente è impossibile! 💪"
            }
        ],
        type: "options",
        difficulty: 4
    },
    {
        title: "🔴 LIVELLO FINALE - BOSS EPICO 🔴",
        description: "🔥🔥🔥 SFIDA FINALE! Decodifica TUTTE le parole segrete con cifrature multi-livello avanzate! IL SISTEMA STA PER ESPLODERE! 💥",
        ciphers: [
            multiLevelEncodeV2("ONLYFANS", 5),
            multiLevelEncodeV2("PASSWORD", 5),
            multiLevelEncodeV2("SECURITY", 5),
            multiLevelEncodeV2("HACKER", 5),
            multiLevelEncodeV2("CYBER", 5)
        ].map((cipher, i) => ({
            cipher: cipher.cipher,
            type: cipher.type,
            answer: ["ONLYFANS", "PASSWORD", "SECURITY", "HACKER", "CYBER"][i],
            meme: [
                "La prima parola è la più facile! 😈",
                "Due su cinque, stai andando bene! 😏",
                "Metà strada, ma non abbassare la guardia! 🎯",
                "Quasi alla fine, resisti! 💪",
                "Ultima parola, dacci dentro! 🏁"
            ][i]
        })),
        type: "boss-input",
        difficulty: 5
    }
];

const BOSS_LEVEL_INDEX = levels.length - 1;

// STATISTICHE DI GIOCO
let currentLevel = 0;
let failedAttempts = 0;
let totalSolved = 0;
let solvedOptions = {}; // Traccia le opzioni risolte { levelIndex: { optionIndex: true } }
let selectedOptionIndex = null; // NUOVO: Traccia l'opzione selezionata per l'input
let bossTimer = 180; // 3 minuti per la boss fight
let bossTimerInterval = null;
let bossHealth = 100;
let bossPhase = 1;

const STORAGE_KEY = 'cyberChallengeProgressV1';

function saveGameState() {
    try {
        const state = {
            currentLevel,
            failedAttempts,
            totalSolved,
            solvedOptions
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error('Errore nel salvataggio dello stato di gioco:', e);
    }
}

function loadGameState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;

        const state = JSON.parse(raw);

        if (typeof state.currentLevel === 'number' && state.currentLevel >= 0 && state.currentLevel < levels.length) {
            currentLevel = state.currentLevel;
        }

        if (typeof state.failedAttempts === 'number' && state.failedAttempts >= 0) {
            failedAttempts = state.failedAttempts;
        }

        if (typeof state.totalSolved === 'number' && state.totalSolved >= 0) {
            totalSolved = state.totalSolved;
        }

        if (state.solvedOptions && typeof state.solvedOptions === 'object') {
            solvedOptions = state.solvedOptions;
        }
    } catch (e) {
        console.error('Errore nel caricamento dello stato di gioco:', e);
    }
}

function clearGameState() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
        console.error('Errore nella pulizia dello stato di gioco:', e);
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

// ELEMENTI DEL DOM
const matrixCanvas = document.getElementById('matrix');
const ctx = matrixCanvas.getContext('2d');
const gameContent = document.getElementById('gameContent');
const levelDisplay = document.getElementById('levelDisplay');
const failedAttemptsDisplay = document.getElementById('failedAttempts');
const totalSolvedDisplay = document.getElementById('totalSolved');
const gameContainer = document.getElementById('gameContainer');
const mainTitle = document.getElementById('mainTitle');
const body = document.body;
const correctSound = document.getElementById('correct-sound');
const incorrectSound = document.getElementById('incorrect-sound');
const levelupSound = document.getElementById('levelup-sound');
const startScreen = document.getElementById('startScreen');
const startGameBtn = document.getElementById('startGameBtn');
const continueGameBtn = document.getElementById('continueGameBtn');
const statsPanel = document.getElementById('statsPanel');
const guideFab = document.getElementById('guideFab');

// --- Guida e verifica corrispondenze ---
function createGuideModal() {
    // crea una modale minimale dinamica
    const existing = document.getElementById('guideModal');
    if (existing) return;

    const overlay = document.createElement('div');
    overlay.id = 'guideModal';

    const box = document.createElement('div');
    box.className = 'guide-box';

    const title = document.createElement('h2');
    title.textContent = 'Guida alle Cifrature';
    title.className = 'guide-title';
    box.appendChild(title);

    const list = document.createElement('ul');
    list.className = 'guide-list';
    const items = [
        ['Base64', 'Codifica/decodifica testuale (es. "ROOT" → "Um9vdA==")'],
        ['Hex', 'Rappresentazione esadecimale dei caratteri (es. 41 44 = AD)'],
        ['Binary', 'Byte separati in binario (01000001 = A)'],
        ['Morse', 'Punti e linee (. -) per lettere e numeri'],
        ['ROT-N / Cesare', 'Shift di N posizioni nell\'alfabeto (ROT-13 comune)'],
        ['Vigenère', 'Sostituzione con chiave ripetuta (richiede chiave per decodificare)'],
        ['Reverse', 'Stringa scritta al contrario'],
        ['Matrix', 'Mappatura custom (non reversibile senza la funzione)'],
        ['Multi-livello', 'Combinazione di più metodi (es. Base64 -> Vigenère -> Reverse)']
    ];

    items.forEach(([k, v]) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong class="guide-term">${k}:</strong> ${v}`;
        list.appendChild(li);
    });
    box.appendChild(list);

    const controls = document.createElement('div');
    controls.className = 'guide-controls';

    const note = document.createElement('div');
    note.textContent = 'Nota: questa guida spiega come funzionano le cifrature. Non mostra le soluzioni dei livelli.';
    note.className = 'guide-note';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Chiudi';
    closeBtn.className = 'guide-close';
    closeBtn.onclick = () => { closeGuideModal(); };

    controls.appendChild(note);
    controls.appendChild(closeBtn);
    box.appendChild(controls);
    overlay.appendChild(box);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeGuideModal(); });
    document.body.appendChild(overlay);
}

function closeGuideModal() {
    const el = document.getElementById('guideModal');
    if (el) el.remove();
}

if (guideFab) {
    guideFab.addEventListener('click', (e) => {
        e.preventDefault();
        createGuideModal();
    });
}

// --- Verifica corrispondenze ---
function decodeHex(hexStr) {
    // accetta spazi o stringa continua
    const cleaned = hexStr.trim().replace(/\s+/g, ' ');
    const parts = cleaned.indexOf(' ') >= 0 ? cleaned.split(' ') : cleaned.match(/.{1,2}/g) || [];
    return parts.map(h => String.fromCharCode(parseInt(h, 16))).join('');
}

function decodeBinary(binStr) {
    return binStr.trim().split(/\s+/).map(b => String.fromCharCode(parseInt(b, 2))).join('');
}

const MORSE = {
    '.-':'A','-...':'B','-.-.':'C','-..':'D','.':'E','..-.':'F','--.':'G','....':'H','..':'I',
    '.---':'J','-.-':'K','.-..':'L','--':'M','-.':'N','---':'O','.--.':'P','--.-':'Q','.-.':'R',
    '...':'S','-':'T','..-':'U','...-':'V','.--':'W','-..-':'X','-.--':'Y','--..':'Z',
    '-----':'0','.----':'1','..---':'2','...--':'3','....-':'4','.....':'5','-....':'6','--...':'7','---..':'8','----.':'9'
};

function decodeMorse(m) {
    return m.trim().split(' ').map(s => MORSE[s] || '?').join('');
}

function rotN(text, n) {
    return text.replace(/[A-Z]/gi, (c) => {
        const base = c === c.toUpperCase() ? 65 : 97;
        return String.fromCharCode((c.charCodeAt(0) - base + n + 26) % 26 + base);
    });
}

function vigenereDecrypt(text, key) {
    return vigenere(text, key, true);
}

function verifyItem(option) {
    const type = (option.type || '').toLowerCase();
    const cipher = option.cipher;
    const expected = (option.answer || '').toUpperCase();

    try {
        if (!cipher) return {ok:false, reason:'no cipher'};

        // Multi-livello (tipo generato da multiLevelEncodeV2)
        if (type.includes('multi-livello') || (typeof option.type === 'string' && option.type.startsWith('Multi-livello'))) {
            // parse sequence inside parentheses
            const seqMatch = option.type.match(/\((.*)\)/);
            const seq = seqMatch ? seqMatch[1].split(' -> ').map(s => s.trim()) : [];
            // start from cipher and reverse sequence
            let cur = cipher;
            for (let i = seq.length - 1; i >= 0; i--) {
                const step = seq[i].toLowerCase();
                if (step.startsWith('base64')) {
                    cur = atob(cur);
                } else if (step.startsWith('hex')) {
                    cur = decodeHex(cur);
                } else if (step.startsWith('reverse')) {
                    cur = cur.split('').reverse().join('');
                } else if (step.startsWith('rot')) {
                    const n = parseInt(step.replace(/[^0-9]/g,'')) || 13;
                    cur = rotN(cur, -n);
                } else if (step.startsWith('vigenere')) {
                    const keyMatch = step.match(/key:([^\)\s]+)/i);
                    const key = keyMatch ? keyMatch[1] : '';
                    cur = vigenereDecrypt(cur, key);
                }
            }
            return {ok: cur.toUpperCase() === expected, got: cur.toUpperCase(), expected};
        }

        if (type.includes('base64')) {
            const dec = atob(cipher);
            return {ok: dec.toUpperCase() === expected, got: dec.toUpperCase(), expected};
        }

        if (type.includes('vigen') || type.includes('vigenere')) {
            // try to extract key from type e.g. "Vigenère (key: CYBER)"
            const keyMatch = option.type.match(/key:?\s*([^\)]+)/i);
            const key = keyMatch ? keyMatch[1].trim() : null;
            if (key) {
                const dec = vigenereDecrypt(cipher, key);
                return {ok: dec.toUpperCase() === expected, got: dec.toUpperCase(), expected};
            }
            // no key -> cannot verify
            return {ok:false, reason:'vigenere no key'};
        }

        if (type.includes('morse')) {
            const dec = decodeMorse(cipher);
            return {ok: dec.toUpperCase() === expected, got: dec.toUpperCase(), expected};
        }

        if (type.includes('binary')) {
            const dec = decodeBinary(cipher);
            return {ok: dec.toUpperCase() === expected, got: dec.toUpperCase(), expected};
        }

        if (type.includes('hex')) {
            const dec = decodeHex(cipher);
            return {ok: dec.toUpperCase() === expected, got: dec.toUpperCase(), expected};
        }

        if (type.includes('reverse')) {
            const dec = cipher.split('').reverse().join('');
            return {ok: dec.toUpperCase() === expected, got: dec.toUpperCase(), expected};
        }

        if (type.includes('rot')) {
            // tipo esempio: ROT-2 or ROT-13
            const nMatch = option.type.match(/rot[-_\s]?(\d+)/i);
            const n = nMatch ? parseInt(nMatch[1]) : 13;
            const dec = rotN(cipher, -n);
            return {ok: dec.toUpperCase() === expected, got: dec.toUpperCase(), expected};
        }

        if (type.includes('matrix')) {
            // matrixEncode è deterministica: ricodifichiamo expected e confrontiamo
            const rec = matrixEncode(expected);
            return {ok: rec === cipher, got: rec, expected: cipher};
        }

        if ((type || '').toLowerCase().includes('base64+vigen') || (type || '').toLowerCase().includes('base64+vigenère')) {
            // decodifica base64 poi vigenere (tipo scritto come "Base64+Vigenère")
            // tentiamo estrarre la chiave dalla type
            const keyMatch = option.type.match(/vigen\S*\(?key:?\s*([^\)]+)\)?/i);
            const key = keyMatch ? keyMatch[1].trim() : null;
            if (key) {
                const afterB64 = atob(cipher);
                const dec = vigenereDecrypt(afterB64, key);
                return {ok: dec.toUpperCase() === expected, got: dec.toUpperCase(), expected};
            }
            return {ok:false, reason:'no key for base64+vigenere'};
        }

        // fallback: confronto diretto con expected
        return {ok: cipher.toUpperCase() === expected, got: cipher.toUpperCase(), expected};
    } catch (e) {
        return {ok:false, reason: String(e)};
    }
}

function verifyAll() {
    const results = [];
    let total = 0, passed = 0;

    levels.forEach((lvl, li) => {
        if (lvl.type === 'options' && Array.isArray(lvl.options)) {
            lvl.options.forEach((opt, oi) => {
                total++;
                const res = verifyItem(opt);
                const ok = !!res.ok;
                if (ok) passed++;
                results.push({level: li, option: oi, title: lvl.title, type: opt.type || '', cipher: opt.cipher, answer: opt.answer, ok, info: res});
            });
        } else if (lvl.type === 'input' || lvl.type === 'boss-input') {
            total++;
            // For input levels the cipher is usually a transformation of the answer, try to infer
            const fakeOpt = {cipher: lvl.cipher, type: lvl.cipherMeta || (lvl.type === 'input' ? 'Vigenère' : lvl.type), answer: lvl.answer};
            const res = verifyItem(fakeOpt);
            const ok = !!res.ok;
            if (ok) passed++;
            results.push({level: li, option: null, title: lvl.title, type: fakeOpt.type, cipher: fakeOpt.cipher, answer: fakeOpt.answer, ok, info: res});
        }
    });

    const summary = `Risultati verifica: ${passed}/${total} corrispondenze corrette.`;
    const detail = results.map(r => `Livello ${r.level} - ${r.title} - option ${r.option !== null ? r.option : '-'} => ${r.ok ? 'OK' : 'FAIL'} | type: ${r.type} | answer: ${r.answer} | info: ${r.info.reason ? r.info.reason : (r.info.got !== undefined ? 'got='+r.info.got : '')}`).join('\n');

    const out = summary + '\n\n' + detail;
    console.log(out);
    const area = document.getElementById('guideResult');
    if (area) area.textContent = out;
    displayFeedback(summary, passed === total);
    return {summary, results};
}

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


// Funzioni di Aggiornamento UI

function updateStats() {
    levelDisplay.textContent = currentLevel + 1;
    failedAttemptsDisplay.textContent = failedAttempts;
    totalSolvedDisplay.textContent = totalSolved;

    const difficulty = levels[currentLevel].difficulty;

    body.classList.remove('warning-mode', 'pre-boss-glitch', 'boss-mode');
    gameContainer.classList.remove('warning-mode', 'pre-boss-glitch', 'boss-mode');
    mainTitle.classList.remove('boss-mode', 'glitch-text');

    if (currentLevel === BOSS_LEVEL_INDEX) {
        body.classList.add('boss-mode', 'anonymous-bg');
        gameContainer.classList.add('boss-mode');
        mainTitle.classList.add('boss-mode', 'glitch-text');
        isGlitching = true;
        matrixColor = '#F00';
    } else if (difficulty >= 3) {
        body.classList.add('pre-boss-glitch');
        gameContainer.classList.add('pre-boss-glitch');
        mainTitle.classList.add('glitch-text');
        isGlitching = true;
        matrixColor = ['#F00', '#F80', '#FF0'][Math.floor(Math.random() * 3)];
    } else if (difficulty >= 2) {
        body.classList.add('warning-mode');
        gameContainer.classList.add('warning-mode');
        matrixColor = '#F80';
        isGlitching = false;
    } else {
        isGlitching = false;
        matrixColor = '#0F0';
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
    feedback.classList.remove('success', 'error');
    feedback.classList.add(isSuccess ? 'success' : 'error');
    
    // Rimuovi dopo un po'
    setTimeout(() => {
        if(feedback) feedback.remove();
    }, 3000);
}

// Matrix Background
const canvas = document.getElementById('matrix');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Colori del matrix per ogni livello
const levelColors = {
    0: '#00FF00',    // Verde puro
    1: '#7FFF00',    // Verde-giallo
    2: '#FFB300',    // Arancione
    3: '#FF6B35',    // Arancione-rosso
    4: '#FF0000'     // Rosso puro
};

let matrixColor = levelColors[0];

const matrix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}";
const matrixArray = matrix.split("");

const fontSize = 10;
const columns = canvas.width / fontSize;

const drops = [];
for(let x = 0; x < columns; x++) {
    drops[x] = 1;
}

function updateMatrixColor(levelIndex) {
    matrixColor = levelColors[levelIndex] || levelColors[0];
}

function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = matrixColor;
    ctx.font = fontSize + 'px monospace';

    for(let i = 0; i < drops.length; i++) {
        const text = matrixArray[Math.floor(Math.random() * matrixArray.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if(drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

setInterval(drawMatrix, 35);

// Gestione resize
window.onresize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
};

// Logica di Gioco

function checkInput(inputAnswer, expectedAnswer) {
    // Usata solo per il LIVELLO 0
    if (inputAnswer.toUpperCase() === expectedAnswer.toUpperCase()) {
        correctSound.play();
        displayFeedback("✅ Accesso Autorizzato. Livello Completato!", true);
        totalSolved++;
        nextLevel();
    } else {
        incorrectSound.play();
        failedAttempts++;
        updateStats();
        displayFeedback("❌ Accesso Negato. Riprova.", false);
    }
}

function selectOption(levelIndex, optionIndex) {
    // Se l'opzione è già stata risolta, non la selezioniamo
    if (solvedOptions[levelIndex] && solvedOptions[levelIndex][optionIndex]) {
        displayFeedback("Questa cifratura è già stata risolta.", true);
        selectedOptionIndex = null;
        return;
    }

    // Deseleziona la card precedente, se esiste
    if (selectedOptionIndex !== null) {
        const prevCard = document.getElementById(`option-${selectedOptionIndex}`);
        if(prevCard) prevCard.classList.remove('selected');
    }

    // Seleziona la nuova card
    selectedOptionIndex = optionIndex;
    document.getElementById(`option-${optionIndex}`).classList.add('selected');
    
    const verifyBtn = document.getElementById('verifyOptionBtn');
    if (verifyBtn) {
        verifyBtn.disabled = false;
    }

    const level = levels[levelIndex];
    const opt = level.options[optionIndex];
    displayFeedback(`Decodifica: Tipo ${opt.type} | Cifratura: ${opt.cipher}. Inserisci la decodifica qui sotto.`, true);
    document.getElementById('optionInput').focus();
}

function checkOptionInput() {
    const levelIndex = currentLevel;
    
    if (selectedOptionIndex === null) {
        displayFeedback("❌ Seleziona una cifratura dalla griglia per decodificarla.", false);
        return;
    }
    
    const inputElement = document.getElementById('optionInput');
    const verifyBtn = document.getElementById('verifyOptionBtn');
    const inputAnswer = inputElement.value.toUpperCase().trim();
    const levelData = levels[levelIndex];
    const optionData = levelData.options[selectedOptionIndex];
    const expectedAnswer = optionData.answer.toUpperCase().trim();
    
    if (inputAnswer === expectedAnswer) {
        // Logica per opzione corretta
        correctSound.play();
        
        // Inizializza l'oggetto solvedOptions per il livello corrente se non esiste
        if (!solvedOptions[levelIndex]) {
            solvedOptions[levelIndex] = {};
        }

        // Segna come risolta
        solvedOptions[levelIndex][selectedOptionIndex] = true;
        totalSolved++;
        updateStats();
        saveGameState();

        // Aggiorna l'UI della card
        const solvedCard = document.getElementById(`option-${selectedOptionIndex}`);
        if(solvedCard) {
            solvedCard.classList.remove('selected');
            solvedCard.classList.add('solved');
        }
        
        displayFeedback(`🟢 Decodifica Riuscita! ${optionData.meme}`, true);
        
        // Pulisci l'input e deseleziona
        inputElement.value = '';
        selectedOptionIndex = null;
        if (verifyBtn) {
            verifyBtn.disabled = true;
        }
        
        // Controllo se tutte le opzioni sono state risolte
        const solvedCount = Object.keys(solvedOptions[levelIndex]).length;
        updateProgressBar(levelIndex);

        if (solvedCount === levelData.maxOptions) {
            levelupSound.play();
            setTimeout(() => {
                displayFeedback(`🎉 Livello ${levelIndex} completato! Passa al successivo.`, true);
                nextLevel();
            }, 1000);
        }

    } else {
        // Logica per opzione errata
        incorrectSound.play();
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
        solvedOptions[currentLevel] = {};

        const prevDifficulty = levels[currentLevel - 1]?.difficulty || 0;
        const newDifficulty = levels[currentLevel]?.difficulty || 0;

        if (newDifficulty > prevDifficulty) {
            displayFeedback(`⚠️ DIFFICOLTÀ AUMENTATA! (Livello ${currentLevel})`, false);
        }

        renderLevel(currentLevel);
        saveGameState();
    }
}

function renderLevel(levelIndex) {
    const level = levels[levelIndex];
    
    // Rimuovi tutte le classi di livello dal body e container
    const body = document.body;
    const gameContainer = document.getElementById('gameContainer');
    const mainTitle = document.getElementById('mainTitle');
    
    // Rimuovi classi di livello precedenti
    for (let i = 0; i <= 4; i++) {
        body.classList.remove(`level-${i}`);
        gameContainer.classList.remove(`level-${i}`);
        mainTitle.classList.remove(`level-${i}`);
    }
    
    // Aggiungi classi del livello corrente
    body.classList.add(`level-${levelIndex}`);
    gameContainer.classList.add(`level-${levelIndex}`);
    mainTitle.classList.add(`level-${levelIndex}`);
    
    // Aggiorna il colore del matrix
    updateMatrixColor(levelIndex);
    
    let html = `<div class="level-info"><h2>${level.title}</h2><p>${level.description}</p></div>`;

    if (levelIndex === BOSS_LEVEL_INDEX) {
        // --- BOSS FIGHT (Livello 4) ---
        clearInterval(bossTimerInterval); 
        startBossTimer();

        html = `
            <div class="boss-timer" id="bossTimerDisplay">Tempo Rimanente: 03:00</div>
            <div class="boss-phase" id="bossPhaseDisplay">FASE 1</div>
            <div class="boss-health">
                <div class="health-bar" id="bossHealthBar">BOSS HEALTH: 100%</div>
            </div>
            <div class="boss-input-container">
                <input type="text" id="bossInput" placeholder="Inserisci la parola segreta..." autocomplete="off">
                <button onclick="checkBossInput()">ATTACCA</button>
            </div>
        `;
        gameContent.appendChild(bossCipher);
        
        // Inizializza le variabili del boss
        guessedWords = [];
        currentBossWordIndex = 0;
        bossHealth = 100;
        bossPhase = 1;
        
        // Inizia il timer del boss
        startBossTimer();
        
        // Focus sull'input del boss
        const bossInput = document.getElementById('bossInput');
        if (bossInput) bossInput.focus();
    } else if (level.type === 'input') {
        // --- Livello 0 (Input Semplice) ---
        html += `
            <div class="cipher-text">${level.cipher}</div>
            <div class="input-group">
                <input type="text" id="levelInput" placeholder="Inserisci la decodifica (es. ADMIN)">
                <button onclick="checkInput(document.getElementById('levelInput').value, '${level.answer}')">Accedi al Sistema</button>
            </div>
        `;
    } else if (level.type === 'options') {
        // --- Livelli 1, 2, 3 (Opzioni Multiple con Selezione e Input) ---
        html += `
            <div class="progress-bar">
                <div class="progress-text" id="solvedCountDisplay">${Object.keys(solvedOptions[levelIndex] || {}).length} / ${level.maxOptions} Decodificazioni</div>
                <div class="progress-fill"><div class="progress-fill-inner" id="progressFillInner" style="width: 0%;"></div></div>
            </div>
            
            <div class="input-group options-input-area">
                <input type="text" id="optionInput" placeholder="Inserisci la decodifica della cifratura selezionata..." style="font-size: 1.2em;">
                <button id="verifyOptionBtn" onclick="checkOptionInput()" disabled>Verifica Decodifica</button>
            </div>

            <div class="options-grid">
        `;
        level.options.forEach((opt, index) => {
            const isSolved = solvedOptions[levelIndex] && solvedOptions[levelIndex][index];
            const isSelected = selectedOptionIndex === index;
            html += `
                <div class="option-card ${isSolved ? 'solved' : ''} ${isSelected ? 'selected' : ''}" id="option-${index}" 
                    onclick="selectOption(${levelIndex}, ${index})">
                    <h3>Tipo: ${opt.type}</h3>
                    <p>${opt.cipher}</p>
                </div>
            `;
        });
        html += `</div>`;
    }

    gameContent.innerHTML = html;
    updateStats();
    if (level.type === 'options') {
        updateProgressBar(levelIndex);
    }

    const levelInputElement = document.getElementById('levelInput');
    if (levelInputElement) {
        levelInputElement.focus();
        levelInputElement.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                checkInput(levelInputElement.value, level.answer);
            }
        });
    }

    const optionInputElement = document.getElementById('optionInput');
    if (optionInputElement) {
        optionInputElement.focus();
        optionInputElement.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                checkOptionInput();
            }
        });
    }

    const bossInputElement = document.getElementById('bossInput');
    if (bossInputElement) {
        bossInputElement.focus();
        bossInputElement.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                checkBossInput();
            }
        });
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

// Logica Boss Fight
function startBossTimer() {
    const timerDisplay = document.getElementById('bossTimerDisplay');
    bossTimer = 180; // Reset del timer a 3 minuti
    bossTimerInterval = setInterval(() => {
        bossTimer--;
        const minutes = Math.floor(bossTimer / 60).toString().padStart(2, '0');
        const seconds = (bossTimer % 60).toString().padStart(2, '0');
        
        if (timerDisplay) {
            timerDisplay.textContent = `Tempo Rimanente: ${minutes}:${seconds}`;
        }

        if (bossTimer <= 0) {
            clearInterval(bossTimerInterval);
            loseGame();
        }
        
        // Cambio di fase basato sul tempo
        if (bossTimer === 120 && bossPhase === 1) { // 2:00
            changeBossPhase(2);
        } else if (bossTimer === 60 && bossPhase === 2) { // 1:00
            changeBossPhase(3);
        }
    }, 1000);
}

function changeBossPhase(newPhase) {
    if (newPhase > bossPhase) {
        bossPhase = newPhase;
        const phaseDisplay = document.getElementById('bossPhaseDisplay');
        if (phaseDisplay) phaseDisplay.textContent = `FASE ${bossPhase}`;
        displayFeedback(`🚨 BOSS: NUOVA FASE ATTIVA - TEMPO DI REAZIONE RIDOTTO!`, false);
    }
}

function checkBossInput() {
    const inputElement = document.getElementById('bossInput');
    const input = inputElement ? inputElement.value.toUpperCase().trim() : '';
    const currentBossWord = BOSS_CIPHERS_META[currentBossWordIndex];
    const expectedAnswer = currentBossWord.answer;

    if (input === expectedAnswer) {
        correctSound.play();
        guessedWords.push(input);
        const damage = Math.floor(100 / BOSS_CIPHERS_META.length); // Danno proporzionale
        attackBoss(damage);
        
        // Passa alla parola successiva o vinci
        if (currentBossWordIndex < BOSS_CIPHERS_META.length - 1) {
            currentBossWordIndex++;
            const nextWord = BOSS_CIPHERS_META[currentBossWordIndex];
            displayFeedback(`✅ Parola corretta! ${BOSS_CIPHERS_META.length - guessedWords} parole rimanenti.`, true);
            
            // Aggiorna l'input per la prossima parola
            const bossCipherDisplay = document.getElementById('bossCipher');
            if (bossCipherDisplay) bossCipherDisplay.textContent = nextWord.cipher;
            
            const bossCipherType = document.getElementById('bossCipherType');
            if (bossCipherType) bossCipherType.textContent = `Tipo: ${nextWord.type}`;
            
            if (inputElement) inputElement.value = '';
        }
    } else {
        incorrectSound.play();
        failedAttempts++;
        updateStats();
        displayFeedback(`❌ Parola errata! Prova ancora. (${BOSS_CIPHERS_META.length - guessedWords.length} parole rimanenti)`, false);
        bossTimer = Math.max(bossTimer - 10, 0); // Penalità di tempo
    }
}

function attackBoss(damage) {
    bossHealth = Math.max(0, bossHealth - damage);
    const progress = Math.floor((guessedWords.length / BOSS_CIPHERS_META.length) * 100);

    const healthBar = document.getElementById('bossHealthBar');
    if (healthBar) {
        healthBar.style.width = `${bossHealth}%`;
        healthBar.textContent = `BOSS HEALTH: ${bossHealth}%`;
    }
    
    const progressFill = document.getElementById('bossProgressFill');
    if (progressFill) {
        progressFill.style.width = `${progress}%`;
    }
    
    const guessedWordsCount = document.getElementById('guessedWordsCount');
    if (guessedWordsCount) {
        guessedWordsCount.textContent = guessedWords.length;
    }

    if (bossHealth <= 0) {
        setTimeout(winGame, 500);
    } else {
        correctSound.play();
        displayFeedback(`💥 Danno Inferto: ${damage} HP! Parole indovinate: ${guessedWords.length}/${BOSS_CIPHERS_META.length}`, true);
    }
}

function winGame() {
    clearInterval(bossTimerInterval);
    clearGameState();
    gameContent.innerHTML = `
        <div class="victory">
            <h2>🏆 VITTORIA! 🏆</h2>
            <p class="subtitle">HAI SCONFITTO IL BOSS E DECODIFICATO IL MESSAGGIO FINALE!</p>
            <div class="cipher-text" style="font-size: 3em; color: #ff69b4; border-color: #ff69b4;">
                ${levels[BOSS_LEVEL_INDEX].answer}
            </div>
            <p class="meme">🥳 MISSIONE COMPIUTA, CYBER-HACKER! 🥳</p>
        </div>
    `;
    // Rimuovi gli stili del Boss
    body.classList.remove('boss-mode', 'anonymous-bg');
    gameContainer.classList.remove('boss-mode');
    mainTitle.classList.remove('boss-mode');
    isGlitching = false;
    matrixColor = '#0F0';
}

function loseGame() {
    clearInterval(bossTimerInterval);
    clearGameState();
    gameContent.innerHTML = `
        <div class="feedback error">
            <h2>GAME OVER</h2>
            <p>Il tempo è scaduto! Il Boss ha bloccato il sistema. Hai fallito la decodifica finale.</p>
            <button onclick="window.location.reload()">Riprova l'Attacco</button>
        </div>
    `;
    // Rimuovi gli stili del Boss
    body.classList.remove('boss-mode', 'anonymous-bg');
    gameContainer.classList.remove('boss-mode');
    mainTitle.classList.remove('boss-mode');
    isGlitching = false;
    matrixColor = '#0F0';
}

// Inizializza il gioco
loadGameState();

const hasSavedGame = (totalSolved > 0) || currentLevel > 0 || Object.keys(solvedOptions || {}).length > 0;

if (continueGameBtn && hasSavedGame) {
    continueGameBtn.classList.remove('hidden');
}

if (!startScreen) {
    // Fallback: se per qualche motivo la start screen non esiste, avvia subito il gioco
    if (statsPanel) statsPanel.classList.remove('hidden');
    renderLevel(currentLevel);
}