export interface NPCPokemon {
  pokedexId: number;
  name: string;
  types: string[];
  spriteUrl: string;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    spAtk: number;
    spDef: number;
    speed: number;
  };
  selectedMoves: string[];
  
  // --- THÊM TRƯỜNG NÀY ---
  // Định nghĩa cụ thể Ace này sẽ dùng gì: 'mega', 'gmax', hoặc 'tera'
  aceMechanic?: 'mega' | 'gmax'; 
}

const getSprite = (id: number) => 
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

// =====================================================================
// 1. CYNTHIA - Ace: Garchomp -> Mega
// =====================================================================
export const CYNTHIA_TEAM: NPCPokemon[] = [
  {
    pokedexId: 442,
    name: "spiritomb",
    types: ["ghost", "dark"],
    spriteUrl: getSprite(442),
    stats: { hp: 157, attack: 114, defense: 130, spAtk: 114, spDef: 130, speed: 55 },
    selectedMoves: ["shadow-ball", "dark-pulse", "psychic", "sucker-punch"]
  },
  {
    pokedexId: 407,
    name: "roserade",
    types: ["grass", "poison"],
    spriteUrl: getSprite(407),
    stats: { hp: 135, attack: 90, defense: 85, spAtk: 177, spDef: 125, speed: 142 },
    selectedMoves: ["energy-ball", "sludge-bomb", "shadow-ball", "dazzling-gleam"]
  },
  {
    pokedexId: 423,
    name: "gastrodon",
    types: ["water", "ground"],
    spriteUrl: getSprite(423),
    stats: { hp: 218, attack: 103, defense: 88, spAtk: 114, spDef: 102, speed: 59 },
    selectedMoves: ["earth-power", "muddy-water", "sludge-bomb", "ice-beam"]
  },
  {
    pokedexId: 448,
    name: "lucario",
    types: ["fighting", "steel"],
    spriteUrl: getSprite(448),
    stats: { hp: 145, attack: 132, defense: 90, spAtk: 137, spDef: 90, speed: 142 },
    selectedMoves: ["aura-sphere", "flash-cannon", "dragon-pulse", "earthquake"]
  },
  {
    pokedexId: 350,
    name: "milotic",
    types: ["water"],
    spriteUrl: getSprite(350),
    stats: { hp: 202, attack: 81, defense: 99, spAtk: 122, spDef: 147, speed: 101 },
    selectedMoves: ["hydro-pump", "ice-beam", "dragon-pulse", "recover"]
  },
  // ACE
  {
    pokedexId: 445,
    name: "garchomp",
    types: ["dragon", "ground"],
    spriteUrl: getSprite(445),
    stats: { hp: 183, attack: 182, defense: 115, spAtk: 100, spDef: 105, speed: 169 },
    selectedMoves: ["dragon-claw", "earthquake", "stone-edge", "swords-dance"],
    aceMechanic: 'mega' // <--- Gán Mega
  }
];

// =====================================================================
// 2. RED - Ace: Charizard -> Mega (Thường là Mega X)
// =====================================================================
export const RED_TEAM: NPCPokemon[] = [
  {
    pokedexId: 25,
    name: "pikachu",
    types: ["electric"],
    spriteUrl: getSprite(25),
    stats: { hp: 111, attack: 107, defense: 60, spAtk: 102, spDef: 70, speed: 156 },
    selectedMoves: ["thunderbolt", "iron-tail", "quick-attack", "volt-tackle"]
  },
  {
    pokedexId: 68,
    name: "machamp",
    types: ["fighting"],
    spriteUrl: getSprite(68),
    stats: { hp: 197, attack: 198, defense: 100, spAtk: 85, spDef: 105, speed: 75 },
    selectedMoves: ["dynamic-punch", "stone-edge", "bullet-punch", "knock-off"]
  },
  {
    pokedexId: 131,
    name: "lapras",
    types: ["water", "ice"],
    spriteUrl: getSprite(131),
    stats: { hp: 237, attack: 105, defense: 100, spAtk: 105, spDef: 115, speed: 80 },
    selectedMoves: ["hydro-pump", "freeze-dry", "ice-shard", "body-slam"]
  },
  {
    pokedexId: 143,
    name: "snorlax",
    types: ["normal"],
    spriteUrl: getSprite(143),
    stats: { hp: 267, attack: 178, defense: 85, spAtk: 85, spDef: 178, speed: 50 },
    selectedMoves: ["body-slam", "crunch", "earthquake", "rest"]
  },
  {
    pokedexId: 3,
    name: "venusaur",
    types: ["grass", "poison"],
    spriteUrl: getSprite(3),
    stats: { hp: 187, attack: 102, defense: 103, spAtk: 167, spDef: 120, speed: 100 },
    selectedMoves: ["sludge-bomb", "giga-drain", "earth-power", "sleep-powder"]
  },
  // ACE
  {
    pokedexId: 6,
    name: "charizard",
    types: ["fire", "flying"],
    spriteUrl: getSprite(6),
    stats: { hp: 153, attack: 104, defense: 98, spAtk: 161, spDef: 105, speed: 167 },
    selectedMoves: ["fire-blast", "air-slash", "solar-beam", "focus-blast"],
    aceMechanic: 'mega' // <--- Gán Mega
  }
];

