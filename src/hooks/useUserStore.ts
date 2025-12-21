// src/hooks/useUserStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Định nghĩa kiểu dữ liệu cơ bản cho Team để dễ quản lý
interface Team {
  id: string;
  name: string;
  userId: string;
  pokemons: any[];
  createdAt?: string;
  updatedAt?: string;
}

interface UserState {
  // --- STATE ---
  mySavedTeam: Team[];      // Danh sách team của người dùng
  maxStageUnlocked: number; // Màn chơi cao nhất đã mở khóa (DB Schema)
  isDataLoaded: boolean;    // Cờ kiểm tra dữ liệu đã được tải lần đầu chưa

  // --- ACTIONS ---
  fetchUserData: (force?: boolean) => Promise<void>;
  updateProgress: (stage: number) => void;
  setSavedTeam: (teams: Team[]) => void;
  
  // --- GETTERS (Optional - để tương thích với UI cũ nếu cần) ---
  get currentStage(): number;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // 1. Initial State
      mySavedTeam: [],
      maxStageUnlocked: 0, // Mặc định là 0 (chưa qua màn nào, tức là đang ở Stage 1)
      isDataLoaded: false,

      // 2. Getter cho UI (Giúp bạn dùng currentStage hay maxStageUnlocked đều được)
      get currentStage() {
        return get().maxStageUnlocked;
      },

      // 3. Actions
      fetchUserData: async (force = false) => {
        // Cache Strategy: Nếu đã load và không bị ép buộc (force) -> Dùng cache local
        if (get().isDataLoaded && !force) {
          return;
        }

        try {
          // Gọi song song 2 API: Lấy Team và Lấy Progress
          const [teamRes, progressRes] = await Promise.all([
            fetch("/api/teams"),
            fetch("/api/user/progress")
          ]);

          let newTeams: Team[] = [];
          let newProgress = 0;

          // Xử lý dữ liệu Team
          if (teamRes.ok) {
            const data = await teamRes.json();
            if (Array.isArray(data)) {
              newTeams = data;
            }
          }

          // Xử lý dữ liệu Progress
          if (progressRes.ok) {
            const data = await progressRes.json();
            // API trả về { maxStageUnlocked: number }
            if (typeof data.maxStageUnlocked === 'number') {
              newProgress = data.maxStageUnlocked;
            }
          }

          // Cập nhật Store một lần duy nhất
          set({
            mySavedTeam: newTeams,
            maxStageUnlocked: newProgress,
            isDataLoaded: true,
          });

        } catch (error) {
          console.error("[useUserStore] Failed to fetch user data:", error);
          // Không set isDataLoaded = true để lần sau có thể thử lại
        }
      },

      // Optimistic Update: Cập nhật ngay lập tức trên giao diện
      updateProgress: (stage: number) => {
        set((state) => ({
          // Chỉ cập nhật nếu màn mới cao hơn màn cũ
          maxStageUnlocked: Math.max(stage, state.maxStageUnlocked)
        }));
      },

      // Cập nhật danh sách team (Thường dùng sau khi Save/Delete team)
      setSavedTeam: (teams: Team[]) => {
        set({ mySavedTeam: teams });
      }
    }),
    {
      name: 'pokemon-user-storage', // Key lưu trong LocalStorage
      storage: createJSONStorage(() => localStorage), // Cơ chế lưu trữ
      
      // (Tuỳ chọn) Chỉ định những field nào được lưu vào localStorage
      // partialize: (state) => ({ 
      //   mySavedTeam: state.mySavedTeam, 
      //   maxStageUnlocked: state.maxStageUnlocked 
      // }),
    }
  )
);