/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./layout/**/*.ejs"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: {
          light: "#FAFAF8",
          dark: "#121212",
        },
        text: {
          primary: "#1A1A1A",
          secondary: "#6B6B6B",
          "primary-dark": "#E0DED8",
          "secondary-dark": "#8A8A8A",
        },
        accent: {
          DEFAULT: "#3acce8",
          dark: "#E8563A",
        },
        border: {
          light: "#E8E6E3",
          dark: "#2A2A2A",
        },
      },
      fontFamily: {
        body: ['"Noto Serif JP"', '"Noto Serif SC"', "Georgia", "serif"],
        heading: ['"Shippori Mincho"', '"Noto Serif JP"', "serif"],
        mono: ['"JetBrains Mono"', '"Fira Code"', "monospace"],
      },
      maxWidth: {
        content: "720px",
        wide: "1200px",
      },
      lineHeight: {
        relaxed: "1.8",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
    },
  },
  plugins: [],
};
