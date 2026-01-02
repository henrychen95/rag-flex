/**
 * i18n (Internationalization) Core Module
 * Manages language detection, selection, and translation retrieval
 */

import { translations, type SupportedLanguage, type Translations } from "./locales";

// Current language state
let currentLanguage: SupportedLanguage = "en";

/**
 * Detect system language from environment variables
 *
 * Supports multiple platforms:
 * - Windows: Uses Intl API to detect system locale
 * - Linux/macOS: Checks LANG, LANGUAGE, LC_ALL environment variables
 *
 * @returns Detected language code ("en" or "zh-TW")
 *
 * @example
 * // On a Traditional Chinese Windows system
 * const lang = detectSystemLanguage(); // Returns "zh-TW"
 *
 * @example
 * // On an English Linux system with LANG=en_US.UTF-8
 * const lang = detectSystemLanguage(); // Returns "en"
 */
export function detectSystemLanguage(): SupportedLanguage {
    // Try to detect using Intl API (works on all platforms including Windows)
    try {
        const systemLocale = Intl.DateTimeFormat().resolvedOptions().locale;

        // Traditional Chinese (Taiwan, Hong Kong, Macau)
        if (systemLocale.startsWith("zh-TW") ||
            systemLocale.startsWith("zh-Hant") ||
            systemLocale.startsWith("zh_TW") ||
            systemLocale.startsWith("zh-HK") ||
            systemLocale.startsWith("zh-MO")) {
            return "zh-TW";
        }

        // Simplified Chinese (Mainland China, Singapore)
        // Currently defaults to Traditional Chinese until zh-CN support is added
        if (systemLocale.startsWith("zh-CN") ||
            systemLocale.startsWith("zh-Hans") ||
            systemLocale.startsWith("zh_CN") ||
            systemLocale.startsWith("zh-SG") ||
            systemLocale.startsWith("zh")) {
            return "zh-TW"; // TODO: Add simplified Chinese support
        }
    } catch (e) {
        // Intl API failed, fall back to environment variables
    }

    // Fallback: Check environment variables (for Linux/macOS or Node.js environments)
    const envLang = process.env.LANG || process.env.LANGUAGE || process.env.LC_ALL || "";

    // Traditional Chinese (Taiwan, Hong Kong, Macau)
    if (envLang.includes("zh_TW") || envLang.includes("zh-TW") || envLang.includes("zh_HK")) {
        return "zh-TW";
    }

    // Simplified Chinese (Mainland China, Singapore)
    if (envLang.includes("zh_CN") || envLang.includes("zh-CN") || envLang.includes("zh")) {
        return "zh-TW"; // TODO: Add simplified Chinese support
    }

    // Japanese
    if (envLang.includes("ja") || envLang.includes("jp")) {
        return "ja";
    }

    // Default to English
    return "en";
}

/**
 * Set the current language for the plugin
 *
 * This affects all subsequent calls to the t() function
 *
 * @param lang - Language code to set ("en" or "zh-TW")
 *
 * @example
 * setLanguage("zh-TW"); // Switch to Traditional Chinese
 * const translations = t(); // Now returns Chinese translations
 */
export function setLanguage(lang: SupportedLanguage): void {
    currentLanguage = lang;
}

/**
 * Get the currently active language
 *
 * @returns Current language code
 *
 * @example
 * const current = getLanguage(); // Returns "en" or "zh-TW"
 */
export function getLanguage(): SupportedLanguage {
    return currentLanguage;
}

/**
 * Get translations for the current language
 *
 * This is the primary function used throughout the codebase to access
 * localized strings. It returns the translation object for the currently
 * active language (set via setLanguage()).
 *
 * @returns Translation object with all localized strings for current language
 *
 * @example
 * // After setLanguage("zh-TW")
 * const translations = t();
 * console.log(translations.status.decidingStrategy);
 * // Output: "正在決定如何處理文件..."
 *
 * @example
 * // Using with parameters
 * const translations = t();
 * const msg = translations.status.loadingEmbeddingModel("bge-m3");
 * // Output (if lang is "en"): "Loading embedding model: bge-m3..."
 * // Output (if lang is "zh-TW"): "載入 Embedding 模型: bge-m3..."
 */
export function t(): Translations {
    return translations[currentLanguage];
}

/**
 * Initialize language based on system detection
 *
 * This function should be called once during plugin initialization.
 * It detects the system language and sets it as the current language.
 *
 * @returns The detected and set language code
 *
 * @example
 * // In your main plugin initialization:
 * export async function main(context: PluginContext) {
 *     const detectedLang = initLanguage();
 *     console.log(`Initialized with language: ${detectedLang}`);
 *     // ... rest of initialization
 * }
 */
export function initLanguage(): SupportedLanguage {
    const detected = detectSystemLanguage();
    setLanguage(detected);
    return detected;
}

// Re-export types for convenience
export type { SupportedLanguage, Translations };
