export default class ControlsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Controls' });
    }

    preload() {
        this.load.image('title-screen', '/assets/title-screen.png');
    }

    create() {
        const { width, height } = this.cameras.main;

        this.add.image(width / 2, height / 2, 'title-screen');

        this.add.text(width / 2, 50, 'CONTROLS', {
            fontFamily: 'monospace',
            fontSize: '28px',
            color: '#ffffff',
            resolution: 3,
        }).setOrigin(0.5);

        const controlList = [
            'Arrow Keys/WASD - Move',
            'Space - Jump',
            'X - Attack',
            'V - Interact',
            'Left Click - Select Upgrade'
        ];

        controlList.forEach((line, i) => {
            this.add.text(width / 2, 120 + i * 30, line, {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ffffff',
                resolution: 3,
            }).setOrigin(0.5);
        });

        const continueText = this.add.text(width / 2, height - 40, 'Press SPACE to Continue', {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#fbbf24',
            resolution: 3,
        }).setOrigin(0.5);

        this.tweens.add({
            targets: continueText,
            alpha: 0.3,
            duration: 700,
            yoyo: true,
            repeat: -1
        });

        const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        spaceKey.once('down', () => {
            this.scene.start('GameScene');
        });
    }
}