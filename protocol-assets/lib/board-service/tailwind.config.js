/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/client/index.html",
    "./src/client/**/*.{js,ts,jsx,tsx}",
    "./public/**/*.{html,js}"
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        // Lerian brand colors with #feed02 accent
        primary: {
          DEFAULT: '#52525b', // zinc-600
          dark: '#3f3f46',    // zinc-700
        },
        accent: {
          DEFAULT: '#feed02', // Lerian yellow
          dark: '#e6d402',    // darker yellow
          light: '#fff456',   // lighter yellow
        },
        secondary: {
          DEFAULT: '#f4f4f5',  // zinc-100
        },
        text: {
          primary: '#52525b',   // zinc-600
          secondary: '#71717a', // zinc-500
          muted: '#a1a1aa',     // zinc-400
        },
        border: '#e4e4e7',     // zinc-200
      },
      letterSpacing: {
        tight: '-0.025em',
      },
      animation: {
        'modal-slide-in': 'modalSlideIn 0.3s ease-out',
      },
      keyframes: {
        modalSlideIn: {
          'from': {
            transform: 'translateY(-50px)',
            opacity: '0',
          },
          'to': {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}