"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useBattleStore } from "@/hooks/useBattleStore";
import { Music, Volume2 } from "lucide-react";

export default function BackgroundMusic() {
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Lắng nghe state currentMusic từ battle store
  const currentMusic = useBattleStore((state) => state.currentMusic);
  
  // Mặc định volume nhỏ (20%)
  const [volume, setVolume] = useState(0.2);

  // Hàm xác định nhạc
  const getTargetSource = (path: string) => {
    if (path.includes("/arena/active")) {
      return "/music/battle.mp3";
    }
    return "/music/lobby.mp3";
  };

  // 1. LOGIC TỰ ĐỘNG KÍCH HOẠT NHẠC (AUTOPLAY HACK)
  useEffect(() => {
    const handleUserInteraction = () => {
      const audio = audioRef.current;
      if (audio && audio.paused) {
        // Cố gắng phát nhạc ngay khi người dùng click hoặc nhấn phím
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Nếu vẫn lỗi thì bỏ qua, chờ lần click tiếp theo
          });
        }
      }
    };

    // Lắng nghe sự kiện toàn trang
    window.addEventListener("click", handleUserInteraction);
    window.addEventListener("keydown", handleUserInteraction);

    // Cố gắng chạy ngay lần đầu load (trong trường hợp trình duyệt cho phép)
    handleUserInteraction();

    return () => {
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
    };
  }, []);

  // 3. LOGIC RESET MUSIC KHI RỜI KHỎI TRANG CHIẾN ĐẤU
  useEffect(() => {
    const { setMusicTrack } = useBattleStore.getState();
    
    // Nếu không còn ở /arena/active, reset music về null
    if (!pathname.includes("/arena/active")) {
      setMusicTrack(null);
    }
  }, [pathname]);

  // 4. LOGIC NGHE THAY ĐỔI currentMusic TỪ BATTLE STORE
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Nếu currentMusic được set (khi transformation), đổi sang metrics.mp3
    if (currentMusic) {
      audio.src = currentMusic;
      audio.load();
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => console.log("Music switch waiting for interaction..."));
      }
    }
  }, [currentMusic]);

  // 5. LOGIC ĐỔI BÀI KHI CHUYỂN TRANG
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const targetSource = getTargetSource(pathname);
    const currentSrc = audio.src; // Full URL

    // Nếu nguồn nhạc thay đổi (Lobby <-> Battle) và không có custom music
    if (!currentMusic && !currentSrc.includes(targetSource)) {
      audio.src = targetSource;
      audio.load(); // Bắt buộc load lại
      
      // Phát ngay lập tức
      const playPromise = audio.play();
      if (playPromise !== undefined) {
          playPromise.catch((e) => console.log("Auto-switch waiting for interaction..."));
      }
    }
  }, [pathname, currentMusic]);

  // 6. LOGIC VOLUME
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  return (
    // UI: Chỉ hiển thị icon loa và thanh volume, không có nút bấm
    <div className="fixed bottom-4 left-4 z-[100] flex items-center gap-2 bg-slate-900/50 hover:bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 hover:border-slate-500 p-2 rounded-full shadow-lg transition-all duration-300 group">
      
      {/* Hidden Audio */}
      <audio ref={audioRef} src="/music/lobby.mp3" loop />

      {/* Icon Loa (Chỉ để trang trí) */}
      <div className={`w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center ${pathname.includes("active") || currentMusic ? "text-green-400" : "text-slate-500"}`}>
        <Volume2 size={16} className={pathname.includes("active") || currentMusic ? "animate-pulse" : ""} />
      </div>

      {/* Thanh chỉnh Volume (Luôn hiện hoặc hiện khi hover tùy ý thích) */}
      <div className="flex items-center gap-2 pr-2">
        <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-green-500 hover:h-1.5 transition-all"
        />
      </div>
    </div>
  );
}