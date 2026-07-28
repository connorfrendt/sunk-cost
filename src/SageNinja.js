export default class SageNinja {
    constructor(scene, x, y) {
        this.scene = scene;

        this.sprite = scene.add.sprite(x, y + 3, 'sage-ninja');
        this.sprite.setSize(32, 32);
        this.sprite.play('sage-ninja-left');

        this.hasBeenTalkedTo = false;
        this.playerNearby = false;
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
        this.scene.showDialogue(this.scene.sageNinjaEncounterCount);
        this.scene.sageNinjaEncounterCount++;
    }
}