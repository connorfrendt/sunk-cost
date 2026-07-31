export default class SageNinja {
    constructor(scene, x, y, wallTiles) {
        this.scene = scene;

        this.sprite = scene.add.sprite(x, y + 3, 'sage-ninja');
        this.sprite.setSize(32, 32);
        this.sprite.play('sage-ninja-left');
        
        this.hasBeenTalkedTo = false;
        this.playerNearby = false;
        
        this.wallTiles = wallTiles;
    }

    tryInteract(vKeyJustPressed, player) {
        const distance = Phaser.Math.Distance.Between(
            player.sprite.x, player.sprite.y,
            this.sprite.x, this.sprite.y
        );
        this.playerNearby = distance <= 40;

        if(!this.playerNearby || this.hasBeenTalkedTo) {
            return;
        }

        if(vKeyJustPressed) {
            this.triggerDialogue();
        }
    }

    faceTowardPlayer(player) {
        const facingKey = player.sprite.x < this.sprite.x ? 'sage-ninja-left' : 'sage-ninja-right';
        this.sprite.play(facingKey, true);
    }

    triggerDialogue() {
        this.hasBeenTalkedTo = true;

        if(this.scene.sageNinjaEncounterCount === 0) {
            this.scene.sound.play('sage-ninja-line-1');
        }
        if(this.scene.sageNinjaEncounterCount === 1) {
            this.scene.sound.play('sage-ninja-line-2');
        }
        if(this.scene.sageNinjaEncounterCount === 2) {
            this.scene.sound.play('sage-ninja-line-3');
        }

        this.scene.currentEncounterWallTiles = this.wallTiles;
        this.scene.showDialogue(this.scene.sageNinjaEncounterCount);
        this.scene.sageNinjaEncounterCount++;
    }
}