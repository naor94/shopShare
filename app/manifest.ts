import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'shopShare - רשימת קניות שיתופית',
    short_name: 'shopShare',
    description: 'רשימת קניות שיתופית בזמן אמת לאירועים משפחתיים',
    start_url: '/',
    display: 'standalone',
    background_color: '#fffbeb',
    theme_color: '#f97316',
    orientation: 'portrait-primary',
    lang: 'he',
    dir: 'rtl',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    screenshots: [],
  }
}
