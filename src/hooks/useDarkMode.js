import { useState, useEffect } from 'react';

/**
 * Custom hook for unified dark mode state management across all pages.
 */
export function useDarkMode() {
  const [darkmode, setDarkmode] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored) {
        return stored === 'dark';
      }
      return document.body.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    if (darkmode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkmode]);

  const toggleDarkMode = () => {
    setDarkmode((prev) => !prev);
  };

  return [darkmode, toggleDarkMode];
}
