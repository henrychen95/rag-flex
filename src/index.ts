import {type PluginContext} from "@lmstudio/sdk";
import {createDynamicConfig, CONFIG_KEYS, DEFAULT_EMBEDDING_MODELS} from "./config";
import {preprocess} from "./promptPreprocessor";
import {initLanguage, detectSystemLanguage, setLanguage, t} from "./i18n";
import fs from 'fs';
import path from 'path';

// 導出此變數，讓 promptPreprocessor.ts 找得到它
export let dynamicConfig: any;
export let pluginContext: PluginContext | null = null;

// 強制寫入 log（用於初始化階段診斷）
const forceLog = (msg: string, data?: any) => {
    try {
        const logPath = './logs/lmstudio-debug.log';
        const log = `[${new Date().toISOString()}] ${msg}${data ? ' ' + JSON.stringify(data, null, 2) : ''}\n`;
        const logDir = path.dirname(logPath);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        fs.appendFileSync(logPath, log);
    } catch (error) {
        // 靜默失敗
    }
};

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

    // 設定語言以取得翻譯文字
    setLanguage(detectedLanguage);
    const translations = t();

    // 1. 先準備預設模型（僅在偵測失敗時使用）
    let embeddingChoices: string[] = [...DEFAULT_EMBEDDING_MODELS];

    // SDK 限制：PluginContext 沒有 client 屬性，無法在初始化時偵測已下載模型
    // 只能使用預設模型列表，使用者需在 LM Studio 先下載模型
    forceLog("使用預設 embedding 模型列表（SDK 限制：無法在 main() 中存取 client）");
    forceLog("預設模型:", DEFAULT_EMBEDDING_MODELS);

    // 4. 動態生成配置介面（帶語言參數）
    dynamicConfig = createDynamicConfig(embeddingChoices, detectedLanguage);

    context.withConfigSchematics(dynamicConfig);
    context.withPromptPreprocessor(preprocess);
}