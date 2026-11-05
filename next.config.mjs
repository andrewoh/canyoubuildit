/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: "/amex-platinum-tracker", destination: "/amex-platinum-tracker/index.html" },
      {
        source: "/interest-boards",
        destination: "/interest-boards/index.html",
      },
    ];
  },
};
export default nextConfig;
