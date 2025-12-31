/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                port: '',
                pathname: '/**',
            },
        ],
        qualities: [30, 50, 70, 80, 100],
    },
    experimental: {
        reactCompiler: true,
    },
    allowedDevOrigins: ['chatapp.local'],
}

export default nextConfig
