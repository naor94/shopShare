import type { Metadata, Viewport } from 'next'
import { Noto_Sans_Hebrew } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'

const notoHebrew = Noto_Sans_Hebrew({
  subsets: ['hebrew', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-noto-hebrew',
})

export const metadata: Metadata = {
  title: 'shopShare - רשימת קניות שיתופית',
  description: 'רשימת קניות שיתופית בזמן אמת לאירועים משפחתיים',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'shopShare' },
  icons: { apple: '/icons/icon-192x192.png', icon: '/icons/icon-192x192.png' },
}

export const viewport: Viewport = {
  themeColor: '#f97316',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className="h-full">
      <head>
        <Script id="polyfills" strategy="beforeInteractive">{String.raw`
          if (typeof Promise.withResolvers === 'undefined') {
            Promise.withResolvers = function() {
              var resolve, reject;
              var p = new Promise(function(res, rej) { resolve = res; reject = rej; });
              return { promise: p, resolve: resolve, reject: reject };
            };
          }
          if (typeof AbortSignal !== 'undefined' && !AbortSignal.timeout) {
            AbortSignal.timeout = function(ms) {
              var c = new AbortController();
              setTimeout(function() { c.abort(new DOMException('TimeoutError','TimeoutError')); }, ms);
              return c.signal;
            };
          }
          if (typeof Array.fromAsync === 'undefined') {
            Array.fromAsync = async function(iter) {
              var r = [];
              for await (var v of iter) r.push(v);
              return r;
            };
          }
        `}</Script>
      </head>
      <body className={`${notoHebrew.variable} font-sans h-full bg-amber-50 text-gray-900`}>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}
