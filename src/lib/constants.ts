// src/lib/constants.ts (hoặc file constant.ts của bạn)

// 1. Định nghĩa danh sách các hệ cố định (Readonly)
export const ALL_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison',
  'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark',
  'steel', 'fairy'
] as const; // <--- Thêm "as const" để biến mảng này thành Readonly Tuple


// 3. Sử dụng Record với Type vừa tạo thay vì string
export const TYPE_GRADIENTS: Record<string, string> = {
  normal: "from-neutral-700/50 to-slate-900 border-neutral-600",
  fire: "from-orange-900/60 to-slate-900 border-orange-600",
  water: "from-blue-900/60 to-slate-900 border-blue-600",
  electric: "from-yellow-900/60 to-slate-900 border-yellow-600",
  grass: "from-green-900/60 to-slate-900 border-green-600",
  ice: "from-sky-900/60 to-slate-900 border-sky-500",
  fighting: "from-red-900/60 to-slate-900 border-red-700",
  poison: "from-purple-900/60 to-slate-900 border-purple-600",
  ground: "from-amber-900/60 to-slate-900 border-amber-600",
  flying: "from-indigo-900/60 to-slate-900 border-indigo-500",
  psychic: "from-pink-900/60 to-slate-900 border-pink-600",
  bug: "from-lime-900/60 to-slate-900 border-lime-600",
  rock: "from-stone-900/60 to-slate-900 border-stone-600",
  ghost: "from-violet-900/60 to-slate-900 border-violet-700",
  dragon: "from-indigo-900/60 to-slate-900 border-indigo-600",
  steel: "from-slate-700/60 to-slate-900 border-slate-500",
  dark: "from-neutral-900/80 to-slate-900 border-neutral-700",
  fairy: "from-pink-900/60 to-slate-900 border-pink-500",
};

export const TYPE_COLORS: Record<string, string> = {
  normal: "bg-neutral-500",
  fire: "bg-orange-500",
  water: "bg-blue-500",
  electric: "bg-yellow-500",
  grass: "bg-green-500",
  ice: "bg-sky-400",
  fighting: "bg-red-700",
  poison: "bg-purple-500",
  ground: "bg-amber-600",
  flying: "bg-indigo-400",
  psychic: "bg-pink-500",
  bug: "bg-lime-500",
  rock: "bg-stone-500",
  ghost: "bg-violet-700",
  dragon: "bg-indigo-600",
  steel: "bg-slate-400",
  dark: "bg-neutral-800",
  fairy: "bg-pink-400",
};