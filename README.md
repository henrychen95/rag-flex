# RAG-Flex

[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/henrychen95/rag-flex)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![LM Studio](https://img.shields.io/badge/LM%20Studio-Plugin-orange.svg)](https://lmstudio.ai)

[English](README.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md)

A flexible RAG (Retrieval-Augmented Generation) plugin for LM Studio with dynamic embedding model selection, intelligent context management, and multilingual support.

## ✨ Features

- **🔄 Dynamic Model Selection**: Choose from 4 mainstream embedding models with automatic local model detection
- **🧠 Smart Context Management**: Automatically decides between full-text injection and RAG retrieval based on file size
- **🌏 Multilingual Support**: Full UI and messages in English, Traditional Chinese, and Japanese
- **⚙️ Flexible Configuration**: Adjustable retrieval limits, affinity thresholds, and context usage
- **🛡️ Robust Error Handling**: AI-friendly error messages that guide users to solutions
- **🔧 Developer Tools**: Optional debug logging for troubleshooting and development

## 🚀 Quick Start

### Prerequisites

1. Install [LM Studio](https://lmstudio.ai/) (v0.2.9 or later)
2. Download at least one embedding model:
   - **Recommended**: `nomic-ai/nomic-embed-text-v1.5-GGUF` (built-in, fast)
   - **For Chinese/Multilingual**: `lm-kit/bge-m3-gguf` (slower but more accurate)

### Installation

#### From LM Studio Plugin Page (Recommended)
1. Visit https://lmstudio.ai/yongwei/rag-flex
2. Click **Run in LM Studio**
3. LM Studio will automatically open and install the plugin

#### From GitHub (Development Mode)
```bash
git clone https://github.com/henrychen95/rag-flex.git
cd rag-flex
lms dev
```

The plugin will automatically load into LM Studio. You should see "Register with LM Studio" in the terminal output.

## 📖 Usage

### Basic Workflow

1. **Enable the plugin** in LM Studio settings (Plugins tab)
2. **Upload documents** to your chat (PDF, DOCX, TXT, MD)
3. **Ask questions** - RAG-Flex automatically:
   - Analyzes file size and context usage
   - Chooses between full-text injection (small files) or RAG retrieval (large files)
   - Returns relevant chunks with citations

### Example Conversations

#### Small File (Full-Text Injection)
```
📎 Upload: meeting-notes.txt (5 KB)
💬 You: "What were the action items from the meeting?"
🤖 AI: [Reviews entire document] "The action items were:
       1. John to prepare Q4 report by Friday
       2. Sarah to schedule follow-up meeting..."
```

#### Large File (RAG Retrieval)
```
📎 Upload: technical-manual.pdf (2 MB)
💬 You: "How do I configure SSL certificates?"
🤖 AI: [Retrieves relevant sections]
       "Based on Citation 1 and Citation 3:
       To configure SSL certificates, you need to..."

       Citation 1: (Page 45) "SSL Configuration involves..."
       Citation 3: (Page 89) "Certificate installation steps..."
```

## ⚙️ Configuration Options

Access plugin settings in LM Studio → Plugins → RAG-Flex

| Parameter | Default | Range | Description |
|-----------|---------|-------|-------------|
| **Message Language** | Auto-detected | EN/ZH-TW/JA | Language for runtime messages |
| **Embedding Model** | nomic-ai/nomic-embed-text-v1.5 | 4+ models | Choose your embedding model |
| **Context Usage Threshold** | 0.7 | 0.1 - 1.0 | Trigger point for RAG retrieval (lower = more precise) |
| **Retrieval Limit** | 5 | 1 - 15 | Number of chunks to retrieve |
| **Retrieval Affinity Threshold** | 0.4 | 0.0 - 1.0 | Similarity threshold (BGE-M3: 0.4-0.6 recommended) |
| **Enable Debug Logging** | Off | On/Off | Enable debug logs for developers |
| **Debug Log Path** | ./logs/lmstudio-debug.log | Custom path | Path to debug log file |

### Embedding Model Comparison

| Model | Size | Speed | Best For | Language Support |
|-------|------|-------|----------|-----------------|
| **nomic-ai/nomic-embed-text-v1.5-GGUF** | 84 MB | ⚡⚡⚡ Fast | English, general use | English |
| **NathanMad/sentence-transformers_all-MiniLM-L12-v2-gguf** | 133 MB | ⚡⚡⚡ Fast | Lightweight tasks | English |
| **groonga/gte-large-Q4_K_M-GGUF** | 216 MB | ⚡⚡ Medium | Balanced performance | Multilingual |
| **lm-kit/bge-m3-gguf** | 1.16 GB | ⚡ Slow (F16) / ⚡⚡ Medium (Q4) | Chinese, multilingual, high precision | 100+ languages |

**Auto-Detection**: The plugin automatically detects locally downloaded models and adds them to the dropdown.

## 💡 Use Cases & Examples

### 📚 Technical Documentation Analysis
```
Scenario: Software developer needs API documentation
Upload: FastAPI-documentation.pdf (3.2 MB)
Ask: "What authentication methods does FastAPI support?"

Result: RAG retrieval mode activated
✓ Retrieved 5 relevant citations
✓ Found JWT, OAuth2, API Key sections
✓ Provided code examples from documentation

Configuration Tips:
- Context Threshold: 0.7 (default)
- Retrieval Limit: 5-7 (for comprehensive coverage)
- Affinity Threshold: 0.5 (technical content)
```

### 📄 Legal Document Review
```
Scenario: Lawyer reviewing contract terms
Upload: commercial-lease-agreement.docx (250 KB)
Ask: "What are the tenant's responsibilities for maintenance?"

Result: Full-text injection mode (file within threshold)
✓ Entire document injected as context
✓ AI can cross-reference multiple clauses
✓ Comprehensive answer with exact clause numbers

Configuration Tips:
- Context Threshold: 0.8 (allow full injection)
- Language: 繁體中文 (for Traditional Chinese contracts)
```

### 💻 Code Understanding & Analysis
```
Scenario: Understanding database schema
Upload: database-schema.sql (450 KB)
Ask: "Explain the relationship between users and orders tables"

Result: RAG retrieval with lowered threshold
✓ Retrieved relevant CREATE TABLE statements
✓ Found foreign key constraints
✓ Identified junction tables

Configuration Tips:
- Affinity Threshold: 0.3-0.4 (lower for code/SQL)
- Retrieval Limit: 8-10 (capture related tables)
- Model: bge-m3 (better for code with comments in Chinese)
```

### 🏛️ Government Document Processing
```
Scenario: Public servant processing applications
Upload: subsidy-application-guidelines-2024.pdf (1.8 MB)
Ask: "申請資格有哪些限制條件？"

Result: Multilingual RAG retrieval
✓ Language auto-detected as Traditional Chinese
✓ Retrieved eligibility criteria sections
✓ Citations include page numbers and article references

Configuration Tips:
- Language: 繁體中文
- Model: bge-m3 (best for Traditional Chinese)
- Affinity Threshold: 0.5-0.6
```

### 📊 Research Paper Analysis
```
Scenario: Graduate student literature review
Upload: machine-learning-survey-2024.pdf (4.5 MB)
Ask: "What are the current challenges in transformer architectures?"

Result: Precision RAG retrieval
✓ Retrieved sections from "Challenges" and "Future Work"
✓ Cross-referenced with methodology sections
✓ Provided citations with page numbers

Configuration Tips:
- Context Threshold: 0.6 (force RAG for large papers)
- Retrieval Limit: 10-15 (capture diverse viewpoints)
- Model: gte-large (good balance for academic content)
```

## 🔧 Advanced Configuration Guide

### Understanding Context Usage Threshold

The threshold determines when to switch from full-text injection to RAG retrieval:

```
Available Context = Remaining Context × Threshold

If (File Tokens + Prompt Tokens) > Available Context:
    → Use RAG Retrieval (precise mode)
Else:
    → Use Full-Text Injection (comprehensive mode)
```

**When to adjust:**

| Threshold | Behavior | Use Case |
|-----------|----------|----------|
| **0.3-0.5** | Forces RAG more often | Large documents, memory constraints |
| **0.6-0.7** | Balanced (default) | General use |
| **0.8-0.9** | Allows more full injection | Small documents, need full context |

### Optimizing Retrieval Affinity Threshold

Different content types require different similarity thresholds:

| Content Type | Recommended Threshold | Reason |
|--------------|---------------------|---------|
| **Natural language text** | 0.5-0.7 | Clear semantic matching |
| **Technical documentation** | 0.4-0.6 | Technical terms vary |
| **Code/SQL** | 0.3-0.4 | Syntax-heavy, lower semantic similarity |
| **Mixed language** | 0.4-0.5 | Account for language switching |

### Multilingual Configuration

The plugin automatically detects your system language and sets the UI accordingly:

- **Windows**: Uses Intl API to detect locale
- **Linux/macOS**: Checks `LANG`, `LANGUAGE`, `LC_ALL` environment variables
- **Manual Override**: Change "Message Language" in plugin settings

**Supported Languages:**
- 🇬🇧 English (en)
- 🇹🇼 繁體中文 (zh-TW)
- 🇯🇵 日本語 (ja)

📖 **For developers**: See [I18N.md](./docs/I18N.md) for technical details on the internationalization system, adding new languages, and translation guidelines. Also available in [繁體中文](./docs/I18N.zh-TW.md) and [日本語](./docs/I18N.ja.md).

### Developer Mode: Debug Logging

Enable debug logging for troubleshooting or development:

1. Open LM Studio → Plugins → RAG-Flex settings
2. Enable "Enable Debug Logging"
3. (Optional) Set custom "Debug Log Path"
4. Logs will include:
   - System locale detection
   - Model loading events
   - File processing steps
   - Retrieval results
   - Error stack traces

**Default log location**: `./logs/lmstudio-debug.log`

## 🐛 Troubleshooting

### Common Issues

#### "❌ Embedding model not found"

**Cause**: Selected model not downloaded in LM Studio

**Solution**:
1. Open LM Studio → **Search** (🔍)
2. Search for the model name (e.g., `bge-m3`)
3. Click **Download**
4. Wait for download to complete
5. Restart the chat or reload the plugin

**Alternative**: Select a different model in plugin settings

---

#### "No relevant citations found (threshold: 0.4)"

**Cause**: Retrieval affinity threshold too high for your content

**Solutions**:
- **For code/SQL files**: Lower threshold to 0.3-0.4
- **For mixed-language documents**: Try 0.4-0.5
- **For technical jargon**: Lower to 0.35-0.45

**How to adjust**: LM Studio → Plugins → RAG-Flex → Retrieval Affinity Threshold

---

#### File processing too slow

**Cause**: Large file with high-precision embedding model

**Solutions**:
1. **Switch to faster model**:
   - Use `nomic-embed-text-v1.5` instead of `bge-m3`
   - 10-20x faster for English content
2. **Lower retrieval limit**:
   - Reduce from 5 to 3 chunks
   - Faster processing, less context
3. **Split large files**:
   - Break >5MB files into chapters/sections

---

#### Runtime messages in wrong language

**Cause**: System locale auto-detection doesn't match your preference

**Solution**:
1. Open plugin settings
2. Manually select "Message Language"
3. Choose: English (en) / 繁體中文 (zh-TW) / 日本語 (ja)

**Note**: This only changes plugin runtime messages (errors, status updates). LM Studio's UI language is controlled by LM Studio itself.

---

#### Debug logs not being created

**Possible causes**:
- Debug logging not enabled in settings
- Insufficient file write permissions
- Invalid log path

**Solutions**:
1. Enable "Enable Debug Logging" in plugin settings
2. Check log path exists and is writable
3. Try default path: `./logs/lmstudio-debug.log`
4. On Windows, ensure path uses `\\` or `/`

---

**💡 Pro Tip**: All error messages are AI-friendly - paste them directly into your LLM chat for automated troubleshooting!

## 📦 Supported File Formats

| Format | Extension | Processing Method | Notes |
|--------|-----------|-------------------|-------|
| PDF | `.pdf` | Text extraction | Supports text-based PDFs (not scanned images) |
| Word Documents | `.docx` | Full document parsing | Preserves structure and formatting |
| Plain Text | `.txt` | Direct read | UTF-8 encoding recommended |
| Markdown | `.md` | Markdown parsing | Maintains heading structure |

**Not supported**: Images, audio, video, Excel spreadsheets, scanned PDFs without OCR

## 🆚 Improvements Over RAG-v1

| Feature | RAG-v1 | RAG-Flex (v1.1) |
|---------|--------|----------|
| **Embedding Models** | ❌ Hardcoded (nomic only) | ✅ 4 selectable + auto-detection |
| **Multilingual Support** | ❌ English only | ✅ English, 繁體中文, 日本語 |
| **Error Messages** | ❌ Technical English | ✅ User-friendly, localized |
| **Context Management** | ⚙️ Basic threshold | ✅ Smart threshold-based strategy |
| **Affinity Threshold** | ❌ Fixed at 0.5 | ✅ Configurable (0.0-1.0) |
| **No-result Handling** | ❌ Exposes system prompt | ✅ Graceful degradation |
| **Model Detection** | ❌ Manual configuration | ✅ Auto-detects local models |
| **Debug Tools** | ❌ None | ✅ Optional debug logging |
| **Configuration UI** | ⚙️ English only | ✅ Multilingual (system language) |

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Reporting Issues
- Use GitHub Issues for bug reports
- Include debug logs (enable debug logging first)
- Provide file type, size, and configuration used

### Submitting Code
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow existing code style (TypeScript with proper types)
4. Test with multiple embedding models
5. Update documentation if needed
6. Commit changes (`git commit -m 'Add amazing feature'`)
7. Push to branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Adding Translations
To add a new language:
1. Add language code to `src/locales/types.ts`
2. Create translation file: `src/locales/[lang].ts`
3. Update `src/locales/index.ts`
4. Update `src/config.ts` language options
5. Create `README.[lang].md`

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

This means you can:
- ✅ Use commercially
- ✅ Modify and distribute
- ✅ Use privately
- ✅ Sublicense

Requirements:
- ⚖️ Include original license and copyright notice

## 🙏 Acknowledgments

- **LM Studio Team** - For the excellent SDK and plugin ecosystem
- **Original RAG-v1 Plugin** - Inspiration and foundation
- **Embedding Model Authors**:
  - [Nomic AI](https://www.nomic.ai/) - nomic-embed-text-v1.5
  - [Sentence Transformers](https://www.sbert.net/) - all-MiniLM-L12-v2
  - [Groonga](https://groonga.org/) - gte-large
  - [Beijing Academy of Artificial Intelligence](https://github.com/FlagOpen/FlagEmbedding) - BGE-M3
- **Hugging Face Community** - For model hosting and distribution
- **All Contributors** - Thank you for your improvements and feedback!

## 📧 Contact & Links

**Author**: Henry Chen
**GitHub**: [@henrychen95](https://github.com/henrychen95)
**Repository**: [rag-flex](https://github.com/henrychen95/rag-flex)
**LM Studio Plugin Page**: [lmstudio.ai/yongwei/rag-flex](https://lmstudio.ai/yongwei/rag-flex)

### Community
- 🐛 **Report Bugs**: [GitHub Issues](https://github.com/henrychen95/rag-flex/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/henrychen95/rag-flex/discussions)
- 📖 **Documentation**: [Wiki](https://github.com/henrychen95/rag-flex/wiki)

---

**⭐ If RAG-Flex helps your workflow, please star the repository!**

Made with ❤️ for the LM Studio community
