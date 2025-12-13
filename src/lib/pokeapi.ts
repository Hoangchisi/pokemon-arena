import { PokemonData } from "@/types/pokemon";

export async function getPokemonDetails(nameOrId: string): Promise<PokemonData | null> {
  const cleanInput = nameOrId.toLowerCase().trim();

  // Query GraphQL lấy TẤT CẢ dữ liệu trong 1 lần gọi
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
            pokemon_v2_type {
              name
            }
          }
        }
      }
    }
  `;

  try {
    // Gọi API GraphQL của PokeAPI
    const res = await fetch("https://beta.pokeapi.co/graphql/v1beta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        variables: { name: cleanInput }
      })
    });

    const json = await res.json();
    const data = json.data.pokemon_v2_pokemon[0];

    if (!data) return null;

    // Kiểm tra xem sprites là string hay đã là object
    const rawSprites = data.pokemon_v2_pokemonsprites[0].sprites;
    let spritesObj;

    if (typeof rawSprites === "string") {
      // Nếu là string thì mới parse
      try {
        spritesObj = JSON.parse(rawSprites);
      } catch (e) {
        console.error("Json parse error", e);
        spritesObj = {};
      }
    } else {
      // Nếu là object rồi thì dùng luôn
      spritesObj = rawSprites;
    }

    const sprite = spritesObj.front_default;

    // Parse Stats (Chuyển mảng thành object {hp, attack...})
    const statsArray = data.pokemon_v2_pokemonstats;
    const getStat = (name: string) => statsArray.find((s: any) => s.pokemon_v2_stat.name === name)?.base_stat || 0;

    return {
      id: data.id,
      name: data.name,
      types: data.pokemon_v2_pokemontypes.map((t: any) => t.pokemon_v2_type.name),
      sprite: sprite || "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png",
      stats: {
        hp: getStat("hp"),
        attack: getStat("attack"),
        defense: getStat("defense"),
        spAtk: getStat("special-attack"),
        spDef: getStat("special-defense"),
        speed: getStat("speed"),
      },
      // Parse Moves kèm theo Type
      moves: data.pokemon_v2_pokemonmoves.map((m: any) => ({
        name: m.pokemon_v2_move.name,
        type: m.pokemon_v2_move.pokemon_v2_type.name
      }))
    };
  } catch (error) {
    console.error("Fetch Pokemon GraphQL Error", error);
    return null;
  }
}

// --- THÊM HÀM NÀY ĐỂ TÌM KIẾM DANH SÁCH ---
export async function searchPokemonList(queryStr: string): Promise<any[]> {
  const cleanInput = queryStr.toLowerCase().trim();
  if (!cleanInput) return [];

  // Tìm tên chứa chuỗi nhập vào (_ilike: "%abc%")
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
        variables: { name: `%${cleanInput}%` } // %...% để tìm kiếm "chứa chuỗi"
      })
    });

    const json = await res.json();
    const list = json.data.pokemon_v2_pokemon;

    return list.map((p: any) => {
      // Parse Sprite
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