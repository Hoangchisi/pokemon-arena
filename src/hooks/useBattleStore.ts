import { create } from 'zustand';
import { BattlePokemon, Move, TransformationState } from '@/types/battle';
import { calculateDamage, handleMegaEvolution, handleGigantamax, handleTerastallize } from '@/lib/battle-logic';

// --- DANH SÁCH BACKGROUND ---
const ARENA_BACKGROUNDS = [
  "/backgrounds/arena/bg-1.png",
  "/backgrounds/arena/bg-2.png",
  "/backgrounds/arena/bg-3.png",
  "/backgrounds/arena/bg-4.png",
  "/backgrounds/arena/bg-5.png",
];

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

  // --- STATE MỚI ---
  battleBackground: string | null;
  pendingPlayerTransformation: TransformationState | null;
  pendingEnemyTransformation: TransformationState | null;
  currentMusic: string | null;

  // Trạng thái đã dùng cơ chế biến hình (Mega/Gmax/Tera) chưa
  playerUsedMechanics: {
    mega: boolean;
    gmax: boolean;
    tera: boolean;
  };

  setupBattle: (myTeam: BattlePokemon[], enemyTeam: BattlePokemon[]) => void;
  // Cập nhật signature hàm executeTurn để nhận thêm tham số transformation
  executeTurn: (playerMove: Move, playerTransformation?: 'mega' | 'gmax' | 'tera' | null) => Promise<void>;
  switchPokemon: (index: number) => void;
  performEnemyTurn: (lockedMove?: Move) => Promise<void>;
  applyTransformation: (side: 'player' | 'enemy', formType: 'mega' | 'gmax') => void;
  applyTerastallize: (side: 'player' | 'enemy', teraType: string) => void;
  setMusicTrack: (track: string | null) => void;
}

