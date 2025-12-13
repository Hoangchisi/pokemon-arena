import { BattlePokemon, Move } from "@/types/battle";

// Bảng khắc hệ đơn giản (Bạn có thể mở rộng sau)
const TYPE_CHART: Record<string, string[]> = {
  fire: ["grass", "ice", "bug", "steel"],
  water: ["fire", "ground", "rock"],
  grass: ["water", "ground", "rock"],
  electric: ["water", "flying"],
  // ... thêm các hệ khác
};

export const getTypeEffectiveness = (moveType: string, defenderTypes: string[]): number => {
  let multiplier = 1;
  defenderTypes.forEach((type) => {
    if (TYPE_CHART[moveType.toLowerCase()]?.includes(type.toLowerCase())) {
      multiplier *= 2;
    }
    // Logic kháng hệ (0.5x) có thể thêm ở đây
  });
  return multiplier;
};

export const calculateDamage = (
  attacker: BattlePokemon,
  defender: BattlePokemon,
  move: Move
): { damage: number; isCritical: boolean; effectiveness: number } => {
  // 1. Công thức sát thương Gen 5+ (giả lập Level 50)
  // Damage = (((2 * Level / 5 + 2) * Power * A / D) / 50 + 2) * Modifier
  
  const level = 50;
  // Quyết định dùng Atk hay SpAtk dựa trên loại chiêu (giả sử physical tạm thời)
  const a = attacker.stats.attack; 
  const d = defender.stats.defense; 
  const power = move.power || 40; // Default power nếu move là status

  let damage = Math.floor(((2 * level / 5 + 2) * power * a / d) / 50 + 2);

  // 2. Modifiers
  // Critical Hit (1/24 chance)
  const isCritical = Math.random() < 0.0416;
  if (isCritical) damage = Math.floor(damage * 1.5);

  // Random (0.85 -> 1.00)
  const random = (Math.floor(Math.random() * 16) + 85) / 100;
  damage = Math.floor(damage * random);

  // STAB (Same Type Attack Bonus)
  if (attacker.types.includes(move.type)) {
    damage = Math.floor(damage * 1.5);
  }

  // Type Effectiveness
  const effectiveness = getTypeEffectiveness(move.type, defender.types);
  damage = Math.floor(damage * effectiveness);

  return { damage, isCritical, effectiveness };
};