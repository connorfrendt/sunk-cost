export default class Enemy {
    constructor(scene, x, y, config) {
        this.scene = scene;

        // Properties
        this.name = config.name || '';
        this.isBoss = config.isBoss || false;
        this.isAggro = false;
        this.patrolDirection = 1; // 1 right, -1 left
        this.patrolSpeed = 50;
        this.patrolOriginX = x;
        this.patrolRange = config.patrolRange || 80;
        this.chaseDirection = 1; // persist across frames, only updates when there's a clear direction
        this.isKnockedBack = false;
        this.knockbackDuration = 150; // ms

        // Attacking
        this.isAttacking = false;
        this.attackCooldown = 0;
        this.attackInterval = 1000; // ms between attacks
        this.attackDamage = config.attackDamage || 10;

        this.chaseRange = 600; // How far away the enemy notices the player
        this.stopRange = 30; // Don't walk into the center of the player, stand at melee range
        this.speed = 80; // pixels per second
        this.jumpVelocity = -750;
        this.horizontalDeadzone = 10;

        // Visual
        this.sprite = scene.add.sprite(x, y, 'enemy-idle', 0);
        this.sprite.play('enemy-idle-right');
        scene.physics.add.existing(this.sprite);
        this.scale = config.scale || 1;
        this.sprite.setScale(this.scale);
        this.sprite.body.setSize(32, 32);
        this.sprite.body.setCollideWorldBounds(true);

        this.pendingAttackTarget = null;

        this.sprite.on('animationupdate', (animation, frame) => {
            const isAttackAnim = animation.key === 'enemy-attack-left' || animation.key === 'enemy-attack-right';
            const isImpactFrame = frame.index === 4;

            if(isAttackAnim && isImpactFrame && this.pendingAttackTarget) {
                const distance = Phaser.Math.Distance.Between(
                    this.sprite.x, this.sprite.y,
                    this.pendingAttackTarget.sprite.x, this.pendingAttackTarget.sprite.y
                );

                if(distance <= this.stopRange) {
                    this.pendingAttackTarget.takeDamage(this.attackDamage);
                }

                this.pendingAttackTarget = null;
            }
        });

        this.sprite.on('animationcomplete', (animation) => {
            if(!this.alive) {
                return;
            }

            if(animation.key === 'enemy-attack-left' || animation.key === 'enemy-attack-right') {
                this.isAttacking = false;
            }

            if(animation.key === 'enemy-attack-left') {
                this.sprite.play('enemy-idle-left', true);
            }

            if(animation.key === 'enemy-attack-right') {
                this.sprite.play('enemy-idle-right', true);
            }
        });

        // HP Bar
        this.hpBarBg = scene.add.rectangle(x, y - 28, 40, 6, 0x440000);
        this.hpBar = scene.add.rectangle(x - 20, y - 28, 40, 6, 0x00ff00);
        this.hpBar.setOrigin(0, 0.5);
        this.hp = config.hp;
        this.maxHp = config.maxHp;

        // Stats
        this.alive = true;
    }

    moveTowardPlayer(player) {
        if(!this.alive || this.isKnockedBack) return;

        const distance = Phaser.Math.Distance.Between(
            this.sprite.x, this.sprite.y,
            player.sprite.x, player.sprite.y
        );

        const xDifference = player.sprite.x - this.sprite.x;

        if(Math.abs(xDifference) > this.horizontalDeadzone) {
            this.chaseDirection = xDifference > 0 ? 1 : -1;
        }

        const movingRight = this.chaseDirection > 0;
        const facingKey = movingRight ? 'enemy-idle-right' : 'enemy-idle-left';

        if(!this.isAttacking) {
            this.sprite.play(facingKey, true);
        }

        if(distance < this.chaseRange && distance > this.stopRange) {
            this.sprite.body.setVelocityX(this.speed * this.chaseDirection);

            const blockedInMoveDirection =
                (movingRight && this.sprite.body.blocked.right) ||
                (!movingRight && this.sprite.body.blocked.left);

            // Jumping mechanism
            if(blockedInMoveDirection && this.sprite.body.blocked.down && this.isBoss) {
                this.sprite.body.setVelocityY(this.jumpVelocity);
            }
        }
        else {
            this.sprite.body.setVelocityX(0);
        }
    }

    patrol() {
        if(!this.alive || this.isAggro || this.isKnockedBack) {
            return;
        }

        this.sprite.body.setVelocityX(this.patrolSpeed * this.patrolDirection);
        const distanceFromOrigin = this.sprite.x - this.patrolOriginX;

        if(this.patrolDirection > 0 && distanceFromOrigin >= this.patrolRange) {
            this.patrolDirection = -1;
        }
        else if (this.patrolDirection < 0 && distanceFromOrigin <= -this.patrolRange) {
            this.patrolDirection = 1;
        }

        const facingKey = this.patrolDirection < 0 ? 'enemy-idle-left' : 'enemy-idle-right';
        this.sprite.play(facingKey, true);
    }

    tryAttack(player, delta) {
        if(!this.alive || this.isKnockedBack) {
            return;
        }

        const distance = Phaser.Math.Distance.Between(
            this.sprite.x, this.sprite.y,
            player.sprite.x, player.sprite.y
        );
        
        if(distance <= this.stopRange) {
            this.attackCooldown -= delta;
            
            if(this.attackCooldown <= 0 && !this.isAttacking) {
                this.isAttacking = true;
                const facingKey = this.sprite.x < player.sprite.x ? 'enemy-attack-right' : 'enemy-attack-left';
                this.sprite.play(facingKey, true);

                this.pendingAttackTarget = player;
                this.attackCooldown = this.attackInterval;
            }
        }
        else {
            this.attackCooldown = 0;
        }
    }

    takeDamage(amount, source) {
        if(!this.alive) {
            return;
        }
        this.isAggro = true;
        this.knockback(source);

        // this.scene.cameras.main.shake(150, 0.003);

        this.hp -= amount;
        this.updateHpBar();

        if(this.hp <= 0) {
            this.die();
            return;
        }
    }

    applyTickingDamage(damagePerTick, intervalMs, tickCount) {
        // Clear any existing dot timer first, so reapplying doesn't stack multiple times
        if(this.dotTimer) {
            this.dotTimer.remove();
        }

        this.dotTimer = this.scene.time.addEvent({
            delay: intervalMs,
            repeat: tickCount - 1,
            callback: () => {
                if(!this.alive) {
                    this.dotTimer.remove();
                    return;
                }

                this.hp -= damagePerTick;
                this.updateHpBar();
                if(this.hp <= 0) {
                    this.die();
                }
            }
        })
    }

    knockback(source) {
        if(!this.alive) {
            return;
        }

        this.isKnockedBack = true;

        const direction = this.sprite.x < source.x ? -1 : 1; // push away from hit source
        const knobackForce = 200;

        this.sprite.body.setVelocityX(knobackForce * direction);
        this.sprite.body.setVelocityY(-150);

        this.scene.time.delayedCall(this.knockbackDuration, () => {
            this.isKnockedBack = false;
        });
    }

    updateHpBar() {
        const pct = Math.max(this.hp, 0) / this.maxHp;
        this.hpBar.scaleX = pct;
    }

    die() {
        this.alive = false;
        this.sprite.stop();
        this.destroy();
        this.hpBar.setVisible(false);
        this.hpBarBg.setVisible(false);
        this.scene.removeEnemyFromArray(this);
        
        // if(this.isBoss) {
        //     this.scene.showUpgradeChoice();
        // }
    }

    destroy() {
        this.sprite.destroy();
        this.hpBar.destroy();
        this.hpBarBg.destroy();
    }

    syncVisuals() {
        this.hpBarBg.x = this.sprite.x;
        this.hpBarBg.y = this.sprite.y - 28;
        this.hpBar.x = this.sprite.x - 20;
        this.hpBar.y = this.sprite.y - 28;
    }
}