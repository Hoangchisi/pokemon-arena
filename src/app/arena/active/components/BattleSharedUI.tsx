import React from "react";
import { Sparkles } from "lucide-react";
import { BattlePokemon, Move } from "@/types/battle";
import { HealthBar } from "@/components/battle/HealthBar";
import { TypeBadge, TYPE_COLORS } from "@/components/ui/TypeBadge";
import { CategoryBadge } from "@/components/battle/CategoryBadge";

// 1. Pokemon Sprite
export const PokemonSprite = ({ pokemon, isPlayer, isAttacking }: { pokemon: BattlePokemon, isPlayer: boolean, isAttacking: boolean }) => {
  const isFainted = pokemon.currentHp === 0;
  return (
    <div className={`relative transition-all duration-500 ${isAttacking ? (isPlayer ? 'translate-x-10 -translate-y-4' : '-translate-x-10 translate-y-4') : ''}`}>
      {/* Shadow */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-8 bg-black/40 rounded-[100%] blur-md -z-10 scale-100 transition-transform duration-500" style={{ opacity: isFainted ? 0 : 1 }} />
      {/* Image */}
      <img 
        src={isPlayer ? (pokemon.backSprite || pokemon.sprite) : pokemon.sprite} 
        alt={pokemon.name}
        className={`
          w-40 h-40 sm:w-56 sm:h-56 lg:w-72 lg:h-72 object-contain pixelated drop-shadow-xl transition-all duration-700
          ${isFainted ? 'opacity-0 translate-y-10 grayscale blur-sm' : 'opacity-100'}
          ${isAttacking ? 'scale-110 brightness-110' : ''}
        `}
      />
    </div>
  );
};

// 2. Battle HUD
export const BattleHUD = ({ pokemon, isPlayer }: { pokemon: BattlePokemon, isPlayer: boolean }) => (
  <div className={`
    bg-slate-900/80 backdrop-blur-md border border-slate-600 p-3 rounded-xl shadow-lg w-full max-w-[280px]
    transition-all duration-300 animate-in fade-in zoom-in-95
    ${isPlayer ? 'rounded-tl-none border-l-4 border-l-blue-500' : 'rounded-br-none border-r-4 border-r-red-500'}
  `}>
    <div className="flex justify-between items-baseline mb-1">
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="font-bold text-white text-base sm:text-lg capitalize truncate">{pokemon.name}</span>
        {pokemon.terastallize?.isTerastallized && <Sparkles size={12} className="text-cyan-400 animate-pulse"/>}
      </div>
      <span className="text-xs text-slate-400 font-mono">Lv.{pokemon.level}</span>
    </div>
    
    <div className="flex gap-1 mb-2">
      {pokemon.types.map(t => <TypeBadge key={t} type={t} className="text-[9px] px-1.5 py-0.5 shadow-sm min-w-[32px]" />)}
    </div>

    <HealthBar current={pokemon.currentHp} max={pokemon.maxHp} isPlayer={isPlayer} />
  </div>
);

// 3. Move Button
export const MoveButton = ({ move, onClick, disabled }: { move: Move, onClick: () => void, disabled: boolean }) => {
  // @ts-ignore
  const typeColor = TYPE_COLORS[move.type] || "bg-slate-700";
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden rounded-lg p-3 border border-slate-700 bg-slate-800 
        hover:bg-slate-700 hover:border-slate-500 active:scale-95 transition-all text-left group
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${typeColor} opacity-70 group-hover:opacity-100 transition-opacity`}></div>
      <div className="flex justify-between items-start mb-1 pl-2">
        <span className="font-bold text-slate-100 text-sm capitalize group-hover:text-white truncate">{move.name.replace(/-/g, ' ')}</span>
        <CategoryBadge category={move.category} />
      </div>
      <div className="flex justify-between items-center pl-2 text-[10px] text-slate-400 font-mono">
         <span className="flex gap-1">{move.type.toUpperCase().slice(0,3)} <span className="text-slate-600">|</span> PWR: {move.power || '-'}</span>
         
      </div>
    </button>
  );
};