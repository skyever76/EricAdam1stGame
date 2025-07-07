// game.js - ES6模块游戏入口

import { SCENE_CONFIG } from './sceneConfig.js';
import { AudioManager } from './AudioManager.js';

console.log('开始初始化游戏配置...');

// 🆕 更精确的设备检测
function getDeviceType() {
    const ua = navigator.userAgent;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // 检测移动设备
    const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
    
    // 更精确的平板检测
    let isTablet = false;
    
    if (ua.includes('iPad') || (!ua.includes('Mobile') && /Android/i.test(ua))) {
        isTablet = true;
    }
    
    // 桌面设备
    const isDesktop = !isMobile;
    
    console.log(`📱 设备检测: 移动=${isMobile}, 平板=${isTablet}, 桌面=${isDesktop}, 屏幕=${screenWidth}x${screenHeight}`);
    
    if (isTablet) {
        return 'tablet';
    } else if (isMobile) {
        return 'mobile';
    } else {
        return 'desktop';
    }
}

// 🆕 检测设备并设置合适的分辨率
function getGameConfig() {
    const deviceType = getDeviceType();
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
  
    let gameWidth, gameHeight;
  
    if (deviceType === 'tablet') {
        // 平板设备：使用更高分辨率
        gameWidth = Math.min(1920, screenWidth);
        gameHeight = Math.min(1080, screenHeight);
        console.log(`📱 平板设备模式: ${gameWidth}x${gameHeight}`);
    } else if (deviceType === 'mobile') {
        // 手机设备：使用中等分辨率
        gameWidth = Math.min(1280, screenWidth);
        gameHeight = Math.min(720, screenHeight);
        console.log(`📱 手机设备模式: ${gameWidth}x${gameHeight}`);
    } else {
        // 桌面设备：使用标准分辨率
        gameWidth = 1280;
        gameHeight = 720;
        console.log(`🖥️ 桌面设备模式: ${gameWidth}x${gameHeight}`);
    }
  
    console.log(`🎮 游戏分辨率设置: ${gameWidth}x${gameHeight}`);
    console.log(`📱 设备信息: 类型=${deviceType}, 屏幕=${screenWidth}x${screenHeight}`);
  
    return {
        type: Phaser.AUTO,
        width: gameWidth,
        height: gameHeight,
        parent: 'game-container',
        backgroundColor: '#000',
        scale: {
            mode: Phaser.Scale.NONE,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        },
        audio: {
            disableWebAudio: false
        },
        input: {
            touch: {
                capture: true
            }
        },
        scene: SCENE_CONFIG.getSceneClasses()
    };
}

const config = getGameConfig();

console.log('游戏配置:', config);

console.log('场景列表:', SCENE_CONFIG.getSceneInfo().map(info => `${info.key} (${info.description})`));

const game = new Phaser.Game(config);
console.log('游戏实例已创建');

// 🎵 初始化音频管理器（单例）
AudioManager.init();
console.log('🎵 AudioManager 已初始化');

// 🆕 处理屏幕方向变化
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        game.scale.refresh();
        console.log('📱 屏幕方向已更新');
    }, 100);
});

// 🆕 防止iOS Safari的双击缩放
document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = new Date().getTime();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);

console.log('✅ game.js ES6模块已加载'); 