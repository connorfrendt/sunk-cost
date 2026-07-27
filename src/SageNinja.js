export default class SageNinja {
    constructor(scene, x, y) {
        this.scene = scene;

        this.sprite = scene.add.sprite(x, y + 3, 'sage-ninja');
        this.sprite.setSize(32, 32);
        this.sprite.play('sage-ninja-left');

        this.hasBeenTalkedTo = false;
    }

    faceTowardPlayer(player) {
        const facingKey = player.sprite.x < this.sprite.x ? 'sage-ninja-left' : 'sage-ninja-right';
        this.sprite.play(facingKey, true);
    }

    triggerDialogue() {
        this.hasBeenTalkedTo = true;
        // dialogue/upgrade choice logic goes here
    }
}