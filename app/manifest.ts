import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Etupedia - Human Knowledge Encyclopedia',
    short_name: 'Etupedia',
    description: 'Etupedia is a free online encyclopedia and alternative to Wikipedia. Access 6.9M+ articles with AI-powered summaries.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon_dark.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    categories: ['education', 'reference', 'productivity'],
    lang: 'en',
    dir: 'ltr',
  }
}
