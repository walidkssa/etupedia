import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Etupedia - Human Knowledge Encyclopedia',
    short_name: 'Etupedia',
    description: 'Etupedia is a free online encyclopedia and alternative to Wikipedia. Access 6.9M+ articles with AI-powered summaries and local AI assistant.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    icons: [
      {
        src: '/icon_dark.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon_dark.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon_dark.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['education', 'reference', 'productivity', 'books'],
    screenshots: [
      {
        src: '/og-image.png',
        sizes: '1200x630',
        type: 'image/png',
        form_factor: 'wide',
      },
    ],
    shortcuts: [
      {
        name: 'Search Articles',
        short_name: 'Search',
        description: 'Search for articles in Etupedia',
        url: '/',
        icons: [
          {
            src: '/icon_dark.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
    ],
    lang: 'en',
    dir: 'ltr',
    display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
    prefer_related_applications: false,
  }
}
