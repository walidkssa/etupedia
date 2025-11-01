"use client";

import { useState, useEffect, useCallback } from "react";
import { detectBrowserLanguage } from "@/lib/wikipedia-languages";

const STORAGE_KEY = "etupedia-language";

/**
 * Hook to manage global language state
 * Syncs with localStorage and provides language state across the app
 */
export function useLanguage() {
  const [currentLanguage, setCurrentLanguage] = useState<string>("en");
  const [mounted, setMounted] = useState(false);

  // Load language from localStorage on mount
  useEffect(() => {
    setMounted(true);
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setCurrentLanguage(stored);
    } else {
      // Detect browser language on first visit
      const detected = detectBrowserLanguage();
      setCurrentLanguage(detected);
      localStorage.setItem(STORAGE_KEY, detected);
    }
  }, []);

  // Change language
  const changeLanguage = useCallback((newLang: string) => {
    setCurrentLanguage(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);
    
    // Dispatch custom event so other components can react
    window.dispatchEvent(new CustomEvent("languagechange", { detail: newLang }));
  }, []);

  return {
    currentLanguage,
    changeLanguage,
    mounted,
  };
}
