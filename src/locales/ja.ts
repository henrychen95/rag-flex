/**
 * RAG-Flex プラグイン用日本語翻訳
 */

import type { Translations } from "./types";

export const ja: Translations = {
    config: {
        messageLanguage: {
            displayName: "メッセージ言語",
            subtitle: "実行時のメッセージと対話に使用する言語（設定画面はシステム言語を使用）"
        },
        embeddingModel: {
            displayName: "埋め込みモデル",
            subtitle: "埋め込みモデルを選択（事前にダウンロードが必要）"
        },
        contextThreshold: {
            displayName: "コンテキスト使用しきい値",
            subtitle: "全文挿入か RAG 検索かを決定 | デフォルト 0.7 | 低い = 精密、高い = 包括的"
        },
        retrievalLimit: {
            displayName: "検索リミット",
            subtitle: "検索実行時に取得するチャンク数。BGE-M3 の場合は 5 以上を推奨。"
        },
        affinityThreshold: {
            displayName: "検索親和性しきい値",
            subtitle: "類似度のしきい値 | BGE-M3: 0.4-0.6 | コードや SQL ファイルの場合は、欠落を防ぐため低めの値（例: 0.4）を推奨。"
        },
        enableDebugLogging: {
            displayName: "デバッグログを有効化",
            subtitle: "トラブルシューティング用にデバッグログをファイルに記録（開発者向け）"
        },
        debugLogPath: {
            displayName: "デバッグログのパス",
            subtitle: "デバッグログファイルのパス（相対パスまたは絶対パス）。デフォルト: ./logs/lmstudio-debug.log"
        }
    },

    status: {
        loadingEmbeddingModel: (modelPath) => `埋め込みモデルを読み込み中: ${modelPath}...`,
        retrievingCitations: "ユーザーのクエリに関連する引用を取得中...",
        processFileForRetrieval: (fileName) => `${fileName} を検索用に処理`,
        processingFileForRetrieval: (fileName) => `${fileName} を検索用に処理中`,
        processedFileForRetrieval: (fileName) => `${fileName} の処理が完了しました`,
        fileProcessProgress: (verb, fileName, progress) => `${fileName} を${verb}中 (${progress})`,
        retrievalSuccess: (count, threshold) => `${count} 件の関連引用を取得しました (しきい値: ${threshold})`,
        noRelevantContent: (threshold) => `関連する引用が見つかりませんでした (しきい値: ${threshold})`,
        decidingStrategy: "ドキュメントの処理方法を決定中...",
        loadingParser: (fileName) => `${fileName} のパーサーを読み込み中...`,
        parserLoaded: (library, fileName) => `${fileName} 用に ${library} を読み込みました...`,
        fileProcessing: (action, fileName, indicator, progress) => `ファイル ${fileName}${indicator} を${action}中... (${progress})`,
        strategyRetrieval: (percent) => `ファイルサイズが ${percent}% のしきい値を超えたため、RAG 検索（精密モード）を使用します`,
        strategyInjectFull: (percent) => `ファイルサイズが許容範囲内（${percent}% 未満）のため、全文挿入（包括的モード）を使用します`
    },

    errors: {
        retrievalFailed: "システムエラー: 結果の取得に失敗しました",
        modelNotFound: (modelPath) => `❌ 埋め込みモデルが見つかりません: ${modelPath}`,
        modelNotFoundDetail: (modelPath, error) =>
            `⚠️ **埋め込みモデルが見つかりません**\n\n` +
            `モデルをロードできません: \`${modelPath}\`\n\n` +
            `LM Studio でモデルをダウンロードしてください:\n` +
            `1. 左サイドバーの「🔍 Search」をクリック\n` +
            `2. 検索してダウンロード: ${modelPath}\n` +
            `3. ダウンロード完了後に再試行してください\n\n` +
            `または、プラグイン設定で別のダウンロード済みモデルを選択してください。\n\n` +
            `元のエラー: ${error}`
    },

    llmPrompts: {
        citationsPrefix: "ユーザーから提供されたファイル内に、以下の引用が見つかりました：\n\n",
        citationLabel: (index) => `引用 ${index}`,
        citationsSuffix: (userPrompt) =>
            `上記の引用が関連している場合のみ、それらを使用してユーザーのクエリに回答してください。` +
            `関連がない場合は、引用を使わずに可能な限り回答してください。` +
            `\n\nユーザーのクエリ：\n\n${userPrompt}`,
        noRetrievalNote: (userPrompt) =>
            `[システムノート: 関連性の高い引用は見つかりませんでした。ドキュメントのコンテキストに基づいて可能な限り回答してください]\n\n` +
            `ユーザーのクエリ：\n\n${userPrompt}`,
        enrichedContextPrefix: "これは拡張コンテキスト生成（Enriched Context Generation）シナリオです。\n\nユーザーから提供されたファイル内に以下の内容が見つかりました。\n",
        fileContentStart: (fileName) => `** ${fileName} の全内容 **`,
        fileContentEnd: (fileName) => `** ${fileName} の終了 **`,
        enrichedContextSuffix: (userQuery) => `上記の内容に基づいて、ユーザーのクエリに回答してください。\n\nユーザーのクエリ: ${userQuery}`
    },

    verbs: {
        loading: "読み込み",
        chunking: "チャンク分割",
        embedding: "埋め込み",
        reading: "読み取り",
        parsing: "解析"
    }
};