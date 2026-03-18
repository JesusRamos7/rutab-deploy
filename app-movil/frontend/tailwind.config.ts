// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  // Ajusta las rutas según tu estructura de carpetas
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;