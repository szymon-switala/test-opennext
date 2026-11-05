import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  {
    key: "Content-Security-Policy",
    // frame-ancestors 'self' is for tester.html only; the standard uses 'none'.
    value:
      "default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://cdn.sanity.io; connect-src 'self'; frame-src https://challenges.cloudflare.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'",
  },
];

const config: NextConfig = {
  turbopack: {
    rules: { "*.svg": { loaders: ["@svgr/webpack"], as: "*.js" } },
  },
  experimental: { globalNotFound: true },
  async redirects() {
    return [{ source: "/", destination: "/pl", permanent: false }];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default config;
