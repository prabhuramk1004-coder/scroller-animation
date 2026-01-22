
import { Player } from './types';

export const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

export const calculateWinner = (squares: Player[]): { winner: Player | 'Draw'; line: number[] | null } => {
  for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
    const [a, b, c] = WINNING_COMBINATIONS[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  if (!squares.includes(null)) {
    return { winner: 'Draw', line: null };
  }
  return { winner: null, line: null };
};

export const THEME = {
  X: {
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    glow: 'shadow-indigo-500/50',
    gradient: 'from-indigo-500 to-blue-500'
  },
  O: {
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    glow: 'shadow-rose-500/50',
    gradient: 'from-rose-500 to-pink-500'
  }
};
