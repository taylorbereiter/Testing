/**
 * Scaffolding & UDL Systems
 *
 * Handles:
 * - Progressive hint system (3-tier hints)
 * - Adaptive difficulty (adjusts based on performance)
 * - Student progress tracking & persistence
 * - Multiple representations management
 * - Self-reflection workflow for typed responses
 */

// ============================================================
// STUDENT PROGRESS & STORAGE
// ============================================================

class StudentProgress {
    constructor() {
        this.storageKey = 'literary_quest_progress';
        this.responsesKey = 'literary_quest_responses';
        this.data = this.load();
    }

    load() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : this.createNew();
        } catch {
            return this.createNew();
        }
    }

    createNew() {
        return {
            studentName: '',
            currentZone: 'weight',
            zonesCompleted: [],
            challengeResults: {},   // { challengeId: { attempts, correct, difficulty, hintsUsed } }
            performanceHistory: [],  // last N results for adaptive difficulty
            unlockedZones: ['weight'],
            totalScore: 0,
            startedAt: new Date().toISOString()
        };
    }

    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (e) {
            console.warn('Could not save progress:', e);
        }
    }

    setStudentName(name) {
        this.data.studentName = name.trim();
        this.save();
    }

    recordChallengeResult(challengeId, correct, difficulty, hintsUsed) {
        this.data.challengeResults[challengeId] = {
            attempts: (this.data.challengeResults[challengeId]?.attempts || 0) + 1,
            correct,
            difficulty,
            hintsUsed,
            lastAttempt: new Date().toISOString()
        };

        this.data.performanceHistory.push({
            challengeId,
            correct,
            difficulty,
            hintsUsed,
            timestamp: new Date().toISOString()
        });

        // Keep last 20 results for adaptive difficulty
        if (this.data.performanceHistory.length > 20) {
            this.data.performanceHistory = this.data.performanceHistory.slice(-20);
        }

        if (correct) {
            this.data.totalScore += (difficulty + 1) * 10;
        }

        this.save();
    }

    recordTypedResponse(challengeId, response, question) {
        try {
            const responses = this.getAllTypedResponses();
            responses.push({
                studentName: this.data.studentName,
                challengeId,
                question,
                response,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem(this.responsesKey, JSON.stringify(responses));
        } catch (e) {
            console.warn('Could not save typed response:', e);
        }
    }

    getAllTypedResponses() {
        try {
            const saved = localStorage.getItem(this.responsesKey);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    }

    unlockZone(zoneId) {
        if (!this.data.unlockedZones.includes(zoneId)) {
            this.data.unlockedZones.push(zoneId);
            this.save();
        }
    }

    completeZone(zoneId) {
        if (!this.data.zonesCompleted.includes(zoneId)) {
            this.data.zonesCompleted.push(zoneId);
            this.save();
        }
    }

    isZoneUnlocked(zoneId) {
        return this.data.unlockedZones.includes(zoneId);
    }

    isZoneCompleted(zoneId) {
        return this.data.zonesCompleted.includes(zoneId);
    }

    isChallengeCompleted(challengeId) {
        return this.data.challengeResults[challengeId]?.correct === true;
    }

    getZoneChallengeProgress(zoneId) {
        const zone = GAME_CONTENT.zones.find(z => z.id === zoneId);
        if (!zone) return { completed: 0, total: 0 };
        const total = zone.challenges.length;
        const completed = zone.challenges.filter(c =>
            this.isChallengeCompleted(c.id)
        ).length;
        return { completed, total };
    }

    reset() {
        this.data = this.createNew();
        this.save();
    }
}


// ============================================================
// ADAPTIVE DIFFICULTY
// ============================================================

class AdaptiveDifficulty {
    constructor(progress) {
        this.progress = progress;
        this.levels = ['easy', 'medium', 'hard'];
    }

    /**
     * Determine difficulty for next challenge based on recent performance.
     * Uses a sliding window of recent results.
     */
    getCurrentLevel() {
        const history = this.progress.data.performanceHistory;
        if (history.length < 3) return 0; // Start easy

        // Look at last 5 results
        const recent = history.slice(-5);
        const correctCount = recent.filter(r => r.correct).length;
        const avgHints = recent.reduce((sum, r) => sum + (r.hintsUsed || 0), 0) / recent.length;

        // High accuracy + few hints = increase difficulty
        if (correctCount >= 4 && avgHints < 1) return 2; // Hard
        if (correctCount >= 3 && avgHints < 2) return 1; // Medium
        return 0; // Easy
    }

    getLevelName() {
        return this.levels[this.getCurrentLevel()];
    }

    getLevelColor() {
        const colors = ['#2ecc71', '#f39c12', '#e94560'];
        return colors[this.getCurrentLevel()];
    }
}


// ============================================================
// PROGRESSIVE HINT SYSTEM
// ============================================================

class HintSystem {
    constructor() {
        this.currentHintIndex = 0;
        this.hintsUsed = 0;
    }

    reset() {
        this.currentHintIndex = 0;
        this.hintsUsed = 0;
    }

    getNextHint(hints) {
        if (this.currentHintIndex >= hints.length) {
            return null; // No more hints
        }
        const hint = hints[this.currentHintIndex];
        this.currentHintIndex++;
        this.hintsUsed++;
        return {
            text: hint,
            level: this.currentHintIndex,
            total: hints.length,
            label: this.getHintLabel(this.currentHintIndex, hints.length)
        };
    }

    getHintLabel(level, total) {
        if (level === 1) return 'Nudge';
        if (level === 2) return 'Hint';
        if (level === total) return 'Strong Hint';
        return `Hint ${level}`;
    }

    hasMoreHints(hints) {
        return this.currentHintIndex < hints.length;
    }
}


// ============================================================
// OVERLAY UI MANAGER
// ============================================================

class OverlayManager {
    constructor() {
        this.overlay = document.getElementById('overlay');
        this.content = document.getElementById('overlay-content');
        this.currentRepresentation = 'text';
        this.audioEnabled = false;

        // Audio toggle setup
        const audioBtn = document.getElementById('audio-toggle');
        if (audioBtn) {
            audioBtn.addEventListener('click', () => {
                this.audioEnabled = !this.audioEnabled;
                document.getElementById('audio-icon').textContent =
                    this.audioEnabled ? '\u{1F50A}' : '\u{1F508}';
            });
        }
    }

    show(html) {
        this.content.innerHTML = html;
        this.overlay.classList.remove('hidden');
    }

    hide() {
        this.overlay.classList.add('hidden');
        this.content.innerHTML = '';
    }

    /**
     * Build representation tabs HTML (UDL: Multiple Representations)
     */
    buildRepTabs(representations, activeRep) {
        const tabs = [];
        if (representations.text) tabs.push({ id: 'text', label: 'Read It' });
        if (representations.visual) tabs.push({ id: 'visual', label: 'See It' });
        if (representations.audio) tabs.push({ id: 'audio', label: 'Hear It' });

        let html = '<div class="rep-tabs">';
        tabs.forEach(tab => {
            html += `<button class="rep-tab ${tab.id === activeRep ? 'active' : ''}" data-rep="${tab.id}">${tab.label}</button>`;
        });
        html += '</div>';

        // Content for each tab
        tabs.forEach(tab => {
            html += `<div class="rep-content ${tab.id === activeRep ? 'active' : ''}" data-rep-content="${tab.id}">`;
            const rep = representations[tab.id];
            if (tab.id === 'text') {
                html += `<p>${rep.prompt}</p>`;
                if (rep.passage) {
                    html += `<div class="passage-text">${rep.passage}</div>`;
                }
            } else if (tab.id === 'visual') {
                html += `<p>${rep.prompt}</p>`;
                if (rep.description) {
                    html += `<div class="passage-text">${rep.description}</div>`;
                }
            } else if (tab.id === 'audio') {
                html += `<div class="passage-text">${typeof rep === 'string' ? rep : rep.prompt || ''}</div>`;
                html += `<p style="font-size: 0.8em; color: #888; margin-top: 8px;"><em>Audio description — read aloud or use your browser's text-to-speech feature.</em></p>`;
            }
            html += '</div>';
        });

        return html;
    }

    /**
     * Set up tab switching after HTML is rendered
     */
    setupRepTabs() {
        const tabs = this.content.querySelectorAll('.rep-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const repId = tab.dataset.rep;
                // Update tab active states
                this.content.querySelectorAll('.rep-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                // Update content visibility
                this.content.querySelectorAll('.rep-content').forEach(c => c.classList.remove('active'));
                const content = this.content.querySelector(`[data-rep-content="${repId}"]`);
                if (content) content.classList.add('active');
                this.currentRepresentation = repId;

                // Trigger browser TTS if audio tab selected and enabled
                if (repId === 'audio' && this.audioEnabled && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    const text = content.querySelector('.passage-text')?.textContent;
                    if (text) {
                        const utterance = new SpeechSynthesisUtterance(text);
                        utterance.rate = 0.9;
                        window.speechSynthesis.speak(utterance);
                    }
                }
            });
        });
    }

    /**
     * Build difficulty indicator HTML
     */
    buildDifficultyIndicator(level) {
        const labels = ['Foundational', 'Analytical', 'Advanced'];
        const classes = ['easy', 'medium', 'hard'];
        let html = '<div class="difficulty-indicator">';
        for (let i = 0; i < 3; i++) {
            html += `<div class="difficulty-dot ${classes[i]} ${i <= level ? 'active' : ''}"></div>`;
        }
        html += `<span class="difficulty-label">${labels[level]}</span>`;
        html += '</div>';
        return html;
    }
}


