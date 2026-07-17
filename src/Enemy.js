export default class Enemy {
    constructor(scene, x, y, config) {
        this.scene = scene;

        this.attackCooldown = 0;
        this.attackInterval = 3000; // ms between attacks (3s)
        this.attackDamage = config.attackDamage || 10;

        // Visual
        this.squareEnemy = scene.add.rectangle(200, 200, 32, 32, 0x440000);

        // HP Bar
        this.hpBarBg = scene.add.rectangle(x, y - 28, 40, 6, 0x440000);
        this.hpBar = scene.add.rectangle(x - 20, y - 28, 40, 6, 0x00ff00);
        this.hpBar.setOrigin(0, 0.5);
    }

    tryAttack(player, delta) {
        // console.log('DELTA', delta);
        // if(!this.alive) {
        //     return;
        // }
        const distance = Phaser.Math.Distance.Between(
            this.squareEnemy.x, this.squareEnemy.y,
            player.sprite.x, player.sprite.y
        );
        
        if(distance <= 60) {
            this.attackCooldown -= delta;
            
            if(this.attackCooldown <= 0) {
                console.log('here', this.attackDamage);
                player.takeDamage(this.attackDamage);
                this.attackCooldown = this.attackInterval;
            }
        }
        else {
            this.attackCooldown = 0;
        }
    }

    updateHpBar() {
        const pct = Math.max(this.hpBar, 0) / this.maxHp;
        this.hpBar.scaleX = pct;
    }

    syncVisuals() {
        this.hpBarBg.x = this.squareEnemy.x;
        this.hpBarBg.y = this.squareEnemy.y - 28;
        this.hpBar.x = this.squareEnemy.y - 20;
        this.hpBar.y = this.squareEnemy.y - 28;
        // this.nameText.x = this.squareEnemy.x - this.nameText.width / 2;
        // this.nameText.y = this.squareEnemy.y - 40;
    }
}