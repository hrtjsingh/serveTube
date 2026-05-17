import type { NextConfig } from "next";
const isDev = process.env.NODE_ENV === "development";

const CSP = [
  "default-src 'self'",

  `script-src 'self' 'unsafe-inline' ${
    isDev ? "'unsafe-eval'" : ""
  } https://www.youtube.com https://s.ytimg.com  http://www.youtube.com http://s.ytimg.com`,

  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https://i.ytimg.com https://www.youtube.com",
  "frame-src https://www.youtube.com https://www.youtube-nocookie.com http://www.youtube.com http://www.youtube-nocookie.com",
  "connect-src 'self' https://www.googleapis.com https://www.youtube.com https://fonts.googleapis.com",
  "media-src 'self' https://www.youtube.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "Cross-Origin-Embedder-Policy", value: "unsafe-none" }, // needed for YouTube iframes
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      // Security headers on all pages
      { source: "/(.*)", headers: SECURITY_HEADERS },

      // Deny all cross-origin API requests (M6 FIX)
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NEXT_PUBLIC_APP_URL || "",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,PATCH,DELETE,OPTIONS",
          },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
          { key: "Access-Control-Max-Age", value: "86400" },
        ],
      },

      // Service worker — never cache
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
        ],
      },

      // Web app manifest
      {
        source: "/manifest.json",
        headers: [{ key: "Content-Type", value: "application/manifest+json" }],
      },
    ];
  },
};

export default nextConfig;