// ============================================================
// CHALLENGE RENDERER
// ============================================================

class ChallengeRenderer {
    constructor(overlayManager, progress, adaptiveDifficulty, onComplete) {
        this.overlay = overlayManager;
        this.progress = progress;
        this.adaptive = adaptiveDifficulty;
        this.hintSystem = new HintSystem();
        this.onComplete = onComplete; // callback when challenge is done
    }

    /**
     * Render a challenge based on its type
     */
    render(challenge) {
        this.hintSystem.reset();
        const type = challenge.type;

        switch (type) {
            case 'multiple-choice':
                this.renderMultipleChoice(challenge);
                break;
            case 'drag-and-drop':
                this.renderDragAndDrop(challenge);
                break;
            case 'typed-response':
                this.renderTypedResponse(challenge);
                break;
        }
    }

    // ---- MULTIPLE CHOICE ----
    renderMultipleChoice(challenge) {
        const diffLevel = this.adaptive.getCurrentLevel();
        const tier = challenge.tiers[diffLevel] || challenge.tiers[0];

        let html = this.overlay.buildDifficultyIndicator(diffLevel);
        html += this.overlay.buildRepTabs(challenge.representations, 'text');
        html += '<div class="mc-options">';
        tier.options.forEach((opt, i) => {
            html += `<button class="mc-option" data-index="${i}">${opt.text}</button>`;
        });
        html += '</div>';
        html += '<div id="hint-area"></div>';
        html += '<div id="feedback-area"></div>';
        html += '<div class="btn-row">';
        html += `<button class="btn btn-hint" id="hint-btn">Need a Hint</button>`;
        html += `<button class="btn btn-secondary" id="skip-btn">Skip for Now</button>`;
        html += '</div>';

        this.overlay.show(html);
        this.overlay.setupRepTabs();

        let answered = false;

        // MC option click handlers
        this.overlay.content.querySelectorAll('.mc-option').forEach(btn => {
            btn.addEventListener('click', () => {
                if (answered) return;
                answered = true;

                const index = parseInt(btn.dataset.index);
                const isCorrect = tier.options[index].correct;

                // Visual feedback
                btn.classList.add(isCorrect ? 'correct' : 'incorrect');
                if (!isCorrect) {
                    // Highlight correct answer
                    tier.options.forEach((opt, i) => {
                        if (opt.correct) {
                            this.overlay.content.querySelectorAll('.mc-option')[i].classList.add('correct');
                        }
                    });
                }

                // Show feedback
                const feedbackArea = this.overlay.content.querySelector('#feedback-area');
                const feedbackText = isCorrect ? tier.feedback.correct : tier.feedback.incorrect;
                feedbackArea.innerHTML = `<div class="feedback ${isCorrect ? 'success' : 'error'}"><p>${feedbackText}</p></div>`;

                // Record result
                this.progress.recordChallengeResult(
                    challenge.id, isCorrect, diffLevel, this.hintSystem.hintsUsed
                );

                // Add continue button
                const btnRow = this.overlay.content.querySelector('.btn-row');
                btnRow.innerHTML = `<button class="btn btn-primary" id="continue-btn">${isCorrect ? 'Continue' : 'Try Next Challenge'}</button>`;
                document.getElementById('continue-btn').addEventListener('click', () => {
                    this.overlay.hide();
                    this.onComplete(challenge.id, isCorrect);
                });
            });
        });

        // Hint button
        document.getElementById('hint-btn').addEventListener('click', () => {
            if (answered) return;
            const hint = this.hintSystem.getNextHint(challenge.hints);
            if (hint) {
                const hintArea = this.overlay.content.querySelector('#hint-area');
                hintArea.innerHTML += `<div class="hint-box"><div class="hint-level">${hint.label} (${hint.level}/${hint.total})</div><p>${hint.text}</p></div>`;
                if (!this.hintSystem.hasMoreHints(challenge.hints)) {
                    document.getElementById('hint-btn').disabled = true;
                    document.getElementById('hint-btn').textContent = 'No More Hints';
                }
            }
        });

        // Skip button
        document.getElementById('skip-btn').addEventListener('click', () => {
            this.overlay.hide();
            this.onComplete(challenge.id, false);
        });
    }

