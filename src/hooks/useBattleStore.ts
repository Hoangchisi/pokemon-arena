import { create } from 'zustand';
import { BattlePokemon, Move, TransformationState } from '@/types/battle';
import { calculateDamage, handleMegaEvolution, handleGigantamax, handleTerastallize } from '@/lib/battle-logic';
import { getPokemonByName } from '@/lib/pokemon-forms';

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
  enemyUsedMechanic: boolean;

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
  enemyUsedMechanic: false,

  setupBattle: (myTeam, enemyTeam) => {
    if (!myTeam || myTeam.length === 0 || !enemyTeam || enemyTeam.length === 0) return;

    const randomBg = ARENA_BACKGROUNDS[Math.floor(Math.random() * ARENA_BACKGROUNDS.length)];
    const cleanMyTeam = JSON.parse(JSON.stringify(myTeam));
    const cleanEnemyTeam = JSON.parse(JSON.stringify(enemyTeam));

    set({
      myTeam: cleanMyTeam,
      enemyTeam: cleanEnemyTeam,
      activePlayerIndex: 0, activeEnemyIndex: 0,
      logs: [`Battle Start! Go ${myTeam[0].name}!`],
      winner: null, isPlayerTurn: true, mustSwitch: false, attackingSide: null,
      battleBackground: randomBg,
      pendingPlayerTransformation: null,
      pendingEnemyTransformation: null,
      currentMusic: null,
      playerUsedMechanics: { mega: false, gmax: false, tera: false },
      enemyUsedMechanic: false,
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
        const originalMoves = pokemon.moves.map(m => ({ ...m }));
        const originalName = pokemon.name; // Lưu tên gốc
        // -----------------------------------------------------

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
      let updateState: any = { [teamKey]: newTeam };

      if (side === 'player') {
        let newMechanics = { ...state.playerUsedMechanics };
        if (formType === 'mega') newMechanics.mega = true;
        if (formType === 'gmax') newMechanics.gmax = true;
        updateState.playerUsedMechanics = newMechanics;
      } else {
        // Nếu là Enemy thì đánh dấu enemyUsedMechanic
        updateState.enemyUsedMechanic = true;
      }

      return {
        ...updateState,
        currentMusic: "/music/metrics.mp3",
      };
    });
  },

  applyTerastallize: (side, teraType) => {
    set((state) => {
      // 1. Xác định phe
      const teamKey = side === 'player' ? 'myTeam' : 'enemyTeam';
      const activeIdx = side === 'player' ? state.activePlayerIndex : state.activeEnemyIndex;

      // 2. Clone dữ liệu để không mutate trực tiếp state cũ
      const newTeam = [...state[teamKey]];
      const pokemon = { ...newTeam[activeIdx] };

      // 3. Xử lý logic thay đổi chỉ số/hệ (Giả sử bạn có hàm helper handleTerastallize)
      // Nếu chưa có hàm này, bạn cần viết logic thay đổi type ở đây
      if (typeof handleTerastallize === 'function') {
        const terastallized = handleTerastallize(pokemon, teraType);
        Object.assign(pokemon, terastallized);
      } else {
        // Logic fallback nếu không có hàm helper: Đổi hệ trực tiếp
        pokemon.types = [teraType];
      }

      // 4. Cập nhật thông tin Tera trên Pokemon
      pokemon.terastallize = {
        isTerastallized: true,
        teraType: teraType
      };

      pokemon.hasUsedMechanic = true;
      newTeam[activeIdx] = pokemon;

      // 5. CHUẨN BỊ STATE TRẢ VỀ (QUAN TRỌNG)
      const updates: any = {
        [teamKey]: newTeam
      };

      // 6. Cập nhật cờ Global (Fix lỗi ở đây)
      if (side === 'player') {
        updates.playerUsedMechanics = {
          ...state.playerUsedMechanics,
          tera: true
        };
      } else {
        // BẮT BUỘC: Đánh dấu Enemy đã dùng mechanic
        updates.enemyUsedMechanic = true;
      }

      return updates;
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

    const initialPlayerMon = state.myTeam[state.activePlayerIndex];
    const initialEnemyMon = state.enemyTeam[state.activeEnemyIndex];

    set({ isPlayerTurn: false });

    // =================================================================
    // GIAI ĐOẠN 0: AI ENEMY BIẾN HÌNH
    // =================================================================
    if (!state.enemyUsedMechanic) {
      const eIndex = state.activeEnemyIndex;
      const enemyTeam = state.enemyTeam;
      const currentEnemy = enemyTeam[eIndex];

      // Logic: Chỉ dùng cho Pokemon cuối cùng
      const isLastPokemon = eIndex === enemyTeam.length - 1;

      if (isLastPokemon) {
        let aiAction: 'mega' | 'gmax' | 'tera' | null = null;
        let targetTeraType: string | null = null;

        // 1. Ưu tiên lấy từ config Ace Mechanic (Map từ database/npc.ts)
        if (currentEnemy.aceMechanic) {
          aiAction = currentEnemy.aceMechanic;
          // Nếu là Tera, lấy hệ Tera đã chọn hoặc mặc định là hệ chính
          if (aiAction === 'tera') {
            targetTeraType = currentEnemy.selectedTeraType || currentEnemy.types[0];
          }
        }
        // 2. Fallback: Tự động đoán nếu không có config
        else {
          const enemyData = getPokemonByName(currentEnemy.name);
          const forms = enemyData?.forms;
          if (forms) {
            if (forms.gmax) aiAction = 'gmax';
            else if (forms.mega) aiAction = 'mega';
          }
        }

        // 3. Thực thi hành động
        if (aiAction) {
          let actionLog = "";

          if (aiAction === 'tera' && targetTeraType) {
            // GỌI HÀM TERA CHO ENEMY
            get().applyTerastallize('enemy', targetTeraType);
            actionLog = `Enemy's Ace ${currentEnemy.name} Terastallized into ${targetTeraType} type!`;
          }
          else if (aiAction === 'mega' || aiAction === 'gmax') {
            // GỌI HÀM TRANSFORM
            get().applyTransformation('enemy', aiAction);
            const actionName = aiAction === 'gmax' ? 'Gigantamaxed' : 'Mega Evolved';
            actionLog = `Enemy's Ace ${currentEnemy.name} ${actionName}!`;
          }

          // Cập nhật log và chặn dùng lại
          if (actionLog) {
            set(s => ({
              logs: [...s.logs, actionLog],
              enemyUsedMechanic: true
            }));
            // Delay để người chơi kịp nhìn
            await new Promise(r => setTimeout(r, 1000));
          }
        }
      }
    }

    // =================================================================
    // GIAI ĐOẠN 1: PLAYER BIẾN HÌNH
    // =================================================================
    if (playerTransformation) {
      const pIndex = get().activePlayerIndex;
      const currentMonName = get().myTeam[pIndex].name;
      let transformLog = "";

      if (playerTransformation === 'mega') {
        get().applyTransformation('player', 'mega');
        transformLog = `${currentMonName} Mega Evolved!`;
      }
      else if (playerTransformation === 'gmax') {
        get().applyTransformation('player', 'gmax');
        transformLog = `${currentMonName} Gigantamaxed!`;
      }
      else if (playerTransformation === 'tera') {
        const mon = get().myTeam[pIndex];
        const type = mon.selectedTeraType || mon.types[0];
        get().applyTerastallize('player', type);
        transformLog = `${currentMonName} Terastallized into ${type} type!`;
      }

      set(s => ({ logs: [...s.logs, transformLog] }));
      await new Promise(r => setTimeout(r, 1000));
    }

    // =================================================================
    // GIAI ĐOẠN 2 & 3: TÍNH TOÁN VÀ CHIẾN ĐẤU (GIỮ NGUYÊN)
    // =================================================================
    const currentState = get();
    const updatedPlayerMon = currentState.myTeam[currentState.activePlayerIndex];
    const currentEnemy = currentState.enemyTeam[currentState.activeEnemyIndex];

    // Lấy lại chiêu thức (để update damage nếu vừa Gmax)
    const updatedPlayerMove = updatedPlayerMon.moves.find(m => m.name === playerMove.name) || playerMove;
    const enemyMove = getSmartEnemyMove(initialEnemyMon, initialPlayerMon);

    let playerGoesFirst = true;
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

      const moveAccuracy = move.accuracy !== undefined ? move.accuracy : 100;

      // Random từ 0 -> 100
      const hitChance = Math.random() * 100;

      // Log tên chiêu trước
      let currentLogs = [...get().logs, `${attacker.name} used ${move.name}!`];

      // 2. KIỂM TRA TRÚNG / TRƯỢT
      // Lưu ý: Các chiêu tất trúng (như Aerial Ace) hoặc đang Gmax (Max Moves tất trúng) có thể bỏ qua check này.
      // Ở đây ta làm logic cơ bản:
      let isMiss = hitChance > moveAccuracy;

      // (Tùy chọn) Max Moves của Gmax thường không bao giờ trượt (trừ Max Guard)
      if (attacker.transformation?.form === 'gmax') {
        isMiss = false;
      }

      if (isMiss) {
        // --- XỬ LÝ KHI TRƯỢT ---
        currentLogs.push(`${attacker.name}'s attack missed!`);
        set({ logs: currentLogs, attackingSide: null });
        await new Promise(r => setTimeout(r, 1000));
        return false; // Kết thúc lượt đánh, không ai chết
      }

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
        const latestState = get();
        const latestEnemy = latestState.enemyTeam[latestState.activeEnemyIndex];
        const latestPlayer = latestState.myTeam[latestState.activePlayerIndex];
        await performAttack(latestEnemy, latestPlayer, enemyMove, false);
      }
    } else {
      const playerFainted = await performAttack(currentEnemy, updatedPlayerMon, enemyMove, false);
      if (!playerFainted) {
        const latestState = get();
        const latestPlayer = latestState.myTeam[latestState.activePlayerIndex];
        const latestEnemy = latestState.enemyTeam[latestState.activeEnemyIndex];
        await performAttack(latestPlayer, latestEnemy, updatedPlayerMove, true);
      }
    }

    // =================================================================
    // GIAI ĐOẠN 4: END TURN PHASE (LOGIC TRỪ LƯỢT CHUẨN)
    // =================================================================
    if (!get().winner) {
      // Lấy state MỚI NHẤT
      const endTurnState = get();

      const nextMyTeam = [...endTurnState.myTeam];
      const nextEnemyTeam = [...endTurnState.enemyTeam];
      const pIdx = endTurnState.activePlayerIndex;
      const eIdx = endTurnState.activeEnemyIndex;

      let turnLogs: string[] = [];

      // --- PLAYER ---
      const playerMon = nextMyTeam[pIdx];
      if (playerMon.transformation?.form === 'gmax') {
        const turnsLeft = (playerMon.transformation.gmaxTurnsLeft || 0) - 1;

        if (turnsLeft <= 0) {
          // Revert Player
          const revertedMon = { ...playerMon };
          if (playerMon.transformation.originalSprite) revertedMon.sprite = playerMon.transformation.originalSprite;
          if (playerMon.transformation.originalBackSprite) revertedMon.backSprite = playerMon.transformation.originalBackSprite;
          if (playerMon.transformation.originalName) revertedMon.name = playerMon.transformation.originalName;
          if (playerMon.transformation.originalMoves) revertedMon.moves = playerMon.transformation.originalMoves;

          revertedMon.transformation = { form: 'normal' };
          revertedMon.currentHp = Math.ceil(revertedMon.currentHp / 2);
          revertedMon.maxHp = Math.ceil(revertedMon.maxHp / 2);
          if (revertedMon.currentHp > revertedMon.maxHp) revertedMon.currentHp = revertedMon.maxHp;

          nextMyTeam[pIdx] = revertedMon;
          turnLogs.push(`${revertedMon.name} returned to normal!`);
        } else {
          nextMyTeam[pIdx] = {
            ...playerMon,
            transformation: { ...playerMon.transformation, gmaxTurnsLeft: turnsLeft }
          };
        }
      }

      // --- ENEMY ---
      const enemyMon = nextEnemyTeam[eIdx];
      if (enemyMon.transformation?.form === 'gmax') {
        // Lấy số lượt hiện tại
        const currentTurns = typeof enemyMon.transformation.gmaxTurnsLeft === 'number'
          ? enemyMon.transformation.gmaxTurnsLeft
          : 0;

        // Luôn trừ 1 lượt
        const turnsLeft = currentTurns - 1;

        if (turnsLeft <= 0) {
          // Revert Enemy
          const revertedMon = { ...enemyMon };
          if (enemyMon.transformation.originalSprite) revertedMon.sprite = enemyMon.transformation.originalSprite;
          if (enemyMon.transformation.originalBackSprite) revertedMon.backSprite = enemyMon.transformation.originalBackSprite;
          if (enemyMon.transformation.originalName) revertedMon.name = enemyMon.transformation.originalName;
          if (enemyMon.transformation.originalMoves) revertedMon.moves = enemyMon.transformation.originalMoves;

          revertedMon.transformation = { form: 'normal' };
          revertedMon.currentHp = Math.ceil(revertedMon.currentHp / 2);
          revertedMon.maxHp = Math.ceil(revertedMon.maxHp / 2);
          if (revertedMon.currentHp > revertedMon.maxHp) revertedMon.currentHp = revertedMon.maxHp;

          nextEnemyTeam[eIdx] = revertedMon;
          turnLogs.push(`Enemy ${revertedMon.name} returned to normal!`);
        } else {
          nextEnemyTeam[eIdx] = {
            ...enemyMon,
            transformation: { ...enemyMon.transformation, gmaxTurnsLeft: turnsLeft }
          };
        }
      }

      set(s => ({
        myTeam: nextMyTeam,
        enemyTeam: nextEnemyTeam,
        logs: [...s.logs, ...turnLogs],
        // Chỉ trả lượt cho Player nếu KHÔNG PHẢI switch (để tránh hiện menu đè lên bảng switch)
        // Tuy nhiên, nếu mustSwitch = true, UI sẽ ưu tiên hiển thị bảng Switch nên dòng này vẫn an toàn.
        isPlayerTurn: true
      }));
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