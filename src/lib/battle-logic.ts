// src/lib/battle-logic.ts
import { BattlePokemon, Move, BattleStats } from "@/types/battle";
import { getPokemonByName, getMegaForm, getGmaxForm } from "@/lib/pokemon-forms";

// 1. Định nghĩa Bảng Khắc Hệ (Defender Type làm Key)
// 0: Vô hiệu (No Effect)
// 0.5: Không hiệu quả (Not very effective)
// 2: Siêu hiệu quả (Super effective)
// 1: Bình thường (Normal)
interface TypeMatchups {
  [key: string]: number;
}

const TYPE_CHART: Record<string, TypeMatchups> = {
  normal:   { rock: 0.5, ghost: 0, steel: 0.5 },
  fire:     { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water:    { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass:    { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice:      { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, rock: 2, dark: 2, steel: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, ghost: 0, fairy: 0.5 },
  poison:   { grass: 2, fairy: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0 },
  ground:   { fire: 2, electric: 2, poison: 2, rock: 2, steel: 2, grass: 0.5, bug: 0.5, flying: 0 },
  flying:   { grass: 2, fighting: 2, bug: 2, electric: 0.5, rock: 0.5, steel: 0.5 },
  psychic:  { fighting: 2, poison: 2, psychic: 0.5, steel: 0.5, dark: 0 },
  bug:      { grass: 2, psychic: 2, dark: 2, fire: 0.5, fighting: 0.5, poison: 0.5, flying: 0.5, ghost: 0.5, steel: 0.5, fairy: 0.5 },
  rock:     { fire: 2, ice: 2, flying: 2, bug: 2, fighting: 0.5, ground: 0.5, steel: 0.5 },
  ghost:    { psychic: 2, ghost: 2, normal: 0, dark: 0.5 },
  dragon:   { dragon: 2, steel: 0.5, fairy: 0 },
  steel:    { ice: 2, rock: 2, fairy: 2, fire: 0.5, water: 0.5, electric: 0.5, steel: 0.5 },
  dark:     { psychic: 2, ghost: 2, fighting: 0.5, dark: 0.5, fairy: 0.5 },
  fairy:    { fighting: 2, dragon: 2, dark: 2, fire: 0.5, poison: 0.5, steel: 0.5 },
};

// Hàm lấy hệ số khắc hệ
export const getTypeEffectiveness = (moveType: string, defenderTypes: string[]): number => {
  const attackType = moveType.toLowerCase();
  let multiplier = 1;

  defenderTypes.forEach((defType) => {
    const defenseType = defType.toLowerCase();
    
    // Nếu moveType có định nghĩa tương tác với defenseType thì lấy, không thì mặc định là 1
    const effectiveness = TYPE_CHART[attackType]?.[defenseType];
    
    if (effectiveness !== undefined) {
      multiplier *= effectiveness;
    }
  });

  return multiplier;
};

export const calculateDamage = (
  attacker: BattlePokemon,
  defender: BattlePokemon,
  move: Move
): { damage: number; isCritical: boolean; effectiveness: number } => {
  // Nếu là chiêu Status (buff/debuff) thì không tính dmg, không tính khắc hệ
  if (move.category === 'status') {
    return { damage: 0, isCritical: false, effectiveness: 1 };
  }

  const level = 50;
  const isPhysical = move.category === 'physical';
  const a = isPhysical ? attacker.stats.attack : attacker.stats.spAtk;
  const d = isPhysical ? defender.stats.defense : defender.stats.spDef;
  const power = move.power || 0;

  let damage = Math.floor(((2 * level / 5 + 2) * power * a / d) / 50 + 2);

  // Critical
  const isCritical = Math.random() < 0.0625;
  if (isCritical) damage = Math.floor(damage * 1.5);

  // Random
  const random = (Math.floor(Math.random() * 16) + 85) / 100;
  damage = Math.floor(damage * random);

  // STAB
  if (attacker.types.includes(move.type)) {
    damage = Math.floor(damage * 1.5);
  }

  // --- TÍNH TYPE EFFECTIVENESS ---
  const effectiveness = getTypeEffectiveness(move.type, defender.types);
  damage = Math.floor(damage * effectiveness);

  return { damage, isCritical, effectiveness };
};

/**
 * Xử lý Mega Evolution
 * - Thay đổi Sprite (dùng name + "-mega" pattern)
 * - Tăng Stats 
 * - Hiệu lực: đến hết trận đấu
 */
export const handleMegaEvolution = (pokemon: BattlePokemon): BattlePokemon => {
  if (pokemon.transformation?.form === 'mega') {
    return pokemon; // Đã là Mega rồi
  }
  // Lấy sprite từ pokedex data
  const pokemonData = getPokemonByName(pokemon.name);
  const megaForm = pokemonData?.forms?.mega;
  // 2. Xử lý Sprite (Logic mới cho cấu trúc data của bạn)
  const isShiny = pokemon.sprite.includes("/shiny/"); // Check xem con hiện tại có phải shiny không
  let megaSprite = megaForm?.sprite || pokemon.sprite.replace(/\.(png|jpg|gif)$/i, '') + '-mega.png'; // Mặc định lấy ảnh Mega thường trong data

  // Nếu con hiện tại là Shiny, ta cần biến ảnh Mega thành Shiny
  if (isShiny && megaForm?.sprite) {
    // Regex để lấy ID từ URL: khớp các số nằm giữa "/" và ".png"
    // Ví dụ: .../pokemon/10033.png -> Lấy được "10033"
    const idMatch = megaForm?.sprite.match(/\/(\d+)\.png$/);
    
    if (idMatch && idMatch[1]) {
      const megaId = idMatch[1];
      // Tạo URL Shiny thủ công
      megaSprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${megaId}.png`;
    }
  }
  // const megaSprite = megaForm?.sprite || pokemon.sprite.replace(/\.(png|jpg|gif)$/i, '') + '-mega.png';
  // Lấy Base Stats gốc (OldBaseStat) từ data
  const oldBaseStats = pokemonData?.stats || pokemon.stats;

  // 2. Tính toán Stats mới
  let newStats: BattleStats;
  const megaBackSprite = megaSprite;


  if (megaForm?.stats) {
    const newBaseStats = megaForm.stats;

    // ÁP DỤNG CÔNG THỨC: NewStat = CurrentStat - OldBase + NewBase
    newStats = {
      hp: pokemon.stats.hp, // HP luôn giữ nguyên khi Mega
      attack: Math.max(1, pokemon.stats.attack - oldBaseStats.attack + newBaseStats.attack),
      defense: Math.max(1, pokemon.stats.defense - oldBaseStats.defense + newBaseStats.defense),
      spAtk: Math.max(1, pokemon.stats.spAtk - oldBaseStats.spAtk + newBaseStats.spAtk),
      spDef: Math.max(1, pokemon.stats.spDef - oldBaseStats.spDef + newBaseStats.spDef),
      speed: Math.max(1, pokemon.stats.speed - oldBaseStats.speed + newBaseStats.speed),
    };
  } else {
    // Fallback: Nếu không có data stats của Mega thì tăng mỗi chỉ số 20 (trừ hp)
    newStats = {
      hp: pokemon.stats.hp,
      attack: Math.floor(pokemon.stats.attack + 20),
      defense: Math.floor(pokemon.stats.defense + 20),
      spAtk: Math.floor(pokemon.stats.spAtk + 20),
      spDef: Math.floor(pokemon.stats.spDef + 20),
      speed: Math.floor(pokemon.stats.speed + 20),
    };
  }

  const newTypes = megaForm?.types || pokemon.types;

  return {
    ...pokemon,
    name: megaForm?.name || `${pokemon.name} Mega`,
    sprite: megaSprite,
    backSprite: megaBackSprite,
    
    // Cập nhật Stats và Types mới
    stats: newStats,
    types: newTypes, 

    transformation: {
      form: 'mega',
      gmaxTurnsLeft: 0,
      
      // Backup toàn bộ dữ liệu gốc để có thể revert (nếu cần) hoặc tra cứu
      originalStats: pokemon.stats,
      originalName: pokemon.name,
      originalSprite: pokemon.sprite,
      originalBackSprite: pokemon.backSprite,
      originalMoves: pokemon.moves 
    },
  };
};

/**
 * Xử lý Gigantamax
 * - Thay đổi Sprite (dùng name + "-gmax" pattern)
 * - Tăng HP (x2)
 * - Hiệu lực: 3 lượt
 */
export const handleGigantamax = (pokemon: BattlePokemon): BattlePokemon => {
  if (pokemon.transformation?.form === 'gmax') {
    return pokemon; // Đã là Gmax rồi
  }

  const gmaxHpMultiplier = 2; // HP tăng gấp đôi
  const newMaxHp = Math.floor(pokemon.maxHp * gmaxHpMultiplier);
  const newCurrentHp = Math.floor(pokemon.currentHp * gmaxHpMultiplier);

  // Tăng power của tất cả moves lên 30%
  const boostedMoves = pokemon.moves.map(move => ({
    ...move,
    power: move.power > 0 ? Math.floor(move.power * 1.3) : move.power,
  }));

  // Lấy sprite từ pokedex data
  const pokemonData = getPokemonByName(pokemon.name);
  const gmaxForm = pokemonData?.forms?.gmax;
  let gmaxSprite = gmaxForm?.sprite || pokemon.sprite.replace(/\.(png|jpg|gif)$/i, '') + '-gmax.png';
  const isShiny = pokemon.sprite.includes("/shiny/"); // Check xem con hiện tại có phải shiny không

  if (isShiny && gmaxForm?.sprite) {
    // Regex để lấy ID từ URL: khớp các số nằm giữa "/" và ".png"
    // Ví dụ: .../pokemon/10033.png -> Lấy được "10033"
    const idMatch = gmaxForm?.sprite.match(/\/(\d+)\.png$/);
    
    if (idMatch && idMatch[1]) {
      const megaId = idMatch[1];
      // Tạo URL Shiny thủ công
      gmaxSprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${megaId}.png`;
    }
  }
  // Gmax backSprite: dùng chính gmaxSprite (vì backSprite sẽ flip bằng CSS)
  const gmaxBackSprite = gmaxSprite;

  return {
    ...pokemon,
    name: gmaxForm?.name || pokemon.name,
    sprite: gmaxSprite,
    backSprite: gmaxBackSprite,
    maxHp: newMaxHp,
    currentHp: newCurrentHp,
    moves: boostedMoves, // Sử dụng moves với power tăng 30%
    transformation: {
      form: 'gmax',
      gmaxTurnsLeft: 3, // Bắt đầu với 3 lượt
      originalStats: pokemon.stats, // Backup Stats gốc
      originalName: pokemon.name, // Backup Name gốc
      originalMoves: pokemon.moves, // Backup Moves gốc để revert sau
    },
  };
};

/**
 * Revert Gmax về form bình thường
 * - Quay về Stats gốc
 * - Quay về Sprite gốc
 * - Xử lý HP: Giữ tỉ lệ máu khi revert
 */
export const revertGigantamax = (pokemon: BattlePokemon): BattlePokemon => {
  if (pokemon.transformation?.form !== 'gmax' || !pokemon.transformation.originalStats) {
    return pokemon;
  }

  const originalStats = pokemon.transformation.originalStats;
  const originalName = pokemon.transformation.originalName || pokemon.name;
  const originalMaxHp = originalStats.hp;
  const originalMoves = (pokemon.transformation as any).originalMoves || pokemon.moves;

  // Giữ tỉ lệ HP: (currentHp / maxHp) * originalMaxHp
  const hpRatio = pokemon.currentHp / pokemon.maxHp;
  const newCurrentHp = Math.ceil(originalMaxHp * hpRatio);

  // Lấy sprite gốc từ pokemonData
  const pokemonData = getPokemonByName(originalName);
  const originalSprite = pokemonData?.sprite || pokemon.sprite.replace(/-gmax\.(png|jpg|gif)$/i, '.$1');
  const originalBackSprite = pokemonData?.backSprite || pokemon.backSprite?.replace(/-gmax\.(png|jpg|gif)$/i, '.$1');

  return {
    ...pokemon,
    name: originalName,
    sprite: originalSprite,
    backSprite: originalBackSprite,
    maxHp: originalMaxHp,
    currentHp: Math.max(1, newCurrentHp), // Luôn giữ ít nhất 1 HP
    stats: originalStats,
    moves: originalMoves, // Restore moves gốc
    transformation: {
      form: 'normal',
      gmaxTurnsLeft: 0,
      originalStats: undefined,
      originalName: undefined,
    },
  };
};

/**
 * Xử lý Terastallize
 * - Đổi types thành teraType được chọn
 * - Vĩnh viễn cho đến khi trận kết thúc hoặc bị revert
 */
export const handleTerastallize = (pokemon: BattlePokemon, teraType: string): BattlePokemon => {
  if (pokemon.terastallize?.isTerastallized) {
    return pokemon; // Đã Terastallize rồi
  }

  return {
    ...pokemon,
    types: [teraType], // Đổi types sang hệ Tera
    terastallize: {
      isTerastallized: true,
      teraType: teraType,
      originalTypes: pokemon.types, // Backup types gốc
    },
  };
};

/**
 * Revert Terastallize về form bình thường
 */
export const revertTerastallize = (pokemon: BattlePokemon): BattlePokemon => {
  if (!pokemon.terastallize?.isTerastallized || !pokemon.terastallize.originalTypes) {
    return pokemon;
  }

  return {
    ...pokemon,
    types: pokemon.terastallize.originalTypes,
    terastallize: {
      isTerastallized: false,
      teraType: null,
      originalTypes: undefined,
    },
  };
};

/**
 * Kiểm tra kết thúc lượt và xử lý Gmax countdown
 * - Giảm gmaxTurnsLeft
 * - Nếu gmaxTurnsLeft == 0 thì revert
 */
export const checkTurnEnd = (pokemon: BattlePokemon): BattlePokemon => {
  if (!pokemon.transformation || pokemon.transformation.form !== 'gmax') {
    return pokemon;
  }

  const currentTurns = pokemon.transformation.gmaxTurnsLeft || 0;
  const newGmaxTurnsLeft = Math.max(0, currentTurns - 1);

  if (newGmaxTurnsLeft === 0) {
    // Revert Gmax
    return revertGigantamax({ 
      ...pokemon, 
      transformation: { 
        ...pokemon.transformation, 
        gmaxTurnsLeft: 0 
      } 
    });
  }

  return {
    ...pokemon,
    transformation: {
      ...pokemon.transformation,
      gmaxTurnsLeft: newGmaxTurnsLeft,
    },
  };
};