    // ---- DRAG AND DROP ----
    renderDragAndDrop(challenge) {
        let html = this.overlay.buildDifficultyIndicator(0);
        html += this.overlay.buildRepTabs(challenge.representations, 'text');

        html += '<div class="drag-container">';

        // Source items
        html += '<div class="drag-source-area"><h3>Items to Sort</h3><div id="source-items">';
        // Shuffle items
        const shuffled = [...challenge.items].sort(() => Math.random() - 0.5);
        shuffled.forEach((item, i) => {
            html += `<div class="drag-item" draggable="true" data-item-index="${challenge.items.indexOf(item)}">${item.text}</div>`;
        });
        html += '</div></div>';

        // Target categories
        html += '<div class="drag-target-area"><h3>Categories</h3>';
        challenge.categories.forEach(cat => {
            html += `<div class="drop-zone" data-category="${cat}"><div class="drop-zone-label">${cat}</div></div>`;
        });
        html += '</div></div>';

        html += '<div id="hint-area"></div>';
        html += '<div id="feedback-area"></div>';
        html += '<div class="btn-row">';
        html += '<button class="btn btn-hint" id="hint-btn">Need a Hint</button>';
        html += '<button class="btn btn-primary" id="check-btn">Check Answers</button>';
        html += '<button class="btn btn-secondary" id="skip-btn">Skip for Now</button>';
        html += '</div>';

        this.overlay.show(html);
        this.overlay.setupRepTabs();

        // Set up drag and drop
        this.setupDragAndDrop(challenge);

        // Hint button
        document.getElementById('hint-btn').addEventListener('click', () => {
            const hint = this.hintSystem.getNextHint(challenge.hints);
            if (hint) {
                const hintArea = this.overlay.content.querySelector('#hint-area');
                hintArea.innerHTML += `<div class="hint-box"><div class="hint-level">${hint.label} (${hint.level}/${hint.total})</div><p>${hint.text}</p></div>`;
                if (!this.hintSystem.hasMoreHints(challenge.hints)) {
                    document.getElementById('hint-btn').disabled = true;
                    document.getElementById('hint-btn').textContent = 'No More Hints';
                }
            }
        });

        // Check button
        document.getElementById('check-btn').addEventListener('click', () => {
            this.checkDragAndDrop(challenge);
        });

        // Skip button
        document.getElementById('skip-btn').addEventListener('click', () => {
            this.overlay.hide();
            this.onComplete(challenge.id, false);
        });
    }

