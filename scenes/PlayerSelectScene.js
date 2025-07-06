// 🆕 使用全局变量，因为文件已通过script标签加载
const LEVELS_CONFIG = window.LEVELS_CONFIG;

class PlayerSelectScene extends Phaser.Scene {
    constructor() {
        super('PlayerSelectScene');
        this.selectedPlayer = null;

        this.players = [
            { key: 'soldier', name: '士兵', description: '平衡型，攻防兼备', speed: 400, health: 100 },
            { key: 'diver', name: '坦克', description: '防御型，生命值高', speed: 350, health: 200 },
            { key: 'tank', name: '骑士', description: '攻击型，伤害高', speed: 300, health: 90, damageMultiplier: 1.5 },
            { key: 'spaceship', name: '战机', description: '特殊型，技能独特', speed: 500, health: 70, initPoints: 500 }
        ];
    }

    create() {
        console.log('PlayerSelectScene.create() 开始执行');
        console.log('PlayerSelectScene: 可用纹理:', this.textures.getTextureKeys());
        
        // 标题
        this.add.text(this.cameras.main.width / 2, 60, '选择你的角色', { 
            font: '54px Arial', 
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 5
        }).setOrigin(0.5);

        // 显示保存的积分
        const savedPoints = this.getSavedPoints();
        this.add.text(this.cameras.main.width / 2, 120, `保存的积分: ${savedPoints}`, { 
            font: '32px Arial', 
            fill: '#ffff00',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // 角色区更紧凑排列，整体更靠左
        const playerButtons = [];
        const columns = 2;
        const startX = 120; // 更靠左
        const startY = 180; // 与说明区顶部对齐
        const spacingX = 260; // 更紧凑
        const spacingY = 220; // 更紧凑
        const avatarBgColors = [0x3e2723, 0x1565c0, 0x616161, 0x90caf9];

        this.players.forEach((player, index) => {
            const x = startX + (index % columns) * spacingX;
            const y = startY + Math.floor(index / columns) * spacingY;
            // 头像底色
            this.add.circle(x, y - 40, 48, avatarBgColors[index], 0.18);
            // 检查纹理是否存在
            const textureKey = this.textures.exists(player.key) ? player.key : 'player';
            console.log(`PlayerSelectScene: 角色 ${player.name} 使用纹理: ${textureKey}`);
          
            // 创建可交互的玩家图片
            const playerImage = this.add.image(x, y - 40, textureKey)
                .setScale(1.3)
                .setInteractive()
                .setData('player', player);
              
            // 玩家名称
            this.add.text(x, y + 30, player.name, { 
                font: '32px Arial', 
                fill: '#ffffff',
                stroke: '#000',
                strokeThickness: 3
            }).setOrigin(0.5);
        
            // 玩家描述
            this.add.text(x, y + 70, player.description, { 
                font: '20px Arial', 
                fill: '#cccccc',
                stroke: '#000',
                strokeThickness: 1
            }).setOrigin(0.5);

            playerButtons.push(playerImage);

            playerImage.on('pointerdown', () => {
                console.log('玩家角色被点击:', player.name);
                this.selectedPlayer = playerImage.getData('player');
                console.log('选中的玩家数据:', this.selectedPlayer);
              
                // 高亮选中的玩家
                playerButtons.forEach(btn => {
                    btn.clearTint();
                    if (btn.getData('player').key === this.selectedPlayer.key) {
                        btn.setTint(0x00ff00); // 选中玩家高亮
                        btn.setScale(1.5);
                    } else {
                        btn.setScale(1.3);
                    }
                });
              
                // 激活开始按钮
                this.startButton.setAlpha(1).setInteractive();
                console.log('开始按钮已激活');
            });
        });

        // 游戏操控和游戏玩法左右并排显示
        const explainBaseY = 180;
        const explainLeftX = 650;
        const explainRightX = 950;
        const explainAlign = 0; // 左对齐
        // 游戏操控
        this.add.text(explainLeftX, explainBaseY, '游戏操控', { 
            font: '32px Arial', 
            fill: '#ffff00',
            stroke: '#000',
            strokeThickness: 3,
            underline: true
        }).setOrigin(explainAlign, 0.5);
        this.add.rectangle(explainLeftX, explainBaseY + 20, 180, 3, 0xffff00, 0.5).setOrigin(explainAlign, 0.5);
        const controlsText = [
            '移动控制:',
            '  方向键 或 WASD',
            '',
            '射击控制:',
            '  鼠标点击 或 空格键',
            '',
            '武器切换:',
            '  数字键 1-6',
            '',
            '游戏控制:',
            '  P键: 暂停/恢复',
            '  R键: 重新开始',
            '  N键: 下一关'
        ];
        controlsText.forEach((text, index) => {
            this.add.text(explainLeftX, explainBaseY + 40 + index * 25, text, { 
                font: '16px Arial', 
                fill: '#ffffff',
                stroke: '#000',
                strokeThickness: 1
            }).setOrigin(explainAlign, 0.5);
        });
        // 游戏玩法
        this.add.text(explainRightX, explainBaseY, '游戏玩法', { 
            font: '32px Arial', 
            fill: '#00ffff',
            stroke: '#000',
            strokeThickness: 3,
            underline: true
        }).setOrigin(explainAlign, 0.5);
        this.add.rectangle(explainRightX, explainBaseY + 20, 180, 3, 0x00ffff, 0.5).setOrigin(explainAlign, 0.5);
        const gameplayText = [
            '游戏目标:',
            '  生存90秒 或',
            '  击杀30个敌人',
            '',
            '武器系统:',
            '  AK47/沙漠之鹰: 免费',
            '  其他武器: 需要积分',
            '',
            '积分系统:',
            '  击杀敌人获得积分',
            '  用于购买高级子弹',
            '',
            '特殊效果:',
            '  核弹: 全屏消灭',
            '  导弹: 范围爆炸',
            '  特斯拉: 持续光线'
        ];
        gameplayText.forEach((text, index) => {
            this.add.text(explainRightX, explainBaseY + 40 + index * 20, text, { 
                font: '14px Arial', 
                fill: '#cccccc',
                stroke: '#000',
                strokeThickness: 1
            }).setOrigin(explainAlign, 0.5);
        });



        // 创建开始按钮 - 居中，按钮上方留白，亮绿色，悬停高亮，按钮往上移
        this.startButton = this.add.text(this.cameras.main.width / 2, 600, '开始游戏', { 
            font: '48px Arial', 
            fill: '#00e676', 
            backgroundColor: '#fff', 
            padding: { x: 30, y: 16 },
            stroke: '#000',
            strokeThickness: 3
        })
        .setOrigin(0.5)
        .setAlpha(0.5)
        .setInteractive({ useHandCursor: true });
        this.startButton.on('pointerover', () => {
            this.startButton.setStyle({ fill: '#1de9b6', backgroundColor: '#e0f2f1' });
        });
        this.startButton.on('pointerout', () => {
            this.startButton.setStyle({ fill: '#00e676', backgroundColor: '#fff' });
        });

        // 修复开始按钮点击事件
        this.startButton.on('pointerdown', () => {
            console.log('开始按钮被点击');
            console.log('选中的玩家:', this.selectedPlayer);
          
            if (this.selectedPlayer) {
                console.log('启动主场景，传递玩家数据:', this.selectedPlayer);
                this.scene.start('MainScene', { 
                    player: this.selectedPlayer,
                    level: 0 // 固定从第一关开始
                });
            } else {
                console.error('请选择角色');
                // 添加视觉提示
                this.add.text(this.cameras.main.width / 2, 570, '请先选择角色', {
                    font: '24px Arial',
                    fill: '#ff0000',
                    stroke: '#000',
                    strokeThickness: 2
                }).setOrigin(0.5);
            }
        });

        console.log('PlayerSelectScene创建完成');
        console.log('开始按钮状态:', this.startButton);
        console.log('可用纹理:', this.textures.getTextureKeys());
    }

    getSavedPoints() {
        // 从localStorage获取保存的积分
        const savedPoints = localStorage.getItem('gamePoints');
        return savedPoints ? parseInt(savedPoints) : 0;
    }
}

// 🆕 导出到全局作用域
window.PlayerSelectScene = PlayerSelectScene; 