import Phaser from 'phaser';

import TitleScene from './Title.js';
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
        this.load.spritesheet('purple-tileset', '/assets/tilemaps/purple-tileset.png', {
            frameWidth: 16,
            frameHeight: 16,
        });
        this.load.tilemapTiledJSON('purple-map', '/assets/tilemaps/purple-map.json');
    }

    create() {
        // Animation Creation
        this.anims.create({ key: 'ninja-idle-left', frames: this.anims.generateFrameNumbers('ninja-idle', { start: 8, end: 15 }), frameRate: 4, repeat: -1 });
        this.anims.create({ key: 'ninja-idle-right', frames: this.anims.generateFrameNumbers('ninja-idle', { start: 0, end: 7 }), frameRate: 4, repeat: -1 });
        
        this.anims.create({ key: 'sage-ninja-left', frames: this.anims.generateFrameNumbers('sage-ninja', { start: 0, end: 3 }), frameRate: 1, repeat: -1 });
        this.anims.create({ key: 'sage-ninja-right', frames: this.anims.generateFrameNumbers('sage-ninja', { start: 4, end: 7 }), frameRate: 1, repeat: -1 });
        
        this.anims.create({ key: 'ninja-attack-left', frames: this.anims.generateFrameNumbers('ninja-attack', {start: 0, end: 2 }), frameRate: 12, repeat: 0 });
        this.anims.create({ key: 'ninja-attack-right', frames: this.anims.generateFrameNumbers('ninja-attack', {start: 3, end: 5 }), frameRate: 12, repeat: 0 });
        
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

        // Create Map
        const map = this.make.tilemap({ key: 'purple-map' });
        const purpleTileSet = map.addTilesetImage('purple-tileset', 'purple-tileset');
        this.groundLayer = map.createLayer('Tile Layer 1', purpleTileSet, 0, 0);
        this.groundLayer.setCollisionByProperty({ collides: true });

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

        [1, 2, 3].forEach(roomNumber => {
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
            3: 2.25,
            4: 4.0,
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

        // this.zoomKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
        // this.debugZoomedOut = false;

        this.physics.add.collider(this.player.sprite, this.groundLayer);

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
    }

    update() {
        if(this.gamePaused) return;

        // For seeing rooms - TAKE OUT WHEN GOING LIVE: TODO
        // if(Phaser.Input.Keyboard.JustDown(this.zoomKey)) {
        //     this.debugZoomedOut = !this.debugZoomedOut;
        //     this.cameras.main.setZoom(this.debugZoomedOut ? 0.3 : 1);
        // }
        // --------------------------------------------------

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
            }
        });

        // this.chests.forEach(chest => {
        //     return chest.playerNearby = false;
        // });

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
            
            // ---- ATTACKING LOGIC HERE ---- //
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
                        const totalDamage = this.player.baseDamage + this.player.bonusDamage;
                        enemy.takeDamage(totalDamage, this.player.sprite);
                        
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

                this.player.attackCooldown = this.player.attackCooldownDuration;
            }

            this.player.attackRequested = false;


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
                this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
                this.bossRoomEntered[roomNumber] = false;
                this.bossRoomEnemies[roomNumber] = null;
                this.bossDefeated[roomNumber] = true;
                this.currentActiveBossRoom = null;
                // TODO: if time, put in pan/zoomTo transition
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

        // this.sound.play(`sage-ninja-line-${Math.min(lineIndex, sageNinjaDialogueLines.length - 1)}`);

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
            const bg = this.add.rectangle(x, centerY, cardWidth, cardHeight, 0x2a2a3a)
                .setStrokeStyle(2, 0x4a4a5a)
                .setScrollFactor(0)
                .setDepth(100)
                .setInteractive({ useHandCursor: true });
            
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

            return { bg, title, desc };
        });

        // destroy corridor
    }

    chooseUpgrade(index) {
        const chosenCard = this.currentUpgradeOptions[index];
        const otherIndex = index === 0 ? 1 : 0;
        const unchosenCard = this.currentUpgradeOptions[otherIndex];

        // if(chosenCard.id === 'damage') {
        //     this.player.addBonusDamage(chosenCard.amount);
        // }

        // if(chosenCard.id === 'ticking') {
        //     this.player.enableTickingDamage();
        // }

        chosenCard.applyTo(this.player);

        this.availableUpgrades = this.availableUpgrades.filter(
            card => card.id !== chosenCard.id && card.id !== unchosenCard.id
        );

        this.pendingBossUpgrades.push(unchosenCard);

        if(this.currentEncounterWallTiles) {
            this.destroyWallTiles(this.currentEncounterWallTiles);
            this.currentEncounterWallTiles = null;
        }

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
            }),
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

    scaledEnemyConfig(baseConfig, difficulty = 1) {
        return {
            ...baseConfig,
            hp: Math.round(baseConfig.hp * difficulty),
            maxHp: Math.round(baseConfig.maxHp * difficulty),
            attackDamage: Math.round((baseConfig.attackDamage || 10) * difficulty),
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