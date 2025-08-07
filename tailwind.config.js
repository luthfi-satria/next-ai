// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "from-blue-500",
    "from-gray-100",
    "from-emerald-500",
    "from-red-500",
    "via-teal-500",
    "via-sky-500",
    "to-indigo-600",
    "to-gray-200",
    "to-green-600",
    "to-red-600",
    "focus:ring-blue-500",
    "hover:from-gray-200",
    "hover:from-blue-600",
    "hover:from-emerald-600",
    "hover:to-gray-300",
    "hover:to-indigo-700",
    "hover:to-green-800",
    "hover:to-red-600",
    "hover:to-red-800",
    "hover:via-sky-600",
    "hover:via-teal-600",
    "focus:ring-gray-500",
    "focus:ring-blue-500",
    "focus:ring-emerald-500",
    "focus:ring-red-500",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          500: "#34D399",
          600: "#10B981",
          700: "#059669",
        },
        accent: "#FBBF24",
      },
      boxShadow: {
        "custom-light": "0 4px 12px rgba(0, 0, 0, 0.08)",
        "custom-medium": "0 8px 24px rgba(0, 0, 0, 0.12)",
      },
    },
  },
  plugins: [],
}
