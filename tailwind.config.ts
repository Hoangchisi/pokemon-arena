import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // QUAN TRỌNG: Safelist giúp Tailwind không xóa các class dynamic khi build
  // @ts-ignore
  safelist: [
    {
      pattern: /bg-type-(normal|fire|water|grass|electric|ice|fighting|poison|ground|flying|psychic|bug|rock|ghost|dragon|steel|dark|fairy)/,
    },
    {
      pattern: /text-type-(normal|fire|water|grass|electric|ice|fighting|poison|ground|flying|psychic|bug|rock|ghost|dragon|steel|dark|fairy)/,
    }
  ],
  theme: {
    extend: {
      colors: {
        // Bảng màu Pokemon Official
        type: {
          normal: '#A8A77A',
          fire: '#EE8130',
          water: '#6390F0',
          electric: '#F7D02C',
          grass: '#7AC74C',
          ice: '#96D9D6',
          fighting: '#C22E28',
          poison: '#A33EA1',
          ground: '#E2BF65',
          flying: '#A98FF3',
          psychic: '#F95587',
          bug: '#A6B91A',
          rock: '#B6A136',
          ghost: '#735797',
          dragon: '#6F35FC',
          steel: '#B7B7CE',
          fairy: '#D685AD',
          dark: '#705746',
        }
      },
    },
  },
  plugins: [],
};

export default config;