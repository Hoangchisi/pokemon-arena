"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { Home, LogOut, User, Menu, Swords, LayoutDashboard } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 h-16">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        
        {/* LEFT: Logo & Home Button */}
        <div className="flex items-center gap-6">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            <img 
              src="/logo.png" 
              alt="PokeArena Logo" 
              className="w-8 h-8"
            />
            <span className="hidden md:inline">PokeArena</span>
          </Link>

          {/* Home Button Navigation */}
          <Link 
            href="/" 
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
          >
            <Home size={18} />
            <span className="hidden sm:inline">Home</span>
          </Link>
          
          {/* Quick Link to Arena */}
          {session && (
             <Link 
             href="/arena" 
             className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors text-sm font-medium"
           >
             <Swords size={18} />
             <span className="hidden sm:inline">Arena</span>
           </Link>
          )}
        </div>

        {/* RIGHT: User Profile */}
        <div className="flex items-center gap-4">
          {!session ? (
            // Nếu chưa đăng nhập
            <Link 
              href="/login"
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
            >
              Login
            </Link>
          ) : (
            // Nếu đã đăng nhập -> Hiện Avatar
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-3 hover:bg-slate-800 p-1.5 rounded-full pr-4 transition-colors border border-transparent hover:border-slate-700"
              >
                {/* Avatar Image */}
                <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-600 bg-slate-800">
                  {session.user?.image ? (
                    <img 
                      src={session.user.image} 
                      alt="User Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <User size={16} />
                    </div>
                  )}
                </div>
                {/* User Name */}
                <span className="text-sm font-medium text-slate-200 hidden md:block max-w-[100px] truncate">
                  {session.user?.name || "Trainer"}
                </span>
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-4 border-b border-slate-800">
                    <p className="text-sm font-bold text-white truncate">{session.user?.name}</p>
                    <p className="text-xs text-slate-400 truncate">{session.user?.email}</p>
                  </div>
                  
                  <div className="p-1">
                    <Link 
                      href="/dashboard/builder" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <LayoutDashboard size={16} />
                      My Teams
                    </Link>
                    
                    <button 
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded-lg transition-colors mt-1"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}