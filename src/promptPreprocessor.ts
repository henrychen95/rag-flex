import {type Chat, type ChatMessage, type FileHandle, type LLMDynamicHandle, type PredictionProcessStatusController, type PromptPreprocessorController, text,} from "@lmstudio/sdk";
import {dynamicConfig} from "./index";
import {CONFIG_KEYS} from "./config";

type DocumentContextInjectionStrategy = "none" | "inject-full-content" | "retrieval";

export async function preprocess(ctl: PromptPreprocessorController, userMessage: ChatMessage) {
    const userPrompt = userMessage.getText();
    const history = await ctl.pullHistory();
    history.append(userMessage);
    const newFiles = userMessage.getFiles(ctl.client).filter(f => f.type !== "image");
    const files = history.getAllFiles(ctl.client).filter(f => f.type !== "image");

    if (newFiles.length > 0) {
        const strategy = await chooseContextInjectionStrategy(ctl, userPrompt, newFiles);
        if (strategy === "inject-full-content") {
            return await prepareDocumentContextInjection(ctl, userMessage);
        } else if (strategy === "retrieval") {
            return await prepareRetrievalResultsContextInjection(ctl, userPrompt, files);
        }
    } else if (files.length > 0) {
        return await prepareRetrievalResultsContextInjection(ctl, userPrompt, files);
    }

    return userMessage;
}

async function prepareRetrievalResultsContextInjection(
    ctl: PromptPreprocessorController,
    originalUserPrompt: string,
    files: Array<FileHandle>,
): Promise<string> {
    const pluginConfig = ctl.getPluginConfig(dynamicConfig);
    const retrievalLimit = pluginConfig.get(CONFIG_KEYS.LIMIT);
    const retrievalAffinityThreshold = pluginConfig.get(CONFIG_KEYS.THRESHOLD);

    // 讀取在 config.ts 定義的欄位
    const modelPath = pluginConfig.get(CONFIG_KEYS.MODEL_PATH); // 取得下拉選單選中的路徑

    // process files if necessary
    const statusSteps = new Map<FileHandle, PredictionProcessStatusController>();

    const retrievingStatus = ctl.createStatus({
        status: "loading",
        text: `載入 Embedding 模型: ${modelPath}...`,
    });

    try {
        // 嘗試載入模型
        const model = await ctl.client.embedding.model(modelPath, {
            signal: ctl.abortSignal,
        });

        retrievingStatus.setState({
            status: "loading",
            text: `正在為您的問題檢索相關片段...`,
        });

        const result = await ctl.client.files.retrieve(originalUserPrompt, files, {
            embeddingModel: model,
            // Affinity threshold: 0.6 not implemented
            limit: retrievalLimit,
            signal: ctl.abortSignal,
            onFileProcessList(filesToProcess) {
                for (const file of filesToProcess) {
                    statusSteps.set(
                        file,
                        retrievingStatus.addSubStatus({
                            status: "waiting",
                            text: `Process ${file.name} for retrieval`,
                        }),
                    );
                }
            },
            onFileProcessingStart(file) {
                statusSteps
                    .get(file)!
                    .setState({status: "loading", text: `Processing ${file.name} for retrieval`});
            },
            onFileProcessingEnd(file) {
                statusSteps
                    .get(file)!
                    .setState({status: "done", text: `Processed ${file.name} for retrieval`});
            },
            onFileProcessingStepProgress(file, step, progressInStep) {
                const verb = step === "loading" ? "Loading" : step === "chunking" ? "Chunking" : "Embedding";
                statusSteps.get(file)!.setState({
                    status: "loading",
                    text: `${verb} ${file.name} for retrieval (${(progressInStep * 100).toFixed(1)}%)`,
                });
            },
        });

        result.entries = result.entries.filter(entry => entry.score > retrievalAffinityThreshold);
        result.entries = result.entries.filter(entry => entry.score > retrievalAffinityThreshold);

        if (!result) {
            return `系統錯誤：無法取得檢索結果`;
        }

        // inject a retrieval result into the "processed" content
        let processedContent = "";
        const numRetrievals = result.entries.length;
        if (numRetrievals > 0) {
            // retrieval occurred and got results
            // show status
            retrievingStatus.setState({
                status: "done",
                text: `成功檢索到 ${numRetrievals} 個相關片段 (門檻: ${retrievalAffinityThreshold})`,
            });
            ctl.debug("Retrieval results", result);
            // add results to prompt
            const prefix = "以下是從使用者文件中找到的相關參考內容：\n\n";
            processedContent += prefix;
            let citationNumber = 1;
            result.entries.forEach((entry, index) => {
                processedContent += `參考片段 ${index + 1}】:\n"${entry.content}"\n\n`;
                citationNumber++;
            });
            await ctl.addCitations(result);
            const suffix =
                `Use the citations above to respond to the user query, only if they are relevant. ` +
                `Otherwise, respond to the best of your ability without them.` +
                `\n\nUser Query:\n\n${originalUserPrompt}`;
            processedContent += suffix;
        } else {
            // retrieval occured but no relevant citations found
            retrievingStatus.setState({
                status: "canceled",
                text: `找不到任何相關內容 (門檻: ${retrievalAffinityThreshold})`,
            });
            ctl.debug("No relevant citations found for user query");
            const noteAboutNoRetrievalResultsFound =
                `Important: No citations were found in the user files for the user query. ` +
                `In less than one sentence, inform the user of this. ` +
                `Then respond to the query to the best of your ability.`;
            processedContent =
                // noteAboutNoRetrievalResultsFound + `\n\nUser Query:\n\n${originalUserPrompt}`;
                // 改良：不要叫 LLM 承認自己沒看到檔案，這會讓它變笨
                processedContent = `[系統提示: 檢索未發現高相關性片段，請根據文件脈絡盡力回答]\n\n使用者問題：\n\n${originalUserPrompt}`;
        }
        ctl.debug("Processed content", processedContent);

        ctl.debug("最終回傳內容大小", {
            contentLength: processedContent.length,
            entriesCount: result?.entries?.length || 0,
            firstEntry: result?.entries?.[0]?.content?.substring(0, 100)
        });

        return processedContent;
    } catch (error) {
        // 模型載入失敗
        retrievingStatus.setState({
            status: "error",
            text: `❌ 找不到 Embedding 模型: ${modelPath}`,
        });

        return `⚠️ **Embedding 模型未找到**\n\n` +
            `無法載入模型: \`${modelPath}\`\n\n` +
            `請先到 LM Studio 下載此模型:\n` +
            `1. 點擊左側 "🔍 Search" 搜尋模型\n` +
            `2. 搜尋並下載: ${modelPath}\n` +
            `3. 下載完成後重新執行\n\n` +
            `或者在插件設定中選擇其他已下載的 Embedding 模型。\n\n` +
            `原始錯誤: ${error}`;
    }
}

