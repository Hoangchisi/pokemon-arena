import { PokemonData } from "@/types/pokemon";
import { POKEDEX } from "@/data/pokedex";

/**
 * Lấy tất cả Pokémon có Mega Evolution
 */
export const getPokemonWithMega = (): PokemonData[] => {
  return POKEDEX.filter(pokemon => pokemon.forms?.mega);
};

/**
 * Lấy tất cả Pokémon có Gigantamax
 */
export const getPokemonWithGmax = (): PokemonData[] => {
  return POKEDEX.filter(pokemon => pokemon.forms?.gmax);
};

/**
 * Lấy tất cả Pokémon có cả Mega lẫn Gigantamax
 */
export const getPokemonWithBothForms = (): PokemonData[] => {
  return POKEDEX.filter(pokemon => pokemon.forms?.mega && pokemon.forms?.gmax);
};

/**
 * Lấy tất cả Pokémon có Mega hoặc Gigantamax
 */
export const getPokemonWithTransformations = (): PokemonData[] => {
  return POKEDEX.filter(pokemon => pokemon.forms?.mega || pokemon.forms?.gmax);
};

/**
 * Lấy Pokémon cụ thể theo tên/id
 */
export const getPokemonById = (id: number): PokemonData | undefined => {
  return POKEDEX.find(pokemon => pokemon.id === id);
};

export const getPokemonByName = (name: string): PokemonData | undefined => {
  return POKEDEX.find(pokemon => pokemon.name.toLowerCase() === name.toLowerCase());
};

/**
 * Kiểm tra xem Pokémon có Mega Evolution không
 */
export const hasMega = (pokemonId: number): boolean => {
  const pokemon = getPokemonById(pokemonId);
  return !!pokemon?.forms?.mega;
};

/**
 * Kiểm tra xem Pokémon có Gigantamax không
 */
export const hasGmax = (pokemonId: number): boolean => {
  const pokemon = getPokemonById(pokemonId);
  return !!pokemon?.forms?.gmax;
};

/**
 * Lấy thông tin Mega form của Pokémon
 */
export const getMegaForm = (pokemonId: number) => {
  const pokemon = getPokemonById(pokemonId);
  return pokemon?.forms?.mega;
};

/**
 * Lấy thông tin Gigantamax form của Pokémon
 */
export const getGmaxForm = (pokemonId: number) => {
  const pokemon = getPokemonById(pokemonId);
  return pokemon?.forms?.gmax;
};

/**
 * Lấy tất cả forms của Pokémon
 */
export const getPokemonForms = (pokemonId: number) => {
  const pokemon = getPokemonById(pokemonId);
  return pokemon?.forms;
};

/**
 * Lấy thống kê về transformations
 */
export const getTransformationStats = () => {
  const allPokemon = POKEDEX;
  const withMega = getPokemonWithMega();
  const withGmax = getPokemonWithGmax();
  const withBoth = getPokemonWithBothForms();

  return {
    total: allPokemon.length,
    megaCount: withMega.length,
    gmaxCount: withGmax.length,
    bothCount: withBoth.length,
    transformableCount: getPokemonWithTransformations().length,
  };
};

/**
 * Dữ liệu thống kê chi tiết
 */
export const getDetailedStats = () => {
  const stats = getTransformationStats();
  const megaPokemon = getPokemonWithMega();
  const gmaxPokemon = getPokemonWithGmax();
  const onlyMega = megaPokemon.filter(p => !hasGmax(p.id));
  const onlyGmax = gmaxPokemon.filter(p => !hasMega(p.id));

  return {
    ...stats,
    megaOnly: onlyMega.map(p => p.name),
    gmaxOnly: onlyGmax.map(p => p.name),
    bothForms: getPokemonWithBothForms().map(p => p.name),
    megaList: megaPokemon.map(p => ({ id: p.id, name: p.name })),
    gmaxList: gmaxPokemon.map(p => ({ id: p.id, name: p.name })),
  };
};

/**
 * Format dữ liệu để hiển thị
 */
export const formatPokemonWithForms = (pokemon: PokemonData) => {
  const forms: string[] = [];
  if (pokemon.forms?.mega) forms.push(`Mega (${pokemon.forms.mega.name})`);
  if (pokemon.forms?.gmax) forms.push(`Gmax (${pokemon.forms.gmax.name})`);

  return {
    id: pokemon.id,
    name: pokemon.name,
    types: pokemon.types,
    forms: forms.length > 0 ? forms : ["Normal only"],
    hasMega: !!pokemon.forms?.mega,
    hasGmax: !!pokemon.forms?.gmax,
  };
};
