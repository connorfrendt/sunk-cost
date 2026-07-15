import Phaser from 'phaser';
import { FONT } from '../utils/constants.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const { width, height } = this.cameras.main;

    this.add.text(width / 2, height / 2 - 60, 'YOUR GAME TITLE', {
      fontFamily: FONT.family,
      fontSize: '44px',
      color: FONT.color,
    }).setOrigin(0.5);

    const startText = this.add.text(width / 2, height / 2 + 40, 'Click / Tap to Start', {
      fontFamily: FONT.family,
      fontSize: '22px',
      color: FONT.dim,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: startText,
      alpha: 0.3,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    this.input.once('pointerdown', () => {
      this.scene.start('Game');
    });
  }
}
