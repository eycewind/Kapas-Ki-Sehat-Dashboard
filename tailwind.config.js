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
      // Semantic color tokens → CSS custom properties in app/theme.css.
      // These follow data-theme="dark|light" automatically. NOTE: var()-based
      // colors do NOT support Tailwind opacity modifiers (e.g. bg-surface/40) —
      // use a solid token instead.
      colors: {
        bg: 'var(--bg)',
        surface: {
          DEFAULT: 'var(--surface)',
          variant: 'var(--surface-variant)',
          3: 'var(--surface-3)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          bright: 'var(--primary-bright)',
        },
        'on-primary': 'var(--on-primary)',
        fg: {
          DEFAULT: 'var(--text)',
          secondary: 'var(--text-secondary)',
          faint: 'var(--text-faint)',
        },
        border: 'var(--border)',
        info: 'var(--info)',
        gold: {
          fill: 'var(--accent-gold-fill)',
          on: 'var(--on-accent-gold)',
          text: 'var(--accent-gold-text)',
        },
        risk: {
          low: 'var(--risk-low-marker)',
          medium: 'var(--risk-medium-marker)',
          high: 'var(--risk-high-marker)',
          critical: 'var(--risk-critical-marker)',
          'critical-container': 'var(--risk-critical-container)',
          'on-critical': 'var(--risk-on-critical)',
        },
      },
    },
  },
  plugins: [],
}
