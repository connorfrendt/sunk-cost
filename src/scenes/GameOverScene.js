import Phaser from 'phaser';
import { FONT } from '../utils/constants.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  init(data) {
    this.finalScore = data.score ?? 0;
  }

  create() {
    const { width, height } = this.cameras.main;

    this.add.text(width / 2, height / 2 - 40, 'GAME OVER', {
      fontFamily: FONT.family,
      fontSize: '40px',
      color: FONT.color,
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 10, `Score: ${this.finalScore}`, {
      fontFamily: FONT.family,
      fontSize: '22px',
      color: FONT.dim,
    }).setOrigin(0.5);

    const restartText = this.add.text(width / 2, height / 2 + 60, 'Click / Tap to Restart', {
      fontFamily: FONT.family,
      fontSize: '18px',
      color: FONT.accent,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: restartText,
      alpha: 0.4,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    this.input.once('pointerdown', () => {
      this.scene.start('Game');
    });
  }
}
