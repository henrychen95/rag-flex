import {createConfigSchematics} from "@lmstudio/sdk";

export const createDynamicConfig = (modelChoices: string[]) => {
    const safeChoices = (Array.isArray(modelChoices) && modelChoices.length > 0)
        ? modelChoices
        : ["nomic-ai/nomic-embed-text-v1.5-GGUF",
            "NathanMad/sentence-transformers_all-MiniLM-L12-v2-gguf",
            "groonga/gte-large-Q4_K_M-GGUF",
            "lm-kit/bge-m3-gguf"];

    return createConfigSchematics()
        .field(
            "embeddingModelPath",
            "select",
            {
                displayName: "Embedding Model",
                subtitle: "選擇 Embedding 模型 (必須先下載)",
                options: safeChoices, // 使用 options 屬性
            },
            safeChoices[0],
        )
        .field(
            "contextUsageThreshold",
            "numeric",
            {
                min: 0.1,
                max: 1.0,
                displayName: "Context Usage Threshold (啟動門檻)",
                subtitle: "決定全文貼上或向量檢索 | 預設 0.7 | 數字越小越精確，越大越全面",
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
                displayName: "Retrieval Limit",
                subtitle: "觸發檢索時回傳的片段數。BGE-M3 建議設為 5 以上。",
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
                displayName: "Retrieval Affinity Threshold",
                subtitle: "相關性門檻 ｜ BGE-M3 建議 0.4-0.6 ｜ 程式碼/SQL 檔案建議設低一點 (如 0.4) 以免找不到內容。",
                slider: {min: 0.0, max: 1.0, step: 0.01},
            },
            0.4,
        )
        .build();
};

export const CONFIG_KEYS = {
    MODEL_PATH: "embeddingModelPath",
    CONTEXT_THRESHOLD: "contextUsageThreshold", // 新增的 Key
    LIMIT: "retrievalLimit",
    THRESHOLD: "retrievalAffinityThreshold",
} as const;