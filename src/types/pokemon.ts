export interface PokeStats {
  hp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
}

export interface PokemonData {
  id: number;
  name: string;
  types: string[];
  sprite: string;
  stats: PokeStats;
  moves: string[]; // Danh sách toàn bộ moves có thể học
}

// Dạng dữ liệu rút gọn dùng cho UI Team Slot
export interface TeamMember extends PokemonData {
  selectedMoves: string[]; // Tối đa 4 move user đã chọn
  uuid: string; // ID tạm để render list key (do 1 team có thể có 2 Pikachu)
}