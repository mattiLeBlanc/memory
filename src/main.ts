type Card = {
  id: number;
  image: string;
  matched: boolean;
  faceUp: boolean;
  element: HTMLButtonElement;
};

const imagePaths = [
  "./assets/img/bell.jpeg",
  "./assets/img/cake.jpeg",
  "./assets/img/candle.jpeg",
  "./assets/img/christmas-tree.jpeg",
  "./assets/img/church.jpeg",
  "./assets/img/gift.jpeg",
  "./assets/img/snowman.jpeg",
  "./assets/img/sock.jpeg",
];

let deck: Card[] = [];
let firstPick: Card | null = null;
let isLocked = false;
let moveCount = 0;
let matchCount = 0;

const board = document.querySelector<HTMLElement>("#board");
const moves = document.querySelector<HTMLElement>("#moves");
const matches = document.querySelector<HTMLElement>("#matches");
const restart = document.querySelector<HTMLButtonElement>("#restart");
const message = document.querySelector<HTMLElement>("#message");
const winOverlay = document.querySelector<HTMLElement>("#win-overlay");
const playAgain = document.querySelector<HTMLButtonElement>("#play-again");

function shuffle<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function createDeck(): Card[] {
  const doubled = [...imagePaths, ...imagePaths];
  const shuffled = shuffle(doubled);

  return shuffled.map((image, index) => ({
    id: index,
    image,
    matched: false,
    faceUp: false,
    element: document.createElement("button"),
  }));
}

function updateStats(): void {
  if (moves) moves.textContent = moveCount.toString();
  if (matches) matches.textContent = matchCount.toString();
}

function setMessage(text: string): void {
  if (!message) return;
  message.innerHTML = text;
}

function flipCard(card: Card, faceUp: boolean): void {
  card.faceUp = faceUp;
  card.element.classList.toggle("is-revealed", faceUp);
}

function isComplete(): boolean {
  return deck.every((card) => card.matched);
}

function markMatched(a: Card, b: Card): void {
  a.matched = true;
  b.matched = true;
  a.element.classList.add("matched");
  b.element.classList.add("matched");
  matchCount += 1;
  updateStats();
  if (isComplete()) {
    setMessage("<strong>Nice memory!</strong> All pairs found. Shuffle to go again.");
    winOverlay?.classList.add("show");
  } else {
    setMessage("Nice pick! Keep going.");
  }
}

function hideCards(a: Card, b: Card): void {
  setTimeout(() => {
    flipCard(a, false);
    flipCard(b, false);
    isLocked = false;
  }, 750);
}

function onCardClick(card: Card): void {
  if (isLocked || card.faceUp || card.matched) return;
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
  } else {
    isLocked = true;
    hideCards(card, firstPick);
    setMessage("Not a match. Keep track and try again.");
  }

  firstPick = null;
}

function renderBoard(): void {
  if (!board) return;
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

    card.element = wrapper as HTMLButtonElement;
    card.element.classList.remove("matched", "is-revealed");
    card.element.addEventListener("click", () => onCardClick(card));

    board.appendChild(card.element);
  });
}

function resetGame(): void {
  isLocked = false;
  moveCount = 0;
  matchCount = 0;
  firstPick = null;
  deck = createDeck();
  updateStats();
  setMessage("Flip two cards to start. Remember their spots!");
   winOverlay?.classList.remove("show");
  renderBoard();
}

function init(): void {
  if (!board || !moves || !matches || !restart) return;
  restart.addEventListener("click", resetGame);
  playAgain?.addEventListener("click", resetGame);
  resetGame();
}

init();
