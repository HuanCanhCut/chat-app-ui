import type { Config } from 'tailwindcss'

const config: Config = {
    mode: 'jit',
    darkMode: 'class',
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: '#fe2c55',
            },
            outline: {
                none: 'none',
            },
            backgroundColor: {
                dark: '#242526',
                lightGray: '#f0f2f5',
                darkGray: '#3a3b3c',
            },
            textColor: {
                dark: '#ffffffe6',
            },
            boxShadow: {
                light: '3px 5px 15px rgba(0, 0, 0, 0.3)',
                dark: '3px 5px 15px rgba(255, 255, 255, 0.3)',
            },
        },
    },
    plugins: [],
}
export default config
