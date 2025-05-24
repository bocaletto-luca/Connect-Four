"use strict";

// COSTANTI DI GIOCO
const ROWS = 6;
const COLS = 7;
const CELL_SIZE = 80; // dimensione in pixel di ogni cella
const PLAYER_PIECE = 1;
const BOT_PIECE = 2;

// Colori (grafica classica: tabellone blu, dischi rossi e gialli)
const BOARD_COLOR = "blue";
const EMPTY_COLOR = "white";
const PLAYER_COLOR = "red";
const BOT_COLOR = "yellow";

// Recupera gli elementi dal DOM
let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

let homeScreen = document.getElementById("homeScreen");
let gameInfo = document.getElementById("gameInfo");
let turnDisplay = document.getElementById("turnDisplay");
let moveCountDisplay = document.getElementById("moveCountDisplay");

let startBtn = document.getElementById("startBtn");
let recordBtn = document.getElementById("recordBtn");
let playerNameInput = document.getElementById("playerName");

// Stato del gioco
let board = [];
let gameRunning = false;
let turn = PLAYER_PIECE; // il giocatore inizia sempre
let moveCount = 0;
let playerName = "";

// Inizializza la griglia (board)
function initBoard() {
  board = [];
  for (let r = 0; r < ROWS; r++) {
    let row = [];
    for (let c = 0; c < COLS; c++) {
      row.push(0);
    }
    board.push(row);
  }
}

// Disegna la griglia del Connect Four
function drawBoard() {
  // Disegna il background (tabellone)
  ctx.fillStyle = BOARD_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Disegna le celle (cerchi)
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      let centerX = c * CELL_SIZE + CELL_SIZE / 2;
      let centerY = r * CELL_SIZE + CELL_SIZE / 2;
      let radius = CELL_SIZE / 2 - 5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = EMPTY_COLOR;
      if (board[r][c] === PLAYER_PIECE) {
        ctx.fillStyle = PLAYER_COLOR;
      } else if (board[r][c] === BOT_PIECE) {
        ctx.fillStyle = BOT_COLOR;
      }
      ctx.fill();
      ctx.strokeStyle = "black";
      ctx.stroke();
      ctx.closePath();
    }
  }
}

// Ritorna la riga disponibile più bassa per una determinata colonna
function getNextOpenRow(col) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) {
      return r;
    }
  }
  return -1; // colonna piena
}

// Inserisce un disco nella board
function dropPiece(row, col, piece) {
  board[row][col] = piece;
}

// Verifica se, dopo l'ultima mossa, c'è una connessione di 4 per quel pezzo
function checkWin(piece) {
  // Controllo orizzontale
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (board[r][c] === piece &&
          board[r][c + 1] === piece &&
          board[r][c + 2] === piece &&
          board[r][c + 3] === piece) {
        return true;
      }
    }
  }
  // Controllo verticale
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 3; r++) {
      if (board[r][c] === piece &&
          board[r + 1][c] === piece &&
          board[r + 2][c] === piece &&
          board[r + 3][c] === piece) {
        return true;
      }
    }
  }
  // Controllo diagonale (positiva)
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (board[r][c] === piece &&
          board[r + 1][c + 1] === piece &&
          board[r + 2][c + 2] === piece &&
          board[r + 3][c + 3] === piece) {
        return true;
      }
    }
  }
  // Controllo diagonale (negativa)
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (board[r][c] === piece &&
          board[r - 1][c + 1] === piece &&
          board[r - 2][c + 2] === piece &&
          board[r - 3][c + 3] === piece) {
        return true;
      }
    }
  }
  return false;
}

// Verifica se il tabellone è pieno (pareggio)
function isBoardFull() {
  for (let c = 0; c < COLS; c++) {
    if (getNextOpenRow(c) !== -1) return false;
  }
  return true;
}

// Gestione del click sul canvas: mossa del giocatore
canvas.addEventListener("click", function(e) {
  if (!gameRunning || turn !== PLAYER_PIECE) return;
  
  let rect = canvas.getBoundingClientRect();
  let clickX = e.clientX - rect.left;
  let col = Math.floor(clickX / CELL_SIZE);
  
  let row = getNextOpenRow(col);
  if (row === -1) return;  // colonna piena
  
  // Mossa del giocatore
  dropPiece(row, col, PLAYER_PIECE);
  moveCount++;
  drawBoard();
  
  // Controlla vittoria per il giocatore
  if (checkWin(PLAYER_PIECE)) {
    gameOver("VINCI", playerName);
    return;
  }
  
  // Pareggio?
  if (isBoardFull()) {
    gameOver("PAREGGIO", "Nessuno");
    return;
  }
  
  // Turno del bot
  turn = BOT_PIECE;
  updateTurnDisplay();
  setTimeout(botTurn, 500);
  updateTurnDisplay();
});

