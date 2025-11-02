import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "*.britannica.com",
      },
      {
        protocol: "https",
        hostname: "plato.stanford.edu",
      },
      {
        protocol: "https",
        hostname: "www.iep.utm.edu",
      },
      {
        protocol: "https",
        hostname: "www.sciencedirect.com",
      },
      {
        protocol: "https",
        hostname: "link.springer.com",
      },
      {
        protocol: "https",
        hostname: "www.jstor.org",
      },
      {
        protocol: "https",
        hostname: "www.ncbi.nlm.nih.gov",
      },
      {
        protocol: "https",
        hostname: "pubmed.ncbi.nlm.nih.gov",
      },
      {
        protocol: "https",
        hostname: "arxiv.org",
      },
      {
        protocol: "https",
        hostname: "www.nature.com",
      },
      {
        protocol: "https",
        hostname: "academic.oup.com",
      },
      {
        protocol: "https",
        hostname: "www.cambridge.org",
      },
    ],
  },
  // Optimize for WebLLM and WebAssembly support
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Enable WebAssembly support for WebLLM
      config.experiments = {
        ...config.experiments,
        asyncWebAssembly: true,
        layers: true,
      };

      // Optimize for large model downloads
      config.performance = {
        ...config.performance,
        maxAssetSize: 10000000, // 10MB
        maxEntrypointSize: 10000000,
      };
    }
    return config;
  },
  // CORS headers for WebLLM - using credentialless mode
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
  // Empty turbopack config to silence warning
  turbopack: {},
};

export default nextConfig;