async function prepareDocumentContextInjection(
    ctl: PromptPreprocessorController,
    input: ChatMessage,
): Promise<ChatMessage> {
    const documentInjectionSnippets: Map<FileHandle, string> = new Map();
    const files = input.consumeFiles(ctl.client, file => file.type !== "image");
    for (const file of files) {
        // This should take no time as the result is already in the cache
        const {content} = await ctl.client.files.parseDocument(file, {
            signal: ctl.abortSignal,
        });

        ctl.debug(text`
      Strategy: inject-full-content. Injecting full content of file '${file}' into the
      context. Length: ${content.length}.
    `);
        documentInjectionSnippets.set(file, content);
    }

    // Format the final user prompt
    // TODO:
    //    Make this templatable and configurable
    //      https://github.com/lmstudio-ai/llmster/issues/1017
    let formattedFinalUserPrompt = "";

    if (documentInjectionSnippets.size > 0) {
        formattedFinalUserPrompt +=
            "This is a Enriched Context Generation scenario.\n\nThe following content was found in the files provided by the user.\n";

        for (const [fileHandle, snippet] of documentInjectionSnippets) {
            formattedFinalUserPrompt += `\n\n** ${fileHandle.name} full content **\n\n${snippet}\n\n** end of ${fileHandle.name} **\n\n`;
        }

        formattedFinalUserPrompt += `Based on the content above, please provide a response to the user query.\n\nUser query: ${input.getText()}`;
    }

    input.replaceText(formattedFinalUserPrompt);
    return input;
}

async function measureContextWindow(ctx: Chat, model: LLMDynamicHandle) {
    const currentContextFormatted = await model.applyPromptTemplate(ctx);
    const totalTokensInContext = await model.countTokens(currentContextFormatted);
    const modelContextLength = await model.getContextLength();
    const modelRemainingContextLength = modelContextLength - totalTokensInContext;
    const contextOccupiedPercent = (totalTokensInContext / modelContextLength) * 100;
    return {
        totalTokensInContext,
        modelContextLength,
        modelRemainingContextLength,
        contextOccupiedPercent,
    };
}

