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
        this.hasLifeDrain = false;
        this.lifeDrainPercent = 0;
        this.hasThorns = false;
        this.thornsPercent = 0;
        this.hasShuriken = false;
        this.shurikenDamageMultiplier = 0.75;
        this.shurikenSpeed = 400;
        this.shurikenMaxRange = 150;
    }

    addBonusDamage(amount) {
        this.bonusDamage += amount;
    }

    // This is for the player attacking the enemy
    enableTickingDamage() {
        this.hasTickingDamage = true;
    }

    // This is for the enemy attacking the player
    applyTickingDamage(damagePerTick, intervalMs, tickCount) {
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
                    this.hp = 0;
                    this.die();
                }
            }
        })
    }

    takeDamage(amount, source, isThornsDamage = false) {
        if(!this.alive) {
            return;
        }
        if(this.invulnerable) {
            return;
        }
        
        this.hp -= amount;
        this.updateHpBar();
        
        if(this.hp <= 0) {
            this.hp = 0;
            this.die();
            return;
        }
        
        if(isThornsDamage) {
            return;
        }

        this.scene.cameras.main.shake(150, 0.005);  

        if(this.alive) {
            this.invulnerable = true;

            this.flickerTween = this.scene.tweens.add({
                targets: this.sprite,
                alpha: 0.5,
                duration: 100,
                yoyo: true,
                repeat: -1,
            });

            this.scene.time.delayedCall(1000, () => {
                this.invulnerable = false;
                this.flickerTween.stop();
                this.sprite.setAlpha(1);
            });
        }

        if(this.hasThorns && source && !isThornsDamage) {
            this.scene.time.delayedCall(0, () => {
                source.takeDamage(Math.round(amount * this.thornsPercent), this.sprite, true);
            });
        }
    }

    enableLifeDrain(percent) {
        this.hasLifeDrain = true;
        this.lifeDrainPercent = percent;
    }

    enableThorns(percent) {
        this.hasThorns = true;
        this.thornsPercent = percent;
    }

    enableShuriken() {
        this.hasShuriken = true;
    }

    enableGlassCannon(damageMultiplier, hpMultiplier) {
        this.damageMultiplier = damageMultiplier;
        this.maxHp = Math.round(this.maxHp * hpMultiplier);
        this.hp = Math.min(this.hp, this.maxHp);
        this.updateHpBar();
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
        this.sprite.anims.stop();
        this.sprite.play(this.lastDirectionFaced === 'left' ? 'ninja-idle-left' : 'ninja-idle-right', true);
        this.scene.spawnBloodSplatter(this.sprite.x, this.sprite.y);
        this.scene.handlePlayerDeath();
    }
}