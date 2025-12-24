"use client";

import { useState, useEffect } from "react";
import { 
  Search, X, Filter, Loader2, Plus 
} from "lucide-react";
import { searchPokemonList } from "@/lib/pokeapi";
import { TypeBadge } from "@/components/ui/TypeBadge";
import { ALL_TYPES } from "@/lib/constants";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (pokemonName: string) => void;
}

export default function SearchModal({ isOpen, onClose, onSelect }: SearchModalProps) {
  // --- STATES ---
  const [modalQuery, setModalQuery] = useState("");
  const [modalResults, setModalResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Filter States
  const [filterType, setFilterType] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // --- EFFECT: RESET STATE ON OPEN ---
  useEffect(() => {
    if (isOpen) {
      setModalQuery("");
      setModalResults([]);
      setFilterType(null);
      setIsFilterOpen(false);
      setIsSearching(false);
      // Auto focus input sau khi modal mở (delay nhẹ để animation chạy xong)
      setTimeout(() => document.getElementById("search-modal-input")?.focus(), 100);
    }
  }, [isOpen]);

  // --- EFFECT: DEBOUNCE SEARCH LOGIC (Core Logic từ file cũ) ---
  useEffect(() => {
    // 1. Reset nếu input trống
    if (!modalQuery.trim()) {
      setModalResults([]);
      setIsSearching(false);
      return;
    }

    // 2. Set loading state
    setIsSearching(true);

    // 3. Timeout 0.5s
    const timeoutId = setTimeout(async () => {
      try {
        // Gọi API
        const results = await searchPokemonList(modalQuery);

        // Lọc kết quả (Logic cũ: bỏ mega/gmax/forms đặc biệt để tránh trùng lặp)
        const filteredResults = results.filter((p: any) => {
          const name = p.name.toLowerCase();
          return (
            !name.includes("mega") && 
            !name.includes("gmax") && 
            !name.includes("gigantamax") && 
            !name.includes("-primal") && 
            !name.includes("-ash") && 
            !name.includes("-battle-bond")
          );
        });

        setModalResults(filteredResults);
      } catch (error) {
        console.error("Search error:", error);
        setModalResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    // Cleanup timeout cũ nếu user gõ tiếp
    return () => clearTimeout(timeoutId);
  }, [modalQuery]);

  // --- FILTER LOGIC ---
  const displayedResults = modalResults.filter((p) => {
    if (!filterType) return true;
    return p.types.includes(filterType);
  });

  // Nếu không mở modal thì không render gì cả
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-lg sm:rounded-2xl sm:border border-slate-700 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* --- HEADER --- */}
        <div className="p-4 border-b border-slate-700 bg-slate-800 flex justify-between items-center shrink-0">
          <h3 className="font-bold text-white text-lg flex gap-2 items-center">
            <Search size={20} /> Add Pokemon
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* --- SEARCH BAR & FILTER --- */}
        <div className="p-3 border-b border-slate-700 bg-slate-900 shrink-0 flex gap-2 relative z-20">
          {/* Input Area */}
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              id="search-modal-input"
              type="text" 
              placeholder="Type name (e.g., 'pika')..." 
              className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-9 pr-8 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-600"
              value={modalQuery}
              onChange={(e) => setModalQuery(e.target.value)}
              autoComplete="off"
            />
            
            {/* Clear Button */}
            {modalQuery && !isSearching && (
              <button onClick={() => setModalQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                <X size={14} />
              </button>
            )}
            
            {/* Loading Spinner */}
            {isSearching && (
              <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" size={16} />
            )}
          </div>

          {/* Filter Button */}
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-2.5 rounded-lg border transition-all ${
                filterType 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
              }`}
              title="Filter by Type"
            >
              <Filter size={20} />
            </button>

            {/* Filter Dropdown */}
            {isFilterOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsFilterOpen(false)} />
                <div className="absolute top-full right-0 mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-40 p-2 w-64 animate-in fade-in zoom-in-95 duration-200 grid grid-cols-3 gap-1.5">
                  <button 
                    onClick={() => { setFilterType(null); setIsFilterOpen(false); }}
                    className={`col-span-3 py-1.5 rounded text-xs font-bold border transition-all mb-1 ${!filterType ? 'bg-white text-black border-white' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
                  >
                    ALL TYPES
                  </button>

                  {ALL_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setFilterType(filterType === type ? null : type);
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

        {/* --- RESULTS LIST --- */}
        <div className="flex-grow overflow-y-auto p-2 space-y-2 bg-slate-950/50 custom-scrollbar">
          {/* Case 1: Searching */}
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <Loader2 className="animate-spin mb-2 text-blue-500" size={32} />
              <span>Searching...</span>
            </div>
          ) : modalResults.length === 0 ? (
            /* Case 2: No Results / Empty */
            <div className="text-center text-slate-500 py-20 flex flex-col items-center gap-2">
               {modalQuery ? (
                 <>
                   <Search className="opacity-20" size={48} />
                   <p>No Pokemon found for "{modalQuery}"</p>
                 </>
               ) : (
                 <>
                   <Search className="opacity-20" size={48} />
                   <p>Start typing to search...</p>
                 </>
               )}
            </div>
          ) : displayedResults.length === 0 ? (
            /* Case 3: Results exist but filtered out */
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
                <Filter className="opacity-50" size={32} />
                <p>No {filterType?.toUpperCase()} Pokemon found.</p>
                <button onClick={() => setFilterType(null)} className="text-blue-400 hover:underline text-sm">Clear Filter</button>
            </div>
          ) : (
            /* Case 4: Show Results */
            displayedResults.map((p) => (
              <button 
                key={p.name} 
                onClick={() => onSelect(p.name)} // Gọi hàm select của parent
                className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all group text-left bg-slate-900/40"
              >
                <img 
                  src={p.sprite} 
                  className="w-12 h-12 pixelated bg-slate-950 rounded-lg border border-slate-800 group-hover:scale-110 transition-transform" 
                  alt={p.name} 
                />
                <div className="flex-grow">
                  <h4 className="font-bold text-white capitalize text-lg">{p.name}</h4>
                  <div className="flex gap-1">
                    {p.types.map((t: string) => <TypeBadge key={t} type={t} className="text-[10px] py-0.5" />)}
                  </div>
                </div>
                <div className="bg-slate-950 p-2 rounded-full group-hover:bg-green-500/20 transition-colors">
                  <Plus className="text-slate-500 group-hover:text-green-500 transition-colors" size={20} />
                </div>
              </button>
            ))
          )}
        </div>

      </div>
    </div>
  );
}