async function chooseContextInjectionStrategy(
    ctl: PromptPreprocessorController,
    originalUserPrompt: string,
    files: Array<FileHandle>,
): Promise<DocumentContextInjectionStrategy> {
    // 1. 取得設定值
    const pluginConfig = ctl.getPluginConfig(dynamicConfig);
    const targetContextUsePercent = pluginConfig.get(CONFIG_KEYS.CONTEXT_THRESHOLD);

    const status = ctl.createStatus({
        status: "loading",
        text: `Deciding how to handle the document(s)...`,
    });

    const model = await ctl.client.llm.model();
    const ctx = await ctl.pullHistory();

    // Measure the context window
    const {
        totalTokensInContext,
        modelContextLength,
        modelRemainingContextLength,
        contextOccupiedPercent,
    } = await measureContextWindow(ctx, model);

    ctl.debug(
        `Context measurement result:\n\n` +
        `\tTotal tokens in context: ${totalTokensInContext}\n` +
        `\tModel context length: ${modelContextLength}\n` +
        `\tModel remaining context length: ${modelRemainingContextLength}\n` +
        `\tContext occupied percent: ${contextOccupiedPercent.toFixed(2)}%\n`,
    );

    // Get token count of provided files
    let totalFileTokenCount = 0;
    let totalReadTime = 0;
    let totalTokenizeTime = 0;
    for (const file of files) {
        const startTime = performance.now();

        const loadingStatus = status.addSubStatus({
            status: "loading",
            text: `Loading parser for ${file.name}...`,
        });
        let actionProgressing = "Reading";
        let parserIndicator = "";

        const {content} = await ctl.client.files.parseDocument(file, {
            signal: ctl.abortSignal,
            onParserLoaded: parser => {
                loadingStatus.setState({
                    status: "loading",
                    text: `${parser.library} loaded for ${file.name}...`,
                });
                // Update action names if we're using a parsing framework
                if (parser.library !== "builtIn") {
                    actionProgressing = "Parsing";
                    parserIndicator = ` with ${parser.library}`;
                }
            },
            onProgress: progress => {
                loadingStatus.setState({
                    status: "loading",
                    text: `${actionProgressing} file ${file.name}${parserIndicator}... (${(
                        progress * 100
                    ).toFixed(2)}%)`,
                });
            },
        });
        loadingStatus.remove();

        totalReadTime += performance.now() - startTime;

        // tokenize file content
        const startTokenizeTime = performance.now();
        totalFileTokenCount += await model.countTokens(content);
        totalTokenizeTime += performance.now() - startTokenizeTime;
        if (totalFileTokenCount > modelRemainingContextLength) {
            // Early exit if we already have too many tokens. Helps with performance when there are a lot of files.
            break;
        }
    }
    ctl.debug(`Total file read time: ${totalReadTime.toFixed(2)} ms`);
    ctl.debug(`Total tokenize time: ${totalTokenizeTime.toFixed(2)} ms`);

    // Calculate total token count of files + user prompt
    ctl.debug(`Original User Prompt: ${originalUserPrompt}`);
    const userPromptTokenCount = (await model.tokenize(originalUserPrompt)).length;
    const totalFilePlusPromptTokenCount = totalFileTokenCount + userPromptTokenCount;

    // Calculate the available context tokens
    const contextOccupiedFraction = contextOccupiedPercent / 100;
    // const targetContextUsePercent = 0.7;
    const targetContextUsage = targetContextUsePercent * (1 - contextOccupiedFraction);
    const availableContextTokens = Math.floor(modelRemainingContextLength * targetContextUsage);

    // Debug log
    ctl.debug("Strategy Calculation:");
    ctl.debug(`\tTotal Tokens in All Files: ${totalFileTokenCount}`);
    ctl.debug(`\tTotal Tokens in User Prompt: ${userPromptTokenCount}`);
    ctl.debug(`\tModel Context Remaining: ${modelRemainingContextLength} tokens`);
    ctl.debug(`\tContext Occupied: ${contextOccupiedPercent.toFixed(2)}%`);
    ctl.debug(`\tAvailable Tokens: ${availableContextTokens}\n`);

    if (totalFilePlusPromptTokenCount > availableContextTokens) {
        const chosenStrategy = "retrieval"; // 超過門檻，強制啟動 RAG
        ctl.debug(
            `Chosen context injection strategy: '${chosenStrategy}'. Total file + prompt token count: ` +
            `${totalFilePlusPromptTokenCount} > ${
                targetContextUsage * 100
            }% * available context tokens: ${availableContextTokens}`,
        );
        status.setState({
            status: "done",
            // text: `Chosen context injection strategy: '${chosenStrategy}'. Retrieval is optimal for the size of content provided`,
            text: `檔案預估佔用超過 ${Math.round(targetContextUsePercent * 100)}%，強制啟動 Embedding 檢索 (精確模式)`,
        });
        return chosenStrategy;
    }

    // TODO:
    //
    //   Consider a more sophisticated strategy where we inject some header or summary content
    //   and then perform retrieval on the rest of the content.
    //
    //

    const chosenStrategy = "inject-full-content";
    status.setState({
        status: "done",
        // text: `Chosen context injection strategy: '${chosenStrategy}'. All content can fit into the context`,
        text: `檔案大小在安全範圍內 (${Math.round(targetContextUsePercent * 100)}% 以下)，使用全文注入 (全面模式)`,
    });
    return chosenStrategy;
}
