"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-hot-toast";
import { Search, Save, Trash2, Plus, RefreshCw, LayoutList, ChevronDown, DownloadCloud } from "lucide-react";
import { getPokemonDetails } from "@/lib/pokeapi";
import { TeamMember, PokemonData } from "@/types/pokemon";
import { TypeBadge } from "@/components/ui/TypeBadge";

export default function TeamBuilderPage() {
  // --- States ---
  const [teamName, setTeamName] = useState("My New Team");
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState<PokemonData | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const [savedTeams, setSavedTeams] = useState<any[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // --- 1. Fetch Saved Teams ---
  const fetchSavedTeams = async () => {
    try {
      const res = await fetch("/api/teams");
      if (res.ok) {
        const data = await res.json();
        setSavedTeams(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingTeams(false);
    }
  };

  useEffect(() => {
    fetchSavedTeams();
  }, []);

  // --- 2. Load Team to Edit ---
  const loadTeamToEdit = (savedTeam: any) => {
    setEditingTeamId(savedTeam.id);
    setTeamName(savedTeam.name);

    const mappedPokemons: TeamMember[] = savedTeam.pokemons.map((p: any) => ({
      uuid: uuidv4(),
      id: p.pokedexId,
      name: p.name,
      types: p.types,
      sprite: p.spriteUrl,
      stats: {
        hp: p.hp, attack: p.attack, defense: p.defense,
        spAtk: p.spAtk, spDef: p.spDef, speed: p.speed
      },
      // Khi load từ DB, ta chưa có list full moves để chọn -> Để rỗng
      moves: [],
      selectedMoves: [p.move1, p.move2, p.move3, p.move4].filter(Boolean)
    }));

    setTeam(mappedPokemons);
    toast.success(`Loaded team: ${savedTeam.name}`);
  };

  // --- 3. Feature: Refresh Member Data (Để lấy lại list Moves) ---
  const refreshMemberData = async (uuid: string, name: string) => {
    toast.loading(`Fetching moves for ${name}...`, { id: "loading-moves" });
    const data = await getPokemonDetails(name);

    if (data) {
      setTeam(prev => prev.map(member => {
        if (member.uuid !== uuid) return member;
        return {
          ...member,
          moves: data.moves, // Cập nhật lại list moves đầy đủ từ API
          stats: data.stats  // Cập nhật lại stats luôn cho chắc
        };
      }));
      toast.success("Moves loaded!", { id: "loading-moves" });
    } else {
      toast.error("Failed to load moves", { id: "loading-moves" });
    }
  };

  // --- 4. Logic Chọn Move (Toggle) ---
  const toggleMove = (memberUuid: string, moveName: string) => {
    // Bước 1: Tìm Pokemon đang được thao tác trong state hiện tại
    const currentMember = team.find(m => m.uuid === memberUuid);

    // Safety check
    if (!currentMember) return;

    const isSelected = currentMember.selectedMoves.includes(moveName);

    // Bước 2: Kiểm tra điều kiện (Validation) TRƯỚC KHI update state
    // Nếu chưa chọn (đang muốn thêm) mà đã đủ 4 chiêu -> Báo lỗi và Dừng lại
    if (!isSelected && currentMember.selectedMoves.length >= 4) {
      toast.error("Max 4 moves allowed!");
      return; // Return ngay tại đây, không chạy xuống setTeam bên dưới
    }

    // Bước 3: Cập nhật State (Lúc này logic đã an toàn, không chứa side effect)
    setTeam(prev => prev.map(member => {
      if (member.uuid !== memberUuid) return member;

      if (isSelected) {
        // Bỏ chọn
        return { ...member, selectedMoves: member.selectedMoves.filter(m => m !== moveName) };
      } else {
        // Chọn thêm
        return { ...member, selectedMoves: [...member.selectedMoves, moveName] };
      }
    }));
  };

  // --- 5. Reset / Add / Remove / Save Logic (Giữ nguyên) ---
  const resetBuilder = () => {
    setEditingTeamId(null);
    setTeamName("Change team name here");
    setTeam([]);
    setSearchResult(null);
    setSearchTerm("");
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm) return;
    setIsSearching(true);
    const data = await getPokemonDetails(searchTerm);
    if (data) setSearchResult(data);
    else toast.error("Pokemon not found!");
    setIsSearching(false);
  };

  const addToTeam = () => {
    if (!searchResult) return;
    if (team.length >= 6) return toast.error("Team is full!");
    setTeam([...team, { ...searchResult, selectedMoves: [], uuid: uuidv4() }]);
    setSearchResult(null);
    setSearchTerm("");
  };

  const removeFromTeam = (uuid: string) => {
    setTeam(team.filter((p) => p.uuid !== uuid));
  };

  const deleteTeam = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this team?")) return;
    try {
      await fetch(`/api/teams/${id}`, { method: "DELETE" });
      toast.success("Team deleted");
      fetchSavedTeams();
      if (editingTeamId === id) resetBuilder();
    } catch (err) { toast.error("Failed to delete"); }
  };

  const saveTeamToDb = async () => {
    if (team.length === 0) return toast.error("Empty team!");
    setIsSaving(true);
    // ... Logic payload giữ nguyên ...
    const payload = {
      name: teamName,
      pokemons: team.map((p, index) => ({
        pokedexId: p.id, name: p.name, hp: p.stats.hp, attack: p.stats.attack,
        defense: p.stats.defense, spAtk: p.stats.spAtk, spDef: p.stats.spDef, speed: p.stats.speed,
        types: p.types, spriteUrl: p.sprite, order: index,
        move1: p.selectedMoves[0], move2: p.selectedMoves[1],
        move3: p.selectedMoves[2], move4: p.selectedMoves[3],
      }))
    };

    try {
      let res;
      if (editingTeamId) {
        res = await fetch(`/api/teams/${editingTeamId}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        res = await fetch("/api/teams", { method: "POST", body: JSON.stringify(payload) });
      }
      if (!res.ok) throw new Error("Failed");

      toast.success(editingTeamId ? "Team updated!" : "Team created!");
      fetchSavedTeams();
      if (!editingTeamId) {
        const newTeam = await res.json();
        setEditingTeamId(newTeam.id);
      }
    } catch (error) { toast.error("Error saving team"); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl h-[calc(100vh-80px)] flex gap-6">

      {/* --- SIDEBAR --- */}
      <div className="w-1/4 min-w-[250px] bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col hidden lg:flex">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-700">
          <h2 className="font-bold flex items-center gap-2"><LayoutList size={20} /> My Teams</h2>
          <button onClick={resetBuilder} className="p-1 hover:bg-slate-800 rounded text-green-400">
            <Plus size={20} />
          </button>
        </div>
        <div className="flex-grow overflow-y-auto space-y-2 pr-1">
          {savedTeams.map((t) => (
            <div
              key={t.id} onClick={() => loadTeamToEdit(t)}
              className={`group p-3 rounded-lg border cursor-pointer transition-all hover:bg-slate-800 relative ${editingTeamId === t.id ? 'border-blue-500 bg-slate-800/50' : 'border-slate-800 bg-slate-950'}`}
            >
              <div className="font-bold text-sm mb-1 truncate pr-6">{t.name}</div>
              <div className="flex -space-x-2">
                {t.pokemons.slice(0, 6).map((p: any) => (
                  <img key={p.id} src={p.spriteUrl} className="w-8 h-8 rounded-full bg-slate-700 border border-slate-900" />
                ))}
              </div>
              <button onClick={(e) => deleteTeam(t.id, e)} className="absolute top-2 right-2 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* --- MAIN BUILDER --- */}
      <div className="flex-grow flex flex-col overflow-y-auto pr-2">
        {/* Header Controls */}
        <div className="flex justify-between items-center mb-6 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3 w-full">
            <input value={teamName} onChange={(e) => setTeamName(e.target.value)} className="text-2xl font-bold bg-transparent border-b border-transparent hover:border-slate-600 focus:border-blue-500 outline-none w-full max-w-md" />
          </div>
          <div className="flex gap-2">
            <button onClick={saveTeamToDb} disabled={isSaving} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-bold whitespace-nowrap">
              <Save size={18} /> {isSaving ? "Saving..." : "Save Team"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          {/* SEARCH AREA (Col 4) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
              <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                <input type="text" placeholder="Search Pokemon..." className="w-full bg-slate-950 p-2 rounded border border-slate-600 focus:border-blue-500 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <button type="submit" className="bg-blue-600 p-2 rounded hover:bg-blue-500">{isSearching ? <RefreshCw className="animate-spin" size={20} /> : <Search size={20} />}</button>
              </form>
              {searchResult && (
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-center animate-in fade-in zoom-in">
                  <img src={searchResult.sprite} className="w-24 h-24 mx-auto pixelated" />
                  <h3 className="font-bold capitalize text-lg">{searchResult.name}</h3>
                  <button onClick={addToTeam} className="w-full bg-green-600 hover:bg-green-500 py-2 rounded text-sm font-bold mt-2"><Plus className="inline mr-1" size={16} /> Add to Team</button>
                </div>
              )}
            </div>
          </div>

          {/* TEAM SLOTS (Col 8) */}
          <div className="lg:col-span-8 space-y-3 pb-20">
            {team.length === 0 && <div className="h-64 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center text-slate-500">Your team is empty.</div>}

            {team.map((member) => (
              <div key={member.uuid} className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex flex-col gap-3 relative animate-in fade-in slide-in-from-bottom-2">
                {/* Remove Button */}
                <button onClick={() => removeFromTeam(member.uuid)} className="absolute top-4 right-4 text-slate-500 hover:text-red-500"><Trash2 size={20} /></button>

                <div className="flex gap-4 items-center">
                  <img src={member.sprite} className="w-20 h-20 pixelated bg-slate-950 rounded-lg border border-slate-800" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold capitalize text-lg">{member.name}</h3>
                      {member.types.map(t => <TypeBadge key={t} type={t} className="text-[10px] py-0.5" />)}
                    </div>

                    {/* Hiển thị moves đã chọn */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {member.selectedMoves.length === 0 && <span className="text-xs text-slate-500">No moves selected</span>}
                      {member.selectedMoves.map(m => (
                        <span key={m} className="bg-slate-800 border border-slate-600 px-2 py-1 rounded text-xs capitalize text-slate-300">
                          {m.replace("-", " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* --- KHÔI PHỤC PHẦN CHỈNH SỬA MOVE --- */}
                <div className="border-t border-slate-800 pt-3">
                  {member.moves.length > 0 ? (
                    <details className="group">
                      <summary className="cursor-pointer text-blue-400 text-sm hover:underline font-medium select-none flex items-center gap-1">
                        <ChevronDown size={16} className="group-open:rotate-180 transition-transform" /> Edit Moves
                      </summary>
                      <div className="mt-2 h-40 overflow-y-auto bg-slate-950 rounded border border-slate-800 p-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                        {member.moves.map(move => (
                          <label key={move} className="flex items-center space-x-2 text-xs cursor-pointer hover:bg-slate-800 p-1.5 rounded transition-colors">
                            <input
                              type="checkbox"
                              checked={member.selectedMoves.includes(move)}
                              onChange={() => toggleMove(member.uuid, move)}
                              className="rounded border-slate-600 bg-slate-700 accent-blue-600"
                            />
                            <span className="capitalize truncate">{move.replace("-", " ")}</span>
                          </label>
                        ))}
                      </div>
                    </details>
                  ) : (
                    // Nếu list moves rỗng (do load từ DB), hiện nút tải lại
                    <button
                      onClick={() => refreshMemberData(member.uuid, member.name)}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded border border-slate-600 flex items-center gap-2 transition-colors"
                    >
                      <DownloadCloud size={14} /> Load Move List
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}