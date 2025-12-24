import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom"; // IMPORT THÊM
import {
  Activity, Zap, Crown, Sparkles, RefreshCw,
  RotateCcw, X, ArrowLeftRight, LogOut,
  Shield,
  Sword
} from "lucide-react";
import { ArenaViewProps } from "./components/ArenaProps";
import { HealthBar } from "@/components/battle/HealthBar";
import { CategoryBadge } from "@/components/battle/CategoryBadge";
import { TYPE_COLORS } from "@/lib/constants";
import { useBattleStore } from "@/hooks/useBattleStore";

// --- INTERNAL COMPONENTS (Mobile Optimized) ---

const TypeBadge = ({ type, className }: { type: string, className?: string }) => (
  <span className={`${TYPE_COLORS[type]} text-white rounded px-1 ${className}`}>{type.toLocaleUpperCase()}</span>
);

const TeamStatus = ({ team, activeIdx, isEnemy = false }: { team: any[], activeIdx: number, isEnemy?: boolean }) => (
  <div className={`flex gap-1 mt-1 ${isEnemy ? 'justify-end' : 'justify-start'}`}>
    {team.map((p, i) => (
      <div
        key={i}
        className={`w-2 h-2 rounded-full border border-slate-600 shadow-sm
          ${p.currentHp === 0 ? 'bg-slate-700 opacity-50' : (i === activeIdx ? 'bg-blue-500 scale-125 ring-1 ring-blue-400' : 'bg-green-500')}
        `}
      />
    ))}
  </div>
);

const MobileHUD = ({ pokemon, isPlayer }: { pokemon: any, isPlayer: boolean }) => (
  <div className={`
    bg-slate-900/90 backdrop-blur-md border border-slate-600 p-2 rounded-lg shadow-lg w-[160px] sm:w-[200px]
    transition-all duration-300 animate-in fade-in zoom-in-95
    ${isPlayer ? 'rounded-tl-none border-l-4 border-l-blue-500' : 'rounded-br-none border-r-4 border-r-red-500'}
  `}>
    <div className="flex justify-between items-baseline mb-1 overflow-hidden">
      <span className="font-bold text-white text-xs sm:text-sm capitalize truncate block">{pokemon.name}</span>
      <span className="text-[10px] text-slate-400 font-mono shrink-0">Lv.{pokemon.level}</span>
    </div>

    <div className="flex gap-0.5 mb-1">
      {pokemon.types.map((t: string) => (<TypeBadge key={t} type={t} className="text-[8px] px-1 py-0 shadow-sm min-w-[28px] justify-center" />))}
      {pokemon.terastallize?.isTerastallized && <span className="text-[8px] px-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500 rounded font-bold">TERA</span>}
    </div>

    <HealthBar current={pokemon.currentHp} max={pokemon.maxHp} isPlayer={isPlayer} />
  </div>
);

const StatRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
  <div className="flex items-center justify-between text-xs">
    <div className="flex items-center gap-1.5 text-slate-400">
      {icon}
      <span className="font-semibold tracking-wider text-[10px]">{label}</span>
    </div>
    <span className="font-mono font-medium text-slate-200">{value}</span>
  </div>
);

// --- TOOLTIP COMPONENT (UPDATED WITH PORTAL) ---
interface PokemonStatsTooltipProps {
  pokemon: any;
  anchorRect: DOMRect | null; // Thay đổi: Nhận vị trí thay vì tự định vị
  side?: 'left' | 'right' | 'top' | 'bottom';
}

