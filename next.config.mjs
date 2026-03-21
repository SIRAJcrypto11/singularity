const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true, // Required for Electron/local loading
  },
};

export default nextConfig;
