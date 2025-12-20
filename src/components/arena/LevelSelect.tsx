"use client";

import { Lock, Swords, Trophy } from "lucide-react";
import { STAGE_ORDER, getStageInfo, StageKey } from "@/constants/stages";

interface LevelSelectProps {
  currentStageIndex: number;
  onSelectStage: (stageKey: StageKey) => void;
}

export function LevelSelect({ currentStageIndex, onSelectStage }: LevelSelectProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {STAGE_ORDER.map((stageKey, index) => {
        const info = getStageInfo(stageKey);
        
        const isLocked = index > currentStageIndex;
        const isCompleted = index < currentStageIndex;

        // Xử lý class động bằng Template Literals thay vì cn()
        const cardClasses = `relative group rounded-xl border-2 transition-all duration-300 overflow-hidden ${
          isLocked 
            ? "border-slate-800 bg-slate-900/50 cursor-not-allowed opacity-70" 
            : "border-slate-600 bg-slate-800 hover:border-yellow-500 hover:shadow-lg hover:shadow-yellow-500/20 cursor-pointer"
        }`;

        return (
          <div
            key={stageKey}
            onClick={() => !isLocked && onSelectStage(stageKey)}
            className={cardClasses}
          >
            {/* Overlay khi bị khóa */}
            {isLocked && (
              <div className="absolute inset-0 bg-black/60 z-20 flex flex-col items-center justify-center text-slate-500">
                <Lock size={48} className="mb-2" />
                <p className="font-bold text-lg uppercase tracking-widest">Locked</p>
              </div>
            )}

            {/* Badge đã hoàn thành */}
            {isCompleted && (
              <div className="absolute top-2 right-2 z-10 bg-green-500/20 border border-green-500 text-green-400 p-1 rounded-full">
                <Trophy size={16} />
              </div>
            )}

            {/* Header: Avatar & Tên */}
            <div className="p-4 flex items-center gap-4 border-b border-slate-700/50">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-slate-700 border-2 border-slate-500 overflow-hidden">
                    <img src={info.avatar} alt={info.aceName} className="w-full h-full object-contain" />
                </div>
                
                {/* Mechanic Badge (Sửa lại logic gọi info.aceMechanic đã khai báo ở stages.ts) */}
                {info.aceMechanic && (
                   <div className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-slate-900 shadow-sm z-10">
                      {info.aceMechanic.toUpperCase()}
                   </div>
                )}
              </div>
              
              <div>
                <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Opponent {index + 1}</p>
                <h3 className="text-xl font-bold text-white">{info.displayName}</h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                   <Swords size={12} /> {info.team.length} Pokemon
                </p>
              </div>
            </div>

            {/* Team Preview */}
            <div className="p-3 bg-slate-900/50">
                <p className="text-[10px] text-slate-500 mb-2 uppercase font-semibold">Team Preview</p>
                <div className="flex justify-between items-center">
                    {info.team.map((poke, i) => (
                        <div key={i} className="relative group/poke">
                            <img 
                                src={poke.spriteUrl} 
                                alt={poke.name} 
                                className="w-8 h-8 pixelated opacity-80 group-hover/poke:opacity-100 transition-opacity" 
                            />
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-[9px] rounded opacity-0 group-hover/poke:opacity-100 pointer-events-none whitespace-nowrap z-30 transition-opacity">
                                {poke.name}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
          </div>
        );
      })}
    </div>
  );
}