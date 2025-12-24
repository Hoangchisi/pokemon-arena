import { BattlePokemon, Move } from "@/types/battle";

export interface ArenaViewProps {
  // Data
  myTeam: BattlePokemon[];
  enemyTeam: BattlePokemon[];
  activePlayerIndex: number;
  activeEnemyIndex: number;
  logs: string[];
  winner: 'PLAYER' | 'ENEMY' | null;
  attackingSide: 'player' | 'enemy' | null;
  
  // States
  isPlayerTurn: boolean;
  mustSwitch: boolean;
  controlView: 'main' | 'fight' | 'switch';
  pendingMechanic: 'mega' | 'gmax' | 'tera' | null;

  // Actions
  setControlView: (view: 'main' | 'fight' | 'switch') => void;
  setShowMetrics: (show: boolean) => void;
  handleAttack: (move: Move) => void;
  handleSwitch: (idx: number) => void;
  onReturnToLobby: () => void;
}