// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const flumensTailwind = require('@flumens/tailwind/tailwind.config.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{ts,tsx}',
    'node_modules/@flumens/ionic/dist/**/*.{js,ts,jsx,tsx}',
    'node_modules/@flumens/tailwind/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      ...flumensTailwind.theme?.extend,

      colors: {
        primary: {
          // https://www.tailwindshades.com/#color=77.36842105263156%2C19.387755102040813%2C38.431372549019606&step-up=10&step-down=10&hue-shift=0&name=finch&base-stop=6&v=1&overrides=e30%3D
          DEFAULT: '#6A754F',
          50: '#F0F1EB',
          100: '#E4E7DC',
          200: '#CCD3BD',
          300: '#B5BE9F',
          400: '#9EAA80',
          500: '#869364',
          600: '#6A754F',
          700: '#4E573A',
          800: '#333826',
          900: '#171A11',
          950: '#090A07',
        },

        secondary: {
          // https://www.tailwindshades.com/#color=22.307692307692303%2C54.16666666666667%2C28.235294117647058&step-up=12&step-down=7&hue-shift=0&name=pickled-bean&base-stop=6&v=1&overrides=e30%3D
          DEFAULT: '#6F3E21',
          50: '#F8EEE8',
          100: '#F1DDD1',
          200: '#E3BAA2',
          300: '#D59772',
          400: '#C77443',
          500: '#9E582F',
          600: '#6F3E21',
          700: '#532F19',
          800: '#381F11',
          900: '#1C1008',
          950: '#0F0804',
        },

        tertiary: {
          // https://www.tailwindshades.com/#color=203.89830508474577%2C100%2C46.27450980392157&step-up=9&step-down=12&hue-shift=0&name=azure-radiance&base-stop=6&v=1&overrides=e30%3D
          DEFAULT: '#008EEC',
          50: '#E9F6FF',
          100: '#D3EDFF',
          200: '#A5DBFF',
          300: '#77C9FF',
          400: '#49B6FF',
          500: '#1BA4FF',
          600: '#008EEC',
          700: '#0069AF',
          800: '#004472',
          900: '#002034',
          950: '#000D16',
        },

        success: {
          // https://www.tailwindshades.com/#color=128.25396825396825%2C100%2C32&step-up=8&step-down=11&hue-shift=0&name=fun-green&base-stop=7&v=1&overrides=e30%3D
          DEFAULT: '#00A316',
          50: '#ADFFB9',
          100: '#99FFA7',
          200: '#70FF84',
          300: '#47FF61',
          400: '#1FFF3D',
          500: '#00F522',
          600: '#00CC1C',
          700: '#00A316',
          800: '#006B0F',
          900: '#003307',
          950: '#001703',
        },

        warning: {
          // https://www.tailwindshades.com/#color=48.48214285714286%2C100%2C43.92156862745098&step-up=8&step-down=11&hue-shift=0&name=corn&base-stop=6&v=1&overrides=e30%3D
          DEFAULT: '#E0B500',
          50: '#FFF3C1',
          100: '#FFEFAD',
          200: '#FFE784',
          300: '#FFE05B',
          400: '#FFD833',
          500: '#FFD00A',
          600: '#E0B500',
          700: '#A88800',
          800: '#705A00',
          900: '#382D00',
          950: '#1C1600',
        },

        danger: {
          // https://www.tailwindshades.com/#color=0%2C85.36585365853658%2C59.80392156862745&step-up=8&step-down=11&hue-shift=0&name=flamingo&base-stop=5&v=1&overrides=e30%3D
          DEFAULT: '#F04141',
          50: '#FDEBEB',
          100: '#FCD8D8',
          200: '#F9B2B2',
          300: '#F68D8D',
          400: '#F36767',
          500: '#F04141',
          600: '#E71212',
          700: '#B30E0E',
          800: '#7F0A0A',
          900: '#4B0606',
          950: '#310404',
        },
      },
    },
  },
  plugins: flumensTailwind.plugins,
};
