/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Değişkenleri Tailwind renklerine atıyoruz
        mainBg: "rgb(var(--color-background) / <alpha-value>)",
        mainText: "rgb(var(--color-text-main) / <alpha-value>)",
        mutedText: "rgb(var(--color-text-muted) / <alpha-value>)",
        cardBg: "rgb(var(--color-card) / <alpha-value>)",
        primary: "rgb(var(--color-primary) / <alpha-value>)",
      },
      keyframes: {
        "slide-down": {
          "0%": { opacity: "0", transform: "translate(-50%, -20px)" },
          "100%": { opacity: "1", transform: "translate(-50%, 0)" },
        },
      },
      animation: {
        "slide-down": "slide-down 0.35s ease-out",
      },
    },
  },
  plugins: [],
};
