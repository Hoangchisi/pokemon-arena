"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBattleStore } from "@/hooks/useBattleStore";
import { HealthBar } from "@/components/battle/HealthBar";
import { TypeBadge } from "@/components/ui/TypeBadge";
import { CategoryBadge } from "@/components/battle/CategoryBadge";
import { RefreshCw, RotateCcw, ArrowLeftRight, X, Zap, Shield, Sword, Activity } from "lucide-react";

export default function BattlePage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);

  const [hoveredSide, setHoveredSide] = useState<'player' | 'enemy' | null>(null);
  const [hoveredSwitchIdx, setHoveredSwitchIdx] = useState<number | null>(null);

  const {
    myTeam,
    enemyTeam,
    activePlayerIndex,
    activeEnemyIndex,
    logs,
    isPlayerTurn,
    winner,
    mustSwitch,
    setupBattle,
    executeTurn,
    battleBackground,
    attackingSide,
    switchPokemon
  } = useBattleStore();

  useEffect(() => {
    setIsMounted(true);
    // Không cần setBattleBg ở đây nữa vì đã có trong Store khi gọi setupBattle
    if (!myTeam || myTeam.length === 0) router.push("/arena");
  }, [myTeam, router]);

  if (!isMounted || !myTeam || myTeam.length === 0) return null;

  const playerPokemon = myTeam && myTeam.length > 0 ? myTeam[activePlayerIndex] : null;
  const enemyPokemon = enemyTeam && enemyTeam.length > 0 ? enemyTeam[activeEnemyIndex] : null;

  if (!playerPokemon || !enemyPokemon) return <div className="text-white text-center mt-10">Loading Battle...</div>;

  const handleSwitch = (index: number) => {
    switchPokemon(index);
    setShowSwitchMenu(false);
    setHoveredSwitchIdx(null);
  };

  const TeamStatus = ({ team, activeIdx, isEnemy = false }: { team: any[], activeIdx: number, isEnemy?: boolean }) => (
    <div className={`flex gap-1.5 mt-2 ${isEnemy ? 'justify-end' : 'justify-start'}`}>
      {team.map((p, i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-full border border-slate-600 transition-all duration-300 shadow-sm
            ${p.currentHp === 0 ? 'bg-slate-700 opacity-50' : (i === activeIdx ? 'bg-blue-500 scale-125 ring-2 ring-blue-400' : 'bg-green-500')}
          `}
        />
      ))}
    </div>
  );

  const PokemonStatsTooltip = ({ pokemon, side, className = "" }: { pokemon: any, side?: 'left' | 'right', className?: string }) => {
    const positionClass = className || (side === 'left' ? 'left-full ml-4 top-1/2 -translate-y-1/2' : 'right-full mr-4 top-1/2 -translate-y-1/2');
    return (
      <div className={`absolute z-[100] bg-slate-900/95 border border-slate-500 p-3 rounded-xl shadow-2xl backdrop-blur-md w-48 animate-in fade-in zoom-in-95 duration-200 pointer-events-none text-left ${positionClass}`}>
        <div className="border-b border-slate-700 pb-2 mb-2">
          <div className="font-bold text-white capitalize text-sm">{pokemon.name}</div>
          <div className="flex gap-1 mt-1">{pokemon.types.map((t: string) => (<TypeBadge key={t} type={t} className="text-[9px] px-1.5 py-0.5" />))}</div>
        </div>
        <div className="space-y-1.5">
          <StatRow icon={<Activity size={10} className="text-green-400" />} label="HP" value={`${pokemon.currentHp}/${pokemon.maxHp}`} />
          <StatRow icon={<Sword size={10} className="text-orange-400" />} label="ATK" value={pokemon.stats.attack} />
          <StatRow icon={<Shield size={10} className="text-yellow-400" />} label="DEF" value={pokemon.stats.defense} />
          <StatRow icon={<Zap size={10} className="text-blue-400" />} label="SPA" value={pokemon.stats.spAtk} />
          <StatRow icon={<Shield size={10} className="text-indigo-400" />} label="SPD" value={pokemon.stats.spDef} />
          <StatRow icon={<RefreshCw size={10} className="text-pink-400" />} label="SPE" value={pokemon.stats.speed} />
        </div>
      </div>
    );
  };

  const StatRow = ({ icon, label, value }: any) => (
    <div className="flex items-center justify-between text-[10px] text-slate-300 font-mono">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="font-bold">{label}</span>
      </div>
      <span className="text-white">{value}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-2 overflow-hidden">

      <div className="max-w-6xl w-full h-[90vh] flex flex-col gap-4 scale-[0.9] origin-center">

        {/* === BATTLE SCREEN === */}
        {/* Sử dụng battleBackground lấy từ Store */}
        <div
          className="flex-grow rounded-2xl border border-slate-700 relative overflow-visible shadow-2xl flex flex-col z-10 bg-slate-900 bg-cover bg-center bg-no-repeat transition-all duration-1000"
          style={{
            backgroundImage: battleBackground ? `url('${battleBackground}')` : undefined
          }}
        >

          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 pointer-events-none"></div>
          </div>

          {/* --- ROW 1: HUDs --- */}
          <div className="relative z-20 w-full px-6 py-6 md:px-12 md:py-8 flex justify-between items-start">

            {/* PLAYER HUD */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-500 w-72 shadow-lg backdrop-blur-md transition-opacity duration-300">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 overflow-hidden min-w-0 flex-grow">
                  <span className="font-bold text-lg capitalize truncate text-white drop-shadow-md block">{playerPokemon.name}</span>
                  <div className="flex gap-1 shrink-0">{playerPokemon.types.map((t: string) => (<TypeBadge key={t} type={t} className="text-[9px] px-1.5 py-0.5 shadow-sm min-w-[32px] justify-center">{t.slice(0, 3)}</TypeBadge>))}</div>
                </div>
                <span className="text-xs text-slate-400 font-mono shrink-0 ml-2">Lv.50</span>
              </div>
              <HealthBar current={playerPokemon.currentHp} max={playerPokemon.maxHp} />
              <div className="flex justify-end mt-1"><TeamStatus team={myTeam} activeIdx={activePlayerIndex} /></div>
            </div>

            {/* ENEMY HUD */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-600 w-72 shadow-lg backdrop-blur-md transition-opacity duration-300">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 overflow-hidden min-w-0 flex-grow">
                  <span className="font-bold text-lg capitalize truncate text-white drop-shadow-md block">{enemyPokemon.name}</span>
                  <div className="flex gap-1 shrink-0">{enemyPokemon.types.map((t: string) => (<TypeBadge key={t} type={t} className="text-[9px] px-1.5 py-0.5 shadow-sm min-w-[32px] justify-center">{t.slice(0, 3)}</TypeBadge>))}</div>
                </div>
                <span className="text-xs text-slate-400 font-mono shrink-0 ml-2">Lv.50</span>
              </div>
              <HealthBar current={enemyPokemon.currentHp} max={enemyPokemon.maxHp} />
              <div className="flex justify-end mt-1"><TeamStatus team={enemyTeam} activeIdx={activeEnemyIndex} isEnemy={true} /></div>
            </div>
          </div>

          {/* --- ROW 2: SPRITES --- */}
          <div className="relative z-10 flex-grow w-full px-8 md:px-20 pb-8 flex justify-between items-end">
            {/* PLAYER SPRITE */}
            <div className="relative group cursor-help" onMouseEnter={() => setHoveredSide('player')} onMouseLeave={() => setHoveredSide(null)}>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-12 bg-black/60 blur-xl rounded-[100%]"></div>
              <img src={playerPokemon.backSprite || playerPokemon.sprite} alt={playerPokemon.name} className={`w-48 h-48 md:w-64 md:h-64 pixelated object-contain drop-shadow-2xl transition-transform duration-300 ease-out ${playerPokemon.currentHp === 0 ? 'opacity-0 translate-y-10 grayscale blur-sm' : ''} ${attackingSide === 'player' ? 'translate-x-20 -translate-y-4 scale-110' : ''} ${attackingSide === 'enemy' ? 'animate-pulse' : ''}`} />
              {hoveredSide === 'player' && <PokemonStatsTooltip pokemon={playerPokemon} side="left" />}
            </div>

            {/* ENEMY SPRITE */}
            <div className="relative group cursor-help" onMouseEnter={() => setHoveredSide('enemy')} onMouseLeave={() => setHoveredSide(null)}>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-12 bg-black/60 blur-xl rounded-[100%]"></div>
              <img src={enemyPokemon.sprite} alt={enemyPokemon.name} className={`w-40 h-40 md:w-56 md:h-56 pixelated object-contain drop-shadow-2xl transition-transform duration-300 ease-out ${enemyPokemon.currentHp === 0 ? 'opacity-0 translate-y-10 grayscale blur-sm' : ''} ${attackingSide === 'enemy' ? '-translate-x-20 translate-y-4 scale-110' : ''} ${attackingSide === 'player' ? 'animate-pulse' : ''}`} />
              {hoveredSide === 'enemy' && <PokemonStatsTooltip pokemon={enemyPokemon} side="right" />}
            </div>
          </div>
        </div>

        {/* === CONTROLS === */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[240px] shrink-0 relative z-50">

          <div className="md:col-span-1 bg-slate-900 rounded-xl border border-slate-700 p-4 overflow-y-auto font-mono text-sm text-slate-300 shadow-inner flex flex-col">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-2 sticky top-0 bg-slate-900 pb-2 border-b border-slate-800">Battle Log</h3>
            <div className="space-y-2 flex-grow">
              {logs.map((log, i) => (<div key={i} className="animate-in fade-in slide-in-from-bottom-2 border-l-2 border-slate-700 pl-2 py-0.5">{log}</div>))}
              <div ref={(el) => el?.scrollIntoView({ behavior: "smooth" })} />
            </div>
          </div>

          <div className="md:col-span-2 bg-slate-800 rounded-xl border border-slate-700 p-4 relative overflow-visible">
            {winner ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-30 animate-in fade-in">
                <h2 className={`text-4xl md:text-5xl font-black mb-6 drop-shadow-glow ${winner === 'PLAYER' ? 'text-yellow-400' : 'text-red-500'}`}>{winner === 'PLAYER' ? '🏆 VICTORY!' : '💀 DEFEATED'}</h2>
                <button onClick={() => router.push("/arena")} className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-xl"><RotateCcw size={20} /> Return to Lobby</button>
              </div>
            ) : (mustSwitch || showSwitchMenu) ? (
              <div className="absolute inset-0 bg-slate-900 z-20 p-4 flex flex-col animate-in fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`${mustSwitch ? 'text-red-500 animate-pulse' : 'text-blue-400'} font-bold text-xl`}>{mustSwitch ? `${playerPokemon.name} fainted!` : 'Switch Pokemon'}</h3>
                  {!mustSwitch && (<button onClick={() => setShowSwitchMenu(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>)}
                </div>
                <div className="flex flex-wrap justify-center gap-3 w-full overflow-visible pb-2 px-4">
                  {myTeam.map((p, idx) => (
                    <button key={idx} disabled={p.currentHp === 0 || idx === activePlayerIndex} onClick={() => handleSwitch(idx)} onMouseEnter={() => setHoveredSwitchIdx(idx)} onMouseLeave={() => setHoveredSwitchIdx(null)} className={`w-24 h-28 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all p-2 relative group ${idx === activePlayerIndex ? 'border-blue-500 bg-blue-900/20' : ''} ${p.currentHp === 0 ? 'opacity-40 border-slate-700 bg-slate-800 cursor-not-allowed grayscale' : 'border-slate-600 bg-slate-800 hover:bg-slate-700 hover:border-yellow-400 hover:-translate-y-1 cursor-pointer'} ${hoveredSwitchIdx === idx ? 'z-50' : 'z-0'}`}>
                      <img src={p.sprite} className="w-12 h-12 pixelated object-contain" />
                      <span className="text-xs font-bold truncate max-w-full">{p.name}</span>
                      <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden mt-1"><div className={`h-full ${p.currentHp < p.maxHp / 5 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${(p.currentHp / p.maxHp) * 100}%` }}></div></div>
                      {idx === activePlayerIndex && <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>}
                      {hoveredSwitchIdx === idx && <PokemonStatsTooltip pokemon={p} className="bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 z-[100] pointer-events-none" />}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full gap-2">
                <div className="grid grid-cols-2 gap-3 flex-grow">
                  {playerPokemon.moves.map((move, idx) => (
                    <button key={idx} onClick={() => executeTurn(move)} disabled={!isPlayerTurn} className="bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-blue-400 rounded-lg px-3 py-2 disabled:opacity-50 transition-all group relative overflow-hidden">
                      <div className="flex justify-between items-center w-full h-full">
                        <div className="flex flex-col items-start gap-1">
                          <span className="font-bold text-white capitalize text-sm group-hover:text-blue-300 truncate max-w-[100px] md:max-w-[140px] text-left leading-tight">{move.name.replace(/-/g, " ")}</span>
                          <div className="text-[10px] text-slate-400 font-mono flex gap-2"><span title="Power">PWR: <b className="text-slate-200">{move.power || '-'}</b></span><span className="text-slate-600">|</span><span title="Accuracy">ACC: <b className="text-slate-200">{move.accuracy || '-'}%</b></span></div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 pl-2 shrink-0"><TypeBadge type={move.type} className="text-[9px] px-1.5 py-0.5 shadow-sm" /><CategoryBadge category={move.category} /></div>
                      </div>
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowSwitchMenu(true)} disabled={!isPlayerTurn} className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-md"><ArrowLeftRight size={18} /> Switch Pokemon (Cost: 1 Turn)</button>
              </div>
            )}
            {!isPlayerTurn && !winner && !mustSwitch && (
              <div className="absolute inset-0 bg-slate-900/60 z-10 flex items-center justify-center backdrop-blur-[2px] cursor-not-allowed animate-in fade-in duration-300">
                <div className="bg-black/80 text-white px-6 py-3 rounded-full flex items-center gap-3 font-bold border border-white/10 shadow-2xl"><RefreshCw className="animate-spin text-blue-400" size={24} /><span>Opponent is thinking...</span></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}