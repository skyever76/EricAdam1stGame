export default class PlayerSelectScene extends Phaser.Scene {
    constructor() {
        super('PlayerSelectScene');
        this.selectedPlayer = null;
        this.players = [
            { key: 'elf', name: '精灵', description: '敏捷型，移动速度快', speed: 450, health: 80 },
            { key: 'soldier', name: '士兵', description: '平衡型，攻防兼备', speed: 400, health: 100 },
            { key: 'diver', name: '潜水员', description: '防御型，生命值高', speed: 350, health: 120 },
            { key: 'tank', name: '坦克', description: '攻击型，伤害高', speed: 300, health: 90 },
            { key: 'spaceship', name: '飞船', description: '特殊型，技能独特', speed: 500, health: 70 }
        ];
    }

    create() {
        console.log('PlayerSelectScene.create() 开始执行');
        console.log('PlayerSelectScene: 可用纹理:', this.textures.getTextureKeys());
        
        // 标题
        this.add.text(this.cameras.main.width / 2, 60, '选择你的角色', { 
            font: '48px Arial', 
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // 显示保存的积分
        const savedPoints = this.getSavedPoints();
        this.add.text(this.cameras.main.width / 2, 100, `保存的积分: ${savedPoints}`, { 
            font: '24px Arial', 
            fill: '#ffff00',
            stroke: '#000',
            strokeThickness: 2
        }).setOrigin(0.5);

        const playerButtons = [];
        const columns = 3;
        const startX = 300;
        const startY = 200;
        const spacingX = 350;
        const spacingY = 250;

        this.players.forEach((player, index) => {
            const x = startX + (index % columns) * spacingX;
            const y = startY + Math.floor(index / columns) * spacingY;
        
            // 检查纹理是否存在
            const textureKey = this.textures.exists(player.key) ? player.key : 'player';
            console.log(`PlayerSelectScene: 角色 ${player.name} 使用纹理: ${textureKey}`);
          
            // 创建可交互的玩家图片
            const playerImage = this.add.image(x, y - 40, textureKey)
                .setScale(1.2)
                .setInteractive()
                .setData('player', player);
              
            // 玩家名称
            this.add.text(x, y + 20, player.name, { 
                font: '28px Arial', 
                fill: '#ffffff',
                stroke: '#000',
                strokeThickness: 2
            }).setOrigin(0.5);
        
            // 玩家描述
            this.add.text(x, y + 50, player.description, { 
                font: '16px Arial', 
                fill: '#cccccc',
                stroke: '#000',
                strokeThickness: 1
            }).setOrigin(0.5);

            // 玩家属性
            this.add.text(x, y + 80, `速度: ${player.speed} | 生命: ${player.health}`, { 
                font: '14px Arial', 
                fill: '#00ff00',
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
                        btn.setScale(1.4);
                    } else {
                        btn.setScale(1.2);
                    }
                });
              
                // 激活开始按钮
                this.startButton.setAlpha(1).setInteractive();
                console.log('开始按钮已激活');
            });
        });

        // 创建开始按钮 - 修复交互性问题
        this.startButton = this.add.text(this.cameras.main.width / 2, 650, '开始游戏', { 
            font: '40px Arial', 
            fill: '#4CAF50', 
            backgroundColor: '#fff', 
            padding: { x: 20, y: 10 },
            stroke: '#000',
            strokeThickness: 2
        })
        .setOrigin(0.5)
        .setAlpha(0.5)
        .setInteractive({ useHandCursor: true });

        // 修复开始按钮点击事件
        this.startButton.on('pointerdown', () => {
            console.log('开始按钮被点击');
            console.log('选中的玩家:', this.selectedPlayer);
          
            if (this.selectedPlayer) {
                console.log('启动主场景，传递玩家数据:', this.selectedPlayer);
                this.scene.start('MainScene', { player: this.selectedPlayer });
            } else {
                console.error('没有选中玩家，无法开始游戏');
                // 添加视觉提示
                this.add.text(this.cameras.main.width / 2, 620, '请先选择角色', {
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