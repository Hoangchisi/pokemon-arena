// dashboard/builder/components/BuilderTypes.ts
import { TeamMember } from "@/types/pokemon";

export interface BuilderLayoutProps {
  // Data
  team: TeamMember[];
  teamName: string;
  mySavedTeam: any[];
  isSaving: boolean;
  isDataLoaded: boolean;
  // State Setters
  setTeamName: (name: string) => void;
  
  // Actions
  handleOpenModal: () => void;
  saveTeamToDb: () => void;
  loadTeamToEdit: (t: any) => void;
  deleteTeam: (id: string, e: React.MouseEvent) => void;
  resetBuilder: () => void;
  removeFromTeam: (uuid: string) => void;
  toggleMove: (uuid: string, move: string) => void;
  refreshMemberData: (uuid: string, name: string) => void;
  setOpenTeraDropdownId: (id: string | null) => void;
  openTeraDropdownId: string | null;
  setTeam: React.Dispatch<React.SetStateAction<TeamMember[]>>; // Để update trực tiếp team nếu cần
}