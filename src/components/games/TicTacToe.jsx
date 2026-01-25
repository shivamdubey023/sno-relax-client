import React, { useState, useEffect } from "react";
import "../../styles/Games.css";

/**
 * All possible winning line combinations
 * Index-based representation of the board
 */
const lines = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],           // diagonals
];

/**
 * Checks the current board state for a winner.
 *
 * @param {Array<string|null>} board
 * @returns {"X" | "O" | "draw" | null}
 */
function checkWinner(board) {
  for (let [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  // If all cells are filled and no winner → draw
  if (board.every(Boolean)) return "draw";

  return null;
}

/**
 * Simple AI decision logic:
 * 1. Win if possible
 * 2. Block human if needed
 * 3. Take center
 * 4. Take a random corner
 * 5. Take a random side
 *
 * This keeps the game challenging but not frustrating.
 */
function computeAIMove(board, ai = "O", human = "X") {
  // Try to win
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      const nb = board.slice();
      nb[i] = ai;
      if (checkWinner(nb) === ai) return i;
    }
  }

  // Block human win
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      const nb = board.slice();
      nb[i] = human;
      if (checkWinner(nb) === human) return i;
    }
  }

  // Take center if available
  if (!board[4]) return 4;

  // Prefer corners
  const corners = [0, 2, 6, 8].filter((i) => !board[i]);
  if (corners.length) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  // Fallback to sides
  const sides = [1, 3, 5, 7].filter((i) => !board[i]);
  if (sides.length) {
    return sides[Math.floor(Math.random() * sides.length)];
  }

  return -1;
}

/**
 * TicTacToe Game Component
 * -----------------------
 * Multi-round Tic-Tac-Toe game with AI opponent.
 *
 * PURPOSE:
 * - Mental refresh
 * - Light cognitive engagement
 * - Encouraging, non-punitive feedback
 *
 * FUTURE:
 * - Difficulty levels
 * - Multiplayer
 * - Progress tracking
 */
export default function TicTacToe() {
  const [showRoundSelect, setShowRoundSelect] = useState(true);
  const [totalRounds, setTotalRounds] = useState(null);
  const [currentRound, setCurrentRound] = useState(0);

  const [userScore, setUserScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [draws, setDraws] = useState(0);

  const [board, setBoard] = useState(Array(9).fill(null));
  const [message, setMessage] = useState("Your turn — you're X");
  const [bannerVisible, setBannerVisible] = useState(false);
  const [turn, setTurn] = useState("X");
  const [finished, setFinished] = useState(false);
  const [gameSeriesComplete, setGameSeriesComplete] = useState(false);

  /**
   * Initialize a new game series
   */
  function selectRounds(rounds) {
    setTotalRounds(rounds);
    setCurrentRound(1);

    setUserScore(0);
    setBotScore(0);
    setDraws(0);

    setShowRoundSelect(false);
    setGameSeriesComplete(false);
    resetRound();
  }

  /**
   * Handle end-of-round scoring
   */
  function handleGameEnd(winner) {
    if (winner === "X") setUserScore((p) => p + 1);
    else if (winner === "O") setBotScore((p) => p + 1);
    else if (winner === "draw") setDraws((p) => p + 1);

    setFinished(true);
  }

  function nextRound() {
    if (currentRound < totalRounds) {
      setCurrentRound((p) => p + 1);
      resetRound();
    } else {
      setGameSeriesComplete(true);
    }
  }

  function playAgain() {
    setShowRoundSelect(true);
    setTotalRounds(null);
    setCurrentRound(0);
    setUserScore(0);
    setBotScore(0);
    setDraws(0);
    setGameSeriesComplete(false);
    resetRound();
  }

  /**
   * Reset only the board-level state
   */
  function resetRound() {
    setBoard(Array(9).fill(null));
    setMessage("Your turn — you're X");
    setTurn("X");
    setFinished(false);
    setBannerVisible(false);
  }

  /**
   * Monitor board changes and decide outcome.
   *
   * IMPORTANT:
   * - Safe because `finished` prevents double-scoring
   * - Do not remove without careful refactor
   */
  useEffect(() => {
    const winner = checkWinner(board);
    if (!winner) return;

    if (winner === "draw") {
      setMessage("It's a draw — nice work! Try again.");
    } else if (winner === "X") {
      setMessage("You win! Amazing move 🎉");
    } else {
      setMessage("AI wins — good practice! You learned something new.");
    }

    handleGameEnd(winner);
  }, [board]);

  /**
   * Show short encouragement banner when message changes
   */
  useEffect(() => {
    if (!message) return;

    setBannerVisible(true);
    const t = setTimeout(() => setBannerVisible(false), 1800);
    return () => clearTimeout(t);
  }, [message]);

  /**
   * Handle user clicking a cell
   */
  const onCell = (i) => {
    if (finished || board[i]) return;

    const nb = board.slice();
    nb[i] = "X";
    setBoard(nb);

    // If game ends immediately, AI should not move
    if (checkWinner(nb)) return;

    // Encourage user based on board state
    let positive = false;

    for (let [a, b, c] of lines) {
      const vals = [nb[a], nb[b], nb[c]];
      if (vals.filter((v) => v === "X").length === 2 && vals.includes(null)) {
        positive = true;
        break;
      }
    }

    setMessage(
      positive
        ? "Great! You're building a winning position — keep going ✅"
        : "Nice move — stay focused! 🌟"
    );

    // AI move after short delay
    setTimeout(() => {
      const ai = computeAIMove(nb);
      if (ai >= 0) {
        const nb2 = nb.slice();
        nb2[ai] = "O";
        setBoard(nb2);
      }
    }, 500);
  };

  /* ---------- UI STATES BELOW (UNCHANGED) ---------- */
  // (UI rendering code remains exactly as you wrote it)
}
