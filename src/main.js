import Phaser from 'phaser';
import Player from './Player.js';
import Enemy from './Enemy.js';
import { cardData } from './upgrades.js'

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
        this.load.image('tile', '/assets/tilemaps/tile.png');
        this.load.image('tile-small', '/assets/tilemaps/tile-small.png');
        this.load.tilemapTiledJSON('tilemap', '/assets/tilemaps/tilemap.json');
    }

    create() {
        const map = this.make.tilemap({ key: 'tilemap' });
        const tilesetSmall = map.addTilesetImage('tile-small', 'tile-small');

        this.groundLayer = map.createLayer('Tile Layer 1', tilesetSmall, 0, 0);
        this.groundLayer.setCollisionByProperty({ collides: true });

        const spawnLayer = map.getObjectLayer('Spawns');

        const playerSpawn = spawnLayer.objects.find(obj => obj.name === 'player-spawn');
        const playerSpawnCentered = this.getObjectCenter(playerSpawn);
        this.player = new Player(this, playerSpawnCentered.x, playerSpawnCentered.y);

        // Boss Wall Trigger to seal boss room once inside
        this.bossRoomWallTrigger = spawnLayer.objects.find(obj => obj.name === 'boss-wall-trigger');
        
        const triggerZoneCenter = this.getObjectCenter(this.bossRoomWallTrigger);
        const triggerZone = this.add.rectangle(triggerZoneCenter.x, triggerZoneCenter.y, this.bossRoomWallTrigger.width, this.bossRoomWallTrigger.height, 0xff0000, 0);
        
        this.physics.add.existing(triggerZone, true);
        this.physics.add.overlap(this.player.sprite, triggerZone, () => {
            this.enterBossRoom()
        });

        this.input.mouse.disableContextMenu();

        this.zoomKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
        this.debugZoomedOut = false;

        this.physics.add.collider(this.player.sprite, this.groundLayer);

        // Animation Creation
        this.anims.create({ key: 'ninja-idle-left', frames: this.anims.generateFrameNumbers('ninja-idle', { start: 8, end: 15 }), frameRate: 4, repeat: -1 });
        this.anims.create({ key: 'ninja-idle-right', frames: this.anims.generateFrameNumbers('ninja-idle', { start: 0, end: 7 }), frameRate: 4, repeat: -1 });
        
        this.anims.create({ key: 'enemy-idle-left', frames: this.anims.generateFrameNumbers('enemy-idle', { start: 6, end: 11 }), frameRate: 3, repeat: -1 });
        this.anims.create({ key: 'enemy-idle-right', frames: this.anims.generateFrameNumbers('enemy-idle', { start: 0, end: 5 }), frameRate: 3, repeat: -1 });

        this.anims.create({ key: 'ninja-attack-left', frames: this.anims.generateFrameNumbers('ninja-attack', {start: 0, end: 2 }), frameRate: 12, repeat: 0 });
        this.anims.create({ key: 'ninja-attack-right', frames: this.anims.generateFrameNumbers('ninja-attack', {start: 3, end: 5 }), frameRate: 12, repeat: 0 });

        this.player.sprite.play('ninja-idle-right');
        
        this.player.sprite.on('animationcomplete', (animation) => {
            if(this.player.alive) {
                
                if(animation.key === 'ninja-attack-left') {
                    this.player.isAttacking = false;
                    this.player.sprite.play('ninja-idle-left', true);
                }
                if(animation.key === 'ninja-attack-right') {
                    this.player.isAttacking = false;
                    this.player.sprite.play('ninja-idle-right', true);
                }
            }
        });

        // Spawn First Enemy
        this.enemies = [];
        const enemySpawnPoints = spawnLayer.objects.filter(obj => obj.name === 'enemy-spawn');
        enemySpawnPoints.forEach(point => {
            this.spawnEnemy(point.x + point.width / 2, point.y + point.height / 2, {
                name: 'Enemeanie',
                hp: 20,
                maxHp: 20,
            });
        });

        this.bossMinionSpawnPoints = spawnLayer.objects.filter(obj => obj.name === 'boss-minion-spawn');
        this.bossSpawnPoint = spawnLayer.objects.find(obj => obj.name === 'boss-enemy-spawn');

        // Add physics to player/enemy
        this.physics.add.existing(this.player.sprite);

        this.enemies.forEach(enemy => this.physics.add.existing(enemy.sprite));
        this.player.sprite.body.setSize(25, 32);
        this.player.sprite.body.setCollideWorldBounds(true);
        
        // Camera stuff
        this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        
        // Collision physics
        this.addPlatformColliders(this.player.sprite);

        // Initialize the movement keys
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.xKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

        this.input.keyboard.on('keydown-X', () => {
            this.player.attackRequested = true;
        });
    }

    update() {
        if(this.gamePaused) return;

        // For seeing rooms - TAKE OUT WHEN GOING LIVE: TODO
        if(Phaser.Input.Keyboard.JustDown(this.zoomKey)) {
            this.debugZoomedOut = !this.debugZoomedOut;
            this.cameras.main.setZoom(this.debugZoomedOut ? 0.3 : 1);
        }

        // Player Health Bar
        this.player.hpBarBg.x = this.player.sprite.x;
        this.player.hpBarBg.y = this.player.sprite.y - 28;
        this.player.hpBar.x = this.player.sprite.x - 20;
        this.player.hpBar.y = this.player.sprite.y - 28;

        // Enemy Health Bar/Visuals
        this.enemies.forEach(enemy => {
            if(enemy.alive) enemy.syncVisuals();
        });

        if(this.player.alive) {
            const grounded = this.player.sprite.body.blocked.down;
            const airControl = 0.05;

            if(grounded) {
                this.player.sprite.body.setVelocityX(0);

                // Movement
                if(this.cursors.left.isDown || this.wasd.A.isDown) {
                    this.player.lastDirectionFaced = 'left';
                    this.player.sprite.body.setVelocityX(-this.player.speed);
                    if(!this.player.isAttacking) {
                        this.player.sprite.play('ninja-idle-left', true);
                    }
                }
                if(this.cursors.right.isDown || this.wasd.D.isDown) {
                    this.player.lastDirectionFaced = 'right';
                    this.player.sprite.body.setVelocityX(this.player.speed);
                    if(!this.player.isAttacking) {
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

            // Jumping
            const jumpKeyDown = this.spaceKey.isDown || this.cursors.up.isDown;
            const jumpKeyJustPressed = Phaser.Input.Keyboard.JustDown(this.spaceKey) || Phaser.Input.Keyboard.JustDown(this.cursors.up);

            if(jumpKeyJustPressed && this.player.sprite.body.blocked.down) {
                this.player.sprite.body.setVelocityY(-750);
            }

            if(!jumpKeyDown && this.player.sprite.body.velocity.y < 0) {
                this.player.sprite.body.setVelocityY(this.player.sprite.body.velocity.y * 0.5);
            }

            // Attack Cooldown Tick
            if(this.player.attackCooldown > 0) {
                this.player.attackCooldown -= this.game.loop.delta;
            }
            
            // Attack
            if(this.player.attackRequested && this.player.attackCooldown <= 0) {
                this.player.isAttacking = true;
                this.player.sprite.play(this.player.lastDirectionFaced === 'left' ? 'ninja-attack-left' : 'ninja-attack-right', true);
                
                const aliveEnemies = this.enemies.filter(enemy => enemy.alive);
                aliveEnemies.forEach(enemy => {
                    const distance = Phaser.Math.Distance.Between(
                        this.player.sprite.x, this.player.sprite.y,
                        enemy.sprite.x, enemy.sprite.y,
                    );

                    if(distance <= this.player.attackRange) {
                        enemy.takeDamage(10, this.player.sprite);
                        this.showHitEffect(enemy.sprite.x, enemy.sprite.y);
                        this.flashHit(enemy.sprite);
                    }
                });

                this.player.attackCooldown = this.player.attackCooldownDuration;
            }

            this.player.attackRequested = false;


        }

        // Enemy AI
        this.enemies.forEach(enemy => {
            if(enemy.alive) {
                enemy.moveTowardPlayer(this.player);
                enemy.tryAttack(this.player, this.game.loop.delta);
            }
        });
    }

    // ------------------ ENEMY FUNCTIONS ------------------ //
    spawnEnemy(x, y, config) {
        const enemy = new Enemy(this, x, y, config);
        this.enemies.push(enemy);
        this.addPlatformColliders(enemy.sprite);
        return enemy;
    }

    removeEnemyFromArray(enemyToRemove) {
        this.enemies = this.enemies.filter(enemy => enemy !== enemyToRemove);

        if(this.bossRoomEntered && this.bossRoomEnemies) {
            this.bossRoomEnemies = this.bossRoomEnemies.filter(enemy => enemy !== enemyToRemove);
        }
    }
    
    // ------------------- UPGRADE CHOICES ---------------- //
    showUpgradeChoice() {
        this.gamePaused = true;
        this.physics.pause();

        const { width, height } = this.cameras.main;

        // Dark Overlay
        const zoom = this.cameras.main.zoom;
        this.upgradeOverlay = this.add.rectangle(width / 2, height /2, width / zoom, height / zoom, 0x000000, 0.7)
            .setScrollFactor(0)
            .setDepth(90);

        // Header Text
        this.upgradeHeader = this.add.text(width / 2, 50,
            'Everything has a price.  Whichever power you choose, \nthe other will go to all future bosses.  Choose wisely...', {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ffffff',
                align: 'center',
                resolution: 3,
                wordWrap: { width: width - 60 },
            }
        )
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(101);

        const cardWidth = 180;
        const cardHeight = 220;
        const gap = 40;
        const centerY = height / 2;

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
                fontSize: '20px',
                color: '#fbbf24',
                align: 'center',
                resolution: 3,
                wordWrap: {
                    width: cardWidth - 20,
                }
            })
                .setOrigin(0.5)
                .setScrollFactor(0)
                .setDepth(101);
            
            const desc = this.add.text(x, centerY + 10, cardData[i].desc, {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ffffff',
                align: 'center',
                resolution: 3,
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

        this.upgradeOverlay.destroy();
        this.upgradeHeader.destroy();

        this.physics.resume();
        this.gamePaused = false;
    }

    // --------- PLATFORMS --------- //
    addPlatformColliders(sprite) {
        this.physics.add.collider(sprite, this.groundLayer);
    }

    // ---------- Visual Effects ----------- //
    showHitEffect(x, y) {
        const spark = this.add.circle(x, y, 6, 0xffffff, 0.9);
        this.tweens.add({
            targets: spark,
            scale: 2.5,
            alpha: 0,
            duration: 150,
            onComplete: () => spark.destroy(),
        });
    }

    flashHit(sprite) {
        if(!sprite || !sprite.active) return;
        sprite.setTint(0xff0000);
        this.time.delayedCall(100, () => {
            if(sprite.active) {
                sprite.clearTint();
            }
        });
    }

    // -------- BOSS ROOM STUFF ---------- //
    enterBossRoom() {
        if(this.bossRoomEntered) return;
        this.bossRoomEntered = true;

        this.cameras.main.stopFollow();
        this.cameras.main.setZoom(0.75);
        this.cameras.main.centerOn(1144, 166); // tune to actual arena

        this.bossRoomEnemies = [];
        this.bossMinionSpawnPoints.forEach(point => {
            const enemy = this.spawnEnemy(
                point.x,
                point.y,
                {
                    name: 'Minion',
                    hp: 30,
                    maxHp: 30
                }
            );
            this.bossRoomEnemies.push(enemy);
        });

        const boss = this.spawnEnemy(
            this.bossSpawnPoint.x,
            this.bossSpawnPoint.y,
            { 
                name: 'Boss',
                hp: 50,
                maxHp: 50,
                isBoss: true,
            }
        );
        console.log('BOSS: ', boss);
        this.bossRoomEnemies.push(boss);
        console.log('BOSS ROOM ENEMIES: ', this.bossRoomEnemies);

        this.sealBossRoom();
    }

    sealBossRoom() {
        const bossRoomWallCentered = this.getObjectCenter(this.bossRoomWallTrigger);
        const tileSize = 16;
        const tileCount = 5;
        
        const bossRoomWallTiles = [];

        for(let i = 0; i <= tileCount; i++) {
            const tile = this.add.tileSprite(
                bossRoomWallCentered.x - 56,
                this.bossRoomWallTrigger.y + (i * tileSize),
                tileSize,
                tileSize,
                'tile-small',
            );
            
            this.physics.add.existing(tile, true);
            this.physics.add.collider(this.player.sprite, tile);
            bossRoomWallTiles.push(tile);
        }
    }

    // ------- HELPERS -------- //
    getObjectCenter(obj) {
        return {
            x: obj.x + obj.width / 2,
            y: obj.y + obj.height / 2,
        };
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