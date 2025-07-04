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
            screens: {
                xxs: '340px',
                xs: '480px',
                bp900: '900px',
            },
            colors: {
                primary: '#0866ff',
                error: '#ff453a',
                dark: '#18191a',
                darkGray: '#252728',
                systemMessageLight: '#65686C',
                systemMessageDark: '#A1A4A9',
            },
            borderColor: {
                dark: '#212223',
            },
            outline: {
                none: 'none',
            },
            backgroundColor: {
                dark: '#212223',
                lightGray: '#f0f2f5',
                darkGray: '#313233',
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
