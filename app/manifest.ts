import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Etupedia - Academic Knowledge Encyclopedia',
    short_name: 'Etupedia',
    description: 'A comprehensive encyclopedia for academic and university knowledge. Search 6.9M+ Wikipedia articles with AI-powered summaries.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon_light.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icon_dark.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    categories: ['education', 'reference', 'productivity'],
    lang: 'en',
    dir: 'ltr',
  }
}
