"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  if (!mounted) {
    return (
      <div className="w-12 h-6 rounded-full bg-gray-200 dark:bg-gray-700 opacity-0" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="relative flex items-center w-12 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 bg-gray-300 dark:bg-gray-600"
    >
      <span
        className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white dark:bg-gray-800 transform transition-transform ${isDark ? "translate-x-6" : ""}`}
      />
      {isDark ? (
        <Moon className="absolute left-1 w-4 h-4 text-gray-600 dark:text-gray-300" />
      ) : (
        <Sun className="absolute right-1 w-4 h-4 text-yellow-500" />
      )}
    </button>
  );
}
