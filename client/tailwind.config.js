/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#8B5CF6',
          foreground: '#FFFFFF',
        },
        background: '#0F0F0F',
        foreground: '#FFFFFF',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
