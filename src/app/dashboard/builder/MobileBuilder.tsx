import { useState } from "react";
import { 
  Menu, X, Plus, Save, Trash2, LayoutList, ChevronDown, DownloadCloud, Loader2, Zap 
} from "lucide-react";
import { BuilderLayoutProps } from "@/components/builder/BuilderTypes";
import { TypeBadge } from "@/components/ui/TypeBadge";
import { CategoryBadge } from "@/components/battle/CategoryBadge";
import { TYPE_COLORS, TYPE_GRADIENTS, ALL_TYPES } from "@/lib/constants";

export default function MobileBuilder({
  team, teamName, mySavedTeam, isSaving,isDataLoaded,
  setTeamName, handleOpenModal, saveTeamToDb, loadTeamToEdit, deleteTeam, resetBuilder,
  removeFromTeam, toggleMove, refreshMemberData, setOpenTeraDropdownId, openTeraDropdownId, setTeam
}: BuilderLayoutProps) {
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Hàm load team xong thì tự đóng drawer
  const handleLoadTeam = (t: any) => {
    loadTeamToEdit(t);
    setIsDrawerOpen(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] bg-slate-950 relative overflow-hidden">
      
      {/* --- MOBILE HEADER --- */}
      <div className="bg-slate-900 border-b border-slate-800 p-3 flex items-center gap-3 sticky top-0 z-30 shadow-md">
        <button onClick={() => setIsDrawerOpen(true)} className="p-2 text-slate-300 hover:bg-slate-800 rounded-lg">
          <Menu size={24} />
        </button>
        
        <input 
          value={teamName} 
          onChange={(e) => setTeamName(e.target.value)} 
          className="flex-grow text-lg font-bold bg-transparent text-white outline-none placeholder-slate-600 min-w-0 truncate" 
          placeholder="Team Name..."
        />

        <button onClick={handleOpenModal} className="bg-green-600 text-white p-2 rounded-lg shadow-lg active:scale-95">
           <Plus size={24} />
        </button>
        <button onClick={saveTeamToDb} disabled={isSaving} className="bg-blue-600 text-white p-2 rounded-lg shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center min-w-[44px]">
           {isSaving ? <Loader2 className="animate-spin" size={24}/> : <Save size={24} />}
        </button>
      </div>

      {/* --- DRAWER --- */}
      {isDrawerOpen && (
        <div className="absolute inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
          <div className="relative w-[85%] max-w-[320px] bg-slate-900 h-full border-r border-slate-700 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
             
             {/* Header Drawer */}
             <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
                <h2 className="font-bold text-white flex gap-2"><LayoutList /> My Teams</h2>
                <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400"><X size={24}/></button>
             </div>

             <div className="flex-grow overflow-y-auto p-2 space-y-2">
                <button onClick={() => {resetBuilder(); setIsDrawerOpen(false)}} className="w-full p-3 border border-dashed border-slate-600 rounded text-green-400 hover:bg-slate-800 flex justify-center gap-2 font-bold mb-4">
                    <Plus /> Create New Team
                </button>
                
                {/* --- LOGIC HIỂN THỊ LOADING --- */}
                {!isDataLoaded ? (
                  // SKELETON MOBILE
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="p-3 bg-slate-950/50 border border-slate-800 rounded-lg animate-pulse">
                      <div className="h-4 bg-slate-800 rounded w-2/3 mb-2"></div>
                      <div className="flex -space-x-2">
                        {[1,2,3,4,5,6].map(c => <div key={c} className="w-8 h-8 rounded-full bg-slate-800 border border-slate-900"></div>)}
                      </div>
                    </div>
                  ))
                ) : (
                  // LIST NHƯ CŨ
                  mySavedTeam.map(t => (
                    <div key={t.id} onClick={() => handleLoadTeam(t)} className="p-3 bg-slate-950 border border-slate-800 rounded-lg relative hover:bg-slate-800 active:bg-slate-800 transition-colors">
                        <div className="font-bold text-slate-200 mb-2 truncate pr-6">{t.name}</div>
                        <div className="flex -space-x-2">
                            {t.pokemons?.slice(0,6).map((p:any) => <img key={p.id} src={p.spriteUrl} className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700"/>)}
                        </div>
                        <button onClick={(e) => deleteTeam(t.id, e)} className="absolute top-3 right-3 text-slate-500 p-2 hover:text-red-500"><Trash2 size={18}/></button>
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>
      )}

      {/* --- MAIN CONTENT (LIST) --- */}
      <div className="flex-grow overflow-y-auto p-3 pb-20 space-y-4 custom-scrollbar">
        {team.length === 0 ? (
           <div className="h-64 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-500 gap-4 mt-10">
              <p>Your team is empty.</p>
              <button onClick={handleOpenModal} className="text-blue-400 font-bold text-lg flex items-center gap-2 hover:underline">
                 <Plus /> Add Pokemon
              </button>
           </div>
        ) : (
           team.map((member, index) => {
              const gradient = TYPE_GRADIENTS[member.types[0]] || TYPE_GRADIENTS['normal'];
              return (
                 <div key={member.uuid} className={`relative p-4 rounded-xl border shadow-lg bg-gradient-to-br ${gradient} flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-300`}>
                    <div className="absolute top-2 left-3 text-[10px] font-bold text-white/50">#{index + 1}</div>
                    <button onClick={() => removeFromTeam(member.uuid)} className="absolute top-2 right-2 p-2 bg-black/30 text-slate-300 rounded-full z-10 active:scale-95"><Trash2 size={20} /></button>
                    
                    {/* Top: Avatar & Stats */}
                    <div className="flex gap-4 items-center">
                       <div className="w-24 shrink-0 flex flex-col items-center">
                          <div className="relative w-20 h-20">
                              <div className="absolute inset-0 bg-white/10 blur-xl rounded-full"></div>
                              <img src={member.sprite} className="w-full h-full object-contain drop-shadow-md pixelated relative z-10" />
                          </div>
                          
                          <div className="flex gap-1 flex-wrap justify-center mt-1">{member.types.map(t => <TypeBadge key={t} type={t} className="text-[9px] px-1.5 py-0.5 shadow-sm"/>)}</div>
                       </div>
                       
                       <div className="flex-grow space-y-2">
                          <h3 className="font-black text-white text-xl leading-tight capitalize drop-shadow-md">{member.name}</h3>
                          
                          {/* Stats Bar simplified */}
                          <div className="bg-black/20 rounded-lg p-2 text-[10px] border border-white/5">
                             <div className="flex justify-between text-slate-300 border-b border-white/5 pb-1 mb-1 font-mono"><span>HP: <span className="text-green-400 font-bold">{member.stats.hp}</span></span> <span>SPE: <span className="text-pink-400 font-bold">{member.stats.speed}</span></span></div>
                             <div className="flex justify-between text-slate-300 border-b border-white/5 pb-1 mb-1 font-mono"><span>ATK: <span className="text-orange-400 font-bold">{member.stats.attack}</span></span> <span>SPA: <span className="text-blue-400 font-bold">{member.stats.spAtk}</span></span></div>
                             <div className="flex justify-between text-slate-300 font-mono"><span>DEF: <span className="text-yellow-400 font-bold">{member.stats.defense}</span></span> <span>SPD: <span className="text-indigo-400 font-bold">{member.stats.spDef}</span></span></div>
                          </div>
                          
                          {/* Tera Mobile */}
                          <div className="relative">
                            <button onClick={(e) => {e.stopPropagation(); setOpenTeraDropdownId(openTeraDropdownId === member.uuid ? null : member.uuid)}} 
                                className={`w-full border rounded py-1 px-2 text-xs font-bold text-cyan-300 flex justify-between items-center transition-all ${openTeraDropdownId === member.uuid ? 'bg-cyan-900/40 border-cyan-500' : 'bg-slate-900/50 border-white/20'}`}>
                                <span>Tera: {member.selectedTeraType ? member.selectedTeraType.toUpperCase() : 'NONE'}</span>
                                <ChevronDown size={14} className={`transition-transform ${openTeraDropdownId === member.uuid ? 'rotate-180' : ''}`}/>
                            </button>
                            {openTeraDropdownId === member.uuid && (
                                <>
                                    <div className="fixed inset-0 z-20" onClick={() => setOpenTeraDropdownId(null)}/>
                                    <div className="absolute top-full left-0 z-30 w-full bg-slate-800 border border-slate-600 rounded mt-1 grid grid-cols-4 gap-1 p-2 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                                        {ALL_TYPES.map(t => (
                                            <button key={t} onClick={() => {setTeam(prev => prev.map(m => m.uuid === member.uuid ? {...m, selectedTeraType: t}:m)); setOpenTeraDropdownId(null)}} 
                                                className={`flex justify-center p-1 rounded border transition-all ${member.selectedTeraType === t ? 'border-cyan-500 bg-cyan-900/30' : 'border-transparent hover:bg-white/10'}`}>
                                                <TypeBadge type={t} className="w-full h-6 text-[8px] flex items-center justify-center p-0"/>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                          </div>
                       </div>
                    </div>

                    {/* Moves Section */}
                    <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800/50">
                        {/* Selected Moves Preview (Badges) */}
                        <div className="flex flex-wrap gap-2 mb-3 min-h-[30px]">
                            {member.selectedMoves.length === 0 && <span className="text-xs text-slate-500 italic">No moves selected (Max 4)</span>}
                            {member.selectedMoves.map(m => {
                                const info = member.moves.find((x: any) => x.name === m);
                                const color = info ? TYPE_COLORS[info.type] : "bg-slate-700";
                                return (
                                    <span key={m} className={`text-xs font-bold px-2 py-1 rounded shadow-sm text-white border border-white/10 ${color}`}>
                                        {m.replace(/-/g, ' ')}
                                    </span>
                                )
                            })}
                        </div>
                        
                        <div className="border-t border-white/10 pt-2">
                        {member.moves.length > 0 ? (
                             <details className="group">
                                <summary className="w-full bg-slate-800/80 p-2 rounded text-xs font-bold text-blue-300 flex justify-center items-center gap-2 cursor-pointer select-none active:bg-slate-700 transition-colors">
                                    <ChevronDown size={14} className="group-open:rotate-180 transition-transform"/> Edit Moves List
                                </summary>
                                
                                {/* --- UPDATED: FULL MOVE DETAILS (Like Desktop) --- */}
                                <div className="mt-2 h-64 overflow-y-auto bg-slate-900/90 rounded border border-slate-700 p-2 grid grid-cols-1 gap-2 custom-scrollbar">
                                    {member.moves.map((move: any) => {
                                        const isSelected = member.selectedMoves.includes(move.name);
                                        const badgeColor = TYPE_COLORS[move.type] || "bg-slate-600";
                                        
                                        return (
                                            <label key={move.name} className={`flex items-center justify-between p-2 rounded cursor-pointer border transition-all ${isSelected ? 'border-blue-500 bg-blue-900/20' : 'border-slate-800 bg-slate-950/50 hover:bg-slate-800'}`}>
                                                
                                                {/* Left: Checkbox & Name & Stats */}
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={isSelected} 
                                                        onChange={() => toggleMove(member.uuid, move.name)} 
                                                        className="w-5 h-5 rounded border-slate-500 bg-slate-900 accent-blue-500 shrink-0" 
                                                    />
                                                    <div className="flex flex-col min-w-0">
                                                        <span className={`text-sm font-bold capitalize truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                                            {move.name.replace(/-/g, ' ')}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 font-mono">
                                                            {move.category === 'status' ? 'Status' : `PWR:${move.power || '-'} | ACC:${move.accuracy || '-'}%`}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Right: Badges (Category & Type) */}
                                                <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                                                    <CategoryBadge category={move.category} />
                                                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded text-white ${badgeColor} w-12 text-center`}>
                                                        {move.type.slice(0,3)}
                                                    </span>
                                                </div>
                                            </label>
                                        )
                                    })}
                                </div>
                             </details>
                        ) : (
                            <button onClick={() => refreshMemberData(member.uuid, member.name)} className="w-full py-3 bg-slate-800 rounded border border-slate-600 text-slate-300 flex justify-center items-center gap-2 hover:bg-slate-700 active:scale-95 transition-all">
                                <DownloadCloud size={16}/> Load Moves
                            </button>
                        )}
                        </div>
                    </div>
                 </div>
              )
           })
        )}
      </div>
    </div>
  );
}