    setupDragAndDrop(challenge) {
        const items = this.overlay.content.querySelectorAll('.drag-item');
        const zones = this.overlay.content.querySelectorAll('.drop-zone');
        const sourceArea = this.overlay.content.querySelector('#source-items');

        let draggedItem = null;

        items.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                draggedItem = item;
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                draggedItem = null;
                zones.forEach(z => z.classList.remove('drag-over'));
            });
        });

        zones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('drag-over');
            });

            zone.addEventListener('dragleave', () => {
                zone.classList.remove('drag-over');
            });

            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over');
                if (draggedItem) {
                    zone.appendChild(draggedItem);
                }
            });
        });

        // Allow dragging back to source
        sourceArea.addEventListener('dragover', (e) => e.preventDefault());
        sourceArea.addEventListener('drop', (e) => {
            e.preventDefault();
            if (draggedItem) {
                sourceArea.appendChild(draggedItem);
            }
        });
    }

    checkDragAndDrop(challenge) {
        const zones = this.overlay.content.querySelectorAll('.drop-zone');
        let correct = 0;
        let total = challenge.items.length;

        zones.forEach(zone => {
            const category = zone.dataset.category;
            const items = zone.querySelectorAll('.drag-item');
            items.forEach(item => {
                const index = parseInt(item.dataset.itemIndex);
                const expected = challenge.items[index].category;
                if (expected === category) {
                    correct++;
                    item.style.borderColor = '#2ecc71';
                } else {
                    item.style.borderColor = '#e74c3c';
                }
            });
        });

        // Check if all items are placed
        const sourceitems = this.overlay.content.querySelectorAll('#source-items .drag-item');
        if (sourceitems.length > 0) {
            const feedbackArea = this.overlay.content.querySelector('#feedback-area');
            feedbackArea.innerHTML = `<div class="feedback info"><p>You still have ${sourceitems.length} item(s) to place. Drag all items into a category before checking.</p></div>`;
            return;
        }

        const percentage = correct / total;
        const isCorrect = percentage === 1;
        const isPartial = percentage >= 0.5;

        let feedbackText;
        if (isCorrect) feedbackText = challenge.feedback.correct;
        else if (isPartial) feedbackText = challenge.feedback.partial;
        else feedbackText = challenge.feedback.incorrect;

        const feedbackArea = this.overlay.content.querySelector('#feedback-area');
        feedbackArea.innerHTML = `<div class="feedback ${isCorrect ? 'success' : 'error'}"><p>${feedbackText}</p><p style="margin-top:8px; color: #888;">${correct}/${total} correct</p></div>`;

        this.progress.recordChallengeResult(challenge.id, isCorrect, 0, this.hintSystem.hintsUsed);

        // Replace buttons
        const btnRow = this.overlay.content.querySelector('.btn-row');
        if (isCorrect) {
            btnRow.innerHTML = '<button class="btn btn-primary" id="continue-btn">Continue</button>';
        } else {
            btnRow.innerHTML = '<button class="btn btn-secondary" id="retry-btn">Try Again</button><button class="btn btn-primary" id="continue-btn">Continue Anyway</button>';
            document.getElementById('retry-btn').addEventListener('click', () => {
                this.overlay.hide();
                setTimeout(() => this.render(challenge), 100);
            });
        }
        document.getElementById('continue-btn').addEventListener('click', () => {
            this.overlay.hide();
            this.onComplete(challenge.id, isCorrect);
        });
    }

    // ---- TYPED RESPONSE ----
    renderTypedResponse(challenge) {
        let html = this.overlay.buildRepTabs(challenge.representations, 'text');

        html += '<div class="typed-response-area">';
        html += `<textarea id="typed-input" placeholder="Write your response here... (minimum ${challenge.minWords} words)" spellcheck="true"></textarea>`;
        html += '<div class="word-count" id="word-count">0 words</div>';
        html += '</div>';

        html += '<div id="hint-area"></div>';
        html += '<div id="reflection-area"></div>';
        html += '<div id="feedback-area"></div>';

        html += '<div class="btn-row">';
        html += '<button class="btn btn-hint" id="hint-btn">Need a Hint</button>';
        html += '<button class="btn btn-primary" id="review-btn" disabled>Review My Response</button>';
        html += '<button class="btn btn-secondary" id="skip-btn">Skip for Now</button>';
        html += '</div>';

        this.overlay.show(html);
        this.overlay.setupRepTabs();

        const textarea = document.getElementById('typed-input');
        const wordCount = document.getElementById('word-count');
        const reviewBtn = document.getElementById('review-btn');

        // Word count tracker
        textarea.addEventListener('input', () => {
            const words = textarea.value.trim().split(/\s+/).filter(w => w.length > 0).length;
            wordCount.textContent = `${words} word${words !== 1 ? 's' : ''}`;
            reviewBtn.disabled = words < challenge.minWords;

            if (words >= challenge.minWords) {
                wordCount.style.color = '#2ecc71';
            } else {
                wordCount.style.color = '#666';
            }
        });

        // Hint button
        document.getElementById('hint-btn').addEventListener('click', () => {
            const hint = this.hintSystem.getNextHint(challenge.hints);
            if (hint) {
                const hintArea = this.overlay.content.querySelector('#hint-area');
                hintArea.innerHTML += `<div class="hint-box"><div class="hint-level">${hint.label} (${hint.level}/${hint.total})</div><p>${hint.text}</p></div>`;
                if (!this.hintSystem.hasMoreHints(challenge.hints)) {
                    document.getElementById('hint-btn').disabled = true;
                    document.getElementById('hint-btn').textContent = 'No More Hints';
                }
            }
        });

        // Review button -> Self-Reflection phase
        reviewBtn.addEventListener('click', () => {
            this.showReflectionPhase(challenge, textarea.value);
        });

        // Skip button
        document.getElementById('skip-btn').addEventListener('click', () => {
            this.overlay.hide();
            this.onComplete(challenge.id, false);
        });
    }

    showReflectionPhase(challenge, response) {
        const reflectionArea = this.overlay.content.querySelector('#reflection-area');
        const textarea = document.getElementById('typed-input');

        let html = '<div class="reflection-panel">';
        html += '<h3>Before You Submit — Reflect</h3>';
        html += '<p>Review your response using this checklist:</p>';
        html += '<ul class="reflection-checklist">';
        challenge.reflectionPrompts.forEach(prompt => {
            html += `<li>${prompt}</li>`;
        });
        html += '</ul>';
        html += '<p style="margin-top: 12px; font-size: 0.85em; color: #888;">You can still edit your response above before submitting.</p>';
        html += '</div>';

        reflectionArea.innerHTML = html;

        // Make checklist items clickable
        reflectionArea.querySelectorAll('.reflection-checklist li').forEach(li => {
            li.style.cursor = 'pointer';
            li.addEventListener('click', () => {
                if (li.textContent.startsWith('\u2610')) {
                    li.textContent = li.textContent.replace('\u2610', '\u2611');
                    li.style.color = '#2ecc71';
                } else {
                    li.textContent = li.textContent.replace('\u2611', '\u2610');
                    li.style.color = '#c4a94d';
                }
            });
        });

        // Replace buttons with submit
        const btnRow = this.overlay.content.querySelector('.btn-row');
        btnRow.innerHTML = `
            <button class="btn btn-secondary" id="back-edit-btn">Keep Editing</button>
            <button class="btn btn-primary" id="submit-btn">Submit Response</button>
        `;

        document.getElementById('back-edit-btn').addEventListener('click', () => {
            reflectionArea.innerHTML = '';
            btnRow.innerHTML = `
                <button class="btn btn-hint" id="hint-btn">Need a Hint</button>
                <button class="btn btn-primary" id="review-btn">Review My Response</button>
                <button class="btn btn-secondary" id="skip-btn">Skip for Now</button>
            `;
            // Re-bind buttons
            document.getElementById('review-btn').addEventListener('click', () => {
                this.showReflectionPhase(challenge, textarea.value);
            });
            document.getElementById('skip-btn').addEventListener('click', () => {
                this.overlay.hide();
                this.onComplete(challenge.id, false);
            });
            document.getElementById('hint-btn').addEventListener('click', () => {
                const hint = this.hintSystem.getNextHint(challenge.hints);
                if (hint) {
                    const hintArea = this.overlay.content.querySelector('#hint-area');
                    hintArea.innerHTML += `<div class="hint-box"><div class="hint-level">${hint.label} (${hint.level}/${hint.total})</div><p>${hint.text}</p></div>`;
                }
            });
            textarea.focus();
        });

        document.getElementById('submit-btn').addEventListener('click', () => {
            const finalResponse = textarea.value.trim();
            // Get the prompt text for teacher review
            const promptText = challenge.representations.text.prompt;

            // Save typed response
            this.progress.recordTypedResponse(challenge.id, finalResponse, promptText);
            this.progress.recordChallengeResult(challenge.id, true, 0, this.hintSystem.hintsUsed);

            // Show confirmation
            const feedbackArea = this.overlay.content.querySelector('#feedback-area');
            feedbackArea.innerHTML = `<div class="feedback success"><p>Your response has been saved! Your teacher will review it and provide feedback.</p></div>`;

            reflectionArea.innerHTML = '';
            btnRow.innerHTML = '<button class="btn btn-primary" id="continue-btn">Continue</button>';
            textarea.disabled = true;

            document.getElementById('continue-btn').addEventListener('click', () => {
                this.overlay.hide();
                this.onComplete(challenge.id, true);
            });
        });
    }
}


// Export for use in game.js
if (typeof window !== 'undefined') {
    window.StudentProgress = StudentProgress;
    window.AdaptiveDifficulty = AdaptiveDifficulty;
    window.HintSystem = HintSystem;
    window.OverlayManager = OverlayManager;
    window.ChallengeRenderer = ChallengeRenderer;
}
