//@ts-check
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    svgr: false,
  },
  output: 'standalone',
  i18n: {
    locales: ['en-US', 'es', 'sv'],
    defaultLocale: 'en-US',
  },
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'ethosorder-storage.s3.amazonaws.com'
    }],
  },
  reactStrictMode: true,
};

const plugins = [withNx];

module.exports = composePlugins(...plugins)(nextConfig);
