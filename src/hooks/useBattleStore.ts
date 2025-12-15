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
  attackingSide: 'player' | 'enemy' | null;

  setupBattle: (myTeam: BattlePokemon[], enemyTeam: BattlePokemon[]) => void;
  executeTurn: (playerMove: Move) => Promise<void>;
  switchPokemon: (index: number) => void;
  // Sửa: Hàm này nhận thêm tham số move tùy chọn để ép buộc dùng chiêu đã lock
  performEnemyTurn: (lockedMove?: Move) => Promise<void>; 
}

const getEffectivenessText = (effectiveness: number, pokemonName: string) => {
  if (effectiveness === 0) return `It doesn't affect ${pokemonName}...`;
  if (effectiveness > 0 && effectiveness < 1) return "It's not very effective...";
  if (effectiveness > 1) return "It's super effective!";
  return null;
};

// AI Logic: Chọn chiêu mạnh nhất dựa trên Pokemon đang đối mặt
const getSmartEnemyMove = (attacker: BattlePokemon, defender: BattlePokemon): Move => {
  let bestMove = attacker.moves[0];
  let maxDamage = -1;

  attacker.moves.forEach((move) => {
    const result = calculateDamage(attacker, defender, move);
    if (result.damage > maxDamage) {
      maxDamage = result.damage;
      bestMove = move;
    }
  });

  if (maxDamage === 0) {
     return attacker.moves[Math.floor(Math.random() * attacker.moves.length)];
  }
  return bestMove;
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
  attackingSide: null,

  setupBattle: (myTeam, enemyTeam) => {
    if (!myTeam || myTeam.length === 0 || !enemyTeam || enemyTeam.length === 0) return;
    set({
      myTeam, enemyTeam, activePlayerIndex: 0, activeEnemyIndex: 0,
      logs: [`Battle Start! Go ${myTeam[0].name}!`],
      winner: null, isPlayerTurn: true, mustSwitch: false, attackingSide: null
    });
  },

  // --- LOGIC SWITCH POKEMON (SỬA ĐỔI QUAN TRỌNG) ---
  switchPokemon: (index) => {
    const { myTeam, enemyTeam, activePlayerIndex, activeEnemyIndex, mustSwitch } = get();
    if (myTeam[index].currentHp === 0 || index === activePlayerIndex) return;

    // 1. Nếu là đổi chủ động (Manual Switch), AI phải chọn chiêu NGAY BÂY GIỜ
    // Dựa trên Pokemon CŨ (activePlayerIndex hiện tại)
    let lockedEnemyMove: Move | undefined = undefined;
    
    if (!mustSwitch) {
        const currentEnemy = enemyTeam[activeEnemyIndex];
        const currentPlayerOld = myTeam[activePlayerIndex]; // Pokemon sắp bị rút về
        // AI tính toán dựa trên con cũ
        lockedEnemyMove = getSmartEnemyMove(currentEnemy, currentPlayerOld);
        
        // Log debug để bạn kiểm tra (F12)
        console.log(`AI locked move: ${lockedEnemyMove.name} against ${currentPlayerOld.name}`);
    }

    // 2. Thực hiện đổi Pokemon (Cập nhật State)
    set((state) => ({
      activePlayerIndex: index,
      mustSwitch: false,
      logs: [...state.logs, `Go! ${state.myTeam[index].name}!`]
    }));
    
    // 3. Xử lý lượt tiếp theo
    if (mustSwitch) {
        // Nếu đổi do chết -> New Turn -> Player được chọn chiêu
        set({ isPlayerTurn: true });
    } else {
        // Nếu đổi chủ động -> Mất lượt -> Enemy đánh
        set({ isPlayerTurn: false });
        // Truyền chiêu đã lock vào để AI dùng đúng chiêu đó lên con mới
        setTimeout(() => get().performEnemyTurn(lockedEnemyMove), 1000); 
    }
  },

  executeTurn: async (playerMove) => {
    const state = get();
    if (state.winner || state.mustSwitch || !state.isPlayerTurn) return;

    const playerMon = state.myTeam[state.activePlayerIndex];
    const enemyMon = state.enemyTeam[state.activeEnemyIndex];

    // AI chọn chiêu ngay đầu lượt
    const enemyMove = getSmartEnemyMove(enemyMon, playerMon);

    set({ isPlayerTurn: false });

    // Speed Check
    let playerGoesFirst = true;
    if (playerMon.stats.speed > enemyMon.stats.speed) {
        playerGoesFirst = true;
    } else if (playerMon.stats.speed < enemyMon.stats.speed) {
        playerGoesFirst = false;
    } else {
        playerGoesFirst = Math.random() < 0.5;
    }

    // --- PERFORM ATTACK FUNCTION ---
    const performAttack = async (
        attacker: BattlePokemon, 
        defender: BattlePokemon, 
        move: Move, 
        isPlayerAttacking: boolean
    ): Promise<boolean> => {
        if (attacker.currentHp === 0) return false;

        set({ attackingSide: isPlayerAttacking ? 'player' : 'enemy' });
        await new Promise(r => setTimeout(r, 300)); 

        const { damage, effectiveness, isCritical } = calculateDamage(attacker, defender, move);
        const newDefenderHp = Math.max(0, defender.currentHp - damage);

        let newLogs = [...get().logs, `${attacker.name} used ${move.name}!`];
        if (isCritical) newLogs.push("A critical hit!");
        const effText = getEffectivenessText(effectiveness, defender.name);
        if (effText) newLogs.push(effText);
        newLogs.push(`It dealt ${damage} damage!`);

        if (isPlayerAttacking) {
            const newEnemyTeam = [...get().enemyTeam];
            newEnemyTeam[get().activeEnemyIndex] = { ...defender, currentHp: newDefenderHp };
            set({ enemyTeam: newEnemyTeam, logs: newLogs, attackingSide: null });
        } else {
            const newMyTeam = [...get().myTeam];
            newMyTeam[get().activePlayerIndex] = { ...defender, currentHp: newDefenderHp };
            set({ myTeam: newMyTeam, logs: newLogs, attackingSide: null });
        }

        await new Promise(r => setTimeout(r, 1000));

        if (newDefenderHp === 0) {
            set(s => ({ logs: [...s.logs, `${defender.name} fainted!`] }));
            
            if (isPlayerAttacking) {
                const newEnemyTeam = get().enemyTeam;
                const nextEnemyIndex = newEnemyTeam.findIndex(p => p.currentHp > 0);
                if (nextEnemyIndex === -1) {
                    set({ winner: 'PLAYER', logs: [...get().logs, "You Win!"] });
                } else {
                    await new Promise(r => setTimeout(r, 1000));
                    set({ activeEnemyIndex: nextEnemyIndex, isPlayerTurn: true, logs: [...get().logs, `Enemy sent out ${newEnemyTeam[nextEnemyIndex].name}!`] });
                }
            } else {
                const newMyTeam = get().myTeam;
                const hasAlive = newMyTeam.some(p => p.currentHp > 0);
                if (!hasAlive) {
                    set({ winner: 'ENEMY', logs: [...get().logs, "You Lose!"] });
                } else {
                    set({ mustSwitch: true, logs: [...get().logs, "Choose next Pokemon!"] });
                }
            }
            return true;
        }
        return false;
    };

    if (playerGoesFirst) {
        const enemyFainted = await performAttack(playerMon, enemyMon, playerMove, true);
        if (!enemyFainted) {
            const currentEnemy = get().enemyTeam[get().activeEnemyIndex];
            const currentPlayer = get().myTeam[get().activePlayerIndex];
            await performAttack(currentEnemy, currentPlayer, enemyMove, false);
            if (!get().winner && !get().mustSwitch) set({ isPlayerTurn: true });
        }
    } else {
        const playerFainted = await performAttack(enemyMon, playerMon, enemyMove, false);
        if (!playerFainted) {
            const currentPlayer = get().myTeam[get().activePlayerIndex];
            const currentEnemy = get().enemyTeam[get().activeEnemyIndex];
            await performAttack(currentPlayer, currentEnemy, playerMove, true);
            if (!get().winner && !get().mustSwitch) set({ isPlayerTurn: true });
        }
    }
  },

  // --- ENEMY TURN (Sửa đổi: Nhận lockedMove) ---
  performEnemyTurn: async (lockedMove?: Move) => {
    const state = get();
    if (state.winner) return;
    
    const playerMon = state.myTeam[state.activePlayerIndex];
    const enemyMon = state.enemyTeam[state.activeEnemyIndex];

    // ƯU TIÊN 1: Dùng chiêu đã lock (nếu có)
    // ƯU TIÊN 2: Nếu không có lock (VD: đầu trận?), AI tự tính
    const enemyMove = lockedMove || getSmartEnemyMove(enemyMon, playerMon);

    set({ attackingSide: 'enemy' });
    await new Promise(r => setTimeout(r, 300));

    // Tính Damage lên Pokemon HIỆN TẠI (Pokemon mới ra sân)
    const { damage, effectiveness, isCritical } = calculateDamage(enemyMon, playerMon, enemyMove);
    const newPlayerHp = Math.max(0, playerMon.currentHp - damage);

    let newLogs = [...state.logs, `Enemy ${enemyMon.name} used ${enemyMove.name}!`];
    if (isCritical) newLogs.push("A critical hit!");
    const effText = getEffectivenessText(effectiveness, playerMon.name);
    if (effText) newLogs.push(effText);
    newLogs.push(`It dealt ${damage} damage!`);

    const newMyTeam = [...state.myTeam];
    newMyTeam[state.activePlayerIndex] = { ...playerMon, currentHp: newPlayerHp };

    set({ myTeam: newMyTeam, logs: newLogs, attackingSide: null });

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