// Turno del bot (utilizza la funzione getBotMove definita in bot.js)
function botTurn() {
  if (!gameRunning) return;
  
  let col = getBotMove(board);
  let row = getNextOpenRow(col);
  if (row === -1) {
    // Se la colonna scelta è piena, scegli una mossa casuale valida
    let validCols = [];
    for (let c = 0; c < COLS; c++) {
      if (getNextOpenRow(c) !== -1) validCols.push(c);
    }
    col = validCols[Math.floor(Math.random() * validCols.length)];
    row = getNextOpenRow(col);
  }
  dropPiece(row, col, BOT_PIECE);
  moveCount++;
  drawBoard();
  
  if (checkWin(BOT_PIECE)) {
    gameOver("PERSO", "BOT");
    return;
  }
  
  if (isBoardFull()) {
    gameOver("PAREGGIO", "Nessuno");
    return;
  }
  
  // Ritorna il turno al giocatore
  turn = PLAYER_PIECE;
  updateTurnDisplay();
  updateMoveCount();
}

// Aggiorna il display del turno e il contatore delle mosse
function updateTurnDisplay() {
  if (turn === PLAYER_PIECE)
    turnDisplay.innerText = "Turno: " + playerName;
  else
    turnDisplay.innerText = "Turno: BOT";
}
function updateMoveCount() {
  moveCountDisplay.innerText = "Mosse: " + moveCount;
}

// Gestione della fine partita: invia il record al backend PHP e resetta il gioco
function gameOver(result, winner) {
  gameRunning = false;
  
  let recordEntry = {
    name: playerName,
    result: result, // "VINCI", "PERSO" o "PAREGGIO"
    moves: moveCount,
    winner: winner,
    date: new Date().toLocaleString()
  };
  
  // Invia il record al server (chiamata POST al file record.php)
  $.ajax({
    url: "record.php",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(recordEntry)
  })
  .done(function(response) {
    console.log("Record salvato:", response);
  })
  .fail(function(jqXHR, textStatus, errorThrown) {
    console.error("Errore nel salvataggio del record:", textStatus, errorThrown);
  });
  
  let message = "";
  if (result === "VINCI") {
    message = "Complimenti " + playerName + "! Hai vinto in " + moveCount + " mosse.";
  } else if (result === "PERSO") {
    message = "Peccato " + playerName + ", il BOT ha vinto in " + moveCount + " mosse.";
  } else {
    message = "Il gioco è finito in pareggio dopo " + moveCount + " mosse.";
  }
  alert("Game Over! " + message);
  resetGame();
}

// Resetta il gioco e torna alla schermata iniziale
function resetGame() {
  initBoard();
  moveCount = 0;
  turn = PLAYER_PIECE;
  updateTurnDisplay();
  updateMoveCount();
  drawBoard();
  homeScreen.style.display = "block";
  gameInfo.classList.add("hidden");
  canvas.classList.add("hidden");
}

// Avvia la partita: verifica il nome, visualizza il canvas, e inizializza il gioco
function startGame() {
  playerName = playerNameInput.value.trim();
  if (playerName === "") {
    alert("Inserisci il tuo nome per iniziare la partita.");
    return;
  }
  homeScreen.style.display = "none";
  gameInfo.classList.remove("hidden");
  canvas.classList.remove("hidden");
  initBoard();
  moveCount = 0;
  turn = PLAYER_PIECE;
  updateTurnDisplay();
  updateMoveCount();
  drawBoard();
  gameRunning = true;
}

// Carica i record dal server (file record.json tramite record.php)
function loadRecords() {
  $.ajax({
    url: "record.php",
    method: "GET",
    dataType: "json"
  })
  .done(function(data) {
    let recordList = $("#recordList");
    recordList.empty();
    // Ordina per numero di mosse (minore è migliore)
    data.sort((a, b) => a.moves - b.moves);
    data.forEach(function(record) {
      let li = $("<li>")
                  .addClass("list-group-item bg-dark text-white")
                  .text(record.name + " - " + record.result + " (Mosse: " + record.moves + ") - Vincitore: " + record.winner + " - " + record.date);
      recordList.append(li);
    });
  })
  .fail(function(jqXHR, textStatus, errorThrown) {
    console.error("Errore nel caricamento dei record:", textStatus, errorThrown);
  });
}

// Mostra il modal dei record (i dati vengono caricati dal server)
function showRecords() {
  loadRecords();
  $("#recordModal").modal("show");
}

// Binding dei pulsanti
startBtn.addEventListener("click", startGame);
recordBtn.addEventListener("click", showRecords);
