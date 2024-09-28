/** @type {import('next').NextConfig} */
const nextConfig = {
  'distDir': '../../out/web-client/.next',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  }
};

export default nextConfig;
