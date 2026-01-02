/**
 * English translations for RAG-Flex plugin
 */

import type { Translations } from "./types";

export const en: Translations = {
    config: {
        messageLanguage: {
            displayName: "Message Language",
            subtitle: "Language for runtime messages and interactions (config UI uses system language)"
        },
        embeddingModel: {
            displayName: "Embedding Model",
            subtitle: "Select an embedding model (must be downloaded first)"
        },
        contextThreshold: {
            displayName: "Context Usage Threshold",
            subtitle: "Determines full-text injection vs. RAG retrieval | Default 0.7 | Lower = precise, Higher = comprehensive"
        },
        retrievalLimit: {
            displayName: "Retrieval Limit",
            subtitle: "Number of chunks to return when retrieval is triggered. Recommend 5+ for BGE-M3."
        },
        affinityThreshold: {
            displayName: "Retrieval Affinity Threshold",
            subtitle: "Similarity threshold | BGE-M3: 0.4-0.6 | For code/SQL files, use lower values (e.g. 0.4) to avoid missing content."
        },
        enableDebugLogging: {
            displayName: "Enable Debug Logging",
            subtitle: "Enable debug logging to file for troubleshooting (developers only)"
        },
        debugLogPath: {
            displayName: "Debug Log Path",
            subtitle: "Path to debug log file (relative or absolute). Default: ./logs/lmstudio-debug.log"
        }
    },

    status: {
        loadingEmbeddingModel: (modelPath) => `Loading embedding model: ${modelPath}...`,
        retrievingCitations: "Retrieving relevant citations for user query...",
        processFileForRetrieval: (fileName) => `Process ${fileName} for retrieval`,
        processingFileForRetrieval: (fileName) => `Processing ${fileName} for retrieval`,
        processedFileForRetrieval: (fileName) => `Processed ${fileName} for retrieval`,
        fileProcessProgress: (verb, fileName, progress) => `${verb} ${fileName} for retrieval (${progress})`,
        retrievalSuccess: (count, threshold) => `Retrieved ${count} relevant citations (threshold: ${threshold})`,
        noRelevantContent: (threshold) => `No relevant citations found (threshold: ${threshold})`,
        decidingStrategy: "Deciding how to handle the document(s)...",
        loadingParser: (fileName) => `Loading parser for ${fileName}...`,
        parserLoaded: (library, fileName) => `${library} loaded for ${fileName}...`,
        fileProcessing: (action, fileName, indicator, progress) => `${action} file ${fileName}${indicator}... (${progress})`,
        strategyRetrieval: (percent) => `File size exceeds ${percent}% threshold, using RAG retrieval (precise mode)`,
        strategyInjectFull: (percent) => `File size within safe range (< ${percent}%), using full-text injection (comprehensive mode)`
    },

    errors: {
        retrievalFailed: "System error: Failed to retrieve results",
        modelNotFound: (modelPath) => `❌ Embedding model not found: ${modelPath}`,
        modelNotFoundDetail: (modelPath, error) =>
            `⚠️ **Embedding Model Not Found**\n\n` +
            `Cannot load model: \`${modelPath}\`\n\n` +
            `Please download the model in LM Studio:\n` +
            `1. Click "🔍 Search" on the left sidebar\n` +
            `2. Search and download: ${modelPath}\n` +
            `3. Retry after download completes\n\n` +
            `Or select another downloaded embedding model in plugin settings.\n\n` +
            `Original error: ${error}`
    },

    llmPrompts: {
        citationsPrefix: "The following citations were found in the files provided by the user:\n\n",
        citationLabel: (index) => `Citation ${index}`,
        citationsSuffix: (userPrompt) =>
            `Use the citations above to respond to the user query, only if they are relevant. ` +
            `Otherwise, respond to the best of your ability without them.` +
            `\n\nUser Query:\n\n${userPrompt}`,
        noRetrievalNote: (userPrompt) =>
            `[System Note: No high-relevance citations found. Please answer based on document context to the best of your ability]\n\n` +
            `User Query:\n\n${userPrompt}`,
        enrichedContextPrefix: "This is an Enriched Context Generation scenario.\n\nThe following content was found in the files provided by the user.\n",
        fileContentStart: (fileName) => `** ${fileName} full content **`,
        fileContentEnd: (fileName) => `** end of ${fileName} **`,
        enrichedContextSuffix: (userQuery) => `Based on the content above, please provide a response to the user query.\n\nUser query: ${userQuery}`
    },

    verbs: {
        loading: "Loading",
        chunking: "Chunking",
        embedding: "Embedding",
        reading: "Reading",
        parsing: "Parsing"
    }
};
