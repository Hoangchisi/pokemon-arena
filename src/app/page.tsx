import Link from "next/link";
import { Sword, Users, Trophy } from "lucide-react";
// 1. Import các hàm cần thiết để check Session
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  // 2. Lấy session hiện tại trên Server
  const session = await getServerSession(authOptions);

  // 3. Logic chặn cửa: Nếu không có session -> Đá về trang Login ngay lập tức
  if (!session) {
    redirect("/login");
  }

  // --- Nếu code chạy xuống được đây nghĩa là ĐÃ ĐĂNG NHẬP ---

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute opacity-5 w-[800px] h-[800px] rounded-full border-[100px] border-slate-700 -right-40 -bottom-40 pointer-events-none"></div>
      <div className="absolute opacity-5 w-[800px] h-[800px] rounded-full border-[100px] border-slate-700 -left-40 -top-40 pointer-events-none"></div>

      <div className="z-10 text-center space-y-8 max-w-2xl">
        
        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-purple-400 to-red-400 drop-shadow-lg">
            POKEMON BATTLE
          </h1>
          {/* Hiển thị tên người dùng cho thân thiện */}
          <p className="text-xl text-slate-400 font-medium">
            Welcome back, <span className="text-white font-bold">{session.user?.name}</span>!
          </p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          
          <Link 
            href="/dashboard/builder"
            className="group relative bg-slate-900/50 hover:bg-slate-800 border border-slate-700 hover:border-blue-500 p-8 rounded-2xl transition-all duration-300 flex flex-col items-center gap-4 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="bg-blue-900/30 p-4 rounded-full text-blue-400 group-hover:scale-110 transition-transform">
              <Users size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-100 group-hover:text-blue-400 transition-colors">Team Builder</h2>
              <p className="text-sm text-slate-400 mt-2">Manage your squad.</p>
            </div>
          </Link>

          <Link 
            href="/arena" 
            className="group relative bg-slate-900/50 hover:bg-slate-800 border border-slate-700 hover:border-red-500 p-8 rounded-2xl transition-all duration-300 flex flex-col items-center gap-4 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="bg-red-900/30 p-4 rounded-full text-red-400 group-hover:scale-110 transition-transform">
              <Sword size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-100 group-hover:text-red-400 transition-colors">Battle Arena</h2>
              <p className="text-sm text-slate-400 mt-2">Fight vs NPC.</p>
            </div>
          </Link>

        </div>

        <div className="pt-10 flex justify-center gap-6 text-slate-500 text-sm">
          <div className="flex items-center gap-2">
            <Trophy size={16} /> <span>Ranked System (Coming Soon)</span>
          </div>
        </div>
      </div>
    </main>
  );
}