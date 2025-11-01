/**
 * Wikipedia Language Configuration
 * Top 50+ most popular Wikipedia languages
 */

export interface WikipediaLanguage {
  code: string;
  name: string;
  nativeName: string;
  dir?: 'rtl' | 'ltr';
}

export const WIKIPEDIA_LANGUAGES: WikipediaLanguage[] = [
  // Top 10 - Most articles
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  
  // 11-20
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', dir: 'rtl' },
  { code: 'ca', name: 'Catalan', nativeName: 'Català' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
  
  // 21-30
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', dir: 'rtl' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina' },
  
  // 31-40
  { code: 'hy', name: 'Armenian', nativeName: 'Հայերեն' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  
  // 41-50
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', dir: 'rtl' },
  { code: 'kk', name: 'Kazakh', nativeName: 'Қазақша' },
  { code: 'eo', name: 'Esperanto', nativeName: 'Esperanto' },
  { code: 'la', name: 'Latin', nativeName: 'Latina' },
  { code: 'simple', name: 'Simple English', nativeName: 'Simple English' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans' },
  { code: 'sq', name: 'Albanian', nativeName: 'Shqip' },
  { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycanca' },
  { code: 'be', name: 'Belarusian', nativeName: 'Беларуская' },
];

/**
 * Get language by code
 */
export function getLanguageByCode(code: string): WikipediaLanguage | undefined {
  return WIKIPEDIA_LANGUAGES.find(lang => lang.code === code);
}

/**
 * Get language name (native or English)
 */
export function getLanguageName(code: string, useNative: boolean = true): string {
  const lang = getLanguageByCode(code);
  if (!lang) return code;
  return useNative ? lang.nativeName : lang.name;
}

/**
 * Detect browser language and match to Wikipedia language
 */
export function detectBrowserLanguage(): string {
  if (typeof window === 'undefined') return 'en';
  
  const browserLang = navigator.language.split('-')[0].toLowerCase();
  const hasLanguage = WIKIPEDIA_LANGUAGES.some(lang => lang.code === browserLang);
  
  return hasLanguage ? browserLang : 'en';
}
