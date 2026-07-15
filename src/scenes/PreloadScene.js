import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    const { width, height } = this.cameras.main;

    const box = this.add.graphics();
    box.fillStyle(0x222222, 0.8);
    box.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const bar = this.add.graphics();
    this.load.on('progress', (value) => {
      bar.clear();
      bar.fillStyle(0xffffff, 1);
      bar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    // --- Load your real assets here as you make/source them ---
    // Images:
    // this.load.image('player', 'assets/player.png');
    // Spritesheets:
    // this.load.spritesheet('player_run', 'assets/player_run.png', { frameWidth: 32, frameHeight: 32 });
    // Audio:
    // this.load.audio('jump', 'assets/jump.wav');
    // Tilemaps (e.g. from Tiled):
    // this.load.tilemapTiledJSON('level1', 'assets/level1.json');
  }

  create() {
    this.scene.start('Menu');
  }
}
