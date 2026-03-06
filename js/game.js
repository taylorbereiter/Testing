/**
 * Main Game - "The Things They Carried" Literary Quest
 *
 * Phaser 3 game with scenes:
 * - BootScene: Loading & student name entry
 * - MapScene: World map with zone selection
 * - ZoneScene: Challenge list within a zone
 *
 * Challenge rendering is handled by ChallengeRenderer (scaffolding.js)
 * via HTML overlays for rich interaction support.
 */

// ============================================================
// BOOT SCENE - Title & Name Entry
// ============================================================

class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Dark background with subtle gradient effect
        this.cameras.main.setBackgroundColor('#1a1a2e');

        // Title
        this.add.text(width / 2, 120, 'THE THINGS THEY CARRIED', {
            fontFamily: 'Georgia, serif',
            fontSize: '36px',
            color: '#e94560',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, 170, 'A Literary Quest', {
            fontFamily: 'Georgia, serif',
            fontSize: '20px',
            color: '#c4c4c4',
            fontStyle: 'italic'
        }).setOrigin(0.5);

        this.add.text(width / 2, 210, 'by Tim O\'Brien', {
            fontFamily: 'Georgia, serif',
            fontSize: '16px',
            color: '#888'
        }).setOrigin(0.5);

        // Decorative line
        const line = this.add.graphics();
        line.lineStyle(1, 0xe94560, 0.5);
        line.lineBetween(width / 2 - 150, 240, width / 2 + 150, 240);

        // Description
        const desc = [
            'Explore the themes, characters, and literary techniques',
            'of one of the most important works about the Vietnam War.',
            '',
            'Navigate through themed zones, answer challenges,',
            'and unlock deeper understanding of the text.'
        ];
        desc.forEach((line, i) => {
            this.add.text(width / 2, 280 + i * 24, line, {
                fontFamily: 'Georgia, serif',
                fontSize: '14px',
                color: '#888'
            }).setOrigin(0.5);
        });

        // UDL features display
        const features = [
            '[ Multiple ways to learn ]  [ Adaptive difficulty ]',
            '[ Progressive hints ]  [ Your pace, your path ]'
        ];
        features.forEach((line, i) => {
            this.add.text(width / 2, 430 + i * 28, line, {
                fontFamily: 'Georgia, serif',
                fontSize: '13px',
                color: '#e94560',
                fontStyle: 'italic'
            }).setOrigin(0.5);
        });

        // Check if returning student
        this.progress = new StudentProgress();
        if (this.progress.data.studentName) {
            // Returning student
            this.add.text(width / 2, 530, `Welcome back, ${this.progress.data.studentName}!`, {
                fontFamily: 'Georgia, serif',
                fontSize: '18px',
                color: '#ffd700'
            }).setOrigin(0.5);

            this.createButton(width / 2 - 100, 580, 'Continue Quest', () => {
                this.scene.start('MapScene');
            });

            this.createButton(width / 2 + 100, 580, 'Start Over', () => {
                this.progress.reset();
                this.showNameEntry();
            });
        } else {
            this.showNameEntry();
        }
    }

    showNameEntry() {
        const { width, height } = this.cameras.main;

        // Use HTML overlay for name input (Phaser doesn't have native text input)
        const overlayManager = new OverlayManager();
        let html = '<div class="name-entry">';
        html += '<h2>Begin Your Quest</h2>';
        html += '<p>Enter your name to start tracking your progress.</p>';
        html += '<input type="text" id="student-name" placeholder="Your name" maxlength="50" autofocus>';
        html += '<br>';
        html += '<button class="btn btn-primary" id="start-btn">Enter the Story</button>';
        html += '</div>';

        overlayManager.show(html);

        const input = document.getElementById('student-name');
        const btn = document.getElementById('start-btn');

        const startGame = () => {
            const name = input.value.trim();
            if (name.length > 0) {
                this.progress.setStudentName(name);
                overlayManager.hide();
                this.scene.start('MapScene');
            } else {
                input.style.borderColor = '#e74c3c';
                input.setAttribute('placeholder', 'Please enter your name');
            }
        };

        btn.addEventListener('click', startGame);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') startGame();
        });

        // Focus the input
        setTimeout(() => input.focus(), 100);
    }

    createButton(x, y, text, callback) {
        const btn = this.add.text(x, y, text, {
            fontFamily: 'Georgia, serif',
            fontSize: '16px',
            color: '#fff',
            backgroundColor: '#e94560',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#d63851' }));
        btn.on('pointerout', () => btn.setStyle({ backgroundColor: '#e94560' }));
        btn.on('pointerdown', callback);
        return btn;
    }
}


// ============================================================
// MAP SCENE - World map with zone nodes
// ============================================================

class MapScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MapScene' });
    }

    create() {
        this.progress = new StudentProgress();
        this.adaptive = new AdaptiveDifficulty(this.progress);
        const { width, height } = this.cameras.main;

        this.cameras.main.setBackgroundColor('#1a1a2e');

        // Header
        this.add.text(width / 2, 30, 'THE THINGS THEY CARRIED', {
            fontFamily: 'Georgia, serif',
            fontSize: '24px',
            color: '#e94560',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Student info bar
        this.add.text(20, 20, `Explorer: ${this.progress.data.studentName}`, {
            fontFamily: 'Georgia, serif',
            fontSize: '13px',
            color: '#888'
        });

        const scoreText = this.add.text(width - 20, 20, `Score: ${this.progress.data.totalScore}`, {
            fontFamily: 'Georgia, serif',
            fontSize: '13px',
            color: '#ffd700'
        }).setOrigin(1, 0);

        // Difficulty indicator
        this.add.text(width - 20, 42, `Difficulty: ${this.adaptive.getLevelName()}`, {
            fontFamily: 'Georgia, serif',
            fontSize: '12px',
            color: this.adaptive.getLevelColor()
        }).setOrigin(1, 0);

        // Draw connecting paths between zones
        this.drawPaths();

        // Draw zone nodes
        GAME_CONTENT.zones.forEach(zone => {
            this.createZoneNode(zone);
        });

        // Instructions
        this.add.text(width / 2, height - 40, 'Click a zone to begin exploring. Complete challenges to unlock new areas.', {
            fontFamily: 'Georgia, serif',
            fontSize: '13px',
            color: '#555',
            fontStyle: 'italic'
        }).setOrigin(0.5);

        // Choice indicator
        this.add.text(width / 2, height - 60, 'You choose your path — explore in any order you wish among unlocked zones.', {
            fontFamily: 'Georgia, serif',
            fontSize: '12px',
            color: '#e94560'
        }).setOrigin(0.5);
    }

    drawPaths() {
        const graphics = this.add.graphics();
        const zones = GAME_CONTENT.zones;

        // Draw lines between sequential zones
        for (let i = 0; i < zones.length - 1; i++) {
            const from = zones[i].mapPosition;
            const to = zones[i + 1].mapPosition;
            const isUnlocked = this.progress.isZoneUnlocked(zones[i + 1].id);

            graphics.lineStyle(2, isUnlocked ? 0x555555 : 0x333333, isUnlocked ? 0.6 : 0.3);

            // Draw dashed line
            const steps = 20;
            for (let s = 0; s < steps; s += 2) {
                const t1 = s / steps;
                const t2 = (s + 1) / steps;
                graphics.lineBetween(
                    from.x + (to.x - from.x) * t1,
                    from.y + (to.y - from.y) * t1,
                    from.x + (to.x - from.x) * t2,
                    from.y + (to.y - from.y) * t2
                );
            }
        }
    }

    createZoneNode(zone) {
        const isUnlocked = this.progress.isZoneUnlocked(zone.id);
        const isCompleted = this.progress.isZoneCompleted(zone.id);
        const { completed, total } = this.progress.getZoneChallengeProgress(zone.id);

        const x = zone.mapPosition.x;
        const y = zone.mapPosition.y;
        const color = Phaser.Display.Color.HexStringToColor(zone.color).color;

        // Zone circle
        const circle = this.add.graphics();
        if (isUnlocked) {
            // Outer glow
            circle.lineStyle(3, color, 0.3);
            circle.strokeCircle(x, y, 52);

            // Main circle
            circle.fillStyle(isCompleted ? 0x2ecc71 : color, isCompleted ? 0.3 : 0.2);
            circle.fillCircle(x, y, 45);
            circle.lineStyle(2, isCompleted ? 0x2ecc71 : color, 0.8);
            circle.strokeCircle(x, y, 45);

            // Completion indicator
            if (isCompleted) {
                this.add.text(x, y - 5, '\u2713', {
                    fontFamily: 'Georgia, serif',
                    fontSize: '32px',
                    color: '#2ecc71'
                }).setOrigin(0.5);
            } else {
                // Progress dots
                this.add.text(x, y - 5, `${completed}/${total}`, {
                    fontFamily: 'Georgia, serif',
                    fontSize: '16px',
                    color: '#fff'
                }).setOrigin(0.5);
            }
        } else {
            // Locked zone
            circle.fillStyle(0x333333, 0.3);
            circle.fillCircle(x, y, 45);
            circle.lineStyle(2, 0x555555, 0.4);
            circle.strokeCircle(x, y, 45);

            this.add.text(x, y - 5, '\u{1F512}', {
                fontFamily: 'Georgia, serif',
                fontSize: '24px',
                color: '#555'
            }).setOrigin(0.5);
        }

        // Zone name
        this.add.text(x, y + 60, zone.name, {
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            color: isUnlocked ? '#e0e0e0' : '#555',
            fontStyle: 'bold',
            align: 'center',
            wordWrap: { width: 150 }
        }).setOrigin(0.5, 0);

        // Description on hover
        if (isUnlocked) {
            const hitArea = this.add.zone(x, y, 100, 100).setInteractive({ useHandCursor: true });

            // Hover tooltip
            const tooltip = this.add.text(x, y + 95, zone.description, {
                fontFamily: 'Georgia, serif',
                fontSize: '11px',
                color: '#888',
                align: 'center',
                wordWrap: { width: 180 }
            }).setOrigin(0.5, 0).setAlpha(0);

            hitArea.on('pointerover', () => {
                this.tweens.add({ targets: tooltip, alpha: 1, duration: 200 });
            });

            hitArea.on('pointerout', () => {
                this.tweens.add({ targets: tooltip, alpha: 0, duration: 200 });
            });

            hitArea.on('pointerdown', () => {
                this.scene.start('ZoneScene', { zoneId: zone.id });
            });
        }
    }
}


// ============================================================
// ZONE SCENE - Challenge list within a zone
// ============================================================

class ZoneScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ZoneScene' });
    }

    init(data) {
        this.zoneId = data.zoneId;
    }

    create() {
        this.progress = new StudentProgress();
        this.adaptive = new AdaptiveDifficulty(this.progress);
        this.overlayManager = new OverlayManager();
        this.challengeRenderer = new ChallengeRenderer(
            this.overlayManager,
            this.progress,
            this.adaptive,
            (challengeId, success) => this.onChallengeComplete(challengeId, success)
        );

        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor('#1a1a2e');

        const zone = GAME_CONTENT.zones.find(z => z.id === this.zoneId);
        if (!zone) {
            this.scene.start('MapScene');
            return;
        }

        this.zone = zone;

        // Back button
        const backBtn = this.add.text(20, 20, '\u2190 Back to Map', {
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            color: '#888'
        }).setInteractive({ useHandCursor: true });
        backBtn.on('pointerover', () => backBtn.setColor('#e94560'));
        backBtn.on('pointerout', () => backBtn.setColor('#888'));
        backBtn.on('pointerdown', () => this.scene.start('MapScene'));

        // Zone title
        this.add.text(width / 2, 60, zone.name, {
            fontFamily: 'Georgia, serif',
            fontSize: '28px',
            color: zone.color,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Zone description
        this.add.text(width / 2, 100, zone.description, {
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            color: '#888',
            fontStyle: 'italic',
            align: 'center',
            wordWrap: { width: 600 }
        }).setOrigin(0.5);

        // Decorative line
        const line = this.add.graphics();
        line.lineStyle(1, Phaser.Display.Color.HexStringToColor(zone.color).color, 0.3);
        line.lineBetween(width / 2 - 200, 130, width / 2 + 200, 130);

        // Challenge cards
        this.challengeCards = [];
        zone.challenges.forEach((challenge, index) => {
            this.createChallengeCard(challenge, index, zone.color);
        });

        // Student choice note
        this.add.text(width / 2, height - 30, 'Choose any challenge — complete them in any order you prefer.', {
            fontFamily: 'Georgia, serif',
            fontSize: '12px',
            color: '#e94560',
            fontStyle: 'italic'
        }).setOrigin(0.5);
    }

    createChallengeCard(challenge, index, zoneColor) {
        const { width } = this.cameras.main;
        const isCompleted = this.progress.isChallengeCompleted(challenge.id);

        const cardX = width / 2;
        const cardY = 180 + index * 140;
        const cardW = 500;
        const cardH = 110;

        const color = Phaser.Display.Color.HexStringToColor(zoneColor).color;

        // Card background
        const card = this.add.graphics();
        if (isCompleted) {
            card.fillStyle(0x2ecc71, 0.08);
            card.lineStyle(1, 0x2ecc71, 0.3);
        } else {
            card.fillStyle(0xffffff, 0.03);
            card.lineStyle(1, color, 0.2);
        }
        card.fillRoundedRect(cardX - cardW / 2, cardY - cardH / 2, cardW, cardH, 8);
        card.strokeRoundedRect(cardX - cardW / 2, cardY - cardH / 2, cardW, cardH, 8);

        // Type icon
        const typeIcons = {
            'multiple-choice': 'MC',
            'drag-and-drop': 'SORT',
            'typed-response': 'WRITE'
        };
        const typeColors = {
            'multiple-choice': '#3498db',
            'drag-and-drop': '#f39c12',
            'typed-response': '#9b59b6'
        };

        this.add.text(cardX - cardW / 2 + 20, cardY - 25, typeIcons[challenge.type], {
            fontFamily: 'Georgia, serif',
            fontSize: '11px',
            color: typeColors[challenge.type],
            backgroundColor: typeColors[challenge.type] + '22',
            padding: { x: 8, y: 4 }
        });

        // Challenge title
        const title = challenge.representations.text.prompt;
        const shortTitle = title.length > 80 ? title.substring(0, 80) + '...' : title;
        this.add.text(cardX - cardW / 2 + 20, cardY, shortTitle, {
            fontFamily: 'Georgia, serif',
            fontSize: '13px',
            color: isCompleted ? '#2ecc71' : '#c4c4c4',
            wordWrap: { width: cardW - 80 },
            lineSpacing: 4
        });

        // Completion status
        if (isCompleted) {
            this.add.text(cardX + cardW / 2 - 20, cardY - 20, '\u2713 Complete', {
                fontFamily: 'Georgia, serif',
                fontSize: '12px',
                color: '#2ecc71'
            }).setOrigin(1, 0);
        }

        // Click area
        const hitArea = this.add.zone(cardX, cardY, cardW, cardH).setInteractive({ useHandCursor: true });

        hitArea.on('pointerover', () => {
            card.clear();
            card.fillStyle(isCompleted ? 0x2ecc71 : color, 0.12);
            card.lineStyle(2, isCompleted ? 0x2ecc71 : color, 0.5);
            card.fillRoundedRect(cardX - cardW / 2, cardY - cardH / 2, cardW, cardH, 8);
            card.strokeRoundedRect(cardX - cardW / 2, cardY - cardH / 2, cardW, cardH, 8);
        });

        hitArea.on('pointerout', () => {
            card.clear();
            if (isCompleted) {
                card.fillStyle(0x2ecc71, 0.08);
                card.lineStyle(1, 0x2ecc71, 0.3);
            } else {
                card.fillStyle(0xffffff, 0.03);
                card.lineStyle(1, color, 0.2);
            }
            card.fillRoundedRect(cardX - cardW / 2, cardY - cardH / 2, cardW, cardH, 8);
            card.strokeRoundedRect(cardX - cardW / 2, cardY - cardH / 2, cardW, cardH, 8);
        });

        hitArea.on('pointerdown', () => {
            this.challengeRenderer.render(challenge);
        });

        this.challengeCards.push({ card, hitArea, challenge });
    }

    onChallengeComplete(challengeId, success) {
        // Check if all challenges in zone are complete
        const { completed, total } = this.progress.getZoneChallengeProgress(this.zoneId);

        if (completed >= total) {
            // Zone complete! Unlock next zone
            this.progress.completeZone(this.zoneId);
            const zoneIndex = GAME_CONTENT.zones.findIndex(z => z.id === this.zoneId);
            if (zoneIndex < GAME_CONTENT.zones.length - 1) {
                const nextZone = GAME_CONTENT.zones[zoneIndex + 1];
                this.progress.unlockZone(nextZone.id);

                // Show celebration overlay
                const overlay = new OverlayManager();
                overlay.show(`
                    <div style="text-align: center; padding: 20px;">
                        <h2 style="color: #2ecc71;">Zone Complete!</h2>
                        <p style="font-size: 1.1em; margin: 16px 0;">You've completed <strong>${this.zone.name}</strong>!</p>
                        <p style="color: #ffd700;">New zone unlocked: <strong>${nextZone.name}</strong></p>
                        <p style="color: #888; font-size: 0.9em; margin-top: 12px;">${nextZone.description}</p>
                        <div class="btn-row" style="justify-content: center; margin-top: 24px;">
                            <button class="btn btn-primary" id="next-zone-btn">Explore ${nextZone.name}</button>
                            <button class="btn btn-secondary" id="back-map-btn">Back to Map</button>
                        </div>
                    </div>
                `);

                document.getElementById('next-zone-btn').addEventListener('click', () => {
                    overlay.hide();
                    this.scene.start('ZoneScene', { zoneId: nextZone.id });
                });
                document.getElementById('back-map-btn').addEventListener('click', () => {
                    overlay.hide();
                    this.scene.start('MapScene');
                });
            } else {
                // All zones complete!
                const overlay = new OverlayManager();
                overlay.show(`
                    <div style="text-align: center; padding: 20px;">
                        <h2 style="color: #ffd700;">Quest Complete!</h2>
                        <p style="font-size: 1.1em; margin: 16px 0;">You've explored all the zones and completed every challenge!</p>
                        <p style="color: #888;">Final Score: <span style="color: #ffd700; font-size: 1.3em;">${this.progress.data.totalScore}</span></p>
                        <p style="color: #888; font-size: 0.9em; margin-top: 16px;">Your teacher will review your written responses and provide feedback.</p>
                        <div class="btn-row" style="justify-content: center; margin-top: 24px;">
                            <button class="btn btn-primary" id="back-map-final">Back to Map</button>
                        </div>
                    </div>
                `);
                document.getElementById('back-map-final').addEventListener('click', () => {
                    overlay.hide();
                    this.scene.start('MapScene');
                });
            }
        } else {
            // Refresh scene to show updated progress
            this.scene.restart({ zoneId: this.zoneId });
        }
    }
}


// ============================================================
// PHASER GAME CONFIG
// ============================================================

const gameConfig = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 1024,
    height: 768,
    backgroundColor: '#1a1a2e',
    scene: [BootScene, MapScene, ZoneScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    dom: {
        createContainer: true
    }
};

// Launch the game
const game = new Phaser.Game(gameConfig);
