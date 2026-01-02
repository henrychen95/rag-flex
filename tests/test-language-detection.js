/**
 * Test script for language detection across different platforms
 * Run with: node test-language-detection.js
 */

function detectSystemLanguage() {
    console.log("=== Language Detection Test ===\n");

    // Test 1: Intl API
    console.log("1. Testing Intl API:");
    try {
        const systemLocale = Intl.DateTimeFormat().resolvedOptions().locale;
        console.log(`   System Locale: ${systemLocale}`);

        // Check various Chinese variants
        const checks = {
            "zh-TW": systemLocale.startsWith("zh-TW"),
            "zh-Hant": systemLocale.startsWith("zh-Hant"),
            "zh_TW": systemLocale.startsWith("zh_TW"),
            "zh-HK": systemLocale.startsWith("zh-HK"),
            "zh-MO": systemLocale.startsWith("zh-MO"),
            "zh-CN": systemLocale.startsWith("zh-CN"),
            "zh-Hans": systemLocale.startsWith("zh-Hans"),
            "zh_CN": systemLocale.startsWith("zh_CN"),
            "zh-SG": systemLocale.startsWith("zh-SG"),
            "zh": systemLocale.startsWith("zh")
        };

        console.log("   Matches:");
        for (const [variant, matches] of Object.entries(checks)) {
            if (matches) {
                console.log(`   ✓ ${variant}`);
            }
        }

        // Determine result
        if (systemLocale.startsWith("zh-TW") ||
            systemLocale.startsWith("zh-Hant") ||
            systemLocale.startsWith("zh_TW") ||
            systemLocale.startsWith("zh-HK") ||
            systemLocale.startsWith("zh-MO")) {
            console.log("   → Result: zh-TW (Traditional Chinese)\n");
        } else if (systemLocale.startsWith("zh-CN") ||
                   systemLocale.startsWith("zh-Hans") ||
                   systemLocale.startsWith("zh_CN") ||
                   systemLocale.startsWith("zh-SG") ||
                   systemLocale.startsWith("zh")) {
            console.log("   → Result: zh-TW (Simplified Chinese → Traditional for now)\n");
        } else {
            console.log("   → Result: en (English, default)\n");
        }
    } catch (e) {
        console.log(`   ✗ Error: ${e.message}\n`);
    }

    // Test 2: Environment Variables
    console.log("2. Testing Environment Variables:");
    const envLang = process.env.LANG || process.env.LANGUAGE || process.env.LC_ALL || "";
    console.log(`   LANG: ${process.env.LANG || "(not set)"}`);
    console.log(`   LANGUAGE: ${process.env.LANGUAGE || "(not set)"}`);
    console.log(`   LC_ALL: ${process.env.LC_ALL || "(not set)"}`);
    console.log(`   Combined: "${envLang}"`);

    if (envLang) {
        if (envLang.includes("zh_TW") || envLang.includes("zh-TW") || envLang.includes("zh_HK")) {
            console.log("   → Result: zh-TW (Traditional Chinese)\n");
        } else if (envLang.includes("zh_CN") || envLang.includes("zh-CN") || envLang.includes("zh")) {
            console.log("   → Result: zh-TW (Simplified → Traditional for now)\n");
        } else {
            console.log("   → Result: en (English)\n");
        }
    } else {
        console.log("   → Result: No environment variables set\n");
    }

    // Test 3: Platform Info
    console.log("3. Platform Information:");
    console.log(`   Platform: ${process.platform}`);
    console.log(`   Architecture: ${process.arch}`);
    console.log(`   Node Version: ${process.version}`);
    console.log(`   OS Type: ${require('os').type()}`);
    console.log(`   OS Release: ${require('os').release()}`);

    console.log("\n=== Test Complete ===");
}

// Run the test
detectSystemLanguage();

// Additional test: Try different locale formats
console.log("\n=== Testing Different Locale Formats ===");
const testLocales = [
    "zh-TW",
    "zh-Hant-TW",
    "zh_TW",
    "zh_TW.UTF-8",
    "zh-CN",
    "zh-Hans-CN",
    "zh_CN.UTF-8",
    "en-US",
    "en_US.UTF-8"
];

console.log("Testing locale string matching:");
testLocales.forEach(locale => {
    const isTW = locale.startsWith("zh-TW") ||
                 locale.startsWith("zh-Hant") ||
                 locale.startsWith("zh_TW") ||
                 locale.startsWith("zh-HK");
    const isCN = !isTW && (locale.startsWith("zh-CN") ||
                           locale.startsWith("zh-Hans") ||
                           locale.startsWith("zh_CN") ||
                           locale.startsWith("zh"));
    const result = isTW ? "zh-TW" : (isCN ? "zh-CN→zh-TW" : "en");
    console.log(`  ${locale.padEnd(20)} → ${result}`);
});
