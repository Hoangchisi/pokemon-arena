"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Swords, Loader2, ChevronDown, AlertCircle } from "lucide-react";
import { useBattleStore } from "@/hooks/useBattleStore";
import { mapTeamToBattleTeam } from "@/lib/battle-mapper";
import { toast } from "react-hot-toast";

const MOCK_NPC_TEAM = [
  // 1. Spiritomb (Ghost/Dark) - Không có điểm yếu (trừ Fairy)
  {
    pokedexId: 442,
    name: "spiritomb",
    types: ["ghost", "dark"],
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/442.png",
    // Stats thực tế ở Lv.50 (tương đối)
    stats: { hp: 157, attack: 114, defense: 130, spAtk: 114, spDef: 130, speed: 55 },
    selectedMoves: ["shadow-ball", "dark-pulse", "psychic", "sucker-punch"]
  },
  // 2. Roserade (Grass/Poison) - Sp.Atk cực cao
  {
    pokedexId: 407,
    name: "roserade",
    types: ["grass", "poison"],
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/407.png",
    stats: { hp: 135, attack: 90, defense: 85, spAtk: 177, spDef: 125, speed: 142 },
    selectedMoves: ["energy-ball", "sludge-bomb", "shadow-ball", "dazzling-gleam"]
  },
  // 3. Gastrodon (Water/Ground) - Tanker, chỉ sợ Cỏ
  {
    pokedexId: 423,
    name: "gastrodon",
    types: ["water", "ground"],
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/423.png",
    stats: { hp: 218, attack: 103, defense: 88, spAtk: 114, spDef: 102, speed: 59 },
    selectedMoves: ["earth-power", "muddy-water", "sludge-bomb", "ice-beam"]
  },
  // 4. Lucario (Fighting/Steel) - Attacker toàn diện
  {
    pokedexId: 448,
    name: "lucario",
    types: ["fighting", "steel"],
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/448.png",
    stats: { hp: 145, attack: 132, defense: 90, spAtk: 137, spDef: 90, speed: 142 },
    selectedMoves: ["aura-sphere", "flash-cannon", "dragon-pulse", "earthquake"]
  },
  // 5. Milotic (Water) - Sp.Def Tank cực trâu
  {
    pokedexId: 350,
    name: "milotic",
    types: ["water"],
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/350.png",
    stats: { hp: 202, attack: 81, defense: 99, spAtk: 122, spDef: 147, speed: 101 },
    selectedMoves: ["hydro-pump", "ice-beam", "dragon-pulse", "recover"]
  },
  // 6. Garchomp (Dragon/Ground) - ACE chủ lực, siêu mạnh & nhanh
  {
    pokedexId: 445,
    name: "garchomp",
    types: ["dragon", "ground"],
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/445.png",
    stats: { hp: 183, attack: 182, defense: 115, spAtk: 100, spDef: 105, speed: 169 },
    selectedMoves: ["dragon-claw", "earthquake", "stone-edge", "swords-dance"]
  }
];

export default function ArenaLobbyPage() {
  const router = useRouter();
  const { setupBattle } = useBattleStore();

  const [isLoading, setIsLoading] = useState(false); 
  const [isFetching, setIsFetching] = useState(true); 
  const [myTeams, setMyTeams] = useState<any[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");

  // 1. Fetch User Teams
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch("/api/teams");
        if (!res.ok) {
           if (res.status === 401) {
             toast.error("Please login first");
             router.push("/login");
             return;
           }
           throw new Error("Failed to fetch");
        }
        const data = await res.json();
        setMyTeams(data);
        
        if (data.length > 0) {
          setSelectedTeamId(data[0].id);
        }
      } catch (error) {
        console.error(error);
        toast.error("Could not load your teams");
      } finally {
        setIsFetching(false);
      }
    };

    fetchTeams();
  }, [router]);

  // 2. Start Battle Handler
  const handleStartBattle = async () => {
    if (!selectedTeamId) return toast.error("Please select a team!");
    
    const selectedTeam = myTeams.find(t => t.id === selectedTeamId);
    if (!selectedTeam) return;

    if (selectedTeam.pokemons.length === 0) {
        return toast.error("This team has no Pokemon!");
    }

    setIsLoading(true);
    
    try {
      console.log("Mapping Battle Data...");
      
      // Map User Team
      const playerBattleTeam = await mapTeamToBattleTeam(selectedTeam.pokemons);
      
      // Map NPC Team
      const enemyBattleTeam = await mapTeamToBattleTeam(MOCK_NPC_TEAM);

      // Setup Store (6vs6)
      setupBattle(playerBattleTeam, enemyBattleTeam);

      router.push("/arena/active"); 
      
    } catch (error) {
      console.error("Failed to start battle:", error);
      toast.error("Failed to initialize battle data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"></div>

        <div className="flex justify-center mb-4">
          <div className="bg-red-500/20 p-6 rounded-full ring-2 ring-red-500/50 animate-pulse-slow">
            <Swords size={64} className="text-red-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white uppercase tracking-wider">
            Battle Arena
          </h1>
          <p className="text-slate-400 text-sm">
            Select your squad and face the Champion!
          </p>
        </div>

        {isFetching ? (
          <div className="py-8 flex flex-col items-center text-slate-500">
            <Loader2 className="animate-spin mb-2" />
            <span>Loading your teams...</span>
          </div>
        ) : myTeams.length === 0 ? (
          <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4 text-sm text-yellow-200 flex flex-col items-center gap-3">
            <AlertCircle size={24} />
            <p>You don't have any teams yet.</p>
            <Link 
              href="/dashboard/builder" 
              className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded w-full"
            >
              Go to Team Builder
            </Link>
          </div>
        ) : (
          <div className="space-y-4 text-left">
            <label className="block text-xs font-bold text-slate-500 uppercase">
              Select Your Team
            </label>
            
            <div className="relative">
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full appearance-none bg-slate-800 border border-slate-600 text-white py-3 px-4 pr-8 rounded-lg focus:outline-none focus:border-red-500 transition-colors cursor-pointer"
              >
                {myTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name} ({team.pokemons.length} Pokemon)
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <ChevronDown size={16} />
              </div>
            </div>

            <div className="flex gap-2 justify-center py-2 h-12">
               {myTeams.find(t => t.id === selectedTeamId)?.pokemons.map((p: any) => (
                 <img key={p.id} src={p.spriteUrl} alt={p.name} className="h-10 w-10 pixelated object-contain bg-slate-800 rounded-full border border-slate-700" title={p.name} />
               ))}
            </div>
            
            <button
              onClick={handleStartBattle}
              disabled={isLoading}
              className="
                w-full py-4 px-6 rounded-xl font-bold text-lg text-white
                bg-gradient-to-r from-red-600 to-orange-600 
                hover:from-red-500 hover:to-orange-500
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200 transform active:scale-95
                flex items-center justify-center gap-3 shadow-lg shadow-red-900/20
              "
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" />
                  INITIALIZING...
                </>
              ) : (
                <>
                  <Swords size={24} />
                  FIGHT!
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}