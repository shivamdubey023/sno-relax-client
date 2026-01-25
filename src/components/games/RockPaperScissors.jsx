import React, { useState } from "react";
import "../../styles/Games.css";

/**
 * Possible choices for the game.
 * FUTURE:
 * - Can be extended (e.g., Rock-Paper-Scissors-Lizard-Spock)
 */
const choices = ["Rock", "Paper", "Scissors"];

/**
 * Decide the outcome of a round.
 *
 * @param {string} playerChoice
 * @param {string} botChoice
 * @returns {"win" | "lose" | "draw"}
 */
function decide(playerChoice, botChoice) {
  if (playerChoice === botChoice) return "draw";

  if (
    (playerChoice === "Rock" && botChoice === "Scissors") ||
    (playerChoice === "Scissors" && botChoice === "Paper") ||
    (playerChoice === "Paper" && botChoice === "Rock")
  ) {
    return "win";
  }

  return "lose";
}

/**
 * RockPaperScissors Game Component
 * --------------------------------
 * A multi-round Rock–Paper–Scissors game used as a
 * light, stress-relief activity inside the app.
 *
 * FUTURE ENHANCEMENTS:
 * - Track wins in user progress
 * - Add animations / sounds
 * - Difficulty levels for bot
 */
export default function RockPaperScissors() {
  const [showRoundSelect, setShowRoundSelect] = useState(true);
  const [totalRounds, setTotalRounds] = useState(null);
  const [currentRound, setCurrentRound] = useState(0);

  const [userScore, setUserScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [draws, setDraws] = useState(0);

  /**
   * Result of the current round
   * Shape:
   * {
   *   you: "Rock" | "Paper" | "Scissors",
   *   comp: "Rock" | "Paper" | "Scissors",
   *   r: "win" | "lose" | "draw"
   * }
   */
  const [result, setResult] = useState(null);

  const [message, setMessage] = useState(
    "Make your move — beat the computer!"
  );

  // Prevents multiple plays in the same round
  const [finished, setFinished] = useState(false);

  // Indicates full game series completion
  const [gameSeriesComplete, setGameSeriesComplete] = useState(false);

  /**
   * Start a new game series with selected number of rounds
   */
  function selectRounds(rounds) {
    setTotalRounds(rounds);
    setCurrentRound(1);

    // Reset scores
    setUserScore(0);
    setBotScore(0);
    setDraws(0);

    setShowRoundSelect(false);
    setGameSeriesComplete(false);
    setFinished(false);
  }

  /**
   * Play a single round
   */
  const play = (choice) => {
    if (finished) return;

    const comp = choices[Math.floor(Math.random() * choices.length)];
    const outcome = decide(choice, comp);

    if (outcome === "win") {
      setMessage(`You win! ${choice} beats ${comp} — well played 🎉`);
      setUserScore((prev) => prev + 1);
    } else if (outcome === "lose") {
      setMessage(
        `Not this time — ${comp} beats ${choice}. Keep going, you got this 💪`
      );
      setBotScore((prev) => prev + 1);
    } else {
      setMessage(`It's a draw: ${choice} vs ${comp}. Try another move!`);
      setDraws((prev) => prev + 1);
    }

    setResult({ you: choice, comp, r: outcome });
    setFinished(true);
  };

  /**
   * Move to next round or finish the series
   */
  function nextRound() {
    if (currentRound < totalRounds) {
      setCurrentRound((prev) => prev + 1);
      resetRound();
    } else {
      setGameSeriesComplete(true);
    }
  }

  /**
   * Restart the entire game (back to round selection)
   */
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
   * Reset only the current round state
   */
  const resetRound = () => {
    setResult(null);
    setMessage("Make your move — beat the computer!");
    setFinished(false);
  };

  /* ---------------- UI STATES ---------------- */

  // Round selection screen
  if (showRoundSelect) {
    return (
      <div className="game-card">
        <h3 style={{ color: "#000" }}>Rock · Paper · Scissors</h3>
        <div style={{ textAlign: "center", padding: "20px" }}>
          <p style={{ marginBottom: "30px", fontSize: "16px", fontWeight: "500" }}>
            How many rounds would you like to play?
          </p>

          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {[2, 5, 7, 10].map((r) => (
              <button
                key={r}
                onClick={() => selectRounds(r)}
                style={{
                  padding: "10px 20px",
                  fontSize: "14px",
                  cursor: "pointer",
                  borderRadius: "6px",
                }}
              >
                {r} Rounds
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Final results screen
  if (gameSeriesComplete) {
    return (
      <div className="game-card">
        <h3 style={{ color: "#000" }}>Rock · Paper · Scissors</h3>

        <div style={{ textAlign: "center", padding: "30px 20px" }}>
          <h4 style={{ marginBottom: "20px" }}>🏆 Series Complete!</h4>

          <div style={{ lineHeight: "1.8", marginBottom: "20px" }}>
            <strong>Final Score ({totalRounds} rounds)</strong>
            <div>You: {userScore}</div>
            <div>Bot: {botScore}</div>
            <div>Draws: {draws}</div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            {userScore > botScore
              ? "🎉 You're the champion! Great play!"
              : userScore === botScore
              ? "⚖️ It's a tie! Well balanced!"
              : "💪 Well played! Try again to win!"}
          </div>

          <button onClick={playAgain}>Play Again</button>
        </div>
      </div>
    );
  }

  // Active round UI
  return (
    <div className="game-card">
      <h3 style={{ color: "#000" }}>Rock · Paper · Scissors</h3>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
          fontSize: "13px",
        }}
      >
        <span>
          Round {currentRound}/{totalRounds}
        </span>
        <span>
          You: {userScore} | Bot: {botScore} | Draw: {draws}
        </span>
      </div>

      <div className="rps-message">{message}</div>

      <div className="rps-controls">
        {choices.map((c) => (
          <button
            key={c}
            onClick={() => play(c)}
            className="rps-btn"
            disabled={finished}
          >
            {c}
          </button>
        ))}
      </div>

      {result && (
        <div className="rps-result">
          You: {result.you} — CPU: {result.comp}
        </div>
      )}

      <div className="game-actions">
        {!finished ? (
          <button onClick={resetRound}>Reset</button>
        ) : (
          <button onClick={nextRound}>
            {currentRound < totalRounds ? "Next Round" : "See Results"}
          </button>
        )}
      </div>
    </div>
  );
}
