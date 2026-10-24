/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/flow',
        destination: '/alur',
        permanent: false,
      },
      {
        source: '/workflow',
        destination: '/alur',
        permanent: false,
      },
      {
        source: '/order',
        destination: '/dine-in?meja=7',
        permanent: false,
      },
      {
        source: '/arsitektur',
        destination: '/alur',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
