/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/interest-boards",
        destination: "/interest-boards/index.html",
      },
    ];
  },
};
export default nextConfig;