// =====================================================================
// 3. STEVEN STONE - Ace: Metagross -> Mega
// =====================================================================
export const STEVEN_TEAM: NPCPokemon[] = [
  {
    pokedexId: 227,
    name: "skarmory",
    types: ["steel", "flying"],
    spriteUrl: getSprite(227),
    stats: { hp: 172, attack: 100, defense: 192, spAtk: 60, spDef: 90, speed: 90 },
    selectedMoves: ["brave-bird", "steel-wing", "spikes", "toxic"]
  },
  {
    pokedexId: 344,
    name: "claydol",
    types: ["ground", "psychic"],
    spriteUrl: getSprite(344),
    stats: { hp: 135, attack: 90, defense: 125, spAtk: 90, spDef: 140, speed: 95 },
    selectedMoves: ["earth-power", "psychic", "ancient-power", "light-screen"]
  },
  {
    pokedexId: 306,
    name: "aggron",
    types: ["steel", "rock"],
    spriteUrl: getSprite(306),
    stats: { hp: 145, attack: 130, defense: 230, spAtk: 80, spDef: 80, speed: 70 },
    selectedMoves: ["iron-head", "stone-edge", "earthquake", "thunder-wave"]
  },
  {
    pokedexId: 348,
    name: "armaldo",
    types: ["rock", "bug"],
    spriteUrl: getSprite(348),
    stats: { hp: 150, attack: 145, defense: 120, spAtk: 90, spDef: 100, speed: 65 },
    selectedMoves: ["x-scissor", "rock-blast", "crush-claw", "swords-dance"]
  },
  {
    pokedexId: 346,
    name: "cradily",
    types: ["rock", "grass"],
    spriteUrl: getSprite(346),
    stats: { hp: 161, attack: 101, defense: 117, spAtk: 101, spDef: 127, speed: 63 },
    selectedMoves: ["energy-ball", "ancient-power", "sludge-bomb", "giga-drain"]
  },
  // ACE
  {
    pokedexId: 376,
    name: "metagross",
    types: ["steel", "psychic"],
    spriteUrl: getSprite(376),
    stats: { hp: 155, attack: 187, defense: 150, spAtk: 115, spDef: 110, speed: 90 },
    selectedMoves: ["meteor-mash", "zen-headbutt", "earthquake", "bullet-punch"],
    aceMechanic: 'mega' // <--- Gán Mega
  }
];

