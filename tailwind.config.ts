import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    './src/**/*.{tsx,ts}'
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui')
  ],

  daisyui: {
    themes: ['dracula', 'dark', 'night'], // false: only light + dark | true: all themes | array: specific themes like this ["light", "dark", "cupcake"]
    darkTheme: "dark", // name of one of the included themes for dark mode
    base: true, // applies background color and foreground color for root element by default
    styled: true, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    prefix: "", // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
    logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
    themeRoot: ":root", // The element that receives theme color CSS variables
  },
};
export default config;
