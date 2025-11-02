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
  // Empty turbopack config to silence warning
  turbopack: {},
  serverExternalPackages: ['@huggingface/transformers', 'onnxruntime-node', 'sharp'],
  // Configure headers to allow loading AI models from Hugging Face CDN
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
};

export default nextConfig;
