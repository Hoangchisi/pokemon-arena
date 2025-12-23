"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-hot-toast";
import {
  Save, Trash2, Plus, LayoutList, ChevronDown, DownloadCloud, Loader2, Search, X, Zap, Sparkles, Filter
} from "lucide-react";
import { getPokemonDetails, searchPokemonList } from "@/lib/pokeapi";
import { getPokemonByName } from "@/lib/pokemon-forms";
import { CategoryBadge } from "@/components/battle/CategoryBadge";
import { TeamMember } from "@/types/pokemon";
import { TypeBadge } from "@/components/ui/TypeBadge";
// Import Store
import { useUserStore } from "@/hooks/useUserStore";

// ... (Constants kept same as requested)
const TYPE_GRADIENTS: Record<string, string> = {
  normal: "from-neutral-700/50 to-slate-900 border-neutral-600",
  fire: "from-orange-900/60 to-slate-900 border-orange-600",
  water: "from-blue-900/60 to-slate-900 border-blue-600",
  electric: "from-yellow-900/60 to-slate-900 border-yellow-600",
  grass: "from-green-900/60 to-slate-900 border-green-600",
  ice: "from-sky-900/60 to-slate-900 border-sky-500",
  fighting: "from-red-900/60 to-slate-900 border-red-700",
  poison: "from-purple-900/60 to-slate-900 border-purple-600",
  ground: "from-amber-900/60 to-slate-900 border-amber-600",
  flying: "from-indigo-900/60 to-slate-900 border-indigo-500",
  psychic: "from-pink-900/60 to-slate-900 border-pink-600",
  bug: "from-lime-900/60 to-slate-900 border-lime-600",
  rock: "from-stone-900/60 to-slate-900 border-stone-600",
  ghost: "from-violet-900/60 to-slate-900 border-violet-700",
  dragon: "from-indigo-900/60 to-slate-900 border-indigo-600",
  steel: "from-slate-700/60 to-slate-900 border-slate-500",
  dark: "from-neutral-900/80 to-slate-900 border-neutral-700",
  fairy: "from-pink-900/60 to-slate-900 border-pink-500",
};

const TYPE_COLORS: Record<string, string> = {
  normal: "bg-neutral-500", fire: "bg-orange-500", water: "bg-blue-500",
  electric: "bg-yellow-500", grass: "bg-green-500", ice: "bg-sky-400",
  fighting: "bg-red-700", poison: "bg-purple-500", ground: "bg-amber-600",
  flying: "bg-indigo-400", psychic: "bg-pink-500", bug: "bg-lime-500",
  rock: "bg-stone-500", ghost: "bg-violet-700", dragon: "bg-indigo-600",
  steel: "bg-slate-400", dark: "bg-neutral-800", fairy: "bg-pink-400",
};

const ALL_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison',
  'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark',
  'steel', 'fairy'
];

