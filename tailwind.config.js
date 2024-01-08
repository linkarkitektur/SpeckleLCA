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
      colors: {
        primary: {
          600: '#12203f',
          500: '#1c3365',
          400: '#26468b',
          300: '#2144a8',
          200: '#2853ce',
          100: '#2f62f4',
        },
      },
      // here's how to extend fonts if needed
      fontFamily: {
        sans: ['Space Grotesk', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  variants: {
    extend: {},
  },
  // corePlugins: {
  //   aspectRatio: false,
  // },
  blocklist: [], // ['container', 'collapse']
  plugins: [
    require('@tailwindcss/forms'),
    // require('@tailwindcss/aspect-ratio'),
  ],
}
