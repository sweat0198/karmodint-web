/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue'
  ],
  theme: {
    extend: {
      colors: {
        'brand-navy': '#121C2A',
        'brand-navy-heading': '#291715',
        'brand-navy-slate': '#3D4756',
        'brand-red': '#E31E24',
        'brand-red-hover': '#C9181D',
        'brand-red-dark': '#BA0013',
        'brand-red-deep': '#90000F',
        'brand-slate-muted': '#64748B',
        'brand-slate-light': '#BDC7D9',
        'brand-rose-bg': '#FFF8F7',
        'brand-rose-card': '#FFE9E6',
        'brand-rose-border': '#E7BDB8',
        'brand-rose-text': '#5D3F3C',
        'brand-rose-footer': '#FDDBD7',
        'brand-navy-dark': '#402B29'
      }
    }
  }
}
