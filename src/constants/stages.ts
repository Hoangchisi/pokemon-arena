import { NPC_DATA } from "@/data/npc";

export const STAGE_ORDER = [
  'lance',
  'steven',
  'alder',   // Mới
  'diantha',
  'iris',    // Mới
  'geeta',   // Mới
  'cynthia',
  'leon',
  'blue',    // Mới
  'red'
] as const;

export type StageKey = typeof STAGE_ORDER[number];

export const getStageInfo = (key: StageKey) => {
  // @ts-ignore
  const team = NPC_DATA[key];
  const displayName = key.charAt(0).toUpperCase() + key.slice(1);
  const acePokemon = team[team.length - 1];

  return {
    key,
    displayName,
    team,
    avatar: acePokemon.spriteUrl,
    aceName: acePokemon.name,
    // THÊM DÒNG NÀY: Lấy mechanic của Ace đưa ra ngoài để tiện dùng
    aceMechanic: acePokemon.aceMechanic 
  };
};