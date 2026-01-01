# RAG-Flex

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/henrychen95/rag-flex)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

[English](README.md) | [繁體中文](README.zh-TW.md)

A flexible RAG (Retrieval-Augmented Generation) plugin for LM Studio with dynamic embedding model selection and intelligent context management.

## ✨ Features

- **🔄 Dynamic Model Selection**: Choose from 4 mainstream embedding models
- **🧠 Smart Context Management**: Automatically decides between full-text injection and RAG retrieval based on file size
- **🌏 Traditional Chinese Support**: User-friendly error messages and UI in Traditional Chinese
- **⚙️ Flexible Configuration**: Adjustable retrieval limits, affinity thresholds, and context usage
- **🛡️ Robust Error Handling**: AI-friendly error messages that guide users to solutions

## 🚀 Quick Start

### Prerequisites

1. Install [LM Studio](https://lmstudio.ai/)
2. Download at least one embedding model:
   - **Recommended**: `nomic-ai/nomic-embed-text-v1.5-GGUF` (built-in, fast)
   - **For Chinese/Multilingual**: `lm-kit/bge-m3-gguf` (slower but more accurate)

### Installation

#### From LM Studio Plugin Marketplace (Recommended)
1. Open LM Studio
2. Navigate to **Plugins** → **Discover**
3. Search for "RAG-Flex"
4. Click **Install**

#### From GitHub (Development Mode)
```bash
git clone https://github.com/henrychen95/rag-flex.git
cd rag-flex
lms dev
```

The plugin will automatically load into LM Studio. You should see "Register with LM Studio" in the terminal output.

## 📖 Usage

### Basic Workflow

1. **Enable the plugin** in LM Studio settings
2. **Upload documents** to your chat (PDF, DOCX, TXT, MD)
3. **Ask questions** - RAG-Flex automatically:
   - Analyzes file size and context usage
   - Chooses between full-text injection (small files) or RAG retrieval (large files)
   - Returns relevant chunks with citations

### Configuration Options

| Parameter | Default | Range | Description |
|-----------|---------|-------|-------------|
| **Embedding Model** | nomic-ai/nomic-embed-text-v1.5 | 4 models | Choose your embedding model |
| **Context Usage Threshold** | 0.7 | 0.1 - 1.0 | Trigger point for RAG retrieval (lower = more precise) |
| **Retrieval Limit** | 5 | 1 - 15 | Number of chunks to retrieve |
| **Retrieval Affinity Threshold** | 0.4 | 0.0 - 1.0 | Similarity threshold (BGE-M3: 0.4-0.6 recommended) |

### Embedding Model Comparison

| Model | Size | Speed | Best For | Notes |
|-------|------|-------|----------|-------|
| **nomic-ai/nomic-embed-text-v1.5-GGUF** | 84 MB | ⚡ Fast | English, general use | LM Studio built-in, Q4_K_M |
| **lm-kit/bge-m3-gguf** | 1.16 GB | 🐌 Slow | Chinese, multilingual | F16 high precision |
| **sentence-transformers/all-MiniLM-L6-v2-f16.gguf** | ~90 MB | ⚡ Fast | Lightweight tasks | Small and efficient |
| **thenlper/gte-large-Q4_K_M.gguf** | ~600 MB | ⚙️ Medium | Balanced performance | Good quality/speed ratio |

## 💡 Use Cases

### 📚 Technical Documentation
```
Upload: API documentation, framework guides
Ask: "What are the authentication methods supported?"
Result: RAG-Flex retrieves relevant API sections with citations
```

### 📄 Government Document Analysis
```
Upload: Contracts, regulations, public notices
Ask: "What are the requirements for 申請補助?"
Result: Extracts relevant clauses with precise references
```

### 💻 Code Understanding
```
Upload: SQL files, PHP code, config files
Ask: "Explain the database schema relationships"
Result: Retrieves relevant code snippets and comments
```

**Tip**: For code files, lower the affinity threshold to 0.4 to avoid missing technical content.

## 🔧 Advanced Configuration

### When to Adjust Context Threshold

- **Lower (0.3-0.5)**: Force RAG mode for more precise retrieval
- **Higher (0.8-0.9)**: Allow more full-text injection for comprehensive context

### Optimizing for Large Files

If you encounter errors with files >1MB:
1. Lower **Retrieval Limit** to 3-5
2. Increase **Context Threshold** to 0.8
3. Or split files into smaller chunks

## 🆚 Improvements Over RAG-v1

| Feature | RAG-v1 | RAG-Flex |
|---------|--------|----------|
| Embedding Model | ❌ Hardcoded (nomic only) | ✅ 4 selectable models |
| Error Messages | ❌ Technical English | ✅ User-friendly Traditional Chinese |
| Context Management | ⚙️ Basic | ✅ Smart threshold-based |
| Affinity Threshold | ❌ Fixed | ✅ Configurable (0.0-1.0) |
| No-result Handling | ❌ Exposes system prompt | ✅ Graceful degradation |

## 🐛 Troubleshooting

### "找不到模型" (Model Not Found)

**Cause**: Embedding model not downloaded

**Solution**:
1. Open LM Studio → **Discover**
2. Search for the model name (e.g., `bge-m3`)
3. Download and retry

### "處理失敗" (Processing Failed)

**Cause**: File too large or out of memory

**Solutions**:
1. Split file into smaller parts
2. Lower **Retrieval Limit** in settings
3. Close other applications to free memory

### No Relevant Content Found

**Cause**: Affinity threshold too high

**Solution**: Lower **Retrieval Affinity Threshold** to 0.3-0.4

**💡 Pro Tip**: All error messages are AI-friendly - paste them directly into your LLM chat for automated troubleshooting!

## 📦 Supported File Formats

- ✅ PDF
- ✅ DOCX
- ✅ TXT
- ✅ Markdown (MD)

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Built on [LM Studio SDK](https://lmstudio.ai/docs)
- Inspired by the original RAG-v1 plugin
- Embedding models from Hugging Face community

## 📧 Contact

**Author**: Henry Chen  
**GitHub**: [@henrychen95](https://github.com/henrychen95)  
**Repository**: [rag-flex](https://github.com/henrychen95/rag-flex)

---

**⭐ If RAG-Flex helps your workflow, please star the repository!**