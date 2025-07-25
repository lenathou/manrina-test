import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    webpack: (config) => {
        config.resolve.alias = {
            ...(config.resolve.alias || {}),
            // Transform all direct `react-native` imports to `react-native-web`
            'react-native$': 'react-native-web',
            // Add the @ alias
            '@': path.resolve(__dirname, 'src'),
        };
        return config;
    },
};

export default nextConfig;
