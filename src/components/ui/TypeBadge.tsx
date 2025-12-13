import React from 'react';

interface TypeBadgeProps {
  type: string;
  className?: string; // Để override size nếu cần
}

export const TypeBadge = ({ type, className = "" }: TypeBadgeProps) => {
  // Chuẩn hóa input về lowercase để tránh lỗi
  const normalizedType = type.toLowerCase();

  return (
    <span 
      className={`
        px-3 py-1 
        rounded-md 
        text-xs font-bold uppercase 
        text-white text-shadow-sm 
        tracking-wide
        shadow-sm border border-white/20
        bg-type-${normalizedType} 
        ${className}
      `}
    >
      {type}
    </span>
  );
};