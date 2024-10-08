import { error } from 'console'
import type { Config } from 'tailwindcss'

const config: Config = {
    mode: 'jit',
    darkMode: 'class',
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/layouts/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            height: {
                header: '56px',
            },
            colors: {
                primary: '#0866ff',
                error: '#ff453a',
                dark: '#18191a',
                darkGray: '#242526',
            },
            outline: {
                none: 'none',
            },
            backgroundColor: {
                dark: '#18191a',
                lightGray: '#f0f2f5',
                darkGray: '#242526',
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
