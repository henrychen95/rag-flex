/**
 * Locales index - exports all language translations
 */

import { en } from "./en";
import { zhTW } from "./zh-TW";
import { ja } from "./ja";
import type { Translations, SupportedLanguage } from "./types";

/**
 * All available translations
 * Add new languages here when expanding support
 */
export const translations: Record<SupportedLanguage, Translations> = {
    "en": en,
    "zh-TW": zhTW,
    "ja": ja
};

// Re-export types for convenience
export type { Translations, SupportedLanguage };
