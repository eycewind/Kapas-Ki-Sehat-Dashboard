import './globals.css';
import './theme.css';
import { Providers } from './providers';

export const metadata = {
  title: 'CottonAce Admin Console',
  description: 'Operational Dashboard',
  // Unauthenticated demo dashboard — keep it out of search results.
  // Renders <meta name="robots" content="noindex, nofollow"> (paired with
  // public/robots.txt which disallows all crawlers).
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}