# RAG-Flex 多國語系實現總結

## 概述

已成功為 RAG-Flex 插件實現完整的多國語系（i18n）支持，目前支持**英文 (English)** 和**繁體中文 (Traditional Chinese)**。

## 實現架構

### 目錄結構

```
src/
├── locales/                    # 語言文件目錄
│   ├── README.md              # 語言文件說明文檔
│   ├── types.ts               # 翻譯類型定義
│   ├── en.ts                  # 英文翻譯
│   ├── zh-TW.ts               # 繁體中文翻譯
│   └── index.ts               # 導出所有語言
├── i18n.ts                    # i18n 核心邏輯
├── config.ts                  # 配置（含語言選擇器）
├── index.ts                   # 插件入口
└── promptPreprocessor.ts      # 處理器（使用翻譯）
```

### 1. 語言文件目錄：`src/locales/`

**包含文件：**
- `types.ts` - TypeScript 類型定義
- `en.ts` - 英文翻譯
- `zh-TW.ts` - 繁體中文翻譯
- `index.ts` - 統一導出
- `README.md` - 添加新語言的指南

**優勢：**
- 清晰的關注點分離
- 易於添加新語言（只需新增一個文件）
- 類型安全且易於維護

### 2. 核心模組：`src/i18n.ts`

**功能：**
- 自動檢測系統語言（從環境變量 `LANG`, `LANGUAGE`, `LC_ALL`）
- 管理當前語言狀態
- 提供語言切換和翻譯獲取 API

**主要 API：**
```typescript
// 檢測並初始化語言
const lang = detectSystemLanguage(); // 返回 "en" 或 "zh-TW"

// 設置當前語言
setLanguage("zh-TW");

// 獲取當前語言
const current = getLanguage();

// 獲取翻譯對象
const translations = t();

// 使用翻譯
translations.status.loadingEmbeddingModel("model-path");
translations.errors.modelNotFound("model-path");
```

**翻譯覆蓋範圍：**
- ✅ 配置界面文本（4 個配置項的 displayName 和 subtitle）
- ✅ 狀態訊息（14 個處理流程狀態）
- ✅ 錯誤訊息（3 個錯誤情境）
- ✅ LLM 系統提示（8 個提示模板）
- ✅ 動作動詞（5 個動作狀態）

---

### 2. 配置模組：`src/config.ts`

**主要變更：**
- 新增 `language` 參數給 `createDynamicConfig()` 函數
- 新增語言選擇器作為第一個配置項（雙語標籤："Language / 語言"）
- 所有配置項的 `displayName` 和 `subtitle` 改用 `t()` 翻譯函數
- 新增 `CONFIG_KEYS.LANGUAGE` 常數

**語言選擇器配置：**
```typescript
.field(
    "language",
    "select",
    {
        displayName: "Language / 語言",
        subtitle: "Select interface language / 選擇介面語言",
        options: [
            {label: "English", value: "en"},
            {label: "繁體中文", value: "zh-TW"}
        ],
    },
    language, // 默認值來自系統檢測
)
```

---

### 3. 入口模組：`src/index.ts`

**主要變更：**
- 在 `main()` 函數開始時調用 `detectSystemLanguage()`
- 將檢測到的語言傳遞給 `createDynamicConfig()`
- 記錄檢測到的語言到 debug log

**語言檢測邏輯：**
1. 從系統環境變量檢測語言（Windows: `LANG`, Linux/Mac: `LANG`, `LC_ALL`）
2. 如果包含 `zh_TW` / `zh-TW` / `zh_HK` → 設為繁體中文
3. 如果包含其他中文標識 → 目前也默認為繁體中文（未來可擴展簡體中文）
4. 其他情況 → 默認英文

---

### 4. 處理器模組：`src/promptPreprocessor.ts`

**主要變更：**
- 在 `preprocess()` 函數開始時從配置讀取用戶選擇的語言並設置
- 所有函數內部使用 `const translations = t()` 獲取翻譯
- 替換所有硬編碼字符串為翻譯函數調用

**語言切換機制：**
```typescript
export async function preprocess(ctl: PromptPreprocessorController, userMessage: ChatMessage) {
    // 1. 從配置讀取用戶選擇的語言
    const pluginConfig = ctl.getPluginConfig(dynamicConfig);
    const userLanguage = pluginConfig.get(CONFIG_KEYS.LANGUAGE) as SupportedLanguage;

    // 2. 設置當前語言（全局狀態）
    setLanguage(userLanguage);

    // 3. 後續所有 t() 調用都會使用此語言
    const translations = t();
    // ...
}
```

---

## 使用方式

### 測試與開發

1. **啟動開發模式：**
   ```bash
   lms dev
   ```

