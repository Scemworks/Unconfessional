"use client";
import React, { useState, useEffect } from "react";

// Props interface for the component
interface GuessNumProps {
  onGameEnd: (won: boolean) => void;
}

export default function GuessNum({ onGameEnd }: GuessNumProps) {
  const range = 100;
  const maxAttempts = 5;

  const [target, setTarget] = useState(0);
  const [guess, setGuess] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(maxAttempts);
  const [feedback, setFeedback] = useState("Guess the number between 1 and 100!");
  const [gameOver, setGameOver] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    setTarget(Math.floor(Math.random() * range) + 1);
    setGuess("");
    setAttemptsLeft(maxAttempts);
    setFeedback("Guess the number between 1 and 100!");
    setGameOver(false);
    setIsAnimating(false);
  };

  const handleGuess = () => {
    if (gameOver || !guess || isAnimating) return;

    const numGuess = parseInt(guess, 10);
    if (isNaN(numGuess) || numGuess < 1 || numGuess > range) {
      setFeedback(`Please enter a number between 1 and ${range}.`);
      return;
    }

    setIsAnimating(true);

    setTimeout(() => {
      if (numGuess === target) {
        setFeedback(`👑 You got it! The number was ${target}!`);
        setGameOver(true);
        onGameEnd(true); // Call onGameEnd for a win
      } else {
        const remaining = attemptsLeft - 1;
        setAttemptsLeft(remaining);

        if (remaining === 0) {
          setFeedback(`💔 Game Over. The number was ${target}.`);
          setGameOver(true);
          onGameEnd(false); // Call onGameEnd for a loss
        } else {
          setFeedback(numGuess < target ? "⬆️ Guess higher" : "⬇️ Guess lower");
        }
      }
      setIsAnimating(false);
    }, 500);

    setGuess("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleGuess();
    }
  };

  return (
    <div
      className="font-serif"
    >
      {/* Main Card */}
      <div
        className="relative w-full max-w-md p-8 rounded-2xl shadow-2xl transition-all duration-300"
        style={{
          background:
            "linear-gradient(135deg, #DEB887 0%, #CD853F 25%, #A0522D 50%, #8B4513 75%, #654321 100%)",
          boxShadow:
            "inset 0 0 0 8px #8B4513, inset 0 0 0 12px #D4AF37, inset 0 0 0 16px #8B4513, 0 20px 40px rgba(0,0,0,0.4), 0 8px 16px rgba(0,0,0,0.3)",
          border: "4px solid #654321",
        }}
      >
        {/* Decorative Borders */}
        <div
          className="absolute inset-8"
          style={{ border: "3px solid #8B4513", borderRadius: "8px" }}
        />
        <div
          className="absolute inset-12"
          style={{ border: "2px solid #D4AF37", borderRadius: "4px" }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-pink-400 border-2 border-pink-600 shadow-lg flex items-center justify-center text-3xl text-white transform rotate-45">
          ❦
        </div>

        {/* Content */}
        <div className="text-center space-y-6 relative z-10 text-amber-900">
          <h1
            className="text-4xl font-black mb-2"
            style={{ textShadow: "1px 1px 2px rgba(255,255,255,0.4)" }}
          >
            The Number Oracle
          </h1>
          <p
            className="text-sm italic"
            style={{ textShadow: "1px 1px 1px rgba(255,255,255,0.3)" }}
          >
            Divine the secret integer
          </p>

          <div className="p-4 bg-white rounded-lg text-lg border border-pink-200 shadow-inner">
            <p
              className={`font-semibold ${
                gameOver ? "text-red-700" : "text-gray-700"
              }`}
            >
              {feedback}
            </p>
          </div>

          {!gameOver && (
            <div className="space-y-4">
              <input
                type="number"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isAnimating}
                min="1"
                max={range}
                placeholder="Your sacred guess..."
                className="w-full p-3 text-center text-xl bg-pink-50 rounded-lg border-2 border-pink-200 focus:outline-none focus:border-pink-500 transition-colors placeholder-gray-400"
              />
              <button
                onClick={handleGuess}
                disabled={!guess.trim() || isAnimating}
                className="w-full py-3 px-6 text-lg font-bold rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                style={{
                  background: "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)",
                  color: "#4A2C2A",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                  borderColor: "#8B6914",
                  boxShadow: "0 6px 12px rgba(212, 175, 55, 0.3)",
                }}
              >
                {isAnimating ? "Divining..." : "Consult the Oracle"}
              </button>
              <p className="font-medium">
                Attempts Left:{" "}
                <span className="text-pink-600 font-bold">{attemptsLeft}</span>
              </p>
            </div>
          )}

          {gameOver && (
            <button
              onClick={resetGame}
              className="w-full mt-6 py-3 px-6 text-lg font-bold rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl"
              style={{
                background: "linear-gradient(135deg, #FF69B4 0%, #DC143C 100%)",
                color: "white",
                textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                borderColor: "#8B0000",
              }}
            >
              Seek Another Prophecy
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
