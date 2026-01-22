
export interface GameState {
  oxygen: number;
  health: number;
  power: number;
  location: string;
  inventory: string[];
  turnCount: number;
  isGameOver: boolean;
  history: Array<{
    role: 'gm' | 'player';
    content: string;
    actions?: string[];
  }>;
}

export interface GMResponse {
  narrative: string;
  suggestedActions: string[];
  locationUpdate: string;
  itemFound?: string;
  healthDelta?: number;
  powerDelta?: number;
}
