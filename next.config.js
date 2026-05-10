/** @type {import('next').NextConfig} */
const nextConfig = {
  // Solana/Web3 bağımlılıklarını sunucu bundle'ının dışında tut (Next.js 14.2)
  experimental: {
    serverComponentsExternalPackages: [
      '@solana/web3.js',
      'rpc-websockets',
      '@solana/buffer-layout',
      'bs58',
      'borsh',
    ],
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Tarayıcı bundle'ında Node.js özgü modülleri devre dışı bırak
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        path: false,
        os: false,
        zlib: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
