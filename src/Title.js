export default class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Title' });
    }

    preload() {
        this.load.image('title-screen', '/assets/title-screen.png');
    }

    create() {
        const { width, height } = this.cameras.main;

        this.add.image(width / 2, height / 2, 'title-screen');

        this.add.text(width / 2, height / 2, 'SUNK\nCOST', {
            fontFamily: 'arial',
            fontSize: '100px',
            color: '#7001BE',
            resolution: 3,
        }).setOrigin(0.5);

        const startText = this.add.text(width / 2, height / 2, 'Press SPACE to Start', {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#fbbf24',
            resolution: 3,
        }).setOrigin(0.5);

        this.tweens.add({
            targets: startText,
            alpha: 0.3,
            duration: 700,
            yoyo: true,
            repeat: -1,
        });

        const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        spaceKey.once('down', () => {
            this.scene.start('Controls');
        })
    }
}