export default function TeamBuilderPage() {
  const { data: session } = useSession();

  // --- STORE CONNECTION ---
  const {
    mySavedTeam,
    fetchUserData,
    setSavedTeam,
    isDataLoaded
  } = useUserStore();

  // --- LOCAL STATES ---
  const [teamName, setTeamName] = useState("My New Team");
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // --- MODAL SEARCH STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalQuery, setModalQuery] = useState("");
  const [modalResults, setModalResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // --- SEARCH FILTER STATES ---
  const [filterType, setFilterType] = useState<string | null>(null); // Lưu hệ đang lọc
  const [isFilterOpen, setIsFilterOpen] = useState(false); // Bật tắt menu filter

  // Dropdown Logic
  const [openTeraDropdownId, setOpenTeraDropdownId] = useState<string | null>(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // =================================================================
  // LOGIC TÌM KIẾM MỚI (DEBOUNCE 0.5s)
  // =================================================================
  useEffect(() => {
    // 1. Nếu ô input trống hoặc chỉ có khoảng trắng -> Reset kết quả & tắt loading
    if (!modalQuery.trim()) {
      setModalResults([]);
      setIsSearching(false);
      return;
    }

    // 2. Đánh dấu đang tìm kiếm ngay lập tức khi user gõ
    setIsSearching(true);

    // 3. Đặt bộ đếm thời gian (Timeout) 0.5s
    const timeoutId = setTimeout(async () => {
      try {
        console.log(`Đang tìm kiếm: ${modalQuery}...`);

        // Gọi API tìm kiếm
        const results = await searchPokemonList(modalQuery);

        // Lọc kết quả (Logic cũ của bạn: bỏ mega/gmax để tránh trùng lặp form)
        const filteredResults = results.filter((p: any) => {
          const name = p.name.toLowerCase();
          return !name.includes("mega") && !name.includes("gmax") && !name.includes("gigantamax") && !name.includes("-primal") && !name.includes("-ash") && !name.includes("-battle-bond");
        });

        setModalResults(filteredResults);
      } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
        setModalResults([]); // Xóa kết quả nếu lỗi
      } finally {
        // 4. Kết thúc tìm kiếm -> Reset biến isSearching về false (0)
        setIsSearching(false);
      }
    }, 500); // 500ms = 0.5s

    // Cleanup Function: Hàm này chạy khi modalQuery thay đổi HOẶC component unmount
    // Nó sẽ hủy timeout cũ đi. Nếu user gõ liên tục, timeout liên tục bị hủy và tạo mới.
    // Chỉ khi user DỪNG gõ quá 0.5s thì hàm trong setTimeout mới được chạy.
    return () => clearTimeout(timeoutId);

  }, [modalQuery]); // Dependency: Chạy lại effect này mỗi khi modalQuery thay đổi

  // --- LOGIC: LOAD TEAM TO EDIT ---
  const loadTeamToEdit = async (savedTeam: any) => {
    setEditingTeamId(savedTeam.id);
    setTeamName(savedTeam.name);

    // 1. Instant Map (Basic Info)
    const mappedPokemons: TeamMember[] = savedTeam.pokemons.map((p: any) => {
      // Validate Moves from DB
      const dbMoves = [p.move1, p.move2, p.move3, p.move4];
      const validSelectedMoves = dbMoves.filter((m) => m && m.trim() !== "");

      return {
        uuid: uuidv4(),
        id: p.pokedexId,
        name: p.name,
        types: p.types,
        sprite: p.spriteUrl,
        stats: {
          hp: p.hp, attack: p.attack, defense: p.defense,
          spAtk: p.spAtk, spDef: p.spDef, speed: p.stats?.speed || p.speed
        },
        moves: [], // Initially empty for speed
        selectedMoves: validSelectedMoves,
        selectedTeraType: p.teraType || null,
      };
    });

    setTeam(mappedPokemons);

    // 2. Hydrate Details (Async Fetch for Move Lists)
    toast.loading("Restoring move details...", { id: "restore-data" });

    try {
      const enrichedTeam = await Promise.all(mappedPokemons.map(async (member) => {
        // Ưu tiên Local Cache
        const localData = getPokemonByName(member.name);
        // Fallback to API if no moves data
        if (localData && localData.moves && localData.moves.length > 0) {
          return {
            ...member,
            moves: localData.moves,
            stats: localData.stats
          };
        }

        const apiData = await getPokemonDetails(member.name);
        if (apiData) {
          return {
            ...member,
            moves: apiData.moves,
            stats: apiData.stats
          };
        }

        return member;
      }));

      setTeam(enrichedTeam);
      toast.success("Team data restored!", { id: "restore-data" });
    } catch (error) {
      toast.error("Could not fetch move details", { id: "restore-data" });
    }
  };

  // --- ACTIONS ---

  const refreshMemberData = async (uuid: string, name: string) => {
    toast.loading(`Fetching moves for ${name}...`, { id: "loading-moves" });

    // 1. Check Local Cache (Dùng biến const riêng)
    const localData = getPokemonByName(name);

    if (localData && localData.moves && localData.moves.length > 0) {
      setTeam(prev => prev.map(member => {
        if (member.uuid !== uuid) return member;
        // Dùng localData (const) nên TS biết chắc chắn nó tồn tại
        return { ...member, moves: localData.moves, stats: localData.stats };
      }));
      toast.success("Moves loaded!", { id: "loading-moves" });
      return;
    }

    // 2. Fetch API (Dùng biến const riêng)
    const apiData = await getPokemonDetails(name);

    if (apiData) {
      setTeam(prev => prev.map(member => {
        if (member.uuid !== uuid) return member;
        // Dùng apiData (const) nên TS không báo lỗi undefined nữa
        return { ...member, moves: apiData.moves, stats: apiData.stats };
      }));
      toast.success("Moves loaded!", { id: "loading-moves" });
    } else {
      toast.error("Failed to load moves", { id: "loading-moves" });
    }
  };

  const toggleMove = (memberUuid: string, moveName: string) => {
    const currentMember = team.find(m => m.uuid === memberUuid);
    if (!currentMember) return;
    const isSelected = currentMember.selectedMoves.includes(moveName);

    if (!isSelected && currentMember.selectedMoves.length >= 4) {
      toast.error("Max 4 moves allowed!");
      return;
    }

    setTeam(prev => prev.map(member => {
      if (member.uuid !== memberUuid) return member;
      if (isSelected) {
        return { ...member, selectedMoves: member.selectedMoves.filter(m => m !== moveName) };
      } else {
        return { ...member, selectedMoves: [...member.selectedMoves, moveName] };
      }
    }));
  };

  const resetBuilder = () => {
    setEditingTeamId(null);
    setTeamName("My New Team");
    setTeam([]);
  };

  const removeFromTeam = (uuid: string) => {
    setTeam(team.filter((p) => p.uuid !== uuid));
  };

  const deleteTeam = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this team?")) return;
    try {
      await fetch(`/api/teams/${id}`, { method: "DELETE" });

      const updatedList = mySavedTeam.filter(t => t.id !== id);
      setSavedTeam(updatedList);

      toast.success("Team deleted");
      if (editingTeamId === id) resetBuilder();
    } catch (err) { toast.error("Failed to delete"); }
  };

  const saveTeamToDb = async () => {
    if (team.length === 0) return toast.error("Empty team!");
    if (!session?.user) return toast.error("Please login to save!");

    setIsSaving(true);

    const payload = {
      name: teamName,
      pokemons: team.map((p, index) => ({
        pokedexId: p.id,
        name: p.name,
        // Stats
        hp: p.stats.hp,
        attack: p.stats.attack,
        defense: p.stats.defense,
        spAtk: p.stats.spAtk,
        spDef: p.stats.spDef,
        speed: p.stats.speed,
        // Visuals
        types: p.types,
        spriteUrl: p.sprite,
        order: index,
        // Moves - Safe nulls
        move1: p.selectedMoves[0] || null,
        move2: p.selectedMoves[1] || null,
        move3: p.selectedMoves[2] || null,
        move4: p.selectedMoves[3] || null,
        teraType: p.selectedTeraType || null,
      }))
    };

    try {
      let res;
      if (editingTeamId) {
        res = await fetch(`/api/teams/${editingTeamId}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch("/api/teams", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const errorDetail = await res.text();
        console.error("SERVER ERROR:", errorDetail);
        throw new Error(errorDetail || "Failed to save team");
      }

      const savedData = await res.json();

      // Fallback populate for optimistic UI
      if (!savedData.pokemons || savedData.pokemons.length === 0) {
        savedData.pokemons = team.map(p => ({
          id: p.id,
          name: p.name,
          spriteUrl: p.sprite,
          types: p.types
        }));
      }

      // Ensure User ID matches for correct filtering
      if (session?.user?.id) {
        savedData.userId = session.user.id;
      }

      if (editingTeamId) {
        const updatedList = mySavedTeam.map(t => t.id === editingTeamId ? savedData : t);
        setSavedTeam(updatedList);
        toast.success("Team updated!");
      } else {
        setSavedTeam([savedData, ...mySavedTeam]);
        setEditingTeamId(savedData.id);
        toast.success("Team created!");
      }

    } catch (error: any) {
      console.error("Save Error:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // --- MODAL LOGIC ---
  const handleOpenModal = () => {
    if (team.length >= 6) return toast.error("Team is full!");
    setIsModalOpen(true);
    setModalQuery("");
    setModalResults([]);
    setFilterType(null); // Reset filter
    setIsFilterOpen(false);
    setTimeout(() => document.getElementById("search-input")?.focus(), 100);

  };

  const handleModalSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalQuery.trim()) return;
    setIsSearching(true);

    const results = await searchPokemonList(modalQuery);
    // Filter out alternate forms from search to avoid duplicates
    const filteredResults = results.filter((p: any) => {
      const name = p.name.toLowerCase();
      return !name.includes("mega") && !name.includes("gmax") && !name.includes("gigantamax");
    });

    setModalResults(filteredResults);
    setIsSearching(false);
  };

  const selectPokemonFromModal = async (pokemonName: string) => {
    setIsSearching(true);

    // Try local cache first for speed
    const localData = getPokemonByName(pokemonName);
    if (localData && localData.moves && localData.moves.length > 0) {
      setTeam([...team, { ...localData, selectedMoves: [], selectedTeraType: null, uuid: uuidv4() }]);
      toast.success(`Added ${localData.name}!`);
      setIsModalOpen(false);
      setIsSearching(false);
      return;
    }

    // Fallback to API
    const fullData = await getPokemonDetails(pokemonName);
    if (fullData) {
      setTeam([...team, { ...fullData, selectedMoves: [], selectedTeraType: null, uuid: uuidv4() }]);
      toast.success(`Added ${fullData.name}!`);
      setIsModalOpen(false);
    } else {
      toast.error("Failed to add Pokemon");
    }
    setIsSearching(false);
  };

  const StatBar = ({ label, value, max = 255, color = "bg-blue-500" }: { label: string, value: number, max?: number, color?: string }) => (
    <div className="flex items-center gap-2 text-[10px] font-mono mb-1">
      <span className="w-8 font-bold text-slate-400 uppercase">{label}</span>
      <div className="flex-grow h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${Math.min(100, (value / max) * 100)}%` }}></div>
      </div>
      <span className="w-6 text-right font-bold text-white">{value}</span>
    </div>
  );
  // --- LOGIC LỌC KẾT QUẢ HIỂN THỊ ---
  // Lọc modalResults dựa trên filterType được chọn
  const displayedResults = modalResults.filter((p) => {
    if (!filterType) return true; // Nếu chưa chọn filter thì hiện hết
    return p.types.includes(filterType); // Chỉ hiện pokemon có chứa hệ đã chọn
  });

  return (
    <div className="container mx-auto p-4 max-w-7xl h-[calc(100vh-80px)] flex gap-6">

      {/* --- SIDEBAR: TEAM LIST --- */}
      <div className="w-1/4 min-w-[250px] bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col hidden lg:flex shadow-xl">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-700">
          <h2 className="font-bold flex items-center gap-2 text-white"><LayoutList size={20} /> My Teams</h2>
          <button onClick={resetBuilder} className="p-1 hover:bg-slate-800 rounded text-green-400" title="Create New Team">
            <Plus size={20} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {!isDataLoaded ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-500">
              <Loader2 className="animate-spin mb-3 text-blue-500" size={32} />
              <span className="text-sm">Loading...</span>
            </div>
          ) : mySavedTeam.length === 0 ? (
            <div className="text-center text-slate-500 py-8 text-sm">No teams saved yet.</div>
          ) : (
            mySavedTeam
              .filter((t: any) => t.userId === session?.user?.id) // Filter by User
              .map((t) => (
                <div
                  key={t.id}
                  onClick={() => loadTeamToEdit(t)}
                  className={`group p-3 rounded-lg border cursor-pointer transition-all hover:bg-slate-800 relative ${editingTeamId === t.id ? 'border-blue-500 bg-slate-800/50' : 'border-slate-800 bg-slate-950'}`}
                >
                  <div className="font-bold text-sm mb-1 truncate pr-6 text-slate-200">{t.name}</div>
                  <div className="flex -space-x-2">
                    {(t.pokemons || []).slice(0, 6).map((p: any) => (
                      <img key={p.id} src={p.spriteUrl} className="w-8 h-8 rounded-full bg-slate-700 border border-slate-900" alt={p.name} />
                    ))}
                  </div>
                  <button onClick={(e) => deleteTeam(t.id, e)} className="absolute top-2 right-2 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                </div>
              ))
          )}
        </div>
      </div>

      {/* --- MAIN BUILDER AREA --- */}
      <div className="flex-grow flex flex-col overflow-y-auto pr-2 custom-scrollbar">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 bg-slate-900/50 p-4 rounded-xl border border-slate-800 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3 flex-grow mr-4">
            <input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="text-2xl font-bold bg-transparent border-b border-transparent hover:border-slate-600 focus:border-blue-500 outline-none w-full max-w-md text-white placeholder-slate-500 transition-colors"
              placeholder="Enter Team Name..."
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleOpenModal}
              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow-lg shadow-green-900/20 hover:scale-105 transition-all active:scale-95"
            >
              <Plus size={18} /> Add Pokemon
            </button>

            <button
              onClick={saveTeamToDb}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-bold whitespace-nowrap shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {isSaving ? "Saving..." : "Save Team"}
            </button>
          </div>
        </div>

        {/* --- TEAM GRID --- */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-20">
          {team.length === 0 && (
            <div className="xl:col-span-2 h-64 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-500 gap-4">
              <p>Your team is empty.</p>
              <button onClick={handleOpenModal} className="text-blue-400 hover:underline flex items-center gap-2">
                <Plus size={16} /> Click here to add Pokemon
              </button>
            </div>
          )}

          {team.map((member) => {
            const mainType = member.types[0] || 'normal';
            const gradientClass = TYPE_GRADIENTS[mainType] || TYPE_GRADIENTS['normal'];

            return (
              <div
                key={member.uuid}
                className={`
                      relative p-4 rounded-xl border shadow-xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-300
                      bg-gradient-to-br ${gradientClass}
                    `}
              >
                <button onClick={() => removeFromTeam(member.uuid)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors bg-black/20 p-1.5 rounded-full z-10">
                  <Trash2 size={18} />
                </button>

                <div className="flex gap-4">
                  {/* Sprite & Info */}
                  <div className="flex flex-col items-center justify-center w-32 shrink-0">
                    <div className="relative w-28 h-28">
                      <div className="absolute inset-0 bg-white/10 blur-2xl rounded-full"></div>
                      <img
                        src={member.sprite}
                        className="relative w-full h-full pixelated object-contain drop-shadow-2xl hover:scale-110 transition-transform duration-300"
                        alt={member.name}
                      />
                    </div>
                    <h3 className="font-black text-xl text-white capitalize drop-shadow-md text-center leading-tight mb-2">
                      {member.name}
                    </h3>
                    <div className="flex gap-1 justify-center flex-wrap">
                      {member.types.map(t => <TypeBadge key={t} type={t} className="text-[10px] px-2 py-0.5 shadow-lg" />)}
                    </div>

                    {/* Terastallize Selector */}
                    <div className="mt-2 pt-2 border-t border-white/10 w-full">
                      <div className="flex items-center gap-1 mb-1">
                        <Sparkles size={12} className="text-cyan-400" />
                        <span className="text-[9px] font-bold text-cyan-300">TERA TYPE:</span>
                      </div>

                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenTeraDropdownId(openTeraDropdownId === member.uuid ? null : member.uuid);
                          }}
                          className={`w-full bg-cyan-900/30 border rounded-lg px-2 py-1 text-[11px] font-bold text-cyan-300 flex items-center justify-between transition-all
                            ${openTeraDropdownId === member.uuid ? 'border-cyan-500 ring-1 ring-cyan-500' : 'border-cyan-600/50 hover:border-cyan-500'}
                          `}
                        >
                          <span>{member.selectedTeraType ? member.selectedTeraType.toUpperCase() : 'Select'}</span>
                          <ChevronDown size={12} className={`transition-transform ${openTeraDropdownId === member.uuid ? 'rotate-180' : ''}`} />
                        </button>

                        {openTeraDropdownId === member.uuid && (
                          <>
                            <div
                              className="fixed inset-0 z-40 cursor-default"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenTeraDropdownId(null);
                              }}
                            />

                            <div className="absolute top-full left-0 right-0 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 grid grid-cols-3 gap-1 p-2 w-48 animate-in fade-in zoom-in-95 duration-200">
                              {ALL_TYPES.map((type) => (
                                <button
                                  key={type}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTeam(team.map(m =>
                                      m.uuid === member.uuid ? { ...m, selectedTeraType: type } : m
                                    ));
                                    setOpenTeraDropdownId(null);
                                  }}
                                  className={`py-1 px-1.5 rounded text-[10px] font-bold border transition-all ${member.selectedTeraType === type
                                    ? `border-cyan-500 bg-cyan-500/30 text-cyan-300`
                                    : `border-slate-600 bg-slate-700/30 text-slate-300 hover:border-cyan-600`
                                    }`}
                                >
                                  <TypeBadge type={type} className="text-[10px] px-1 py-0.5 w-full justify-center">
                                    {type.slice(0, 3)}
                                  </TypeBadge>
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Base Stats */}
                  <div className="flex-grow bg-black/20 rounded-lg p-3 border border-white/5">
                    <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1"><Zap size={12} /> BASE STATS</h4>
                    <StatBar label="HP" value={member.stats.hp} color="bg-green-500" />
                    <StatBar label="ATK" value={member.stats.attack} color="bg-orange-500" />
                    <StatBar label="DEF" value={member.stats.defense} color="bg-yellow-500" />
                    <StatBar label="SPA" value={member.stats.spAtk} color="bg-blue-500" />
                    <StatBar label="SPD" value={member.stats.spDef} color="bg-indigo-500" />
                    <StatBar label="SPE" value={member.stats.speed} color="bg-pink-500" />
                  </div>
                </div>

                {/* BOTTOM SECTION: MOVES */}
                <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800/50">
                  <div className="flex flex-wrap gap-2 mb-3 min-h-[30px]">
                    {member.selectedMoves.length === 0 && <span className="text-xs text-slate-500 italic">No moves selected (Max 4)</span>}
                    {member.selectedMoves.map(m => {
                      const moveInfo = member.moves.find((x: any) => x.name === m);
                      const color = moveInfo ? TYPE_COLORS[moveInfo.type] : "bg-slate-700";
                      return (
                        <span key={m} className={`text-xs font-bold text-white px-2 py-1 rounded shadow-sm capitalize border border-white/10 ${color}`}>
                          {m.replace(/-/g, " ")}
                        </span>
                      )
                    })}
                  </div>

                  <div className="border-t border-white/10 pt-2">
                    {member.moves.length > 0 ? (
                      <details className="group">
                        <summary className="cursor-pointer text-blue-300 text-xs hover:text-white font-bold select-none flex items-center gap-1 transition-colors">
                          <ChevronDown size={14} className="group-open:rotate-180 transition-transform" /> Edit Moves List
                        </summary>
                        <div className="mt-2 h-40 overflow-y-auto bg-slate-900/80 rounded border border-slate-700 p-2 grid grid-cols-2 gap-2 custom-scrollbar">
                          {member.moves.map((move: any) => {
                            const isSelected = member.selectedMoves.includes(move.name);
                            const badgeColor = TYPE_COLORS[move.type] || "bg-slate-600";
                            return (
                              <label key={move.name} className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition-all border ${isSelected ? 'border-blue-500 bg-blue-900/30' : 'border-transparent hover:bg-white/5'}`}>
                                <div className="flex items-center gap-2 overflow-hidden w-full">
                                  <input type="checkbox" checked={isSelected} onChange={() => toggleMove(member.uuid, move.name)} className="rounded border-slate-500 bg-slate-900 accent-blue-500 w-3 h-3 shrink-0" />
                                  <div className="flex flex-col overflow-hidden">
                                    <span className={`text-[11px] font-bold capitalize truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>{move.name.replace(/-/g, " ")}</span>
                                    <span className="text-[9px] text-slate-500 font-mono">
                                      {move.category === 'status' ? '-' : `PWR:${move.power || '-'}`} | ACC:{move.accuracy || '-'}%
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1 items-end ml-1">
                                  <CategoryBadge category={move.category} />
                                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded text-white ${badgeColor} w-[45px] text-center`}>
                                    {move.type.slice(0, 3)}
                                  </span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </details>
                    ) : (
                      <button onClick={() => refreshMemberData(member.uuid, member.name)} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded border border-slate-600 flex items-center gap-2 transition-colors w-full justify-center">
                        <DownloadCloud size={14} /> Load Move List
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- MODAL SEARCH (CẬP NHẬT FILTER) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">

            {/* Header Modal */}
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
              <h3 className="text-lg font-bold text-white">Add Pokemon</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
            </div>

            {/* --- THANH TÌM KIẾM + NÚT FILTER --- */}
            <div className="p-4 border-b border-slate-700 flex gap-2 items-center relative z-20">
              {/* Input */}
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input
                  id="search-input"
                  type="text"
                  placeholder="Type name (e.g., 'pika')..."
                  className="w-full bg-slate-950 border border-slate-600 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  value={modalQuery}
                  onChange={(e) => setModalQuery(e.target.value)}
                  autoComplete="off"
                />
                {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" size={16} />}
              </div>

              {/* Nút Filter */}
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`p-3 rounded-lg border transition-all ${filterType
                      ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]'
                      : 'bg-slate-800 border-slate-600 text-slate-400 hover:text-white hover:border-slate-500'
                    }`}
                  title="Filter by Type"
                >
                  <Filter size={20} />
                </button>

                {/* Dropdown Menu Filter */}
                {isFilterOpen && (
                  <>
                    {/* Lớp phủ để click outside đóng menu */}
                    <div className="fixed inset-0 z-30" onClick={() => setIsFilterOpen(false)} />

                    <div className="absolute top-full right-0 mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-40 p-2 w-64 animate-in fade-in zoom-in-95 duration-200 grid grid-cols-3 gap-1.5">
                      {/* Nút Reset Filter */}
                      <button
                        onClick={() => { setFilterType(null); setIsFilterOpen(false); }}
                        className={`col-span-3 py-1.5 rounded text-xs font-bold border transition-all mb-1 ${!filterType ? 'bg-white text-black border-white' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
                      >
                        ALL TYPES
                      </button>

                      {/* Danh sách Type */}
                      {ALL_TYPES.map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setFilterType(filterType === type ? null : type); // Toggle logic
                            setIsFilterOpen(false);
                          }}
                          className={`
                            py-1 px-1 rounded border transition-all flex items-center justify-center
                            ${filterType === type
                              ? 'bg-slate-700 border-white ring-1 ring-white'
                              : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                            }
                          `}
                        >
                          <TypeBadge type={type} className="text-[10px] py-0.5 px-1 w-full justify-center" />
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* --- RESULT LIST --- */}
            <div className="flex-grow overflow-y-auto p-2 space-y-2 custom-scrollbar bg-slate-950/50">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-500"><Loader2 className="animate-spin mb-2" /><span>Searching...</span></div>
              ) : modalResults.length === 0 ? (
                <div className="text-center text-slate-500 py-10">{modalQuery ? "No Pokemon found." : "Search to see results."}</div>
              ) : displayedResults.length === 0 ? (
                // Trường hợp có kết quả search nhưng bị Filter lọc hết
                <div className="flex flex-col items-center justify-center py-10 text-slate-500 gap-2">
                  <Filter className="opacity-50" size={32} />
                  <p>No {filterType?.toUpperCase()} Pokemon found in results.</p>
                  <button onClick={() => setFilterType(null)} className="text-blue-400 hover:underline text-sm">Clear Filter</button>
                </div>
              ) : (
                // Hiển thị kết quả đã lọc (displayedResults)
                displayedResults.map((p) => (
                  <button key={p.name} onClick={() => selectPokemonFromModal(p.name)} className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all group text-left">
                    <img src={p.sprite} className="w-12 h-12 pixelated bg-slate-900 rounded-lg border border-slate-800 group-hover:scale-110 transition-transform" alt={p.name} />
                    <div className="flex-grow">
                      <h4 className="font-bold text-white capitalize text-lg">{p.name}</h4>
                      <div className="flex gap-1">{p.types.map((t: string) => <TypeBadge key={t} type={t} className="text-[10px] py-0.5" />)}</div>
                    </div>
                    <Plus className="text-slate-500 group-hover:text-green-500 transition-colors" />
                  </button>
                ))
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}