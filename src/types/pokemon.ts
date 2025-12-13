export interface PokeStats {
  hp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
}

// Định nghĩa mới cho Move
export interface MoveData {
  name: string;
  type: string; // Thêm trường này để tô màu
}

export interface PokemonData {
  id: number;
  name: string;
  types: string[];
  sprite: string;
  stats: PokeStats;
  moves: MoveData[]; // Sửa từ string[] thành MoveData[]
}

export interface TeamMember extends PokemonData {
  selectedMoves: string[]; 
  uuid: string;
}