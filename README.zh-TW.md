# RAG-Flex

[![版本](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/henrychen95/rag-flex)
[![授權](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![LM Studio](https://img.shields.io/badge/LM%20Studio-Plugin-orange.svg)](https://lmstudio.ai)

[English](README.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md)

適用於 LM Studio 的靈活 RAG（檢索增強生成）插件，支援動態 Embedding 模型選擇、智慧情境管理與多語系支援。

## ✨ 特色功能

- **🔄 動態模型選擇**：從 4 種主流 Embedding 模型中選擇，自動偵測本地模型
- **🧠 智慧情境管理**：根據檔案大小自動決定全文注入或 RAG 檢索
- **🌏 多語系支援**：完整支援英文、繁體中文、日文介面與訊息
- **⚙️ 靈活配置**：可調整檢索數量、相似度門檻與情境使用率
- **🛡️ 強健的錯誤處理**：AI 友善的錯誤訊息，引導使用者解決問題
- **🔧 開發者工具**：可選的除錯日誌功能，方便故障排除與開發

## 🚀 快速開始

### 前置需求

1. 安裝 [LM Studio](https://lmstudio.ai/)（v0.2.9 或更新版本）
2. 至少下載一個 Embedding 模型：
   - **推薦**：`nomic-ai/nomic-embed-text-v1.5-GGUF`（內建，速度快）
   - **中文/多語言**：`lm-kit/bge-m3-gguf`（較慢但更精確）

### 安裝方式

#### 從 LM Studio 插件頁面安裝（推薦）
1. 前往 https://lmstudio.ai/yongwei/rag-flex
2. 點擊 **Run in LM Studio**
3. LM Studio 會自動開啟並安裝插件

#### 從 GitHub 安裝（開發模式）
```bash
git clone https://github.com/henrychen95/rag-flex.git
cd rag-flex
lms dev
```

插件會自動載入到 LM Studio。終端機會顯示 "Register with LM Studio" 表示載入成功。

## 📖 使用方式

### 基本流程

1. **啟用插件**：在 LM Studio 設定中啟用（Plugins 分頁）
2. **上傳文件**：將文件（PDF、DOCX、TXT、MD）上傳到對話中
3. **提問**：RAG-Flex 會自動：
   - 分析檔案大小與情境使用率
   - 選擇全文注入（小檔案）或 RAG 檢索（大檔案）
   - 回傳相關片段並附上引用來源

### 範例對話

#### 小檔案（全文注入模式）
```
📎 上傳：會議記錄.txt（5 KB）
💬 您：「這次會議的待辦事項有哪些？」
🤖 AI：[檢視完整文件] 「待辦事項包括：
       1. John 在週五前準備 Q4 報告
       2. Sarah 安排後續會議...」
```

#### 大檔案（RAG 檢索模式）
```
📎 上傳：技術手冊.pdf（2 MB）
💬 您：「如何設定 SSL 憑證？」
🤖 AI：[檢索相關章節]
       「根據參考片段 1 和參考片段 3：
       要設定 SSL 憑證，您需要...」

       參考片段 1：（第 45 頁）「SSL 設定包括...」
       參考片段 3：（第 89 頁）「憑證安裝步驟...」
```

## ⚙️ 配置選項

在 LM Studio → Plugins → RAG-Flex 中存取插件設定

| 參數 | 預設值 | 範圍 | 說明 |
|------|--------|------|------|
| **訊息語言** | 自動偵測 | EN/ZH-TW/JA | 執行時訊息的語言 |
| **Embedding 模型** | nomic-ai/nomic-embed-text-v1.5 | 4+ 種模型 | 選擇您的 Embedding 模型 |
| **情境使用門檻** | 0.7 | 0.1 - 1.0 | RAG 檢索觸發點（數值越低越精確） |
| **檢索片段數** | 5 | 1 - 15 | 觸發檢索時回傳的片段數量 |
| **相似度門檻** | 0.4 | 0.0 - 1.0 | 相似度門檻（BGE-M3 建議 0.4-0.6） |
| **啟用除錯日誌** | 關閉 | 開/關 | 啟用除錯日誌（開發者用） |
| **除錯日誌路徑** | ./logs/lmstudio-debug.log | 自訂路徑 | 除錯日誌檔案路徑 |

### Embedding 模型比較

| 模型 | 大小 | 速度 | 適用場景 | 語言支援 |
|------|------|------|----------|----------|
| **nomic-ai/nomic-embed-text-v1.5-GGUF** | 84 MB | ⚡⚡⚡ 快 | 英文、一般用途 | 英文 |
| **NathanMad/sentence-transformers_all-MiniLM-L12-v2-gguf** | 133 MB | ⚡⚡⚡ 快 | 輕量任務 | 英文 |
| **groonga/gte-large-Q4_K_M-GGUF** | 216 MB | ⚡⚡ 中等 | 平衡型 | 多語言 |
| **lm-kit/bge-m3-gguf** | 1.16 GB | ⚡ 慢 (F16) / ⚡⚡ 中等 (Q4) | 中文、多語言、高精度 | 100+ 種語言 |

**自動偵測**：插件會自動偵測本地已下載的模型並加入下拉選單。

## 💡 使用場景與範例

### 📚 技術文件分析
```
情境：軟體開發者需要查詢 API 文件
上傳：FastAPI-documentation.pdf（3.2 MB）
提問：「FastAPI 支援哪些身份驗證方法？」

結果：RAG 檢索模式啟動
✓ 檢索到 5 個相關引用
✓ 找到 JWT、OAuth2、API Key 章節
✓ 提供文件中的程式碼範例

配置建議：
- 情境門檻：0.7（預設值）
- 檢索片段數：5-7（全面涵蓋）
- 相似度門檻：0.5（技術內容）
```

### 📄 法律文件審查
```
情境：律師審查合約條款
上傳：商業租賃合約.docx（250 KB）
提問：「承租人的維護責任有哪些？」

結果：全文注入模式（檔案在門檻內）
✓ 整份文件注入為情境
✓ AI 可以交叉參照多個條款
✓ 提供完整答案並標註確切條款編號

配置建議：
- 情境門檻：0.8（允許全文注入）
- 語言：繁體中文（處理中文合約）
```

### 💻 程式碼理解與分析
```
情境：理解資料庫架構
上傳：database-schema.sql（450 KB）
提問：「說明 users 和 orders 表之間的關聯性」

結果：RAG 檢索（降低門檻）
✓ 檢索相關的 CREATE TABLE 語句
✓ 找到外鍵約束條件
✓ 識別關聯表

配置建議：
- 相似度門檻：0.3-0.4（程式碼/SQL 使用較低值）
- 檢索片段數：8-10（捕捉相關表格）
- 模型：bge-m3（更適合帶中文註解的程式碼）
```

### 🏛️ 政府公文處理
```
情境：公務人員處理申請案件
上傳：2024年補助申請作業要點.pdf（1.8 MB）
提問：「申請資格有哪些限制條件？」

結果：多語言 RAG 檢索
✓ 語言自動偵測為繁體中文
✓ 檢索資格條件章節
✓ 引用包含頁碼與條文參考

配置建議：
- 語言：繁體中文
- 模型：bge-m3（最適合繁體中文）
- 相似度門檻：0.5-0.6
```

### 📊 學術論文分析
```
情境：研究生進行文獻回顧
上傳：機器學習綜述論文-2024.pdf（4.5 MB）
提問：「Transformer 架構目前有哪些挑戰？」

結果：精確 RAG 檢索
✓ 檢索「挑戰」和「未來工作」章節
✓ 交叉參照方法論章節
✓ 提供含頁碼的引用

配置建議：
- 情境門檻：0.6（大型論文強制使用 RAG）
- 檢索片段數：10-15（捕捉多元觀點）
- 模型：gte-large（學術內容的良好平衡）
```

## 🔧 進階配置指南

### 理解情境使用門檻

門檻決定何時從全文注入切換到 RAG 檢索：

```
可用情境 = 剩餘情境 × 門檻

如果（檔案 Token 數 + 提示詞 Token 數）> 可用情境：
    → 使用 RAG 檢索（精確模式）
否則：
    → 使用全文注入（全面模式）
```

**何時調整：**

| 門檻 | 行為 | 使用場景 |
|------|------|----------|
| **0.3-0.5** | 更常強制使用 RAG | 大型文件、記憶體限制 |
| **0.6-0.7** | 平衡（預設） | 一般使用 |
| **0.8-0.9** | 允許更多全文注入 | 小型文件、需要完整情境 |

### 最佳化檢索相似度門檻

不同內容類型需要不同的相似度門檻：

| 內容類型 | 建議門檻 | 原因 |
|----------|---------|------|
| **自然語言文字** | 0.5-0.7 | 語意匹配清晰 |
| **技術文件** | 0.4-0.6 | 技術術語變化大 |
| **程式碼/SQL** | 0.3-0.4 | 語法密集，語意相似度較低 |
| **混合語言** | 0.4-0.5 | 考慮語言切換 |

### 多語系配置

插件會自動偵測您的系統語言並設定介面：

- **Windows**：使用 Intl API 偵測區域設定
- **Linux/macOS**：檢查 `LANG`、`LANGUAGE`、`LC_ALL` 環境變數
- **手動覆寫**：在插件設定中變更「訊息語言」

**支援的語言：**
- 🇬🇧 English (en)
- 🇹🇼 繁體中文 (zh-TW)
- 🇯🇵 日本語 (ja)

📖 **給開發者**：請參閱 [I18N.zh-TW.md](./docs/I18N.zh-TW.md) 了解國際化系統的技術細節、如何新增語言以及翻譯指南。另有 [English](./docs/I18N.md) 和 [日本語](./docs/I18N.ja.md) 版本。

### 開發者模式：除錯日誌

啟用除錯日誌以進行故障排除或開發：

1. 開啟 LM Studio → Plugins → RAG-Flex 設定
2. 啟用「啟用除錯日誌」
3. （選用）設定自訂「除錯日誌路徑」
4. 日誌將包含：
   - 系統語言偵測
   - 模型載入事件
   - 檔案處理步驟
   - 檢索結果
   - 錯誤堆疊追蹤

**預設日誌位置**：`./logs/lmstudio-debug.log`

## 🐛 故障排除

### 常見問題

#### 「❌ 找不到 Embedding 模型」

**原因**：所選模型未在 LM Studio 中下載

**解決方式**：
1. 開啟 LM Studio → **Search**（🔍）
2. 搜尋模型名稱（例如：`bge-m3`）
3. 點擊 **Download**
4. 等待下載完成
5. 重新啟動對話或重新載入插件

**替代方案**：在插件設定中選擇其他模型

---

#### 「找不到任何相關內容（門檻：0.4）」

**原因**：檢索相似度門檻對您的內容來說太高

**解決方式**：
- **程式碼/SQL 檔案**：降低門檻至 0.3-0.4
- **混合語言文件**：嘗試 0.4-0.5
- **技術術語**：降低至 0.35-0.45

**如何調整**：LM Studio → Plugins → RAG-Flex → 檢索相似度門檻

---

#### 檔案處理速度太慢

**原因**：大型檔案使用高精度 embedding 模型

**解決方式**：
1. **切換到更快的模型**：
   - 使用 `nomic-embed-text-v1.5` 而非 `bge-m3`
   - 英文內容快 10-20 倍
2. **降低檢索片段數**：
   - 從 5 降至 3 個片段
   - 處理更快，但情境較少
3. **分割大型檔案**：
   - 將 >5MB 的檔案分成章節/段落

---

#### 執行訊息語言不正確

**原因**：系統語言自動偵測結果與您的偏好不符

**解決方式**：
1. 開啟插件設定
2. 手動選擇「訊息語言」
3. 選擇：English (en) / 繁體中文 (zh-TW) / 日本語 (ja)

**注意**：此設定僅影響插件執行時的訊息（錯誤訊息、狀態更新等）。LM Studio 的介面語言由 LM Studio 本身控制。

---

#### 除錯日誌未建立

**可能原因**：
- 設定中未啟用除錯日誌
- 檔案寫入權限不足
- 日誌路徑無效

**解決方式**：
1. 在插件設定中啟用「啟用除錯日誌」
2. 檢查日誌路徑存在且可寫入
3. 嘗試使用預設路徑：`./logs/lmstudio-debug.log`
4. Windows 系統確保路徑使用 `\\` 或 `/`

---

**💡 專業提示**：所有錯誤訊息都是 AI 友善格式 - 可直接貼到 LLM 對話中進行自動故障排除！

## 📦 支援的檔案格式

| 格式 | 副檔名 | 處理方式 | 備註 |
|------|--------|----------|------|
| PDF | `.pdf` | 文字擷取 | 支援文字型 PDF（不支援掃描影像） |
| Word 文件 | `.docx` | 完整文件解析 | 保留結構與格式 |
| 純文字 | `.txt` | 直接讀取 | 建議使用 UTF-8 編碼 |
| Markdown | `.md` | Markdown 解析 | 維持標題結構 |

**不支援**：圖片、音訊、影片、Excel 試算表、未經 OCR 的掃描 PDF

## 🆚 相較於 RAG-v1 的改進

| 功能 | RAG-v1 | RAG-Flex (v1.1) |
|------|--------|----------|
| **Embedding 模型** | ❌ 硬編碼（僅 nomic） | ✅ 4 種可選 + 自動偵測 |
| **多語系支援** | ❌ 僅英文 | ✅ English, 繁體中文, 日本語 |
| **錯誤訊息** | ❌ 技術性英文 | ✅ 友善的在地化訊息 |
| **情境管理** | ⚙️ 基本門檻 | ✅ 智慧門檻策略 |
| **相似度門檻** | ❌ 固定 0.5 | ✅ 可配置（0.0-1.0） |
| **無結果處理** | ❌ 暴露系統提示詞 | ✅ 優雅降級 |
| **模型偵測** | ❌ 手動設定 | ✅ 自動偵測本地模型 |
| **除錯工具** | ❌ 無 | ✅ 可選的除錯日誌 |
| **配置介面** | ⚙️ 僅英文 | ✅ 多語言（系統語言） |

## 🤝 貢獻

歡迎貢獻！以下是您可以協助的方式：

### 回報問題
- 使用 GitHub Issues 回報錯誤
- 附上除錯日誌（請先啟用除錯日誌）
- 提供檔案類型、大小與使用的配置

### 提交程式碼
1. Fork 此專案
2. 建立功能分支（`git checkout -b feature/amazing-feature`）
3. 遵循現有程式碼風格（TypeScript with proper types）
4. 使用多個 embedding 模型測試
5. 必要時更新文件
6. 提交變更（`git commit -m 'Add amazing feature'`）
7. 推送到分支（`git push origin feature/amazing-feature`）
8. 開啟 Pull Request

### 新增翻譯
要新增新語言：
1. 在 `src/locales/types.ts` 中新增語言代碼
2. 建立翻譯檔案：`src/locales/[lang].ts`
3. 更新 `src/locales/index.ts`
4. 更新 `src/config.ts` 語言選項
5. 建立 `README.[lang].md`

詳細指南請參閱 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 📝 授權條款

MIT License - 詳見 [LICENSE](LICENSE) 檔案

這表示您可以：
- ✅ 商業使用
- ✅ 修改與散布
- ✅ 私人使用
- ✅ 再授權

要求：
- ⚖️ 包含原始授權與版權聲明

## 🙏 致謝

- **LM Studio 團隊** - 優秀的 SDK 與插件生態系統
- **原版 RAG-v1 插件** - 靈感與基礎
- **Embedding 模型作者**：
  - [Nomic AI](https://www.nomic.ai/) - nomic-embed-text-v1.5
  - [Sentence Transformers](https://www.sbert.net/) - all-MiniLM-L12-v2
  - [Groonga](https://groonga.org/) - gte-large
  - [北京智源人工智慧研究院](https://github.com/FlagOpen/FlagEmbedding) - BGE-M3
- **Hugging Face 社群** - 模型託管與散布
- **所有貢獻者** - 感謝您的改進與回饋！

## 📧 聯絡方式與連結

**作者**：Henry Chen
**GitHub**：[@henrychen95](https://github.com/henrychen95)
**專案連結**：[rag-flex](https://github.com/henrychen95/rag-flex)
**LM Studio 插件頁面**：[lmstudio.ai/yongwei/rag-flex](https://lmstudio.ai/yongwei/rag-flex)

### 社群
- 🐛 **回報錯誤**：[GitHub Issues](https://github.com/henrychen95/rag-flex/issues)
- 💡 **功能請求**：[GitHub Discussions](https://github.com/henrychen95/rag-flex/discussions)
- 📖 **文件**：[Wiki](https://github.com/henrychen95/rag-flex/wiki)

---

**⭐ 如果 RAG-Flex 對您的工作流程有幫助，請給專案一個星星！**

用 ❤️ 為 LM Studio 社群打造
