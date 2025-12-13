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
  
  // Actions
  setupBattle: (myTeam: BattlePokemon[], enemyTeam: BattlePokemon[]) => void;
  executeTurn: (playerMove: Move) => Promise<void>;
  switchPokemon: (index: number) => void;
  performEnemyTurn: () => Promise<void>; // Hàm mới: Enemy tự đánh
}

export const useBattleStore = create<BattleState>((set, get) => ({
  myTeam: [],
  enemyTeam: [],
  activePlayerIndex: 0,
  activeEnemyIndex: 0,
  logs: [],
  isPlayerTurn: true,
  winner: null,
  mustSwitch: false,

  setupBattle: (myTeam, enemyTeam) => {
    if (!myTeam || myTeam.length === 0 || !enemyTeam || enemyTeam.length === 0) return;
    set({
      myTeam,
      enemyTeam,
      activePlayerIndex: 0,
      activeEnemyIndex: 0,
      logs: [`Battle Start! Go ${myTeam[0].name}!`],
      winner: null,
      isPlayerTurn: true,
      mustSwitch: false
    });
  },

  // --- LOGIC ENEMY ĐÁNH (Được tách riêng) ---
  performEnemyTurn: async () => {
    const state = get();
    if (state.winner) return;

    const playerMon = state.myTeam[state.activePlayerIndex];
    const enemyMon = state.enemyTeam[state.activeEnemyIndex];

    // 1. Enemy chọn chiêu (Random hoặc AI đơn giản)
    const enemyMove = enemyMon.moves[0]; // Tạm lấy chiêu đầu
    
    // 2. Tính Damage
    const dmgToPlayer = calculateDamage(enemyMon, playerMon, enemyMove).damage;
    const newPlayerHp = Math.max(0, playerMon.currentHp - dmgToPlayer);

    // 3. Cập nhật State
    const newMyTeam = [...state.myTeam];
    newMyTeam[state.activePlayerIndex] = { ...playerMon, currentHp: newPlayerHp };

    set(s => ({ 
      myTeam: newMyTeam,
      logs: [...s.logs, `Enemy ${enemyMon.name} used ${enemyMove.name}!`]
    }));

    // 4. Check Player Fainted?
    if (newPlayerHp === 0) {
      set(s => ({ logs: [...s.logs, `${playerMon.name} fainted!`] }));
      
      const hasAlive = newMyTeam.some(p => p.currentHp > 0);
      if (!hasAlive) {
        set({ winner: 'ENEMY', logs: [...get().logs, "You have no Pokemon left! You Lose!"] });
      } else {
        set({ mustSwitch: true, logs: [...get().logs, "Choose your next Pokemon!"] });
      }
    } else {
      // Nếu Player còn sống -> Trả lượt cho Player
      set({ isPlayerTurn: true });
    }
  },

  // --- LOGIC ĐỔI POKEMON ---
  switchPokemon: (index) => {
    const { myTeam, activePlayerIndex, mustSwitch } = get();
    if (myTeam[index].currentHp === 0 || index === activePlayerIndex) return;

    set((state) => ({
      activePlayerIndex: index,
      mustSwitch: false, // Tắt trạng thái bắt buộc
      logs: [...state.logs, `Go! ${state.myTeam[index].name}!`]
    }));
    
    // CASE 1: Đổi do bị chết (Forced) -> Được quyền đánh tiếp (New Turn)
    if (mustSwitch) {
        set({ isPlayerTurn: true });
    } 
    // CASE 2: Chủ động đổi (Manual) -> Mất lượt, Enemy đánh
    else {
        set({ isPlayerTurn: false });
        // Gọi Enemy đánh sau 1s
        setTimeout(() => get().performEnemyTurn(), 1000); 
    }
  },

  // --- LOGIC PLAYER ĐÁNH ---
  executeTurn: async (playerMove) => {
    const state = get();
    if (state.winner || state.mustSwitch || !state.isPlayerTurn) return;

    const playerMon = state.myTeam[state.activePlayerIndex];
    const enemyMon = state.enemyTeam[state.activeEnemyIndex];

    set({ isPlayerTurn: false }); // Khóa lượt

    // 1. Player Attack
    const dmgToEnemy = calculateDamage(playerMon, enemyMon, playerMove).damage;
    const newEnemyHp = Math.max(0, enemyMon.currentHp - dmgToEnemy);
    
    const newEnemyTeam = [...state.enemyTeam];
    newEnemyTeam[state.activeEnemyIndex] = { ...enemyMon, currentHp: newEnemyHp };
    
    set(s => ({ 
      enemyTeam: newEnemyTeam,
      logs: [...s.logs, `${playerMon.name} used ${playerMove.name}!`]
    }));
    
    await new Promise(r => setTimeout(r, 1000));

    // 2. Check Enemy Fainted
    if (newEnemyHp === 0) {
      set(s => ({ logs: [...s.logs, `Enemy ${enemyMon.name} fainted!`] }));
      const nextEnemyIndex = newEnemyTeam.findIndex(p => p.currentHp > 0);
      
      if (nextEnemyIndex === -1) {
        set({ winner: 'PLAYER', logs: [...get().logs, "You Win!"] });
      } else {
        // Enemy đổi Pokemon
        await new Promise(r => setTimeout(r, 1000));
        set({ 
          activeEnemyIndex: nextEnemyIndex,
          isPlayerTurn: true, 
          logs: [...get().logs, `Enemy sent out ${newEnemyTeam[nextEnemyIndex].name}!`]
        });
      }
      return;
    }

    // 3. Nếu Enemy còn sống -> Enemy đánh lại
    await get().performEnemyTurn();
  }
}));