import React from 'react';

export const HealthBar = ({ current, max }: { current: number; max: number }) => {
  const percent = Math.max(0, Math.min(100, (current / max) * 100));
  
  // Đổi màu thanh máu: Xanh > 50%, Vàng > 20%, Đỏ < 20%
  let colorClass = "bg-green-500";
  if (percent < 50) colorClass = "bg-yellow-400";
  if (percent < 20) colorClass = "bg-red-500";

  return (
    <div className="w-full bg-slate-700 rounded-full h-4 border border-slate-600 overflow-hidden relative">
      {/* Background (HP đã mất) */}
      <div className="absolute top-0 left-0 w-full h-full bg-slate-800"></div>
      
      {/* Foreground (HP hiện tại) - transition-all tạo hiệu ứng tụt máu từ từ */}
      <div 
        className={`h-full ${colorClass} transition-all duration-1000 ease-out`}
        style={{ width: `${percent}%` }}
      />
      
      {/* Text overlay */}
      <div className="absolute top-0 w-full text-center text-[10px] font-bold text-white leading-4 shadow-sm">
        {current}/{max}
      </div>
    </div>
  );
};