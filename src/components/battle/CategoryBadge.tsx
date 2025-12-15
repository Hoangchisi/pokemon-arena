import { Swords, Zap, CircleDot } from "lucide-react";

interface CategoryBadgeProps {
  category: string; // "physical" | "special" | "status"
}

export const CategoryBadge = ({ category }: CategoryBadgeProps) => {
  const cat = category?.toLowerCase();

  if (cat === "physical") {
    return (
      <div className="flex items-center gap-1 bg-red-900/50 border border-red-700 px-1.5 py-0.5 rounded text-[10px] text-red-200 font-bold uppercase" title="Physical (Vật lý)">
        <Swords size={10} />
        <span>PHY</span>
      </div>
    );
  }

  if (cat === "special") {
    return (
      <div className="flex items-center gap-1 bg-blue-900/50 border border-blue-700 px-1.5 py-0.5 rounded text-[10px] text-blue-200 font-bold uppercase" title="Special (Đặc biệt)">
        <Zap size={10} />
        <span>SPE</span>
      </div>
    );
  }

  // Status
  return (
    <div className="flex items-center gap-1 bg-slate-700 border border-slate-500 px-1.5 py-0.5 rounded text-[10px] text-slate-300 font-bold uppercase" title="Status (Hiệu ứng)">
      <CircleDot size={10} />
      <span>STA</span>
    </div>
  );
};