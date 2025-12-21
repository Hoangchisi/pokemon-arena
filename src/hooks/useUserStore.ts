// src/hooks/useUserStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UserState {
  // State Data
  mySavedTeam: any[]; // Team đã build
  maxStageUnlocked: number; // Tiến độ
  isDataLoaded: boolean; // Cờ kiểm tra xem đã fetch chưa

  // Actions
  fetchUserData: (force?: boolean) => Promise<void>; // Hàm gọi API
  updateProgress: (stage: number) => void; // Hàm update client-side ngay lập tức
  setSavedTeam: (team: any[]) => void; // Hàm update team khi build xong
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      mySavedTeam: [],
      maxStageUnlocked: 0,
      isDataLoaded: false,

      // Hàm fetch thông minh: Chỉ gọi API nếu chưa có dữ liệu hoặc bị force
      fetchUserData: async (force = false) => {
        // Nếu đã load rồi và không ép buộc load lại -> Dừng ngay, dùng cache
        if (get().isDataLoaded && !force) {
          return;
        }

        try {
          // Gọi song song 2 API để tiết kiệm thời gian
          const [teamRes, progressRes] = await Promise.all([
            fetch("/api/teams"),
            fetch("/api/user/progress")
          ]);

          let newTeam = [];
          let newProgress = 0;

          if (teamRes.ok) {
             const teams = await teamRes.json();
             // Giả sử lấy team đầu tiên
             if (teams.length > 0) newTeam = teams; 
          }

          if (progressRes.ok) {
             const prog = await progressRes.json();
             newProgress = prog.maxStageUnlocked;
          }

          // Cập nhật Store và đánh dấu đã load xong
          set({ 
            mySavedTeam: newTeam, 
            maxStageUnlocked: newProgress, 
            isDataLoaded: true 
          });

        } catch (error) {
          console.error("Failed to fetch user data", error);
        }
      },

      updateProgress: (stage) => set((state) => ({
        maxStageUnlocked: Math.max(stage, state.maxStageUnlocked)
      })),
      
      setSavedTeam: (team) => set({ mySavedTeam: team })
    }),
    {
      name: 'pokemon-user-storage', // Tên key trong LocalStorage
      storage: createJSONStorage(() => localStorage), // Lưu vào localStorage
    }
  )
);