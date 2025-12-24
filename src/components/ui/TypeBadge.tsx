import React from "react";
export const ALL_TYPES = [
  "normal", "fire", "water", "grass", "electric", "ice", 
  "fighting", "poison", "ground", "flying", "psychic", "bug", 
  "rock", "ghost", "dragon", "steel", "dark", "fairy"
];

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

interface TypeBadgeProps {
  type: string;
  className?: string;
  children?: React.ReactNode; // --- THÊM DÒNG NÀY ---
}

export function TypeBadge({ type, className = "", children }: TypeBadgeProps) {
  // Lấy màu dựa trên type, mặc định là xám nếu không tìm thấy
  const colorClass = TYPE_COLORS[type.toLowerCase()] || "bg-slate-600";

  return (
    <span
      className={`
        inline-flex items-center justify-center
        rounded text-white font-bold uppercase shadow-sm
        ${colorClass}
        ${className}
      `}
    >
      {/* Nếu có children (VD: "FIR") thì hiện children, nếu không thì hiện full type */}
      {children || type}
    </span>
  );
}