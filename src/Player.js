export default class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        
        // Visual
        this.sprite = scene.add.sprite(x, y, 'ninja-idle', 0);
    }
}