// =====================================================================
// 4. LANCE - Ace: Salamence -> Mega
// =====================================================================
export const LANCE_TEAM: NPCPokemon[] = [
  {
    pokedexId: 130,
    name: "gyarados",
    types: ["water", "flying"],
    spriteUrl: getSprite(130),
    stats: { hp: 170, attack: 177, defense: 99, spAtk: 80, spDef: 120, speed: 101 },
    selectedMoves: ["waterfall", "bounce", "dragon-dance", "ice-fang"]
  },
  {
    pokedexId: 142,
    name: "aerodactyl",
    types: ["rock", "flying"],
    spriteUrl: getSprite(142),
    stats: { hp: 155, attack: 157, defense: 85, spAtk: 80, spDef: 95, speed: 182 },
    selectedMoves: ["rock-slide", "aerial-ace", "crunch", "thunder-fang"]
  },
  {
    pokedexId: 6,
    name: "charizard",
    types: ["fire", "flying"],
    spriteUrl: getSprite(6),
    stats: { hp: 153, attack: 104, defense: 98, spAtk: 161, spDef: 105, speed: 152 },
    selectedMoves: ["flamethrower", "air-slash", "dragon-pulse", "roost"]
  },
  {
    pokedexId: 149,
    name: "dragonite",
    types: ["dragon", "flying"],
    spriteUrl: getSprite(149),
    stats: { hp: 166, attack: 186, defense: 115, spAtk: 120, spDef: 120, speed: 100 },
    selectedMoves: ["outrage", "extreme-speed", "fire-punch", "thunder-punch"]
  },
  {
    pokedexId: 445,
    name: "garchomp",
    types: ["dragon", "ground"],
    spriteUrl: getSprite(445),
    stats: { hp: 183, attack: 182, defense: 115, spAtk: 100, spDef: 105, speed: 154 },
    selectedMoves: ["dragon-claw", "earthquake", "crunch", "swords-dance"]
  },
  // ACE
  {
    pokedexId: 373,
    name: "salamence",
    types: ["dragon", "flying"],
    spriteUrl: getSprite(373),
    stats: { hp: 170, attack: 187, defense: 100, spAtk: 130, spDef: 100, speed: 152 },
    selectedMoves: ["dragon-claw", "double-edge", "earthquake", "roost"],
    aceMechanic: 'mega' // <--- Gán Mega
  }
];

// =====================================================================
// 5. LEON - Ace: Charizard -> GMAX
// =====================================================================
export const LEON_TEAM: NPCPokemon[] = [
  {
    pokedexId: 681,
    name: "aegislash",
    types: ["steel", "ghost"],
    spriteUrl: getSprite(681),
    stats: { hp: 135, attack: 70, defense: 170, spAtk: 70, spDef: 170, speed: 80 },
    selectedMoves: ["shadow-ball", "flash-cannon", "kings-shield", "sacred-sword"]
  },
  {
    pokedexId: 887,
    name: "dragapult",
    types: ["dragon", "ghost"],
    spriteUrl: getSprite(887),
    stats: { hp: 163, attack: 140, defense: 95, spAtk: 120, spDef: 95, speed: 194 },
    selectedMoves: ["dragon-darts", "phantom-force", "uturn", "flamethrower"]
  },
  {
    pokedexId: 612,
    name: "haxorus",
    types: ["dragon"],
    spriteUrl: getSprite(612),
    stats: { hp: 151, attack: 199, defense: 110, spAtk: 80, spDef: 90, speed: 119 },
    selectedMoves: ["outrage", "earthquake", "poison-jab", "dragon-dance"]
  },
  {
    pokedexId: 866,
    name: "mr-rime",
    types: ["ice", "psychic"],
    spriteUrl: getSprite(866),
    stats: { hp: 155, attack: 105, defense: 95, spAtk: 130, spDef: 120, speed: 90 },
    selectedMoves: ["freeze-dry", "psychic", "teeter-dance", "ice-beam"]
  },
  {
    pokedexId: 815,
    name: "cinderace",
    types: ["fire"],
    spriteUrl: getSprite(815),
    stats: { hp: 155, attack: 168, defense: 95, spAtk: 85, spDef: 95, speed: 171 },
    selectedMoves: ["pyro-ball", "high-jump-kick", "sucker-punch", "bounce"]
  },
  // ACE
  {
    pokedexId: 6,
    name: "charizard",
    types: ["fire", "flying"],
    spriteUrl: getSprite(6),
    stats: { hp: 153, attack: 104, defense: 98, spAtk: 161, spDef: 105, speed: 167 },
    selectedMoves: ["fire-blast", "air-slash", "solar-beam", "thunder-punch"],
    aceMechanic: 'gmax' // <--- Gán Gmax
  }
];

