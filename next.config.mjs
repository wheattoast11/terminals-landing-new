/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // This is important for GitHub Pages to work properly
  trailingSlash: true,
  // Ensure we handle fonts and other static assets correctly
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource',
    });
    return config;
  },
  // Ensure consistent static generation
  experimental: {
    optimizeCss: false,
    optimizePackageImports: ['@react-three/fiber', '@react-three/drei', 'three'],
  },
  // Prevent unwanted optimizations that could affect Three.js
  compiler: {
    removeConsole: false,
  },
  // Custom error pages for static export
  async redirects() {
    return [
      {
        source: '/404',
        destination: '/',
        permanent: true,
      },
      {
        source: '/500',
        destination: '/',
        permanent: true,
      },
    ];
  },
}

export default nextConfig;
// 