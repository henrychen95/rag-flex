import {type PluginContext} from "@lmstudio/sdk";
import {createDynamicConfig, CONFIG_KEYS, DEFAULT_EMBEDDING_MODELS} from "./config";
import {preprocess} from "./promptPreprocessor";
import {initLanguage, detectSystemLanguage} from "./i18n";
import fs from 'fs';
import path from 'path';

// 導出此變數，讓 promptPreprocessor.ts 找得到它
export let dynamicConfig: any;
export let pluginContext: PluginContext | null = null;

// Debug 函數 - 支援從配置讀取設定
const debug = (msg: string, data?: any) => {
    try {
        // 檢查是否啟用 debug（優先使用配置，否則使用環境變數）
        let enabled = false;
        let logPath = './logs/lmstudio-debug.log';

        if (pluginContext && dynamicConfig) {
            try {
                const config = (pluginContext as any).getPluginConfig?.(dynamicConfig);
                if (config) {
                    enabled = config[CONFIG_KEYS.ENABLE_DEBUG] ?? false;
                    logPath = config[CONFIG_KEYS.DEBUG_LOG_PATH] ?? logPath;
                }
            } catch {
                // 配置尚未載入，使用環境變數
                enabled = process.env.DEBUG === 'true';
            }
        } else {
            // 配置尚未載入，使用環境變數
            enabled = process.env.DEBUG === 'true';
        }

        if (!enabled) {
            return;
        }

        const log = `[${new Date().toISOString()}] ${msg}${data ? ' ' + JSON.stringify(data, null, 2) : ''}\n`;

        // 確保目錄存在
        const logDir = path.dirname(logPath);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }

        fs.appendFileSync(logPath, log);
    } catch (error) {
        // 靜默失敗，避免 debug 功能干擾主程式
    }
};


export async function main(context: PluginContext) {
    // 儲存 context 供 debug 函數使用
    pluginContext = context;

    // 0. 檢測系統語言
    try {
        // Log system locale information for debugging
        const systemLocale = Intl.DateTimeFormat().resolvedOptions().locale;
        debug("System locale (Intl):", systemLocale);
        debug("Environment LANG:", process.env.LANG || "not set");
        debug("Environment LANGUAGE:", process.env.LANGUAGE || "not set");
        debug("Environment LC_ALL:", process.env.LC_ALL || "not set");
    } catch (e) {
        debug("Failed to get system locale:", e);
    }

    const detectedLanguage = detectSystemLanguage();
    debug("Detected system language:", detectedLanguage);

    // 1. 從預設模型開始，準備合併偵測到的模型
    let embeddingChoices: string[] = [...DEFAULT_EMBEDDING_MODELS];

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
            embeddingChoices = Array.from(new Set([...DEFAULT_EMBEDDING_MODELS, ...detectedModels]));
        } else {
        }
    } catch (error) {
        debug("錯誤:", error);
        debug("錯誤堆疊:", (error as Error).stack);
    }

    // 4. 動態生成配置介面（帶語言參數）
    dynamicConfig = createDynamicConfig(embeddingChoices, detectedLanguage);

    context.withConfigSchematics(dynamicConfig);
    context.withPromptPreprocessor(preprocess);
}