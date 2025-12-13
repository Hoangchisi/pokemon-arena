// src/lib/battle-logic.ts
import { BattlePokemon, Move } from "@/types/battle";

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