// TouchControls.js - ES6模块触摸控制系统

import { UI_LAYOUT } from './configs.js';

export class TouchControls {
    constructor(scene) {
        this.scene = scene;
        this.config = UI_LAYOUT.TOUCH_CONTROLS;
      
        // 控制状态
        this.isEnabled = true;
        this.leftStick = {
            active: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            deltaX: 0,
            deltaY: 0,
            distance: 0,
            angle: 0,
            power: 0, // 0-1之间的力度
            maxDistance: this.config.JOYSTICK.MAX_DISTANCE
        };
      
        this.rightButton = {
            active: false,
            isShooting: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0
        };
      
        this.weaponButtons = [];
        this.activePointers = new Map(); // 跟踪多点触控
      
        // UI元素
        this.uiElements = [];
      
        console.log('🎮 TouchControls: 触摸控制系统初始化');
    }
  
    create() {
        console.log('🎮 TouchControls: 创建触摸控制UI');
      
        // 检测设备类型
        this.isMobile = this.detectMobileDevice();
      
        if (this.isMobile) {
            this.createTouchUI();
            this.setupTouchEvents();
            console.log('📱 移动设备检测成功，启用触摸控制');
        } else {
            console.log('🖥️ 桌面设备，使用键鼠控制');
        }
    }
  
    detectMobileDevice() {
        const userAgent = navigator.userAgent.toLowerCase();
        const mobileKeywords = ['ipad', 'iphone', 'android', 'mobile', 'tablet'];
      
        // 检查User Agent
        const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
      
        // 检查触摸支持
        const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
        // 检查屏幕尺寸（iPad通常是1024x768或更大）
        const screenSize = window.innerWidth >= 768 || window.innerHeight >= 768;
      
        const isMobile = (isMobileUA || hasTouchSupport) && screenSize;
      
        console.log(`🔍 设备检测: UA=${isMobileUA}, Touch=${hasTouchSupport}, Screen=${screenSize}, Result=${isMobile}`);
        return isMobile;
    }
  
    createTouchUI() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
      
        // 1. 📍 左侧虚拟摇杆
        this.createLeftJoystick();
      
        // 2. 🎯 右侧射击按钮
        this.createShootButton();
      
        // 3. 🔧 武器切换按钮
        this.createWeaponButtons();
      
        // 4. ⏸️ 暂停按钮
        this.createPauseButton();
      
        // 设置UI深度
        this.uiElements.forEach(element => {
            if (element.setDepth) element.setDepth(1000);
        });
      
