import { Chess } from "chess.js";
import "./style.css";

const PIECES = {
  w: { k: "♔", q: "♕", r: "♖", b: "♗", n: "♘", p: "♙" },
  b: { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" }
};

const game = new Chess();
const boardEl = document.querySelector("#board");
const movesEl = document.querySelector("#moves");
const statusEl = document.querySelector("#status");
const moveCountEl = document.querySelector("#moveCount");
const whiteClockEl = document.querySelector("#whiteClock");
const blackClockEl = document.querySelector("#blackClock");

let selected = null;
let legalTargets = [];
let whiteSeconds = 300;
let blackSeconds = 300;
let timer = null;
let gameOver = false;

const files = ["a","b","c","d","e","f","g","h"];
const ranks = [8,7,6,5,4,3,2,1];

function squareName(file, rank) {
  return files[file] + ranks[rank];
}

function formatTime(total) {
  const minutes = Math.floor(total / 60).toString().padStart(2, "0");
  const seconds = (total % 60).toString().padStart(2, "0");
  return minutes + ":" + seconds;
}

function renderBoard() {
  boardEl.innerHTML = "";
  const position = game.board();

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const square = squareName(f, r);
      const cell = position[r][f];
      const button = document.createElement("button");
      button.type = "button";
      button.className = "square " + ((r + f) % 2 === 0 ? "light" : "dark");
      button.setAttribute("role", "gridcell");
      button.setAttribute("aria-label", square);

      if (square === selected) button.classList.add("selected");
      if (legalTargets.includes(square)) {
        button.classList.add("legal");
        if (cell) button.classList.add("capture");
      }

      if (cell) {
        const piece = document.createElement("span");
        piece.className = "piece " + (cell.color === "w" ? "white-piece" : "black-piece");
        piece.textContent = PIECES[cell.color][cell.type];
        button.appendChild(piece);
      }

      button.addEventListener("click", () => handleSquare(square));
      boardEl.appendChild(button);
    }
  }
}

function handleSquare(square) {
  if (gameOver || game.turn() !== "w") return;

  if (selected && legalTargets.includes(square)) {
    try {
      const move = game.move({ from: selected, to: square, promotion: "q" });
      selected = null;
      legalTargets = [];
      renderBoard();
      renderMoves();
      updateStatus();
      if (!game.isGameOver()) startClock();
      return move;
    } catch {
      selected = null;
      legalTargets = [];
      renderBoard();
      return;
    }
  }

  const piece = game.get(square);
  if (piece && piece.color === "w") {
    selected = square;
    legalTargets = game.moves({ square, verbose: true }).map(m => m.to);
  } else {
    selected = null;
    legalTargets = [];
  }
  renderBoard();
}

function renderMoves() {
  const history = game.history();
  movesEl.innerHTML = "";
  for (let i = 0; i < history.length; i += 2) {
    const row = document.createElement("div");
    row.className = "move";
    const number = document.createElement("span");
    number.className = "move-num";
    number.textContent = (Math.floor(i / 2) + 1) + ".";
    const notation = document.createElement("span");
    notation.textContent = history[i] + (history[i + 1] ? "  " + history[i + 1] : "");
    row.append(number, notation);
    movesEl.appendChild(row);
  }
  moveCountEl.textContent = history.length;
}

function updateStatus() {
  if (game.isCheckmate()) {
    gameOver = true;
    stopClock();
    statusEl.textContent = game.turn() === "w" ? "Checkmate — Black wins" : "Checkmate — White wins";
    return;
  }
  if (game.isDraw()) {
    gameOver = true;
    stopClock();
    statusEl.textContent = "Draw";
    return;
  }
  if (game.isCheck()) {
    statusEl.textContent = game.turn() === "w" ? "Check — your turn" : "Check — opponent turn";
  } else {
    statusEl.textContent = game.turn() === "w" ? "Your turn" : "Opponent's turn";
  }
}

function updateClocks() {
  whiteClockEl.textContent = formatTime(whiteSeconds);
  blackClockEl.textContent = formatTime(blackSeconds);
  whiteClockEl.classList.toggle("active", game.turn() === "w");
  blackClockEl.classList.toggle("active", game.turn() === "b");
}

function startClock() {
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    if (gameOver) return;
    if (game.turn() === "w") {
      whiteSeconds -= 1;
      if (whiteSeconds <= 0) endByTime("Black wins on time");
    } else {
      blackSeconds -= 1;
      if (blackSeconds <= 0) endByTime("White wins on time");
    }
    updateClocks();
  }, 1000);
}

function stopClock() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function endByTime(message) {
  gameOver = true;
  stopClock();
  statusEl.textContent = message;
}

function resetGame() {
  stopClock();
  game.reset();
  selected = null;
  legalTargets = [];
  whiteSeconds = 300;
  blackSeconds = 300;
  gameOver = false;
  renderBoard();
  renderMoves();
  updateClocks();
  updateStatus();
  startClock();
}

document.querySelector("#newGameBtn").addEventListener("click", resetGame);
document.querySelector("#resignBtn").addEventListener("click", () => {
  if (gameOver) return;
  gameOver = true;
  stopClock();
  statusEl.textContent = "You resigned — Black wins";
});
document.querySelector("#drawBtn").addEventListener("click", () => {
  if (!gameOver) statusEl.textContent = "Draw offer sent";
});
document.querySelector("#walletBtn").addEventListener("click", () => {
  statusEl.textContent = "TON wallet connection will be enabled in the blockchain phase";
});

renderBoard();
renderMoves();
updateClocks();
updateStatus();
startClock();
