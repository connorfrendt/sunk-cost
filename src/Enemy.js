export default class Enemy {
    constructor(scene, x, y, config) {
        this.scene = scene;

        // Visual
        this.squareEnemy = scene.add.rectangle(200, 200, 32, 32, 0x440000);
    }
}