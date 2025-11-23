import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Space_Mono, Libre_Baskerville } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/next";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

const libreBaskerville = Libre_Baskerville({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-libre-baskerville",
  display: "swap",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://etupedia.com'),
  title: {
    default: "Etupedia - Free Human Knowledge Encyclopedia | Alternative to Wikipedia",
    template: "%s | Etupedia - Human Knowledge Encyclopedia",
  },
  description: "Etupedia is a free online encyclopedia and alternative to Wikipedia. Access 6.9M+ articles with AI-powered summaries. Better than Wikipedia search with enhanced readability and modern design.",
  keywords: [
    "etupedia",
    "encyclopedia",
    "human knowledge",
    "wikipedia",
    "wikipedia alternative",
    "free encyclopedia",
    "online encyclopedia",
    "wiki articles",
    "wikipedia search",
    "encyclopedia online",
    "knowledge base",
    "education",
    "research",
    "articles",
    "study",
    "learning",
    "academic research",
    "encyclopedia britannica alternative",
    "free knowledge",
    "wiki",
  ],
  authors: [{ name: "Etupedia" }],
  creator: "Etupedia",
  publisher: "Etupedia",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://etupedia.com",
    title: "Etupedia - Free Human Knowledge Encyclopedia | Alternative to Wikipedia",
    description: "Etupedia is a free online encyclopedia and alternative to Wikipedia. Access 6.9M+ articles with AI-powered summaries. Better than Wikipedia search with enhanced readability.",
    siteName: "Etupedia",
    images: [
      {
        url: "https://etupedia.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Etupedia - Free Human Knowledge Encyclopedia Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Etupedia - Free Human Knowledge Encyclopedia | Alternative to Wikipedia",
    description: "Etupedia is a free online encyclopedia and alternative to Wikipedia. Access 6.9M+ articles with AI-powered summaries.",
    creator: "@etupedia",
    images: ["https://etupedia.com/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://etupedia.com",
  },
  verification: {
    google: "google-site-verification-code",
  },
  other: {
    'google-site-verification': 'google-site-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Etupedia',
    description: 'A comprehensive encyclopedia for human knowledge',
    url: 'https://etupedia.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://etupedia.com/search?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Etupedia',
      logo: {
        '@type': 'ImageObject',
        url: 'https://etupedia.com/icon_dark.png',
        width: 512,
        height: 512
      }
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Favicon */}
        <link rel="icon" href="/icon_dark.png" />
        <link rel="apple-touch-icon" href="/icon_dark.png" />
        <link rel="shortcut icon" href="/icon_dark.png" />

        {/* PWA Meta Tags */}
        <meta name="application-name" content="Etupedia" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Etupedia" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(reg => console.log('[PWA] Service Worker registered:', reg.scope))
                    .catch(err => console.error('[PWA] Service Worker registration failed:', err));
                });
              }
            `,
          }}
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${spaceMono.variable} ${libreBaskerville.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
