import React from "react";
import { 
  Save, Trash2, Plus, LayoutList, ChevronDown, DownloadCloud, Loader2, Zap, Sparkles 
} from "lucide-react";
import { BuilderLayoutProps } from "@/components/builder/BuilderTypes";
import { TypeBadge ,  TYPE_COLORS, TYPE_GRADIENTS, ALL_TYPES} from "@/components/ui/TypeBadge";
import { CategoryBadge } from "@/components/battle/CategoryBadge";

// Component StatBar nội bộ (giữ nguyên style cũ)
const StatBar = ({ label, value, max = 255, color = "bg-blue-500" }: { label: string, value: number, max?: number, color?: string }) => (
  <div className="flex items-center gap-2 text-[10px] font-mono mb-1">
    <span className="w-8 font-bold text-slate-400 uppercase">{label}</span>
    <div className="flex-grow h-1.5 bg-slate-800 rounded-full overflow-hidden">
      <div className={`h-full ${color}`} style={{ width: `${Math.min(100, (value / max) * 100)}%` }}></div>
    </div>
    <span className="w-6 text-right font-bold text-white">{value}</span>
  </div>
);

export default function DesktopBuilder({
  team, teamName, mySavedTeam, isSaving, isDataLoaded,
  setTeamName, handleOpenModal, saveTeamToDb, loadTeamToEdit, deleteTeam, resetBuilder,
  removeFromTeam, toggleMove, refreshMemberData, setOpenTeraDropdownId, openTeraDropdownId, setTeam,
  session // Prop này được truyền từ page cha
}: BuilderLayoutProps & { session: any }) {

  return (
    <div className="container mx-auto p-4 max-w-7xl h-[calc(100vh-80px)] flex gap-6">

      {/* --- SIDEBAR --- */}
      <div className="w-1/4 min-w-[250px] bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col shadow-xl">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-700">
          <h2 className="font-bold flex items-center gap-2 text-white"><LayoutList size={20} /> My Teams</h2>
          <button onClick={resetBuilder} className="p-1 hover:bg-slate-800 rounded text-green-400">
            <Plus size={20} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          
          {/* --- LOGIC HIỂN THỊ LOADING --- */}
          {!isDataLoaded ? (
            // SKELETON LOADING UI
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-3 rounded-lg border border-slate-800 bg-slate-950/50 animate-pulse">
                {/* Tên Team giả */}
                <div className="h-4 bg-slate-800 rounded w-3/4 mb-3"></div>
                {/* 6 hình tròn giả */}
                <div className="flex -space-x-2">
                  {[1,2,3,4,5,6].map(c => (
                    <div key={c} className="w-8 h-8 rounded-full bg-slate-800 border border-slate-900"></div>
                  ))}
                </div>
              </div>
            ))
          ) : mySavedTeam.length === 0 ? (
            <div className="text-center text-slate-500 py-8 text-sm">No teams saved yet.</div>
          ) : (
            // RENDER LIST NHƯ CŨ
            mySavedTeam
              .filter((t: any) => t.userId === session?.user?.id)
              .map((t) => (
                <div key={t.id} onClick={() => loadTeamToEdit(t)} className="group p-3 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800 cursor-pointer relative transition-all">
                  <div className="font-bold text-sm mb-1 truncate pr-6 text-slate-200">{t.name}</div>
                  <div className="flex -space-x-2">
                    {(t.pokemons || []).slice(0, 6).map((p: any) => (
                      <img key={p.id} src={p.spriteUrl} className="w-8 h-8 rounded-full bg-slate-700 border border-slate-900" alt={p.name} />
                    ))}
                  </div>
                  <button onClick={(e) => deleteTeam(t.id, e)} className="absolute top-2 right-2 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={16} />
                  </button>
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
                            <div className="fixed inset-0 z-40 cursor-default" onClick={(e) => { e.stopPropagation(); setOpenTeraDropdownId(null); }} />
                            <div className="absolute top-full left-0 right-0 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 grid grid-cols-3 gap-1 p-2 w-48 animate-in fade-in zoom-in-95 duration-200">
                              {ALL_TYPES.map((type: string) => (
                                <button
                                  key={type}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Update Tera Type trực tiếp
                                    setTeam(team.map(m => m.uuid === member.uuid ? { ...m, selectedTeraType: type } : m));
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
    </div>
  );
}