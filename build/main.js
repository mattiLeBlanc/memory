"use strict";
const themes = [
    { emoji: "🎄", colors: ["#0ea5e9", "#065f46"] },
    { emoji: "🎁", colors: ["#ef4444", "#991b1b"] },
    { emoji: "❄️", colors: ["#67e8f9", "#2563eb"] },
    { emoji: "🔔", colors: ["#f59e0b", "#b45309"] },
    { emoji: "🧦", colors: ["#22c55e", "#064e3b"] },
    { emoji: "⛄", colors: ["#e0f2fe", "#0ea5e9"] },
    { emoji: "🍪", colors: ["#f59e0b", "#7c2d12"] },
    { emoji: "🕯️", colors: ["#e11d48", "#4c0519"] },
];
function svgDataUri(emoji, colors) {
    const [from, to] = colors;
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 260">
      <defs>
        <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="${from}" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="${to}" stop-opacity="0.9"/>
        </linearGradient>
      </defs>
      <rect width="200" height="260" rx="22" fill="url(#g)"/>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" font-family="Segoe UI Emoji, sans-serif" font-size="120">${emoji}</text>
    </svg>
  `;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
const themeImages = themes.map((t) => svgDataUri(t.emoji, t.colors));
let deck = [];
let firstPick = null;
let isLocked = false;
let moveCount = 0;
let matchCount = 0;
const board = document.querySelector("#board");
const moves = document.querySelector("#moves");
const matches = document.querySelector("#matches");
const restart = document.querySelector("#restart");
const message = document.querySelector("#message");
function shuffle(list) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}
function createDeck() {
    const doubled = [...themeImages, ...themeImages];
    const shuffled = shuffle(doubled);
    return shuffled.map((image, index) => ({
        id: index,
        image,
        matched: false,
        faceUp: false,
        element: document.createElement("button"),
    }));
}
function updateStats() {
    if (moves)
        moves.textContent = moveCount.toString();
    if (matches)
        matches.textContent = matchCount.toString();
}
function setMessage(text) {
    if (!message)
        return;
    message.innerHTML = text;
}
function flipCard(card, faceUp) {
    card.faceUp = faceUp;
    card.element.classList.toggle("is-revealed", faceUp);
}
function isComplete() {
    return deck.every((card) => card.matched);
}
function markMatched(a, b) {
    a.matched = true;
    b.matched = true;
    a.element.classList.add("matched");
    b.element.classList.add("matched");
    matchCount += 1;
    updateStats();
    if (isComplete()) {
        setMessage("<strong>Nice memory!</strong> All pairs found. Shuffle to go again.");
    }
    else {
        setMessage("Nice pick! Keep going.");
    }
}
function hideCards(a, b) {
    setTimeout(() => {
        flipCard(a, false);
        flipCard(b, false);
        isLocked = false;
    }, 750);
}
function onCardClick(card) {
    if (isLocked || card.faceUp || card.matched)
        return;
    flipCard(card, true);
    if (!firstPick) {
        firstPick = card;
        setMessage("Pick another card to see if it matches.");
        return;
    }
    moveCount += 1;
    updateStats();
    if (card.image === firstPick.image && card.id !== firstPick.id) {
        markMatched(card, firstPick);
    }
    else {
        isLocked = true;
        hideCards(card, firstPick);
        setMessage("Not a match. Keep track and try again.");
    }
    firstPick = null;
}
function renderBoard() {
    if (!board)
        return;
    board.innerHTML = "";
    deck.forEach((card) => {
        const wrapper = document.createElement("button");
        wrapper.className = "card";
        wrapper.type = "button";
        const inner = document.createElement("div");
        inner.className = "card-inner";
        const front = document.createElement("div");
        front.className = "face front";
        const image = document.createElement("div");
        image.className = "card-img";
        image.style.backgroundImage = `url("${card.image}")`;
        front.appendChild(image);
        const back = document.createElement("div");
        back.className = "face back";
        back.innerHTML = `<span><svg class="h-auto w-auto" width="60" height="60" viewBox="0 0 60 60" preserveAspectRatio="xMinYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path id="sparkle" fill="#3bbcbd" d="M29.58,59.14l-4.47-8.17c-3.92-7.16-9.77-13.01-16.93-16.93L0,29.58l8.18-4.48c7.16-3.92,13.01-9.77,16.93-16.93L29.58,0l4.47,8.17c3.92,7.16,9.77,13.01,16.93,16.93l8.18,4.48-8.19,4.47c-7.15,3.91-13.01,9.77-16.92,16.93l-4.47,8.17Zm-12.21-29.57c4.74,3.35,8.86,7.47,12.21,12.21,3.35-4.74,7.47-8.86,12.21-12.21-4.74-3.35-8.86-7.48-12.21-12.21-3.35,4.74-7.47,8.86-12.21,12.21Z"/>
  </svg></span>`;
        inner.appendChild(front);
        inner.appendChild(back);
        wrapper.appendChild(inner);
        card.element = wrapper;
        card.element.classList.remove("matched", "is-revealed");
        card.element.addEventListener("click", () => onCardClick(card));
        board.appendChild(card.element);
    });
}
function resetGame() {
    isLocked = false;
    moveCount = 0;
    matchCount = 0;
    firstPick = null;
    deck = createDeck();
    updateStats();
    setMessage("Flip two cards to start. Remember their spots!");
    renderBoard();
}
function init() {
    if (!board || !moves || !matches || !restart)
        return;
    restart.addEventListener("click", resetGame);
    resetGame();
}
init();
