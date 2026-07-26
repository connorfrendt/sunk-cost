export default class Player {
    constructor(scene, x, y) {
        this.scene = scene;

        // Stats
        this.hp = 100;
        this.maxHp = 100;
        this.speed = 250;
        this.alive = true;
        this.invulnerable = false;
        this.abilities = [];
        this.attackRange = 85;
        
        // Visual
        this.sprite = scene.add.sprite(x, y, 'ninja-idle', 0);
        this.sprite.setDepth(10);
        this.sprite.lastDirectionFaced = null;

        // HP Bar
        this.hpBarBg = scene.add.rectangle(20, 20, 150, 20, 0x440000)
            .setOrigin(0, 0.5)
            .setScrollFactor(0)
            .setDepth(100);
        this.hpBar = scene.add.rectangle(20, 20, 150, 20, 0x00ff00)
            .setOrigin(0, 0.5)
            .setScrollFactor(0)
            .setDepth(100);
        this.hpText = scene.add.text(70, 30, `${this.hp} / ${this.maxHp}`, {
            fontFamily: 'arial',
            fontSize: '12px',
            color: '#ffffff',
            resolution: 3,
        })
            .setScrollFactor(0)
            .setDepth(100);

        // Attacking
        this.isAttacking = false;
        this.attackRequested = false
        this.attackCooldown = 0;
        this.attackCooldownDuration = 250; // ms
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
            // this.die();
        }

        this.updateHpBar();
    }

    updateHpBar() {
        const pct = this.hp / this.maxHp;
        this.hpBar.scaleX = pct;
        this.hpText.setText(`${this.hp} / ${this.maxHp}`);
    }
}