"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RefreshCw } from "lucide-react";

import { useBattleStore } from "@/hooks/useBattleStore";
import { useUserStore } from "@/hooks/useUserStore";
import { Move } from "@/types/battle";
import { STAGE_ORDER } from "@/constants/stages";

// Components
import { MetricsModal } from "@/components/battle/MetricsModal";
import { ArenaViewProps } from "./components/ArenaProps";
import MobileArena from "./MobileArena";
import DesktopArena from "./DesktopArena";

export default function ArenaActivePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Stores
  const { 
    myTeam, enemyTeam, activePlayerIndex, activeEnemyIndex, 
    isPlayerTurn, winner, logs, attackingSide, mustSwitch,
    executeTurn, switchPokemon, playerUsedMechanics 
  } = useBattleStore();
  const { updateProgress } = useUserStore();

  // Local State
  const [controlView, setControlView] = useState<'main' | 'fight' | 'switch'>('main');
  const [showMetrics, setShowMetrics] = useState(false);
  const [pendingMechanic, setPendingMechanic] = useState<'mega' | 'gmax' | 'tera' | null>(null);
  const [progressSaved, setProgressSaved] = useState(false);

  // Handle Win/Progress
  useEffect(() => {
    if (winner === 'PLAYER' && !progressSaved) {
      const stageKey = searchParams.get('stage');
      if (stageKey) {
        setProgressSaved(true);
        // @ts-ignore
        const idx = STAGE_ORDER.indexOf(stageKey);
        if (idx !== -1) updateProgress(idx + 1);
      }
    }
  }, [winner, progressSaved, searchParams, updateProgress]);

  // Loading Check
  if (!myTeam || myTeam.length === 0 || !enemyTeam || enemyTeam.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
        <RefreshCw className="animate-spin text-blue-500" size={40} />
        <p className="font-mono animate-pulse">Initializing Battle...</p>
        <button onClick={() => router.push('/arena')} className="text-xs text-slate-500 hover:text-white underline">Return to Lobby</button>
      </div>
    );
  }

  // Logic Handlers
  const handleAttack = (move: Move) => {
    executeTurn(move, pendingMechanic);
    setPendingMechanic(null);
    setControlView('main');
  };

  const handleSwitch = (idx: number) => {
    switchPokemon(idx);
    setControlView('main');
  };

  const onReturnToLobby = () => router.push('/arena');

  // Prepare Props
  const viewProps: ArenaViewProps = {
    myTeam, enemyTeam, activePlayerIndex, activeEnemyIndex, logs, winner, attackingSide,
    isPlayerTurn, mustSwitch, controlView, pendingMechanic,
    setControlView, setShowMetrics, handleAttack, handleSwitch, onReturnToLobby
  };

  const playerMon = myTeam[activePlayerIndex];

  return (
    <>
      <MetricsModal 
        isOpen={showMetrics} 
        onClose={() => setShowMetrics(false)} 
        pokemon={playerMon}
        selectedOption={pendingMechanic}
        onSelectOption={setPendingMechanic}
        isPlayerTurn={isPlayerTurn}
        usedMechanics={playerUsedMechanics}
      />
      
      {/* Mobile View */}
      <div className="lg:hidden">
        <MobileArena {...viewProps} />
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block">
        <DesktopArena {...viewProps} />
      </div>
    </>
  );
}