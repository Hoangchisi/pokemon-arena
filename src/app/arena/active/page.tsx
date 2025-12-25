"use client";

import React, { useEffect, useState, Suspense } from "react";
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
import toast from "react-hot-toast";

// --- LOADING COMPONENT ---
// Tách ra để dùng chung cho cả Suspense fallback và lúc chờ data từ Store
const LoadingScreen = ({ message = "Initializing Battle..." }: { message?: string }) => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
    <RefreshCw className="animate-spin text-blue-500" size={40} />
    <p className="font-mono animate-pulse">{message}</p>
  </div>
);

// --- MAIN LOGIC COMPONENT ---
// Component này chứa useSearchParams và logic game
const ArenaContent = () => {
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
  const [isMounted, setIsMounted] = useState(false);
  const [controlView, setControlView] = useState<'main' | 'fight' | 'switch'>('main');
  const [showMetrics, setShowMetrics] = useState(false);
  const [pendingMechanic, setPendingMechanic] = useState<'mega' | 'gmax' | 'tera' | null>(null);
  const [progressSaved, setProgressSaved] = useState(false);

  // Check Mount & Redirect nếu không có team
  useEffect(() => {
    setIsMounted(true);
    if (!myTeam || myTeam.length === 0) {
      router.push("/arena");
    }
  }, [myTeam, router]);

  // Handle Win/Progress
  useEffect(() => {
    if (winner === 'PLAYER' && !progressSaved) {
      const stageKey = searchParams.get('stage');

      if (stageKey) {
        setProgressSaved(true); // Khóa ngay lập tức

        // @ts-ignore
        const stageIndex = STAGE_ORDER.indexOf(stageKey);

        if (stageIndex !== -1) {
          const nextStageLevel = stageIndex + 1;
          console.log(`Victory against ${stageKey} (Current Stage: ${stageIndex})`);

          // 1. CẬP NHẬT CLIENT STORE NGAY LẬP TỨC (Optimistic UI)
          // Giúp khi quay lại Lobby thấy mở khóa ngay mà không cần fetch lại
          updateProgress(nextStageLevel);

          // 2. GỌI API LƯU DATABASE (Chạy ngầm)
          const saveToDb = async () => {
            try {
              const res = await fetch('/api/user/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stageUnlocked: nextStageLevel })
              });

              if (!res.ok) throw new Error("API Save failed");
              toast.success("Progress Saved! Next champion unlocked.");
            } catch (err) {
              console.error("Save progress error:", err);

            }
          };

          saveToDb();
        }
      }
    }
  }, [winner, progressSaved, searchParams, updateProgress]);

  // Loading Check: Kiểm tra xem data trong store có tồn tại không
  // Nếu user refresh trang, store có thể bị mất, cần redirect về lobby hoặc hiện nút quay lại
  if (!isMounted || !myTeam || myTeam.length === 0 || !enemyTeam || enemyTeam.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
        <RefreshCw className="animate-spin text-blue-500" size={40} />
        <p className="font-mono animate-pulse">Battle Data Not Found...</p>
        <button onClick={() => router.push('/arena')} className="text-xs text-slate-500 hover:text-white underline">
          Return to Lobby
        </button>
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
};

// --- EXPORT DEFAULT PAGE ---
// Bắt buộc phải có Suspense bao quanh component dùng useSearchParams
export default function ArenaActivePage() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading Arena Environment..." />}>
      <ArenaContent />
    </Suspense>
  );
}