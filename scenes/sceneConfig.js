// scenes/sceneConfig.js - 场景配置管理

import { PreloaderScene } from './PreloaderScene.js';
import { PlayerSelectScene } from './PlayerSelectScene.js';
import { MainScene } from './MainScene.js';

// 🆕 导入高级敌人配置（确保模块被加载）
import { ADVANCED_ENEMY_TYPES } from './advancedEnemies.js';

// 🆕 导入高级场景配置（确保模块被加载）
import { ADVANCED_SCENES } from './advancedScenes.js';

// 🎬 场景配置
export const SCENE_CONFIG = {
    // 场景列表（按加载顺序）
    scenes: [
        {
            key: 'PreloaderScene',
            class: PreloaderScene,
            description: '资源预加载场景'
        },
        {
            key: 'PlayerSelectScene', 
            class: PlayerSelectScene,
            description: '角色选择场景'
        },
        {
            key: 'MainScene',
            class: MainScene,
            description: '主游戏场景'
        }
    ],
    
    // 获取场景类列表（用于Phaser配置）
    getSceneClasses() {
        return this.scenes.map(scene => scene.class);
    },
    
    // 获取场景键列表
    getSceneKeys() {
        return this.scenes.map(scene => scene.key);
    },
    
    // 根据键获取场景类
    getSceneByKey(key) {
        const scene = this.scenes.find(s => s.key === key);
        return scene ? scene.class : null;
    },
    
    // 获取场景信息
    getSceneInfo() {
        return this.scenes.map(scene => ({
            key: scene.key,
            description: scene.description,
            className: scene.class.name
        }));
    }
};

console.log('✅ sceneConfig.js ES6模块已加载'); 