import React from "react";
import { TYPE_COLORS } from "@/lib/constants";

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