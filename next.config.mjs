/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // AWS S3 bucket images
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      // Local backend (development)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8081',
        pathname: '/uploads/**',
      },
      // Unsplash CDN
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
