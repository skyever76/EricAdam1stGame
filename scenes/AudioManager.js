// AudioManager.js - 程序生成音效系统（单例模式）

export const AudioManager = {
    // 核心属性
    audioContext: null,
    masterGain: null,
    musicGain: null,
    isMuted: false,
    volume: 0.5,
    isInitialized: false,
    audioUnlocked: true, // 🆕 默认解锁音频
    
    // 背景音乐相关
    currentMusic: null,
    musicVolume: 0.3, // 背景音乐音量较低
    musicTimerId: null, // 背景音乐定时器ID
    
    // 音效参数配置
    soundConfigs: {
        shoot: {
            type: 'sawtooth',
            startFreq: 800,
            endFreq: 200,
            duration: 0.1,
            volume: 0.3
        },
        hit: {
            type: 'square',
            startFreq: 1200,
            endFreq: 600,
            duration: 0.05,
            volume: 0.4
        },
        explosion: {
            type: 'noise',
            startFreq: 2000,
            endFreq: 100,
            duration: 0.5,
            volume: 0.6
        },
        hurt: {
            type: 'triangle',
            startFreq: 200,
            endFreq: 100,
            duration: 0.3,
            volume: 0.5
        },
        powerup: {
            type: 'sine',
            startFreq: 440,
            endFreq: 880,
            duration: 0.2,
            volume: 0.4
        },
        gameOver: {
            type: 'chord',
            startFreq: 440,
            endFreq: 220,
            duration: 1.0,
            volume: 0.7
        }
    },
    
    // 初始化方法
    init() {
        if (this.isInitialized) return; // 防止重复初始化
        
        try {
            // 延迟创建AudioContext，等待用户交互
            this.audioContext = null;
            this.masterGain = null;
            this.musicGain = null;
            
            this.isInitialized = true;
            this.audioUnlocked = false; // 等待用户交互解锁
            
            console.log('🎵 AudioManager initialized, waiting for user interaction');
            
        } catch (error) {
            console.error('❌ AudioManager initialization failed:', error);
            this.isInitialized = false;
        }
    },
    
    // 在用户交互时创建AudioContext
    unlockAudio() {
        if (this.audioUnlocked || !this.isInitialized) return;
        
        try {
            console.log('🎵 Creating AudioContext after user interaction...');
            
            // 创建音频上下文
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // 创建主音量控制
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.volume;
            
            // 创建背景音乐音量控制
            this.musicGain = this.audioContext.createGain();
            this.musicGain.connect(this.audioContext.destination);
            this.musicGain.gain.value = this.musicVolume;
            
            this.audioUnlocked = true;
            console.log('🎵 AudioContext created successfully');
            
        } catch (error) {
            console.error('❌ Failed to create AudioContext:', error);
        }
    },
    
    // 检查音频上下文状态
    checkAudioContext() {
        if (!this.audioContext) return;
        
        if (this.audioContext.state === 'suspended') {
            console.log('🔇 Audio context suspended, attempting to resume');
            this.audioContext.resume().then(() => {
                console.log('🔊 Audio context resumed successfully');
            }).catch(error => {
                console.error('❌ Failed to resume audio context:', error);
            });
        } else if (this.audioContext.state === 'running') {
            console.log('🔊 Audio context running');
        }
    },
    
    // 播放音效
    play(soundType) {
        if (!this.isInitialized || this.isMuted) {
            return;
        }
        
        // 检查AudioContext是否已创建
        if (!this.audioUnlocked || !this.audioContext) {
            console.log('🔇 Audio not unlocked yet, attempting to unlock...');
            this.unlockAudio();
            return; // 等待下次调用
        }
        
        const config = this.soundConfigs[soundType];
        if (!config) {
            console.warn(`⚠️ Unknown sound type: ${soundType}`);
            return;
        }
        
        try {
            switch (config.type) {
                case 'sawtooth':
                    this.playSawtooth(config);
                    break;
                case 'square':
                    this.playSquare(config);
                    break;
                case 'triangle':
                    this.playTriangle(config);
                    break;
                case 'sine':
                    this.playSine(config);
                    break;
                case 'noise':
                    this.playNoise(config);
                    break;
                case 'chord':
                    this.playChord(config);
                    break;
                default:
                    console.warn(`⚠️ Unknown sound type: ${config.type}`);
            }
            
            console.log(`🎵 Playing ${soundType} sound`);
            
        } catch (error) {
            console.error(`❌ Error playing ${soundType}:`, error);
        }
    },
    
    playSawtooth(config) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(config.startFreq, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
            config.endFreq, 
            this.audioContext.currentTime + config.duration
        );
        
        gainNode.gain.setValueAtTime(config.volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
            0.01, 
            this.audioContext.currentTime + config.duration
        );
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + config.duration);
    },
    
    playSquare(config) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(config.startFreq, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
            config.endFreq, 
            this.audioContext.currentTime + config.duration
        );
        
        // 添加带通滤波器模拟金属撞击声
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, this.audioContext.currentTime);
        filter.Q.setValueAtTime(10, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(config.volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
            0.01, 
            this.audioContext.currentTime + config.duration
        );
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + config.duration);
    },
    
    playTriangle(config) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(config.startFreq, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
            config.endFreq, 
            this.audioContext.currentTime + config.duration
        );
        
        gainNode.gain.setValueAtTime(config.volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
            0.01, 
            this.audioContext.currentTime + config.duration
        );
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + config.duration);
    },
    
    playSine(config) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(config.startFreq, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
            config.endFreq, 
            this.audioContext.currentTime + config.duration
        );
        
        gainNode.gain.setValueAtTime(config.volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
            0.01, 
            this.audioContext.currentTime + config.duration
        );
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + config.duration);
    },
    
    playNoise(config) {
        const bufferSize = this.audioContext.sampleRate * config.duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        // 生成白噪声
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        noise.buffer = buffer;
        
        // 低通滤波器模拟爆炸效果
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(config.startFreq, this.audioContext.currentTime);
        filter.frequency.exponentialRampToValueAtTime(
            config.endFreq, 
            this.audioContext.currentTime + config.duration
        );
        
        gainNode.gain.setValueAtTime(config.volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
            0.01, 
            this.audioContext.currentTime + config.duration
        );
        
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        noise.start(this.audioContext.currentTime);
    },
    
    playChord(config) {
        const time = this.audioContext.currentTime;
        
        // 创建双音调和声
        const frequencies = [config.startFreq, config.startFreq * 1.5];
        
        frequencies.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, time);
            oscillator.frequency.exponentialRampToValueAtTime(
                freq * 0.5, 
                time + config.duration
            );
            
            gainNode.gain.setValueAtTime(config.volume * (index === 0 ? 1 : 0.7), time);
            gainNode.gain.exponentialRampToValueAtTime(
                0.01, 
                time + config.duration
            );
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            oscillator.start(time);
            oscillator.stop(time + config.duration);
        });
    },
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.isMuted ? 0 : this.volume;
        }
        console.log(`🔊 Volume set to: ${Math.round(this.volume * 100)}%`);
    },
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain) {
            this.masterGain.gain.value = this.isMuted ? 0 : this.volume;
        }
        if (this.musicGain) {
            this.musicGain.gain.value = this.isMuted ? 0 : this.musicVolume;
        }
        console.log(`🔊 ${this.isMuted ? 'Muted' : 'Unmuted'}`);
        return this.isMuted;
    },
    
    getVolume() {
        return this.volume;
    },
    
    isAudioMuted() {
        return this.isMuted;
    },
    
    // 🆕 背景音乐系统
    playBackgroundMusic(musicType) {
        if (!this.isInitialized || !this.audioUnlocked) {
            console.log('🔇 Audio not ready for background music');
            return;
        }
        
        // 停止当前音乐
        this.stopBackgroundMusic();
        
        console.log(`🎵 Starting background music: ${musicType}`);
        
        // 创建简单的背景音乐
        this.currentMusic = this.createBackgroundMusic(musicType);
        
        if (this.currentMusic) {
            this.currentMusic.connect(this.musicGain);
            this.currentMusic.start();
        }
    },
    
    stopBackgroundMusic() {
        if (this.currentMusic) {
            this.currentMusic.stop();
            this.currentMusic = null;
            
            // 清除等待中的定时器
            if (this.musicTimerId) {
                clearTimeout(this.musicTimerId);
                this.musicTimerId = null;
            }
            console.log('🔇 Background music stopped');
        }
    },
    
    createBackgroundMusic(musicType) {
        // 简单的背景音乐生成
        const musicConfigs = {
            'city_theme': {
                baseFreq: 220,
                pattern: [0, 2, 4, 7, 9, 11, 14], // C大调音阶
                tempo: 120
            },
            'desert_theme': {
                baseFreq: 196,
                pattern: [0, 3, 5, 7, 10, 12, 15], // G小调音阶
                tempo: 90
            },
            'forest_theme': {
                baseFreq: 261,
                pattern: [0, 2, 4, 5, 7, 9, 11], // C自然小调
                tempo: 100
            },
            'ocean_theme': {
                baseFreq: 174,
                pattern: [0, 4, 7, 11, 14, 17, 21], // 五声音阶
                tempo: 80
            },
            'space_theme': {
                baseFreq: 329,
                pattern: [0, 2, 4, 6, 8, 10, 12], // 全音阶
                tempo: 110
            }
        };
        
        const config = musicConfigs[musicType] || musicConfigs['city_theme'];
        
        // 创建简单的循环音乐
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.type = 'sine';
        gainNode.gain.value = 0.1; // 背景音乐音量较低
        
        // 添加低通滤波器让音乐更柔和
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        filter.Q.value = 1;
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        
        // 简单的音乐模式
        let noteIndex = 0;
        const noteDuration = 60 / config.tempo; // 秒/拍
        
        const playNote = () => {
            if (!this.currentMusic) return; // 如果音乐已停止，不再继续
            
            const note = config.pattern[noteIndex % config.pattern.length];
            const frequency = config.baseFreq * Math.pow(2, note / 12);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            
            // 简单的音量包络
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.1);
            gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + noteDuration);
            
            noteIndex++;
            
            // 安排下一个音符并保存定时器ID
            this.musicTimerId = setTimeout(playNote, noteDuration * 1000);
        };
        
        // 开始播放并保存第一个定时器ID
        this.musicTimerId = setTimeout(playNote, 0);
        
        return oscillator;
    },
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.musicGain) {
            this.musicGain.gain.value = this.isMuted ? 0 : this.musicVolume;
        }
        console.log(`🎵 Music volume set to: ${Math.round(this.musicVolume * 100)}%`);
    },
    
    destroy() {
        this.stopBackgroundMusic();
        if (this.audioContext) {
            this.audioContext.close();
        }
        this.isInitialized = false;
        console.log('🎵 AudioManager destroyed');
    }
}; 