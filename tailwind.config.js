/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'hsl(220, 12%, 98%)',
        accent: 'hsl(220, 80%, 50%)',
        border: 'hsl(220, 14%, 90%)',
        primary: 'hsl(220, 20%, 8%)',
        surface: 'hsl(220, 12%, 100%)',
        dark: {
          bg: 'hsl(220, 20%, 8%)',
          surface: 'hsl(220, 15%, 12%)',
          border: 'hsl(220, 15%, 20%)',
          text: 'hsl(220, 15%, 95%)',
          muted: 'hsl(220, 15%, 60%)',
        }
      },
      borderRadius: {
        'lg': '12px',
        'md': '8px',
        'sm': '4px',
      },
      spacing: {
        'lg': '24px',
        'md': '16px',
        'sm': '8px',
      },
      boxShadow: {
        'card': '0 4px 12px hsla(220, 10%, 60%, 0.1)',
        'card-dark': '0 4px 12px hsla(220, 10%, 0%, 0.3)',
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}