const getEffectivenessText = (effectiveness: number, pokemonName: string) => {
  if (effectiveness === 0) return `It doesn't affect ${pokemonName}...`;
  if (effectiveness > 0 && effectiveness < 1) return "It's not very effective...";
  if (effectiveness > 1) return "It's super effective!";
  return null;
};

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
  battleBackground: null,
  pendingPlayerTransformation: null,
  pendingEnemyTransformation: null,
  currentMusic: null,
  playerUsedMechanics: { mega: false, gmax: false, tera: false },

  setupBattle: (myTeam, enemyTeam) => {
    if (!myTeam || myTeam.length === 0 || !enemyTeam || enemyTeam.length === 0) return;

    const randomBg = ARENA_BACKGROUNDS[Math.floor(Math.random() * ARENA_BACKGROUNDS.length)];

    set({
      myTeam, enemyTeam, activePlayerIndex: 0, activeEnemyIndex: 0,
      logs: [`Battle Start! Go ${myTeam[0].name}!`],
      winner: null, isPlayerTurn: true, mustSwitch: false, attackingSide: null,
      battleBackground: randomBg,
      pendingPlayerTransformation: null,
      pendingEnemyTransformation: null,
      currentMusic: null,
      playerUsedMechanics: { mega: false, gmax: false, tera: false },
    });
  },

  applyTransformation: (side, formType) => {
    set((state) => {
      const teamKey = side === 'player' ? 'myTeam' : 'enemyTeam';
      const activeIdx = side === 'player' ? state.activePlayerIndex : state.activeEnemyIndex;
      const newTeam = [...state[teamKey]];
      const pokemon = { ...newTeam[activeIdx] };
      const originalName = pokemon.name;

      if (formType === 'mega') {
        const transformed = handleMegaEvolution(pokemon);
        Object.assign(pokemon, transformed);
        pokemon.transformation = { ...pokemon.transformation, form: 'mega' };
      } else if (formType === 'gmax') {
        // --- BACKUP DỮ LIỆU GỐC TRƯỚC KHI BIẾN HÌNH ---
        const originalSprite = pokemon.sprite;
        const originalBackSprite = pokemon.backSprite;
        const originalMoves = pokemon.moves.map(m => ({ ...m })); // Deep copy moves

        const transformed = handleGigantamax(pokemon);
        Object.assign(pokemon, transformed);

        // handleGigantamax đã nhân đôi HP, KHÔNG nhân lần nữa ở đây (Fix lỗi 4x HP)
        pokemon.transformation = {
          form: 'gmax',
          gmaxTurnsLeft: 3,
          // Lưu backup vào state
          originalSprite,
          originalBackSprite,
          originalMoves,
          originalName
        };
      }

      pokemon.hasUsedMechanic = true;

      newTeam[activeIdx] = pokemon;
      let newMechanics = { ...state.playerUsedMechanics };
      if (side === 'player') {
        if (formType === 'mega') newMechanics.mega = true;
        if (formType === 'gmax') newMechanics.gmax = true;
      }

      return {
        [teamKey]: newTeam,
        playerUsedMechanics: newMechanics, // Cập nhật object mới
        currentMusic: "/music/metrics.mp3",
      };
    });
  },

  applyTerastallize: (side, teraType) => {
    set((state) => {
      const teamKey = side === 'player' ? 'myTeam' : 'enemyTeam';
      const activeIdx = side === 'player' ? state.activePlayerIndex : state.activeEnemyIndex;
      const newTeam = [...state[teamKey]];
      const pokemon = { ...newTeam[activeIdx] };

      const terastallized = handleTerastallize(pokemon, teraType);
      Object.assign(pokemon, terastallized);

      pokemon.terastallize = {
        isTerastallized: true,
        teraType: teraType
      };

      pokemon.hasUsedMechanic = true;

      newTeam[activeIdx] = pokemon;
      let newMechanics = { ...state.playerUsedMechanics };
      if (side === 'player') {
        newMechanics.tera = true;
      }

      return {
        [teamKey]: newTeam,
        playerUsedMechanics: newMechanics, // Cập nhật object mới
      };
    });
  },

  switchPokemon: (index) => {
    const { myTeam, enemyTeam, activePlayerIndex, activeEnemyIndex, mustSwitch } = get();
    if (myTeam[index].currentHp === 0 || index === activePlayerIndex) return;

    let lockedEnemyMove: Move | undefined = undefined;

    if (!mustSwitch) {
      const currentEnemy = enemyTeam[activeEnemyIndex];
      const currentPlayerOld = myTeam[activePlayerIndex]; // Lấy Pokemon CŨ (đang đứng sân)

      // Máy tính toán chiêu dựa trên Pokemon CŨ
      lockedEnemyMove = getSmartEnemyMove(currentEnemy, currentPlayerOld);

      // Log debug để bạn kiểm tra (F12)
      console.log(`Enemy locked move "${lockedEnemyMove.name}" against "${currentPlayerOld.name}" before switch.`);
    }

    set((state) => ({
      activePlayerIndex: index,
      mustSwitch: false,
      logs: [...state.logs, `Go! ${state.myTeam[index].name}!`]
    }));

    if (mustSwitch) {
      set({ isPlayerTurn: true });
    } else {
      set({ isPlayerTurn: false });
      setTimeout(() => get().performEnemyTurn(lockedEnemyMove), 1000);
    }
  },

  executeTurn: async (playerMove, playerTransformation) => {
    const state = get();
    if (state.winner || state.mustSwitch || !state.isPlayerTurn) return;

    const pIndex = state.activePlayerIndex;
    const eIndex = state.activeEnemyIndex;

    // Lấy dữ liệu TRƯỚC khi biến hình
    const initialPlayerMon = state.myTeam[pIndex];
    const initialEnemyMon = state.enemyTeam[eIndex];

    set({ isPlayerTurn: false });
    const enemyMove = getSmartEnemyMove(initialEnemyMon, initialPlayerMon);

    // =================================================================
    // GIAI ĐOẠN 1: XỬ LÝ BIẾN HÌNH
    // =================================================================
    if (playerTransformation) {
      let transformLog = "";
      const currentMonName = state.myTeam[pIndex].name;

      if (playerTransformation === 'mega') {
        get().applyTransformation('player', 'mega');
        transformLog = `${currentMonName} Mega Evolved!`;
      } else if (playerTransformation === 'gmax') {
        get().applyTransformation('player', 'gmax');
        transformLog = `${currentMonName} Gigantamaxed!`;
      } else if (playerTransformation === 'tera') {
        const mon = state.myTeam[pIndex];
        const type = mon.selectedTeraType || mon.types[0];
        get().applyTerastallize('player', type);
        transformLog = `${currentMonName} Terastallized into ${type} type!`;
      }

      set(s => ({ logs: [...s.logs, transformLog] }));
      await new Promise(r => setTimeout(r, 1000));
    }

    // =================================================================
    // GIAI ĐOẠN 2: LẤY DỮ LIỆU MỚI NHẤT (QUAN TRỌNG)
    // =================================================================
    const currentState = get();
    const updatedPlayerMon = currentState.myTeam[pIndex];
    const currentEnemy = currentState.enemyTeam[eIndex];

    const updatedPlayerMove = updatedPlayerMon.moves.find(m => m.name === playerMove.name) || playerMove;

    // Debug để kiểm tra xem Power đã tăng chưa
    if (playerTransformation === 'gmax') {
        console.log(`Move Power Check: Old=${playerMove.power}, New=${updatedPlayerMove.power}`);
    }
    // =================================================================
    // GIAI ĐOẠN 3: TÍNH TOÁN CHIÊU THỨC
    // =================================================================
    let playerGoesFirst = false;
    const pPriority = updatedPlayerMove.priority || 0;
    const ePriority = enemyMove.priority || 0;

    if (pPriority > ePriority) playerGoesFirst = true;
    else if (ePriority > pPriority) playerGoesFirst = false;
    else {
      if (updatedPlayerMon.stats.speed > currentEnemy.stats.speed) playerGoesFirst = true;
      else if (updatedPlayerMon.stats.speed < currentEnemy.stats.speed) playerGoesFirst = false;
      else playerGoesFirst = Math.random() < 0.5;
    }

    const performAttack = async (attacker: BattlePokemon, defender: BattlePokemon, move: Move, isPlayerAttacking: boolean): Promise<boolean> => {
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
      const enemyFainted = await performAttack(updatedPlayerMon, currentEnemy, updatedPlayerMove, true);
      if (!enemyFainted) {
        const latestEnemy = get().enemyTeam[get().activeEnemyIndex];
        const latestPlayer = get().myTeam[get().activePlayerIndex];
        await performAttack(latestEnemy, latestPlayer, enemyMove, false);
      }
    } else {
      const playerFainted = await performAttack(currentEnemy, updatedPlayerMon, enemyMove, false);
      if (!playerFainted) {
        const latestPlayer = get().myTeam[get().activePlayerIndex];
        const latestEnemy = get().enemyTeam[get().activeEnemyIndex];
        await performAttack(latestPlayer, latestEnemy, updatedPlayerMove, true);
      }
    }

    // =================================================================
    // GIAI ĐOẠN 4: END TURN PHASE (XỬ LÝ REVERT GMAX)
    // =================================================================
    if (!get().winner && !get().mustSwitch) {
      const stateEnd = get();
      const endTurnPlayer = stateEnd.myTeam[stateEnd.activePlayerIndex];

      if (endTurnPlayer.transformation?.form === 'gmax') {
        const turnsLeft = (endTurnPlayer.transformation.gmaxTurnsLeft || 0) - 1;

        if (turnsLeft <= 0) {
          // --- LOGIC REVERT ---
          const revertedMon = { ...endTurnPlayer };

          // 1. Khôi phục Sprite
          if (endTurnPlayer.transformation.originalSprite) revertedMon.sprite = endTurnPlayer.transformation.originalSprite;
          if (endTurnPlayer.transformation.originalBackSprite) revertedMon.backSprite = endTurnPlayer.transformation.originalBackSprite;

          // 2. Khôi phục Moves
          if (endTurnPlayer.transformation.originalMoves) revertedMon.moves = endTurnPlayer.transformation.originalMoves;

          // 3. Reset Form
          revertedMon.transformation = { form: 'normal' };

          // 4. Reset HP (Chia đôi)
          revertedMon.currentHp = Math.ceil(revertedMon.currentHp / 2);
          revertedMon.maxHp = Math.ceil(revertedMon.maxHp / 2);
          if (revertedMon.currentHp > revertedMon.maxHp) revertedMon.currentHp = revertedMon.maxHp;
          
          if (endTurnPlayer.transformation.originalName) {
             revertedMon.name = endTurnPlayer.transformation.originalName;
          }

          const newMyTeam = [...stateEnd.myTeam];
          newMyTeam[stateEnd.activePlayerIndex] = revertedMon;

          set(s => ({
            myTeam: newMyTeam,
            logs: [...s.logs, `${revertedMon.name} returned to normal!`]
          }));
        } else {
          // Giảm lượt
          const updatedMon = {
            ...endTurnPlayer,
            transformation: { ...endTurnPlayer.transformation, gmaxTurnsLeft: turnsLeft }
          };
          const newMyTeam = [...stateEnd.myTeam];
          newMyTeam[stateEnd.activePlayerIndex] = updatedMon;
          set({ myTeam: newMyTeam });
        }
      }
      set({ isPlayerTurn: true });
    }
  },

  performEnemyTurn: async (lockedMove?: Move) => {
    const state = get();
    if (state.winner) return;

    const playerMon = state.myTeam[state.activePlayerIndex];
    const enemyMon = state.enemyTeam[state.activeEnemyIndex];
    const enemyMove = lockedMove || getSmartEnemyMove(enemyMon, playerMon);

    set({ attackingSide: 'enemy' });
    await new Promise(r => setTimeout(r, 300));

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
  },

  setMusicTrack: (track) => {
    set({ currentMusic: track });
  }
}));