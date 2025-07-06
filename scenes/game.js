// game.js

import PreloaderScene from './PreloaderScene.js';
import PlayerSelectScene from './PlayerSelectScene.js';
import MainScene from './MainScene.js';

console.log('开始初始化游戏配置...');

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#000',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false // 发布时建议设为 false
        }
    },
    audio: {
        disableWebAudio: false
    },
    // 确保 PreloaderScene 是第一个场景
    scene: [PreloaderScene, PlayerSelectScene, MainScene]
};

console.log('游戏配置:', config);
console.log('场景列表:', config.scene.map(scene => scene.name || scene.constructor.name));

const game = new Phaser.Game(config);
console.log('游戏实例已创建'); 