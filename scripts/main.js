document.addEventListener('DOMContentLoaded', function() {
    // 初始化语言设置
    updatePageLanguage();
    updateLanguageButtons();

    // 添加语言按钮激活状态更新
    function updateLanguageButtons() {
        const currentLang = getCurrentLang();
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === currentLang);
        });
    }

    // 监听语言切换按钮点击
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            updateLanguageButtons();
        });
    });

    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const imageContainer = document.getElementById('imageContainer');
    const audioContainer = document.getElementById('audioContainer');
    const imageThumbnailList = document.getElementById('imageThumbnailList');
    const audioList = document.getElementById('audioList');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const imageSettings = document.getElementById('imageSettings');
    const audioSettings = document.getElementById('audioSettings');
    const startCompressBtn = document.getElementById('startCompress');
    const clearImageListBtn = document.getElementById('clearImageList');
    const clearAudioListBtn = document.getElementById('clearAudioList');
    const exportAllImagesBtn = document.getElementById('exportAllImages');
    const exportAllAudiosBtn = document.getElementById('exportAllAudios');
    const customQualityContainer = document.querySelector('.custom-quality');
    const customQualityInput = document.getElementById('customQuality');
    const startAudioCompressBtn = document.getElementById('startAudioCompress');
    let currentTab = 'image';
    let imageFiles = {
        original: [],
        compressed: new Map(),
        totalOriginalSize: 0,
        totalCompressedSize: 0
    };
    let audioFiles = {
        original: [],
        compressed: new Map(),
        totalOriginalSize: 0,
        totalCompressedSize: 0
    };

    // 全局音频播放器
    let currentAudio = null;
    let currentPlayBtn = null;

    // 标签切换
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTab = btn.dataset.tab;
            
            if (currentTab === 'image') {
                imageSettings.style.display = 'block';
                audioSettings.style.display = 'none';
                imageContainer.style.display = 'block';
                audioContainer.style.display = 'none';
            } else {
                imageSettings.style.display = 'none';
                audioSettings.style.display = 'block';
                imageContainer.style.display = 'none';
                audioContainer.style.display = 'block';
            }
        });
    });

    // 拖放上传
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--primary-color)';
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border-color)';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border-color)';
        handleFiles(e.dataTransfer.files);
    });

    // 点击上传
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // 监听质量选择变化
    document.querySelectorAll('input[name="quality"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                customQualityContainer.style.display = 'block';
            } else {
                customQualityContainer.style.display = 'none';
            }
            // 如果有文件，启用压缩按钮
            if (imageFiles.original.length > 0 || audioFiles.original.length > 0) {
                startCompressBtn.disabled = false;
            }
        });
    });

    // 限制自定义质量输入范围
    customQualityInput.addEventListener('input', (e) => {
        let value = parseInt(e.target.value);
        if (value > 100) e.target.value = 100;
        if (value < 1) e.target.value = 1;
        // 如果有文件，启用压缩按钮
        if (imageFiles.original.length > 0 || audioFiles.original.length > 0) {
            startCompressBtn.disabled = false;
        }
    });

    function handleFiles(files) {
        Array.from(files).forEach(file => {
            if (currentTab === 'image' && file.type.startsWith('image/')) {
                addImageFile(file);
            } else if (currentTab === 'audio' && file.type.startsWith('audio/')) {
                addAudioFile(file);
            }
        });
    }

    function addImageFile(file) {
        const thumbnailItem = createThumbnail(file);
        imageFiles.totalOriginalSize += file.size;
        updateImageInfo();
        const fileInfo = {
            file: file,
            thumbnail: thumbnailItem,
        };
        imageFiles.original.push(fileInfo);
        startCompressBtn.disabled = false;
    }

    function addAudioFile(file) {
        // 检查文件是否已存在
        const isDuplicate = audioFiles.original.some(item => {
            return item.file.name === file.name && 
                   item.file.size === file.size &&
                   item.file.lastModified === file.lastModified;
        });

        // 如果文件已存在，直接返回
        if (isDuplicate) {
            return;
        }

        const audioItem = createAudioItem(file);
        audioFiles.totalOriginalSize += file.size;
        updateAudioInfo();
        const fileInfo = {
            file: file,
            element: audioItem,
        };
        audioFiles.original.push(fileInfo);
        startAudioCompressBtn.disabled = false;
    }

    function createThumbnail(file) {
        const thumbnailItem = document.createElement('div');
        thumbnailItem.className = 'thumbnail-item';
        thumbnailItem.innerHTML = `
            <div class="thumbnail-placeholder" data-i18n="loading">${getText('loading')}</div>
            <div class="thumbnail-status" data-i18n="waitingProcess">${getText('waitingProcess')}</div>
            <button class="remove-thumbnail" title="${getText('clearList')}">×</button>
        `;

        // 创建缩略图
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            thumbnailItem.querySelector('.thumbnail-placeholder').remove();
            thumbnailItem.insertBefore(img, thumbnailItem.firstChild);
        };
        reader.readAsDataURL(file);

        // 添加删除按钮事件
        const removeBtn = thumbnailItem.querySelector('.remove-thumbnail');
        removeBtn.onclick = (e) => {
            e.stopPropagation();
            const index = imageFiles.original.findIndex(item => item.file === file);
            if (index !== -1) {
                // 更新总文件大小
                imageFiles.totalOriginalSize -= imageFiles.original[index].file.size;
                // 如果该文件已经被压缩过，也要更新压缩后的总大小
                if (imageFiles.compressed.has(imageFiles.original[index].file.name)) {
                    const compressedFile = imageFiles.compressed.get(imageFiles.original[index].file.name);
                    imageFiles.totalCompressedSize -= compressedFile.size;
                    imageFiles.compressed.delete(imageFiles.original[index].file.name);
                }
                updateImageInfo();

                imageFiles.original.splice(index, 1);
                thumbnailItem.remove();
                
                if (imageFiles.original.length === 0) {
                    startCompressBtn.disabled = true;
                    exportAllImagesBtn.disabled = true;
                }
            }
        };

        imageThumbnailList.appendChild(thumbnailItem);
        return thumbnailItem;
    }

    function createAudioItem(file) {
        const audioItem = document.createElement('div');
        audioItem.className = 'audio-item';
        
        // 创建音频项的HTML结构
        audioItem.innerHTML = `
            <button class="remove-audio" title="${getText('clearList')}">
                <svg width="12" height="12" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                </svg>
            </button>
            <div class="audio-info">
                <div class="audio-name">${file.name}</div>
                <div class="audio-status" data-i18n="waitingProcess">${getText('waitingProcess')}</div>
                <div class="audio-size">
                    <div class="size-info">
                        <span class="size-label" data-i18n="originalSize">${getText('originalSize')}</span>
                        <span>${formatFileSize(file.size)}</span>
                    </div>
                    <div class="compressed-size"></div>
                </div>
            </div>
            <button class="play-audio" title="${getText('playPreview')}">
                <svg width="16" height="16" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M8 5v14l11-7z"/>
                </svg>
            </button>
        `;

        // 添加删除按钮事件
        const removeBtn = audioItem.querySelector('.remove-audio');
        removeBtn.onclick = (e) => {
            e.stopPropagation();
            const index = audioFiles.original.findIndex(item => item.file === file);
            if (index !== -1) {
                // 更新总文件大小
                audioFiles.totalOriginalSize -= audioFiles.original[index].file.size;
                // 如果该文件已经被压缩过，也要更新压缩后的总大小
                if (audioFiles.compressed.has(audioFiles.original[index].file.name)) {
                    const compressedFile = audioFiles.compressed.get(audioFiles.original[index].file.name);
                    audioFiles.totalCompressedSize -= compressedFile.size;
                    audioFiles.compressed.delete(audioFiles.original[index].file.name);
                }
                updateAudioInfo();

                audioFiles.original.splice(index, 1);
                audioItem.remove();
                
                if (audioFiles.original.length === 0) {
                    startCompressBtn.disabled = true;
                    exportAllAudiosBtn.disabled = true;
                }
            }
        };

        // 添加音频预览功能
        const playBtn = audioItem.querySelector('.play-audio');
        let audio = null;

        playBtn.onclick = () => {
            // 如果有其他音频在播放，先停止它
            if (currentAudio && currentAudio !== audio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
                if (currentPlayBtn) {
                    currentPlayBtn.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M8 5v14l11-7z"/>
                        </svg>
                    `;
                }
            }

            if (!audio) {
                audio = new Audio(URL.createObjectURL(file));
                // 音频播放结束时重置按钮状态
                audio.onended = () => {
                    playBtn.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M8 5v14l11-7z"/>
                        </svg>
                    `;
                    currentAudio = null;
                    currentPlayBtn = null;
                };
            }

            if (audio.paused) {
                audio.play();
                currentAudio = audio;
                currentPlayBtn = playBtn;
                playBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                `;
            } else {
                audio.pause();
                currentAudio = null;
                currentPlayBtn = null;
                playBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M8 5v14l11-7z"/>
                    </svg>
                `;
            }
        };

        audioList.appendChild(audioItem);
        return audioItem;
    }

    // 更新压缩信息显示
    function updateImageInfo() {
        const originalSizeEl = document.getElementById('imageOriginalSize');
        const compressedSizeEl = document.getElementById('imageCompressedSize');
        const compressionRatioEl = document.getElementById('imageCompressionRatio');

        originalSizeEl.textContent = formatFileSize(imageFiles.totalOriginalSize);
        compressedSizeEl.textContent = formatFileSize(imageFiles.totalCompressedSize);
        
        const ratio = imageFiles.totalOriginalSize > 0 
            ? Math.round((1 - imageFiles.totalCompressedSize / imageFiles.totalOriginalSize) * 100) 
            : 0;
        compressionRatioEl.textContent = `${ratio}%`;
    }

    function updateAudioInfo() {
        const originalSizeEl = document.getElementById('audioOriginalSize');
        const compressedSizeEl = document.getElementById('audioCompressedSize');
        const compressionRatioEl = document.getElementById('audioCompressionRatio');

        originalSizeEl.textContent = formatFileSize(audioFiles.totalOriginalSize);
        compressedSizeEl.textContent = formatFileSize(audioFiles.totalCompressedSize);
        
        const ratio = audioFiles.totalOriginalSize > 0 
            ? Math.round((1 - audioFiles.totalCompressedSize / audioFiles.totalOriginalSize) * 100) 
            : 0;
        compressionRatioEl.textContent = `${ratio}%`;
    }

    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 KB';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 处理图片文件
    async function processImage(fileInfo) {
        const thumbnailItem = fileInfo.thumbnail;
        const file = fileInfo.file;
        let quality;
        const selectedQuality = document.querySelector('input[name="quality"]:checked').value;
        if (selectedQuality === 'custom') {
            quality = parseInt(customQualityInput.value) / 100;
        } else {
            quality = parseFloat(selectedQuality);
        }

        try {
            // 根据文件大小动态设置目标大小
            const initialSize = file.size / 1024 / 1024; // 转换为MB
            let targetSize;

            if (quality >= 0.8) { // 高质量
                targetSize = initialSize * 0.8;
            } else if (quality >= 0.6) { // 中等质量
                targetSize = initialSize * 0.5;
            } else if (quality >= 0.4) { // 低质量
                targetSize = initialSize * 0.3;
            } else { // 自定义质量
                targetSize = initialSize * quality;
            }

            const options = {
                maxSizeMB: targetSize,
                maxWidthOrHeight: 4096, // 增加最大宽高限制
                useWebWorker: true,
                quality: quality,
                // 添加更多压缩选项
                initialQuality: quality,
                alwaysKeepResolution: true, // 尽量保持分辨率
                fileType: 'image/jpeg', // 强制转换为jpg格式以获得更好的压缩效果
                onProgress: (progress) => {
                    // 可以在这里更新压缩进度
                    if (thumbnailItem) {
                        thumbnailItem.querySelector('.thumbnail-status').textContent = 
                            `压缩中 ${Math.round(progress * 100)}%`;
                    }
                }
            };

            const compressedFile = await imageCompression(file, options);
            imageFiles.totalCompressedSize += compressedFile.size;
            updateImageInfo();

            if (thumbnailItem) {
                thumbnailItem.style.opacity = '0.7';
                thumbnailItem.style.border = '2px solid var(--primary-color)';
                thumbnailItem.querySelector('.thumbnail-status').textContent = '压缩完成';
                imageFiles.compressed.set(file.name, compressedFile);
                exportAllImagesBtn.disabled = false;
                
                // 添加下载按钮
                const downloadBtn = document.createElement('button');
                downloadBtn.className = 'download-button';
                downloadBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                    </svg>
                `;
                downloadBtn.onclick = (e) => {
                    e.stopPropagation();
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(compressedFile);
                    link.download = `compressed-${file.name}`;
                    link.click();
                };
                thumbnailItem.appendChild(downloadBtn);
            }

        } catch (error) {
            console.error('压缩失败:', error);
            if (thumbnailItem) {
                thumbnailItem.style.border = '2px solid red';
                thumbnailItem.querySelector('.thumbnail-status').textContent = '压缩失败';
                thumbnailItem.querySelector('.thumbnail-status').style.color = 'red';
            }
        }
    }

    async function processAudio(fileInfo) {
        const audioItem = fileInfo.element;
        const originalFile = fileInfo.file;
        const statusEl = audioItem.querySelector('.audio-status');
    
        try {
            statusEl.textContent = getText('compressing');
            
            // 读取音频文件
            const arrayBuffer = await originalFile.arrayBuffer();
            const audioContext = new AudioContext();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            // 获取选择的比特率
            const targetBitrate = parseInt(document.getElementById('audioBitrate').value);
            
            // 准备压缩
            const channels = audioBuffer.numberOfChannels;
            // 降低采样率，但不低于22050Hz
            const targetSampleRate = Math.min(44100, Math.max(22050, audioBuffer.sampleRate));
            
            let samples;
            if (channels === 1) {
                samples = audioBuffer.getChannelData(0);
            } else {
                // 将多声道混合为单声道
                samples = new Float32Array(audioBuffer.length);
                for (let i = 0; i < audioBuffer.length; i++) {
                    let sum = 0;
                    for (let channel = 0; channel < channels; channel++) {
                        sum += audioBuffer.getChannelData(channel)[i];
                    }
                    samples[i] = sum / channels;
                }
            }
            
            // 重采样
            if (targetSampleRate !== audioBuffer.sampleRate) {
                const ratio = targetSampleRate / audioBuffer.sampleRate;
                const newLength = Math.round(samples.length * ratio);
                const resampled = new Float32Array(newLength);
                
                for (let i = 0; i < newLength; i++) {
                    const oldIndex = Math.floor(i / ratio);
                    resampled[i] = samples[oldIndex];
                }
                
                samples = resampled;
            }
            
            // 创建 MP3 编码器
            const mp3encoder = new lamejs.Mp3Encoder(1, targetSampleRate, targetBitrate);
            const mp3Data = [];
    
            // 转换为整数样本
            const sampleBlockSize = 1152; // 每个 MP3 帧的样本数
            const numSamples = samples.length;
            
            for (let i = 0; i < numSamples; i += sampleBlockSize) {
                const sampleChunk = new Int16Array(sampleBlockSize);
                
                for (let j = 0; j < sampleBlockSize && (i + j) < numSamples; j++) {
                    // 将 Float32 转换为 Int16
                    sampleChunk[j] = Math.max(-32768, Math.min(32767, samples[i + j] * 32768));
                }
                
                const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
                
                if (mp3buf.length > 0) {
                    mp3Data.push(mp3buf);
                }
            }
    
            // 完成编码
            const mp3buf = mp3encoder.flush();
            if (mp3buf.length > 0) {
                mp3Data.push(mp3buf);
            }
    
            // 创建压缩后的文件
            const blob = new Blob(mp3Data, { type: 'audio/mp3' });
            const compressedFile = new File([blob], 'compressed-' + originalFile.name.replace(/\.[^/.]+$/, '.mp3'), { type: 'audio/mp3' });
    
            // 更新状态
            audioFiles.totalCompressedSize += compressedFile.size;
            updateAudioInfo();
            audioFiles.compressed.set(originalFile.name, compressedFile);
    
            // 更新UI
            statusEl.textContent = getText('compressed');
            statusEl.style.color = 'var(--primary-color)';
    
            // 显示压缩后的大小和压缩率
            const compressedSizeEl = audioItem.querySelector('.compressed-size');
            // 计算压缩率
            const ratio = Math.round((1 - compressedFile.size / originalFile.size) * 100);
            compressedSizeEl.innerHTML = `
                <div class="size-info">
                    <span class="size-label">${getText('compressedSize')}</span>
                    <span>${formatFileSize(compressedFile.size)}</span>
                </div>
                <div class="size-info">
                    <span class="size-label">${getText('compressionRatio')}</span>
                    <span>${ratio}%</span>
                </div>
            `;
            
            // 添加下载按钮
            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'download-button';
            downloadBtn.title = '下载';
            downloadBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                </svg>
            `;
            downloadBtn.onclick = (e) => {
                e.stopPropagation();
                const link = document.createElement('a');
                link.href = URL.createObjectURL(compressedFile);
                link.download = `compressed-${originalFile.name}`;
                link.click();
            };
    
            // 将下载按钮添加到音频项中
            audioItem.appendChild(downloadBtn);
            
            fileInfo.compressionFailed = false;
            
        } catch (error) {
            console.error('音频压缩失败:', error);
            statusEl.textContent = getText('compressionFailed');
            statusEl.style.color = 'red';
            fileInfo.compressionFailed = true;
            // 压缩失败时使用原始文件
            audioFiles.compressed.set(originalFile.name, originalFile);
            
            // 显示原始文件大小
            const compressedSizeEl = audioItem.querySelector('.compressed-size');
            compressedSizeEl.innerHTML = `
                <div class="size-info">
                    <span class="size-label">${getText('useOriginal')}</span>
                    <span>${formatFileSize(originalFile.size)}</span>
                </div>
                <div class="size-info">
                    <span class="size-label">${getText('status')}</span>
                    <span>${getText('compressionFailed')}</span>
                </div>
            `;
            
            // 添加下载按钮（使用原始文件）
            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'download-button';
            downloadBtn.title = '下载原文件';
            downloadBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                </svg>
            `;
            downloadBtn.onclick = (e) => {
                e.stopPropagation();
                const link = document.createElement('a');
                link.href = URL.createObjectURL(originalFile);
                link.download = originalFile.name;
                link.click();
            };
            audioItem.appendChild(downloadBtn);
        }
    }

    // 开始压缩按钮点击事件
    startCompressBtn.addEventListener('click', async () => {
        startCompressBtn.disabled = true;
        imageFiles.totalCompressedSize = 0;
        imageFiles.compressed.clear();
        
        // 复制原始文件列表进行压缩
        let filesToProcess = [...imageFiles.original];
        
        for (const fileInfo of filesToProcess) {
            await processImage(fileInfo);
        }
    });

    // 开始音频压缩按钮点击事件
    startAudioCompressBtn.addEventListener('click', async () => {
        startAudioCompressBtn.disabled = true;
        exportAllAudiosBtn.disabled = true;
        audioFiles.totalCompressedSize = 0;
        audioFiles.compressed.clear();
        
        // 重置总体压缩信息
        const audioCompressedSizeEl = document.getElementById('audioCompressedSize');
        const audioCompressionRatioEl = document.getElementById('audioCompressionRatio');
        audioCompressedSizeEl.textContent = '0 KB';
        audioCompressionRatioEl.textContent = '0%';
        
        // 重置所有文件的压缩状态
        audioFiles.original.forEach(fileInfo => {
            fileInfo.compressionFailed = false;
        });
        
        // 移除所有现有的下载按钮
        document.querySelectorAll('.audio-item .download-button').forEach(btn => btn.remove());
        
        // 重置所有压缩状态和大小显示
        document.querySelectorAll('.audio-item').forEach(item => {
            const statusEl = item.querySelector('.audio-status');
            const compressedSizeEl = item.querySelector('.compressed-size');
            statusEl.textContent = '等待处理';
            statusEl.style.color = '#666';
            compressedSizeEl.textContent = '';
            // 移除可能存在的压缩率信息
            item.querySelector('.audio-size').lastElementChild.textContent = '';
        });
        
        for (const fileInfo of audioFiles.original) {
            await processAudio(fileInfo);
        }
        
        startAudioCompressBtn.disabled = false;
        
        // 所有文件处理完成后启用导出按钮
        exportAllAudiosBtn.disabled = audioFiles.compressed.size === 0;
    });

    // 导出所有压缩图片
    exportAllImagesBtn.addEventListener('click', () => {
        if (imageFiles.compressed.size === 0 && audioFiles.compressed.size === 0) return;

        // 如果只有一个文件，直接下载
        if (imageFiles.compressed.size === 1 && audioFiles.compressed.size === 0) {
            const [fileName, file] = Array.from(imageFiles.compressed)[0];
            const link = document.createElement('a');
            link.href = URL.createObjectURL(file);
            link.download = `compressed-${fileName}`;
            link.click();
            return;
        }

        // 如果有多个文件，创建zip
        const zip = new JSZip();
        
        imageFiles.compressed.forEach((file, fileName) => {
            zip.file(`compressed-${fileName}`, file);
        });

        audioFiles.compressed.forEach((file, fileName) => {
            zip.file(`compressed-${fileName}`, file);
        });

        zip.generateAsync({type: "blob"}).then(function(content) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = "compressed-images.zip";
            link.click();
        });
    });

    // 导出所有音频文件
    exportAllAudiosBtn.addEventListener('click', () => {
        if (audioFiles.compressed.size === 0) return;

        // 如果只有一个文件，直接下载
        if (audioFiles.compressed.size === 1) {
            const [fileName, file] = Array.from(audioFiles.compressed)[0];
            const link = document.createElement('a');
            link.href = URL.createObjectURL(file);
            link.download = `compressed-${fileName}`;
            link.click();
            return;
        }

        // 如果有多个文件，创建zip
        const zip = new JSZip();
        
        audioFiles.compressed.forEach((file, fileName) => {
            zip.file(`compressed-${fileName}`, file);
        });

        zip.generateAsync({type: "blob"}).then(function(content) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = "compressed-audios.zip";
            link.click();
        });
    });

    // 清空列表按钮点击事件
    clearImageListBtn.addEventListener('click', () => {
        imageThumbnailList.innerHTML = '';
        imageFiles.original = [];
        imageFiles.compressed.clear();
        imageFiles.totalOriginalSize = 0;
        imageFiles.totalCompressedSize = 0;
        updateImageInfo();
        startCompressBtn.disabled = true;
        exportAllImagesBtn.disabled = true;
    });

    // 清空音频列表按钮点击事件
    clearAudioListBtn.addEventListener('click', () => {
        // 停止当前播放的音频
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;
            currentPlayBtn = null;
        }
        audioList.innerHTML = '';
        audioFiles.original = [];
        audioFiles.compressed.clear();
        audioFiles.totalOriginalSize = 0;
        audioFiles.totalCompressedSize = 0;
        updateAudioInfo();
        startAudioCompressBtn.disabled = true;
        exportAllAudiosBtn.disabled = true;
    });

    // 初始状态下禁用开始压缩按钮
    startCompressBtn.disabled = true;
    startAudioCompressBtn.disabled = true;
    exportAllImagesBtn.disabled = true;
    exportAllAudiosBtn.disabled = true;

    // 语言切换功能
    const langSelector = document.getElementById('langSelector');
    const langDropdown = document.getElementById('langDropdown');
    
    // 切换下拉菜单
    langSelector.addEventListener('click', (e) => {
        e.stopPropagation();
        langSelector.classList.toggle('active');
        langDropdown.classList.toggle('show');
    });
    
    // 点击其他地方关闭下拉菜单
    document.addEventListener('click', () => {
        langSelector.classList.remove('active');
        langDropdown.classList.remove('show');
    });
    
    // 语言选择
    document.querySelectorAll('.lang-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const lang = option.dataset.lang;
            setLanguage(lang);
            langSelector.classList.remove('active');
            langDropdown.classList.remove('show');
        });
    });
    
    // 初始化语言UI
    updateLanguageUI();
}); 