2. **在 LM Studio 中測試：**
   - 打開 LM Studio
   - 進入插件設置
   - 找到 "RAG-Flex" 插件
   - 在第一個配置項選擇語言：
     - `English` - 英文界面
     - `繁體中文` - 繁體中文界面
   - 保存配置後，所有狀態訊息和錯誤提示都會使用選擇的語言

3. **驗證語言切換：**
   - 上傳一個測試文件
   - 觀察處理過程中的狀態訊息語言
   - 嘗試觸發錯誤（例如選擇未下載的模型）
   - 確認錯誤訊息使用正確語言

---

## 技術細節

### 系統語言檢測

**Windows:**
- 檢測環境變量 `LANG` 或 `LANGUAGE`
- 例如：`zh-TW`, `en-US`

**Linux/Mac:**
- 檢測 `LANG`, `LANGUAGE`, `LC_ALL`
- 例如：`zh_TW.UTF-8`, `en_US.UTF-8`

**檢測邏輯 (src/i18n.ts:240-256):**
```typescript
export function detectSystemLanguage(): SupportedLanguage {
    const envLang = process.env.LANG || process.env.LANGUAGE || process.env.LC_ALL || "";

    if (envLang.includes("zh_TW") || envLang.includes("zh-TW") || envLang.includes("zh_HK")) {
        return "zh-TW";
    }
    if (envLang.includes("zh_CN") || envLang.includes("zh-CN") || envLang.includes("zh")) {
        // 如果未來支持簡體中文，在此處理
        return "zh-TW"; // 目前默認為繁體中文
    }

    return "en";
}
```

---

### 翻譯鍵結構

**配置界面 (config):**
```typescript
translations.config.embeddingModel.displayName
translations.config.embeddingModel.subtitle
translations.config.contextThreshold.displayName
translations.config.contextThreshold.subtitle
translations.config.retrievalLimit.displayName
translations.config.retrievalLimit.subtitle
translations.config.affinityThreshold.displayName
translations.config.affinityThreshold.subtitle
```

**狀態訊息 (status):**
```typescript
translations.status.loadingEmbeddingModel(modelPath: string)
translations.status.retrievingCitations
translations.status.processFileForRetrieval(fileName: string)
translations.status.processingFileForRetrieval(fileName: string)
translations.status.processedFileForRetrieval(fileName: string)
translations.status.fileProcessProgress(verb: string, fileName: string, progress: string)
translations.status.retrievalSuccess(count: number, threshold: number)
translations.status.noRelevantContent(threshold: number)
translations.status.decidingStrategy
translations.status.loadingParser(fileName: string)
translations.status.parserLoaded(library: string, fileName: string)
translations.status.fileProcessing(action: string, fileName: string, indicator: string, progress: string)
translations.status.strategyRetrieval(percent: number)
translations.status.strategyInjectFull(percent: number)
```

**錯誤訊息 (errors):**
```typescript
translations.errors.retrievalFailed
translations.errors.modelNotFound(modelPath: string)
translations.errors.modelNotFoundDetail(modelPath: string, error: any)
```

**LLM 提示 (llmPrompts):**
```typescript
translations.llmPrompts.citationsPrefix
translations.llmPrompts.citationLabel(index: number)
translations.llmPrompts.citationsSuffix(userPrompt: string)
translations.llmPrompts.noRetrievalNote(userPrompt: string)
translations.llmPrompts.enrichedContextPrefix
translations.llmPrompts.fileContentStart(fileName: string)
translations.llmPrompts.fileContentEnd(fileName: string)
translations.llmPrompts.enrichedContextSuffix(userQuery: string)
```

**動作動詞 (verbs):**
```typescript
translations.verbs.loading    // "Loading" / "載入中"
translations.verbs.chunking   // "Chunking" / "分塊中"
translations.verbs.embedding  // "Embedding" / "向量化中"
translations.verbs.reading    // "Reading" / "讀取中"
translations.verbs.parsing    // "Parsing" / "解析中"
```

---

## 未來擴展

### 添加新語言（例如簡體中文）

**詳細步驟請參考 `src/locales/README.md`**

簡要流程：

1. **創建翻譯文件 `src/locales/zh-CN.ts`:**
   ```typescript
   import type { Translations } from "./types";

   export const zhCN: Translations = {
       config: { /* 簡體中文配置翻譯 */ },
       status: { /* 狀態訊息翻譯 */ },
       errors: { /* 錯誤訊息翻譯 */ },
       llmPrompts: { /* LLM 提示翻譯 */ },
       verbs: { /* 動詞翻譯 */ }
   };
   ```

2. **更新 `src/locales/types.ts`:**
   ```typescript
   export type SupportedLanguage = "en" | "zh-TW" | "zh-CN";
   ```

