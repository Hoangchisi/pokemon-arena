import { PokemonData } from "@/types/pokemon";

// --- HELPER FUNCTIONS ---
// Hàm lấy ảnh từ PokeAPI
const getSprite = (id: number) => 
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

export const POKEDEX: PokemonData[] = [
  // ===================================================================
  // KANTO STARTERS (Sở hữu cả Mega & Gmax)
  // ===================================================================
  {
    id: 3,
    name: "Venusaur",
    types: ["grass", "poison"],
    stats: { hp: 80, attack: 82, defense: 83, spAtk: 100, spDef: 100, speed: 80 },
    sprite: getSprite(3),
    backSprite: getSprite(3),
    moves: [],
    forms: {
      mega: {
        name: "Mega Venusaur",
        sprite: getSprite(10033),
        backSprite: getSprite(10033),
        stats: { hp: 80, attack: 100, defense: 123, spAtk: 122, spDef: 120, speed: 80 },
        types: ["grass", "poison"]
      },
      gmax: {
        name: "Gigantamax Venusaur",
        sprite: getSprite(10195),
        stats: { hp: 80, attack: 82, defense: 83, spAtk: 100, spDef: 100, speed: 80 }
      }
    }
  },
  {
    id: 6,
    name: "Charizard",
    types: ["fire", "flying"],
    stats: { hp: 78, attack: 84, defense: 78, spAtk: 109, spDef: 85, speed: 100 },
    sprite: getSprite(6),
    backSprite: getSprite(6),
    moves: [],
    forms: {
      mega: {
        name: "Mega Charizard X", // Form đổi hệ sang Dragon
        sprite: getSprite(10034),
        backSprite: getSprite(10034),
        stats: { hp: 78, attack: 130, defense: 111, spAtk: 130, spDef: 85, speed: 100 },
        types: ["fire", "dragon"]
      },
      gmax: {
        name: "Gigantamax Charizard",
        sprite: getSprite(10196),
        stats: { hp: 78, attack: 84, defense: 78, spAtk: 109, spDef: 85, speed: 100 }
      }
    }
  },
  {
    id: 9,
    name: "Blastoise",
    types: ["water"],
    stats: { hp: 79, attack: 83, defense: 100, spAtk: 85, spDef: 105, speed: 78 },
    sprite: getSprite(9),
    backSprite: getSprite(9),
    moves: [],
    forms: {
      mega: {
        name: "Mega Blastoise",
        sprite: getSprite(10036),
        backSprite: getSprite(10036),
        stats: { hp: 79, attack: 103, defense: 120, spAtk: 135, spDef: 115, speed: 78 }
      },
      gmax: {
        name: "Gigantamax Blastoise",
        sprite: getSprite(10197),
        stats: { hp: 79, attack: 83, defense: 100, spAtk: 85, spDef: 105, speed: 78 }
      }
    }
  },

  // ===================================================================
  // POPULAR GIGANTAMAX POKEMON
  // ===================================================================
  {
    id: 25,
    name: "Pikachu",
    types: ["electric"],
    stats: { hp: 35, attack: 55, defense: 40, spAtk: 50, spDef: 50, speed: 90 },
    sprite: getSprite(25),
    backSprite: getSprite(25),
    moves: [],
    forms: {
      gmax: {
        name: "Gigantamax Pikachu",
        sprite: getSprite(10199),
        stats: { hp: 35, attack: 55, defense: 40, spAtk: 50, spDef: 50, speed: 90 }
      }
    }
  },
  {
    id: 133,
    name: "Eevee",
    types: ["normal"],
    stats: { hp: 55, attack: 55, defense: 50, spAtk: 45, spDef: 65, speed: 55 },
    sprite: getSprite(133),
    backSprite: getSprite(133),
    moves: [],
    forms: {
      gmax: {
        name: "Gigantamax Eevee",
        sprite: getSprite(10205),
        stats: { hp: 55, attack: 55, defense: 50, spAtk: 45, spDef: 65, speed: 55 }
      }
    }
  },
  {
    id: 52,
    name: "Meowth",
    types: ["normal"],
    stats: { hp: 40, attack: 45, defense: 35, spAtk: 40, spDef: 40, speed: 90 },
    sprite: getSprite(52),
    backSprite: getSprite(52),
    moves: [],
    forms: {
      gmax: {
        name: "Gigantamax Meowth",
        sprite: getSprite(10200),
        stats: { hp: 40, attack: 45, defense: 35, spAtk: 40, spDef: 40, speed: 90 }
      }
    }
  },
  {
    id: 68,
    name: "Machamp",
    types: ["fighting"],
    stats: { hp: 90, attack: 130, defense: 80, spAtk: 65, spDef: 85, speed: 55 },
    sprite: getSprite(68),
    backSprite: getSprite(68),
    moves: [],
    forms: {
      gmax: {
        name: "Gigantamax Machamp",
        sprite: getSprite(10201),
        stats: { hp: 90, attack: 130, defense: 80, spAtk: 65, spDef: 85, speed: 55 }
      }
    }
  },
  {
    id: 94,
    name: "Gengar",
    types: ["ghost", "poison"],
    stats: { hp: 60, attack: 65, defense: 60, spAtk: 130, spDef: 75, speed: 110 },
    sprite: getSprite(94),
    backSprite: getSprite(94),
    moves: [],
    forms: {
      mega: {
        name: "Mega Gengar",
        sprite: getSprite(10038),
        backSprite: getSprite(10038),
        stats: { hp: 60, attack: 65, defense: 80, spAtk: 170, spDef: 95, speed: 130 }
      },
      gmax: {
        name: "Gigantamax Gengar",
        sprite: getSprite(10202),
        stats: { hp: 60, attack: 65, defense: 60, spAtk: 130, spDef: 75, speed: 110 }
      }
    }
  },
  {
    id: 143,
    name: "Snorlax",
    types: ["normal"],
    stats: { hp: 160, attack: 110, defense: 65, spAtk: 65, spDef: 110, speed: 30 },
    sprite: getSprite(143),
    backSprite: getSprite(143),
    moves: [],
    forms: {
      gmax: {
        name: "Gigantamax Snorlax",
        sprite: getSprite(10206),
        stats: { hp: 160, attack: 110, defense: 65, spAtk: 65, spDef: 110, speed: 30 }
      }
    }
  },
  

  // ===================================================================
  // POPULAR MEGA EVOLUTION POKEMON
  // ===================================================================
  {
    id: 150,
    name: "Mewtwo",
    types: ["psychic"],
    stats: { hp: 106, attack: 110, defense: 90, spAtk: 154, spDef: 90, speed: 130 },
    sprite: getSprite(150),
    backSprite: getSprite(150),
    moves: [],
    forms: {
      mega: {
        name: "Mega Mewtwo Y",
        sprite: getSprite(10044),
        backSprite: getSprite(10044),
        stats: { hp: 106, attack: 150, defense: 70, spAtk: 194, spDef: 120, speed: 140 }
      }
    }
  },
  {
    id: 130,
    name: "Gyarados",
    types: ["water", "flying"],
    stats: { hp: 95, attack: 125, defense: 79, spAtk: 60, spDef: 100, speed: 81 },
    sprite: getSprite(130),
    backSprite: getSprite(130),
    moves: [],
    forms: {
      mega: {
        name: "Mega Gyarados",
        sprite: getSprite(10041),
        backSprite: getSprite(10041),
        stats: { hp: 95, attack: 155, defense: 109, spAtk: 70, spDef: 130, speed: 81 },
        types: ["water", "dark"]
      }
    }
  },
  {
    id: 212,
    name: "Scizor",
    types: ["bug", "steel"],
    stats: { hp: 70, attack: 130, defense: 100, spAtk: 55, spDef: 80, speed: 65 },
    sprite: getSprite(212),
    backSprite: getSprite(212),
    moves: [],
    forms: {
      mega: {
        name: "Mega Scizor",
        sprite: getSprite(10046),
        backSprite: getSprite(10046),
        stats: { hp: 70, attack: 150, defense: 140, spAtk: 65, spDef: 100, speed: 75 }
      }
    }
  },
  {
    id: 248,
    name: "Tyranitar",
    types: ["rock", "dark"],
    stats: { hp: 100, attack: 134, defense: 110, spAtk: 95, spDef: 100, speed: 61 },
    sprite: getSprite(248),
    backSprite: getSprite(248),
    moves: [],
    forms: {
      mega: {
        name: "Mega Tyranitar",
        sprite: getSprite(10049),
        backSprite: getSprite(10049),
        stats: { hp: 100, attack: 164, defense: 150, spAtk: 95, spDef: 120, speed: 71 }
      }
    }
  },
  {
    id: 254,
    name: "Sceptile",
    types: ["grass"],
    stats: { hp: 70, attack: 85, defense: 65, spAtk: 105, spDef: 85, speed: 120 },
    sprite: getSprite(254),
    backSprite: getSprite(254),
    moves: [],
    forms: {
      mega: {
        name: "Mega Sceptile",
        sprite: getSprite(10065),
        backSprite: getSprite(10065),
        stats: { hp: 70, attack: 110, defense: 75, spAtk: 145, spDef: 85, speed: 145 },
        types: ["grass", "dragon"]
      }
    }
  },
  {
    id: 257,
    name: "Blaziken",
    types: ["fire", "fighting"],
    stats: { hp: 80, attack: 120, defense: 70, spAtk: 110, spDef: 70, speed: 80 },
    sprite: getSprite(257),
    backSprite: getSprite(257),
    moves: [],
    forms: {
      mega: {
        name: "Mega Blaziken",
        sprite: getSprite(10050),
        backSprite: getSprite(10050),
        stats: { hp: 80, attack: 160, defense: 80, spAtk: 130, spDef: 80, speed: 100 }
      }
    }
  },
  {
    id: 260,
    name: "Swampert",
    types: ["water", "ground"],
    stats: { hp: 100, attack: 110, defense: 90, spAtk: 85, spDef: 90, speed: 60 },
    sprite: getSprite(260),
    backSprite: getSprite(260),
    moves: [],
    forms: {
      mega: {
        name: "Mega Swampert",
        sprite: getSprite(10064),
        backSprite: getSprite(10064),
        stats: { hp: 100, attack: 150, defense: 110, spAtk: 95, spDef: 110, speed: 70 }
      }
    }
  },
  {
    id: 282,
    name: "Gardevoir",
    types: ["psychic", "fairy"],
    stats: { hp: 68, attack: 65, defense: 65, spAtk: 125, spDef: 115, speed: 80 },
    sprite: getSprite(282),
    backSprite: getSprite(282),
    moves: [],
    forms: {
      mega: {
        name: "Mega Gardevoir",
        sprite: getSprite(10051),
        backSprite: getSprite(10051),
        stats: { hp: 68, attack: 85, defense: 65, spAtk: 165, spDef: 135, speed: 100 }
      }
    }
  },
  {
    id: 302,
    name: "Sableye",
    types: ["dark", "ghost"],
    stats: { hp: 50, attack: 75, defense: 75, spAtk: 65, spDef: 65, speed: 50 },
    sprite: getSprite(302),
    backSprite: getSprite(302),
    moves: [],
    forms: {
      mega: {
        name: "Mega Sableye",
        sprite: getSprite(10066),
        backSprite: getSprite(10066),
        stats: { hp: 50, attack: 85, defense: 125, spAtk: 85, spDef: 115, speed: 20 }
      }
    }
  },
  {
    id: 303,
    name: "Mawile",
    types: ["steel", "fairy"],
    stats: { hp: 50, attack: 85, defense: 85, spAtk: 55, spDef: 55, speed: 50 },
    sprite: getSprite(303),
    backSprite: getSprite(303),
    moves: [],
    forms: {
      mega: {
        name: "Mega Mawile",
        sprite: getSprite(10052),
        backSprite: getSprite(10052),
        stats: { hp: 50, attack: 105, defense: 125, spAtk: 55, spDef: 95, speed: 50 }
      }
    }
  },
  {
    id: 306,
    name: "Aggron",
    types: ["steel", "rock"],
    stats: { hp: 70, attack: 110, defense: 180, spAtk: 60, spDef: 60, speed: 50 },
    sprite: getSprite(306),
    backSprite: getSprite(306),
    moves: [],
    forms: {
      mega: {
        name: "Mega Aggron",
        sprite: getSprite(10053),
        backSprite: getSprite(10053),
        stats: { hp: 70, attack: 140, defense: 230, spAtk: 60, spDef: 80, speed: 50 },
        types: ["steel"] // Mất hệ rock
      }
    }
  },
  {
    id: 373,
    name: "Salamence",
    types: ["dragon", "flying"],
    stats: { hp: 95, attack: 135, defense: 80, spAtk: 110, spDef: 80, speed: 100 },
    sprite: getSprite(373),
    backSprite: getSprite(373),
    moves: [],
    forms: {
      mega: {
        name: "Mega Salamence",
        sprite: getSprite(10089),
        backSprite: getSprite(10089),
        stats: { hp: 95, attack: 145, defense: 130, spAtk: 120, spDef: 90, speed: 120 }
      }
    }
  },
  {
    id: 376,
    name: "Metagross",
    types: ["steel", "psychic"],
    stats: { hp: 80, attack: 135, defense: 130, spAtk: 95, spDef: 90, speed: 70 },
    sprite: getSprite(376),
    backSprite: getSprite(376),
    moves: [],
    forms: {
      mega: {
        name: "Mega Metagross",
        sprite: getSprite(10076),
        backSprite: getSprite(10076),
        stats: { hp: 80, attack: 145, defense: 150, spAtk: 105, spDef: 110, speed: 110 }
      }
    }
  },
  {
    id: 384,
    name: "Rayquaza",
    types: ["dragon", "flying"],
    stats: { hp: 105, attack: 150, defense: 90, spAtk: 150, spDef: 90, speed: 95 },
    sprite: getSprite(384),
    backSprite: getSprite(384),
    moves: [],
    forms: {
      mega: {
        name: "Mega Rayquaza",
        sprite: getSprite(10079),
        backSprite: getSprite(10079),
        stats: { hp: 105, attack: 180, defense: 100, spAtk: 180, spDef: 100, speed: 115 }
      }
    }
  },
  {
    id: 445,
    name: "Garchomp",
    types: ["dragon", "ground"],
    stats: { hp: 108, attack: 130, defense: 95, spAtk: 80, spDef: 85, speed: 102 },
    sprite: getSprite(445),
    backSprite: getSprite(445),
    moves: [],
    forms: {
      mega: {
        name: "Mega Garchomp",
        sprite: getSprite(10058),
        backSprite: getSprite(10058),
        stats: { hp: 108, attack: 170, defense: 115, spAtk: 120, spDef: 95, speed: 92 }
      }
    }
  },
  {
    id: 448,
    name: "Lucario",
    types: ["fighting", "steel"],
    stats: { hp: 70, attack: 110, defense: 70, spAtk: 115, spDef: 70, speed: 90 },
    sprite: getSprite(448),
    backSprite: getSprite(448),
    moves: [],
    forms: {
      mega: {
        name: "Mega Lucario",
        sprite: getSprite(10059),
        backSprite: getSprite(10059),
        stats: { hp: 70, attack: 145, defense: 88, spAtk: 140, spDef: 70, speed: 112 }
      }
    }
  },
  // ===================================================================
  // ADDITIONAL MEGA EVOLUTIONS
  // ===================================================================
  {
    id: 15,
    name: "Beedrill",
    types: ["bug", "poison"],
    stats: { hp: 65, attack: 90, defense: 40, spAtk: 45, spDef: 80, speed: 75 },
    sprite: getSprite(15),
    backSprite: getSprite(15),
    moves: [],
    forms: {
      mega: {
        name: "Mega Beedrill",
        sprite: getSprite(10090),
        backSprite: getSprite(10090),
        stats: { hp: 65, attack: 150, defense: 40, spAtk: 15, spDef: 80, speed: 145 }
      }
    }
  },
  {
    id: 18,
    name: "Pidgeot",
    types: ["normal", "flying"],
    stats: { hp: 83, attack: 80, defense: 75, spAtk: 70, spDef: 70, speed: 101 },
    sprite: getSprite(18),
    backSprite: getSprite(18),
    moves: [],
    forms: {
      mega: {
        name: "Mega Pidgeot",
        sprite: getSprite(10073),
        backSprite: getSprite(10073),
        stats: { hp: 83, attack: 80, defense: 80, spAtk: 135, spDef: 80, speed: 121 }
      }
    }
  },
  {
    id: 65,
    name: "Alakazam",
    types: ["psychic"],
    stats: { hp: 55, attack: 50, defense: 45, spAtk: 135, spDef: 95, speed: 120 },
    sprite: getSprite(65),
    backSprite: getSprite(65),
    moves: [],
    forms: {
      mega: {
        name: "Mega Alakazam",
        sprite: getSprite(10037),
        backSprite: getSprite(10037),
        stats: { hp: 55, attack: 50, defense: 65, spAtk: 175, spDef: 105, speed: 150 }
      }
    }
  },
  {
    id: 142,
    name: "Aerodactyl",
    types: ["rock", "flying"],
    stats: { hp: 80, attack: 105, defense: 65, spAtk: 60, spDef: 75, speed: 130 },
    sprite: getSprite(142),
    backSprite: getSprite(142),
    moves: [],
    forms: {
      mega: {
        name: "Mega Aerodactyl",
        sprite: getSprite(10042),
        backSprite: getSprite(10042),
        stats: { hp: 80, attack: 135, defense: 85, spAtk: 70, spDef: 95, speed: 150 }
      }
    }
  },
  {
    id: 181,
    name: "Ampharos",
    types: ["electric"],
    stats: { hp: 90, attack: 75, defense: 85, spAtk: 115, spDef: 90, speed: 55 },
    sprite: getSprite(181),
    backSprite: getSprite(181),
    moves: [],
    forms: {
      mega: {
        name: "Mega Ampharos",
        sprite: getSprite(10045),
        backSprite: getSprite(10045),
        stats: { hp: 90, attack: 95, defense: 105, spAtk: 165, spDef: 110, speed: 45 },
        types: ["electric", "dragon"] // Thêm hệ Dragon
      }
    }
  },
  {
    id: 208,
    name: "Steelix",
    types: ["steel", "ground"],
    stats: { hp: 75, attack: 85, defense: 200, spAtk: 55, spDef: 65, speed: 30 },
    sprite: getSprite(208),
    backSprite: getSprite(208),
    moves: [],
    forms: {
      mega: {
        name: "Mega Steelix",
        sprite: getSprite(10072),
        backSprite: getSprite(10072),
        stats: { hp: 75, attack: 125, defense: 230, spAtk: 55, spDef: 95, speed: 30 }
      }
    }
  },
  {
    id: 229,
    name: "Houndoom",
    types: ["dark", "fire"],
    stats: { hp: 75, attack: 90, defense: 50, spAtk: 110, spDef: 80, speed: 95 },
    sprite: getSprite(229),
    backSprite: getSprite(229),
    moves: [],
    forms: {
      mega: {
        name: "Mega Houndoom",
        sprite: getSprite(10048),
        backSprite: getSprite(10048),
        stats: { hp: 75, attack: 90, defense: 90, spAtk: 140, spDef: 90, speed: 115 }
      }
    }
  },
  {
    id: 359,
    name: "Absol",
    types: ["dark"],
    stats: { hp: 65, attack: 130, defense: 60, spAtk: 75, spDef: 60, speed: 75 },
    sprite: getSprite(359),
    backSprite: getSprite(359),
    moves: [],
    forms: {
      mega: {
        name: "Mega Absol",
        sprite: getSprite(10057),
        backSprite: getSprite(10057),
        stats: { hp: 65, attack: 150, defense: 60, spAtk: 115, spDef: 60, speed: 115 }
      }
    }
  },
  {
    id: 428,
    name: "Lopunny",
    types: ["normal"],
    stats: { hp: 65, attack: 76, defense: 84, spAtk: 54, spDef: 96, speed: 105 },
    sprite: getSprite(428),
    backSprite: getSprite(428),
    moves: [],
    forms: {
      mega: {
        name: "Mega Lopunny",
        sprite: getSprite(10088),
        backSprite: getSprite(10088),
        stats: { hp: 65, attack: 136, defense: 94, spAtk: 54, spDef: 96, speed: 135 },
        types: ["normal", "fighting"] // Thêm hệ Fighting
      }
    }
  },
  {
    id: 475,
    name: "Gallade",
    types: ["psychic", "fighting"],
    stats: { hp: 68, attack: 125, defense: 65, spAtk: 65, spDef: 115, speed: 80 },
    sprite: getSprite(475),
    backSprite: getSprite(475),
    moves: [],
    forms: {
      mega: {
        name: "Mega Gallade",
        sprite: getSprite(10068),
        backSprite: getSprite(10068),
        stats: { hp: 68, attack: 165, defense: 95, spAtk: 65, spDef: 115, speed: 110 }
      }
    }
  },
  // ===================================================================
  // REMAINING GIGANTAMAX POKEMON (Kanto, Johto, Unova, Alola, Galar)
  // ===================================================================
  {
    id: 12,
    name: "Butterfree",
    types: ["bug", "flying"],
    stats: { hp: 60, attack: 45, defense: 50, spAtk: 90, spDef: 80, speed: 70 },
    sprite: getSprite(12),
    backSprite: getSprite(12),
    moves: [],
    forms: {
      gmax: {
        name: "Gigantamax Butterfree",
        sprite: getSprite(10198),
        stats: { hp: 60, attack: 45, defense: 50, spAtk: 90, spDef: 80, speed: 70 }
      }
    }
  },
  {
    id: 99,
    name: "Kingler",
    types: ["water"],
    stats: { hp: 55, attack: 130, defense: 115, spAtk: 50, spDef: 50, speed: 75 },
    sprite: getSprite(99),
    backSprite: getSprite(99),
    moves: [],
    forms: {
      gmax: {
        name: "Gigantamax Kingler",
        sprite: getSprite(10203),
        stats: { hp: 55, attack: 130, defense: 115, spAtk: 50, spDef: 50, speed: 75 }
      }
    }
  },
  {
    id: 131,
    name: "Lapras",
    types: ["water", "ice"],
    stats: { hp: 130, attack: 85, defense: 80, spAtk: 85, spDef: 95, speed: 60 },
    sprite: getSprite(131),
    backSprite: getSprite(131),
    moves: [],
    forms: {
      gmax: {
        name: "Gigantamax Lapras",
        sprite: getSprite(10204),
        stats: { hp: 130, attack: 85, defense: 80, spAtk: 85, spDef: 95, speed: 60 }
      }
    }
  },
  {
    id: 569,
    name: "Garbodor",
    types: ["poison"],
    stats: { hp: 80, attack: 95, defense: 82, spAtk: 60, spDef: 82, speed: 75 },
    sprite: getSprite(569),
    backSprite: getSprite(569),
    moves: [],
    forms: {
      gmax: {
        name: "Gigantamax Garbodor",
        sprite: getSprite(10207),
        stats: { hp: 80, attack: 95, defense: 82, spAtk: 60, spDef: 82, speed: 75 }
      }
    }
  },
  {
    id: 809,
    name: "Melmetal",
    types: ["steel"],
    stats: { hp: 135, attack: 143, defense: 143, spAtk: 80, spDef: 65, speed: 34 },
    sprite: getSprite(809),
    backSprite: getSprite(809),
    moves: [],
    forms: {
      gmax: {
        name: "Gigantamax Melmetal",
        sprite: getSprite(10208),
        stats: { hp: 135, attack: 143, defense: 143, spAtk: 80, spDef: 65, speed: 34 }
      }
    }
  },
  {
    id: 812,
    name: "Rillaboom",
    types: ["grass"],
    stats: { hp: 100, attack: 125, defense: 90, spAtk: 60, spDef: 70, speed: 85 },
    sprite: getSprite(812),
    backSprite: getSprite(812),
    moves: [],
    forms: {
      gmax: {
        name: "Gigantamax Rillaboom",
        sprite: getSprite(10209),
        stats: { hp: 100, attack: 125, defense: 90, spAtk: 60, spDef: 70, speed: 85 }
      }
    }
  },
  {
    id: 815,
    name: "Cinderace",
    types: ["fire"],
    stats: { hp: 80, attack: 116, defense: 75, spAtk: 65, spDef: 75, speed: 119 },
    sprite: getSprite(815),
    backSprite: getSprite(815),
    moves: [],
    forms: {
      gmax: {
        name: "Gigantamax Cinderace",
        sprite: getSprite(10210),
        stats: { hp: 80, attack: 116, defense: 75, spAtk: 65, spDef: 75, speed: 119 }
      }
    }
  },
  {
    id: 818,
    name: "Inteleon",
    types: ["water"],
    stats: { hp: 70, attack: 85, defense: 65, spAtk: 125, spDef: 65, speed: 120 },
    sprite: getSprite(818),
    backSprite: getSprite(818),
    moves: [],
    forms: {
      gmax: {
        name: "Gigantamax Inteleon",
        sprite: getSprite(10211),
        stats: { hp: 70, attack: 85, defense: 65, spAtk: 125, spDef: 65, speed: 120 }
      }
    }
  },
  {
    id: 823,
    name: "Corviknight",
    types: ["flying", "steel"],
    stats: { hp: 98, attack: 87, defense: 105, spAtk: 53, spDef: 85, speed: 67 },
    sprite: getSprite(823),
    backSprite: getSprite(823),
    moves: [],
    forms: {
      gmax: {
        name: "Gigantamax Corviknight",
        sprite: getSprite(10212),
        stats: { hp: 98, attack: 87, defense: 105, spAtk: 53, spDef: 85, speed: 67 }
      }
    }
  },
  {
    id: 826,
    name: "Orbeetle",
    types: ["bug", "psychic"],
    stats: { hp: 60, attack: 45, defense: 110, spAtk: 80, spDef: 120, speed: 90 },
    sprite: getSprite(826),
    backSprite: getSprite(826),
    moves: [],
    forms: {
      gmax: {
        name: "Gigantamax Orbeetle",
        sprite: getSprite(10213),
        stats: { hp: 60, attack: 45, defense: 110, spAtk: 80, spDef: 120, speed: 90 }
      }
    }
  },
  {
    id: 834,
    name: "Drednaw",
    types: ["water", "rock"],
    stats: { hp: 90, attack: 115, defense: 90, spAtk: 48, spDef: 68, speed: 74 },
    sprite: getSprite(834),
    backSprite: getSprite(834),
    moves: [],
    forms: {
      gmax: {
        name: "Gigantamax Drednaw",
        sprite: getSprite(10214),
        stats: { hp: 90, attack: 115, defense: 90, spAtk: 48, spDef: 68, speed: 74 }
      }
    }
  },
  {
    id: 839,
    name: "Coalossal",
    types: ["rock", "fire"],
    stats: { hp: 110, attack: 80, defense: 120, spAtk: 80, spDef: 90, speed: 30 },
    sprite: getSprite(839),
    backSprite: getSprite(839),
    moves: [],
    forms: {
      gmax: {
        name: "Gigantamax Coalossal",
        sprite: getSprite(10215),
        stats: { hp: 110, attack: 80, defense: 120, spAtk: 80, spDef: 90, speed: 30 }
      }
    }
  },
  {
    id: 841,
    name: "Flapple",
    types: ["grass", "dragon"],
    stats: { hp: 70, attack: 110, defense: 80, spAtk: 95, spDef: 60, speed: 70 },
    sprite: getSprite(841),
    backSprite: getSprite(841),
    moves: [],
    forms: {
      gmax: {
        name: "Gigantamax Flapple",
        sprite: getSprite(10216),
        stats: { hp: 70, attack: 110, defense: 80, spAtk: 95, spDef: 60, speed: 70 }
      }
    }
  },
  {
    id: 842,
    name: "Appletun",
    types: ["grass", "dragon"],
    stats: { hp: 110, attack: 85, defense: 80, spAtk: 100, spDef: 80, speed: 30 },
    sprite: getSprite(842),
    backSprite: getSprite(842),
    moves: [],
    forms: {
      gmax: {
        name: "Gigantamax Appletun",
        sprite: getSprite(10217),
        stats: { hp: 110, attack: 85, defense: 80, spAtk: 100, spDef: 80, speed: 30 }
      }
    }
  },
  {
    id: 844,
    name: "Sandaconda",
    types: ["ground"],
    stats: { hp: 72, attack: 107, defense: 125, spAtk: 65, spDef: 70, speed: 71 },
    sprite: getSprite(844),
    backSprite: getSprite(844),
    moves: [],
    forms: {
      gmax: {
        name: "Gigantamax Sandaconda",
        sprite: getSprite(10218),
        stats: { hp: 72, attack: 107, defense: 125, spAtk: 65, spDef: 70, speed: 71 }
      }
    }
  },
  {
    id: 849,
    name: "Toxtricity",
    types: ["electric", "poison"],
    stats: { hp: 75, attack: 98, defense: 70, spAtk: 114, spDef: 70, speed: 75 },
    sprite: getSprite(849),
    backSprite: getSprite(849),
    moves: [],
    forms: {
      gmax: {
        name: "Gigantamax Toxtricity",
        sprite: getSprite(10219),
        stats: { hp: 75, attack: 98, defense: 70, spAtk: 114, spDef: 70, speed: 75 }
      }
    }
  },
  {
    id: 851,
    name: "Centiskorch",
    types: ["fire", "bug"],
    stats: { hp: 100, attack: 115, defense: 65, spAtk: 90, spDef: 90, speed: 65 },
    sprite: getSprite(851),
    backSprite: getSprite(851),
    moves: [],
    forms: {
      gmax: {
        name: "Gigantamax Centiskorch",
        sprite: getSprite(10220),
        stats: { hp: 100, attack: 115, defense: 65, spAtk: 90, spDef: 90, speed: 65 }
      }
    }
  },
  {
    id: 858,
    name: "Hatterene",
    types: ["psychic", "fairy"],
    stats: { hp: 57, attack: 90, defense: 95, spAtk: 136, spDef: 103, speed: 29 },
    sprite: getSprite(858),
    backSprite: getSprite(858),
    moves: [],
    forms: {
      gmax: {
        name: "Gigantamax Hatterene",
        sprite: getSprite(10221),
        stats: { hp: 57, attack: 90, defense: 95, spAtk: 136, spDef: 103, speed: 29 }
      }
    }
  },
  {
    id: 861,
    name: "Grimmsnarl",
    types: ["dark", "fairy"],
    stats: { hp: 95, attack: 120, defense: 65, spAtk: 95, spDef: 75, speed: 60 },
    sprite: getSprite(861),
    backSprite: getSprite(861),
    moves: [],
    forms: {
      gmax: {
        name: "Gigantamax Grimmsnarl",
        sprite: getSprite(10222),
        stats: { hp: 95, attack: 120, defense: 65, spAtk: 95, spDef: 75, speed: 60 }
      }
    }
  },
  {
    id: 869,
    name: "Alcremie",
    types: ["fairy"],
    stats: { hp: 65, attack: 60, defense: 75, spAtk: 110, spDef: 121, speed: 64 },
    sprite: getSprite(869),
    backSprite: getSprite(869),
    moves: [],
    forms: {
      gmax: {
        name: "Gigantamax Alcremie",
        sprite: getSprite(10223),
        stats: { hp: 65, attack: 60, defense: 75, spAtk: 110, spDef: 121, speed: 64 }
      }
    }
  },
  {
    id: 879,
    name: "Copperajah",
    types: ["steel"],
    stats: { hp: 122, attack: 130, defense: 69, spAtk: 80, spDef: 69, speed: 30 },
    sprite: getSprite(879),
    backSprite: getSprite(879),
    moves: [],
    forms: {
      gmax: {
        name: "Gigantamax Copperajah",
        sprite: getSprite(10224),
        stats: { hp: 122, attack: 130, defense: 69, spAtk: 80, spDef: 69, speed: 30 }
      }
    }
  },
  {
    id: 884,
    name: "Duraludon",
    types: ["steel", "dragon"],
    stats: { hp: 70, attack: 95, defense: 115, spAtk: 120, spDef: 50, speed: 85 },
    sprite: getSprite(884),
    backSprite: getSprite(884),
    moves: [],
    forms: {
      gmax: {
        name: "Gigantamax Duraludon",
        sprite: getSprite(10225),
        stats: { hp: 70, attack: 95, defense: 115, spAtk: 120, spDef: 50, speed: 85 }
      }
    }
  },
  {
    id: 892,
    name: "Urshifu",
    types: ["fighting", "dark"], // Mặc định Single Strike
    stats: { hp: 100, attack: 130, defense: 100, spAtk: 63, spDef: 60, speed: 97 },
    sprite: getSprite(892),
    backSprite: getSprite(892),
    moves: [],
    forms: {
      gmax: {
        name: "Gigantamax Urshifu",
        sprite: getSprite(10226),
        stats: { hp: 100, attack: 130, defense: 100, spAtk: 63, spDef: 60, speed: 97 }
      }
    }
  },
  // ===================================================================
  // MISSING MEGA EVOLUTION POKEMON
  // ===================================================================
  {
    id: 80,
    name: "Slowbro",
    types: ["water", "psychic"],
    stats: { hp: 95, attack: 75, defense: 110, spAtk: 100, spDef: 80, speed: 30 },
    sprite: getSprite(80),
    backSprite: getSprite(80),
    moves: [],
    forms: {
      mega: {
        name: "Mega Slowbro",
        sprite: getSprite(10071),
        backSprite: getSprite(10071),
        stats: { hp: 95, attack: 75, defense: 180, spAtk: 130, spDef: 80, speed: 30 }
      }
    }
  },
  {
    id: 115,
    name: "Kangaskhan",
    types: ["normal"],
    stats: { hp: 105, attack: 95, defense: 80, spAtk: 40, spDef: 80, speed: 90 },
    sprite: getSprite(115),
    backSprite: getSprite(115),
    moves: [],
    forms: {
      mega: {
        name: "Mega Kangaskhan",
        sprite: getSprite(10039),
        backSprite: getSprite(10039),
        stats: { hp: 105, attack: 125, defense: 100, spAtk: 60, spDef: 100, speed: 100 }
      }
    }
  },
  {
    id: 127,
    name: "Pinsir",
    types: ["bug"],
    stats: { hp: 65, attack: 125, defense: 100, spAtk: 55, spDef: 70, speed: 85 },
    sprite: getSprite(127),
    backSprite: getSprite(127),
    moves: [],
    forms: {
      mega: {
        name: "Mega Pinsir",
        sprite: getSprite(10040),
        backSprite: getSprite(10040),
        stats: { hp: 65, attack: 155, defense: 120, spAtk: 65, spDef: 90, speed: 105 },
        types: ["bug", "flying"] // Thêm hệ Flying
      }
    }
  },
  {
    id: 214,
    name: "Heracross",
    types: ["bug", "fighting"],
    stats: { hp: 80, attack: 125, defense: 75, spAtk: 40, spDef: 95, speed: 85 },
    sprite: getSprite(214),
    backSprite: getSprite(214),
    moves: [],
    forms: {
      mega: {
        name: "Mega Heracross",
        sprite: getSprite(10047),
        backSprite: getSprite(10047),
        stats: { hp: 80, attack: 185, defense: 115, spAtk: 40, spDef: 105, speed: 75 }
      }
    }
  },
  {
    id: 308,
    name: "Medicham",
    types: ["fighting", "psychic"],
    stats: { hp: 60, attack: 60, defense: 75, spAtk: 60, spDef: 75, speed: 80 },
    sprite: getSprite(308),
    backSprite: getSprite(308),
    moves: [],
    forms: {
      mega: {
        name: "Mega Medicham",
        sprite: getSprite(10054),
        backSprite: getSprite(10054),
        stats: { hp: 60, attack: 100, defense: 85, spAtk: 80, spDef: 85, speed: 100 }
      }
    }
  },
  {
    id: 310,
    name: "Manectric",
    types: ["electric"],
    stats: { hp: 70, attack: 75, defense: 60, spAtk: 105, spDef: 60, speed: 105 },
    sprite: getSprite(310),
    backSprite: getSprite(310),
    moves: [],
    forms: {
      mega: {
        name: "Mega Manectric",
        sprite: getSprite(10055),
        backSprite: getSprite(10055),
        stats: { hp: 70, attack: 75, defense: 80, spAtk: 135, spDef: 80, speed: 135 }
      }
    }
  },
  {
    id: 319,
    name: "Sharpedo",
    types: ["water", "dark"],
    stats: { hp: 70, attack: 120, defense: 40, spAtk: 95, spDef: 40, speed: 95 },
    sprite: getSprite(319),
    backSprite: getSprite(319),
    moves: [],
    forms: {
      mega: {
        name: "Mega Sharpedo",
        sprite: getSprite(10070),
        backSprite: getSprite(10070),
        stats: { hp: 70, attack: 140, defense: 70, spAtk: 110, spDef: 65, speed: 105 }
      }
    }
  },
  {
    id: 323,
    name: "Camerupt",
    types: ["fire", "ground"],
    stats: { hp: 70, attack: 100, defense: 70, spAtk: 105, spDef: 75, speed: 40 },
    sprite: getSprite(323),
    backSprite: getSprite(323),
    moves: [],
    forms: {
      mega: {
        name: "Mega Camerupt",
        sprite: getSprite(10087),
        backSprite: getSprite(10087),
        stats: { hp: 70, attack: 120, defense: 100, spAtk: 145, spDef: 105, speed: 20 }
      }
    }
  },
  {
    id: 334,
    name: "Altaria",
    types: ["dragon", "flying"],
    stats: { hp: 75, attack: 70, defense: 90, spAtk: 70, spDef: 105, speed: 80 },
    sprite: getSprite(334),
    backSprite: getSprite(334),
    moves: [],
    forms: {
      mega: {
        name: "Mega Altaria",
        sprite: getSprite(10067),
        backSprite: getSprite(10067),
        stats: { hp: 75, attack: 110, defense: 110, spAtk: 110, spDef: 105, speed: 80 },
        types: ["dragon", "fairy"] // Đổi hệ sang Fairy
      }
    }
  },
  {
    id: 354,
    name: "Banette",
    types: ["ghost"],
    stats: { hp: 64, attack: 115, defense: 65, spAtk: 83, spDef: 63, speed: 65 },
    sprite: getSprite(354),
    backSprite: getSprite(354),
    moves: [],
    forms: {
      mega: {
        name: "Mega Banette",
        sprite: getSprite(10056),
        backSprite: getSprite(10056),
        stats: { hp: 64, attack: 165, defense: 75, spAtk: 93, spDef: 83, speed: 75 }
      }
    }
  },
  {
    id: 362,
    name: "Glalie",
    types: ["ice"],
    stats: { hp: 80, attack: 80, defense: 80, spAtk: 80, spDef: 80, speed: 80 },
    sprite: getSprite(362),
    backSprite: getSprite(362),
    moves: [],
    forms: {
      mega: {
        name: "Mega Glalie",
        sprite: getSprite(10074),
        backSprite: getSprite(10074),
        stats: { hp: 80, attack: 120, defense: 80, spAtk: 120, spDef: 80, speed: 100 }
      }
    }
  },
  {
    id: 380,
    name: "Latias",
    types: ["dragon", "psychic"],
    stats: { hp: 80, attack: 80, defense: 90, spAtk: 110, spDef: 130, speed: 110 },
    sprite: getSprite(380),
    backSprite: getSprite(380),
    moves: [],
    forms: {
      mega: {
        name: "Mega Latias",
        sprite: getSprite(10062),
        backSprite: getSprite(10062),
        stats: { hp: 80, attack: 100, defense: 120, spAtk: 140, spDef: 150, speed: 110 }
      }
    }
  },
  {
    id: 381,
    name: "Latios",
    types: ["dragon", "psychic"],
    stats: { hp: 80, attack: 90, defense: 80, spAtk: 130, spDef: 110, speed: 110 },
    sprite: getSprite(381),
    backSprite: getSprite(381),
    moves: [],
    forms: {
      mega: {
        name: "Mega Latios",
        sprite: getSprite(10063),
        backSprite: getSprite(10063),
        stats: { hp: 80, attack: 130, defense: 100, spAtk: 160, spDef: 120, speed: 110 }
      }
    }
  },
  {
    id: 460,
    name: "Abomasnow",
    types: ["grass", "ice"],
    stats: { hp: 90, attack: 92, defense: 75, spAtk: 92, spDef: 85, speed: 60 },
    sprite: getSprite(460),
    backSprite: getSprite(460),
    moves: [],
    forms: {
      mega: {
        name: "Mega Abomasnow",
        sprite: getSprite(10060),
        backSprite: getSprite(10060),
        stats: { hp: 90, attack: 132, defense: 105, spAtk: 132, spDef: 105, speed: 30 }
      }
    }
  },
  {
    id: 531,
    name: "Audino",
    types: ["normal"],
    stats: { hp: 103, attack: 60, defense: 86, spAtk: 60, spDef: 86, speed: 50 },
    sprite: getSprite(531),
    backSprite: getSprite(531),
    moves: [],
    forms: {
      mega: {
        name: "Mega Audino",
        sprite: getSprite(10069),
        backSprite: getSprite(10069),
        stats: { hp: 103, attack: 60, defense: 126, spAtk: 80, spDef: 126, speed: 50 },
        types: ["normal", "fairy"] // Thêm hệ Fairy
      }
    }
  },
  {
    id: 719,
    name: "Diancie",
    types: ["rock", "fairy"],
    stats: { hp: 50, attack: 100, defense: 150, spAtk: 100, spDef: 150, speed: 50 },
    sprite: getSprite(719),
    backSprite: getSprite(719),
    moves: [],
    forms: {
      mega: {
        name: "Mega Diancie",
        sprite: getSprite(10075),
        backSprite: getSprite(10075),
        stats: { hp: 50, attack: 160, defense: 110, spAtk: 160, spDef: 110, speed: 110 }
      }
    }
  }
];
