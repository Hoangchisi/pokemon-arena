"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Swords, Loader2, ChevronDown, AlertCircle, Trophy } from "lucide-react";
import { toast } from "react-hot-toast";

import { useBattleStore } from "@/hooks/useBattleStore";
import { useUserStore } from "@/hooks/useUserStore"; // Import Store mới
import { mapTeamToBattleTeam } from "@/lib/battle-mapper";
import { LevelSelect } from "@/components/arena/LevelSelect";
import { getStageInfo, StageKey } from "@/constants/stages";

export default function ArenaLobbyPage() {
  const router = useRouter();
  const { setupBattle } = useBattleStore();
  
  // 1. Lấy dữ liệu từ UserStore (Global Cache)
  const { 
    mySavedTeam, 
    maxStageUnlocked, 
    isDataLoaded,
    fetchUserData 
  } = useUserStore();

  // --- LOCAL STATE (UI Interaction) ---
  const [isLoading, setIsLoading] = useState(false); // Loading khi ấn Start Battle
  const [selectedTeamId, setSelectedTeamId] = useState<string>(""); 
  const [selectedStage, setSelectedStage] = useState<StageKey | null>(null);

  // 2. Fetch Data khi mount (Store sẽ tự check cache, nếu có rồi thì không fetch lại)
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // 3. Tự động chọn team đầu tiên khi dữ liệu load xong
  useEffect(() => {
    if (mySavedTeam.length > 0 && !selectedTeamId) {
      setSelectedTeamId(mySavedTeam[0].id);
    }
  }, [mySavedTeam, selectedTeamId]);

  // 4. Xử lý chọn Stage từ Menu
  const handleSelectStage = (stageKey: StageKey) => {
    setSelectedStage(stageKey);
    // Cuộn xuống phần chọn team
    document.getElementById("team-selection")?.scrollIntoView({ behavior: "smooth" });
  };

  // 5. Start Battle Handler
  const handleStartBattle = async () => {
    // Validate Input
    if (!selectedStage) return toast.error("Please select an opponent first!");
    if (!selectedTeamId) return toast.error("Please select your team!");

    const selectedTeam = mySavedTeam.find(t => t.id === selectedTeamId);
    if (!selectedTeam) return;

    if (selectedTeam.pokemons.length === 0) {
      return toast.error("This team has no Pokemon!");
    }

    setIsLoading(true);

    try {
      console.log(`Starting battle against: ${selectedStage}`);

      // A. Lấy thông tin NPC
      const stageInfo = getStageInfo(selectedStage);

      // B. Map dữ liệu Team User
      const playerBattleTeam = await mapTeamToBattleTeam(selectedTeam.pokemons);

      // C. Map dữ liệu Team NPC
      const enemyBattleTeam = await mapTeamToBattleTeam(stageInfo.team);

      // D. Setup Store
      setupBattle(playerBattleTeam, enemyBattleTeam);

      // E. Chuyển trang
      router.push(`/arena/active?stage=${selectedStage}`);

    } catch (error) {
      console.error("Failed to start battle:", error);
      toast.error("Failed to initialize battle data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 pb-20">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* --- HEADER --- */}
        <header className="text-center space-y-4 pt-8">
          <div className="inline-flex items-center justify-center p-4 bg-red-500/10 rounded-full mb-2 ring-1 ring-red-500/30">
            <Trophy size={48} className="text-yellow-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent uppercase tracking-tight">
            Battle Tower
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-lg">
            Defeat the Regional Champions to prove yourself as the ultimate Pokémon Master!
          </p>
        </header>

        {/* --- SECTION 1: SELECT OPPONENT --- */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-4">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-xs font-bold">1</span>
            <h2 className="text-xl font-bold text-slate-200">Select Opponent</h2>
          </div>

          <LevelSelect
            currentStageIndex={maxStageUnlocked} // Sử dụng data từ Store
            onSelectStage={handleSelectStage}
          />

          {selectedStage && (
            <div className="mt-4 text-center animate-in fade-in slide-in-from-top-2">
              <p className="text-slate-400">Selected Opponent:</p>
              <p className="text-2xl font-bold text-yellow-400 uppercase tracking-widest">
                {getStageInfo(selectedStage).displayName}
              </p>
            </div>
          )}
        </section>

        {/* --- SECTION 2: SELECT YOUR TEAM --- */}
        <section id="team-selection" className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-xs font-bold">2</span>
            <h2 className="text-xl font-bold text-slate-200">Prepare Your Squad</h2>
          </div>

          {!isDataLoaded ? (
            <div className="flex justify-center py-8 text-slate-500">
              <Loader2 className="animate-spin mr-2" /> Loading teams...
            </div>
          ) : mySavedTeam.length === 0 ? (
            <div className="text-center py-6 bg-yellow-500/5 rounded-lg border border-yellow-500/20">
              <AlertCircle className="mx-auto text-yellow-500 mb-2" />
              <p className="text-yellow-200 mb-4">You have no teams ready.</p>
              <Link href="/team-builder" className="inline-block bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded transition-colors">
                Create a Team
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Dropdown */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Select Team</label>
                <div className="relative">
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="w-full appearance-none bg-slate-800 border-2 border-slate-700 text-white py-3 px-4 pr-8 rounded-xl focus:outline-none focus:border-blue-500 transition-colors cursor-pointer text-lg"
                  >
                    {mySavedTeam.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                </div>
              </div>

              {/* Team Preview Icons */}
              <div className="flex justify-center gap-2 h-14 p-2 bg-slate-950/50 rounded-xl border border-slate-800/50">
                {mySavedTeam.find(t => t.id === selectedTeamId)?.pokemons.map((p: any) => (
                  <div key={p.id} className="relative group">
                    <img
                      src={p.spriteUrl}
                      alt={p.name}
                      className="h-10 w-10 pixelated object-contain bg-slate-800 rounded-full border border-slate-700 group-hover:border-blue-400 transition-colors"
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {p.name}
                    </div>
                  </div>
                ))}
              </div>

              {/* START BUTTON */}
              <button
                onClick={handleStartBattle}
                disabled={isLoading || !selectedStage}
                className={`
                    w-full py-4 px-6 rounded-xl font-bold text-xl uppercase tracking-wider
                    flex items-center justify-center gap-3 shadow-lg transition-all duration-200 transform active:scale-95
                    ${!selectedStage
                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-red-900/20"
                  }
                  `}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" /> Starting...
                  </>
                ) : !selectedStage ? (
                  <>Select an Opponent above</>
                ) : (
                  <>
                    <Swords size={28} />
                    Battle {getStageInfo(selectedStage).displayName}!
                  </>
                )}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}