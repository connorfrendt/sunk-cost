export default class Enemy {
    constructor(scene, x, y, config) {
        this.scene = scene;

        this.attackCooldown = 0;
        this.attackInterval = 3000; // ms between attacks (3s)
        this.attackDamage = config.attackDamage || 10;

        // Visual
        this.sprite = scene.add.sprite(x, y, 'enemy-idle', 0);
        this.sprite.play('enemy-idle-right');

        // HP Bar
        this.hpBarBg = scene.add.rectangle(x, y - 28, 40, 6, 0x440000);
        this.hpBar = scene.add.rectangle(x - 20, y - 28, 40, 6, 0x00ff00);
        this.hpBar.setOrigin(0, 0.5);
        this.hp = config.hp;
        this.maxHp = config.maxHp;

        // Stats
        this.alive = true;
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
        this.alive = false;
        this.sprite.stop();
        this.sprite.destroy();
        this.hpBar.setVisible(false);
        this.hpBarBg.setVisible(false);
    }

    destroy() {
        // this.sprite.destroy();
        this.hpBar.destroy();
        this.hpBarBg.destroy();
        // this.nameText.destroy();
    }

    syncVisuals() {
        this.hpBarBg.x = this.sprite.x;
        this.hpBarBg.y = this.sprite.y - 28;
        this.hpBar.x = this.sprite.x - 20;
        this.hpBar.y = this.sprite.y - 28;
        // this.nameText.x = this.sprite.x - this.nameText.width / 2;
        // this.nameText.y = this.sprite.y - 40;
    }
}