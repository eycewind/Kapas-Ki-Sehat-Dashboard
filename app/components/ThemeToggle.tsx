'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

// Small dark/light toggle for the header. Guards on `mounted` so the icon is
// only rendered after hydration — next-themes resolves the active theme client
// side, and rendering it during SSR would cause a hydration mismatch / flash.
export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Reserve the same footprint pre-mount to avoid a layout shift.
  if (!mounted) return <div className="w-9 h-9" aria-hidden />;

  const isDark = resolvedTheme === 'dark';
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      className="flex items-center justify-center w-9 h-9 rounded-md border border-border bg-surface text-fg-secondary hover:text-fg hover:border-fg-faint transition-colors"
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
