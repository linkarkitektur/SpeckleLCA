/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
module.exports = {
  relateive: false,
  content: [
    './index.html',
    './public/**/*.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        lexend: ['"Lexend Mega"', 'sans-serif'],
        number: ['"Major Mono Display"', 'monospace'],
        bread: ['Merriweather', 'serif'],
        poppins: ['Poppins', 'serif']
      },
    },
    patterns: {
      opacities: {
          100: "1",
          80: ".80",
          60: ".60",
          40: ".40",
          20: ".20",
          10: ".10",
          5: ".05",
      },
      sizes: {
          1: "0.25rem",
          2: "0.5rem",
          4: "1rem",
          6: "1.5rem",
          8: "2rem",
          16: "4rem",
          20: "5rem",
          24: "6rem",
          32: "8rem",
      }
    },
  },
  variants: {
    extend: {},
  },
  corePlugins: {
    aspectRatio: false,
  },
  blocklist: [], // ['container', 'collapse']
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwindcss-bg-patterns'),
    // require('@tailwindcss/aspect-ratio'),
  ],
}