const PokemonStatsTooltip = ({ pokemon, anchorRect, side = 'right' }: PokemonStatsTooltipProps) => {
  if (!anchorRect) return null;

  // Tính toán vị trí Fixed dựa trên Anchor Rect
  const getStyle = (): React.CSSProperties => {
    const gap = 12; // Khoảng cách giữa tooltip và target
    let top = 0;
    let left = 0;
    let transform = '';

    switch (side) {
      case 'left':
        top = anchorRect.top + anchorRect.height / 2;
        left = anchorRect.left - gap;
        transform = 'translate(-100%, -50%)';
        break;
      case 'right':
        top = anchorRect.top + anchorRect.height / 2;
        left = anchorRect.right + gap;
        transform = 'translate(0, -50%)';
        break;
      case 'top':
        top = anchorRect.top - gap;
        left = anchorRect.left + anchorRect.width / 2;
        transform = 'translate(-50%, -100%)';
        break;
      case 'bottom':
        top = anchorRect.bottom + gap;
        left = anchorRect.left + anchorRect.width / 2;
        transform = 'translate(-50%, 0)';
        break;
    }

    return {
      top: `${top}px`,
      left: `${left}px`,
      transform,
    };
  };

  // Sử dụng Portal để render vào body -> Thoát khỏi mọi overflow hidden và z-index context cũ
  return createPortal(
    <div
      style={getStyle()}
      className="fixed z-[9999] w-48 p-3 bg-slate-900/95 border border-slate-500 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-200 pointer-events-none text-left"
    >
      <div className="border-b border-slate-700 pb-2 mb-2">
        <div className="font-bold text-white capitalize text-sm truncate">{pokemon.name}</div>
        <div className="flex flex-wrap gap-1 mt-1">
          {pokemon.types.map((t: string) => (
            <TypeBadge key={t} type={t} className="text-[9px] px-1.5 py-0.5 uppercase" />
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <StatRow icon={<Activity size={12} className="text-green-400" />} label="HP" value={`${pokemon.currentHp}/${pokemon.maxHp}`} />
        <StatRow icon={<Sword size={12} className="text-orange-400" />} label="ATK" value={pokemon.stats.attack} />
        <StatRow icon={<Shield size={12} className="text-yellow-400" />} label="DEF" value={pokemon.stats.defense} />
        <StatRow icon={<Zap size={12} className="text-blue-400" />} label="SPA" value={pokemon.stats.spAtk} />
        <StatRow icon={<Shield size={12} className="text-indigo-400" />} label="SPD" value={pokemon.stats.spDef} />
        <StatRow icon={<RefreshCw size={12} className="text-pink-400" />} label="SPE" value={pokemon.stats.speed} />
      </div>
    </div>,
    document.body
  );
};

// --- MAIN COMPONENT ---

export default function MobileArena({
  myTeam, enemyTeam, activePlayerIndex, activeEnemyIndex, logs, winner, attackingSide,
  isPlayerTurn, mustSwitch, controlView, pendingMechanic,
  setControlView, setShowMetrics, handleAttack, handleSwitch, onReturnToLobby
}: ArenaViewProps) {

  // State quản lý tooltip tập trung
  const [tooltipState, setTooltipState] = useState<{
    pokemon: any;
    anchorRect: DOMRect;
    side: 'left' | 'right' | 'top' | 'bottom';
  } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const battleBackground = useBattleStore((s) => s.battleBackground);

  // Helper function để set tooltip
  const handleMouseEnter = (e: React.MouseEvent, pokemon: any, side: 'left' | 'right' | 'top' | 'bottom') => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipState({ pokemon, anchorRect: rect, side });
  };

  const handleMouseLeave = () => {
    setTooltipState(null);
  };

  // Auto scroll logs
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  const playerPokemon = myTeam[activePlayerIndex];
  const enemyPokemon = enemyTeam[activeEnemyIndex];

  return (
    <div className="h-[calc(100vh-60px)] flex flex-col bg-slate-950 overflow-hidden relative">
      
      {/* RENDER TOOLTIP PORTAL Ở ĐÂY (Nó sẽ nhảy ra body nên vị trí trong JSX ko quan trọng) */}
      {tooltipState && (
        <PokemonStatsTooltip 
          pokemon={tooltipState.pokemon} 
          anchorRect={tooltipState.anchorRect} 
          side={tooltipState.side} 
        />
      )}

      {/* 1. BATTLE ARENA (Flex Grow) */}
      <div
        className="flex-grow relative bg-slate-900 bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: battleBackground ? `url('${battleBackground}')` : undefined }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>

        {/* ENEMY SECTION (TOP RIGHT) */}
        <div className="absolute top-4 right-4 z-10 flex flex-col items-end">
          <MobileHUD pokemon={enemyPokemon} isPlayer={false} />
          <TeamStatus team={enemyTeam} activeIdx={activeEnemyIndex} isEnemy={true} />
        </div>

        {/* ENEMY SPRITE */}
        <div 
            className="absolute bottom-0 right-4 z-20"
            onMouseEnter={(e) => handleMouseEnter(e, enemyPokemon, 'left')} 
            onMouseLeave={handleMouseLeave}
        >
          <div className={`relative transition-all duration-300 ease-out 
              ${attackingSide === 'enemy' ? '-translate-x-8 scale-20' : ''}`}>
            {/* Bóng đen dưới chân */}
            <div className="absolute top-10 right-1/2 -translate-x-1/2 w-20 h-4 bg-black/30 blur-md rounded-[100%]"></div>

            <img
              src={enemyPokemon.sprite}
              alt="Enemy"
              className={`w-32 h-32 sm:w-40 sm:h-40 object-contain pixelated drop-shadow-xl 
                    ${enemyPokemon.currentHp === 0 ? 'opacity-0 grayscale blur-sm translate-y-4 transition-all' : ''}
                  `}
            />
          </div>
        </div>

        {/* PLAYER SECTION (BOTTOM LEFT) */}
        <div className="absolute top-4 left-4 z-10 flex flex-col items-start">
          <MobileHUD pokemon={playerPokemon} isPlayer={true} />
          <TeamStatus team={myTeam} activeIdx={activePlayerIndex} />
        </div>
        
        {/* PLAYER SPRITE */}
        <div 
            className="absolute bottom-0 left-4 z-20" 
            onMouseEnter={(e) => handleMouseEnter(e, playerPokemon, 'right')} 
            onMouseLeave={handleMouseLeave}
        >
          <div className={`relative transition-all duration-300 ease-out 
              ${attackingSide === 'player' ? 'translate-x-8 scale-20' : ''}`}>
            {/* Bóng đen dưới chân */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-black/40 blur-md rounded-[100%]"></div>

            <img
              src={playerPokemon.sprite}
              alt="Player"
              className={`w-40 h-40 sm:w-48 sm:h-48 object-contain pixelated drop-shadow-xl scale-x-[-1]
                            ${playerPokemon.currentHp === 0 ? 'opacity-0 grayscale blur-sm translate-y-4 transition-all' : ''}
                            `}
            />
          </div>
        </div>

        {/* VS FLASH */}
        {attackingSide && <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none z-30" />}
      </div>

      {/* 2. BATTLE LOG */}
      <div className="h-20 bg-slate-950 border-t border-slate-800 p-2 overflow-y-auto font-mono text-xs text-slate-300 custom-scrollbar shadow-inner relative z-30" ref={scrollRef}>
        {logs.map((log, i) => (
          <div key={i} className="mb-1 border-l-2 border-slate-700 pl-2 opacity-90 last:opacity-100 last:text-white last:font-bold animate-in slide-in-from-left-2">{log}</div>
        ))}
      </div>

      {/* 3. CONTROL PANEL */}
      <div className="h-[260px] bg-slate-900 border-t border-slate-700 p-3 pb-safe relative">

        {/* --- SCENARIO 1: VICTORY / DEFEAT --- */}
        {winner ? (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in">
            <h2 className={`text-3xl font-black uppercase mb-4 ${winner === 'PLAYER' ? 'text-yellow-400' : 'text-red-500'}`}>
              {winner === 'PLAYER' ? '🏆 Victory!' : '💀 Defeated'}
            </h2>
            <button onClick={onReturnToLobby} className="bg-white text-black px-6 py-3 rounded-full font-bold shadow-lg active:scale-95 flex items-center gap-2">
              <LogOut size={18} /> Return to Lobby
            </button>
          </div>
        ) :

          /* --- SCENARIO 2: SWITCH POKEMON --- */
          (mustSwitch || controlView === 'switch') ? (
            <div className="absolute inset-0 z-40 bg-slate-900 p-3 flex flex-col animate-in slide-in-from-bottom-5">
              <div className="flex justify-between items-center mb-2">
                <h3 className={`${mustSwitch ? 'text-red-500 animate-pulse' : 'text-blue-400'} font-bold text-sm`}>{mustSwitch ? `${playerPokemon.name} fainted!` : 'Switch Pokemon'}</h3>
                {!mustSwitch && (<button onClick={() => setControlView('main')} className="text-slate-400 p-1"><X size={20} /></button>)}
              </div>
              <div className="grid grid-cols-2 gap-2 overflow-y-auto pb-2 custom-scrollbar flex-grow">
                {myTeam.map((p, idx) => (
                  <button
                    key={idx}
                    disabled={p.currentHp === 0 || idx === activePlayerIndex}
                    onClick={() => handleSwitch(idx)}
                    // Event Hover để hiển thị tooltip switch
                    onMouseEnter={(e) => handleMouseEnter(e, p, 'top')}
                    onMouseLeave={handleMouseLeave}
                    className={`
                                relative flex items-center gap-2 p-2 rounded-lg border transition-all text-left
                                ${idx === activePlayerIndex ? 'border-blue-500 bg-blue-900/20' : 'border-slate-700 bg-slate-800'}
                                ${p.currentHp === 0 ? 'opacity-50 grayscale cursor-not-allowed' : 'active:bg-slate-700'}
                            `}
                  >
                    <img src={p.sprite} className="w-10 h-10 pixelated object-contain shrink-0" />
                    <div className="min-w-0 flex-grow">
                      <span className="text-xs font-bold block truncate">{p.name}</span>
                      <div className="w-full h-1 bg-slate-700 rounded-full mt-1 overflow-hidden">
                        <div className={`h-full ${p.currentHp < p.maxHp / 5 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${(p.currentHp / p.maxHp) * 100}%` }}></div>
                      </div>
                      <span className="text-[9px] text-slate-400">{p.currentHp}/{p.maxHp} HP</span>
                    </div>
                    {idx === activePlayerIndex && <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>}
                  </button>
                ))}
              </div>
            </div>
          ) :

            /* --- SCENARIO 3: BATTLE CONTROLS (Main) --- */
            (
              <div className="flex flex-col h-full gap-2 relative">

                {/* WAITING OVERLAY */}
                {!isPlayerTurn && (
                  <div className="absolute inset-0 bg-slate-900/70 z-30 flex items-center justify-center backdrop-blur-[1px] rounded-lg">
                    <div className="bg-black/90 text-white px-4 py-2 rounded-full flex items-center gap-2 font-bold border border-white/10 text-sm shadow-xl">
                      <RefreshCw className="animate-spin text-blue-400" size={16} /> <span>Opponent is thinking...</span>
                    </div>
                  </div>
                )}

                {/* MOVE GRID (2x2) */}
                <div className="grid grid-cols-2 gap-2 flex-grow">
                  {playerPokemon.moves.map((move, idx) => {
                    // @ts-ignore
                    const typeColor = TYPE_COLORS[move.type] || "bg-slate-700";
                    return (
                      // @ts-ignore
                      <button key={idx} onClick={() => handleAttack(move)} disabled={!isPlayerTurn} className="relative overflow-hidden bg-slate-800 border border-slate-700 rounded-lg p-2 text-left active:scale-[0.98] transition-all group disabled:opacity-50">
                        {/* Type Color Bar */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${typeColor} opacity-80`}></div>

                        <div className="pl-2 flex flex-col justify-between h-full">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-slate-100 text-xs capitalize truncate max-w-[80%]">{move.name.replace(/-/g, ' ')}</span>
                            <CategoryBadge category={move.category} />
                          </div>
                          <div className="flex justify-between items-end text-[9px] text-slate-400 font-mono mt-1">
                            <span>PWR: <b className="text-slate-200">{move.power || '-'}</b></span>
                            <span>ACC: <b className="text-slate-200">{move.accuracy || '-'}%</b></span>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* ACTION BUTTONS (Metrics & Switch) */}
                <div className="grid grid-cols-2 gap-2 h-10 shrink-0">
                  <button
                    onClick={() => setShowMetrics(true)}
                    disabled={!isPlayerTurn}
                    className={`
                            rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50
                            ${pendingMechanic ? 'bg-indigo-600 text-white ring-1 ring-yellow-400 animate-pulse' : 'bg-slate-700 text-slate-200 active:bg-slate-600'}
                        `}
                  >
                    {pendingMechanic === 'mega' && <Crown size={14} className="text-yellow-400" />}
                    {pendingMechanic === 'gmax' && <Zap size={14} className="text-red-400" />}
                    {pendingMechanic === 'tera' && <Sparkles size={14} className="text-cyan-400" />}
                    {!pendingMechanic && <Sparkles size={14} />}
                    {pendingMechanic ? pendingMechanic.toUpperCase() : 'MECHANIC'}
                  </button>

                  <button
                    onClick={() => setControlView('switch')}
                    disabled={!isPlayerTurn}
                    className="bg-yellow-600 text-black rounded-lg font-bold text-xs flex items-center justify-center gap-2 active:bg-yellow-500 disabled:opacity-50"
                  >
                    <ArrowLeftRight size={14} /> SWITCH
                  </button>
                </div>
              </div>
            )}

      </div>
    </div>
  );
}