// =====================================================================
// 6. DIANTHA - Ace: Gardevoir -> Mega
// =====================================================================
export const DIANTHA_TEAM: NPCPokemon[] = [
  {
    pokedexId: 701,
    name: "hawlucha",
    types: ["fighting", "flying"],
    spriteUrl: getSprite(701),
    stats: { hp: 153, attack: 144, defense: 95, spAtk: 94, spDef: 83, speed: 170 },
    selectedMoves: ["high-jump-kick", "flying-press", "acrobatics", "swords-dance"]
  },
  {
    pokedexId: 697,
    name: "tyrantrum",
    types: ["rock", "dragon"],
    spriteUrl: getSprite(697),
    stats: { hp: 157, attack: 173, defense: 171, spAtk: 89, spDef: 79, speed: 91 },
    selectedMoves: ["head-smash", "dragon-claw", "earthquake", "crunch"]
  },
  {
    pokedexId: 699,
    name: "aurorus",
    types: ["rock", "ice"],
    spriteUrl: getSprite(699),
    stats: { hp: 198, attack: 96, defense: 92, spAtk: 150, spDef: 112, speed: 78 },
    selectedMoves: ["freeze-dry", "ancient-power", "blizzard", "thunder-wave"]
  },
  {
    pokedexId: 711,
    name: "gourgeist",
    types: ["ghost", "grass"],
    spriteUrl: getSprite(711),
    stats: { hp: 160, attack: 120, defense: 147, spAtk: 78, spDef: 95, speed: 74 },
    selectedMoves: ["phantom-force", "seed-bomb", "will-o-wisp", "shadow-sneak"]
  },
  {
    pokedexId: 706,
    name: "goodra",
    types: ["dragon"],
    spriteUrl: getSprite(706),
    stats: { hp: 165, attack: 120, defense: 90, spAtk: 162, spDef: 202, speed: 100 },
    selectedMoves: ["dragon-pulse", "sludge-bomb", "flamethrower", "muddy-water"]
  },
  // ACE
  {
    pokedexId: 282,
    name: "gardevoir",
    types: ["psychic", "fairy"],
    spriteUrl: getSprite(282),
    stats: { hp: 143, attack: 85, defense: 85, spAtk: 177, spDef: 167, speed: 100 },
    selectedMoves: ["moonblast", "psychic", "shadow-ball", "thunderbolt"],
    aceMechanic: 'mega' // <--- Gán Mega
  }
];
// ... (Các import và code cũ giữ nguyên)

// =====================================================================
// 7. BLUE (Kanto Champion/Rival) - Ace: Pidgeot -> Mega
// =====================================================================
export const BLUE_TEAM: NPCPokemon[] = [
  {
    pokedexId: 103,
    name: "exeggutor",
    types: ["grass", "psychic"],
    spriteUrl: getSprite(103),
    stats: { hp: 202, attack: 115, defense: 105, spAtk: 145, spDef: 85, speed: 75 },
    selectedMoves: ["leaf-storm", "psychic", "sludge-bomb", "giga-drain"]
  },
  {
    pokedexId: 59,
    name: "arcanine",
    types: ["fire"],
    spriteUrl: getSprite(59),
    stats: { hp: 197, attack: 130, defense: 100, spAtk: 120, spDef: 100, speed: 115 },
    selectedMoves: ["flare-blitz", "extreme-speed", "wild-charge", "crunch"]
  },
  {
    pokedexId: 112,
    name: "rhydon",
    types: ["ground", "rock"],
    spriteUrl: getSprite(112),
    stats: { hp: 212, attack: 150, defense: 140, spAtk: 65, spDef: 65, speed: 60 },
    selectedMoves: ["earthquake", "stone-edge", "megahorn", "hammer-arm"]
  },
  {
    pokedexId: 130,
    name: "gyarados",
    types: ["water", "flying"],
    spriteUrl: getSprite(130),
    stats: { hp: 202, attack: 145, defense: 99, spAtk: 80, spDef: 120, speed: 101 },
    selectedMoves: ["waterfall", "bounce", "dragon-dance", "crunch"]
  },
  {
    pokedexId: 65,
    name: "alakazam",
    types: ["psychic"],
    spriteUrl: getSprite(65),
    stats: { hp: 162, attack: 70, defense: 65, spAtk: 155, spDef: 115, speed: 140 },
    selectedMoves: ["psychic", "shadow-ball", "focus-blast", "dazzling-gleam"]
  },
  // ACE: Pidgeot (Sẽ Mega)
  {
    pokedexId: 18,
    name: "pidgeot",
    types: ["normal", "flying"],
    spriteUrl: getSprite(18),
    stats: { hp: 190, attack: 100, defense: 95, spAtk: 90, spDef: 90, speed: 121 },
    selectedMoves: ["hurricane", "heat-wave", "u-turn", "roost"],
    aceMechanic: 'mega' // Mega Pidgeot (No Guard Hurricane)
  }
];

