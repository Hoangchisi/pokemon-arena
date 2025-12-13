import React from 'react';

interface HealthBarProps {
  current: number;
  max: number;
}

export const HealthBar = ({ current, max }: HealthBarProps) => {
  // Tính % HP
  const percent = Math.max(0, Math.min(100, (current / max) * 100));

  return (
    <div className="relative w-full">
      {/* Khung thanh máu */}
      <div className="w-full h-4 md:h-5 bg-slate-800 rounded-full border border-slate-600 overflow-hidden relative shadow-inner">
        
        {/* Phần máu xanh lá */}
        <div 
          className="h-full bg-green-500 transition-all duration-500 ease-out relative"
          style={{ width: `${percent}%` }}
        >
          {/* Hiệu ứng bóng sáng nhẹ */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20"></div>
        </div>

        {/* --- TEXT SỐ MÁU (OVERLAY) --- */}
        {/* absolute inset-0: Phủ kín khung cha để căn giữa */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <span className="text-[10px] md:text-xs font-bold text-white font-mono drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
            {current} / {max}
          </span>
        </div>

      </div>
    </div>
  );
};