"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  type Locale,
  type TranslationSet,
  getTranslations,
  t as translate,
} from "@/lib/i18n/translations";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationSet;
  dir: "rtl" | "ltr";
  isRTL: boolean;
  getNestedTranslation: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

const LOCALE_STORAGE_KEY = "mohaseb-locale";

function getInitialLocale(): Locale {
  if (typeof window === "undefined") {
    return "ar";
  }

  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored === "ar" || stored === "en") {
    return stored;
  }

  return "ar";
}

interface LocaleProviderProps {
  children: ReactNode;
  defaultLocale?: Locale;
}

export function LocaleProvider({ children, defaultLocale }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale ?? "ar");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const initialLocale = defaultLocale ?? getInitialLocale();
    setLocaleState(initialLocale);
    setIsHydrated(true);
  }, [defaultLocale]);

  useEffect(() => {
    if (!isHydrated) return;

    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale, isHydrated]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
  }, []);

  const translations = getTranslations(locale);
  const dir = locale === "ar" ? "rtl" : "ltr";
  const isRTL = locale === "ar";

  const getNestedTranslation = useCallback(
    (key: string) => translate(locale, key),
    [locale]
  );

  const value: LocaleContextValue = {
    locale,
    setLocale,
    t: translations,
    dir,
    isRTL,
    getNestedTranslation,
  };

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

/**
 * Hook to access the current locale and translations.
 *
 * @example
 * ```tsx
 * const { locale, setLocale, t, dir, isRTL } = useLocale();
 *
 * return (
 *   <div dir={dir}>
 *     <h1>{t.common.appName}</h1>
 *     <button onClick={() => setLocale(locale === "ar" ? "en" : "ar")}>
 *       {t.settings.language}
 *     </button>
 *   </div>
 * );
 * ```
 */
export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}
