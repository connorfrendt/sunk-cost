export default class Player {
    constructor(scene, x, y) {
        this.scene = scene;

        // Stats
        this.hp = 100;
        this.maxHp = 100;
        this.alive = true;
        this.invulnerable = false;
        this.abilities = [];
        
        // Visual
        this.sprite = scene.add.sprite(x, y, 'ninja-idle', 0);

        // HP Bar
        this.hpBarBg = scene.add.rectangle(x, y - 28, 40, 6, 0x440000);
        this.hpBar = scene.add.rectangle(x - 20, y - 28, 40, 6, 0x00ff00);
        this.hpBar.setOrigin(0, 0.5);
    }

    takeDamage(amount) {
        if(!this.alive) {
            return;
        }
        if(this.invulnerable) {
            return;
        }
        
        this.hp -= amount;

        if(this.hp <= 0) {
            this.hp = 0;
            // this.die();
        }

        this.updateHpBar();
    }

    updateHpBar() {
        const pct = this.hp / this.maxHp;
        this.hpBar.scaleX = pct;
    }
}