export default class Enemy {
    constructor(scene, x, y, config) {
        this.scene = scene;

        // Properties
        this.name = config.name || '';
        this.isBoss = config.isBoss || false;

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

        const chaseRange = 300; // How far away enemy notices the player
        const stopRange = 60; // Don't walk into center of player, stand at melee range
        const speed = 40; // Pixels per second
        const jumpVelocity = -750;

        if(distance < chaseRange && distance > stopRange) {
            const angle = Phaser.Math.Angle.Between(
                this.sprite.x, this.sprite.y,
                player.sprite.x, player.sprite.y
            );
            const desiredVelocityX = Math.cos(angle) * speed;
            this.sprite.body.setVelocityX(desiredVelocityX);
            this.sprite.play('enemy-idle-left', true);

            const facingKey = player.sprite.x < this.sprite.x ? 'enemy-idle-left' : 'enemy-idle-right';
            this.sprite.play(facingKey, true);

            const movingRight = desiredVelocityX > 0;
            const movingLeft = desiredVelocityX < 0;
            const blockedInMoveDirection =
                (movingRight && this.sprite.body.blocked.right) ||
                (movingLeft && this.sprite.body.blocked.left);

            if(blockedInMoveDirection && this.sprite.body.blocked.down) {
                this.sprite.body.setVelocityY(jumpVelocity);
            }
        }
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