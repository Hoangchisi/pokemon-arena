import { PokemonData } from "@/types/pokemon";

export async function getPokemonDetails(nameOrId: string): Promise<PokemonData | null> {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${nameOrId.toLowerCase()}`);
    if (!res.ok) return null;
    const data = await res.json();

    return {
      id: data.id,
      name: data.name,
      types: data.types.map((t: any) => t.type.name),
      sprite: data.sprites.front_default,
      stats: {
        hp: data.stats[0].base_stat,
        attack: data.stats[1].base_stat,
        defense: data.stats[2].base_stat,
        spAtk: data.stats[3].base_stat,
        spDef: data.stats[4].base_stat,
        speed: data.stats[5].base_stat,
      },
      // Lấy 20 moves đầu cho nhẹ (Production nên filter move gây dmg)
      moves: data.moves.map((m: any) => m.move.name).slice(0, 50), 
    };
  } catch (error) {
    console.error("Fetch Pokemon Error", error);
    return null;
  }
}