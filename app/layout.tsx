import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

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

export const metadata: Metadata = {
  metadataBase: new URL('https://etupedia.com'),
  title: {
    default: "Etupedia - Human Knowledge Encyclopedia",
    template: "%s | Etupedia",
  },
  description: "A comprehensive encyclopedia for human knowledge. Search 6.9M+ Wikipedia articles with AI-powered summaries.",
  keywords: ["encyclopedia", "human", "knowledge", "wikipedia", "education", "research", "articles", "study", "learning", "university", "college"],
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
    title: "Etupedia - Human Knowledge Encyclopedia",
    description: "A comprehensive encyclopedia for human knowledge. Search 6.9M+ Wikipedia articles with AI-powered summaries.",
    siteName: "Etupedia",
    images: [
      {
        url: "/icon_light.png",
        width: 512,
        height: 512,
        alt: "Etupedia Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Etupedia - Human Knowledge Encyclopedia",
    description: "A comprehensive encyclopedia for human knowledge. Search 6.9M+ Wikipedia articles with AI-powered summaries.",
    creator: "@etupedia",
    images: ["/icon_light.png"],
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
        url: 'https://etupedia.com/icon_light.png',
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
        {/* Favicon with theme support */}
        <link rel="icon" href="/icon_light.png" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/icon_dark.png" media="(prefers-color-scheme: dark)" />
        <link rel="icon" href="/icon_dark.png" />
        <link rel="apple-touch-icon" href="/icon_light.png" media="(prefers-color-scheme: light)" />
        <link rel="apple-touch-icon" href="/icon_dark.png" media="(prefers-color-scheme: dark)" />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${spaceMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
