# Locales ディレクトリ

**[English](./README.md) | [繁體中文](./README.zh-TW.md)**

このディレクトリには、RAG-Flex プラグインのすべての翻訳ファイルが含まれています。

## ディレクトリ構造

```
src/locales/
├── README.md          # 英語版ドキュメント
├── README.zh-TW.md    # 繁体中国語版ドキュメント
├── README.ja.md       # このファイル（日本語）
├── types.ts           # 翻訳用 TypeScript 型定義
├── en.ts              # 英語翻訳
├── zh-TW.ts           # 繁体中国語翻訳
├── ja.ts              # 日本語翻訳
└── index.ts           # すべての翻訳と型のエクスポート
```

## ファイルの説明

### `types.ts`
すべての翻訳可能なコンテンツの TypeScript インターフェースを定義：
- `SupportedLanguage`: サポートされているすべての言語コードのユニオン型
- `Translations`: 翻訳オブジェクトの構造を定義するインターフェース

### `en.ts`
すべての英語翻訳を含む。エクスポート名: `en`

### `zh-TW.ts`
すべての繁体中国語翻訳を含む。エクスポート名: `zhTW`

### `ja.ts`
すべての日本語翻訳を含む。エクスポート名: `ja`

### `index.ts`
以下を行う中央エクスポートポイント：
- すべての言語モジュールをインポート
- 言語コードを翻訳オブジェクトにマッピングする `translations` オブジェクトを作成
- 利便性のために型を再エクスポート

## 新しい言語の追加

新しい言語（例：韓国語）を追加するには：

### 1. 翻訳ファイルを作成

`src/locales/ko.ts` を作成：

```typescript
/**
 * RAG-Flex プラグイン用韓国語翻訳
 */

import type { Translations } from "./types";

export const ko: Translations = {
    config: {
        embeddingModel: {
            displayName: "임베딩 모델",
            subtitle: "임베딩 모델 선택（사전 다운로드 필요）"
        },
        // ... 残りの翻訳
    },
    // ... すべてのセクションを実装
};
```

### 2. `types.ts` を更新

`SupportedLanguage` に新しい言語コードを追加：

```typescript
export type SupportedLanguage = "en" | "zh-TW" | "ja" | "ko";
```

### 3. `index.ts` を更新

新しい言語をインポートし、translations オブジェクトに追加：

```typescript
import { ko } from "./ko";

export const translations: Record<SupportedLanguage, Translations> = {
    "en": en,
    "zh-TW": zhTW,
    "ja": ja,
    "ko": ko
};
```

### 4. 言語検出を更新（オプション）

新しい言語の自動検出が必要な場合、`src/i18n.ts` を更新：

```typescript
export function detectSystemLanguage(): SupportedLanguage {
    const envLang = process.env.LANG || process.env.LANGUAGE || process.env.LC_ALL || "";

    // ... 既存のチェック ...

    // 韓国語
    if (envLang.includes("ko") || envLang.includes("kr")) {
        return "ko";
    }

    return "en";
}
```

### 5. 言語セレクターを更新

`src/config.ts` で、新しいオプションを追加：

```typescript
const LANGUAGE_OPTIONS: Record<SupportedLanguage, string> = {
    "en": "English (en)",
    "zh-TW": "繁體中文 (zh-TW)",
    "ja": "日本語 (ja)",
    "ko": "한국어 (ko)"
};
```

## 翻訳ガイドライン

### 1. 一貫性
- すべての文字列で一貫した用語を使用
- 適切な場合は技術用語を英語のままにする（例：「Embedding」、「RAG」）
- 既存の翻訳のトーンとスタイルに合わせる

### 2. コンテキスト
- テキストが表示される UI コンテキストを考慮
- UI 要素（displayName、subtitle）の文字列は簡潔に
- エラーメッセージには詳細な情報を提供

### 3. パラメータ化された文字列
多くの翻訳文字列はパラメータを受け取ります：

```typescript
// types.ts の関数シグネチャ
loadingEmbeddingModel: (modelPath: string) => string;

// 言語ファイルでの実装
loadingEmbeddingModel: (modelPath) => `モデルを読み込み中: ${modelPath}...`,
```

以下を確認してください：
- すべての提供されたパラメータを使用
- パラメータを文中に自然に配置
- 対象言語の適切な文法と語順を維持

### 4. 特殊文字
- 言語に適した引用符を使用（例：日本語の場合は「」や『』）
- 適切な句読点を含める
- 必要に応じてテンプレートリテラル内の特殊文字をエスケープ

## 翻訳のテスト

翻訳を追加または変更した後：

1. **型チェック**: TypeScript のコンパイルが成功することを確認
   ```bash
   lms dev
   ```

2. **ビジュアルテスト**:
   - LM Studio でプラグインを起動
   - 設定で言語を切り替え
   - すべての機能をテストし、テキストが正しく表示されることを確認

3. **機能テスト**:
   - ファイルをアップロードし、ステータスメッセージを確認
   - エラーをトリガーし、エラーメッセージを確認
   - 異なるファイルサイズでテストし、すべてのコードパスを確認

## 翻訳カバレッジ

現在の翻訳カバレッジ（言語ファイルごと）：

- **設定 UI**: 7 設定 × 2 フィールド = 14 文字列
- **ステータスメッセージ**: 14 関数/文字列
- **エラーメッセージ**: 3 関数
- **LLM プロンプト**: 8 関数
- **動詞**: 5 文字列

**言語ごとの合計**: 約 44 の翻訳可能項目

## ベストプラクティス

1. **文字列をハードコードしない**: 新しいユーザー向けテキストは常に翻訳ファイルに追加
2. **型安全性を使用**: TypeScript に欠落している翻訳を検出させる
3. **コンテキストでテスト**: コードだけでなく、実際の UI で翻訳を確認
4. **文化的適応**: 文字通りの翻訳だけでなく、文化的規範に合わせてコンテンツを適応
5. **同期を保つ**: 1 つの言語を更新する場合、すべての言語を更新

## 質問がある場合

翻訳システムについて質問がある場合は、以下を参照してください：
- [I18N.ja.md](../../docs/I18N.ja.md) - 国際化システムガイド（[English](../../docs/I18N.md) および [繁體中文](../../docs/I18N.zh-TW.md) 版もあります）
- [I18N_IMPLEMENTATION.md](../../docs/I18N_IMPLEMENTATION.md) - 技術実装詳細
- `src/i18n.ts` - コア国際化ロジック
- `types.ts` - TypeScript 型構造リファレンス
