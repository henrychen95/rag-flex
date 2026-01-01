# RAG-Flex

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/henrychen95/rag-flex)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

[English](README.md) | [繁體中文](README.zh-TW.md)

適用於 LM Studio 的靈活 RAG（檢索增強生成）插件，支援動態 Embedding 模型選擇與智慧情境管理。

## ✨ 特色功能

- **🔄 動態模型選擇**：從 4 種主流 Embedding 模型中選擇
- **🧠 智慧情境管理**：根據檔案大小自動決定全文注入或 RAG 檢索
- **🌏 繁體中文支援**：友善的繁體中文錯誤訊息與介面
- **⚙️ 靈活配置**：可調整檢索數量、相似度門檻與情境使用率
- **🛡️ 強健的錯誤處理**：AI 友善的錯誤訊息，引導使用者解決問題

## 🚀 快速開始

### 前置需求

1. 安裝 [LM Studio](https://lmstudio.ai/)
2. 至少下載一個 Embedding 模型：
   - **推薦**：`nomic-ai/nomic-embed-text-v1.5-GGUF`（內建，速度快）
   - **中文/多語言**：`lm-kit/bge-m3-gguf`（較慢但更精確）

### 安裝方式

#### 從 LM Studio 插件市場安裝（推薦）
1. 開啟 LM Studio
2. 前往 **Plugins** → **Discover**
3. 搜尋 "RAG-Flex"
4. 點擊 **Install**

#### 從 GitHub 安裝（開發模式）
```bash
git clone https://github.com/henrychen95/rag-flex.git
cd rag-flex
lms dev
```

插件會自動載入到 LM Studio。終端機會顯示 "Register with LM Studio" 表示載入成功。

## 📖 使用方式

### 基本流程

1. **啟用插件**：在 LM Studio 設定中啟用
2. **上傳文件**：將文件（PDF、DOCX、TXT、MD）上傳到對話中
3. **提問**：RAG-Flex 會自動：
   - 分析檔案大小與情境使用率
   - 選擇全文注入（小檔案）或 RAG 檢索（大檔案）
   - 回傳相關片段並附上引用來源

### 配置選項

| 參數 | 預設值 | 範圍 | 說明 |
|------|--------|------|------|
| **Embedding 模型** | nomic-ai/nomic-embed-text-v1.5 | 4 種模型 | 選擇您的 Embedding 模型 |
| **情境使用門檻** | 0.7 | 0.1 - 1.0 | RAG 檢索觸發點（數值越低越精確） |
| **檢索片段數** | 5 | 1 - 15 | 觸發檢索時回傳的片段數量 |
| **相似度門檻** | 0.4 | 0.0 - 1.0 | 相似度門檻（BGE-M3 建議 0.4-0.6） |

### Embedding 模型比較

| 模型 | 大小 | 速度 | 適用場景 | 備註 |
|------|------|------|----------|------|
| **nomic-ai/nomic-embed-text-v1.5-GGUF** | 84 MB | ⚡ 快 | 英文、一般用途 | LM Studio 內建，Q4_K_M 量化 |
| **NathanMad/sentence-transformers_all-MiniLM-L12-v2-gguf** | 133 MB | ⚡ 快 | 輕量任務 | F32，小巧高效 |
| **groonga/gte-large-Q4_K_M-GGUF** | 216 MB | ⚙️ 中等 | 平衡型 | Q4_K_M，品質與速度兼顧 |
| **lm-kit/bge-m3-gguf** | 1.16 GB | 🐌 慢 | 中文、多語言 | F16 高精度 |

## 💡 使用場景

### 📚 技術文件查詢
```
上傳：API 文件、框架說明
提問：「支援哪些身份驗證方法？」
結果：RAG-Flex 檢索相關的 API 章節並附上引用
```

### 📄 政府公文分析
```
上傳：合約、法規、公告
提問：「申請補助的條件是什麼？」
結果：提取相關條款並提供精確引用
```

### 💻 程式碼理解
```
上傳：SQL 檔案、PHP 程式碼、設定檔
提問：「說明資料庫架構的關聯性」
結果：檢索相關程式碼片段與註解
```

**小技巧**：處理程式碼檔案時，建議將相似度門檻降至 0.4，避免遺漏技術內容。

## 🔧 進階配置

### 何時調整情境門檻

- **降低（0.3-0.5）**：強制使用 RAG 模式以獲得更精確的檢索
- **提高（0.8-0.9）**：允許更多全文注入以獲得完整情境

### 大檔案最佳化

如果遇到檔案 >1MB 的錯誤：
1. 降低**檢索片段數**至 3-5
2. 提高**情境門檻**至 0.8
3. 或將檔案分割成較小的區塊

## 🆚 相較於 RAG-v1 的改進

| 功能 | RAG-v1 | RAG-Flex |
|------|--------|----------|
| Embedding 模型 | ❌ 硬編碼（僅 nomic） | ✅ 4 種可選模型 |
| 錯誤訊息 | ❌ 技術性英文 | ✅ 友善的繁體中文 |
| 情境管理 | ⚙️ 基本 | ✅ 智慧門檻式 |
| 相似度門檻 | ❌ 固定 | ✅ 可配置（0.0-1.0） |
| 無結果處理 | ❌ 暴露系統提示詞 | ✅ 優雅降級 |

## 🐛 故障排除

### 「找不到模型」

**原因**：Embedding 模型未下載

**解決方式**：
1. 開啟 LM Studio → **Discover**
2. 搜尋模型名稱（例如：`bge-m3`）
3. 下載後重試

### 「處理失敗」

**原因**：檔案過大或記憶體不足

**解決方式**：
1. 將檔案分割成較小的部分
2. 在設定中降低**檢索片段數**
3. 關閉其他應用程式以釋放記憶體

### 找不到相關內容

**原因**：相似度門檻設定過高

**解決方式**：將**相似度門檻**降至 0.3-0.4

**💡 專業提示**：所有錯誤訊息都是 AI 友善格式 - 可直接貼到 LLM 對話中進行自動故障排除！

## 📦 支援的檔案格式

- ✅ PDF
- ✅ DOCX
- ✅ TXT
- ✅ Markdown (MD)

## 🤝 貢獻

歡迎貢獻！請遵循以下步驟：

1. Fork 此專案
2. 建立功能分支（`git checkout -b feature/amazing-feature`）
3. 提交變更（`git commit -m 'Add amazing feature'`）
4. 推送到分支（`git push origin feature/amazing-feature`）
5. 開啟 Pull Request

## 📝 授權條款

MIT License - 詳見 [LICENSE](LICENSE) 檔案

## 🙏 致謝

- 基於 [LM Studio SDK](https://lmstudio.ai/docs) 開發
- 靈感來自原版 RAG-v1 插件
- Embedding 模型來自 Hugging Face 社群

## 📧 聯絡方式

**作者**：Henry Chen  
**GitHub**：[@henrychen95](https://github.com/henrychen95)  
**專案連結**：[rag-flex](https://github.com/henrychen95/rag-flex)

---

**⭐ 如果 RAG-Flex 對您的工作流程有幫助，請給專案一個星星！**

---
