// 首先定义翻译对象
const translations = {
    zh: {
        title: "压缩工具",
        imageTab: "图片压缩",
        audioTab: "音频压缩",
        dropText: "拖拽文件到这里 或 点击上传",
        originalSize: "原始大小：",
        compressedSize: "压缩后：",
        compressionRatio: "压缩率：",
        exportAll: "导出全部",
        clearList: "清空列表",
        imageSettings: "图片压缩设置",
        compressionQuality: "压缩质量：",
        highQuality: "高质量",
        mediumQuality: "中等质量",
        lowQuality: "低质量",
        custom: "自定义",
        qualityHint: "1-100之间的数值，数值越大质量越高",
        startCompression: "开始压缩",
        audioSettings: "音频压缩设置",
        supportedFormats: "支持的输入格式：",
        outputFormat: "输出格式：",
        bitrate: "压缩比特率：",
        bitrateOriginal: "原始音质",
        bitrateUltraHigh: "超高音质",
        bitrateHigh: "高音质",
        bitrateMediumHigh: "中高音质",
        bitrateStandard: "标准音质",
        bitrateMedium: "中等音质",
        bitrateLow: "低音质",
        bitrateUltraLow: "超低音质",
        bitrateLowest: "最低音质",
        waitingProcess: "等待处理",
        loading: "加载中...",
        compressing: "压缩中...",
        compressed: "压缩完成",
        compressionFailed: "压缩失败",
        useOriginal: "使用原文件：",
        status: "状态：",
        languageName: "中文",
        currentLang: "中文",
        autoLang: "跟随系统",
        playPreview: "播放预览"
    },
    en: {
        title: "Compressor",
        imageTab: "Image Compression",
        audioTab: "Audio Compression",
        dropText: "Drop files here or click to upload",
        originalSize: "Original Size: ",
        compressedSize: "Compressed: ",
        compressionRatio: "Ratio: ",
        exportAll: "Export All",
        clearList: "Clear List",
        imageSettings: "Image Compression Settings",
        compressionQuality: "Compression Quality:",
        highQuality: "High Quality",
        mediumQuality: "Medium Quality",
        lowQuality: "Low Quality",
        custom: "Custom",
        qualityHint: "Value between 1-100, higher value means better quality",
        startCompression: "Start Compression",
        audioSettings: "Audio Compression Settings",
        supportedFormats: "Supported Input Formats:",
        outputFormat: "Output Format:",
        bitrate: "Compression Bitrate:",
        bitrateOriginal: "Original Quality",
        bitrateUltraHigh: "Ultra High Quality",
        bitrateHigh: "High Quality",
        bitrateMediumHigh: "Medium High Quality",
        bitrateStandard: "Standard Quality",
        bitrateMedium: "Medium Quality",
        bitrateLow: "Low Quality",
        bitrateUltraLow: "Ultra Low Quality",
        bitrateLowest: "Lowest Quality",
        waitingProcess: "Waiting",
        loading: "Loading...",
        compressing: "Compressing...",
        compressed: "Compressed",
        compressionFailed: "Compression Failed",
        useOriginal: "Using Original File:",
        status: "Status:",
        languageName: "English",
        currentLang: "Language",
        autoLang: "Follow System",
        playPreview: "Play Preview"
    }
};

// 检测浏览器语言
function detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    const shortLang = browserLang.split('-')[0];
    return translations[shortLang] ? shortLang : 'en';
}

function getCurrentLang() {
    return localStorage.getItem('lang') || detectBrowserLanguage();
}

function setLanguage(lang) {
    localStorage.setItem('lang', lang);
    updatePageLanguage();
    updateLanguageUI();
}

function getText(key) {
    const currentLang = getCurrentLang();
    const displayLang = currentLang === 'auto' ? detectBrowserLanguage() : currentLang;
    return translations[displayLang][key] || translations['en'][key] || key;
}

function updatePageLanguage() {
    const currentLang = getCurrentLang();
    document.documentElement.lang = currentLang;
    
    // 更新所有带有 data-i18n 属性的元素
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (key) {
            if (element.tagName === 'INPUT' && element.type === 'button') {
                element.value = getText(key);
            } else {
                element.textContent = getText(key);
            }
        }
    });

    // 更新所有带有 data-i18n-attr 属性的元素
    document.querySelectorAll('[data-i18n-attr]').forEach(element => {
        const attrConfig = element.getAttribute('data-i18n-attr');
        const [attr, key] = attrConfig.split(':');
        if (attr && key) {
            element.setAttribute(attr, getText(key));
        }
    });

    // 更新标题（同时更新 title 标签和 document.title）
    document.title = getText('title');
}

function updateLanguageUI() {
    const currentLang = getCurrentLang();
    
    // 更新选择器显示
    const langText = document.querySelector('.lang-text');
    if (langText) {
        langText.textContent = translations[currentLang].languageName;
    }
    
    // 更新下拉菜单选中状态
    document.querySelectorAll('.lang-option').forEach(option => {
        option.classList.toggle('active', option.dataset.lang === currentLang);
    });
}

// 在 translations 对象中添加语言名称
translations.zh.languageName = '中文';
translations.en.languageName = 'English';
translations.zh.currentLang = '中文';
translations.en.currentLang = 'Language'; 