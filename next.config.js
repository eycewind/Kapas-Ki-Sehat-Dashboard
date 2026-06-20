/** @type {import('next').NextConfig} */
const nextConfig = {
  // The dashboard lives at /admin/dashboard; there is no page at the root, so a
  // bare "/" 404s (notably on Vercel). Redirect root → the dashboard.
  // permanent: false → 307 (temporary) so it's not cached hard by browsers/CDNs
  // if the canonical route changes later.
  async redirects() {
    return [
      {
        source: '/',
        destination: '/admin/dashboard',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
