export default class Player {
    constructor(scene, x, y) {
        this.scene = scene;

        // Stats
        this.hp = 100;
        this.maxHp = 100;
        this.speed = 250;
        this.attackRange = 85;
        
        // Visual
        this.sprite = scene.add.sprite(x, y, 'ninja-idle', 0);
        this.sprite.setDepth(10);
        this.sprite.lastDirectionFaced = null;

        // HP Bar
        this.hpBarBg = scene.add.rectangle(20, 20, 150, 20, 0x440000)
            .setOrigin(0, 0.5)
            .setScrollFactor(0)
            .setDepth(50);
        this.hpBar = scene.add.rectangle(20, 20, 150, 20, 0x00ff00)
            .setOrigin(0, 0.5)
            .setScrollFactor(0)
            .setDepth(50);
        this.hpText = scene.add.text(70, 30, `${this.hp} / ${this.maxHp}`, {
            fontFamily: 'arial',
            fontSize: '12px',
            color: '#ffffff',
            resolution: 3,
        })
            .setScrollFactor(0)
            .setDepth(50);

        // Attacking
        this.isAttacking = false;
        this.attackRequested = false
        this.attackCooldown = 0;
        this.attackCooldownDuration = 250; // ms
        this.baseDamage = 10;
        this.bonusDamage = 0;

        // Properties
        this.invulnerable = false;
        this.alive = true;
        this.abilities = [];
        this.hasTickingDamage = false;
    }

    addBonusDamage(amount) {
        this.bonusDamage += amount;
    }

    enableTickingDamage() {
        this.hasTickingDamage = true;
    }

    takeDamage(amount) {
        if(!this.alive) {
            return;
        }
        if(this.invulnerable) {
            return;
        }
        
        this.hp -= amount;
        this.scene.cameras.main.shake(150, 0.005);  

        if(this.hp <= 0) {
            this.hp = 0;
            this.die();
        }

        this.updateHpBar();

        if(this.alive) {
            this.invulnerable = true;
            this.scene.time.delayedCall(1000, () => {
                this.invulnerable = false;
            })
        }
    }

    heal(amount) {
        this.hp = Math.min(this.hp + amount, this.maxHp);
        this.updateHpBar();
    }

    updateHpBar() {
        const pct = this.hp / this.maxHp;
        this.hpBar.scaleX = pct;
        this.hpText.setText(`${this.hp} / ${this.maxHp}`);
    }

    die() {
        this.alive = false;
        this.sprite.body.setVelocity(0, 0);
        this.scene.handlePlayerDeath();
    }
}