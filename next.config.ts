module.exports = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      new URL("https://res.cloudinary.com/dqfqrbix1/image/upload/**"),
    ],
  },
};
