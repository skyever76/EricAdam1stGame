// scenes/PlayerSelectScene.js - ES6模块玩家选择场景

export class PlayerSelectScene extends Phaser.Scene {
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
        console.log('PlayerSelectScene: 创建玩家选择场景');
        
        // 创建背景
        this.createBackground();
        
        // 创建标题
        this.createTitle();
        
        // 创建玩家选择界面
        this.createPlayerSelection();
        
        // 创建开始按钮
        this.createStartButton();
        
        // 添加输入控制
        this.setupInput();
    }

    createBackground() {
        // 创建渐变背景
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x001122, 0x001122, 0x003366, 0x003366, 1);
        graphics.fillRect(0, 0, 1280, 720);
        
        // 添加装饰性元素
        this.addStars();
    }

    addStars() {
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 1280;
            const y = Math.random() * 720;
            const size = Math.random() * 2 + 1;
            
            const star = this.add.graphics();
            star.fillStyle(0xffffff, 0.8);
            star.fillCircle(x, y, size);
            
            // 添加闪烁动画
            this.tweens.add({
                targets: star,
                alpha: 0.3,
                duration: 1000 + Math.random() * 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    createTitle() {
        const title = this.add.text(640, 80, '选择你的角色', {
            font: '48px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });
        title.setOrigin(0.5);
        
        // 添加标题动画
        this.tweens.add({
            targets: title,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createPlayerSelection() {
        const startX = 200;
        const spacing = 220;
        
        this.playerButtons = [];
        
        this.players.forEach((player, index) => {
            const x = startX + (index * spacing);
            const y = 300;
            
            // 创建玩家卡片
            const card = this.createPlayerCard(x, y, player, index);
            this.playerButtons.push(card);
        });
        
        // 默认选择第一个玩家
        this.selectPlayer(0);
    }

    createPlayerCard(x, y, player, index) {
        const card = this.add.container(x, y);
        
        // 卡片背景
        const background = this.add.graphics();
        background.fillStyle(0x333333, 0.8);
        background.fillRoundedRect(-80, -100, 160, 200, 10);
        background.lineStyle(3, 0x666666);
        background.strokeRoundedRect(-80, -100, 160, 200, 10);
        card.add(background);
        
        // 玩家图片（使用占位符）
        const playerSprite = this.add.graphics();
        playerSprite.fillStyle(this.getPlayerColor(player.key));
        playerSprite.fillCircle(0, -50, 30);
        playerSprite.lineStyle(2, 0xffffff);
        playerSprite.strokeCircle(0, -50, 30);
        card.add(playerSprite);
        
        // 玩家名称
        const nameText = this.add.text(0, -10, player.name, {
            font: '20px Arial',
            fill: '#ffffff'
        });
        nameText.setOrigin(0.5);
        card.add(nameText);
        
        // 玩家描述
        const descText = this.add.text(0, 15, player.description, {
            font: '14px Arial',
            fill: '#cccccc',
            wordWrap: { width: 140 }
        });
        descText.setOrigin(0.5);
        card.add(descText);
        
        // 玩家属性
        const statsText = this.add.text(0, 50, this.getPlayerStats(player), {
            font: '12px Arial',
            fill: '#ffff00'
        });
        statsText.setOrigin(0.5);
        card.add(statsText);
        
        // 选择指示器
        const selector = this.add.graphics();
        selector.lineStyle(4, 0x00ff00);
        selector.strokeRoundedRect(-85, -105, 170, 210, 10);
        selector.setVisible(false);
        card.add(selector);
        
        // 添加交互
        card.setInteractive(new Phaser.Geom.Rectangle(-80, -100, 160, 200), Phaser.Geom.Rectangle.Contains);
        card.on('pointerdown', () => this.selectPlayer(index));
        card.on('pointerover', () => this.highlightCard(card, true));
        card.on('pointerout', () => this.highlightCard(card, false));
        
        // 保存引用
        card.background = background;
        card.selector = selector;
        card.playerIndex = index;
        
        return card;
    }

    getPlayerColor(key) {
        const colors = {
            soldier: 0x8B4513,
            diver: 0x4169E1,
            tank: 0x696969,
            spaceship: 0xC0C0C0
        };
        return colors[key] || 0xffffff;
    }

    getPlayerStats(player) {
        let stats = `速度: ${player.speed}\n生命: ${player.health}`;
        if (player.damageMultiplier) {
            stats += `\n伤害: x${player.damageMultiplier}`;
        }
        if (player.initPoints) {
            stats += `\n积分: ${player.initPoints}`;
        }
        return stats;
    }

    selectPlayer(index) {
        // 清除之前的选择
        this.playerButtons.forEach((button, i) => {
            button.selector.setVisible(i === index);
        });
        
        this.selectedPlayer = this.players[index];
        console.log('PlayerSelectScene: 选择玩家:', this.selectedPlayer.name);
        
        // 更新开始按钮状态
        this.updateStartButton();
    }

    highlightCard(card, isHighlighted) {
        if (isHighlighted) {
            card.background.clear();
            card.background.fillStyle(0x444444, 0.9);
            card.background.fillRoundedRect(-80, -100, 160, 200, 10);
            card.background.lineStyle(3, 0x888888);
            card.background.strokeRoundedRect(-80, -100, 160, 200, 10);
        } else {
            card.background.clear();
            card.background.fillStyle(0x333333, 0.8);
            card.background.fillRoundedRect(-80, -100, 160, 200, 10);
            card.background.lineStyle(3, 0x666666);
            card.background.strokeRoundedRect(-80, -100, 160, 200, 10);
        }
    }

    createStartButton() {
        this.startButton = this.add.container(640, 550);
        
        // 按钮背景
        const buttonBg = this.add.graphics();
        buttonBg.fillStyle(0x00aa00, 0.8);
        buttonBg.fillRoundedRect(-100, -30, 200, 60, 10);
        buttonBg.lineStyle(3, 0x00ff00);
        buttonBg.strokeRoundedRect(-100, -30, 200, 60, 10);
        this.startButton.add(buttonBg);
        
        // 按钮文本
        this.startButtonText = this.add.text(0, 0, '开始游戏', {
            font: '24px Arial',
            fill: '#ffffff'
        });
        this.startButtonText.setOrigin(0.5);
        this.startButton.add(this.startButtonText);
        
        // 添加交互
        this.startButton.setInteractive(new Phaser.Geom.Rectangle(-100, -30, 200, 60), Phaser.Geom.Rectangle.Contains);
        this.startButton.on('pointerdown', () => this.startGame());
        this.startButton.on('pointerover', () => this.highlightStartButton(true));
        this.startButton.on('pointerout', () => this.highlightStartButton(false));
        
        // 保存引用
        this.startButton.background = buttonBg;
        
        // 初始状态
        this.updateStartButton();
    }

    updateStartButton() {
        if (this.selectedPlayer) {
            this.startButtonText.setText('开始游戏');
            this.startButtonText.setColor('#ffffff');
            this.startButton.background.clear();
            this.startButton.background.fillStyle(0x00aa00, 0.8);
            this.startButton.background.fillRoundedRect(-100, -30, 200, 60, 10);
            this.startButton.background.lineStyle(3, 0x00ff00);
            this.startButton.background.strokeRoundedRect(-100, -30, 200, 60, 10);
        } else {
            this.startButtonText.setText('请选择角色');
            this.startButtonText.setColor('#888888');
            this.startButton.background.clear();
            this.startButton.background.fillStyle(0x666666, 0.8);
            this.startButton.background.fillRoundedRect(-100, -30, 200, 60, 10);
            this.startButton.background.lineStyle(3, 0x888888);
            this.startButton.background.strokeRoundedRect(-100, -30, 200, 60, 10);
        }
    }

    highlightStartButton(isHighlighted) {
        if (!this.selectedPlayer) return;
        
        if (isHighlighted) {
            this.startButton.background.clear();
            this.startButton.background.fillStyle(0x00cc00, 0.9);
            this.startButton.background.fillRoundedRect(-100, -30, 200, 60, 10);
            this.startButton.background.lineStyle(3, 0x00ff00);
            this.startButton.background.strokeRoundedRect(-100, -30, 200, 60, 10);
        } else {
            this.startButton.background.clear();
            this.startButton.background.fillStyle(0x00aa00, 0.8);
            this.startButton.background.fillRoundedRect(-100, -30, 200, 60, 10);
            this.startButton.background.lineStyle(3, 0x00ff00);
            this.startButton.background.strokeRoundedRect(-100, -30, 200, 60, 10);
        }
    }

    setupInput() {
        // 键盘控制
        this.input.keyboard.on('keydown-LEFT', () => {
            const currentIndex = this.selectedPlayer ? this.players.indexOf(this.selectedPlayer) : 0;
            const newIndex = (currentIndex - 1 + this.players.length) % this.players.length;
            this.selectPlayer(newIndex);
        });
        
        this.input.keyboard.on('keydown-RIGHT', () => {
            const currentIndex = this.selectedPlayer ? this.players.indexOf(this.selectedPlayer) : 0;
            const newIndex = (currentIndex + 1) % this.players.length;
            this.selectPlayer(newIndex);
        });
        
        this.input.keyboard.on('keydown-ENTER', () => {
            if (this.selectedPlayer) {
                this.startGame();
            }
        });
        
        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.selectedPlayer) {
                this.startGame();
            }
        });
    }

    startGame() {
        if (!this.selectedPlayer) {
            console.log('PlayerSelectScene: 未选择玩家，无法开始游戏');
            return;
        }
        
        console.log('PlayerSelectScene: 开始游戏，选择的玩家:', this.selectedPlayer);
        
        // 切换到主游戏场景
        this.scene.start('MainScene', {
            player: this.selectedPlayer,
            level: 0
        });
    }
}

console.log('✅ PlayerSelectScene.js ES6模块已加载'); 