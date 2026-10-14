/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: '*.supabase.co',
            },
            {
                protocol: 'https',
                hostname: '*.supabase.in',
            },
        ],
    },
    async redirects() {
        // The self-serve audit was replaced by a meeting request.
        return [{ source: "/audit", destination: "/contact", permanent: true }];
    },
};

export default nextConfig;