        console.log('🎨 触摸UI创建完成');
    }
  
    createLeftJoystick() {
        const config = this.config.JOYSTICK;
        const { x, y } = config.POS;
      
        // 摇杆外圈（背景）
        this.leftStickBg = this.scene.add.circle(x, y, config.RADIUS, config.COLORS.BG, config.COLORS.BG_ALPHA)
            .setStroke(config.COLORS.STROKE, 2)
            .setInteractive({ useHandCursor: true })
            .setScrollFactor(0);
      
        // 摇杆内圈（控制点）
        this.leftStickKnob = this.scene.add.circle(x, y, config.KNOB_RADIUS, config.COLORS.KNOB, config.COLORS.KNOB_ALPHA)
            .setStroke(config.COLORS.STROKE, 2)
            .setScrollFactor(0);
      
        // 摇杆标签
        this.leftStickLabel = this.scene.add.text(x, y - 90, '移动', {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setScrollFactor(0);
      
        this.leftStick.baseX = x;
        this.leftStick.baseY = y;
      
        this.uiElements.push(this.leftStickBg, this.leftStickKnob, this.leftStickLabel);
      
        console.log(`🕹️ 创建左摇杆: 位置(${x}, ${y})`);
    }
  
    createShootButton() {
        const config = this.config.SHOOT_BUTTON;
        const { x, y } = config.POS;
      
        // 射击按钮外圈
        this.shootButtonBg = this.scene.add.circle(x, y, config.RADIUS, config.COLORS.BG, config.COLORS.BG_ALPHA)
            .setStroke(config.COLORS.STROKE, 3)
            .setInteractive({ useHandCursor: true })
            .setScrollFactor(0);
      
        // 射击按钮图标
        this.shootButtonIcon = this.scene.add.text(x, y, config.ICON, {
            fontSize: '24px'
        }).setOrigin(0.5).setScrollFactor(0);
      
        // 射击按钮标签
        this.shootButtonLabel = this.scene.add.text(x, y - 70, config.LABEL, {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setScrollFactor(0);
      
        this.rightButton.x = x;
        this.rightButton.y = y;
      
        this.uiElements.push(this.shootButtonBg, this.shootButtonIcon, this.shootButtonLabel);
      
        console.log(`🎯 创建射击按钮: 位置(${x}, ${y})`);
    }
  
    createWeaponButtons() {
        const config = this.config.WEAPON_BUTTONS;
        const { x, y } = config.POS;
      
        config.WEAPONS.forEach((weapon, index) => {
            const buttonY = y - index * config.SPACING;
          
            // 武器按钮
            const button = this.scene.add.circle(x, buttonY, config.RADIUS, weapon.color, 0.8)
                .setStroke(0xffffff, 1)
                .setInteractive({ useHandCursor: true })
                .setScrollFactor(0);
          
            // 武器图标
            const icon = this.scene.add.text(x, buttonY, weapon.icon, {
                fontSize: '14px'
            }).setOrigin(0.5).setScrollFactor(0);
          
            // 武器编号
            const number = this.scene.add.text(x + 25, buttonY, `${index + 1}`, {
                fontSize: '12px',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 }
            }).setOrigin(0.5).setScrollFactor(0);
          
            this.weaponButtons.push({
                button: button,
                icon: icon,
                number: number,
                weaponIndex: index,
                x: x,
                y: buttonY
            });
          
            this.uiElements.push(button, icon, number);
        });
      
        console.log(`🔧 创建${config.WEAPONS.length}个武器切换按钮`);
    }
  
    createPauseButton() {
        const config = this.config.PAUSE_BUTTON;
        const { x, y } = config.POS;
      
        // 暂停按钮
        this.pauseButton = this.scene.add.circle(x, y, config.RADIUS, config.COLORS.BG, config.COLORS.BG_ALPHA)
            .setStroke(config.COLORS.STROKE, 2)
            .setInteractive({ useHandCursor: true })
            .setScrollFactor(0);
      
        this.pauseIcon = this.scene.add.text(x, y, config.ICONS.PAUSE, {
            fontSize: '16px'
        }).setOrigin(0.5).setScrollFactor(0);
      
        this.uiElements.push(this.pauseButton, this.pauseIcon);
      
        console.log(`⏸️ 创建暂停按钮: 位置(${x}, ${y})`);
    }
  
    setupTouchEvents() {
        this.scene.input.on('pointerdown', this.handleTouchStart, this);
        this.scene.input.on('pointermove', this.handleTouchMove, this);
        this.scene.input.on('pointerup', this.handleTouchEnd, this);
        this.scene.input.on('pointerout', this.handleTouchEnd, this);
      
        console.log('🎮 触摸事件监听器设置完成');
    }
  
    handleTouchStart(pointer) {
        if (!this.isEnabled) return;
      
        const { x, y } = pointer;
        const pointerId = pointer.id;
      
        console.log(`👆 触摸开始: ID=${pointerId}, 位置(${x}, ${y})`);
      
        // 检查左摇杆区域
        if (this.isInLeftStickArea(x, y)) {
            this.startLeftStick(x, y, pointerId);
            return;
        }
      
        // 检查射击按钮区域
        if (this.isInShootButtonArea(x, y)) {
            this.startShooting(x, y, pointerId);
            return;
        }
      
        // 检查武器按钮区域
        const weaponIndex = this.getWeaponButtonIndex(x, y);
        if (weaponIndex !== -1) {
            this.switchWeapon(weaponIndex);
            return;
        }
      
        // 检查暂停按钮
        if (this.isInPauseButtonArea(x, y)) {
            this.togglePause();
            return;
        }
    }
  
    handleTouchMove(pointer) {
        if (!this.isEnabled) return;
      
        const { x, y } = pointer;
        const pointerId = pointer.id;
      
        // 更新左摇杆
        if (this.leftStick.active && this.leftStick.pointerId === pointerId) {
            this.updateLeftStick(x, y);
        }
      
        // 更新射击方向
        if (this.rightButton.active && this.rightButton.pointerId === pointerId) {
            this.updateShootDirection(x, y);
        }
    }
  
    handleTouchEnd(pointer) {
        if (!this.isEnabled) return;
      
        const pointerId = pointer.id;
      
        console.log(`👆 触摸结束: ID=${pointerId}`);
      
        // 停止左摇杆
        if (this.leftStick.active && this.leftStick.pointerId === pointerId) {
            this.stopLeftStick();
        }
      
        // 停止射击
        if (this.rightButton.active && this.rightButton.pointerId === pointerId) {
            this.stopShooting();
        }
      
        // 清理指针记录
        this.activePointers.delete(pointerId);
    }
  
    // 🕹️ 左摇杆控制逻辑
    isInLeftStickArea(x, y) {
        const distance = Phaser.Math.Distance.Between(x, y, this.leftStick.baseX, this.leftStick.baseY);
        return distance <= this.config.JOYSTICK.TOUCH_AREA;
    }
  
    startLeftStick(x, y, pointerId) {
        this.leftStick.active = true;
        this.leftStick.pointerId = pointerId;
        this.leftStick.startX = x;
        this.leftStick.startY = y;
        this.activePointers.set(pointerId, 'leftStick');
      
        // 视觉反馈
        this.leftStickBg.setAlpha(0.8);
      
        console.log(`🕹️ 左摇杆激活: ID=${pointerId}`);
    }
  
    updateLeftStick(x, y) {
        this.leftStick.currentX = x;
        this.leftStick.currentY = y;
      
        // 计算相对于摇杆中心的偏移
        const deltaX = x - this.leftStick.baseX;
        const deltaY = y - this.leftStick.baseY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
        // 限制摇杆移动范围
        const clampedDistance = Math.min(distance, this.leftStick.maxDistance);
        const angle = Math.atan2(deltaY, deltaX);
      
        // 更新摇杆状态
        this.leftStick.deltaX = Math.cos(angle) * clampedDistance;
        this.leftStick.deltaY = Math.sin(angle) * clampedDistance;
        this.leftStick.distance = clampedDistance;
        this.leftStick.angle = angle;
        this.leftStick.power = clampedDistance / this.leftStick.maxDistance;
      
        // 更新摇杆UI位置
        this.leftStickKnob.setPosition(
            this.leftStick.baseX + this.leftStick.deltaX,
            this.leftStick.baseY + this.leftStick.deltaY
        );
      
        // 应用到玩家移动
        this.applyMovement();
    }
  
    stopLeftStick() {
        this.leftStick.active = false;
        this.leftStick.pointerId = null;
        this.leftStick.deltaX = 0;
        this.leftStick.deltaY = 0;
        this.leftStick.power = 0;
      
        // 重置摇杆UI位置
        this.leftStickKnob.setPosition(this.leftStick.baseX, this.leftStick.baseY);
        this.leftStickBg.setAlpha(this.config.JOYSTICK.COLORS.BG_ALPHA);
      
        // 停止玩家移动
        if (this.scene.player) {
            this.scene.player.setVelocity(0, 0);
        }
      
        console.log('🕹️ 左摇杆停止');
    }
  
    applyMovement() {
        if (!this.scene.player || !this.leftStick.active) return;
      
        const speed = this.scene.playerSpeed || 400;
        const velocityX = this.leftStick.deltaX * (speed / this.leftStick.maxDistance);
        const velocityY = this.leftStick.deltaY * (speed / this.leftStick.maxDistance);
      
        this.scene.player.setVelocity(velocityX, velocityY);
    }
  
    // 🎯 射击按钮控制逻辑
    isInShootButtonArea(x, y) {
        const distance = Phaser.Math.Distance.Between(x, y, this.rightButton.x, this.rightButton.y);
        return distance <= this.config.SHOOT_BUTTON.TOUCH_AREA;
    }
  
    startShooting(x, y, pointerId) {
        this.rightButton.active = true;
        this.rightButton.isShooting = true;
        this.rightButton.pointerId = pointerId;
        this.rightButton.startX = x;
        this.rightButton.startY = y;
        this.rightButton.currentX = x;
        this.rightButton.currentY = y;
        this.activePointers.set(pointerId, 'shootButton');
      
        // 视觉反馈
        this.shootButtonBg.setAlpha(1.0);
        this.shootButtonBg.setScale(1.1);
      
        // 开始连续射击
        this.startContinuousShooting();
      
        console.log(`🎯 射击开始: ID=${pointerId}`);
    }
  
    updateShootDirection(x, y) {
        this.rightButton.currentX = x;
        this.rightButton.currentY = y;
    }
  
    stopShooting() {
        this.rightButton.active = false;
        this.rightButton.isShooting = false;
        this.rightButton.pointerId = null;
      
        // 恢复视觉状态
        this.shootButtonBg.setAlpha(this.config.SHOOT_BUTTON.COLORS.BG_ALPHA);
        this.shootButtonBg.setScale(1.0);
      
        // 停止连续射击
        this.stopContinuousShooting();
      
        console.log('🎯 射击停止');
    }
  
    startContinuousShooting() {
        // 立即射击一次
        this.performShoot();
      
        // 设置连续射击定时器
        this.shootTimer = this.scene.time.addEvent({
            delay: this.config.SHOOTING.CONTINUOUS_DELAY,
            callback: this.performShoot,
            callbackScope: this,
            repeat: -1 // 无限重复
        });
    }
  
    stopContinuousShooting() {
        if (this.shootTimer) {
            this.shootTimer.destroy();
            this.shootTimer = null;
        }
    }
  
    performShoot() {
        if (!this.rightButton.isShooting || !this.scene.shoot) return;
      
        // 计算射击角度
        const deltaX = this.rightButton.currentX - this.rightButton.startX;
        const deltaY = this.rightButton.currentY - this.rightButton.startY;
        const minDragDistance = this.config.SHOOTING.MIN_DRAG_DISTANCE;

        // 如果没有拖动，则默认朝右
        if (Math.abs(deltaX) < minDragDistance && Math.abs(deltaY) < minDragDistance) {
            this.shootAngle = 0; // 0代表正右方
        } else {
            this.shootAngle = Math.atan2(deltaY, deltaX);
        }
        
        // 调用场景的射击方法，传递射击角度
        this.scene.shoot(this.shootAngle);
    }
  
    // 🔧 武器切换逻辑
    getWeaponButtonIndex(x, y) {
        for (let i = 0; i < this.weaponButtons.length; i++) {
            const weapon = this.weaponButtons[i];
            const distance = Phaser.Math.Distance.Between(x, y, weapon.x, weapon.y);
            if (distance <= this.config.WEAPON_BUTTONS.TOUCH_AREA) {
                return i;
            }
        }
        return -1;
    }
  
    switchWeapon(weaponIndex) {
        if (this.scene.switchWeapon) {
            this.scene.switchWeapon(weaponIndex);
          
            // 视觉反馈
            this.highlightWeaponButton(weaponIndex);
          
            console.log(`🔧 切换武器: ${weaponIndex}`);
        }
    }
  
    highlightWeaponButton(weaponIndex) {
        // 重置所有按钮
        this.weaponButtons.forEach(weapon => {
            weapon.button.setAlpha(0.8);
            weapon.button.setScale(1.0);
        });
      
        // 高亮选中的按钮
        if (this.weaponButtons[weaponIndex]) {
            this.weaponButtons[weaponIndex].button.setAlpha(1.0);
            this.weaponButtons[weaponIndex].button.setScale(1.2);
          
            // 添加闪烁效果
            this.scene.tweens.add({
                targets: this.weaponButtons[weaponIndex].button,
                alpha: 0.6,
                duration: 100,
                yoyo: true,
                repeat: 2
            });
        }
    }
  
    // ⏸️ 暂停按钮逻辑
    isInPauseButtonArea(x, y) {
        const distance = Phaser.Math.Distance.Between(x, y, this.pauseButton.x, this.pauseButton.y);
        return distance <= this.config.PAUSE_BUTTON.TOUCH_AREA;
    }
  
    togglePause() {
        if (this.scene.togglePause) {
            this.scene.togglePause();
          
            // 更新暂停按钮图标
            const isPaused = this.scene.scene.isPaused();
            this.pauseIcon.setText(isPaused ? this.config.PAUSE_BUTTON.ICONS.PLAY : this.config.PAUSE_BUTTON.ICONS.PAUSE);
          
            console.log(`⏸️ 游戏${isPaused ? '暂停' : '继续'}`);
        }
    }
  
    // 🎮 获取当前输入状态（供场景查询使用）
    getMovementInput() {
        if (!this.leftStick.active) {
            return { x: 0, y: 0, power: 0 };
        }
      
        return {
            x: this.leftStick.deltaX / this.leftStick.maxDistance,
            y: this.leftStick.deltaY / this.leftStick.maxDistance,
            power: this.leftStick.power,
            angle: this.leftStick.angle
        };
    }
  
    isShootingActive() {
        return this.rightButton.isShooting;
    }
  
    // 🔄 更新方法（每帧调用）
    update() {
        // 可以在这里添加任何需要每帧更新的逻辑
        // 比如摇杆的弹性回弹效果等
    }
  
    // 🧹 清理方法
    destroy() {
        // 清理事件监听器
        this.scene.input.off('pointerdown', this.handleTouchStart, this);
        this.scene.input.off('pointermove', this.handleTouchMove, this);
        this.scene.input.off('pointerup', this.handleTouchEnd, this);
        this.scene.input.off('pointerout', this.handleTouchEnd, this);
      
        // 清理定时器
        if (this.shootTimer) {
            this.shootTimer.destroy();
        }
      
        // 清理UI元素
        this.uiElements.forEach(element => {
            if (element && element.destroy) {
                element.destroy();
            }
        });
      
        console.log('🧹 TouchControls: 清理完成');
    }
  
    // 🎛️ 控制开关
    enable() {
        this.isEnabled = true;
        this.setUIVisible(true);
        console.log('🎮 触摸控制已启用');
    }
  
    disable() {
        this.isEnabled = false;
        this.setUIVisible(false);
        this.stopLeftStick();
        this.stopShooting();
        console.log('🎮 触摸控制已禁用');
    }
  
    setUIVisible(visible) {
        const alpha = visible ? (this.leftStick.active ? 0.8 : 0.4) : 0;
        this.uiElements.forEach(element => {
            if (element && element.setAlpha) {
                element.setAlpha(alpha);
            }
        });
    }
}

console.log('✅ TouchControls.js ES6模块已加载'); 