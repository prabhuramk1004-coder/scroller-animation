
export type Player = 'X' | 'O' | null;

export enum GameMode {
  PVP = 'PVP',
  AI = 'AI'
}

export interface GameState {
  board: Player[];
  isXNext: boolean;
  winner: Player | 'Draw';
  winningLine: number[] | null;
  history: Player[][];
  scores: { X: number; O: number };
  mode: GameMode;
  isAiThinking: boolean;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
}
