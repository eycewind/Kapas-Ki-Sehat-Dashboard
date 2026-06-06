import './globals.css';
import './theme.css';
import { Providers } from './providers';

export const metadata = {
  title: 'CottonAce Admin Console',
  description: 'Operational Dashboard',
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