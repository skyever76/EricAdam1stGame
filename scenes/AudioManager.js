// AudioManager.js - 程序生成音效系统

class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.audioContext = null;
        this.masterGain = null;
        this.isMuted = false;
        this.volume = 0.5;
        this.isInitialized = false;
        this.audioUnlocked = false;
        
        // 音效参数配置
        this.soundConfigs = {
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
        };
        
        this.init();
    }
    
    init() {
        try {
            // 创建音频上下文
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // 创建主音量控制
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.volume;
            
            this.isInitialized = true;
            console.log('🎵 AudioManager initialized successfully');
            
            // 检查音频上下文状态
            this.checkAudioContext();
            
        } catch (error) {
            console.error('❌ AudioManager initialization failed:', error);
            this.isInitialized = false;
        }
    }
    
    checkAudioContext() {
        if (!this.audioContext) return;
        
        if (this.audioContext.state === 'suspended') {
            console.log('🔇 Audio context suspended, waiting for user interaction');
            this.showAudioUnlockPrompt();
        } else if (this.audioContext.state === 'running') {
            console.log('🔊 Audio context running');
            this.audioUnlocked = true;
        }
    }
    
    showAudioUnlockPrompt() {
        // 在游戏界面显示音频解锁提示
        if (this.scene && this.scene.add) {
            this.audioUnlockText = this.scene.add.text(400, 200, '点击屏幕启用音效', {
                fontSize: '24px',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 10, y: 5 }
            }).setOrigin(0.5).setDepth(1000);
            
            // 添加点击事件
            this.scene.input.on('pointerdown', () => {
                this.unlockAudio();
            }, this);
        }
    }
    
    unlockAudio() {
        if (!this.audioContext || this.audioContext.state !== 'suspended') return;
        
        this.audioContext.resume().then(() => {
            console.log('🔊 Audio context unlocked');
            this.audioUnlocked = true;
            
            // 移除提示文本
            if (this.audioUnlockText) {
                this.audioUnlockText.destroy();
                this.audioUnlockText = null;
            }
            
            // 移除点击事件
            this.scene.input.off('pointerdown', this.unlockAudio, this);
        }).catch(error => {
            console.error('❌ Failed to unlock audio:', error);
        });
    }
    
    play(soundType) {
        if (!this.isInitialized || !this.audioUnlocked || this.isMuted) {
            return;
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
    }
    
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
    }
    
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
    }
    
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
    }
    
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
    }
    
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
    }
    
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
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.volume;
        }
        console.log(`🔊 Volume set to: ${Math.round(this.volume * 100)}%`);
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain) {
            this.masterGain.gain.value = this.isMuted ? 0 : this.volume;
        }
        console.log(`🔊 ${this.isMuted ? 'Muted' : 'Unmuted'}`);
        return this.isMuted;
    }
    
    getVolume() {
        return this.volume;
    }
    
    isAudioMuted() {
        return this.isMuted;
    }
    
    destroy() {
        if (this.audioContext) {
            this.audioContext.close();
        }
        this.isInitialized = false;
        console.log('🎵 AudioManager destroyed');
    }
}

// 导出到全局作用域
window.AudioManager = AudioManager; 