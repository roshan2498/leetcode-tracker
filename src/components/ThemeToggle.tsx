"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon, Palette } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Only try to use theme context after component is mounted
  let theme = "dark";
  let toggleTheme = () => {};
  
  try {
    const themeContext = useTheme();
    theme = themeContext.theme;
    toggleTheme = themeContext.toggleTheme;
  } catch (_) {
    // ThemeProvider not available during SSR, use defaults
  }

  // Don't render theme toggle until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="group relative p-3 backdrop-blur-sm bg-white/10 border border-white/20 dark:border-white/10 rounded-xl transition-all duration-300 shadow-lg">
        <div className="relative flex items-center justify-center">
          <Moon className="h-5 w-5 text-slate-700 dark:text-gray-200 transition-all duration-300" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={toggleTheme}
        className="group relative p-3 backdrop-blur-sm bg-white/10 hover:bg-white/20 dark:bg-white/5 dark:hover:bg-white/10 border border-white/20 dark:border-white/10 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      >
        {/* Futuristic glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
        
        {/* Icon container */}
        <div className="relative flex items-center justify-center">
          {theme === "light" ? (
            <div className="relative">
              <Moon className="h-5 w-5 text-slate-700 dark:text-gray-200 transition-all duration-300 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse opacity-60"></div>
            </div>
          ) : (
            <div className="relative">
              <Sun className="h-5 w-5 text-gray-200 transition-all duration-300 group-hover:text-amber-400 group-hover:rotate-90" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse opacity-60"></div>
            </div>
          )}
        </div>

        {/* Tooltip */}
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-black/80 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
          <Palette className="w-3 h-3 inline mr-1" />
          {theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          {/* Tooltip arrow */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-black/80"></div>
        </div>
      </button>
    </div>
  );
}
