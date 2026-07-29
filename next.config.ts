import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Nothing is gained by advertising the framework in a response header.
  poweredByHeader: false,
};

/**
 * `next-intl` needs to know where `getRequestConfig` lives. The path is passed explicitly rather than
 * left to the plugin's convention scan: a scan that silently finds nothing surfaces later as a
 * "no locale was returned" error at request time, a long way from its cause.
 */
export default createNextIntlPlugin('./src/i18n/request.ts')(nextConfig);
