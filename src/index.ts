import {type PluginContext} from "@lmstudio/sdk";
import {createDynamicConfig} from "./config";
import {preprocess} from "./promptPreprocessor";
import fs from 'fs';

// 導出此變數，讓 promptPreprocessor.ts 找得到它
export let dynamicConfig: any;


// Debug 函數
const debug = (msg: string, data?: any) => {
    const log = `[${new Date().toISOString()}] ${msg}${data ? ' ' + JSON.stringify(data, null, 2) : ''}\n`;
    fs.appendFileSync('D:\\dev\\rag-flex\\logs\\lmstudio-debug.log', log);  // Windows 路徑
};


export async function main(context: PluginContext) {
    // 1. 定義保底顯示的模型清單
    const defaultModels = [
        "nomic-ai/nomic-embed-text-v1.5-GGUF",
        "NathanMad/sentence-transformers_all-MiniLM-L12-v2-gguf",
        "groonga/gte-large-Q4_K_M-GGUF",
        "lm-kit/bge-m3-gguf"
    ];

    let embeddingChoices: string[] = [...defaultModels];

    try {
        // 2. 嘗試偵測本地已下載的模型
        const downloadedModels = await (context as any).client?.system?.listDownloadedModels();

        if (downloadedModels) {
            const detectedModels = downloadedModels
                .filter((model: any) => {
                    const type = (model.type || "").toLowerCase();
                    return type.includes("embedding");
                })
                .map((model: { path: any; }) => model.path)
                .filter(Boolean); // 確保沒有 undefined;

            // 3. 合併並移除重複項，確保預設模型與偵測到的都會出現
            embeddingChoices = Array.from(new Set([...defaultModels, ...detectedModels]));
        } else {
        }
    } catch (error) {
        debug("錯誤:", error);
        debug("錯誤堆疊:", (error as Error).stack);
    }

    // 4. 動態生成配置介面
    dynamicConfig = createDynamicConfig(embeddingChoices);

    context.withConfigSchematics(dynamicConfig);
    context.withPromptPreprocessor(preprocess);
}