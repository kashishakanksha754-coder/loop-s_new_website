/* Loop Methods — shared Tailwind config. Load right after the Tailwind CDN script. */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        accent: '#4FA8FF'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    }
  }
};
