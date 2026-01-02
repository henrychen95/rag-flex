# Locales Directory

**[繁體中文](./README.zh-TW.md) | [日本語](./README.ja.md)**

This directory contains all translation files for the RAG-Flex plugin.

## Directory Structure

```
src/locales/
├── README.md          # This file (English)
├── README.zh-TW.md    # Traditional Chinese documentation
├── README.ja.md       # Japanese documentation
├── types.ts           # TypeScript type definitions for translations
├── en.ts              # English translations
├── zh-TW.ts           # Traditional Chinese translations
├── ja.ts              # Japanese translations
└── index.ts           # Exports all translations and types
```

## File Descriptions

### `types.ts`
Defines the TypeScript interfaces for all translatable content:
- `SupportedLanguage`: Union type of all supported language codes
- `Translations`: Interface defining the structure of translation objects

### `en.ts`
Contains all English translations. Export name: `en`

### `zh-TW.ts`
Contains all Traditional Chinese translations. Export name: `zhTW`

### `ja.ts`
Contains all Japanese translations. Export name: `ja`

### `index.ts`
Central export point that:
- Imports all language modules
- Creates the `translations` object mapping language codes to translation objects
- Re-exports types for convenience

## Adding a New Language

To add support for a new language (e.g., Japanese):

### 1. Create the translation file

Create `src/locales/ja.ts`:

```typescript
/**
 * Japanese translations for RAG-Flex plugin
 */

import type { Translations } from "./types";

export const ja: Translations = {
    config: {
        embeddingModel: {
            displayName: "埋め込みモデル",
            subtitle: "埋め込みモデルを選択（事前にダウンロード必要）"
        },
        // ... rest of translations
    },
    // ... implement all sections
};
```

### 2. Update `types.ts`

Add the new language code to `SupportedLanguage`:

```typescript
export type SupportedLanguage = "en" | "zh-TW" | "ja";
```

### 3. Update `index.ts`

Import and add the new language to the translations object:

```typescript
import { ja } from "./ja";

export const translations: Record<SupportedLanguage, Translations> = {
    "en": en,
    "zh-TW": zhTW,
    "ja": ja
};
```

### 4. Update language detection (optional)

If you want automatic language detection for the new language, update `src/i18n.ts`:

```typescript
export function detectSystemLanguage(): SupportedLanguage {
    const envLang = process.env.LANG || process.env.LANGUAGE || process.env.LC_ALL || "";

    // ... existing checks ...

    // Japanese
    if (envLang.includes("ja") || envLang.includes("jp")) {
        return "ja";
    }

    return "en";
}
```

### 5. Update the language selector

In `src/config.ts`, add the new option:

```typescript
.field(
    "language",
    "select",
    {
        displayName: "Language / 語言 / 言語",
        subtitle: "Select interface language / 選擇介面語言 / インターフェース言語を選択",
        options: ["en", "zh-TW", "ja"],
        enumTitles: ["English", "繁體中文", "日本語"],
    },
    language,
)
```

## Translation Guidelines

### 1. Consistency
- Use consistent terminology across all strings
- Keep technical terms in English when appropriate (e.g., "Embedding", "RAG")
- Match the tone and style of existing translations

### 2. Context
- Consider the UI context where text will appear
- Keep strings concise for UI elements (displayName, subtitle)
- Provide detailed information for error messages

### 3. Parameterized Strings
Many translation strings accept parameters:

```typescript
// Function signature in types.ts
loadingEmbeddingModel: (modelPath: string) => string;

// Implementation in language file
loadingEmbeddingModel: (modelPath) => `Loading model: ${modelPath}...`,
```

Make sure to:
- Use all provided parameters
- Place parameters naturally in the sentence
- Maintain proper grammar and word order for the target language

### 4. Special Characters
- Use proper quotation marks for the language (e.g., 「」 for Japanese, 「」or 『』 for Traditional Chinese)
- Include appropriate punctuation
- Escape special characters in template literals when needed

## Testing Translations

After adding or modifying translations:

1. **Type Checking**: Ensure TypeScript compilation succeeds
   ```bash
   lms dev
   ```

2. **Visual Testing**:
   - Start the plugin in LM Studio
   - Switch to your language in settings
   - Test all features and verify text displays correctly

3. **Functional Testing**:
   - Upload files and check status messages
   - Trigger errors and verify error messages
   - Test with different file sizes to see all code paths

## Translation Coverage

Current translation coverage (per language file):

- **Config UI**: 7 settings × 2 fields = 14 strings
- **Status Messages**: 14 functions/strings
- **Error Messages**: 3 functions
- **LLM Prompts**: 8 functions
- **Verbs**: 5 strings

**Total per language**: ~44 translatable items

## Best Practices

1. **Don't hardcode strings**: Always add new user-facing text to translation files
2. **Use type safety**: Let TypeScript catch missing translations
3. **Test in context**: Verify translations in the actual UI, not just in code
4. **Cultural adaptation**: Adapt content to cultural norms, not just literal translation
5. **Keep in sync**: When updating one language, update all others

## Questions?

If you have questions about the translation system, refer to:
- [I18N.md](../../docs/I18N.md) - Internationalization system guide (also in [繁體中文](../../docs/I18N.zh-TW.md) and [日本語](../../docs/I18N.ja.md))
- [I18N_IMPLEMENTATION.md](../../docs/I18N_IMPLEMENTATION.md) - Technical implementation details
- `src/i18n.ts` - Core internationalization logic
- `types.ts` - TypeScript types for structure reference
