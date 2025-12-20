import { v4 as uuidv4 } from 'uuid';
import { BattlePokemon, Move } from '@/types/battle';
import { TeamMember } from '@/types/pokemon'; // Hoặc type từ DB schema của bạn

// --- CACHE LAYER ---
// Lưu trữ tạm thời các move đã fetch để tránh gọi API lặp lại
// Key: moveName, Value: Move Object
const moveCache = new Map<string, Move>();

// Hàm fetch chi tiết 1 Move từ API
const fetchMoveData = async (moveName: string): Promise<Move> => {
  const formattedName = moveName.toLowerCase().replace(/ /g, '-');

  // 1. Kiểm tra Cache trước
  if (moveCache.has(formattedName)) {
    return moveCache.get(formattedName)!;
  }

  try {
    // 2. Gọi API nếu chưa có trong cache
    const res = await fetch(`https://pokeapi.co/api/v2/move/${formattedName}`);
    if (!res.ok) throw new Error(`Move not found: ${moveName}`);
    
    const data = await res.json();

    // 3. Map dữ liệu API sang Type của mình
    const moveData: Move = {
      id: data.id,
      name: data.name, // Tên gốc (thunderbolt)
      type: data.type.name, // electric
      power: data.power || 0, // Status move có power = null -> chuyển thành 0
      accuracy: data.accuracy || 100, // Một số chiêu tất trúng có accuracy null -> cho là 100
      pp: data.pp,
      priority: data.priority,
      category: data.damage_class.name as 'physical' | 'special' | 'status', // Rất quan trọng để tính damage
    };

    // 4. Lưu vào Cache
    moveCache.set(formattedName, moveData);
    
    return moveData;
  } catch (error) {
    console.warn(`Failed to fetch move ${moveName}, using Struggle fallback.`);
    // Fallback nếu API lỗi: Trả về chiêu "Struggle" mặc định để không crash game
    return {
      id: 'fallback',
      name: moveName, // Giữ tên cũ để debug
      type: 'normal',
      power: 50,
      accuracy: 100,
      pp: 0,
      category: 'physical'
    };
  }
};

// --- MAIN MAPPER FUNCTION ---
// Chuyển đổi dữ liệu từ DB/TeamBuilder sang BattlePokemon
export const mapToBattlePokemon = async (
  source: TeamMember | any // Chấp nhận cả dữ liệu từ DB Prisma
): Promise<BattlePokemon> => {
  
  // Lấy danh sách tên move (từ DB là moves: string[])
  // Nếu source từ DB Prisma, moves có thể là { move1: '...', move2: '...' } -> cần convert sang array trước
  const moveNames: string[] = source.selectedMoves 
    ? source.selectedMoves 
    : [source.move1, source.move2, source.move3, source.move4].filter(Boolean); // Lọc bỏ null

  // Fetch song song tất cả các moves
  const moveObjects = await Promise.all(
    moveNames.map((name) => fetchMoveData(name))
  );

  return {
    id: uuidv4(), // Tạo ID mới cho instance trong trận
    pokedexId: source.pokedexId || source.id,
    name: source.name,
    types: source.types,
    sprite: source.sprite || source.spriteUrl, // Handle naming khác nhau giữa các nguồn
    backSprite: source.sprite || source.spriteUrl, // API thường chỉ có front, tạm dùng front cho back
    level: 50,
    selectedTeraType: source.teraType || source.types[0],
    
    // Setup Stats ban đầu
    currentHp: source.stats?.hp || source.hp, // Handle naming stats
    maxHp: source.stats?.hp || source.hp,
    
    stats: {
      hp: source.stats?.hp || source.hp,
      attack: source.stats?.attack || source.attack,
      defense: source.stats?.defense || source.defense,
      spAtk: source.stats?.spAtk || source.spAtk,
      spDef: source.stats?.spDef || source.spDef,
      speed: source.stats?.speed || source.speed,
    },

    moves: moveObjects, // Đã có đầy đủ data: power, category...
    status: null,
    isFlinched: false
  };
};

// Hàm Helper để Map cả đội hình (Dùng cho hàm Init Battle)
export const mapTeamToBattleTeam = async (team: any[]): Promise<BattlePokemon[]> => {
  return Promise.all(team.map(member => mapToBattlePokemon(member)));
};