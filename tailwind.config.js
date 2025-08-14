/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'primary-orange': '#F68622',
        'primary-dark': '#070804',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
  // Optimize for production
  corePlugins: {
    // Disable unused core plugins to reduce bundle size
    preflight: true,
    container: true,
    accessibility: false,
    appearance: false,
    backdropBlur: false,
    backdropBrightness: false,
    backdropContrast: false,
    backdropGrayscale: false,
    backdropHueRotate: false,
    backdropInvert: false,
    backdropOpacity: false,
    backdropSaturate: false,
    backdropSepia: false,
    backgroundAttachment: false,
    backgroundClip: false,
    backgroundOrigin: false,
    backgroundPosition: false,
    backgroundRepeat: false,
    backgroundSize: false,
    blur: false,
    brightness: false,
    contrast: false,
    dropShadow: false,
    grayscale: false,
    hueRotate: false,
    invert: false,
    saturate: false,
    sepia: false,
    filter: false,
    backdropFilter: false,
  }
}