3. **更新 `src/locales/index.ts`:**
   ```typescript
   import { zhCN } from "./zh-CN";

   export const translations: Record<SupportedLanguage, Translations> = {
       "en": en,
       "zh-TW": zhTW,
       "zh-CN": zhCN
   };
   ```

4. **更新 `src/config.ts` 語言選擇器:**
   ```typescript
   options: ["en", "zh-TW", "zh-CN"],
   enumTitles: ["English", "繁體中文", "简体中文"]
   ```

5. **更新 `src/i18n.ts` 檢測邏輯:**
   ```typescript
   if (envLang.includes("zh_CN") || envLang.includes("zh-CN")) {
       return "zh-CN";
   }
   ```

### 添加新翻譯鍵

1. **在 `src/locales/types.ts` 的 `Translations` 接口中添加新鍵：**
   ```typescript
   export interface Translations {
       // 現有鍵...

       // 新增區域
       newSection: {
           newKey: string;
           newFunction: (param: string) => string;
       };
   }
   ```

2. **在所有語言文件中實現這些鍵：**

   `src/locales/en.ts`:
   ```typescript
   export const en: Translations = {
       // ... existing translations
       newSection: {
           newKey: "New value",
           newFunction: (param) => `Result: ${param}`
       }
   };
   ```

   `src/locales/zh-TW.ts`:
   ```typescript
   export const zhTW: Translations = {
       // ... existing translations
       newSection: {
           newKey: "新值",
           newFunction: (param) => `結果：${param}`
       }
   };
   ```

3. **使用新的翻譯鍵：**
   ```typescript
   const translations = t();
   console.log(translations.newSection.newKey);
   console.log(translations.newSection.newFunction("test"));
   ```

---

## 文件清單

### 新增文件

**語言文件目錄 (`src/locales/`):**
- ✅ `src/locales/types.ts` - TypeScript 類型定義
- ✅ `src/locales/en.ts` - 英文翻譯
- ✅ `src/locales/zh-TW.ts` - 繁體中文翻譯
- ✅ `src/locales/index.ts` - 統一導出
- ✅ `src/locales/README.md` - 語言文件說明文檔

**核心文件:**
- ✅ `src/i18n.ts` - i18n 核心邏輯（語言檢測、設置、獲取）

### 修改文件
- ✅ `src/index.ts` - 添加語言檢測和初始化
- ✅ `src/config.ts` - 添加語言選擇器和翻譯支持
- ✅ `src/promptPreprocessor.ts` - 所有文本替換為翻譯函數

### 文檔文件
- ✅ `I18N_IMPLEMENTATION.md` - 本文檔（總體實現說明）
- ✅ `src/locales/README.md` - 語言文件維護指南

---

## 驗證清單

### 功能測試
- [x] 系統語言自動檢測
- [x] 配置界面語言選擇器顯示
- [x] 英文 → 繁體中文切換
- [x] 繁體中文 → 英文切換
- [x] 所有狀態訊息正確翻譯
- [x] 所有錯誤訊息正確翻譯
- [x] LLM 系統提示正確翻譯

### 邊界測試
- [ ] 在英文系統上啟動（應默認英文）
- [ ] 在繁體中文系統上啟動（應默認繁體中文）
- [ ] 在簡體中文系統上啟動（應默認繁體中文，未來可改）
- [ ] 切換語言後重新載入插件
- [ ] 同時處理多個文件時的語言一致性

---

## 問題排查

### 如果語言沒有正確切換

1. **檢查配置是否保存：**
   - 確保在 LM Studio 中點擊了保存按鈕
   - 重新載入插件

2. **檢查 debug log：**
   ```bash
   cat D:\dev\rag-flex\logs\lmstudio-debug.log
   ```
   查找 "Detected system language" 日誌

3. **手動設置語言：**
   在插件設置中明確選擇語言，而不是依賴自動檢測

### TypeScript 編譯錯誤

如果遇到類型錯誤，確保：
1. `SupportedLanguage` 類型正確導入
2. 所有翻譯鍵都已實現
3. 函數簽名匹配（參數和返回值類型）

---

## 貢獻指南

### 翻譯質量
- 保持專業術語一致性
- 考慮技術用戶的理解
- 繁體中文避免使用簡體字
- 英文使用美式英語拼寫

### 添加新文本
1. 先在 `src/i18n.ts` 中定義接口
2. 為所有支持的語言提供翻譯
3. 在需要的地方調用 `t()` 函數
4. 更新此文檔

---

## 許可證

本實現遵循 RAG-Flex 項目的 MIT 許可證。

---

## 作者

- 多語言系統實現：Claude Code (Anthropic)
- RAG-Flex 原始作者：Henry Chen

---

## 版本歷史

- **v1.1.0** (2026-01-02) - 初始多語言支持（英文 + 繁體中文）
