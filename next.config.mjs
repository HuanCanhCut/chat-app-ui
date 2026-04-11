/** @type {import('next').NextConfig} */

const remotePatterns = [
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
]

// only accept all images in development mode
if (process.env.NODE_ENV === 'development') {
    remotePatterns.push({
        protocol: 'https',
        hostname: '**',
    })
}

const nextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns,
        qualities: [30, 50, 70, 80, 100],
    },
    experimental: {
        reactCompiler: true,
    },
    allowedDevOrigins: ['chatapp.local'],
}

export default nextConfig
