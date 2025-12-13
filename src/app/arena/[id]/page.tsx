"use client";
import { useEffect } from 'react';
import { useBattleStore } from '@/hooks/useBattleStore';
import { HealthBar } from '@/components/battle/HealthBar';
import { TypeBadge } from '@/components/ui/TypeBadge';

export default function BattlePage() {
  const { 
    playerPokemon, enemyPokemon, logs, isPlayerTurn, winner,
    setupBattle, executeTurn 
  } = useBattleStore();

  // Mock init battle (Thực tế bạn sẽ lấy data từ API/Props)
  useEffect(() => {
    // Gọi API lấy team user và NPC, sau đó setup
    // setupBattle(mockUserMon, mockNpcMon);
  }, []);

  if (!playerPokemon || !enemyPokemon) return <div>Loading Arena...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 h-screen flex flex-col">
      {/* BATTLE SCREEN */}
      <div className="flex-grow bg-slate-800 rounded-xl border border-slate-600 relative overflow-hidden mb-4 p-8">
        
        {/* ENEMY HUD (Top Right) */}
        <div className="absolute top-8 right-8 w-64 bg-slate-900/80 p-4 rounded-lg backdrop-blur-sm border border-slate-700">
          <div className="flex justify-between items-baseline mb-1">
            <span className="font-bold text-lg capitalize">{enemyPokemon.name}</span>
            <span className="text-xs text-slate-400">Lv. 50</span>
          </div>
          <HealthBar current={enemyPokemon.currentHp} max={enemyPokemon.maxHp} />
        </div>
        
        {/* ENEMY SPRITE */}
        <div className="absolute top-20 left-20">
           <img src={enemyPokemon.sprite} className="w-48 h-48 pixelated object-contain" />
        </div>

        {/* PLAYER SPRITE (Back view) */}
        <div className="absolute bottom-10 left-32">
           <img src={playerPokemon.backSprite || playerPokemon.sprite} className="w-64 h-64 pixelated object-contain" />
        </div>

        {/* PLAYER HUD (Bottom Right) */}
        <div className="absolute bottom-32 right-8 w-72 bg-slate-900/80 p-4 rounded-lg backdrop-blur-sm border border-slate-700">
          <div className="flex justify-between items-baseline mb-1">
            <span className="font-bold text-lg capitalize">{playerPokemon.name}</span>
            <span className="text-xs text-slate-400">Lv. 50</span>
          </div>
          <HealthBar current={playerPokemon.currentHp} max={playerPokemon.maxHp} />
          <div className="text-right text-sm mt-1 text-slate-300">
             {playerPokemon.currentHp} / {playerPokemon.maxHp} HP
          </div>
        </div>
      </div>

      {/* CONTROLS & LOGS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-48">
        
        {/* LOG BOX */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 overflow-y-auto font-mono text-sm shadow-inner">
          {logs.map((log, i) => (
             <div key={i} className="mb-1 border-b border-slate-800 pb-1 last:border-0 animate-in fade-in slide-in-from-bottom-2">
               {log}
             </div>
          ))}
          {/* Tự động scroll xuống cuối */}
          <div ref={(el) => el?.scrollIntoView({ behavior: "smooth" })} />
        </div>

        {/* MOVE SELECTION */}
        <div className="grid grid-cols-2 gap-3 bg-slate-800 p-4 rounded-xl border border-slate-700">
          {winner ? (
             <div className="col-span-2 flex items-center justify-center text-xl font-bold">
                {winner === 'PLAYER' ? '🏆 You Won!' : '💀 You Lost!'}
             </div>
          ) : (
            playerPokemon.moves.map((move, idx) => (
              <button
                key={idx}
                disabled={!isPlayerTurn}
                onClick={() => executeTurn(move)}
                className="
                  bg-slate-700 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed
                  text-left p-3 rounded-lg transition-colors border border-slate-600
                  flex flex-col justify-center group
                "
              >
                <span className="font-bold capitalize group-hover:text-white">{move.name}</span>
                <span className="text-xs text-slate-400 group-hover:text-blue-200">
                  Type: {move.type} | Pow: {move.power || '-'}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}