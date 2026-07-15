import Phaser from 'phaser';

/**
 * Loads only what's needed to render the Preload scene's loading bar
 * (e.g. a logo image), then hands off immediately.
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // this.load.image('logo', 'assets/logo.png');
  }

  create() {
    this.scene.start('Preload');
  }
}
