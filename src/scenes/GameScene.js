import Phaser from 'phaser';
import { FONT, PLAYER } from '../utils/constants.js';

/**
 * This scene ships with a bare "move + collect" loop using placeholder
 * shapes (rectangle/circle) instead of art, so the project runs the
 * instant you clone it. Swap the shapes for sprites once you have art,
 * and replace collectItem()/update() with your actual theme mechanic.
 */
export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    const { width, height } = this.cameras.main;

    this.score = 0;
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontFamily: FONT.family,
      fontSize: '20px',
      color: FONT.color,
    });

    // --- Placeholder player (swap for this.physics.add.sprite once you have art) ---
    this.player = this.add.rectangle(width / 2, height / 2, 32, 32, 0x4ade80);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');

    // --- Placeholder collectible ---
    this.collectible = this.add.circle(
      Phaser.Math.Between(50, width - 50),
      Phaser.Math.Between(50, height - 50),
      12,
      0xfbbf24
    );
    this.physics.add.existing(this.collectible);

    this.physics.add.overlap(this.player, this.collectible, this.collectItem, null, this);

    // Quick way to reach the GameOver scene while testing.
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.start('GameOver', { score: this.score });
    });
  }

  collectItem() {
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);
    this.collectible.setPosition(
      Phaser.Math.Between(50, this.cameras.main.width - 50),
      Phaser.Math.Between(50, this.cameras.main.height - 50)
    );
  }

  update() {
    const body = this.player.body;
    body.setVelocity(0);

    const left = this.cursors.left.isDown || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;
    const up = this.cursors.up.isDown || this.wasd.W.isDown;
    const down = this.cursors.down.isDown || this.wasd.S.isDown;

    if (left) body.setVelocityX(-PLAYER.speed);
    else if (right) body.setVelocityX(PLAYER.speed);

    if (up) body.setVelocityY(-PLAYER.speed);
    else if (down) body.setVelocityY(PLAYER.speed);

    body.velocity.normalize().scale(PLAYER.speed * (body.velocity.length() > 0 ? 1 : 0));
  }
}
