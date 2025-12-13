import { create } from 'zustand';
import { BattlePokemon, Move } from '@/types/battle';
import { calculateDamage } from '@/lib/battle-logic';

interface BattleState {
  myTeam: BattlePokemon[];
  enemyTeam: BattlePokemon[];
  activePlayerIndex: number;
  activeEnemyIndex: number;
  logs: string[];
  isPlayerTurn: boolean;
  winner: 'PLAYER' | 'ENEMY' | null;
  mustSwitch: boolean;
  
  // --- STATE MỚI CHO ANIMATION ---
  attackingSide: 'player' | 'enemy' | null; 

  setupBattle: (myTeam: BattlePokemon[], enemyTeam: BattlePokemon[]) => void;
  executeTurn: (playerMove: Move) => Promise<void>;
  switchPokemon: (index: number) => void;
  performEnemyTurn: () => Promise<void>;
}

const getEffectivenessText = (effectiveness: number, pokemonName: string) => {
  if (effectiveness === 0) return `It doesn't affect ${pokemonName}...`;
  if (effectiveness > 0 && effectiveness < 1) return "It's not very effective...";
  if (effectiveness > 1) return "It's super effective!";
  return null;
};

export const useBattleStore = create<BattleState>((set, get) => ({
  myTeam: [],
  enemyTeam: [],
  activePlayerIndex: 0,
  activeEnemyIndex: 0,
  logs: [],
  isPlayerTurn: true,
  winner: null,
  mustSwitch: false,
  attackingSide: null, // Mặc định không ai đánh

  setupBattle: (myTeam, enemyTeam) => {
    if (!myTeam || myTeam.length === 0 || !enemyTeam || enemyTeam.length === 0) return;
    set({
      myTeam, enemyTeam, activePlayerIndex: 0, activeEnemyIndex: 0,
      logs: [`Battle Start! Go ${myTeam[0].name}!`],
      winner: null, isPlayerTurn: true, mustSwitch: false, attackingSide: null
    });
  },

  switchPokemon: (index) => {
    const { myTeam, activePlayerIndex, mustSwitch } = get();
    if (myTeam[index].currentHp === 0 || index === activePlayerIndex) return;

    set((state) => ({
      activePlayerIndex: index,
      mustSwitch: false,
      logs: [...state.logs, `Go! ${state.myTeam[index].name}!`]
    }));
    
    if (mustSwitch) {
        set({ isPlayerTurn: true });
    } else {
        set({ isPlayerTurn: false });
        setTimeout(() => get().performEnemyTurn(), 1000); 
    }
  },

  // --- LOGIC PLAYER ĐÁNH (CÓ ANIMATION) ---
  executeTurn: async (playerMove) => {
    const state = get();
    if (state.winner || state.mustSwitch || !state.isPlayerTurn) return;

    const playerMon = state.myTeam[state.activePlayerIndex];
    const enemyMon = state.enemyTeam[state.activeEnemyIndex];

    // 1. Kích hoạt Animation & Khóa lượt
    set({ isPlayerTurn: false, attackingSide: 'player' });

    // 2. Chờ 300ms cho Pokemon lao lên
    await new Promise(r => setTimeout(r, 300));

    // 3. Tính toán DMG
    const { damage, effectiveness, isCritical } = calculateDamage(playerMon, enemyMon, playerMove);
    const newEnemyHp = Math.max(0, enemyMon.currentHp - damage);
    
    let newLogs = [...state.logs, `${playerMon.name} used ${playerMove.name}!`];
    if (isCritical) newLogs.push("A critical hit!");
    const effText = getEffectivenessText(effectiveness, enemyMon.name);
    if (effText) newLogs.push(effText);

    const newEnemyTeam = [...state.enemyTeam];
    newEnemyTeam[state.activeEnemyIndex] = { ...enemyMon, currentHp: newEnemyHp };
    
    // 4. Cập nhật HP & Reset Animation (Pokemon lùi về)
    set({ 
        enemyTeam: newEnemyTeam, 
        logs: newLogs,
        attackingSide: null // <-- Reset để kích hoạt transition lùi về
    });
    
    await new Promise(r => setTimeout(r, 1000));

    if (newEnemyHp === 0) {
      set(s => ({ logs: [...s.logs, `Enemy ${enemyMon.name} fainted!`] }));
      const nextEnemyIndex = newEnemyTeam.findIndex(p => p.currentHp > 0);
      
      if (nextEnemyIndex === -1) {
        set({ winner: 'PLAYER', logs: [...get().logs, "You Win!"] });
      } else {
        await new Promise(r => setTimeout(r, 1000));
        set({ activeEnemyIndex: nextEnemyIndex, isPlayerTurn: true, logs: [...get().logs, `Enemy sent out ${newEnemyTeam[nextEnemyIndex].name}!`] });
      }
      return;
    }

    await get().performEnemyTurn();
  },

  // --- LOGIC ENEMY ĐÁNH (CÓ ANIMATION) ---
  performEnemyTurn: async () => {
    const state = get();
    if (state.winner) return;

    const playerMon = state.myTeam[state.activePlayerIndex];
    const enemyMon = state.enemyTeam[state.activeEnemyIndex];
    const enemyMove = enemyMon.moves[Math.floor(Math.random() * enemyMon.moves.length)];
    
    // 1. Kích hoạt Animation
    set({ attackingSide: 'enemy' });

    // 2. Chờ 300ms
    await new Promise(r => setTimeout(r, 300));

    // 3. Tính toán
    const { damage, effectiveness, isCritical } = calculateDamage(enemyMon, playerMon, enemyMove);
    const newPlayerHp = Math.max(0, playerMon.currentHp - damage);

    let newLogs = [...state.logs, `Enemy ${enemyMon.name} used ${enemyMove.name}!`];
    if (isCritical) newLogs.push("A critical hit!");
    const effText = getEffectivenessText(effectiveness, playerMon.name);
    if (effText) newLogs.push(effText);

    const newMyTeam = [...state.myTeam];
    newMyTeam[state.activePlayerIndex] = { ...playerMon, currentHp: newPlayerHp };

    // 4. Cập nhật HP & Reset Animation
    set({ 
        myTeam: newMyTeam, 
        logs: newLogs,
        attackingSide: null 
    });

    if (newPlayerHp === 0) {
      set(s => ({ logs: [...s.logs, `${playerMon.name} fainted!`] }));
      const hasAlive = newMyTeam.some(p => p.currentHp > 0);
      if (!hasAlive) {
        set({ winner: 'ENEMY', logs: [...get().logs, "You Lose!"] });
      } else {
        set({ mustSwitch: true, logs: [...get().logs, "Choose next Pokemon!"] });
      }
    } else {
      set({ isPlayerTurn: true });
    }
  }
}));