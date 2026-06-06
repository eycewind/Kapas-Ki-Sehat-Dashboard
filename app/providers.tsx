'use client';

import React from 'react';
import { ThemeProvider } from 'next-themes';

// Theme provider for the dashboard. Dark is the default (this is an ops/
// monitoring surface); enableSystem lets it follow OS preference once chosen.
// attribute="data-theme" matches the selectors in app/theme.css.
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem>
      {children}
    </ThemeProvider>
  );
}
