/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  transpilePackages: [
    "@plotops/types",
    "@plotops/ui",
    "@plotops/business-logic",
    "@plotops/api-client",
    "@plotops/auth",
    "@plotops/shared",
    "@plotops/config",
  ],
  images: {
    domains: ["localhost"],
  },
};

module.exports = nextConfig;
