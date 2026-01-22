
import React, { useState, useEffect, useCallback } from 'react';
import Square from './components/Square';
import { GameMode, Player, GameState } from './types';
import { calculateWinner, THEME } from './constants';
import { getAiMove } from './services/geminiService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    board: Array(9).fill(null),
    isXNext: true,
    winner: null,
    winningLine: null,
    history: [Array(9).fill(null)],
    scores: { X: 0, O: 0 },
    mode: GameMode.PVP,
    isAiThinking: false
  });

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      board: Array(9).fill(null),
      isXNext: true,
      winner: null,
      winningLine: null,
      isAiThinking: false
    }));
  };

  const handleSquareClick = useCallback(async (i: number) => {
    if (gameState.board[i] || gameState.winner || gameState.isAiThinking) return;

    const newBoard = [...gameState.board];
    newBoard[i] = gameState.isXNext ? 'X' : 'O';

    const { winner, line } = calculateWinner(newBoard);

    setGameState(prev => {
      const newScores = { ...prev.scores };
      if (winner === 'X') newScores.X += 1;
      if (winner === 'O') newScores.O += 1;

      return {
        ...prev,
        board: newBoard,
        isXNext: !prev.isXNext,
        winner,
        winningLine: line,
        scores: newScores
      };
    });
  }, [gameState]);

  // AI Turn Logic
  useEffect(() => {
    if (
      gameState.mode === GameMode.AI && 
      !gameState.isXNext && 
      !gameState.winner && 
      !gameState.isAiThinking
    ) {
      const makeAiMove = async () => {
        setGameState(prev => ({ ...prev, isAiThinking: true }));
        try {
          // Add a small delay for "thinking" feel
          await new Promise(r => setTimeout(r, 800));
          const move = await getAiMove(gameState.board);
          handleSquareClick(move);
        } catch (error) {
          console.error("AI turn failed", error);
        } finally {
          setGameState(prev => ({ ...prev, isAiThinking: false }));
        }
      };
      makeAiMove();
    }
  }, [gameState.isXNext, gameState.mode, gameState.winner, gameState.board, handleSquareClick, gameState.isAiThinking]);

  const toggleMode = () => {
    setGameState(prev => ({
      ...prev,
      mode: prev.mode === GameMode.PVP ? GameMode.AI : GameMode.PVP,
      scores: { X: 0, O: 0 }
    }));
    resetGame();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 selection:bg-indigo-500/30">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-extrabold tracking-tighter mb-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400 bg-clip-text text-transparent">
          CHROMA XO
        </h1>
        <p className="text-slate-400 font-medium">Experience color-coded tactical combat</p>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md bg-slate-900/30 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative Background Glow */}
        <div className={`absolute -top-24 -left-24 w-48 h-48 rounded-full blur-[100px] transition-colors duration-1000 ${gameState.isXNext ? 'bg-indigo-500/20' : 'bg-rose-500/20'}`} />
        <div className={`absolute -bottom-24 -right-24 w-48 h-48 rounded-full blur-[100px] transition-colors duration-1000 ${gameState.isXNext ? 'bg-indigo-500/10' : 'bg-rose-500/10'}`} />

        {/* Score Board */}
        <div className="flex justify-between items-center mb-10 px-4">
          <div className={`flex flex-col items-center transition-transform duration-300 ${gameState.isXNext ? 'scale-110' : 'opacity-40'}`}>
            <span className={`text-sm font-bold tracking-widest uppercase mb-1 ${THEME.X.color}`}>Player X</span>
            <span className="text-4xl font-black">{gameState.scores.X}</span>
          </div>
          <div className="h-10 w-px bg-slate-800 mx-4" />
          <div className={`flex flex-col items-center transition-transform duration-300 ${!gameState.isXNext ? 'scale-110' : 'opacity-40'}`}>
            <span className={`text-sm font-bold tracking-widest uppercase mb-1 ${THEME.O.color}`}>
              {gameState.mode === GameMode.AI ? 'Gemini O' : 'Player O'}
            </span>
            <span className="text-4xl font-black">{gameState.scores.O}</span>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mb-8 text-center h-8 flex items-center justify-center">
          {gameState.winner ? (
            <div className="animate-bounce font-bold text-xl flex items-center gap-2">
              {gameState.winner === 'Draw' ? (
                <span className="text-slate-300 italic">It's a Stalemate!</span>
              ) : (
                <>
                  <span className={gameState.winner === 'X' ? THEME.X.color : THEME.O.color}>
                    {gameState.winner}
                  </span>
                  <span>VICTORY!</span>
                </>
              )}
            </div>
          ) : gameState.isAiThinking ? (
            <div className="flex items-center gap-2 text-rose-400 font-semibold italic animate-pulse">
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-rose-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1 h-1 bg-rose-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1 h-1 bg-rose-400 rounded-full animate-bounce"></div>
              </div>
              Gemini is thinking...
            </div>
          ) : (
            <div className={`flex items-center gap-2 font-semibold ${gameState.isXNext ? THEME.X.color : THEME.O.color}`}>
              <div className={`w-2 h-2 rounded-full animate-ping ${gameState.isXNext ? 'bg-indigo-500' : 'bg-rose-500'}`}></div>
              {gameState.isXNext ? 'X Turn' : 'O Turn'}
            </div>
          )}
        </div>

        {/* Board */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 relative mx-auto w-fit">
          {gameState.board.map((square, i) => (
            <Square
              key={i}
              value={square}
              onClick={() => handleSquareClick(i)}
              isWinningSquare={gameState.winningLine?.includes(i) ?? false}
              disabled={!!gameState.winner || gameState.isAiThinking}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="mt-10 flex gap-4">
          <button
            onClick={resetGame}
            className="flex-1 py-4 px-6 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
            Restart
          </button>
          <button
            onClick={toggleMode}
            className={`flex-1 py-4 px-6 rounded-2xl font-bold transition-all border flex items-center justify-center gap-2 shadow-lg ${
              gameState.mode === GameMode.AI 
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 hover:bg-rose-500/30' 
                : 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/30'
            }`}
          >
            {gameState.mode === GameMode.AI ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                Versus AI
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                PVP Local
              </>
            )}
          </button>
        </div>
      </div>

      {/* Footer / Instructions */}
      <div className="mt-8 text-slate-500 text-sm font-medium flex gap-6">
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
          Indigo starts
        </span>
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-rose-500"></div>
          Rose blocks
        </span>
      </div>
    </div>
  );
};

export default App;
