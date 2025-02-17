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
    optimizeCss: true,
    optimizePackageImports: ['@react-three/fiber', '@react-three/drei', 'three'],
  },
  // Prevent unwanted optimizations that could affect Three.js
  compiler: {
    removeConsole: false,
  },
}

export default nextConfig;
// 