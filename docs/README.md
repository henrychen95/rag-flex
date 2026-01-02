# Developer Documentation

This directory contains technical documentation for RAG-Flex plugin developers.

## 📚 Documentation Files

### [I18N.md](./I18N.md) | [繁體中文](./I18N.zh-TW.md) | [日本語](./I18N.ja.md)
**Internationalization System Guide**

Comprehensive guide to the RAG-Flex internationalization (i18n) system (available in English, Traditional Chinese, and Japanese):
- How the language detection system works
- Supported languages and locale codes
- Step-by-step guide for adding new languages
- Translation file structure and guidelines
- Testing and validation procedures

**Read this if you want to:**
- Understand how multilingual support works
- Add support for a new language
- Modify or fix existing translations
- Contribute to the i18n system

---

### [I18N_IMPLEMENTATION.md](./I18N_IMPLEMENTATION.md)
**Implementation Details**

Technical implementation notes and design decisions:
- Architecture overview
- Code structure and module relationships
- Implementation patterns and best practices
- Known limitations and future improvements

**Read this if you want to:**
- Understand the internal implementation
- Make architectural changes to the i18n system
- Debug complex translation issues

---

### [CHANGELOG_I18N.md](./CHANGELOG_I18N.md)
**Internationalization Changelog**

Version history of i18n system changes:
- New language additions
- Translation updates
- Bug fixes and improvements
- Breaking changes

**Read this if you want to:**
- Track i18n feature history
- Understand what changed between versions
- Plan migration for breaking changes

---

### [SUMMARY.md](./SUMMARY.md)
**Project Summary**

High-level overview of the project:
- Key features and capabilities
- Architecture summary
- Development workflow

---

## 🔗 Related Documentation

- **[src/locales/README.md](../src/locales/README.md)**: Translation file developer guide
- **[CLAUDE.md](../CLAUDE.md)**: Claude Code development guide
- **[README.md](../README.md)**: User-facing documentation (root)

## 🌍 Multilingual Versions

The main README is available in multiple languages:
- [English](../README.md)
- [繁體中文](../README.zh-TW.md)
- [日本語](../README.ja.md)

## 📝 Contributing

When adding new documentation:

1. **Place files in this directory** if they are:
   - Technical implementation details
   - Developer-focused guides
   - Architecture documentation
   - Changelogs for specific subsystems

2. **Update this README** to include:
   - File name and link
   - Brief description
   - Who should read it

3. **Use clear naming**:
   - Use descriptive names (e.g., `AUTHENTICATION.md`, not `AUTH.md`)
   - Use uppercase for top-level docs (e.g., `I18N.md`)
   - Use hyphens for multi-word names (e.g., `API-DESIGN.md`)

4. **Link from main README** when appropriate:
   - User-facing features should link from main README
   - Internal implementation details can stay here

## 📧 Questions?

For questions about:
- **User features**: See main [README.md](../README.md)
- **Translation**: See [src/locales/README.md](../src/locales/README.md)
- **Development**: See [CLAUDE.md](../CLAUDE.md)
- **I18N system**: See [I18N.md](./I18N.md)
