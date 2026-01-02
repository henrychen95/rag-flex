import {type Chat, type ChatMessage, type FileHandle, type LLMDynamicHandle, type PredictionProcessStatusController, type PromptPreprocessorController, text,} from "@lmstudio/sdk";
import {dynamicConfig} from "./index";
import {CONFIG_KEYS, parseLanguageFromDisplay} from "./config";
import {setLanguage, t} from "./i18n";
import fs from "fs";

type DocumentContextInjectionStrategy = "none" | "inject-full-content" | "retrieval";


// Debug 函數
const debug = (msg: string, data?: any) => {
    const log = `[${new Date().toISOString()}] ${msg}${data ? ' ' + JSON.stringify(data, null, 2) : ''}\n`;
    fs.appendFileSync('D:\\dev\\rag-flex\\logs\\lmstudio-debug.log', log);  // Windows 路徑
};

export async function preprocess(ctl: PromptPreprocessorController, userMessage: ChatMessage) {
    // Read user's language preference from config and set it
    const pluginConfig = ctl.getPluginConfig(dynamicConfig);
    const languageDisplayValue = pluginConfig.get(CONFIG_KEYS.LANGUAGE) as string;
    const userLanguage = parseLanguageFromDisplay(languageDisplayValue);
    setLanguage(userLanguage);

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
    const translations = t();
    const pluginConfig = ctl.getPluginConfig(dynamicConfig);
    const retrievalLimit = pluginConfig.get(CONFIG_KEYS.LIMIT);
    const retrievalAffinityThreshold = pluginConfig.get(CONFIG_KEYS.THRESHOLD);

    // 讀取在 config.ts 定義的欄位
    const modelPath = pluginConfig.get(CONFIG_KEYS.MODEL_PATH); // 取得下拉選單選中的路徑

    // process files if necessary
    const statusSteps = new Map<FileHandle, PredictionProcessStatusController>();

    const retrievingStatus = ctl.createStatus({
        status: "loading",
        text: translations.status.loadingEmbeddingModel(modelPath),
    });

    try {
        // 嘗試載入模型
        const model = await ctl.client.embedding.model(modelPath, {
            signal: ctl.abortSignal,
        });

        retrievingStatus.setState({
            status: "loading",
            text: translations.status.retrievingCitations,
        });

        debug('model path:', model.path);
        debug('model identifer:', model.identifier);
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
                            text: translations.status.processFileForRetrieval(file.name),
                        }),
                    );
                }
            },
            onFileProcessingStart(file) {
                statusSteps
                    .get(file)!
                    .setState({status: "loading", text: translations.status.processingFileForRetrieval(file.name)});
            },
            onFileProcessingEnd(file) {
                statusSteps
                    .get(file)!
                    .setState({status: "done", text: translations.status.processedFileForRetrieval(file.name)});
            },
            onFileProcessingStepProgress(file, step, progressInStep) {
                const verb = step === "loading" ? translations.verbs.loading :
                            step === "chunking" ? translations.verbs.chunking :
                            translations.verbs.embedding;
                statusSteps.get(file)!.setState({
                    status: "loading",
                    text: translations.status.fileProcessProgress(verb, file.name, `${(progressInStep * 100).toFixed(1)}%`),
                });
            },
        });

        result.entries = result.entries.filter(entry => entry.score > retrievalAffinityThreshold);
        result.entries = result.entries.filter(entry => entry.score > retrievalAffinityThreshold);

        if (!result) {
            return translations.errors.retrievalFailed;
        }

        // inject a retrieval result into the "processed" content
        let processedContent = "";
        const numRetrievals = result.entries.length;
        if (numRetrievals > 0) {
            // retrieval occurred and got results
            // show status
            retrievingStatus.setState({
                status: "done",
                text: translations.status.retrievalSuccess(numRetrievals, retrievalAffinityThreshold),
            });
            ctl.debug("Retrieval results", result);
            // add results to prompt
            processedContent += translations.llmPrompts.citationsPrefix;
            result.entries.forEach((entry, index) => {
                processedContent += `${translations.llmPrompts.citationLabel(index + 1)}: "${entry.content}"\n\n`;
            });
            await ctl.addCitations(result);
            processedContent += translations.llmPrompts.citationsSuffix(originalUserPrompt);
        } else {
            // retrieval occured but no relevant citations found
            retrievingStatus.setState({
                status: "canceled",
                text: translations.status.noRelevantContent(retrievalAffinityThreshold),
            });
            ctl.debug("No relevant citations found for user query");
            processedContent = translations.llmPrompts.noRetrievalNote(originalUserPrompt);
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
            text: translations.errors.modelNotFound(modelPath),
        });

        return translations.errors.modelNotFoundDetail(modelPath, error);
    }
}

async function prepareDocumentContextInjection(
    ctl: PromptPreprocessorController,
    input: ChatMessage,
): Promise<ChatMessage> {
    const translations = t();
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
        formattedFinalUserPrompt += translations.llmPrompts.enrichedContextPrefix;

        for (const [fileHandle, snippet] of documentInjectionSnippets) {
            formattedFinalUserPrompt += `\n\n${translations.llmPrompts.fileContentStart(fileHandle.name)}\n\n${snippet}\n\n${translations.llmPrompts.fileContentEnd(fileHandle.name)}\n\n`;
        }

        formattedFinalUserPrompt += translations.llmPrompts.enrichedContextSuffix(input.getText());
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
    const translations = t();

    // 1. 取得設定值
    const pluginConfig = ctl.getPluginConfig(dynamicConfig);
    const targetContextUsePercent = pluginConfig.get(CONFIG_KEYS.CONTEXT_THRESHOLD);

    const status = ctl.createStatus({
        status: "loading",
        text: translations.status.decidingStrategy,
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
            text: translations.status.loadingParser(file.name),
        });
        let actionProgressing = translations.verbs.reading;
        let parserIndicator = "";

        const {content} = await ctl.client.files.parseDocument(file, {
            signal: ctl.abortSignal,
            onParserLoaded: parser => {
                loadingStatus.setState({
                    status: "loading",
                    text: translations.status.parserLoaded(parser.library, file.name),
                });
                // Update action names if we're using a parsing framework
                if (parser.library !== "builtIn") {
                    actionProgressing = translations.verbs.parsing;
                    parserIndicator = ` with ${parser.library}`;
                }
            },
            onProgress: progress => {
                loadingStatus.setState({
                    status: "loading",
                    text: translations.status.fileProcessing(
                        actionProgressing,
                        file.name,
                        parserIndicator,
                        `${(progress * 100).toFixed(2)}%`
                    ),
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
        const chosenStrategy = "retrieval";
        ctl.debug(
            `Chosen context injection strategy: '${chosenStrategy}'. Total file + prompt token count: ` +
            `${totalFilePlusPromptTokenCount} > ${
                targetContextUsage * 100
            }% * available context tokens: ${availableContextTokens}`,
        );
        status.setState({
            status: "done",
            text: translations.status.strategyRetrieval(Math.round(targetContextUsePercent * 100)),
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
        text: translations.status.strategyInjectFull(Math.round(targetContextUsePercent * 100)),
    });
    return chosenStrategy;
}
