/**
 * Kiểm tra xem Pokemon có Mega Evolution (ưu tiên dữ liệu local từ pokedex.ts)
 */
export async function hasMegaEvolution(pokemonName: string): Promise<boolean> {
  try {
    // Ưu tiên dữ liệu local
    const { hasMega } = await getPokemonTransformationVarieties(pokemonName);
    return hasMega;
  } catch (e) {
    console.error('Error checking Mega Evolution:', e);
    return false;
  }
}

/**
 * Kiểm tra xem Pokemon có Gigantamax (ưu tiên dữ liệu local từ pokedex.ts)
 */
export async function hasGigantamax(pokemonName: string): Promise<boolean> {
  try {
    // Ưu tiên dữ liệu local
    const { hasGmax } = await getPokemonTransformationVarieties(pokemonName);
    return hasGmax;
  } catch (e) {
    console.error('Error checking Gigantamax:', e);
    return false;
  }
}

import { getPokemonByName } from "@/lib/pokemon-forms";

/**
 * Lấy cả hai thông tin (ưu tiên dữ liệu local từ pokedex.ts, fallback sang PokeAPI)
 */
export async function getPokemonTransformationVarieties(pokemonName: string): Promise<{ hasMega: boolean; hasGmax: boolean }> {
  try {
    // Bước 1: Kiểm tra dữ liệu local trước
    const localPokemon = getPokemonByName(pokemonName);
    if (localPokemon) {
      return {
        hasMega: !!localPokemon.forms?.mega,
        hasGmax: !!localPokemon.forms?.gmax,
      };
    }

    // Bước 2: Nếu không có trong local, gọi PokeAPI
    const query = `
      query PokemonVarieties($name: String) {
        pokemon_v2_pokemon(where: {name: {_eq: $name}}) {
          pokemon_v2_pokemonforms {
            form_name
          }
        }
      }
    `;

    const res = await fetch("https://beta.pokeapi.co/graphql/v1beta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { name: pokemonName.toLowerCase() } })
    });

    const json = await res.json();
    const data = json.data.pokemon_v2_pokemon[0];

    if (!data) return { hasMega: false, hasGmax: false };

    const forms = data.pokemon_v2_pokemonforms;
    const formNames = forms.map((f: any) => f.form_name.toLowerCase());

    return {
      hasMega: formNames.some((name: string) => name.includes('mega')),
      hasGmax: formNames.some((name: string) => name.includes('gmax')),
    };
  } catch (e) {
    console.error('Error checking Pokemon varieties:', e);
    return { hasMega: false, hasGmax: false };
  }
}
