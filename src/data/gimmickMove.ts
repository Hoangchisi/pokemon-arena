// src/data/gimmickMove.ts

export interface MultiHitMove {
  name: string;
  /**
   * Mảng tỉ lệ phần trăm (%) số lần đánh.
   * - Index 0: Tỉ lệ đánh 1 hit
   * - Index 1: Tỉ lệ đánh 2 hits
   * - Index 2: Tỉ lệ đánh 3 hits
   * - ...
   * Tổng các giá trị trong mảng nên là 100.
   */
  hitDistribution: number[];
}

export const GIMMICK_MOVES: MultiHitMove[] = [
  // --- NHÓM CHIÊU ĐÁNH CỐ ĐỊNH 2 LẦN (FIXED 2 HITS) ---
  {
    name: "double-kick",
    // 0% 1 hit, 100% 2 hits
    hitDistribution: [0, 100] 
  },
  {
    name: "dual-wingbeat",
    hitDistribution: [0, 100]
  },
  {
    name: "gear-grind",
    hitDistribution: [0, 100]
  },
  {
    name: "dragon-darts",
    hitDistribution: [0, 100]
  },
  {
    name: "bonemerang",
    hitDistribution: [0, 100]
  },
  {
    name: "double-hit",
    hitDistribution: [0, 100]
  },
  {
    name: "twineedle",
    hitDistribution: [0, 100]
  },

  // --- NHÓM CHIÊU ĐÁNH CỐ ĐỊNH 3 LẦN (FIXED 3 HITS) ---
  // Lưu ý: Triple Kick/Axel thực tế check accuracy mỗi hit, nhưng về lý thuyết là chiêu 3 hit
  {
    name: "triple-kick",
    // 0% 1 hit, 0% 2 hits, 100% 3 hits (nếu trúng hết)
    hitDistribution: [0, 0, 100]
  },
  {
    name: "triple-axel",
    hitDistribution: [0, 0, 100]
  },
  {
    name: "surging-strikes",
    hitDistribution: [0, 0, 100] // Luôn crit 3 lần
  },

  // --- NHÓM CHIÊU ĐÁNH TỪ 2 ĐẾN 5 LẦN (STANDARD 2-5 HITS) ---
  // Tỉ lệ chuẩn (Gen 5+): 
  // 2 hits: ~35% | 3 hits: ~35% | 4 hits: ~15% | 5 hits: ~15%
  {
    name: "bullet-seed",
    hitDistribution: [0, 35, 35, 15, 15]
  },
  {
    name: "icicle-spear",
    hitDistribution: [0, 35, 35, 15, 15]
  },
  {
    name: "rock-blast",
    hitDistribution: [0, 35, 35, 15, 15]
  },
  {
    name: "pin-missile",
    hitDistribution: [0, 35, 35, 15, 15]
  },
  {
    name: "scale-shot",
    hitDistribution: [0, 35, 35, 15, 15]
  },
  {
    name: "tail-slap",
    hitDistribution: [0, 35, 35, 15, 15]
  },
  {
    name: "arm-thrust",
    hitDistribution: [0, 35, 35, 15, 15]
  },
  {
    name: "bone-rush",
    hitDistribution: [0, 35, 35, 15, 15]
  },
  {
    name: "fury-swipes",
    hitDistribution: [0, 35, 35, 15, 15]
  },
  {
    name: "water-shuriken",
    hitDistribution: [0, 35, 35, 15, 15]
  },

  // --- NHÓM ĐẶC BIỆT (POPULATION BOMB) ---
  // Chiêu này check accuracy 10 lần. Đây là phân phối giả định nếu accuracy không miss.
  {
    name: "population-bomb",
    // Index 9 tương ứng 10 hits (vì index bắt đầu từ 0 cho 1 hit)
    // Để đơn giản, ta gán 100% vào 10 hits nếu accuracy check thành công
    hitDistribution: [0, 0, 0, 0, 0, 0, 0, 0, 0, 100]
  },
  
  // --- NHÓM CŨ / ÍT GẶP (OLD GEN) ---
  {
    name: "double-slap",
    hitDistribution: [0, 35, 35, 15, 15]
  },
  {
    name: "comet-punch",
    hitDistribution: [0, 35, 35, 15, 15]
  },
  {
    name: "fury-attack",
    hitDistribution: [0, 35, 35, 15, 15]
  },
  {
    name: "spike-cannon",
    hitDistribution: [0, 35, 35, 15, 15]
  }
];

/**
 * Hàm lấy số lần đánh dựa trên tỉ lệ ngẫu nhiên.
 * @param moveName Tên chiêu thức
 * @returns Số lần đánh (1 nếu không phải chiêu multi-hit)
 */
export const getMultiHitCount = (moveName: string): number => {
  const move = GIMMICK_MOVES.find(m => m.name === moveName);
  
  // Nếu không phải chiêu multi-hit, mặc định đánh 1 lần
  if (!move) return 1;

  // Random số từ 0 đến 100
  const random = Math.random() * 100;
  let cumulativeChance = 0;

  // Duyệt qua mảng tỉ lệ để xem random rơi vào khoảng nào
  for (let i = 0; i < move.hitDistribution.length; i++) {
    cumulativeChance += move.hitDistribution[i];
    
    // Nếu số random nhỏ hơn mốc tích lũy, trả về số hit tương ứng
    // (i + 1 vì index bắt đầu từ 0 tương ứng với 1 hit)
    if (random <= cumulativeChance) {
      return i + 1;
    }
  }

  return 1; // Fallback an toàn
};

