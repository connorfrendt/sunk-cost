import Phaser from 'phaser';
import Player from './Player.js';
import Enemy from './Enemy.js';

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Ninja 
        this.load.spritesheet('ninja-idle', '/assets/characters/ninja-idle.png', {
            frameWidth: 144,
            frameHeight: 144,
        });
        this.load.spritesheet('ninja-attack', '/assets/characters/ninja-attack.png', {
            frameWidth: 144,
            frameHeight: 144,
        });
        this.load.spritesheet('enemy-idle', '/assets/characters/enemeanie-idle.png', {
            frameWidth: 96,
            frameHeight: 96,
        });
    }

    create() {
        this.input.mouse.disableContextMenu();

        this.zoomKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
        this.debugZoomedOut = false;

        this.player = new Player(this, 320, 180);

        // Animation Creation
        this.anims.create({ key: 'ninja-idle-left', frames: this.anims.generateFrameNumbers('ninja-idle', { start: 8, end: 15 }), frameRate: 4, repeat: -1 });
        this.anims.create({ key: 'ninja-idle-right', frames: this.anims.generateFrameNumbers('ninja-idle', { start: 0, end: 7 }), frameRate: 4, repeat: -1 });
        
        this.anims.create({ key: 'enemy-idle-left', frames: this.anims.generateFrameNumbers('enemy-idle', { start: 6, end: 11 }), frameRate: 3, repeat: -1 });
        this.anims.create({ key: 'enemy-idle-right', frames: this.anims.generateFrameNumbers('enemy-idle', { start: 0, end: 5 }), frameRate: 3, repeat: -1 });

        this.anims.create({ key: 'ninja-attack-left', frames: this.anims.generateFrameNumbers('ninja-attack', {start: 0, end: 2 }), frameRate: 12, repeat: 0 });
        this.anims.create({ key: 'ninja-attack-right', frames: this.anims.generateFrameNumbers('ninja-attack', {start: 3, end: 5 }), frameRate: 12, repeat: 0 });

        this.player.sprite.play('ninja-idle-right');
        this.isAttacking = false;
        this.player.sprite.on('animationcomplete', (animation) => {
            if(this.player.alive) {
                
                if(animation.key === 'ninja-attack-left') {
                    this.isAttacking = false;
                    this.player.sprite.play('ninja-idle-left', true);
                }
                if(animation.key === 'ninja-attack-right') {
                    this.isAttacking = false;
                    this.player.sprite.play('ninja-idle-right', true);
                }
            }
        });

        this.enemies = [];
        this.enemy = this.spawnEnemy(100, 300, {
            name: 'Enemeanie',
            hp: 100,
            maxHp: 100,
        });

        this.physics.add.existing(this.player.sprite);
        this.physics.add.existing(this.enemy.sprite);
        this.player.sprite.body.setSize(25, 32);
        this.enemy.sprite.body.setSize(32, 32);

        this.player.sprite.body.setCollideWorldBounds(true);
        this.enemy.sprite.body.setCollideWorldBounds(true);
        
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
        this.physics.add.collider(this.enemy.sprite, this.platform);
        this.physics.add.collider(this.player.sprite, this.otherPlatform);
        this.physics.add.collider(this.enemy.sprite, this.otherPlatform);
        this.physics.add.collider(this.player.sprite, this.anotherPlatform);
        this.physics.add.collider(this.enemy.sprite, this.anotherPlatform);

        // Initialize the movement keys
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.xKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

        // Basic Attack
        this.attackRequested = false
        this.attackCooldown = 0;
        this.attackCooldownDuration = 500; // ms
        

        this.input.keyboard.on('keydown-X', () => {
            this.attackRequested = true;
        });
    }

    update() {
        // For seeing rooms - TAKE OUT WHEN GOING LIVE: TODO
        if(Phaser.Input.Keyboard.JustDown(this.zoomKey)) {
            this.debugZoomedOut = !this.debugZoomedOut;
            this.cameras.main.setZoom(this.debugZoomedOut ? 0.2 : 1);
        }

        // Player Health Bar
        this.player.hpBarBg.x = this.player.sprite.x;
        this.player.hpBarBg.y = this.player.sprite.y - 28;
        this.player.hpBar.x = this.player.sprite.x - 20;
        this.player.hpBar.y = this.player.sprite.y - 28;

        // Enemy Health Bar/Visuals
        this.enemy.syncVisuals();

        if(this.player.alive) {
            const grounded = this.player.sprite.body.blocked.down;
            const airControl = 0.10;

            if(grounded) {
                this.player.sprite.body.setVelocityX(0);

                // Movement
                if(this.cursors.left.isDown || this.wasd.A.isDown) {
                    // this.player.sprite.play('ninja-idle-left', true);
                    this.player.lastDirectionFaced = 'left';
                    this.player.sprite.body.setVelocityX(-this.player.speed);
                    if(!this.isAttacking) {
                        this.player.sprite.play('ninja-idle-left', true);
                    }
                }
                if(this.cursors.right.isDown || this.wasd.D.isDown) {
                    // this.player.sprite.play('ninja-idle-right', true);
                    this.player.lastDirectionFaced = 'right';
                    this.player.sprite.body.setVelocityX(this.player.speed);
                    if(!this.isAttacking) {
                        this.player.sprite.play('ninja-idle-right', true);
                    }
                }
            }
            else {
                // Airborne: nudge toward the target speed instead of snapping to it
                let targetVelocityX = this.player.sprite.body.velocity.x; // default: keep current momentum
                
                if(this.cursors.left.isDown || this.wasd.A.isDown) {
                    targetVelocityX = -this.player.speed;
                }
                else if (this.cursors.right.isDown || this.wasd.D.isDown) {
                    targetVelocityX = this.player.speed;
                }

                const currentVelocityX = this.player.sprite.body.velocity.x;
                const newVelocityX = Phaser.Math.Linear(currentVelocityX, targetVelocityX, airControl);
                this.player.sprite.body.setVelocityX(newVelocityX);
            }


            if((Phaser.Input.Keyboard.JustDown(this.spaceKey) || this.cursors.up.isDown) && this.player.sprite.body.blocked.down) {
                this.player.sprite.body.setVelocityY(-750);
            }

            // Attack Cooldown Tick
            if(this.attackCooldown > 0) {
                this.attackCooldown -= this.game.loop.delta;
            }
            
            // Attack
            if(this.attackRequested && this.attackCooldown <= 0) {
                this.isAttacking = true;
                this.player.sprite.play(this.player.lastDirectionFaced === 'left' ? 'ninja-attack-left' : 'ninja-attack-right', true);
                
                const aliveEnemies = this.enemies.filter(enemy => enemy.alive);
                const distance = Phaser.Math.Distance.Between(
                    this.player.sprite.x, this.player.sprite.y,
                    this.enemy.sprite.x, this.enemy.sprite.y
                );

                if(distance <= this.player.attackRange) {
                    this.enemy.takeDamage(10, this.player.sprite);
                }

                this.attackCooldown = this.attackCooldownDuration;
            }

            this.attackRequested = false;


        }

        // Enemy AI
        this.enemy.tryAttack(this.player, this.game.loop.delta);
    }

    spawnEnemy(x, y, config) {
        const enemy = new Enemy(this, x, y, config);
        this.enemies.push(enemy);
        return enemy;
    }

    showUpgradeChoice() {
        const { width, height } = this.cameras.main;
        const cardWidth = 180;
        const cardHeight = 220;
        const gap = 40;
        const centerY = height / 2;

        const cardData = [
            { title: '+30 DAMAGE', desc: 'Adds +30 damage per hit' },
            { title: 'TICKING DAMAGE', desc: '5 damage per second until the enemy dies' },
        ];

        const xPositions = [
            width / 2 - cardWidth / 2 - gap / 2,
            width / 2 + cardWidth / 2 + gap / 2,
        ];

        this.upgradeCards = xPositions.map((x, i) => {
            const bg = this.add.rectangle(x, centerY, cardWidth, cardHeight, 0x2a2a3a)
                .setStrokeStyle(2, 0x4a4a5a)
                .setScrollFactor(0)
                .setDepth(100)
                .setInteractive({ useHandCursor: true });
            
            const title = this.add.text(x, centerY - 60, cardData[i].title, {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#fbbf24',
                align: 'center',
                wordWrap: {
                    width: cardWidth - 20,
                }
            })
                .setOrigin(0.5)
                .setScrollFactor(0)
                .setDepth(101);
            
            const desc = this.add.text(x, centerY + 10, cardData[i].desc, {
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#ffffff',
                align: 'center',
                wordWrap: {
                    width: cardWidth - 20,
                }
            })
                .setOrigin(0.5)
                .setScrollFactor(0)
                .setDepth(101);
            
            bg.on('pointerdown', () => this.chooseUpgrade(i));

            return { bg, title, desc };
        });
    }

    chooseUpgrade(index) {
        console.log('Chose upgrade index: ', index);
        this.upgradeCards.forEach(({ bg, title, desc }) => {
            bg.destroy();
            title.destroy();
            desc.destroy();
        });

        this.upgradeCards = [];
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
            debug: true,
        }
    },
    scene: GameScene,
}

const game = new Phaser.Game(config);