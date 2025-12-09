const nextConfig = {
  compiler: {
    // Remove console logs in production, but keep console.error for error tracking
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error"], // Keep console.error in production
          }
        : false,
  },
};

module.exports = nextConfig;
