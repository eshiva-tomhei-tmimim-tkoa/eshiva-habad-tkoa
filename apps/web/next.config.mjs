import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // standalone — для Docker (Linux). Включается через BUILD_STANDALONE=1;
  // на Windows/OneDrive standalone-трейсинг падает на readlink (EINVAL).
  output: process.env.BUILD_STANDALONE ? 'standalone' : undefined,
  transpilePackages: ['@yeshiva/types'],
};

export default withNextIntl(nextConfig);
