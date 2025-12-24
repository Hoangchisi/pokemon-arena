"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-hot-toast";
import { TeamMember } from "@/types/pokemon";
import { useUserStore } from "@/hooks/useUserStore";
import { getPokemonDetails} from "@/lib/pokeapi";
import { getPokemonByName } from "@/lib/pokemon-forms";
// Import các Component giao diện đã tách
import MobileBuilder from "./MobileBuilder";
import DesktopBuilder from "./DesktopBuilder";
import SearchModal from "@/components/builder/SearchModal";
import { BuilderLayoutProps } from "@/components/builder/BuilderTypes";

export default function TeamBuilderPage() {
  const { data: session } = useSession();
  const { mySavedTeam, fetchUserData, setSavedTeam, isDataLoaded } = useUserStore();

  // --- GLOBAL STATES ---
  const [teamName, setTeamName] = useState("My New Team");
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [openTeraDropdownId, setOpenTeraDropdownId] = useState<string | null>(null);

  // --- MODAL STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Init Data
  useEffect(() => { fetchUserData(); }, [fetchUserData]);

  // =================================================================
  // 1. LOGIC: LOAD TEAM (RESTORE DATA)
  // =================================================================
  const loadTeamToEdit = async (savedTeam: any) => {
    // Reset state cơ bản
    setEditingTeamId(savedTeam.id);
    setTeamName(savedTeam.name);

    // Hiển thị thông báo đang tải
    const toastId = toast.loading("Restoring team data...");

    try {
      // Bước 1: Map dữ liệu cơ bản từ Database (chưa có danh sách Move chi tiết)
      const basicMapped: TeamMember[] = savedTeam.pokemons.map((p: any) => ({
        uuid: uuidv4(),
        id: p.pokedexId,
        name: p.name,
        types: p.types,
        sprite: p.spriteUrl,
        stats: { 
            hp: p.hp, attack: p.attack, defense: p.defense, 
            spAtk: p.spAtk, spDef: p.spDef, speed: p.stats?.speed || p.speed 
        },
        moves: [], // Tạm thời để trống
        selectedMoves: [p.move1, p.move2, p.move3, p.move4].filter(Boolean),
        selectedTeraType: p.teraType || null
      }));

      // Bước 2: Cập nhật UI ngay lập tức với dữ liệu cơ bản để người dùng không phải chờ
      setTeam(basicMapped);

      // Bước 3: Fetch dữ liệu chi tiết (Move List) cho từng Pokemon
      // Dùng Promise.all để tải song song cho nhanh
      const enrichedTeam = await Promise.all(basicMapped.map(async (member) => {
        // Ưu tiên lấy từ Cache local (file json lớn)
        const localData = getPokemonByName(member.name);
        if (localData && localData.moves && localData.moves.length > 0) {
            return { ...member, moves: localData.moves };
        }
        
        // Nếu không có trong cache, gọi API
        const apiData = await getPokemonDetails(member.name);
        if (apiData) {
            return { ...member, moves: apiData.moves };
        }
        
        return member;
      }));

      // Bước 4: Cập nhật lại Team với đầy đủ Move List
      setTeam(enrichedTeam);

      // Báo thành công (Cập nhật lại cái toast đang loading)
      toast.success("Team data restored successfully!", { id: toastId });

    } catch (error) {
      console.error(error);
      toast.error("Failed to load some move details.", { id: toastId });
    }
  };

  // =================================================================
  // 2. LOGIC: SAVE TEAM
  // =================================================================
  const saveTeamToDb = async () => {
     if (team.length === 0) return toast.error("Your team is empty!");
     if (!session?.user) return toast.error("Please login to save!");
     if (!teamName.trim()) return toast.error("Please name your team!");

     setIsSaving(true);
     const toastId = toast.loading("Saving team to database...");

     // Chuẩn bị payload
     const payload = {
        name: teamName,
        pokemons: team.map((p, index) => ({
            pokedexId: p.id,
            name: p.name,
            hp: p.stats.hp,
            attack: p.stats.attack,
            defense: p.stats.defense,
            spAtk: p.stats.spAtk,
            spDef: p.stats.spDef,
            speed: p.stats.speed,
            types: p.types,
            spriteUrl: p.sprite,
            order: index,
            move1: p.selectedMoves[0] || null,
            move2: p.selectedMoves[1] || null,
            move3: p.selectedMoves[2] || null,
            move4: p.selectedMoves[3] || null,
            teraType: p.selectedTeraType || null,
        }))
     };

     try {
        let res;
        let isUpdate = !!editingTeamId;

        if (isUpdate) {
            // Update Existing Team
            res = await fetch(`/api/teams/${editingTeamId}`, {
                method: "PUT",
                body: JSON.stringify(payload)
            });
        } else {
            // Create New Team
            res = await fetch("/api/teams", {
                method: "POST",
                body: JSON.stringify(payload)
            });
        }

        if (!res.ok) throw new Error("Failed to save team");

        const savedData = await res.json();
        
        // Fix dữ liệu trả về để update store mà không cần reload
        if (!savedData.pokemons || savedData.pokemons.length === 0) {
            savedData.pokemons = payload.pokemons; // Fallback optimistic
        }
        savedData.userId = session.user.id;

        // Cập nhật Store Local
        if (isUpdate) {
            const updatedList = mySavedTeam.map(t => t.id === editingTeamId ? savedData : t);
            setSavedTeam(updatedList);
            toast.success("Team updated successfully!", { id: toastId });
        } else {
            setSavedTeam([savedData, ...mySavedTeam]);
            setEditingTeamId(savedData.id);
            toast.success("Team created successfully!", { id: toastId });
        }

     } catch (error: any) {
        console.error("Save Error:", error);
        toast.error(`Error: ${error.message}`, { id: toastId });
     } finally {
        setIsSaving(false);
     }
  };

  // =================================================================
  // 3. LOGIC: ACTIONS (Refresh, Toggle, Delete...)
  // =================================================================
  
  const resetBuilder = () => { 
      setEditingTeamId(null); 
      setTeamName("My New Team"); 
      setTeam([]); 
      toast("Builder reset", { icon: "🧹" });
  };
  
  const refreshMemberData = async (uuid: string, name: string) => {
    const toastId = toast.loading(`Fetching moves for ${name}...`);
    
    // Check local first
    const localData = getPokemonByName(name);
    if(localData && localData.moves?.length > 0) {
        setTeam(prev => prev.map(m => m.uuid === uuid ? {...m, moves: localData.moves} : m));
        toast.success("Moves loaded from cache!", { id: toastId });
        return;
    }

    // Fetch API
    const data = await getPokemonDetails(name);
    if(data) {
        setTeam(prev => prev.map(m => m.uuid === uuid ? {...m, moves: data.moves} : m));
        toast.success("Moves loaded from API!", { id: toastId });
    } else {
        toast.error("Failed to load moves", { id: toastId });
    }
  };

  const toggleMove = (uuid: string, move: string) => {
    setTeam(prev => prev.map(m => {
        if (m.uuid !== uuid) return m;
        const exists = m.selectedMoves.includes(move);
        if (!exists && m.selectedMoves.length >= 4) { 
            toast.error("Max 4 moves allowed!"); 
            return m; 
        }
        return { ...m, selectedMoves: exists ? m.selectedMoves.filter(x => x !== move) : [...m.selectedMoves, move] };
    }));
  };

  const removeFromTeam = (uuid: string) => {
      setTeam(prev => prev.filter(p => p.uuid !== uuid));
  };

  const deleteTeam = async (id: string, e: React.MouseEvent) => {
     e.stopPropagation();
     if(!confirm("Are you sure you want to delete this team?")) return;
     
     const toastId = toast.loading("Deleting team...");
     try {
         await fetch(`/api/teams/${id}`, { method: "DELETE" });
         setSavedTeam(mySavedTeam.filter(t => t.id !== id));
         
         toast.success("Team deleted successfully", { id: toastId });
         
         if(editingTeamId === id) resetBuilder();
     } catch (e) { 
         toast.error("Failed to delete team", { id: toastId }); 
     }
  };

  // --- MODAL HANDLERS ---
  const handleOpenModal = () => {
    if (team.length >= 6) return toast.error("Team is full (Max 6)!");
    setIsModalOpen(true);
  };

  const selectPokemonFromModal = async (name: string) => {
      const toastId = toast.loading(`Adding ${name}...`);
      
      const data = await getPokemonDetails(name);
      if(data) {
          setTeam(prev => [...prev, { 
              ...data, 
              selectedMoves: [], 
              selectedTeraType: null, 
              uuid: uuidv4() 
          }]);
          
          toast.success(`Added ${name} to team!`, { id: toastId });
          setIsModalOpen(false);
      } else {
          toast.error(`Failed to add ${name}`, { id: toastId });
      }
  };

  // --- PROPS FOR CHILDREN ---
  const sharedProps: BuilderLayoutProps = {
    team, teamName, mySavedTeam, isSaving, setTeamName,
    handleOpenModal, saveTeamToDb, loadTeamToEdit, deleteTeam, resetBuilder,
    removeFromTeam, toggleMove, refreshMemberData, setOpenTeraDropdownId, openTeraDropdownId, setTeam,
    isDataLoaded
  };

  return (
    <>
      {/* Mobile View */}
      <div className="lg:hidden">
        <MobileBuilder {...sharedProps} />
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block">
        <DesktopBuilder {...sharedProps} session={session} />
      </div>

      {/* Modal Search dùng chung */}
      <SearchModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={selectPokemonFromModal} 
      />
    </>
  );
}