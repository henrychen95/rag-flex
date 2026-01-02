# Locales 目錄

**[English](./README.md) | [日本語](./README.ja.md)**

本目錄包含 RAG-Flex 插件的所有翻譯文件。

## 目錄結構

```
src/locales/
├── README.md          # 英文說明文件
├── README.zh-TW.md    # 本文件（繁體中文說明）
├── README.ja.md       # 日文說明文件
├── types.ts           # 翻譯的 TypeScript 類型定義
├── en.ts              # 英文翻譯
├── zh-TW.ts           # 繁體中文翻譯
├── ja.ts              # 日文翻譯
└── index.ts           # 導出所有翻譯和類型
```

## 文件說明

### `types.ts`
定義所有可翻譯內容的 TypeScript 介面：
- `SupportedLanguage`：所有支持語言代碼的聯合類型
- `Translations`：定義翻譯對象結構的介面

### `en.ts`
包含所有英文翻譯。導出名稱：`en`

### `zh-TW.ts`
包含所有繁體中文翻譯。導出名稱：`zhTW`

### `ja.ts`
包含所有日文翻譯。導出名稱：`ja`

### `index.ts`
中央導出點，負責：
- 導入所有語言模組
- 創建將語言代碼映射到翻譯對象的 `translations` 對象
- 重新導出類型以方便使用

## 添加新語言

以添加日文為例：

### 1. 創建翻譯文件

創建 `src/locales/ja.ts`：

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
        // ... 其餘翻譯
    },
    // ... 實現所有區塊
};
```

### 2. 更新 `types.ts`

在 `SupportedLanguage` 中添加新的語言代碼：

```typescript
export type SupportedLanguage = "en" | "zh-TW" | "ja";
```

### 3. 更新 `index.ts`

導入並將新語言添加到 translations 對象：

```typescript
import { ja } from "./ja";

export const translations: Record<SupportedLanguage, Translations> = {
    "en": en,
    "zh-TW": zhTW,
    "ja": ja
};
```

### 4. 更新語言檢測（可選）

如果希望為新語言添加自動檢測功能，更新 `src/i18n.ts`：

```typescript
export function detectSystemLanguage(): SupportedLanguage {
    const envLang = process.env.LANG || process.env.LANGUAGE || process.env.LC_ALL || "";

    // ... 現有檢查 ...

    // Japanese
    if (envLang.includes("ja") || envLang.includes("jp")) {
        return "ja";
    }

    return "en";
}
```

### 5. 更新語言選擇器

在 `src/config.ts` 中添加新選項：

```typescript
.field(
    "language",
    "select",
    {
        displayName: "Language / 語言 / 言語",
        subtitle: "Select interface language / 選擇介面語言 / インターフェース言語を選択",
        options: [
            "English (en)",
            "繁體中文 (zh-TW)",
            "日本語 (ja)"
        ],
    },
    // ... 默認值
)
```

### 6. 更新解析函數

在 `src/config.ts` 的 `parseLanguageFromDisplay` 函數中添加新語言：

```typescript
export function parseLanguageFromDisplay(displayValue: string): SupportedLanguage {
    if (displayValue.includes("(en)")) return "en";
    if (displayValue.includes("(zh-TW)")) return "zh-TW";
    if (displayValue.includes("(ja)")) return "ja";
    return "en";
}
```

## 翻譯指南

### 1. 一致性
- 在所有字符串中使用一致的術語
- 適當時保留英文技術術語（例如 "Embedding"、"RAG"）
- 匹配現有翻譯的語氣和風格

### 2. 上下文
- 考慮文本將出現的 UI 上下文
- UI 元素（displayName、subtitle）保持簡潔
- 為錯誤訊息提供詳細信息

### 3. 參數化字符串
許多翻譯字符串接受參數：

```typescript
// types.ts 中的函數簽名
loadingEmbeddingModel: (modelPath: string) => string;

// 語言文件中的實現
loadingEmbeddingModel: (modelPath) => `Loading model: ${modelPath}...`,
```

確保：
- 使用所有提供的參數
- 將參數自然地放置在句子中
- 保持目標語言的正確語法和詞序

### 4. 特殊字符
- 使用該語言的正確引號（例如日文用「」、繁體中文用「」或『』）
- 包含適當的標點符號
- 必要時在模板字面量中轉義特殊字符

## 測試翻譯

添加或修改翻譯後：

1. **類型檢查**：確保 TypeScript 編譯成功
   ```bash
   lms dev
   ```

2. **視覺測試**：
   - 在 LM Studio 中啟動插件
   - 在設置中切換到你的語言
   - 測試所有功能並驗證文本正確顯示

3. **功能測試**：
   - 上傳文件並檢查狀態訊息
   - 觸發錯誤並驗證錯誤訊息
   - 使用不同大小的文件測試所有代碼路徑

## 翻譯覆蓋範圍

每個語言文件的當前翻譯覆蓋範圍：

- **配置界面**：7 個設置 × 2 個欄位 = 14 個字符串
- **狀態訊息**：14 個函數/字符串
- **錯誤訊息**：3 個函數
- **LLM 提示**：8 個函數
- **動詞**：5 個字符串

**每個語言總計**：約 44 個可翻譯項目

## 最佳實踐

1. **不要硬編碼字符串**：始終將新的用戶可見文本添加到翻譯文件
2. **使用類型安全**：讓 TypeScript 捕獲缺失的翻譯
3. **在上下文中測試**：在實際 UI 中驗證翻譯，而不僅僅是在代碼中
4. **文化適應**：根據文化規範調整內容，而不僅僅是字面翻譯
5. **保持同步**：更新一種語言時，同時更新所有其他語言

## 繁體中文翻譯注意事項

### 專有名詞處理
- **保留原文**：Embedding、RAG、Token、LLM 等技術術語保持英文
- **中英混合**：如 "Embedding 模型"、"RAG 檢索"
- **完全中文化**：一般用語使用繁體中文

### 語氣風格
- **正式但友善**：使用「您」而非「你」（配置界面）
- **簡潔明確**：狀態訊息保持簡短清晰
- **專業準確**：技術術語翻譯一致

### 標點符號
- 使用全形標點：，、。！？
- 引號使用：「」（外層）和『』（內層）
- 括號使用：（）而非 ()

### 常見術語對照

| 英文 | 繁體中文 |
|------|---------|
| Embedding Model | Embedding 模型 |
| Retrieval | 檢索 |
| Context | 上下文 / 內容 |
| Threshold | 門檻 |
| Loading | 載入中 |
| Processing | 處理中 |
| Citation | 參考片段 / 引用 |
| Chunk | 片段 / 分塊 |
| Similarity | 相關性 / 相似度 |

## 疑問？

如果您對翻譯系統有疑問，請參考：
- [I18N.zh-TW.md](../../docs/I18N.zh-TW.md) - 國際化系統指南（另有 [English](../../docs/I18N.md) 和 [日本語](../../docs/I18N.ja.md) 版本）
- [I18N_IMPLEMENTATION.md](../../docs/I18N_IMPLEMENTATION.md) - 技術實現細節
- `src/i18n.ts` - 核心國際化邏輯
- `types.ts` - TypeScript 類型結構參考

## 貢獻翻譯

歡迎提交翻譯改進！提交時請確保：
1. 所有翻譯項目都已完成
2. TypeScript 編譯無錯誤
3. 在 LM Studio 中實際測試過
4. 遵循上述翻譯指南和最佳實踐
5. 提供清晰的變更說明

感謝您的貢獻！🎉
