import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'על האש - תכנון BBQ משפחתי',
    short_name: 'על האש',
    description: 'מערכת תכנון אירוע BBQ משפחתי עם רשימת קניות שיתופית בזמן אמת',
    start_url: '/',
    display: 'standalone',
    background_color: '#fff7ed',
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
