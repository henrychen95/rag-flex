/**
 * Translation types for RAG-Flex plugin
 * Defines the structure of all translatable strings
 */

export type SupportedLanguage = "en" | "zh-TW" | "ja";

export interface Translations {
    // Config UI
    config: {
        messageLanguage: {
            displayName: string;
            subtitle: string;
        };
        embeddingModel: {
            displayName: string;
            subtitle: string;
        };
        contextThreshold: {
            displayName: string;
            subtitle: string;
        };
        retrievalLimit: {
            displayName: string;
            subtitle: string;
        };
        affinityThreshold: {
            displayName: string;
            subtitle: string;
        };
        enableDebugLogging: {
            displayName: string;
            subtitle: string;
        };
        debugLogPath: {
            displayName: string;
            subtitle: string;
        };
    };

    // Status messages
    status: {
        loadingEmbeddingModel: (modelPath: string) => string;
        retrievingCitations: string;
        processFileForRetrieval: (fileName: string) => string;
        processingFileForRetrieval: (fileName: string) => string;
        processedFileForRetrieval: (fileName: string) => string;
        fileProcessProgress: (verb: string, fileName: string, progress: string) => string;
        retrievalSuccess: (count: number, threshold: number) => string;
        noRelevantContent: (threshold: number) => string;
        decidingStrategy: string;
        loadingParser: (fileName: string) => string;
        parserLoaded: (library: string, fileName: string) => string;
        fileProcessing: (action: string, fileName: string, indicator: string, progress: string) => string;
        strategyRetrieval: (percent: number) => string;
        strategyInjectFull: (percent: number) => string;
    };

    // Error messages
    errors: {
        retrievalFailed: string;
        modelNotFound: (modelPath: string) => string;
        modelNotFoundDetail: (modelPath: string, error: any) => string;
    };

    // LLM System prompts
    llmPrompts: {
        citationsPrefix: string;
        citationLabel: (index: number) => string;
        citationsSuffix: (userPrompt: string) => string;
        noRetrievalNote: (userPrompt: string) => string;
        enrichedContextPrefix: string;
        fileContentStart: (fileName: string) => string;
        fileContentEnd: (fileName: string) => string;
        enrichedContextSuffix: (userQuery: string) => string;
    };

    // Action verbs
    verbs: {
        loading: string;
        chunking: string;
        embedding: string;
        reading: string;
        parsing: string;
    };
}
