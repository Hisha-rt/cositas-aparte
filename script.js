const audio = document.getElementById('audio');
const btnPlay = document.getElementById('btn-play');
const btnApagar = document.getElementById('btn-apagar');
const btnCortar = document.getElementById('btn-cortar');
const btnComer = document.getElementById('btn-comer');
const msgBox = document.getElementById('message-box');
const flame = document.getElementById('flame');
const pieces = document.querySelectorAll('.piece');
const modal = document.getElementById('modal');
const btnCloseModal = document.getElementById('btn-close-modal');
const candleContainer = document.getElementById('candle-container');

const impatienceMessages = [
    "No seas tan impaciente, por favor.",
    "Solo un momento...",
    "¿Por qué no me dejas cantar en paz?"
];

let isAudioDone = false;
let canEat = false;
let winningSlice = Math.floor(Math.random() * 8);

audio.addEventListener('ended', () => {
    isAudioDone = true;
    msgBox.innerText = "¡Ya puedes apagar tus velitas!";
});

btnPlay.addEventListener('click', () => {
    audio.play().catch(() => {});
    btnPlay.classList.add('hidden');
    btnApagar.classList.remove('hidden');
    msgBox.innerText = "Escucha tu canción cumpleañera y después apaga tus velitas";
});

btnApagar.addEventListener('click', () => {
    if (!isAudioDone) {
        const randomMsg = impatienceMessages[Math.floor(Math.random() * impatienceMessages.length)];
        msgBox.innerText = randomMsg;
    } else {
        flame.classList.add('hidden');
        btnApagar.classList.add('hidden');
        btnCortar.classList.remove('hidden');
        msgBox.innerText = "¡Toca cortar el pastel!";
    }
});

/* ---------- Corte manual del pastel, paso a paso ---------- */

// Cada etapa describe qué "cortes" (límites entre rebanadas, en grados)
// ya están hechos. Los límites se acumulan: una vez cortado, no se deshace.
const cutStages = [
    { boundaries: [], message: null },
    { boundaries: [0, 180], message: "¿Vas a comer tanto pastel? Córtalo un poquito más." },
    { boundaries: [0, 90, 180], message: "Sigue siendo demasiado, ¿y si cortas para ocho personas?" },
    { boundaries: [0, 90, 180, 270], message: null },
    { boundaries: [0, 45, 90, 135, 180, 225, 270, 315], message: "¡Listo! El pastel ya quedó en 8 rebanaditas." }
];
const SEPARATION = 9; // separación en px entre rebanadas ya cortadas
let cutStage = 0;

function groupsFromBoundaries(boundaries) {
    const active = new Set(boundaries);
    const groups = [];
    let current = [];
    for (let i = 0; i < 8; i++) {
        const startAngle = i * 45;
        if (active.has(startAngle) && current.length > 0) {
            groups.push(current);
            current = [];
        }
        current.push(i);
    }
    if (current.length) groups.push(current);
    if (!active.has(0) && groups.length > 1) {
        const first = groups.shift();
        groups[groups.length - 1] = groups[groups.length - 1].concat(first);
    }
    return groups;
}

function applyCutStage(stageIndex) {
    const stage = cutStages[stageIndex];
    const groups = groupsFromBoundaries(stage.boundaries);

    groups.forEach(group => {
        const startAngle = group[0] * 45;
        const endAngle = (group[group.length - 1] + 1) * 45;
        const bisector = (startAngle + endAngle) / 2;
        const rad = bisector * Math.PI / 180;
        const dx = (SEPARATION * Math.sin(rad)).toFixed(2);
        const dy = (-SEPARATION * Math.cos(rad)).toFixed(2);
        group.forEach(idx => {
            const el = document.querySelector(`.piece[data-index="${idx}"]`);
            if (el) el.style.transform = `translate(${dx}px, ${dy}px)`;
        });
    });

    if (stage.message) msgBox.innerText = stage.message;
}

btnCortar.addEventListener('click', () => {
    if (cutStage === 0) {
        candleContainer.classList.add('hidden');
        btnCortar.textContent = 'Seguir cortando';
    }

    cutStage++;
    applyCutStage(cutStage);

    if (cutStage === cutStages.length - 1) {
        btnCortar.classList.add('hidden');
        btnComer.classList.remove('hidden');
    }
});

/* ---------- Comer rebanadas ---------- */

btnComer.addEventListener('click', () => {
    canEat = true;
    btnComer.classList.add('hidden');
    msgBox.innerText = "Elige cuál rebanada quieres comer primero.";
    pieces.forEach(piece => {
        piece.classList.add('eatable');
    });
});

pieces.forEach(piece => {
    piece.addEventListener('click', (e) => {
        if (!canEat) return;

        const index = parseInt(piece.getAttribute('data-index'));

        if (index === winningSlice) {
            modal.classList.remove('hidden');
        } else {
            piece.classList.add('eaten');
        }
    });
});

btnCloseModal.addEventListener('click', () => {
    modal.classList.add('hidden');
});