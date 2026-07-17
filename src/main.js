import Phaser from 'phaser';
import Player from './Player.js';
import Enemy from './Enemy.js';

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.spritesheet('ninja-idle', '/assets/characters/ninja-idle.png', {
            frameWidth: 96,
            frameHeight: 96,
        });
    }

    create() {
        this.input.mouse.disableContextMenu();
        this.player = new Player(this, 320, 180);
        this.enemy = this.spawnEnemy(300, 200, {
            name: 'Enemeanie',
            hp: 30,
            maxHp: 30,
        });

        // Animation Creation
        this.anims.create({ key: 'ninja-idle-left', frames: this.anims.generateFrameNumbers('ninja-idle', { start: 8, end: 15 }), frameRate: 4, repeat: -1 });
        this.anims.create({ key: 'ninja-idle-right', frames: this.anims.generateFrameNumbers('ninja-idle', { start: 0, end: 7 }), frameRate: 4, repeat: -1 });
        this.player.sprite.play('ninja-idle-right');
        
        this.physics.add.existing(this.player.sprite);
        this.player.sprite.body.setSize(25, 32);
        
        this.player.sprite.body.setCollideWorldBounds(true);
        
        this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
        this.physics.world.setBounds(0, 0, 3000, 3000);
        this.cameras.main.setBounds(0, 0, 3000, 3000);

        // Random platforms for now
        this.platform = this.add.rectangle(320, 344, 640, 32, 0x4a4a5a);
        this.otherPlatform = this.add.rectangle(700, 200, 200, 100, 0x4a4a5a);
        this.anotherPlatform = this.add.rectangle(600, 300, 200, 100, 0x4a4a5a);
        this.physics.add.existing(this.platform, true); // true = static body
        this.physics.add.existing(this.otherPlatform, true);
        this.physics.add.existing(this.anotherPlatform, true);

        // Collision physics
        this.physics.add.collider(this.player.sprite, this.platform);
        this.physics.add.collider(this.player.sprite, this.otherPlatform);
        this.physics.add.collider(this.player.sprite, this.anotherPlatform);

        // Initialize the movement keys
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update() {
        this.player.sprite.body.setVelocityX(0);
        const speed = 250;

        // Player Health Bar
        this.player.hpBarBg.x = this.player.sprite.x;
        this.player.hpBarBg.y = this.player.sprite.y - 28;
        this.player.hpBar.x = this.player.sprite.x - 20;
        this.player.hpBar.y = this.player.sprite.y - 28;

        // Enemy Health Bar/Visuals
        this.enemy.syncVisuals();

        // Movement
        if(this.cursors.left.isDown || this.wasd.A.isDown) {
            this.player.sprite.play('ninja-idle-left', true);
            this.player.sprite.body.setVelocityX(-speed);
        }
        if(this.cursors.right.isDown || this.wasd.D.isDown) {
            this.player.sprite.play('ninja-idle-right', true);
            this.player.sprite.body.setVelocityX(speed);
        }
        if((Phaser.Input.Keyboard.JustDown(this.spaceKey) || this.cursors.up.isDown) && this.player.sprite.body.blocked.down) {
            this.player.sprite.body.setVelocityY(-750);
        }

        // Enemy AI

        this.enemy.tryAttack(this.player, this.game.loop.delta);
    }

    spawnEnemy(x, y, config) {
        const enemy = new Enemy(this, x, y, config);
        return enemy;
    }

}

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 640,
    height: 360,
    pixelArt: true,
    backgroundColor: '#1a1a2e',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 2000 },
            debug: false,
        }
    },
    scene: GameScene,
}

const game = new Phaser.Game(config);