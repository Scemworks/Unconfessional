"use client";
import { useState, useEffect } from "react";

// Props interface for the component
interface MemoryGameProps {
  onGameEnd: (won: boolean) => void;
}

// Main component for the memory game with a refined vintage theme
export default function MemoryGame({ onGameEnd }: MemoryGameProps) {
  // Expanded pool of weird/funny emojis
  const symbols = [
    "🍕", "🦄", "💩", "🤡", "👹", "🦖", "🪳", "🛸", "👽", "🧟",
    "🤯", "🐙", "🍔", "🪼", "🍟", "🎃", "🦔", "🪱"
  ];

  // State variables for the game
  const [cards, setCards] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [pairsMatched, setPairsMatched] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(120); // more time for bigger grid
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [won, setWon] = useState<boolean>(false);

  // useEffect hook to start a new game when the component mounts
  useEffect(() => {
    startGame();
  }, []);

  // Timer logic for the game
  useEffect(() => {
    if (timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !won) {
      setGameOver(true);
      onGameEnd(false); // Call onGameEnd for a loss (time out)
    }
  }, [timeLeft, gameOver, won, onGameEnd]);

  // Function to initialize or reset the game
  const startGame = () => {
    const doubled = [...symbols, ...symbols];
    const shuffled = doubled.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setPairsMatched(0);
    setTimeLeft(120);
    setGameOver(false);
    setWon(false);
  };

  // Handler for flipping a card
  const handleFlip = (index: number) => {
    if (gameOver || flipped.length === 2 || flipped.includes(index) || matched.includes(index)) {
      return;
    }

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setTimeout(() => {
        const [first, second] = newFlipped;
        if (cards[first] === cards[second]) {
          const newMatched = [...matched, first, second];
          setMatched(newMatched);
          setPairsMatched((prev) => prev + 1);
          if (newMatched.length === cards.length) {
            setWon(true);
            setGameOver(true);
            onGameEnd(true); // Call onGameEnd for a win
          }
        }
        setFlipped([]);
      }, 700);
    }
  };

  // Helper function to format the time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="select-none font-serif"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Container for the main game UI */}
      <div className="relative max-w-4xl mx-auto">
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
                The Memory Sanctum
              </h1>
              <p className="text-sm text-amber-800 italic mt-1 drop-shadow-sm">
                Where forgotten thoughts resurface
              </p>
            </div>

            {/* Game Stats as scrolls */}
            <div className="relative z-10 flex flex-col sm:flex-row justify-center items-center gap-6 mb-6">
              <div 
                className="relative bg-white rounded-full px-6 py-3 border-2 border-amber-700 shadow-md transform hover:scale-105 transition-transform"
                style={{
                  background: "linear-gradient(to right, #fef3c7, #fde68a)",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.5)",
                }}
              >
                <p className="text-amber-900 font-bold text-lg">
                  Time Remaining:
                  <span className={`font-black ml-2 ${timeLeft <= 30 ? 'text-red-600 animate-pulse' : 'text-amber-700'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </p>
              </div>
              <div 
                className="relative bg-white rounded-full px-6 py-3 border-2 border-amber-700 shadow-md transform hover:scale-105 transition-transform"
                style={{
                  background: "linear-gradient(to right, #fef3c7, #fde68a)",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.5)",
                }}
              >
                <p className="text-amber-900 font-bold text-lg">
                  Sacred Pairs:
                  <span className="font-black ml-2 text-amber-700">{pairsMatched}</span> / {cards.length / 2}
                </p>
              </div>
            </div>

            {/* Game Board Container */}
            <div 
              className="relative rounded-lg p-6 md:p-8 shadow-inner border-2 border-amber-700"
              style={{
                background: "linear-gradient(to right, #e2d1a3, #f5e6b5)",
                boxShadow: "inset 0 0 10px rgba(0,0,0,0.2)",
              }}
            >
              
              {/* Memory Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-w-2xl mx-auto justify-items-center">
                {cards.map((card, idx) => {
                  const isFlipped = flipped.includes(idx) || matched.includes(idx);
                  const isMatched = matched.includes(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => !gameOver && handleFlip(idx)}
                      className={`
                        w-16 h-16 md:w-20 md:h-20 rounded-lg shadow-md flex justify-center items-center 
                        text-3xl md:text-4xl font-bold transition-all duration-500 transform-gpu
                        ${isFlipped 
                          ? isMatched 
                            ? 'bg-green-400 border-2 border-green-600 scale-105 animate-pulse' 
                            : 'bg-pink-300 border-2 border-pink-500'
                          : 'bg-amber-700 border-2 border-amber-800 hover:bg-amber-600 hover:scale-105 active:scale-95'
                        }
                        ${gameOver 
                          ? 'cursor-not-allowed opacity-75' 
                          : !isFlipped 
                            ? 'cursor-pointer hover:shadow-xl' 
                            : 'cursor-default'
                        }
                        select-none
                      `}
                    >
                      <div className={`transition-transform duration-500 ${isFlipped ? 'rotate-0' : 'rotate-180'}`}>
                        {isFlipped ? (
                          <span className="drop-shadow-sm">{card}</span>
                        ) : (
                          <span className="text-amber-200 text-4xl opacity-50">
                            📜
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Flipping Animation Indicator */}
              {flipped.length === 2 && !gameOver && (
                <div className="text-center mt-6">
                  <p className="text-amber-900 font-semibold animate-pulse text-xl drop-shadow-sm">
                    The memories align...
                  </p>
                </div>
              )}
            </div>

            {/* Game Over and Restart Section */}
            {gameOver && (
              <div className="text-center space-y-6 mt-8">
                <div 
                  className={`rounded-lg p-6 text-2xl font-black transition-all border-4 ${won ? 'bg-green-100 text-green-800 border-green-500' : 'bg-red-100 text-red-800 border-red-500'}`}
                  style={{
                    boxShadow: "0 8px 16px rgba(0,0,0,0.2), inset 0 0 10px rgba(0,0,0,0.1)",
                  }}
                >
                  {won ? (
                    <div>
                      <p className="mb-2">🎉 The memories have been restored!</p>
                      <p className="text-lg italic text-green-700">
                        All sacred pairs united in {formatTime(120 - timeLeft)}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="mb-2">💀 Time has claimed the memories!</p>
                      <p className="text-lg italic text-red-700">
                        Only {pairsMatched} pairs were saved from oblivion.
                      </p>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={startGame}
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black py-4 px-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-lg border-2 border-amber-800"
                >
                  Journey Into Memory Again
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
