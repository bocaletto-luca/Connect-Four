"use strict";

// COSTANTI per il bot (devono corrispondere a main.js)
const ROWS_BOT = 6;
const COLS_BOT = 7;
const PLAYER_PIECE_BOT = 1;
const BOT_PIECE_BOT = 2;

/**
 * Ritorna il primo indice di riga libero nella colonna passata
 */
function getNextOpenRow(board, col) {
  for (let r = ROWS_BOT - 1; r >= 0; r--) {
    if (board[r][col] === 0) {
      return r;
    }
  }
  return -1;
}

/**
 * Effettua una copia profonda della board
 */
function copyBoard(board) {
  return board.map(row => row.slice());
}

/**
 * Controlla se il pezzo passato (PLAYER_PIECE_BOT o BOT_PIECE_BOT)
 * ha una connessione di 4 nella board passata.
 */
function checkWin(board, piece) {
  // Orizzontale
  for (let r = 0; r < ROWS_BOT; r++) {
    for (let c = 0; c < COLS_BOT - 3; c++) {
      if (board[r][c] === piece &&
          board[r][c + 1] === piece &&
          board[r][c + 2] === piece &&
          board[r][c + 3] === piece)
        return true;
    }
  }
  // Verticale
  for (let c = 0; c < COLS_BOT; c++) {
    for (let r = 0; r < ROWS_BOT - 3; r++) {
      if (board[r][c] === piece &&
          board[r + 1][c] === piece &&
          board[r + 2][c] === piece &&
          board[r + 3][c] === piece)
        return true;
    }
  }
  // Diagonale positiva
  for (let r = 0; r < ROWS_BOT - 3; r++) {
    for (let c = 0; c < COLS_BOT - 3; c++) {
      if (board[r][c] === piece &&
          board[r + 1][c + 1] === piece &&
          board[r + 2][c + 2] === piece &&
          board[r + 3][c + 3] === piece)
        return true;
    }
  }
  // Diagonale negativa
  for (let r = 3; r < ROWS_BOT; r++) {
    for (let c = 0; c < COLS_BOT - 3; c++) {
      if (board[r][c] === piece &&
          board[r - 1][c + 1] === piece &&
          board[r - 2][c + 2] === piece &&
          board[r - 3][c + 3] === piece)
        return true;
    }
  }
  return false;
}

/**
 * Restituisce la colonna scelta dal bot.
 * Algoritmo:
 * 1. Per ogni mossa valida, se il bot può vincere immediatamente, la ritorna.
 * 2. Altrimenti, se il giocatore potrebbe vincere nella prossima mossa, blocca quella mossa.
 * 3. Se nessuna di queste condizioni, sceglie una colonna valida in maniera casuale.
 */
function getBotMove(board) {
  let validCols = [];
  for (let c = 0; c < COLS_BOT; c++) {
    if (getNextOpenRow(board, c) !== -1) {
      validCols.push(c);
    }
  }
  
  // 1. Mossa vincente per il bot
  for (let i = 0; i < validCols.length; i++) {
    let col = validCols[i];
    let row = getNextOpenRow(board, col);
    let tempBoard = copyBoard(board);
    tempBoard[row][col] = BOT_PIECE_BOT;
    if (checkWin(tempBoard, BOT_PIECE_BOT)) {
      return col;
    }
  }
  
  // 2. Blocca una mossa vincente del giocatore
  for (let i = 0; i < validCols.length; i++) {
    let col = validCols[i];
    let row = getNextOpenRow(board, col);
    let tempBoard = copyBoard(board);
    tempBoard[row][col] = PLAYER_PIECE_BOT;
    if (checkWin(tempBoard, PLAYER_PIECE_BOT)) {
      return col;
    }
  }
  
  // 3. Altrimenti, ritorna una colonna casuale valida
  return validCols[Math.floor(Math.random() * validCols.length)];
}
