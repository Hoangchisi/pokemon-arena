"use client";

import { useState, useEffect } from "react";
import { X, Zap, Sparkles, Crown, CheckCircle2, Circle } from "lucide-react";
import { getPokemonTransformationVarieties } from "@/lib/pokemon-varieties";
import { getPokemonByName } from "@/lib/pokemon-forms";
import { BattlePokemon } from "@/types/battle";
import { TypeBadge } from "@/components/ui/TypeBadge";
import type { MegaForm, GmaxForm } from "@/types/pokemon";

interface MetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pokemon: BattlePokemon | null;
  selectedOption: 'mega' | 'gmax' | 'tera' | null;
  onSelectOption: (option: 'mega' | 'gmax' | 'tera' | null) => void;

  isPlayerTurn: boolean;
  usedMechanics: {
    mega: boolean;
    gmax: boolean;
    tera: boolean;
  };
}

export function MetricsModal({
  isOpen,
  onClose,
  pokemon,
  selectedOption, 
  onSelectOption,
  isPlayerTurn,
  usedMechanics,
}: MetricsModalProps) {
  const [hasMega, setHasMega] = useState(false);
  const [hasGmax, setHasGmax] = useState(false);
  const [loading, setLoading] = useState(true);
  const [megaForm, setMegaForm] = useState<MegaForm | null>(null);
  const [gmaxForm, setGmaxForm] = useState<GmaxForm | null>(null);
  
  useEffect(() => {
    if (isOpen && pokemon) {
      setLoading(true);
      
      // Lấy dữ liệu form từ local data
      const pokemonData = getPokemonByName(pokemon.name);
      if (pokemonData?.forms) {
        setMegaForm(pokemonData.forms.mega || null);
        setGmaxForm(pokemonData.forms.gmax || null);
        setHasMega(!!pokemonData.forms.mega);
        setHasGmax(!!pokemonData.forms.gmax);
        setLoading(false);
      } else {
        // Fallback: gọi PokeAPI nếu không có local data
        getPokemonTransformationVarieties(pokemon.name)
          .then(result => {
            setHasMega(result.hasMega);
            setHasGmax(result.hasGmax);
          })
          .finally(() => setLoading(false));
      }
    }
  }, [isOpen, pokemon]);

  if (!isOpen || !pokemon) return null;

  // --- LOGIC KIỂM TRA TRẠNG THÁI ---
  const targetTeraType = (pokemon as any).selectedTeraType || (pokemon as any).teraType || pokemon.types[0];
  const isMegaActive = pokemon?.transformation?.form === 'mega';
  const isGmaxActive = pokemon?.transformation?.form === 'gmax';
  const isTeraActive = pokemon?.terastallize?.isTerastallized;

  // Kiểm tra xem Pokemon này đã dùng bất kỳ cơ chế nào chưa
  const thisPokemonHasUsedMechanic = (pokemon as any).hasUsedMechanic || isMegaActive || isGmaxActive || isTeraActive;

  // Khóa nếu không phải lượt người chơi
  const isTurnLocked = !isPlayerTurn;

  // Hàm xử lý khi click vào ô chọn
  const handleToggle = (option: 'mega' | 'gmax' | 'tera') => {
      if (selectedOption === option) {
          onSelectOption(null); // Bỏ chọn nếu ấn lại
      } else {
          onSelectOption(option); // Chọn mới
      }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-slate-600 rounded-2xl p-6 w-96 shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Metrics Menu</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Pokemon Info */}
        <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <img src={pokemon.sprite} alt={pokemon.name} className="w-16 h-16 pixelated" />
            <div>
              <p className="text-lg font-bold text-white capitalize">{pokemon.name}</p>
              <p className="text-sm text-slate-400">Lv. {pokemon.level}</p>
              {pokemon.transformation?.form && pokemon.transformation.form !== 'normal' && (
                <p className="text-xs text-yellow-400 font-semibold capitalize">
                  Current Form: {pokemon.transformation.form}
                  {pokemon.transformation.form === 'gmax' && ` (${pokemon.transformation.gmaxTurnsLeft} turns left)`}
                </p>
              )}
              {isTeraActive && (
                 <p className="text-xs text-cyan-400 font-semibold capitalize flex items-center gap-1">
                    Tera Type: <TypeBadge type={pokemon.terastallize?.teraType || targetTeraType} className="text-[10px] px-1 py-0" />
                 </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="text-center text-slate-400 py-4">
            <p>Checking available transformations...</p>
          </div>
        )}

        {!loading && (
          <div className="space-y-3">
            {/* --- MEGA BUTTON --- */}
            <button
              onClick={() => handleToggle('mega')}
              disabled={
                !hasMega || 
                isTurnLocked || 
                // Disable nếu: (Pokemon này đã biến hình cái khác VÀ không phải đang Mega) 
                // HOẶC (Team đã dùng Mega rồi VÀ con này chưa Mega)
                (!isMegaActive && (thisPokemonHasUsedMechanic || usedMechanics.mega))
              }
              className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 relative
                ${selectedOption === 'mega' || isMegaActive
                    ? "border-purple-500 bg-purple-900/40 ring-1 ring-purple-400" 
                    : (hasMega && !usedMechanics.mega && !thisPokemonHasUsedMechanic && !isTurnLocked)
                        ? "border-slate-700 bg-slate-800/30 hover:bg-slate-800" 
                        : "border-slate-800 bg-slate-900 opacity-30 cursor-not-allowed grayscale"}
              `}
            >
              <div className={`mr-1 ${selectedOption === 'mega' || isMegaActive ? 'text-purple-400' : 'text-slate-600'}`}>
                 {(selectedOption === 'mega' || isMegaActive) ? <CheckCircle2 size={24} /> : <Circle size={24} />}
              </div>
              <Crown size={20} className={(selectedOption === 'mega' || isMegaActive) ? "text-purple-400" : "text-slate-500"} />
              <div className="text-left flex-grow">
                <p className="font-bold text-white text-sm">
                    {megaForm?.name || "Mega Evolution"}
                    {isMegaActive && <span className="ml-2 text-xs text-purple-400 font-normal">(Active)</span>}
                </p>
                <p className="text-[10px] text-slate-400">Stat boost</p>
              </div>
            </button>

            {/* --- GMAX BUTTON --- */}
            <button
              onClick={() => handleToggle('gmax')}
              disabled={
                !hasGmax || 
                isTurnLocked ||
                // Disable nếu: (Pokemon này đã biến hình cái khác VÀ không phải đang Gmax)
                // HOẶC (Team đã dùng Gmax rồi VÀ con này chưa Gmax)
                (!isGmaxActive && (thisPokemonHasUsedMechanic || usedMechanics.gmax))
              }
              className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 relative
                ${selectedOption === 'gmax' || isGmaxActive
                    ? "border-red-500 bg-red-900/40 ring-1 ring-red-400" 
                    : (hasGmax && !usedMechanics.gmax && !thisPokemonHasUsedMechanic && !isTurnLocked)
                        ? "border-slate-700 bg-slate-800/30 hover:bg-slate-800" 
                        : "border-slate-800 bg-slate-900 opacity-30 cursor-not-allowed grayscale"}
              `}
            >
               <div className={`mr-1 ${selectedOption === 'gmax' || isGmaxActive ? 'text-red-400' : 'text-slate-600'}`}>
                 {(selectedOption === 'gmax' || isGmaxActive) ? <CheckCircle2 size={24} /> : <Circle size={24} />}
              </div>
              <Zap size={20} className={(selectedOption === 'gmax' || isGmaxActive) ? "text-red-400" : "text-slate-500"} />
              <div className="text-left flex-grow">
                <p className="font-bold text-white text-sm">
                    {gmaxForm?.name || "Gigantamax"}
                    {isGmaxActive && <span className="ml-2 text-xs text-red-400 font-normal">(Active)</span>}
                </p>
                <p className="text-[10px] text-slate-400">2x HP (3 Turns)</p>
              </div>
            </button>

            {/* --- TERA BUTTON --- */}
            <button
              onClick={() => handleToggle('tera')}
              disabled={
                isTurnLocked ||
                // Disable nếu: (Pokemon này đã biến hình cái khác VÀ không phải đang Tera)
                // HOẶC (Team đã dùng Tera rồi VÀ con này chưa Tera)
                (!isTeraActive && (thisPokemonHasUsedMechanic || usedMechanics.tera))
              }
              className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 relative
                ${selectedOption === 'tera' || isTeraActive
                    ? "border-cyan-500 bg-cyan-900/40 ring-1 ring-cyan-400" 
                    : (!usedMechanics.tera && !thisPokemonHasUsedMechanic && !isTurnLocked)
                        ? "border-slate-700 bg-slate-800/30 hover:bg-slate-800" 
                        : "border-slate-800 bg-slate-900 opacity-30 cursor-not-allowed grayscale"}
              `}
            >
              <div className={`mr-1 ${selectedOption === 'tera' || isTeraActive ? 'text-cyan-400' : 'text-slate-600'}`}>
                 {(selectedOption === 'tera' || isTeraActive) ? <CheckCircle2 size={24} /> : <Circle size={24} />}
              </div>
              <Sparkles size={20} className={(selectedOption === 'tera' || isTeraActive) ? "text-cyan-400" : "text-slate-500"} />
              <div className="text-left flex-grow">
                <p className="font-bold text-white text-sm flex items-center gap-2">
                    Terastallize
                    {isTeraActive && <span className="text-xs text-cyan-400 font-normal">(Active)</span>}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                   <span className="text-[10px] text-slate-400">Into:</span>
                   <TypeBadge 
                        type={isTeraActive ? pokemon.terastallize?.teraType : targetTeraType} 
                        className="text-[9px] px-1 py-0" 
                   />
                </div>
              </div>
            </button>
          </div>
        )}
        
        {/* Nút Confirm */}
        <button onClick={onClose} className="mt-4 w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg text-sm transition-colors">
           Confirm Selection
        </button>

        {/* Info Box */}
        <div className="mt-6 p-3 bg-blue-900/20 border border-blue-700 rounded-lg text-xs text-blue-300 space-y-1">
          <p className="font-semibold">ℹ️ Transformation Info</p>
          <p>• Mega Evolution: Permanent stat increase</p>
          <p>• Gigantamax: 3 turns, increased HP & move power</p>
          <p>• Terastallize: Change type to your Tera Type</p>
        </div>
      </div>
    </div>
  );
}