// =====================================================================
// 8. IRIS (Unova Champion) - Ace: Haxorus -> Tera Dragon
// =====================================================================
export const IRIS_TEAM: NPCPokemon[] = [
  {
    pokedexId: 635,
    name: "hydreigon",
    types: ["dark", "dragon"],
    spriteUrl: getSprite(635),
    stats: { hp: 199, attack: 125, defense: 110, spAtk: 145, spDef: 110, speed: 118 },
    selectedMoves: ["draco-meteor", "dark-pulse", "fire-blast", "flash-cannon"]
  },
  {
    pokedexId: 621,
    name: "druddigon",
    types: ["dragon"],
    spriteUrl: getSprite(621),
    stats: { hp: 184, attack: 135, defense: 110, spAtk: 80, spDef: 110, speed: 68 },
    selectedMoves: ["outrage", "sucker-punch", "fire-punch", "glare"]
  },
  {
    pokedexId: 306,
    name: "aggron",
    types: ["steel", "rock"],
    spriteUrl: getSprite(306),
    stats: { hp: 177, attack: 130, defense: 200, spAtk: 80, spDef: 80, speed: 70 },
    selectedMoves: ["heavy-slam", "stone-edge", "earthquake", "avalanche"]
  },
  {
    pokedexId: 567,
    name: "archeops",
    types: ["rock", "flying"],
    spriteUrl: getSprite(567),
    stats: { hp: 182, attack: 160, defense: 85, spAtk: 132, spDef: 85, speed: 130 },
    selectedMoves: ["acrobatics", "stone-edge", "earthquake", "u-turn"]
  },
  {
    pokedexId: 131,
    name: "lapras",
    types: ["water", "ice"],
    spriteUrl: getSprite(131),
    stats: { hp: 237, attack: 105, defense: 100, spAtk: 105, spDef: 115, speed: 80 },
    selectedMoves: ["ice-beam", "thunderbolt", "hydro-pump", "freeze-dry"]
  },
  // ACE: Haxorus (Tera Dragon)
  {
    pokedexId: 612,
    name: "haxorus",
    types: ["dragon"],
    spriteUrl: getSprite(612),
    stats: { hp: 183, attack: 167, defense: 110, spAtk: 80, spDef: 90, speed: 117 },
    selectedMoves: ["outrage", "earthquake", "iron-tail", "dragon-dance"],
  }
];

