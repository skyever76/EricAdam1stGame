// game.js - 更新配置支持iPad

import PreloaderScene from './PreloaderScene.js';
import PlayerSelectScene from './PlayerSelectScene.js';
import MainScene from './MainScene.js';

console.log('开始初始化游戏配置...');

// 🆕 检测设备并设置合适的分辨率
function getGameConfig() {
    const isIPad = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
  
    let gameWidth, gameHeight;
  
    if (isIPad || screenWidth >= 768) {
        // iPad或大屏设备：使用更高分辨率
        gameWidth = Math.min(1920, screenWidth);
        gameHeight = Math.min(1080, screenHeight);
    } else {
        // 普通设备：使用原分辨率
        gameWidth = 1280;
        gameHeight = 720;
    }
  
    console.log(`🎮 游戏分辨率设置: ${gameWidth}x${gameHeight}`);
    console.log(`📱 设备信息: iPad=${isIPad}, 屏幕=${screenWidth}x${screenHeight}`);
  
    return {
        type: Phaser.AUTO,
        width: gameWidth,
        height: gameHeight,
        parent: 'game-container',
        backgroundColor: '#000',
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: gameWidth,
            height: gameHeight
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
        scene: [PreloaderScene, PlayerSelectScene, MainScene]
    };
}

const config = getGameConfig();

console.log('游戏配置:', config);
console.log('场景列表:', config.scene.map(scene => scene.name || scene.constructor.name));

const game = new Phaser.Game(config);
console.log('游戏实例已创建');

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