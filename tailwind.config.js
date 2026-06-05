/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Tailwind's built-in max-width scale stops at 7xl (80rem / 1280px),
      // which left a lot of empty side space on wide monitors. 8xl widens the
      // dashboard container to ~full width on a 1080p display while still
      // capping gracefully on ultra-wide screens (rather than full-bleed).
      maxWidth: {
        '8xl': '120rem', // 1920px
      },
    },
  },
  plugins: [],
}
