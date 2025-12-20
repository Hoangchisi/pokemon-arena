// Định nghĩa cấu trúc của một Chiêu thức (Move) khi đã load đầy đủ thông tin
export interface Move {
  id: string | number; // ID từ PokeAPI
  name: string;        // Tên chiêu (VD: Thunderbolt)
  type: string;        // Hệ (electric, fire...)
  power: number;       // Sát thương (0 nếu là chiêu buff)
  accuracy: number;    // Độ chính xác (1-100)
  pp: number;          // Số lần sử dụng
  priority?: number;   // Độ ưu tiên (VD: Quick Attack là +1)
  category: 'physical' | 'special' | 'status'; // Phân loại: Vật lý / Phép / Trạng thái
  
  // Mở rộng sau này: Hiệu ứng phụ (VD: 10% gây tê liệt)
  effect_chance?: number;
  effect_target?: 'user' | 'opponent'; 
}

// Định nghĩa Chỉ số (Stats)
export interface BattleStats {
  hp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
  
  // Mở rộng sau này: Thay đổi chỉ số trong trận (Stat Stages -6 đến +6)
  accuracyModifier?: number;
  evasionModifier?: number;
}

// Định nghĩa Transformation State cho Pokemon
export interface TransformationState {
  form: 'normal' | 'mega' | 'gmax';
  gmaxTurnsLeft?: number;      // Số lượt còn lại của Gmax (0 nếu không phải Gmax)
  originalStats?: BattleStats; // Backup Stats để revert từ Mega/Gmax
  originalName?: string;       // Backup Name để revert từ Mega/Gmax     
  originalSprite?: string;
  originalBackSprite?: string;
  originalMoves?: Move[];
}

// Định nghĩa Terastallize State
export interface TerastallizeState {
  isTerastallized: boolean;
  teraType: string | null;     // Hệ được chọn cho Terastallize
  originalTypes?: string[];    // Backup types gốc
}

// Định nghĩa Pokemon khi đang tham gia trận đấu (Dynamic State)
export interface BattlePokemon {
  // --- Thông tin tĩnh (Từ DB/API) ---
  id: string;          // UUID unique cho mỗi instance trong trận
  pokedexId: number;   // ID gốc (VD: 25 cho Pikachu)
  name: string;
  types: string[];     // ['electric']
  sprite: string;      // Ảnh mặt trước (cho Enemy)
  backSprite?: string; // Ảnh mặt sau (cho Player - nếu API có hỗ trợ)
  level: number;       // Mặc định thường là 50

  // --- Thông tin động (Thay đổi liên tục) ---
  currentHp: number;
  maxHp: number;       // Cần lưu riêng để tính % thanh máu
  
  // Stats thực tế (Sau khi tính toán IV/EV/Nature - ở mức đơn giản là Base Stats)
  stats: BattleStats;
  
  // Danh sách chiêu thức (Đã convert từ string tên move sang object Move đầy đủ)
  moves: Move[]; 

  // Trạng thái bất lợi (Status Conditions - Mở rộng cho tương lai)
  status?: 'burn' | 'freeze' | 'paralyze' | 'poison' | 'sleep' | null;
  
  // Có đang bị choáng/mất lượt không?
  isFlinched?: boolean;
  
  // --- TRANSFORMATION STATE (Mega/Gmax) ---
  transformation?: TransformationState;

  // --- TERASTALLIZE STATE ---
  terastallize?: TerastallizeState;
  
  // --- TERASTALLIZE CONFIG (Chọn hệ Tera khi build team) ---
  selectedTeraType?: string | null; // Hệ được chọn cho Terastallize (set khi build team)

  hasUsedMechanic?: boolean; // Đã sử dụng Transformation hoặc Terastallize trong trận chưa
}

// (Optional) Định nghĩa kết quả của một lượt tính toán damage
// Giúp hàm calculateDamage trả về dữ liệu tường minh hơn
export interface DamageResult {
  damage: number;
  isCritical: boolean;
  effectiveness: number; // 0, 0.25, 0.5, 1, 2, 4
}