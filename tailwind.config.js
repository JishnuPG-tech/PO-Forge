/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        border: "var(--border)",
        text: "var(--text)",
        "text-muted": "var(--text-muted)",
        accent: "var(--accent)",
        "accent-soft": "var(--accent-soft)",
        success: "var(--success)",
        "success-soft": "rgba(63, 190, 115, 0.12)",
        danger: "var(--danger)",
        "danger-soft": "rgba(242, 92, 92, 0.12)",
        warning: "var(--warning)",
        "warning-soft": "rgba(224, 166, 74, 0.12)",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Inter", "sans-serif"],
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        card: "12px",
        btn: "10px",
        badge: "9999px",
      },
    },
  },
  plugins: [],
};
