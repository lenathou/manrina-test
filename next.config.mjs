/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'catalog-images-live.s3.amazonaws.com',
                port: '',
            },
            {
                protocol: 'https',
                hostname: 'images.sumup.com',
                port: '',
            },
            {
                protocol: 'https',
                hostname: 'cdn.sumup.store',
                port: '',
            },
            {
                protocol: 'https',
                hostname: 'www.manrina.fr',
                port: '',
            },
        ],
        minimumCacheTTL: 2678400, // 31 days
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    webpack: (config, { isServer }) => {
        config.resolve.alias = {
            ...(config.resolve.alias || {}),
            // Transform all direct `react-native` imports to `react-native-web`
            'react-native$': 'react-native-web',
        };
        
        // Fix for Prisma client-side imports
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                'fs/promises': false,
                child_process: false,
                async_hooks: false,
                net: false,
                tls: false,
                crypto: false,
                stream: false,
                url: false,
                zlib: false,
                http: false,
                https: false,
                assert: false,
                os: false,
                path: false,
                querystring: false,
                util: false,
                buffer: false,
                events: false,
            };
        }
        
        return config;
    },
};

export default nextConfig;
