import React from "react";

// Bảng màu chuẩn (Nếu bạn muốn giữ màu đồng bộ ở 1 chỗ)
const TYPE_COLORS: Record<string, string> = {
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