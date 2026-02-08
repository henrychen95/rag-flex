/**
 * Traditional Chinese translations for RAG-Flex plugin
 * 繁體中文翻譯
 */

import type { Translations } from "./types";

export const zhTW: Translations = {
    config: {
        messageLanguage: {
            displayName: "訊息語言",
            subtitle: "執行時訊息和互動的語言（配置介面使用系統語言）"
        },
        embeddingModel: {
            displayName: "Embedding 模型",
            subtitle: "選擇 Embedding 模型 (必須先下載)"
        },
        customEmbeddingModel: {
            displayName: "自訂 Embedding 模型",
            subtitle: "覆蓋上方選擇。支援：模型名稱（如 text-embedding-bge-m3）、識別碼（如 lm-kit/bge-m3-gguf）或完整路徑。留空則使用上方選擇。"
        },
        contextThreshold: {
            displayName: "Context Usage Threshold (啟動門檻)",
            subtitle: "決定全文貼上或向量檢索 | 預設 0.7 | 數字越小越精確，越大越全面"
        },
        retrievalLimit: {
            displayName: "檢索數量上限",
            subtitle: "觸發檢索時回傳的片段數。BGE-M3 建議設為 5 以上。"
        },
        affinityThreshold: {
            displayName: "相關性門檻",
            subtitle: "相關性門檻 ｜ BGE-M3 建議 0.4-0.6 ｜ 程式碼/SQL 檔案建議設低一點 (如 0.4) 以免找不到內容。"
        },
        enableDebugLogging: {
            displayName: "啟用除錯日誌",
            subtitle: "啟用除錯日誌記錄功能，將執行資訊寫入檔案（僅供開發者使用）"
        },
        debugLogPath: {
            displayName: "除錯日誌路徑",
            subtitle: "除錯日誌檔案路徑（相對或絕對路徑）。預設：./logs/lmstudio-debug.log"
        }
    },

    status: {
        loadingEmbeddingModel: (modelPath) => `載入 Embedding 模型: ${modelPath}...`,
        retrievingCitations: "正在為您的問題檢索相關片段...",
        processFileForRetrieval: (fileName) => `準備處理 ${fileName} 以進行檢索`,
        processingFileForRetrieval: (fileName) => `正在處理 ${fileName} 以進行檢索`,
        processedFileForRetrieval: (fileName) => `已完成處理 ${fileName}`,
        fileProcessProgress: (verb, fileName, progress) => `${verb} ${fileName} (${progress})`,
        retrievalSuccess: (count, threshold) => `成功檢索到 ${count} 個相關片段 (門檻: ${threshold})`,
        noRelevantContent: (threshold) => `找不到任何相關內容 (門檻: ${threshold})`,
        decidingStrategy: "正在決定如何處理文件...",
        loadingParser: (fileName) => `正在載入 ${fileName} 的解析器...`,
        parserLoaded: (library, fileName) => `${library} 已為 ${fileName} 載入完成...`,
        fileProcessing: (action, fileName, indicator, progress) => `${action}檔案 ${fileName}${indicator}... (${progress})`,
        strategyRetrieval: (percent) => `檔案預估佔用超過 ${percent}%，強制啟動 Embedding 檢索 (精確模式)`,
        strategyInjectFull: (percent) => `檔案大小在安全範圍內 (${percent}% 以下)，使用全文注入 (全面模式)`
    },

    errors: {
        retrievalFailed: "系統錯誤：無法取得檢索結果",
        modelNotFound: (modelPath) => `❌ 找不到 Embedding 模型: ${modelPath}`,
        modelNotFoundDetail: (modelPath, error) =>
            `⚠️ **Embedding 模型未找到**\n\n` +
            `無法載入模型: \`${modelPath}\`\n\n` +
            `請先到 LM Studio 下載此模型:\n` +
            `1. 點擊左側 "🔍 Search" 搜尋模型\n` +
            `2. 搜尋並下載: ${modelPath}\n` +
            `3. 下載完成後重新執行\n\n` +
            `或者在插件設定中選擇其他已下載的 Embedding 模型。\n\n` +
            `原始錯誤: ${error}`
    },

    llmPrompts: {
        citationsPrefix: "以下是從使用者文件中找到的相關參考內容：\n\n",
        citationLabel: (index) => `參考片段 ${index}`,
        citationsSuffix: (userPrompt) =>
            `請根據以上參考片段回答使用者的問題（如果相關的話）。` +
            `如果參考片段不相關，請依據你的能力盡力回答。` +
            `\n\n使用者問題：\n\n${userPrompt}`,
        noRetrievalNote: (userPrompt) =>
            `[系統提示: 檢索未發現高相關性片段，請根據文件脈絡盡力回答]\n\n` +
            `使用者問題：\n\n${userPrompt}`,
        enrichedContextPrefix: "這是一個豐富內容生成情境。\n\n以下是從使用者提供的檔案中找到的內容。\n",
        fileContentStart: (fileName) => `** ${fileName} 完整內容 **`,
        fileContentEnd: (fileName) => `** ${fileName} 結束 **`,
        enrichedContextSuffix: (userQuery) => `請根據以上內容回答使用者的問題。\n\n使用者問題：${userQuery}`
    },

    verbs: {
        loading: "載入中",
        chunking: "分塊中",
        embedding: "向量化中",
        reading: "讀取中",
        parsing: "解析中"
    },

    modelStatus: {
        notDownloaded: "未下載"
    }
};