// =================================================================
// MỚI: HP MODIFYING MOVES (DRAIN & RECOIL)
// =================================================================

export interface HpModifyingMove {
  name: string;
  /**
   * - drain: Hồi máu dựa trên % damage gây ra (Giga Drain)
   * - recoil: Mất máu dựa trên % damage gây ra (Flare Blitz)
   * - recoil_max: Mất máu dựa trên % MAX HP bản thân (Steel Beam)
   * - suicide: Tự sát (Explosion)
   */
  type: 'drain' | 'recoil' | 'recoil_max' | 'suicide'; 
  percent: number; // Tỉ lệ % (Dựa trên Damage hoặc Max HP tùy type)
}

export const HP_MODIFYING_MOVES: HpModifyingMove[] = [
  // --- NHÓM DRAIN (HỒI MÁU) ---
  { name: "absorb", type: 'drain', percent: 50 },
  { name: "mega-drain", type: 'drain', percent: 50 },
  { name: "giga-drain", type: 'drain', percent: 50 },
  { name: "drain-punch", type: 'drain', percent: 50 },
  { name: "horn-leech", type: 'drain', percent: 50 },
  { name: "parabolic-charge", type: 'drain', percent: 50 },
  { name: "draining-kiss", type: 'drain', percent: 75 }, // Hồi 75%
  { name: "oblivion-wing", type: 'drain', percent: 75 },
  { name: "bitter-blade", type: 'drain', percent: 50 },
  { name: "matcha-gotcha", type: 'drain', percent: 50 },
  { name: "leech-life", type: 'drain', percent: 50 },

  // --- NHÓM RECOIL (PHẢN SÁT THƯƠNG) ---
  // Tự gây sát thương cho bản thân dựa trên damage deal được
  { name: "take-down", type: 'recoil', percent: 25 },
  { name: "double-edge", type: 'recoil', percent: 33 },
  { name: "submission", type: 'recoil', percent: 25 },
  { name: "brave-bird", type: 'recoil', percent: 33 },
  { name: "wood-hammer", type: 'recoil', percent: 33 },
  { name: "flare-blitz", type: 'recoil', percent: 33 },
  { name: "volt-tackle", type: 'recoil', percent: 33 },
  { name: "wave-crash", type: 'recoil', percent: 33 },
  { name: "head-smash", type: 'recoil', percent: 50 }, // Phản cực mạnh
  { name: "wild-charge", type: 'recoil', percent: 25 },
  { name: "head-charge", type: 'recoil', percent: 25 },

  // --- MỚI: NHÓM RECOIL MAX (MẤT MÁU THEO % MAX HP) ---
  { name: "steel-beam", type: 'recoil_max', percent: 50 }, // Mất 50% Max HP
  { name: "mind-blown", type: 'recoil_max', percent: 50 }, // Mất 50% Max HP
  { name: "chloroblast", type: 'recoil_max', percent: 50 }, // Mất 50% Max HP

  // --- MỚI: NHÓM SUICIDE (TỰ SÁT) ---
  { name: "explosion", type: 'suicide', percent: 100 },
  { name: "self-destruct", type: 'suicide', percent: 100 },
  { name: "misty-explosion", type: 'suicide', percent: 100 },
];

/**
 * Hàm lấy thông tin hiệu ứng Hồi máu/Phản đòn
 */
export const getHpModifier = (moveName: string): HpModifyingMove | undefined => {
  return HP_MODIFYING_MOVES.find(m => m.name === moveName);
};

// =================================================================
// TWO-TURN MOVES (CHIÊU CẦN 1 LƯỢT NẠP)
// =================================================================

export interface TwoTurnMove {
  name: string;
  message: string; // Thông báo hiển thị ở lượt nạp (VD: "absorbed light!")
}

export const TWO_TURN_MOVES: TwoTurnMove[] = [
  // Nhóm nạp năng lượng
  { name: "solar-beam", message: "absorbed light!" },
  { name: "solar-blade", message: "gathered light!" },
  { name: "meteor-beam", message: "is overflowing with space power!" },
  { name: "skull-bash", message: "tucked in its head!" },
  { name: "sky-attack", message: "became cloaked in a harsh light!" },
  { name: "razor-wind", message: "whipped up a whirlwind!" },
  { name: "ice-burn", message: "became cloaked in freezing air!" },
  { name: "freeze-shock", message: "became cloaked in a freezing light!" },
  { name: "geomancy", message: "is absorbing power!" },
  { name: "electro-shot", message: "gathered electricity!" },

  // Nhóm ẩn mình (Invulnerable - Bán bất tử)
  { name: "dig", message: "burrowed its way underground!" },
  { name: "fly", message: "flew up high!" },
  { name: "dive", message: "hid underwater!" },
  { name: "phantom-force", message: "vanished instantly!" },
  { name: "shadow-force", message: "vanished instantly!" },
  { name: "bounce", message: "bounced up high!" },
];

/**
 * Hàm lấy thông tin chiêu 2 lượt
 */
export const getTwoTurnInfo = (moveName: string): TwoTurnMove | undefined => {
  return TWO_TURN_MOVES.find(m => m.name === moveName);
};