import {createConfigSchematics} from "@lmstudio/sdk";
import {setLanguage, t, type SupportedLanguage} from "./i18n";

/**
 * Language code to display text mapping
 * Centralized configuration for language options
 */
const LANGUAGE_OPTIONS: Record<SupportedLanguage, string> = {
    "en": "English (en)",
    "zh-TW": "繁體中文 (zh-TW)",
    "ja": "日本語 (ja)"
};

/**
 * Default embedding models
 * Ordered by speed (fast to slow)
 */
export const DEFAULT_EMBEDDING_MODELS = [
    "nomic-ai/nomic-embed-text-v1.5-GGUF",           // Built-in, fast, English
    "NathanMad/sentence-transformers_all-MiniLM-L12-v2-gguf",  // Lightweight
    "groonga/gte-large-Q4_K_M-GGUF",                 // Balanced
    "lm-kit/bge-m3-gguf"                             // Multilingual, Chinese support
];

/**
 * Get display text for a language code
 */
export function getLanguageDisplayText(langCode: SupportedLanguage): string {
    return LANGUAGE_OPTIONS[langCode];
}

/**
 * Get all language options as an array
 */
export function getLanguageOptions(): string[] {
    return Object.values(LANGUAGE_OPTIONS);
}

/**
 * Map display text to language code
 * Handles the conversion from user-friendly display text to internal language codes
 */
export function parseLanguageFromDisplay(displayValue: string): SupportedLanguage {
    // Find the language code by matching display text
    for (const [code, display] of Object.entries(LANGUAGE_OPTIONS)) {
        if (displayValue === display) {
            return code as SupportedLanguage;
        }
    }

    // Legacy fallback: parse from parentheses (e.g., "English (en)" -> "en")
    const match = displayValue.match(/\(([^)]+)\)/);
    if (match) {
        const code = match[1] as SupportedLanguage;
        if (code in LANGUAGE_OPTIONS) {
            return code;
        }
    }

    // Fallback to English if parsing fails
    return "en";
}

export const createDynamicConfig = (modelChoices: string[], systemLanguage: SupportedLanguage) => {
    // Use system language for config UI
    setLanguage(systemLanguage);
    const translations = t();

    const safeChoices = (Array.isArray(modelChoices) && modelChoices.length > 0)
        ? modelChoices
        : DEFAULT_EMBEDDING_MODELS;

    return createConfigSchematics()
        .field(
            "language",
            "select",
            {
                displayName: translations.config.messageLanguage.displayName,
                subtitle: translations.config.messageLanguage.subtitle,
                options: getLanguageOptions(),
            },
            getLanguageDisplayText(systemLanguage),
        )
        .field(
            "embeddingModelPath",
            "select",
            {
                displayName: translations.config.embeddingModel.displayName,
                subtitle: translations.config.embeddingModel.subtitle,
                options: safeChoices,
            },
            safeChoices[0],
        )
        .field(
            "contextUsageThreshold",
            "numeric",
            {
                min: 0.1,
                max: 1.0,
                displayName: translations.config.contextThreshold.displayName,
                subtitle: translations.config.contextThreshold.subtitle,
                slider: {min: 0.1, max: 1.0, step: 0.05},
            },
            0.7,
        )
        .field(
            "retrievalLimit",
            "numeric",
            {
                int: true,
                min: 1,
                displayName: translations.config.retrievalLimit.displayName,
                subtitle: translations.config.retrievalLimit.subtitle,
                slider: {min: 1, max: 15, step: 1},
            },
            5,
        )
        .field(
            "retrievalAffinityThreshold",
            "numeric",
            {
                min: 0.0,
                max: 1.0,
                displayName: translations.config.affinityThreshold.displayName,
                subtitle: translations.config.affinityThreshold.subtitle,
                slider: {min: 0.0, max: 1.0, step: 0.01},
            },
            0.4,
        )
        .field(
            "enableDebugLogging",
            "boolean",
            {
                displayName: translations.config.enableDebugLogging.displayName,
                subtitle: translations.config.enableDebugLogging.subtitle,
            },
            false,
        )
        .field(
            "debugLogPath",
            "string",
            {
                displayName: translations.config.debugLogPath.displayName,
                subtitle: translations.config.debugLogPath.subtitle,
            },
            "./logs/lmstudio-debug.log",
        )
        .build();
};

export const CONFIG_KEYS = {
    LANGUAGE: "language",
    MODEL_PATH: "embeddingModelPath",
    CONTEXT_THRESHOLD: "contextUsageThreshold",
    LIMIT: "retrievalLimit",
    THRESHOLD: "retrievalAffinityThreshold",
    ENABLE_DEBUG: "enableDebugLogging",
    DEBUG_LOG_PATH: "debugLogPath",
} as const;