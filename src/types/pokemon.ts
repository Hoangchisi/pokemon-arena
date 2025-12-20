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

export interface MegaForm {
  name: string;
  sprite: string;
  backSprite?: string;
  stats: PokeStats;
  types?: string[];
}

export interface GmaxForm {
  name: string;
  sprite: string;
  backSprite?: string;
  stats: PokeStats;
  types?: string[];
}

export interface PokemonForms {
  mega?: MegaForm;
  gmax?: GmaxForm;
}

export interface PokemonData {
  id: number;
  name: string;
  types: string[];
  sprite: string;
  backSprite?: string;
  stats: PokeStats;
  moves: MoveData[]; // Sửa từ string[] thành MoveData[]
  forms?: PokemonForms;
}

export interface TeamMember extends PokemonData {
  selectedMoves: string[]; 
  uuid: string;
  selectedTeraType?: string | null; // Hệ được chọn cho Terastallize
}