// =====================================================================
// 9. ALDER (Unova Champion BW) - Ace: Volcarona -> Tera Bug
// =====================================================================
export const ALDER_TEAM: NPCPokemon[] = [
  {
    pokedexId: 617,
    name: "accelgor",
    types: ["bug"],
    spriteUrl: getSprite(617),
    stats: { hp: 187, attack: 90, defense: 60, spAtk: 120, spDef: 80, speed: 165 },
    selectedMoves: ["bug-buzz", "focus-blast", "energy-ball", "sludge-bomb"]
  },
  {
    pokedexId: 626,
    name: "bouffalant",
    types: ["normal"],
    spriteUrl: getSprite(626),
    stats: { hp: 202, attack: 130, defense: 115, spAtk: 60, spDef: 115, speed: 75 },
    selectedMoves: ["head-charge", "earthquake", "stone-edge", "megahorn"]
  },
  {
    pokedexId: 589,
    name: "escavalier",
    types: ["bug", "steel"],
    spriteUrl: getSprite(589),
    stats: { hp: 177, attack: 155, defense: 125, spAtk: 80, spDef: 125, speed: 40 },
    selectedMoves: ["megahorn", "iron-head", "swords-dance", "drill-run"]
  },
  {
    pokedexId: 584,
    name: "vanilluxe",
    types: ["ice"],
    spriteUrl: getSprite(584),
    stats: { hp: 178, attack: 115, defense: 105, spAtk: 130, spDef: 115, speed: 99 },
    selectedMoves: ["blizzard", "flash-cannon", "freeze-dry", "ice-shard"]
  },
  {
    pokedexId: 621,
    name: "druddigon",
    types: ["dragon"],
    spriteUrl: getSprite(621),
    stats: { hp: 184, attack: 135, defense: 110, spAtk: 80, spDef: 110, speed: 68 },
    selectedMoves: ["superpower", "outrage", "gunk-shot", "fire-fang"]
  },
  // ACE: Volcarona (Tera Bug)
  {
    pokedexId: 637,
    name: "volcarona",
    types: ["bug", "fire"],
    spriteUrl: getSprite(637),
    stats: { hp: 192, attack: 80, defense: 85, spAtk: 155, spDef: 125, speed: 120 },
    selectedMoves: ["quiver-dance", "fiery-dance", "bug-buzz", "psychic"],
  }
];

// =====================================================================
// 10. GEETA (Paldea Champion) - Ace: Glimmora -> Tera Rock
// =====================================================================
export const GEETA_TEAM: NPCPokemon[] = [
  {
    pokedexId: 956,
    name: "espathra",
    types: ["psychic"],
    spriteUrl: getSprite(956),
    stats: { hp: 202, attack: 80, defense: 80, spAtk: 121, spDef: 80, speed: 125 },
    selectedMoves: ["lumina-crash", "dazzling-gleam", "shadow-ball", "protect"]
  },
  {
    pokedexId: 673,
    name: "gogoat",
    types: ["grass"],
    spriteUrl: getSprite(673),
    stats: { hp: 230, attack: 120, defense: 82, spAtk: 117, spDef: 101, speed: 88 },
    selectedMoves: ["horn-leech", "zen-headbutt", "earthquake", "bulk-up"]
  },
  {
    pokedexId: 976,
    name: "veluza",
    types: ["water", "psychic"],
    spriteUrl: getSprite(976),
    stats: { hp: 197, attack: 122, defense: 93, spAtk: 98, spDef: 85, speed: 90 },
    selectedMoves: ["aqua-cutter", "psycho-cut", "night-slash", "fillet-away"]
  },
  {
    pokedexId: 713,
    name: "avalugg",
    types: ["ice"],
    spriteUrl: getSprite(713),
    stats: { hp: 202, attack: 137, defense: 204, spAtk: 64, spDef: 66, speed: 48 },
    selectedMoves: ["avalanche", "body-press", "earthquake", "recover"]
  },
  {
    pokedexId: 983,
    name: "kingambit",
    types: ["dark", "steel"],
    spriteUrl: getSprite(983),
    stats: { hp: 207, attack: 155, defense: 140, spAtk: 80, spDef: 105, speed: 70 },
    selectedMoves: ["kowtow-cleave", "iron-head", "sucker-punch", "swords-dance"]
  },

  {
    pokedexId: 970,
    name: "glimmora",
    types: ["rock", "poison"],
    spriteUrl: getSprite(970),
    stats: { hp: 190, attack: 75, defense: 110, spAtk: 150, spDef: 101, speed: 106 },
    selectedMoves: ["tera-blast", "sludge-wave", "power-gem", "earth-power"],
  }
];

// Cập nhật lại Object export cuối file
export const NPC_DATA = {
  cynthia: CYNTHIA_TEAM,
  red: RED_TEAM,
  steven: STEVEN_TEAM,
  lance: LANCE_TEAM,
  leon: LEON_TEAM,
  diantha: DIANTHA_TEAM,
  // Thêm mới:
  blue: BLUE_TEAM,
  iris: IRIS_TEAM,
  alder: ALDER_TEAM,
  geeta: GEETA_TEAM
};
