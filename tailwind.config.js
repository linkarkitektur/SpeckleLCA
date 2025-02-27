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
      },
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
    // require('@tailwindcss/aspect-ratio'),
  ],
}
