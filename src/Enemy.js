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

        // Attacking
        this.attackCooldown = 0;
        this.attackInterval = 3000; // ms between attacks (3s)
        this.attackDamage = config.attackDamage || 10;

        // Visual
        this.sprite = scene.add.sprite(x, y, 'enemy-idle', 0);
        this.sprite.play('enemy-idle-right');
        scene.physics.add.existing(this.sprite);
        this.sprite.body.setSize(32, 32);
        this.sprite.body.setCollideWorldBounds(true);

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
        if(!this.alive) return;

        const distance = Phaser.Math.Distance.Between(
            this.sprite.x, this.sprite.y,
            player.sprite.x, player.sprite.y
        );

        const chaseRange = 600; // How far away enemy notices the player
        const stopRange = 60; // Don't walk into center of player, stand at melee range
        const speed = 80; // Pixels per second
        const jumpVelocity = -750;
        const horizontalDeadzone = 10;

        if(distance < chaseRange && distance > stopRange) {
            const xDifference = player.sprite.x - this.sprite.x;

            if(Math.abs(xDifference) > horizontalDeadzone) {
                this.chaseDirection = xDifference > 0 ? 1 : -1;
            }
            
            const movingRight = this.chaseDirection > 0;
            this.sprite.body.setVelocityX(speed * this.chaseDirection);

            const facingKey = movingRight ? 'enemy-idle-right' : 'enemy-idle-left';
            this.sprite.play(facingKey, true);

            const blockedInMoveDirection =
                (movingRight && this.sprite.body.blocked.right) ||
                (!movingRight && this.sprite.body.blocked.left);

            // Jumping mechanism
            if(blockedInMoveDirection && this.sprite.body.blocked.down && this.isBoss) {
                this.sprite.body.setVelocityY(jumpVelocity);
            }
            

        }
        else {
            this.sprite.body.setVelocityX(0);
        }
    }

    patrol() {
        if(!this.alive || this.isAggro) {
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
        if(!this.alive) {
            return;
        }

        const distance = Phaser.Math.Distance.Between(
            this.sprite.x, this.sprite.y,
            player.sprite.x, player.sprite.y
        );
        
        if(distance <= 60) {
            this.attackCooldown -= delta;
            
            if(this.attackCooldown <= 0) {
                player.takeDamage(this.attackDamage);
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

        this.hp -= amount;
        this.updateHpBar();

        if(this.hp <= 0) {
            this.die();
            return;
        }
    }

    updateHpBar() {
        const pct = Math.max(this.hp, 0) / this.maxHp;
        this.hpBar.scaleX = pct;
    }

    die() {
        console.log(this);
        this.alive = false;
        this.sprite.stop();
        this.destroy();
        this.hpBar.setVisible(false);
        this.hpBarBg.setVisible(false);
        this.scene.removeEnemyFromArray(this);
        
        if(this.isBoss) {
            this.scene.showUpgradeChoice();
        }
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