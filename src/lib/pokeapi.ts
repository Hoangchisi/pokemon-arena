import { PokemonData } from "@/types/pokemon";

// --- CẤU HÌNH STATS NGƯỜI CHƠI (NERFED) ---
const LEVEL = 50;

// IV (Individual Value): Gen di truyền (0 - 31). 
// Champion thường là 31. Chúng ta set 15 (Trung bình).
const IV = 15; 

// EV (Effort Value): Điểm nỗ lực (0 - 252).
// Champion thường được cộng EV. Chúng ta set 0 (Trung bình).
const EV = 20; 

// Hàm tính HP
const calcHp = (base: number) => {
  // Công thức chuẩn: ((2 * Base + IV + (EV/4)) * Level / 100) + Level + 10
  return Math.floor(((2 * base + IV + (EV / 4)) * LEVEL) / 100) + LEVEL + 10;
};

// Hàm tính các Stat khác (Atk, Def...)
const calcStat = (base: number) => {
  // Công thức chuẩn: (((2 * Base + IV + (EV/4)) * Level / 100) + 5) * Nature
  // Ở đây ta bỏ qua Nature (x1.0) để đơn giản
  return Math.floor(((2 * base + IV + (EV / 4)) * LEVEL) / 100) + 5;
};

export async function getPokemonDetails(nameOrId: string): Promise<PokemonData | null> {
  const cleanInput = nameOrId.toLowerCase().trim();
  
  const query = `
    query PokemonInfo($name: String) {
      pokemon_v2_pokemon(where: {name: {_eq: $name}}) {
        id
        name
        pokemon_v2_pokemontypes {
          pokemon_v2_type {
            name
          }
        }
        pokemon_v2_pokemonsprites {
          sprites
        }
        pokemon_v2_pokemonstats {
          base_stat
          pokemon_v2_stat {
            name
          }
        }
        pokemon_v2_pokemonmoves(distinct_on: move_id) {
          pokemon_v2_move {
            name
            power
            accuracy
            pokemon_v2_type {
              name
            }
            pokemon_v2_movedamageclass {
              name
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch("https://beta.pokeapi.co/graphql/v1beta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { name: cleanInput } })
    });

    const json = await res.json();
    const data = json.data.pokemon_v2_pokemon[0];

    if (!data) return null;

    // Sprite
    const rawSprites = data.pokemon_v2_pokemonsprites[0].sprites;
    let spritesObj: any = {};
    try {
        spritesObj = typeof rawSprites === "string" ? JSON.parse(rawSprites) : rawSprites;
    } catch(e) {}
    const sprite = spritesObj['front_default'] || "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png";

    // Stats
    const statsArray = data.pokemon_v2_pokemonstats;
    const getBaseStat = (name: string) => statsArray.find((s: any) => s.pokemon_v2_stat.name === name)?.base_stat || 0;

    const stats = {
        hp: calcHp(getBaseStat("hp")),
        attack: calcStat(getBaseStat("attack")),
        defense: calcStat(getBaseStat("defense")),
        spAtk: calcStat(getBaseStat("special-attack")),
        spDef: calcStat(getBaseStat("special-defense")),
        speed: calcStat(getBaseStat("speed")),
    };

    return {
      id: data.id,
      name: data.name,
      types: data.pokemon_v2_pokemontypes.map((t: any) => t.pokemon_v2_type.name),
      sprite: sprite,
      stats: stats,
      moves: data.pokemon_v2_pokemonmoves.map((m: any) => ({
        name: m.pokemon_v2_move.name,
        type: m.pokemon_v2_move.pokemon_v2_type.name,
        category: m.pokemon_v2_move.pokemon_v2_movedamageclass?.name || "status",
        power: m.pokemon_v2_move.power,
        accuracy: m.pokemon_v2_move.accuracy
      }))
    };
  } catch (error) {
    console.error("Fetch Pokemon GraphQL Error", error);
    return null;
  }
}

export async function searchPokemonList(queryStr: string): Promise<any[]> {
    const cleanInput = queryStr.toLowerCase().trim();
    if (!cleanInput) return [];
  
    const query = `
      query SearchPokemon($name: String) {
        pokemon_v2_pokemon(where: {name: {_ilike: $name}}, limit: 20) {
          name
          pokemon_v2_pokemontypes {
            pokemon_v2_type {
              name
            }
          }
          pokemon_v2_pokemonsprites {
            sprites
          }
        }
      }
    `;
  
    try {
      const res = await fetch("https://beta.pokeapi.co/graphql/v1beta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          variables: { name: `%${cleanInput}%` }
        })
      });
  
      const json = await res.json();
      const list = json.data.pokemon_v2_pokemon;
  
      return list.map((p: any) => {
        const rawSprites = p.pokemon_v2_pokemonsprites[0].sprites;
        let spriteUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png";
        
        try {
          const parsed = typeof rawSprites === "string" ? JSON.parse(rawSprites) : rawSprites;
          spriteUrl = parsed.front_default || spriteUrl;
        } catch (e) {}
  
        return {
          name: p.name,
          types: p.pokemon_v2_pokemontypes.map((t: any) => t.pokemon_v2_type.name),
          sprite: spriteUrl
        };
      });
    } catch (error) {
      console.error("Search List Error", error);
      return [];
    }
}