"use client";
import { useState } from "react";

// Type definitions for players
type Player = "X" | "O" | null;

// Props interface for the component
interface TicTacToeProps {
  onGameEnd: (won: boolean) => void;
}

// Main component for the Tic-Tac-Toe game with a vintage theme
export default function TicTacToe({ onGameEnd }: TicTacToeProps) {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [playerTurn, setPlayerTurn] = useState<boolean>(true); // true = player X
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<Player>(null);

  // All possible winning combinations
  const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];

  // Checks for a winner or a draw
  const checkWinner = (b: Player[]) => {
    for (let [a, c, d] of winningCombos) {
      if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
    }
    return b.every((cell) => cell) ? "draw" : null;
  };

  // Handles the player's move
  const handleClick = (index: number) => {
    if (board[index] || gameOver || !playerTurn) return;

    const newBoard = [...board];
    newBoard[index] = "X";
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result) {
      endGame(result);
    } else {
      setPlayerTurn(false);
      setTimeout(() => aiMove(newBoard), 700);
    }
  };

  // AI's move logic
  const aiMove = (currentBoard: Player[]) => {
    const ai = "O";
    const human = "X";
    let move = findBestMove(currentBoard, ai);
    if (move === null) {
      move = findBestMove(currentBoard, human);
    }
    if (move === null) {
      const empty = currentBoard
        .map((v, i) => (v ? null : i))
        .filter((v) => v !== null) as number[];
      if (empty.length > 0) {
        move = empty[Math.floor(Math.random() * empty.length)];
      }
    }

    const newBoard = [...currentBoard];
    if (move !== null) newBoard[move] = ai;
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result) {
      endGame(result);
    } else {
      setPlayerTurn(true);
    }
  };

  // Finds the best move to either win or block
  const findBestMove = (b: Player[], player: Player) => {
    for (let [a, c, d] of winningCombos) {
      const line = [b[a], b[c], b[d]];
      if (line.filter((cell) => cell === player).length === 2 && line.includes(null)) {
        return [a, c, d][line.indexOf(null)];
      }
    }
    return null;
  };

  // Ends the game and sets the winner/draw state, then calls onGameEnd
  const endGame = (result: Player | "draw") => {
    setGameOver(true);
    setWinner(result === "draw" ? null : result);
    // A win is only when the player ('X') wins. A draw or AI win is a loss.
    onGameEnd(result === 'X');
  };

  // Resets the game to its initial state
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setPlayerTurn(true);
    setGameOver(false);
    setWinner(null);
  };

  return (
    <div
      className="font-serif select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Container for the main game UI */}
      <div className="relative max-w-xl mx-auto">
        {/* Book Cover */}
        <div 
          className="relative rounded-2xl shadow-2xl transition-all duration-300 border-4 border-amber-800"
          style={{
            background:
              "linear-gradient(135deg, #DEB887 0%, #CD853F 25%, #A0522D 50%, #8B4513 75%, #654321 100%)",
            boxShadow:
              "inset 0 0 0 8px #8B4513, inset 0 0 0 12px #D4AF37, inset 0 0 0 16px #8B4513, 0 20px 40px rgba(0,0,0,0.4), 0 8px 16px rgba(0,0,0,0.3)",
          }}
        >
          {/* Paper texture and inner border */}
          <div className="p-8 rounded-lg" 
            style={{ 
              background: "linear-gradient(to bottom, #fdf8e6, #f2e7c3)", 
              border: "2px solid #8B4513" 
            }}>
            
            {/* Title Section */}
            <div className="relative z-10 text-center mb-6">
              <h1 className="text-4xl font-black mb-2 text-amber-900 tracking-wider drop-shadow-md" 
                style={{ 
                  textShadow: "1px 1px 2px rgba(255,255,255,0.4)",
                  fontFamily: 'Playfair Display, serif'
                }}>
                The Ancient Grid
              </h1>
              <p className="text-sm text-amber-800 italic mt-1 drop-shadow-sm">
                A battle of wits & symbols
              </p>
            </div>

            {/* Game Status as scroll */}
            <div className="relative z-10 text-center mb-6 h-16 flex items-center justify-center">
              {!gameOver && (
                <div 
                  className="relative rounded-full px-6 py-3 border-2 border-amber-700 shadow-md transform hover:scale-105 transition-transform inline-block"
                  style={{
                    background: "linear-gradient(to right, #fef3c7, #fde68a)",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.5)",
                  }}
                >
                  <p className="text-amber-900 font-bold text-lg">
                    {playerTurn ? "Your Turn (✗)" : "Oracle's Turn (◯)"}
                  </p>
                </div>
              )}
            </div>

            {/* Game Board Container */}
            <div 
              className="relative rounded-lg p-6 md:p-8 shadow-inner border-2 border-amber-700"
              style={{
                background: "linear-gradient(to right, #e2d1a3, #f5e6b5)",
                boxShadow: "inset 0 0 10px rgba(0,0,0,0.2)",
              }}
            >
              
              {/* Game Grid */}
              <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                {board.map((cell, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleClick(idx)}
                    className={`
                      w-20 h-20 md:w-24 md:h-24 rounded-lg shadow-md flex justify-center items-center 
                      text-4xl md:text-5xl font-black transition-all duration-300 transform-gpu
                      ${gameOver || cell 
                        ? 'cursor-not-allowed opacity-75' 
                        : 'cursor-pointer hover:scale-105 hover:shadow-xl active:scale-95'
                      }
                      ${cell === 'X' 
                        ? 'bg-gradient-to-br from-pink-300 to-pink-400 text-amber-900' 
                        : cell === 'O' 
                          ? 'bg-gradient-to-br from-green-300 to-green-400 text-amber-900' 
                          : 'bg-gradient-to-br from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700'
                      }
                    `}
                  >
                    {cell === 'X' ? '✗' : cell === 'O' ? '◯' : ''}
                  </div>
                ))}
              </div>
            </div>

            {/* Game Over and Restart Section */}
            {gameOver && (
              <div className="text-center space-y-6 mt-8">
                <div 
                  className={`rounded-lg p-6 text-2xl font-black transition-all border-4 ${winner === 'X' ? 'bg-green-100 text-green-800 border-green-500' : winner === 'O' ? 'bg-red-100 text-red-800 border-red-500' : 'bg-yellow-100 text-yellow-800 border-yellow-500'}`}
                  style={{
                    boxShadow: "0 8px 16px rgba(0,0,0,0.2), inset 0 0 10px rgba(0,0,0,0.1)",
                  }}
                >
                  {winner === "X" ? (
                    <p>🎉 Victory is yours!</p>
                  ) : winner === "O" ? (
                    <p>💀 The Oracle prevails!</p>
                  ) : (
                    <p>🤝 A draw! Honor shared!</p>
                  )}
                </div>
                
                <button
                  onClick={resetGame}
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black py-4 px-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-lg border-2 border-amber-800"
                >
                  Challenge the Oracle Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
        .font-serif {
            font-family: 'Playfair Display', serif;
        }
      `}</style>
    </div>
  );
}
