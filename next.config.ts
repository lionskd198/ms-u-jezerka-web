import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  // Nezveřejňovat hlavičku "X-Powered-By: Next.js" — útočníkovi zbytečně
  // neprozrazujeme, na čem web běží.
  poweredByHeader: false,

  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },

  /**
   * Bezpečnostní HTTP hlavičky — posílají se s každou odpovědí.
   * Prohlížeč podle nich zpřísní chování stránky.
   */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Web nejde vložit do <iframe> na cizí stránce (clickjacking)
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Prohlížeč nesmí "hádat" typ souboru (MIME sniffing)
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Cizím webům se neposílá celá URL, ze které návštěvník přišel
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Zakážeme funkce prohlížeče, které web nepotřebuje
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },

  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
