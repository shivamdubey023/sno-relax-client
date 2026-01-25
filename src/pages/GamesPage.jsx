import React, { useState } from "react";
import TicTacToe from "../components/games/TicTacToe";
import RockPaperScissors from "../components/games/RockPaperScissors";
import "../styles/Games.css";

export default function GamesPage() {
  const [game, setGame] = useState("tictactoe");

  return (
    <div className="games-page">
      <div className="games-header">
        <h1>Games</h1>
        <div className="games-tabs">
          <button
            className={game === "tictactoe" ? "active" : ""}
            onClick={() => setGame("tictactoe")}
          >
            Tic-Tac-Toe
          </button>
          <button
            className={game === "rps" ? "active" : ""}
            onClick={() => setGame("rps")}
          >
            Rock·Paper·Scissors
          </button>
        </div>
      </div>

      <div className="games-content">
        {game === "tictactoe" && <TicTacToe />}
        {game === "rps" && <RockPaperScissors />}
      </div>
    </div>
  );
}
