"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBattleStore } from "@/hooks/useBattleStore";
import { HealthBar } from "@/components/battle/HealthBar";
import { TypeBadge } from "@/components/ui/TypeBadge";
import { RefreshCw, RotateCcw, ArrowLeftRight, X } from "lucide-react";

export default function BattlePage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);

  // Lấy thêm attackingSide từ Store
  const { 
    myTeam, enemyTeam, activePlayerIndex, activeEnemyIndex, 
    logs, isPlayerTurn, winner, mustSwitch, attackingSide,
    switchPokemon, executeTurn 
  } = useBattleStore();

  useEffect(() => {
    setIsMounted(true);
    if (!myTeam || myTeam.length === 0) router.push("/arena");
  }, [myTeam, router]);

  if (!isMounted || !myTeam || myTeam.length === 0) return null;

  const playerPokemon = myTeam[activePlayerIndex];
  const enemyPokemon = enemyTeam[activeEnemyIndex];

  if (!playerPokemon || !enemyPokemon) return <div className="text-white text-center mt-10">Loading Battle...</div>;

  const handleSwitch = (index: number) => {
    switchPokemon(index);
    setShowSwitchMenu(false);
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

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-2 md:p-4">
      <div className="max-w-6xl w-full h-[90vh] flex flex-col gap-4">
        
        {/* === BATTLE SCREEN === */}
        <div className="flex-grow bg-slate-900 rounded-2xl border border-slate-700 relative overflow-hidden shadow-2xl flex flex-col">
          
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black pointer-events-none"></div>

          {/* --- ROW 1: HUDs --- */}
          <div className="relative z-20 w-full px-6 py-6 md:px-12 md:py-8 flex justify-between items-start">
            
            {/* PLAYER HUD */}
            <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-500 w-72 shadow-lg backdrop-blur-sm transition-opacity duration-300">
              <div className="flex justify-between items-baseline mb-2">
                <span className="font-bold text-lg capitalize truncate text-white drop-shadow-md">{playerPokemon.name}</span>
                <span className="text-xs text-slate-400 font-mono">Lv.50</span>
              </div>
              <HealthBar current={playerPokemon.currentHp} max={playerPokemon.maxHp} />
              <div className="flex justify-between items-end mt-1">
                  <span className="text-xs text-slate-300 font-mono font-bold">{playerPokemon.currentHp} / {playerPokemon.maxHp} HP</span>
                  <TeamStatus team={myTeam} activeIdx={activePlayerIndex} />
              </div>
            </div>

            {/* ENEMY HUD */}
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-600 w-72 shadow-lg backdrop-blur-sm transition-opacity duration-300">
              <div className="flex justify-between items-baseline mb-2">
                <span className="font-bold text-lg capitalize truncate text-white drop-shadow-md">{enemyPokemon.name}</span>
                <span className="text-xs text-slate-400 font-mono">Lv.50</span>
              </div>
              <HealthBar current={enemyPokemon.currentHp} max={enemyPokemon.maxHp} />
              <div className="flex justify-end mt-1">
                <TeamStatus team={enemyTeam} activeIdx={activeEnemyIndex} isEnemy={true} />
              </div>
            </div>
          </div>

          {/* --- ROW 2: SPRITES (CÓ ANIMATION) --- */}
          <div className="relative z-10 flex-grow w-full px-8 md:px-20 pb-8 flex justify-between items-end">
             
             {/* PLAYER SPRITE */}
             <div className="relative">
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-12 bg-black/60 blur-xl rounded-[100%]"></div>
                <img 
                  src={playerPokemon.backSprite || playerPokemon.sprite} 
                  alt={playerPokemon.name}
                  className={`
                    w-48 h-48 md:w-64 md:h-64 pixelated object-contain drop-shadow-2xl 
                    transition-transform duration-300 ease-out 
                    ${playerPokemon.currentHp === 0 ? 'opacity-0 translate-y-10 grayscale blur-sm' : ''}
                    
                    /* --- ANIMATION CLASS: Lao lên 80px khi tấn công --- */
                    ${attackingSide === 'player' ? 'translate-x-20 -translate-y-4 scale-110' : ''}
                    
                    /* --- Rung nhẹ khi bị đánh (Nếu enemy đang đánh) --- */
                    ${attackingSide === 'enemy' ? 'animate-pulse' : ''}
                  `} 
                />
             </div>

             {/* ENEMY SPRITE */}
             <div className="relative">
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-12 bg-black/60 blur-xl rounded-[100%]"></div>
                <img 
                  src={enemyPokemon.sprite} 
                  alt={enemyPokemon.name}
                  className={`
                    w-40 h-40 md:w-56 md:h-56 pixelated object-contain drop-shadow-2xl 
                    transition-transform duration-300 ease-out
                    ${enemyPokemon.currentHp === 0 ? 'opacity-0 translate-y-10 grayscale blur-sm' : ''}
                    
                    /* --- ANIMATION CLASS: Lao xuống trái 80px khi tấn công --- */
                    ${attackingSide === 'enemy' ? '-translate-x-20 translate-y-4 scale-110' : ''}

                    /* --- Rung nhẹ khi bị đánh --- */
                    ${attackingSide === 'player' ? 'animate-pulse' : ''}
                  `} 
                />
             </div>
          </div>
        </div>

        {/* === CONTROLS (Giữ nguyên) === */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[240px] shrink-0">
          <div className="md:col-span-1 bg-slate-900 rounded-xl border border-slate-700 p-4 overflow-y-auto font-mono text-sm text-slate-300 shadow-inner flex flex-col">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-2 sticky top-0 bg-slate-900 pb-2 border-b border-slate-800">Battle Log</h3>
            <div className="space-y-2 flex-grow">
              {logs.map((log, i) => (
                <div key={i} className="animate-in fade-in slide-in-from-bottom-2 border-l-2 border-slate-700 pl-2 py-0.5">{log}</div>
              ))}
              <div ref={(el) => el?.scrollIntoView({ behavior: "smooth" })} />
            </div>
          </div>

          <div className="md:col-span-2 bg-slate-800 rounded-xl border border-slate-700 p-4 relative overflow-hidden">
            {winner ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-30 animate-in fade-in">
                <h2 className={`text-4xl md:text-5xl font-black mb-6 drop-shadow-glow ${winner === 'PLAYER' ? 'text-yellow-400' : 'text-red-500'}`}>{winner === 'PLAYER' ? '🏆 VICTORY!' : '💀 DEFEATED'}</h2>
                <button onClick={() => router.push("/arena")} className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-xl"><RotateCcw size={20}/> Return to Lobby</button>
              </div>
            ) : (mustSwitch || showSwitchMenu) ? (
             <div className="absolute inset-0 bg-slate-900 z-20 p-4 flex flex-col animate-in fade-in">
                <div className="flex justify-between items-center mb-4">
                    <h3 className={`${mustSwitch ? 'text-red-500 animate-pulse' : 'text-blue-400'} font-bold text-xl`}>{mustSwitch ? `${playerPokemon.name} fainted!` : 'Switch Pokemon'}</h3>
                    {!mustSwitch && (<button onClick={() => setShowSwitchMenu(false)} className="text-slate-400 hover:text-white"><X size={24}/></button>)}
                </div>
                <div className="flex flex-wrap justify-center gap-3 w-full overflow-y-auto pb-2">
                  {myTeam.map((p, idx) => (
                    <button key={idx} disabled={p.currentHp === 0 || idx === activePlayerIndex} onClick={() => handleSwitch(idx)} className={`w-24 h-28 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all p-2 relative ${idx === activePlayerIndex ? 'border-blue-500 bg-blue-900/20' : ''} ${p.currentHp === 0 ? 'opacity-40 border-slate-700 bg-slate-800 cursor-not-allowed grayscale' : 'border-slate-600 bg-slate-800 hover:bg-slate-700 hover:border-yellow-400 hover:-translate-y-1 cursor-pointer'}`}>
                      <img src={p.sprite} className="w-12 h-12 pixelated object-contain" />
                      <span className="text-xs font-bold truncate max-w-full">{p.name}</span>
                      <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden mt-1"><div className={`h-full ${p.currentHp < p.maxHp/5 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${(p.currentHp/p.maxHp)*100}%` }}></div></div>
                      {idx === activePlayerIndex && <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>}
                    </button>
                  ))}
                </div>
             </div>
            ) : (
              <div className="flex flex-col h-full gap-2">
                  <div className="grid grid-cols-2 gap-3 flex-grow">
                    {playerPokemon.moves.map((move, idx) => (
                      <button key={idx} onClick={() => executeTurn(move)} disabled={!isPlayerTurn} className="bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-blue-400 rounded-lg px-4 py-2 text-left flex flex-col justify-center disabled:opacity-50 transition-colors group">
                        <div className="flex justify-between items-center mb-1"><span className="font-bold text-white capitalize text-sm group-hover:text-blue-300">{move.name.replace(/-/g, " ")}</span><TypeBadge type={move.type} className="text-[10px] px-1.5 py-0.5" /></div>
                        <div className="text-[10px] text-slate-400 flex gap-3 font-mono"><span>PWR: {move.power || '-'}</span> <span>ACC: {move.accuracy || '-'}%</span></div>
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