import Phaser from 'phaser';

import TitleScene from './TitleScene.js';
import ControlsScene from './Controls.js';

import Player from './Player.js';
import SageNinja from './SageNinja.js';
import Enemy from './Enemy.js';

import { sageNinjaDialogueLines } from './SageNinjaDialogue.js';

import { cardData, TICK_COUNT, TICK_DAMAGE_AMOUNT, TICK_INTERVAL_MS } from './upgrades.js'

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.spritesheet('ninja-idle', '/assets/characters/ninja-idle.png', {
            frameWidth: 144,
            frameHeight: 144,
        });
        this.load.spritesheet('ninja-attack', '/assets/characters/ninja-attack.png', {
            frameWidth: 144,
            frameHeight: 144,
        });
        this.load.spritesheet('sage-ninja', '/assets/characters/sage-ninja.png', {
            frameWidth: 36,
            frameHeight: 36,
        });
        this.load.spritesheet('enemy-idle', '/assets/characters/enemeanie-idle.png', {
            frameWidth: 144,
            frameHeight: 144,
        });
        this.load.spritesheet('enemy-attack', '/assets/characters/enemeanie-attack.png', {
            frameWidth: 144,
            frameHeight: 144,
        });
        this.load.spritesheet('enemy-hurt', '/assets/characters/enemeanie-hurt.png', {
            frameWidth: 144,
            frameHeight: 144,
        });
        this.load.spritesheet('brazier', '/assets/tilemaps/brazier.png', {
            frameWidth: 16,
            frameHeight: 16,
        });
        this.load.spritesheet('chest', '/assets/tilemaps/chest.png', {
            frameWidth: 16,
            frameHeight: 16,
        });
        this.load.spritesheet('spikes', '/assets/tilemaps/spikes.png', {
            frameWidth: 16,
            frameHeight: 16,
        });
        this.load.image('shuriken', '/assets/projectiles/shuriken.png');
        this.load.spritesheet('purple-tileset', '/assets/tilemaps/purple-tileset.png', {
            frameWidth: 16,
            frameHeight: 16,
        });
        this.load.tilemapTiledJSON('purple-map', '/assets/tilemaps/purple-map.json');

        this.load.image('icon-damage', '/assets/icons/icon-damage.png');
        this.load.image('icon-glasscannon', '/assets/icons/icon-glasscannon.png');
        this.load.image('icon-lifedrain', '/assets/icons/icon-lifedrain.png');
        this.load.image('icon-thorns', '/assets/icons/icon-thorns.png');
        this.load.image('icon-shuriken', '/assets/icons/icon-shuriken.png');
        this.load.image('icon-ticking', '/assets/icons/icon-ticking.png');

        this.load.audio('sage-ninja-line-1', '/assets/audio/sage-ninja-line-1.mp3');
        this.load.audio('sage-ninja-line-2', '/assets/audio/sage-ninja-line-2.mp3');
        this.load.audio('sage-ninja-line-3', '/assets/audio/sage-ninja-line-3.mp3');
        this.load.audio('end-boss-beg-taunt', '/assets/audio/end-boss-beg-taunt.mp3');
        this.load.audio('boss-taunt', '/assets/audio/boss-taunt.mp3');

        this.load.audio('sword-miss', '/assets/audio/sword-miss.mp3');
        this.load.audio('sword-hit', '/assets/audio/sword-hit.mp3');
        this.load.audio('click', '/assets/audio/click.mp3');
        this.load.audio('player-hit', '/assets/audio/player-hit.mp3');
        this.load.audio('dungeon', '/assets/audio/dungeon.mp3');
        this.load.audio('heal', '/assets/audio/heal.mp3');
        this.load.audio('shuriken-miss', '/assets/audio/shuriken-miss.mp3');
        this.load.audio('jump', '/assets/audio/jump.mp3');
        this.load.audio('enemy-dead', '/assets/audio/enemy-dead.mp3');
    }

    create() {
        this.gamePaused = false;
        this.currentActiveBossRoom = null;

        this.music = this.sound.add('dungeon', { loop: true, volume: 0.1 });
        this.music.play();

        // Animation Creation
        if(!this.anims.exists('ninja-idle-left')) {
            this.anims.create({ key: 'ninja-idle-left', frames: this.anims.generateFrameNumbers('ninja-idle', { start: 8, end: 15 }), frameRate: 4, repeat: -1 });
            this.anims.create({ key: 'ninja-idle-right', frames: this.anims.generateFrameNumbers('ninja-idle', { start: 0, end: 7 }), frameRate: 4, repeat: -1 });
            
            this.anims.create({ key: 'sage-ninja-left', frames: this.anims.generateFrameNumbers('sage-ninja', { start: 0, end: 3 }), frameRate: 1, repeat: -1 });
            this.anims.create({ key: 'sage-ninja-right', frames: this.anims.generateFrameNumbers('sage-ninja', { start: 4, end: 7 }), frameRate: 1, repeat: -1 });
            
            this.anims.create({ key: 'ninja-attack-left', frames: this.anims.generateFrameNumbers('ninja-attack', {start: 0, end: 2 }), frameRate: 12, repeat: 0 });
            this.anims.create({ key: 'ninja-attack-right', frames: this.anims.generateFrameNumbers('ninja-attack', {start: 3, end: 5 }), frameRate: 12, repeat: 0 });
            this.anims.create({ key: 'ninja-throw-left', frames: this.anims.generateFrameNumbers('ninja-attack', {start: 6, end: 8 }), frameRate: 18, repeat: 0 });
            this.anims.create({ key: 'ninja-throw-right', frames: this.anims.generateFrameNumbers('ninja-attack', {start: 9, end: 11 }), frameRate: 18, repeat: 0 });
            
            this.anims.create({ key: 'enemy-idle-left', frames: this.anims.generateFrameNumbers('enemy-idle', { start: 6, end: 11 }), frameRate: 3, repeat: -1 });
            this.anims.create({ key: 'enemy-idle-right', frames: this.anims.generateFrameNumbers('enemy-idle', { start: 0, end: 5 }), frameRate: 3, repeat: -1 });
            
            this.anims.create({ key: 'enemy-hurt-left', frames: this.anims.generateFrameNumbers('enemy-hurt', { start: 1, end: 1 }), frameRate: 4, repeat: 0 });
            this.anims.create({ key: 'enemy-hurt-right', frames: this.anims.generateFrameNumbers('enemy-hurt', { start: 0, end: 0 }), frameRate: 4, repeat: 0 });
    
            this.anims.create({
                key: 'enemy-attack-right',
                frames: [
                    { key: 'enemy-attack', frame: 0, duration: 50 },
                    { key: 'enemy-attack', frame: 1, duration: 50 },
                    { key: 'enemy-attack', frame: 2, duration: 500 },
                    { key: 'enemy-attack', frame: 3, duration: 50 },
                    { key: 'enemy-attack', frame: 4, duration: 50 },
                ],
                repeat: 0
            });
            this.anims.create({
                key: 'enemy-attack-left',
                frames: [
                    { key: 'enemy-attack', frame: 5, duration: 50 },
                    { key: 'enemy-attack', frame: 6, duration: 50 },
                    { key: 'enemy-attack', frame: 7, duration: 500 },
                    { key: 'enemy-attack', frame: 8, duration: 50 },
                    { key: 'enemy-attack', frame: 9, duration: 50 },
                ],
                repeat: 0
            });
    
            this.anims.create({ key: 'brazier', frames: this.anims.generateFrameNumbers('brazier', { start: 0, end: 11 }), frameRate: 6, repeat: -1 });
        }

        // Create Map
        const map = this.make.tilemap({ key: 'purple-map' });
        const purpleTileSet = map.addTilesetImage('purple-tileset', 'purple-tileset');
        this.groundLayer = map.createLayer('Tile Layer 1', purpleTileSet, 0, 0);
        this.groundLayer.setCollisionByProperty({ collides: true });

        this.runStartTime = this.time.now;
        this.finalTime = null;

        // Grabs all the object spawns in from Tiled
        this.spawnLayer = map.getObjectLayer('Spawn Layer');

        // Spawns Player
        const playerSpawn = this.getSpawnObject('player-spawn');
        const playerSpawnCentered = this.getObjectCenter(playerSpawn);
        this.player = new Player(this, playerSpawnCentered.x, playerSpawnCentered.y);
        // Add physics to player
        this.physics.add.existing(this.player.sprite);
        this.player.sprite.body.setSize(25, 32);
        this.player.sprite.body.setCollideWorldBounds(true);

        this.sound.play('end-boss-beg-taunt', { volume: 0.7 });
        const { width, height } = this.cameras.main;
        const spawnSubtitle = this.add.text(width / 2, 80, 'Mmm, fresh meat... everyone pays eventually.  Let\'s see what you\'re willing to lose...', {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#ffffff',
            align: 'center',
            resolution: 3,
            wordWrap: { width: width - 80 },
        })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(60)
            .setAlpha(0);
        
        this.tweens.add({
            targets: spawnSubtitle,
            alpha: 1,
            duration: 500,
            yoyo: true,
            hold: 8000,
            onComplete: () => spawnSubtitle.destroy(),
        });

        const spikesTileset = map.addTilesetImage('spikes', 'spikes');
        this.spikesLayer = map.createLayer('Spikes Layer', spikesTileset, 0, 0);
        this.spikesLayer.setCollisionByProperty({ damage: true });

        this.physics.add.overlap(this.player.sprite, this.spikesLayer, (playerSprite, tile) => {
            if(tile.index === -1) {
                return;
            };
            this.player.takeDamage(20);
        });
        
        // Respawn Points
        const beginningRespawn = this.getSpawnObject('beginning-respawn-point');
        const beginningRespawnCentered = this.getObjectCenter(beginningRespawn);
        this.currentRespawnPoint = {
            x: beginningRespawnCentered.x,
            y: beginningRespawnCentered.y,
        }

        /*
        // ------------- WALL STUFF ------------ //
        */

        // Grab boss wall objects
        this.bossDefeated = {};
        this.bossRoomEntered = {};
        this.bossRoomEnemies = {};
        this.bossArenaCenter = {};
        this.bossRoomEntranceWallTiles = {};
        this.bossRoomExitWallTiles = {};
        this.bossRoomWallEntranceObj = {};
        this.bossRoomWallExitObj = {};
        this.bossEnemySpawn = {};
        this.bossRoomWallTrigger = {};

        this.corridorExit = {};
        this.corridorExitWallTiles = {};
        this.corridorWallTilesByName = {};

        this.respawnTrigger = {};
        this.respawnPoint = {};

        const roomWords = ['zero', 'one', 'two', 'three', 'four'];

        [1, 2, 3, 4].forEach(roomNumber => {
            this.bossRoomWallEntranceObj[roomNumber] = this.getRoomObject('boss-room-wall-entrance', roomNumber);
            this.bossRoomWallExitObj[roomNumber] = this.getRoomObject('boss-room-wall-exit', roomNumber);
            this.bossArenaCenter[roomNumber] = this.getObjectCenter(this.getRoomObject('boss-arena', roomNumber));
            this.bossEnemySpawn[roomNumber] = this.getRoomObject('boss-enemy-spawn', roomNumber);
            this.bossDefeated[roomNumber] = false;
            this.bossRoomEntered[roomNumber] = false;

            this.bossRoomWallTrigger[roomNumber] = this.getRoomObject('boss-room-wall-trigger', roomNumber);
            const bossRoomWallTriggerCenter = this.getObjectCenter(this.bossRoomWallTrigger[roomNumber]);
            const triggerZone = this.add.rectangle(bossRoomWallTriggerCenter.x, bossRoomWallTriggerCenter.y, this.bossRoomWallTrigger[roomNumber].width, this.bossRoomWallTrigger[roomNumber].height, 0xff0000, 0);
        
            this.physics.add.existing(triggerZone, true);
            this.physics.add.overlap(this.player.sprite, triggerZone, () => {
                this.enterBossRoom(roomNumber);
            });

            this.corridorExit[roomNumber] = this.getRoomObject('corridor-exit', roomNumber);
            this.corridorExitWallTiles[roomNumber] = this.buildWallTiles(this.corridorExit[roomNumber]);
            this.corridorWallTilesByName[roomWords[roomNumber]] = this.corridorExitWallTiles[roomNumber];

            this.respawnTrigger[roomNumber] = this.getRoomObject('respawn-trigger', roomNumber);
            this.respawnPoint[roomNumber] = this.getRoomObject('respawn-point', roomNumber);

            const respawnTriggerCenter = this.getObjectCenter(this.respawnTrigger[roomNumber]);
            const respawnZone = this.add.rectangle(respawnTriggerCenter.x, respawnTriggerCenter.y, this.respawnTrigger[roomNumber].width, this.respawnTrigger[roomNumber].height, 0xff0000, 0);
            
            this.physics.add.existing(respawnZone, true);
            this.physics.add.overlap(this.player.sprite, respawnZone, () => {
                const respawnPointCentered = this.getObjectCenter(this.respawnPoint[roomNumber]);
                this.currentRespawnPoint = {
                    x: respawnPointCentered.x,
                    y: respawnPointCentered.y,
                }
            });
        });
        
        this.currentEncounterWallTiles = null;

        /*------------------------------------------ */

        // ----------- UPGRADE STUFF ----------- //
        this.availableUpgrades = [...cardData];
        this.currentUpgradeOptions = [];
        this.pendingBossUpgrades = [];
        this.powerIcons = [];

        // ----------- SAGE NINJA STUFF ----------- //
        this.sageNinjaPoints = this.spawnLayer.objects.filter(obj => obj.name === 'sage-ninja');
        this.sageNinjas = this.sageNinjaPoints.map(point => {
            const sageNinjaCenter = this.getObjectCenter(point);
            const corridorName = point.properties?.find(property => property.name === 'corridor')?.value;
            const wallTiles = this.corridorWallTilesByName[corridorName];
            return new SageNinja(this, sageNinjaCenter.x, sageNinjaCenter.y, wallTiles);
        });

        this.sageNinjaEncounterCount = 0;

        // Spawn Braziers
        const brazierPoints = this.spawnLayer.objects.filter(obj => obj.name === 'brazier');
        brazierPoints.forEach(point => {
            const brazierCenter = this.getObjectCenter(point);
            const brazier = this.add.sprite(brazierCenter.x, brazierCenter.y, 'brazier');
            brazier.play('brazier');
        });

        // Spawn Chests
        this.chests = [];

        const chestSpawns = this.spawnLayer.objects.filter(obj => obj.name === 'chest');
        chestSpawns.forEach(point => {
            const chestCenter = this.getObjectCenter(point);
        
            const chest = {
                sprite: this.add.sprite(chestCenter.x, chestCenter.y, 'chest', 0),
                isOpen: false,
            };
    
            this.chests.push(chest);
        });

        this.roomDifficultyByRoom = {
            1: 1.0,
            2: 1.5,
            3: 2.0,
            4: 2.5,
        }

        this.bossDamageMultiplierByRoom = {
            1: 1.0,
            2: 1.2,
            3: 1.4,
            4: 1.6,
        }

        // Spawn First Enemy
        this.enemies = [];
        const enemySpawnPoints = this.spawnLayer.objects.filter(obj => obj.name === 'enemy-spawn');
        enemySpawnPoints.forEach(point => {
            const aggroOnSight = point.properties?.find(property => property.name === 'aggroOnSight')?.value || false;
            const giveUpRange = point.properties?.find(property => property.name === 'giveUpRange')?.value || false;
            const roomNumber = point.properties?.find(property => property.name === 'roomNumber')?.value || 1;
            const roomDifficulty = this.roomDifficultyByRoom[roomNumber];

            this.spawnEnemy(point.x + point.width / 2, point.y + point.height / 2, this.scaledEnemyConfig({
                name: 'Enemeanie',
                hp: 30,
                maxHp: 30,
                aggroOnSight,
                giveUpRange,
            }, roomDifficulty));
        });

        this.interactPrompt = this.add.text(0, 0, 'V - Interact', {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#ffffff',
            resolution: 3,
        })
            .setOrigin(0.5)
            .setDepth(60)
            .setAlpha(0);

        this.playerNearInteractable = false;

        // Door Light
        const particleGraphics = this.make.graphics();
        particleGraphics.fillStyle(0x8effc1, 1);
        particleGraphics.fillCircle(4, 4, 4) // small 8x8 soft dot
        particleGraphics.generateTexture('light-particle', 8, 8);
        particleGraphics.destroy();

        this.input.mouse.disableContextMenu();

        this.physics.add.collider(this.player.sprite, this.groundLayer);

        this.player.sprite.play('ninja-idle-right');
        
        this.player.sprite.on('animationcomplete', (animation) => {
            if(this.player.alive) {
                
                if(animation.key === 'ninja-attack-left' || animation.key === 'ninja-throw-left') {
                    this.player.isAttacking = false;
                    this.player.sprite.play('ninja-idle-left', true);
                }
                if(animation.key === 'ninja-attack-right' || animation.key === 'ninja-throw-right') {
                    this.player.isAttacking = false;
                    this.player.sprite.play('ninja-idle-right', true);
                }
            }
        });

        this.player.sprite.on('animationupdate', (animation, frame) => {
            const isThrowAnim = animation.key === 'ninja-throw-left' || animation.key === 'ninja-throw-right';
            const isReleaseFrame = frame.index === 2;

            if(isThrowAnim && isReleaseFrame && this.player.pendingShurikenThrow) {
                const direction = this.player.lastDirectionFaced === 'left' ? -1 : 1;
                this.spawnShuriken(this.player, direction);
                this.player.pendingShurikenThrow = false;
            }
        });

        this.enemies.forEach(enemy => this.physics.add.existing(enemy.sprite));
        
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

        this.vKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.V);

        this.cKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);

        this.input.keyboard.on('keydown-C', () => {
            this.player.shurikenRequested = true;
        });

        this.shurikens = [];
    }

    update() {
        if(this.gamePaused) return;

        // INTERACTION STUFFS
        const vKeyJustPressed = Phaser.Input.Keyboard.JustDown(this.vKey);
        this.chests.forEach(chest => {
            const distance = Phaser.Math.Distance.Between(
                this.player.sprite.x, this.player.sprite.y,
                chest.sprite.x, chest.sprite.y
            );

            chest.playerNearby = distance <= 40;
            
            if(!chest.playerNearby || chest.isOpen) {
                return;
            }

            if(vKeyJustPressed) {
                this.openChest(chest);
                this.sound.play('heal', { volume: 0.3 });
            }
        });

        this.shurikens.forEach(shuriken => {
            if(Math.abs(shuriken.x - shuriken.startX) >= this.player.shurikenMaxRange) {
                shuriken.destroy();
            }
        });
        this.shurikens = this.shurikens.filter(shuriken => shuriken.active);

        this.sageNinjas.forEach(ninja => {
            ninja.tryInteract(vKeyJustPressed, this.player);
        });

        const nearbyChest = this.chests.find(chest => chest.playerNearby && !chest.isOpen);
        const nearbySageNinja = this.sageNinjas.find(ninja => ninja.playerNearby && !ninja.hasBeenTalkedTo);
        const nearbyInteractable = nearbyChest || nearbySageNinja;
        
        if(!!nearbyInteractable !== this.playerNearInteractable) {
            this.playerNearInteractable = !!nearbyInteractable;

            this.tweens.add({
                targets: this.interactPrompt,
                alpha: this.playerNearInteractable ? 1 : 0,
                duration: 200,
            });
        }

        if(nearbyInteractable) {
            const targetSprite = nearbyChest ? nearbyChest.sprite : nearbySageNinja.sprite;
            this.interactPrompt.setPosition(targetSprite.x, targetSprite.y - 20);
        }

        // Enemy Health Bar/Visuals
        this.enemies.forEach(enemy => {
            if(enemy.alive) {
                enemy.syncVisuals();
            }
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
                    this.player.lastDirectionFaced = 'left';
                    targetVelocityX = -this.player.speed;

                    if(!this.player.isAttacking) {
                        this.player.sprite.play('ninja-idle-left', true);
                    }
                }
                else if (this.cursors.right.isDown || this.wasd.D.isDown) {
                    this.player.lastDirectionFaced = 'right';
                    targetVelocityX = this.player.speed;

                    if(!this.player.isAttacking) {
                        this.player.sprite.play('ninja-idle-right', true);
                    }
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
                this.sound.play('jump');
            }

            if(!jumpKeyDown && this.player.sprite.body.velocity.y < 0) {
                this.player.sprite.body.setVelocityY(this.player.sprite.body.velocity.y * 0.5);
            }

            // Attack Cooldown Tick
            if(this.player.attackCooldown > 0) {
                this.player.attackCooldown -= this.game.loop.delta;
            }
            
            // ---- ATTACKING LOGIC HERE ---- //
            if(this.player.attackRequested && this.player.attackCooldown <= 0) {
                this.player.isAttacking = true;
                this.player.sprite.play(this.player.lastDirectionFaced === 'left' ? 'ninja-attack-left' : 'ninja-attack-right', true);
                
                const aliveEnemies = this.enemies.filter(enemy => enemy.alive);
                let hitSomething = false;

                aliveEnemies.forEach(enemy => {
                    const distance = Phaser.Math.Distance.Between(
                        this.player.sprite.x, this.player.sprite.y,
                        enemy.sprite.x, enemy.sprite.y,
                    );

                    const enemyIsInFront = this.player.lastDirectionFaced === 'left'
                        ? enemy.sprite.x <= this.player.sprite.x
                        : enemy.sprite.x >= this.player.sprite.x;

                    if(distance <= this.player.attackRange && enemyIsInFront) {
                        const totalDamage = (this.player.baseDamage + this.player.bonusDamage) * (this.player.damageMultiplier || 1);
                        enemy.takeDamage(totalDamage, this.player.sprite);
                        let hitSomething = true;

                        this.sound.play('sword-hit', { volume: 0.3 });

                        if(this.player.hasTickingDamage) {
                            enemy.applyTickingDamage(TICK_DAMAGE_AMOUNT, TICK_INTERVAL_MS, TICK_COUNT);
                        }
                        
                        if(this.player.hasLifeDrain) {
                            this.player.heal(Math.round(totalDamage * this.player.lifeDrainPercent));
                        }

                        this.showHitEffect(enemy.sprite.x, enemy.sprite.y);
                        this.flashHit(enemy.sprite);
                    }
                });

                if(!hitSomething) {
                    this.sound.play('sword-miss', { volume: 0.4 });
                }

                this.player.attackCooldown = this.player.attackCooldownDuration;
            }

            this.player.attackRequested = false;

            if(this.player.shurikenRequested && this.player.hasShuriken && !this.player.isAttacking) {
                this.player.isAttacking = true;
                this.player.pendingShurikenThrow = true;
                this.player.sprite.play(this.player.lastDirectionFaced === 'left' ? 'ninja-throw-left' : 'ninja-throw-right', true);
            }

            this.player.shurikenRequested = false;


        }

        // Enemy AI
        this.enemies.forEach(enemy => {
            if(!enemy.alive) return;
            if(!this.player.alive) return;

            if(enemy.isAggro || enemy.isBoss) {
                enemy.moveTowardPlayer(this.player);
                enemy.tryAttack(this.player, this.game.loop.delta);
            }
            else {
                enemy.patrol();
            }
        });
    }
    // ------------------ Player Death ------------------- //
    handlePlayerDeath() {
        this.physics.pause();

        this.time.delayedCall(1000, () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);

            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.player.sprite.setPosition(this.currentRespawnPoint.x, this.currentRespawnPoint.y);
                this.player.heal(this.player.maxHp);
                this.player.alive = true;
                this.resetEnemies();

                if(this.currentActiveBossRoom) {
                    this.resetBossRoom(this.currentActiveBossRoom);
                }

                this.physics.resume();
                this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
                this.cameras.main.fadeIn(500, 0, 0, 0);
            });
        });
    }

    // ------------------ MISC ------------------- //
    showWinScreen() {
        this.gamePaused = true;
        this.physics.pause();

        this.finalTime = this.time.now - this.runStartTime;
        console.log('time.now:', this.time.now, 'runStartTime:', this.runStartTime, 'finalTime:', this.finalTime);
        const totalSeconds = Math.floor(this.finalTime / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        const { width, height } = this.cameras.main;
        const zoom = this.cameras.main.zoom;

        this.add.rectangle(width / 2, height / 2, width / zoom, height / zoom, 0x000000, 1)
            .setScrollFactor(0)
            .setDepth(200);
        
        this.add.text(width / 2, height / 2 - 30, 'YOU WIN', {
            fontFamily: 'monospace',
            fontSize: '32px',
            color: '#ffffff',
            resolution: 3,
        })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(201);
        
        this.add.text(width / 2, height / 2 + 20, `YOUR TIME: ${formattedTime}`, {
            fontFamily: 'monospace',
            fontSize: '18px',
            color: '#fbbf24',
            resolution: 3,
        })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(201);

        const restartButton = this.add.text(width / 2, height / 2 + 70, 'RESTART', {
            fontFamily: 'monospace',
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 12, y: 6 },
            resolution: 3,
        })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(201)
            .setInteractive({ useHandCursor: true });

        restartButton.on('pointerdown', () => {
            this.music.stop();
            this.scene.start('TitleScene');
        });

        restartButton.on('pointerover', () => restartButton.setColor('#fbbf24'));
        restartButton.on('pointerout', () => restartButton.setColor('#ffffff'));
    }

    // ------------------ INTERACTIONS ------------------- //
    openChest(chest) {
        chest.isOpen = true;
        chest.sprite.setFrame(1);

        const healAmount = Math.round(this.player.maxHp * 0.25);
        this.player.heal(healAmount);

        this.spawnChestHealEffects(this.player.sprite.x, this.player.sprite.y);
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

        const roomNumber = enemyToRemove.bossRoomNumber;
        if(roomNumber && this.bossRoomEnemies[roomNumber]) {
            this.bossRoomEnemies[roomNumber] = this.bossRoomEnemies[roomNumber].filter(enemy => enemy !== enemyToRemove);
        
            if(this.bossRoomEnemies[roomNumber].length === 0) {
                this.bossRoomExitWallTiles[roomNumber].forEach(tile => tile.destroy());
                
                this.cameras.main.pan(this.player.sprite.x, this.player.sprite.y, 600, 'Sine.easeInOut', false, (camera, progress) => {
                    if(progress === 1) {
                        this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
                    }
                });

                this.bossRoomEntered[roomNumber] = false;
                this.bossRoomEnemies[roomNumber] = null;
                this.bossDefeated[roomNumber] = true;
                this.currentActiveBossRoom = null;

                if(roomNumber === 4) {
                    this.showWinScreen();
                }
            }
        }
    }

    resetEnemies() {
        this.enemies.forEach(enemy => {
            enemy.isAggro = false;
            enemy.hp = enemy.maxHp;
            enemy.updateHpBar();
        });
    }
    
    // ------------------- UPGRADE CHOICES ---------------- //
    showDialogue(lineIndex) {
        this.gamePaused = true;
        this.physics.pause();

        const { width, height } = this.cameras.main;
        const zoom = this.cameras.main.zoom;

        this.dialogueOverlay = this.add.rectangle(width / 2, height / 2, width / zoom, height / zoom, 0x000000, 0.7)
            .setScrollFactor(0)
            .setDepth(90);

        const lineText = sageNinjaDialogueLines[Math.min(lineIndex, sageNinjaDialogueLines.length - 1)];

        this.dialogueText = this.add.text(width / 2, height / 2 - 20, lineText, {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#ffffff',
            align: 'center',
            resolution: 3,
            wordWrap: {
                width: width - 80
            },
        })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(101);

        this.dialoguePrompt = this.add.text(width / 2, height - 40, 'Press SPACE to Continue', {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#fbbf24',
            resolution: 3,
        })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(101);

        this.input.keyboard.once('keydown-SPACE', () => {
            this.dialogueOverlay.destroy();
            this.dialogueText.destroy();
            this.dialoguePrompt.destroy();

            this.physics.resume();
            this.gamePaused = false;

            this.showUpgradeChoice();
        });
    }

    showUpgradeChoice() {
        this.gamePaused = true;
        this.physics.pause();

        this.currentUpgradeOptions = this.pickRandomItems(this.availableUpgrades, 2);

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
            const card = this.currentUpgradeOptions[i];

            const bg = this.add.rectangle(x, centerY, cardWidth, cardHeight, 0x2a2a3a)
                .setStrokeStyle(2, 0x4a4a5a)
                .setScrollFactor(0)
                .setDepth(100)
                .setInteractive({ useHandCursor: true });
            
            const icon = this.add.image(x, centerY - 90, `icon-${card.id}`)
                .setOrigin(0.5);
                
            const title = this.add.text(x, centerY - 60, this.currentUpgradeOptions[i].title, {
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
            
            const desc = this.add.text(x, centerY + 10, this.currentUpgradeOptions[i].desc, {
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

            return { bg, icon, title, desc };
        });

        // destroy corridor
    }

    chooseUpgrade(index) {
        const chosenCard = this.currentUpgradeOptions[index];
        const otherIndex = index === 0 ? 1 : 0;
        const unchosenCard = this.currentUpgradeOptions[otherIndex];

        if(this.pendingBossUpgrades.length === 0) {
            this.sound.play('boss-taunt', { volume: 0.7 });

            const { width, height } = this.cameras.main;
            const spawnSubtitle = this.add.text(width / 2, 80, 'Oh you\'ve gotten more powerful, what ever shall I do?', {
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#ffffff',
                align: 'center',
                resolution: 3,
                wordWrap: { width: width - 80 },
            })
                .setOrigin(0.5)
                .setScrollFactor(0)
                .setDepth(60)
                .setAlpha(0);
            
            this.tweens.add({
                targets: spawnSubtitle,
                alpha: 1,
                duration: 500,
                yoyo: true,
                hold: 4000,
                onComplete: () => spawnSubtitle.destroy(),
            });
        }

        chosenCard.applyTo(this.player);

        this.availableUpgrades = this.availableUpgrades.filter(
            card => card.id !== chosenCard.id && card.id !== unchosenCard.id
        );
        
        chosenCard.applyTo(this.player);

        this.sound.play('click');

        this.updatePowerDisplay();

        this.pendingBossUpgrades.push(unchosenCard);

        if(this.currentEncounterWallTiles) {
            this.destroyWallTiles(this.currentEncounterWallTiles);
            this.currentEncounterWallTiles = null;
        }

        this.upgradeCards.forEach(({ bg, icon, title, desc }) => {
            bg.destroy();
            icon.destroy();
            title.destroy();
            desc.destroy();
        });

        this.upgradeCards = [];

        this.upgradeOverlay.destroy();
        this.upgradeHeader.destroy();

        this.physics.resume();
        this.gamePaused = false;
    }

    spawnShuriken(thrower, direction) {
        this.sound.play('shuriken-miss', { volume: 0.3 });
        const handOffsetX = 20;
        const spawnX = thrower.sprite.x + (handOffsetX * direction);
        const spawnY = thrower.sprite.y;

        const shuriken = this.add.image(spawnX, spawnY, 'shuriken');
        shuriken.startX = shuriken.x;

        this.physics.add.existing(shuriken);
        shuriken.body.setVelocityX(thrower.shurikenSpeed * direction);
        shuriken.body.setAllowGravity(false);

        this.tweens.add({
            targets: shuriken,
            angle: 360,
            duration: 300,
            repeat: -1,
        });

        this.physics.add.collider(shuriken, this.groundLayer, () => {
            shuriken.destroy();
            this.shurikens = this.shurikens.filter(shurikenToDestroy => shurikenToDestroy !== shuriken);
        });

        const isPlayerThrown = thrower === this.player;

        if(isPlayerThrown) {
            this.enemies.filter(enemy => enemy.alive).forEach(enemy => {
                this.physics.add.overlap(shuriken, enemy.sprite, () => {
                    const shurikenDamage = Math.round((thrower.baseDamage + thrower.bonusDamage) * thrower.shurikenDamageMultiplier * (thrower.damageMultiplier || 1));
                    enemy.takeDamage(shurikenDamage, this.player.sprite);

                    if(thrower.hasLifeDrain) {
                        thrower.heal(Math.round(shurikenDamage * thrower.lifeDrainPercent));
                    }

                    if(thrower.hasTickingDamage) {
                        enemy.applyTickingDamage(TICK_DAMAGE_AMOUNT, TICK_INTERVAL_MS, TICK_COUNT);
                    }

                    shuriken.destroy();
                    this.shurikens = this.shurikens.filter(shurikenToDestroy => shurikenToDestroy !== shuriken);
                });
            });
        }
        else {
            this.physics.add.overlap(shuriken, this.player.sprite, () => {
                const shurikenDamage = Math.round((thrower.attackDamage + (thrower.bonusDamage || 0)) * thrower.shurikenDamageMultiplier * (thrower.damageMultiplier || 1));
                this.player.takeDamage(shurikenDamage, thrower);

                if(thrower.hasLifeDrain) {
                    thrower.heal(Math.round(shurikenDamage * thrower.lifeDrainPercent));
                }

                if(thrower.hasTickingDamage) {
                    this.player.applyTickingDamage(TICK_DAMAGE_AMOUNT, TICK_INTERVAL_MS, TICK_COUNT);
                }

                shuriken.destroy();
                this.shurikens = this.shurikens.filter(shurikenToDestroy => shurikenToDestroy !== shuriken);
            });
        }

        this.shurikens.push(shuriken);
    }

    updatePowerDisplay() {
        this.powerIcons.forEach(icon => icon.destroy());
        this.powerIcons = [];

        const activeChecks = [
            { id: 'damage', active: this.player.bonusDamage > 0 },
            { id: 'ticking', active: this.player.hasTickingDamage },
            { id: 'lifedrain', active: this.player.hasLifeDrain },
            { id: 'thorns', active: this.player.hasThorns },
            { id: 'shuriken', active: this.player.hasShuriken },
            { id: 'glasscannon', active: this.player.damageMultiplier > 1 },
        ];

        const active = activeChecks.filter(check => check.active);

        active.forEach((check, index) => {
            const icon = this.add.image(20 + (index * 35), 60, `icon-${check.id}`)
                .setScrollFactor(0)
                .setDepth(1000)
                .setDisplaySize(32, 32);

            this.powerIcons.push(icon);
        });
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

    spawnChestHealEffects(x, y) {
        const emitter = this.add.particles(x, y, 'light-particle', {
            speed: { min: 20, max: 40 },
            angle: { min: 250, max: 290},
            scale: { start: 0.6, end: 0 },
            alpha: { start: 0.9, end: 0 },
            lifespan: 800,
            quantity: 2,
            frequency: 40,
            blendMode: 'ADD',
            emitZone: {
                type: 'random',
                source: new Phaser.Geom.Rectangle(-16, -20, 32, 32),
            }
        });
        emitter.setDepth(10);
        this.time.delayedCall(500, () => emitter.stop());
        this.time.delayedCall(1300, () => emitter.destroy());
    }

    spawnBloodSplatter(x, y) {
        const groundY = this.findGroundY(x, y);

        const splatter = this.add.graphics();
        splatter.fillStyle(0x8b0000, 0.8);

        for(let i = 0; i < 6; i++) {
            const offsetX = Phaser.Math.Between(-10, 10);
            const offsetY = Phaser.Math.Between(-6, 0);
            const radius = Phaser.Math.Between(3, 8);
            splatter.fillCircle(offsetX, offsetY, radius);
        }

        splatter.setPosition(x, groundY);
        splatter.setDepth(1);
    }

    findGroundY(x, y) {
        const tileSize = 16;
        let checkY = y;
        const maxCheckDistance = 500;

        for(let checked = 0; checked < maxCheckDistance; checked += tileSize) {
            const tile = this.groundLayer.getTileAtWorldXY(x, checkY);

            if(tile && tile.collides) {
                return tile.pixelY;
            }

            checkY += tileSize;
        }

        return y;
    }

    // ------------- WALL STUFF -------------- //
    buildWallTiles(wallObj) {
        const tileIndices = [17, 16, 3, 9, 3, 9, 18, 19];
        const wallCentered = this.getObjectCenter(wallObj);
        const tileSize = 16;
        const columns = 2;
        const rows = 4;
        const tiles = [];

        const startX = wallCentered.x - tileSize / 2;
        const startY = wallObj.y + tileSize / 2;

        for(let row = 0; row < rows; row++) {
            for(let col = 0; col < columns; col++) {
                const index = row * columns + col;

                const tile = this.add.tileSprite(
                    startX + (col * tileSize),
                    startY + (row * tileSize),
                    tileSize,
                    tileSize,
                    'purple-tileset',
                    tileIndices[index]
                );

                this.physics.add.existing(tile, true);
                this.physics.add.collider(this.player.sprite, tile);
                tiles.push(tile);
            }
        }

        return tiles;
    }

    destroyWallTiles(wallTiles) {
        wallTiles.forEach(tile => tile.destroy());
    }

    // -------- BOSS ROOM STUFF ---------- //
    /*
    BOSS ROOM NEEDS TO BE: 40 tiles wide x 22 tiles high
    */
    enterBossRoom(roomNumber) {
        
        if(this.bossRoomEntered[roomNumber] || this.bossDefeated[roomNumber]) {
            return;
        }

        this.bossRoomEntered[roomNumber] = true;
        this.currentActiveBossRoom = roomNumber;

        this.cameras.main.stopFollow();
        
        const arenaCenter = this.bossArenaCenter[roomNumber];
        this.cameras.main.pan(arenaCenter.x, arenaCenter.y, 600, 'Sine.easeInOut');
        this.cameras.main.zoomTo(1, 600, 'Sine.easeInOut');

        this.bossRoomEnemies[roomNumber] = [];

        const spawnPoint = this.bossEnemySpawn[roomNumber];
        const boss = this.spawnEnemy(
            spawnPoint.x,
            spawnPoint.y,
            this.scaledEnemyConfig({ 
                name: 'Boss',
                hp: 50,
                maxHp: 50,
                isBoss: true,
                attackDamage: 30,
                attackInterval: 500,
                chaseRange: 1000,
                giveUpRange: 1000,
                scale: 2,
            }, this.roomDifficultyByRoom[roomNumber], this.bossDamageMultiplierByRoom[roomNumber]),
        );
        boss.bossRoomNumber = roomNumber;

        this.pendingBossUpgrades.forEach(card => card.applyTo(boss));
        
        this.bossRoomEnemies[roomNumber].push(boss);
        this.sealBossRoom(roomNumber);
    }

    resetBossRoom(roomNumber) {
        this.bossRoomEnemies[roomNumber].forEach(enemy => {
            enemy.destroy();
            this.enemies = this.enemies.filter(existingEnemy => existingEnemy != enemy);
        });

        this.bossRoomEnemies[roomNumber] = null;
        this.bossRoomEntered[roomNumber] = false;
        this.bossRoomEntranceWallTiles[roomNumber].forEach(tile => tile.destroy());
        this.bossRoomExitWallTiles[roomNumber].forEach(tile => tile.destroy());
        this.currentActiveBossRoom = null;
    }

    sealBossRoom(roomNumber) {
        this.bossRoomEntranceWallTiles[roomNumber] = this.buildWallTiles(this.bossRoomWallEntranceObj[roomNumber]);
        this.bossRoomExitWallTiles[roomNumber] = this.buildWallTiles(this.bossRoomWallExitObj[roomNumber]);
    }

    // ------- HELPERS -------- //
    getSpawnObject(name) {
        const obj = this.spawnLayer.objects.find(obj => obj.name === name);

        if(!obj) {
            console.error(`Missing spawn object in Tiled: "${name}"`);
        }
        
        return obj;
    }

    getRoomObject(baseName, roomNumber) {
        const roomWord = ['zero', 'one', 'two', 'three', 'four'][roomNumber];
        return this.getSpawnObject(`${baseName}-${roomWord}`)
    }

    getObjectCenter(obj) {
        return {
            x: obj.x + obj.width / 2,
            y: obj.y + obj.height / 2,
        };
    }

    scaledEnemyConfig(baseConfig, difficulty = 1, damageMultiplier = difficulty) {
        return {
            ...baseConfig,
            hp: Math.round(baseConfig.hp * difficulty),
            maxHp: Math.round(baseConfig.maxHp * difficulty),
            attackDamage: Math.round((baseConfig.attackDamage || 10) * damageMultiplier),
            speed: Math.round((baseConfig.speed || 80) * difficulty),
            attackInterval: Math.round((baseConfig.attackInterval || 1000) / difficulty),
        }
    }

    pickRandomItems(pool, count) {
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }
}



const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 640,
    height: 352,
    pixelArt: true,
    roundPixels: true,
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
    scene: [TitleScene, ControlsScene, GameScene],
}

const game = new Phaser.Game(config);
window.game = game;