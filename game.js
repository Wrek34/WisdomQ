class WisdomQuest {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        
        this.player = {
            x: 500, y: 375, size: 16, speed: 2,
            wisdom: 50, compassion: 50, courage: 50,
            bodyColor: '#ffd700',
            headColor: '#ffeb99',
            accessory: 'none',
            name: 'Seeker'
        };
        
        this.dog = {
            x: 520, y: 395, size: 12, speed: 2.2,
            color: '#8B4513',
            active: true,
            name: 'Socrates',
            offsetX: 0,
            offsetY: 0,
            lastUpdateTime: 0
        };
        
        this.selectedChoice = 0;
        this.inDialogue = false;
        this.secretQuests = {
            fountain_secret: { discovered: false, completed: false, hint: "The fountain holds ancient wisdom..." },
            hidden_book: { discovered: false, completed: false, hint: "A mysterious book lies hidden in the library..." },
            tavern_riddle: { discovered: false, completed: false, hint: "The bartender knows more than he lets on..." },
            ancient_statue: { discovered: false, completed: false, hint: "The forest statue has a secret offering plate..." },
            courthouse_scales: { discovered: false, completed: false, hint: "The scales of justice hide more than they show..." }
        };
        this.interactionCount = 0;
        this.journalNavIndex = 0;
        this.journalOpen = false;
        this.mapDetails = {
            town_square: { discovered: true, mapX: 250, mapY: 200 },
            library: { discovered: false, mapX: 100, mapY: 100 },
            market: { discovered: false, mapX: 400, mapY: 100 },
            courthouse: { discovered: false, mapX: 100, mapY: 300 },
            tavern: { discovered: false, mapX: 400, mapY: 300 },
            forest: { discovered: false, mapX: 300, mapY: 400 }
        };
        
        this.currentArea = 'town_square';
        this.areas = {
            town_square: {
                name: 'Town Square',
                npcs: [
                    { x: 500, y: 250, type: 'philosopher', name: 'The Philosopher', interacted: false },
                    { x: 250, y: 500, type: 'child', name: 'Lost Child', interacted: false }
                ],
                buildings: [
                    { x: 150, y: 150, w: 150, h: 100, type: 'library', name: 'Ancient Library' },
                    { x: 700, y: 150, w: 150, h: 100, type: 'market', name: 'Grand Market' },
                    { x: 150, y: 550, w: 150, h: 100, type: 'courthouse', name: 'Hall of Justice' },
                    { x: 700, y: 550, w: 150, h: 100, type: 'tavern', name: 'Thinking Tavern' }
                ],
                exits: [
                    { x: 900, y: 350, w: 80, h: 80, to: 'forest', name: 'Forest Path' }
                ],
                secrets: [
                    { x: 500, y: 340, w: 40, h: 40, type: 'fountain', name: 'Ancient Fountain' }
                ]
            },
            library: {
                name: 'Ancient Library',
                npcs: [
                    { x: 250, y: 375, type: 'sage', name: 'The Sage', interacted: false },
                    { x: 750, y: 250, type: 'scientist', name: 'The Scientist', interacted: false }
                ],
                buildings: [],
                exits: [{ x: 450, y: 650, w: 100, h: 50, to: 'town_square', name: 'Town Square' }],
                secrets: [
                    { x: 100, y: 100, w: 30, h: 30, type: 'hidden_book', name: 'Mysterious Tome' }
                ]
            },
            market: {
                name: 'Bustling Market',
                npcs: [
                    { x: 300, y: 250, type: 'merchant', name: 'The Merchant', interacted: false }
                ],
                buildings: [],
                exits: [{ x: 350, y: 550, w: 100, h: 50, to: 'town_square', name: 'Town Square' }]
            },
            courthouse: {
                name: 'Hall of Justice',
                npcs: [
                    { x: 400, y: 300, type: 'judge', name: 'The Judge', interacted: false }
                ],
                buildings: [],
                exits: [{ x: 450, y: 650, w: 100, h: 50, to: 'town_square', name: 'Town Square' }],
                secrets: [
                    { x: 500, y: 200, w: 40, h: 40, type: 'courthouse_scales', name: 'Scales of Justice' }
                ]
            },
            tavern: {
                name: 'The Thinking Tavern',
                npcs: [
                    { x: 250, y: 375, type: 'warrior', name: 'The Warrior', interacted: false },
                    { x: 750, y: 400, type: 'artist', name: 'The Artist', interacted: false },
                    { x: 500, y: 250, type: 'teacher', name: 'The Teacher', interacted: false }
                ],
                buildings: [],
                exits: [{ x: 450, y: 650, w: 100, h: 50, to: 'town_square', name: 'Town Square' }],
                secrets: [
                    { x: 800, y: 200, w: 40, h: 40, type: 'tavern_riddle', name: 'Mysterious Bartender' }
                ]
            },
            forest: {
                name: 'Hermit\'s Forest',
                npcs: [
                    { x: 150, y: 400, type: 'hermit', name: 'The Hermit', interacted: false }
                ],
                buildings: [],
                exits: [{ x: 50, y: 300, w: 50, h: 60, to: 'town_square', name: 'Town Square' }],
                secrets: [
                    { x: 800, y: 400, w: 40, h: 60, type: 'ancient_statue', name: 'Ancient Statue' }
                ]
            }
        };
        
        this.keys = {};
        this.gameState = 'start';
        this.currentDialogue = null;
        this.gameTime = 0;
        this.reputation = { good: 0, neutral: 0, evil: 0 };
        this.achievements = [];
        this.visitedAreas = new Set();
        
        this.scenarios = {
            sage: {
                text: "Welcome to my sanctuary of knowledge. A desperate student begs me to give them answers to tomorrow's crucial exam. Knowledge earned vs. knowledge given - what say you?",
                choices: [
                    { text: "Give them the answers", effect: { wisdom: -12, compassion: +3, courage: -5 }, consequence: "The sage frowns. 'You rob them of true learning and growth.'" },
                    { text: "Teach them to find answers", effect: { wisdom: +15, compassion: +8, courage: +5 }, consequence: "The sage beams. 'Give a person a fish, feed them for a day...'" },
                    { text: "Refuse to help at all", effect: { wisdom: +2, compassion: -8, courage: -3 }, consequence: "The sage sighs. 'Wisdom without compassion is cold indeed.'" }
                ]
            },
            merchant: {
                text: "Business is slow, friend. I could triple my profits by selling fake medicine to desperate people. They'll never know the difference until it's too late.",
                choices: [
                    { text: "Profit is profit - do it", effect: { wisdom: -15, compassion: -20, courage: -10 }, consequence: "The merchant grins wickedly. 'You understand business!' People will suffer." },
                    { text: "Find honest ways to profit", effect: { wisdom: +8, compassion: +10, courage: +7 }, consequence: "The merchant nods reluctantly. 'Harder path, but I'll sleep better.'" },
                    { text: "Report him to authorities", effect: { wisdom: +5, compassion: +15, courage: +12 }, consequence: "The merchant panics. 'Wait! I... I was only testing you!'" }
                ]
            },
            child: {
                text: "Please help! My little sister fell down the old well! The adults say it's too dangerous, but she's still alive down there. What do we do?",
                choices: [
                    { text: "It's too risky - wait for help", effect: { wisdom: +3, compassion: -10, courage: -15 }, consequence: "The child cries. Time is running out..." },
                    { text: "Organize a careful rescue", effect: { wisdom: +10, compassion: +15, courage: +12 }, consequence: "The child's eyes light up with hope. 'Thank you for not giving up!'" },
                    { text: "Go down alone immediately", effect: { wisdom: -5, compassion: +8, courage: +15 }, consequence: "Brave but reckless - sometimes courage needs wisdom too." }
                ]
            },
            warrior: {
                text: "I've been hired to evict a family who can't pay rent. They have nowhere to go and winter approaches. Orders are orders, but...",
                choices: [
                    { text: "Follow orders without question", effect: { wisdom: -8, compassion: -15, courage: -5 }, consequence: "The warrior hardens. 'Duty above all.' A family suffers." },
                    { text: "Refuse and find another way", effect: { wisdom: +12, compassion: +15, courage: +10 }, consequence: "The warrior smiles. 'True strength protects the innocent.'" },
                    { text: "Delay and warn the family", effect: { wisdom: +8, compassion: +10, courage: +8 }, consequence: "The warrior nods. 'Sometimes the best battles are avoided.'" }
                ]
            },
            philosopher: {
                text: "Ah, a fellow seeker! I ponder: 'If a tree falls in a forest and no one hears it, does it make a sound?' But more importantly - if we live unwitnessed, do our good deeds matter?",
                choices: [
                    { text: "Only witnessed acts have value", effect: { wisdom: -8, compassion: -10, courage: -3 }, consequence: "The philosopher shakes his head sadly. 'Then you seek glory, not goodness.'" },
                    { text: "Good deeds matter regardless", effect: { wisdom: +8, compassion: +10, courage: +5 }, consequence: "The philosopher smiles. 'True virtue needs no audience.'" },
                    { text: "The question itself is flawed", effect: { wisdom: +12, compassion: +3, courage: +2 }, consequence: "The philosopher nods approvingly. 'You see beyond the surface - wisdom indeed.'" }
                ]
            },
            hermit: {
                text: "I've discovered a cure for a plague ravaging nearby villages, but sharing it means revealing my location and losing my peaceful solitude forever. What would you do?",
                choices: [
                    { text: "Keep the secret and your peace", effect: { wisdom: -20, compassion: -25, courage: -15 }, consequence: "The hermit nods sadly. 'Then we are both selfish.' Thousands will die." },
                    { text: "Share the cure despite the cost", effect: { wisdom: +15, compassion: +20, courage: +15 }, consequence: "The hermit smiles through tears. 'True wisdom serves others.'" },
                    { text: "Find a way to share anonymously", effect: { wisdom: +18, compassion: +15, courage: +10 }, consequence: "The hermit's eyes brighten. 'Clever and compassionate - well done.'" }
                ]
            },
            judge: {
                text: "A wealthy noble's son killed a peasant while drunk. His father offers me a fortune to reduce the sentence. The peasant's family begs for justice. What is right?",
                choices: [
                    { text: "Take the bribe - money talks", effect: { wisdom: -20, compassion: -20, courage: -15 }, consequence: "The judge looks disgusted. 'Then justice is truly dead.' Corruption spreads." },
                    { text: "Apply the law equally", effect: { wisdom: +15, compassion: +15, courage: +18 }, consequence: "The judge stands tall. 'Justice is blind to wealth and status.'" },
                    { text: "Seek a compromise solution", effect: { wisdom: +5, compassion: +8, courage: +3 }, consequence: "The judge frowns. 'Some compromises compromise justice itself.'" }
                ]
            },
            artist: {
                text: "The king commissions me to create propaganda glorifying his unjust war. Refuse and face exile, or create art that will inspire young men to die for lies?",
                choices: [
                    { text: "Create the propaganda", effect: { wisdom: -15, compassion: -18, courage: -12 }, consequence: "The artist weeps. 'Then we are both cowards.' Blood stains your hands." },
                    { text: "Refuse and face the consequences", effect: { wisdom: +12, compassion: +15, courage: +20 }, consequence: "The artist nods proudly. 'True art serves truth, not power.'" },
                    { text: "Create subtle anti-war messages", effect: { wisdom: +18, compassion: +12, courage: +15 }, consequence: "The artist grins. 'Subversion through beauty - brilliant!'" }
                ]
            },
            scientist: {
                text: "I've discovered my research is being used to create weapons of mass destruction. I could destroy my work, but years of medical breakthroughs would be lost too.",
                choices: [
                    { text: "Let them weaponize it", effect: { wisdom: -25, compassion: -20, courage: -10 }, consequence: "The scientist looks horrified. 'Then we've doomed humanity.' Cities will burn." },
                    { text: "Destroy everything to prevent misuse", effect: { wisdom: +10, compassion: +20, courage: +18 }, consequence: "The scientist nods grimly. 'Some knowledge is too dangerous.'" },
                    { text: "Leak it to prevent monopolization", effect: { wisdom: +15, compassion: +15, courage: +15 }, consequence: "The scientist considers. 'Dangerous, but it levels the field.'" }
                ]
            },
            teacher: {
                text: "I've discovered the principal is embezzling funds meant for poor students' meals. Speaking up could cost my job and my family's livelihood. What's right?",
                choices: [
                    { text: "Stay silent to protect yourself", effect: { wisdom: -15, compassion: -20, courage: -18 }, consequence: "The teacher looks ashamed. 'Then we both fail our students.' Children go hungry." },
                    { text: "Report it despite the risks", effect: { wisdom: +12, compassion: +18, courage: +20 }, consequence: "The teacher stands straighter. 'Some things matter more than security.'" },
                    { text: "Gather evidence first", effect: { wisdom: +18, compassion: +15, courage: +12 }, consequence: "The teacher nods. 'Wisdom and courage - the perfect combination.'" }
                ]
            }
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.gameLoop();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                if (this.inDialogue) {
                    this.selectChoice();
                } else {
                    this.interact();
                }
            }
            
            if (e.key === 'j' || e.key === 'J') {
                e.preventDefault();
                this.toggleJournal();
            }
            
            if (this.journalOpen) {
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.navigateJournal(-1);
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.navigateJournal(1);
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.changeJournalTab(-1);
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.changeJournalTab(1);
                }
            }
            
            if (this.inDialogue) {
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.navigateChoices(-1);
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.navigateChoices(1);
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        document.getElementById('start-btn').addEventListener('click', () => {
            this.showCharacterCreation();
        });
        
        document.getElementById('confirm-character').addEventListener('click', () => {
            this.startGame();
        });
        
        // Journal setup
        document.querySelector('.close-journal').addEventListener('click', () => {
            this.toggleJournal();
        });
        
        document.querySelectorAll('.journal-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.journal-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                document.querySelectorAll('.journal-page').forEach(p => p.classList.remove('active'));
                document.getElementById(`${tab.dataset.tab}-page`).classList.add('active');
            });
        });
        
        this.setupCharacterCreation();
    }
    
    showCharacterCreation() {
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('character-creation').classList.remove('hidden');
        this.updateCharacterPreview();
    }
    
    startGame() {
        document.getElementById('character-creation').classList.add('hidden');
        this.gameState = 'playing';
    }
    
    setupCharacterCreation() {
        // Color selection
        document.querySelectorAll('.color-option').forEach(option => {
            const color = option.dataset.color;
            option.style.backgroundColor = color;
            
            option.addEventListener('click', () => {
                const type = option.parentElement.dataset.type;
                option.parentElement.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                
                if (type === 'body') {
                    this.player.bodyColor = color;
                } else if (type === 'head') {
                    this.player.headColor = color;
                }
                this.updateCharacterPreview();
            });
        });
        
        // Focus selection
        document.querySelectorAll('.focus-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.focus-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                
                const focus = option.dataset.focus;
                const stats = {
                    balanced: { wisdom: 50, compassion: 50, courage: 50 },
                    scholar: { wisdom: 65, compassion: 40, courage: 35 },
                    empath: { wisdom: 35, compassion: 65, courage: 40 },
                    hero: { wisdom: 40, compassion: 35, courage: 65 }
                };
                
                Object.assign(this.player, stats[focus]);
            });
        });
        
        // Accessory selection
        document.querySelectorAll('.accessory-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.accessory-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                this.player.accessory = option.dataset.accessory;
                this.updateCharacterPreview();
            });
        });
        
        // Name input
        document.getElementById('character-name').addEventListener('input', (e) => {
            this.player.name = e.target.value || 'Seeker';
        });
    }
    
    updateCharacterPreview() {
        const canvas = document.getElementById('previewCanvas');
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        
        // Clear
        ctx.fillStyle = '#2c5530';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw character preview (scaled up)
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const scale = 4;
        
        // Body
        ctx.fillStyle = this.player.bodyColor;
        ctx.fillRect(centerX - 8*scale, centerY - 4*scale, 16*scale, 12*scale);
        
        // Head
        ctx.fillStyle = this.player.headColor;
        ctx.fillRect(centerX - 6*scale, centerY - 12*scale, 12*scale, 8*scale);
        
        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(centerX - 4*scale, centerY - 10*scale, 2*scale, 2*scale);
        ctx.fillRect(centerX + 2*scale, centerY - 10*scale, 2*scale, 2*scale);
        
        // Smile
        ctx.fillRect(centerX - 3*scale, centerY - 7*scale, 6*scale, 1*scale);
        
        // Arms
        ctx.fillStyle = this.player.headColor;
        ctx.fillRect(centerX - 10*scale, centerY - 2*scale, 4*scale, 6*scale);
        ctx.fillRect(centerX + 6*scale, centerY - 2*scale, 4*scale, 6*scale);
        
        // Legs
        const legColor = this.adjustColor(this.player.bodyColor, -20);
        ctx.fillStyle = legColor;
        ctx.fillRect(centerX - 6*scale, centerY + 8*scale, 4*scale, 6*scale);
        ctx.fillRect(centerX + 2*scale, centerY + 8*scale, 4*scale, 6*scale);
        
        // Draw accessory
        this.drawAccessory(ctx, centerX, centerY, scale);
    }
    
    adjustColor(hex, amount) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * amount);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    drawAccessory(ctx, x, y, scale) {
        ctx.fillStyle = '#8b4513';
        
        switch(this.player.accessory) {
            case 'hat':
                ctx.fillRect(x - 8*scale, y - 16*scale, 16*scale, 4*scale);
                ctx.fillRect(x - 6*scale, y - 20*scale, 12*scale, 4*scale);
                break;
            case 'glasses':
                ctx.fillStyle = '#000';
                ctx.fillRect(x - 6*scale, y - 11*scale, 4*scale, 1*scale);
                ctx.fillRect(x + 2*scale, y - 11*scale, 4*scale, 1*scale);
                ctx.fillRect(x - 1*scale, y - 11*scale, 2*scale, 1*scale);
                break;
            case 'beard':
                ctx.fillStyle = '#8b4513';
                ctx.fillRect(x - 5*scale, y - 6*scale, 10*scale, 6*scale);
                break;
            case 'crown':
                ctx.fillStyle = '#ffd700';
                ctx.fillRect(x - 8*scale, y - 16*scale, 16*scale, 3*scale);
                ctx.fillRect(x - 6*scale, y - 19*scale, 3*scale, 3*scale);
                ctx.fillRect(x - 1*scale, y - 20*scale, 2*scale, 4*scale);
                ctx.fillRect(x + 3*scale, y - 19*scale, 3*scale, 3*scale);
                break;
        }
    }
    
    drawPlayerAccessory() {
        this.ctx.fillStyle = '#8b4513';
        
        switch(this.player.accessory) {
            case 'hat':
                this.ctx.fillRect(this.player.x - 8, this.player.y - 16, 16, 4);
                this.ctx.fillRect(this.player.x - 6, this.player.y - 20, 12, 4);
                break;
            case 'glasses':
                this.ctx.fillStyle = '#000';
                this.ctx.fillRect(this.player.x - 6, this.player.y - 11, 4, 1);
                this.ctx.fillRect(this.player.x + 2, this.player.y - 11, 4, 1);
                this.ctx.fillRect(this.player.x - 1, this.player.y - 11, 2, 1);
                break;
            case 'beard':
                this.ctx.fillStyle = '#8b4513';
                this.ctx.fillRect(this.player.x - 5, this.player.y - 6, 10, 6);
                break;
            case 'crown':
                this.ctx.fillStyle = '#ffd700';
                this.ctx.fillRect(this.player.x - 8, this.player.y - 16, 16, 3);
                this.ctx.fillRect(this.player.x - 6, this.player.y - 19, 3, 3);
                this.ctx.fillRect(this.player.x - 1, this.player.y - 20, 2, 4);
                this.ctx.fillRect(this.player.x + 3, this.player.y - 19, 3, 3);
                break;
        }
    }
    
    drawDog() {
        // Body
        this.ctx.fillStyle = this.dog.color;
        this.ctx.fillRect(this.dog.x - 6 + this.dog.offsetX, this.dog.y - 3 + this.dog.offsetY, 12, 8);
        
        // Head
        this.ctx.fillRect(this.dog.x - 4 + this.dog.offsetX, this.dog.y - 8 + this.dog.offsetY, 8, 6);
        
        // Ears
        this.ctx.fillRect(this.dog.x - 6 + this.dog.offsetX, this.dog.y - 10 + this.dog.offsetY, 3, 4);
        this.ctx.fillRect(this.dog.x + 3 + this.dog.offsetX, this.dog.y - 10 + this.dog.offsetY, 3, 4);
        
        // Eyes
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(this.dog.x - 3 + this.dog.offsetX, this.dog.y - 6 + this.dog.offsetY, 2, 2);
        this.ctx.fillRect(this.dog.x + 1 + this.dog.offsetX, this.dog.y - 6 + this.dog.offsetY, 2, 2);
        
        // Nose
        this.ctx.fillRect(this.dog.x - 1 + this.dog.offsetX, this.dog.y - 4 + this.dog.offsetY, 2, 2);
        
        // Tail - animated wagging
        const tailWag = Math.sin(this.gameTime * 0.2) * 2;
        this.ctx.fillStyle = this.dog.color;
        this.ctx.fillRect(this.dog.x - 8 + tailWag + this.dog.offsetX, this.dog.y + this.dog.offsetY, 4, 3);
        
        // Legs
        this.ctx.fillRect(this.dog.x - 5 + this.dog.offsetX, this.dog.y + 5 + this.dog.offsetY, 2, 4);
        this.ctx.fillRect(this.dog.x + 3 + this.dog.offsetX, this.dog.y + 5 + this.dog.offsetY, 2, 4);
        
        // Dog name
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.dog.name, this.dog.x + this.dog.offsetX, this.dog.y - 15 + this.dog.offsetY);
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        // Player movement
        if (this.keys['w'] || this.keys['arrowup']) {
            this.player.y = Math.max(16, this.player.y - this.player.speed);
        }
        if (this.keys['s'] || this.keys['arrowdown']) {
            this.player.y = Math.min(this.canvas.height - 16, this.player.y + this.player.speed);
        }
        if (this.keys['a'] || this.keys['arrowleft']) {
            this.player.x = Math.max(16, this.player.x - this.player.speed);
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            this.player.x = Math.min(this.canvas.width - 16, this.player.x + this.player.speed);
        }
        
        // Update dog position with delay
        if (this.dog.active) {
            // Calculate target position (slightly behind player)
            const targetX = this.player.x - 30;
            const targetY = this.player.y + 20;
            
            // Smooth follow with slight delay
            const dx = targetX - this.dog.x;
            const dy = targetY - this.dog.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 100) {
                // Teleport if too far
                this.dog.x = this.player.x - 20;
                this.dog.y = this.player.y + 20;
            } else if (distance > 5) {
                // Move towards player
                this.dog.x += dx * 0.08;
                this.dog.y += dy * 0.08;
            }
            
            // Add very slight random movement (much less than before)
            if (this.gameTime % 60 === 0) {
                this.dog.offsetX = Math.random() * 4 - 2;
                this.dog.offsetY = Math.random() * 4 - 2;
            }
        }
        
        // Track game time
        this.gameTime++;
        
        // Check for achievements
        this.checkAchievements();
        
        this.updateUI();
    }
    
    checkAchievements() {
        const achievements = [
            { id: 'first_choice', name: 'First Steps', desc: 'Made your first moral choice', condition: () => this.reputation.good + this.reputation.neutral + this.reputation.evil > 0 },
            { id: 'wise_seeker', name: 'Wise Seeker', desc: 'Reached 80+ Wisdom', condition: () => this.player.wisdom >= 80 },
            { id: 'compassionate_soul', name: 'Compassionate Soul', desc: 'Reached 80+ Compassion', condition: () => this.player.compassion >= 80 },
            { id: 'brave_heart', name: 'Brave Heart', desc: 'Reached 80+ Courage', condition: () => this.player.courage >= 80 },
            { id: 'explorer', name: 'Town Explorer', desc: 'Visited all areas', condition: () => this.visitedAreas.size >= 6 },
            { id: 'saint', name: 'Saint', desc: 'Made only virtuous choices', condition: () => this.reputation.good >= 5 && this.reputation.evil === 0 },
            { id: 'secret_seeker', name: 'Secret Seeker', desc: 'Discover all hidden secrets', condition: () => 
                this.secretQuests.fountain_secret.completed && 
                this.secretQuests.hidden_book.completed && 
                this.secretQuests.tavern_riddle.completed 
            }
        ];
        
        achievements.forEach(achievement => {
            if (!this.achievements.includes(achievement.id) && achievement.condition()) {
                this.achievements.push(achievement.id);
                this.showAchievement(achievement);
            }
        });
    }
    
    showAchievement(achievement) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; 
            background: linear-gradient(45deg, #ffd700, #ffed4e); color: #1a1a2e; 
            padding: 15px 20px; border: 2px solid #ffd700; border-radius: 8px; 
            font-family: inherit; font-size: 10px; z-index: 1000; 
            box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
            animation: slideIn 0.5s ease-out;
        `;
        notification.innerHTML = `<strong>🏆 ${achievement.name}</strong><br><small>${achievement.desc}</small>`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.5s ease-in';
            setTimeout(() => document.body.removeChild(notification), 500);
        }, 3000);
    }
    
    render() {
        const area = this.areas[this.currentArea];
        
        // Clear canvas
        this.ctx.fillStyle = this.getAreaColor();
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw area-specific background
        this.drawAreaBackground();
        
        // Draw buildings
        area.buildings.forEach(building => {
            this.drawBuilding(building);
        });
        
        // Draw exits
        area.exits.forEach(exit => {
            this.drawExit(exit);
        });
        
        // Draw secrets
        if (area.secrets) {
            area.secrets.forEach(secret => {
                this.drawSecret(secret);
            });
        }
        
        // Draw NPCs
        area.npcs.forEach(npc => {
            this.drawNPC(npc);
        });
        
        // Draw dog companion
        if (this.dog.active) {
            this.drawDog();
        }
        
        // Draw player
        this.drawPlayer();
        
        // Draw interaction hints
        this.drawInteractionHints();
        
        // Draw area name
        this.drawAreaName(area.name);
    }
    
    getAreaColor() {
        const colors = {
            town_square: '#2c5530',
            library: '#4a4a4a',
            market: '#8b4513',
            courthouse: '#2c3e50',
            tavern: '#654321',
            forest: '#1a4a1a'
        };
        return colors[this.currentArea] || '#0f3460';
    }
    
    drawAreaBackground() {
        const patterns = {
            town_square: () => {
                // Cobblestone pattern
                this.ctx.fillStyle = '#3a6b3e';
                for (let x = 0; x < this.canvas.width; x += 30) {
                    for (let y = 0; y < this.canvas.height; y += 30) {
                        if ((x + y) % 60 === 0) {
                            this.ctx.fillRect(x, y, 15, 15);
                        }
                    }
                }
                // Fountain in center
                this.ctx.fillStyle = '#4a90e2';
                this.ctx.fillRect(500, 340, 40, 40);
                this.ctx.fillStyle = '#87ceeb';
                this.ctx.fillRect(505, 345, 30, 30);
                
                // Water ripples
                const rippleTime = this.gameTime % 60;
                if (rippleTime < 30) {
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                    this.ctx.beginPath();
                    this.ctx.arc(500, 340, rippleTime/10, 0, Math.PI * 2);
                    this.ctx.stroke();
                }
                
                // Benches
                this.ctx.fillStyle = '#8b4513';
                this.ctx.fillRect(400, 380, 40, 10);
                this.ctx.fillRect(560, 380, 40, 10);
                this.ctx.fillRect(400, 260, 40, 10);
                this.ctx.fillRect(560, 260, 40, 10);
                
                // Lamp posts
                this.ctx.fillStyle = '#333';
                this.ctx.fillRect(350, 200, 6, 40);
                this.ctx.fillRect(650, 200, 6, 40);
                this.ctx.fillRect(350, 500, 6, 40);
                this.ctx.fillRect(650, 500, 6, 40);
                
                this.ctx.fillStyle = '#ffd700';
                this.ctx.beginPath();
                this.ctx.arc(353, 200, 8, 0, Math.PI * 2);
                this.ctx.arc(653, 200, 8, 0, Math.PI * 2);
                this.ctx.arc(353, 500, 8, 0, Math.PI * 2);
                this.ctx.arc(653, 500, 8, 0, Math.PI * 2);
                this.ctx.fill();
            },
            library: () => {
                // Bookshelf pattern
                this.ctx.fillStyle = '#8b4513';
                for (let x = 50; x < this.canvas.width; x += 200) {
                    this.ctx.fillRect(x, 50, 150, 250);
                    
                    // Books - multiple rows
                    const colors = ['#ff6b6b', '#4ecdc4', '#ffd700', '#9b59b6', '#2ecc71', '#e67e22', '#6593F5'];
                    
                    for (let row = 0; row < 7; row++) {
                        for (let col = 0; col < 15; col++) {
                            const colorIndex = (row + col) % colors.length;
                            this.ctx.fillStyle = colors[colorIndex];
                            this.ctx.fillRect(x + 5 + col*10, 60 + row*30, 8, 25);
                        }
                    }
                    
                    this.ctx.fillStyle = '#8b4513';
                }
                
                // Reading tables
                this.ctx.fillStyle = '#654321';
                this.ctx.fillRect(250, 400, 100, 60);
                this.ctx.fillRect(650, 400, 100, 60);
                
                // Chairs
                this.ctx.fillStyle = '#8b4513';
                this.ctx.fillRect(270, 460, 20, 20);
                this.ctx.fillRect(310, 460, 20, 20);
                this.ctx.fillRect(670, 460, 20, 20);
                this.ctx.fillRect(710, 460, 20, 20);
                
                // Glowing candle
                const candleFlicker = Math.sin(this.gameTime * 0.2) * 0.2 + 0.8;
                this.ctx.fillStyle = `rgba(255, 215, 0, ${candleFlicker})`;
                this.ctx.beginPath();
                this.ctx.arc(500, 100, 15, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Secret book glow if not found
                if (!this.secretQuests.hidden_book.discovered) {
                    const bookGlow = Math.sin(this.gameTime * 0.1) * 0.3 + 0.7;
                    this.ctx.fillStyle = `rgba(255, 255, 255, ${bookGlow * 0.2})`;
                    this.ctx.beginPath();
                    this.ctx.arc(100, 100, 20, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            },
            market: () => {
                // Market stalls
                this.ctx.fillStyle = '#d35400';
                for (let i = 0; i < 4; i++) {
                    const x = 100 + i * 150;
                    this.ctx.fillRect(x, 200, 100, 60);
                    // Awning
                    this.ctx.fillStyle = '#e74c3c';
                    this.ctx.fillRect(x - 10, 180, 120, 20);
                    this.ctx.fillStyle = '#d35400';
                }
            },
            courthouse: () => {
                // Pillars
                this.ctx.fillStyle = '#bdc3c7';
                for (let i = 0; i < 5; i++) {
                    const x = 150 + i * 100;
                    this.ctx.fillRect(x, 100, 20, 300);
                }
                // Steps
                this.ctx.fillStyle = '#95a5a6';
                this.ctx.fillRect(100, 380, 600, 20);
                this.ctx.fillRect(120, 400, 560, 20);
                
                // Scales of Justice
                this.ctx.fillStyle = '#c0c0c0';
                // Base
                this.ctx.fillRect(495, 200, 10, 40);
                // Beam
                this.ctx.fillRect(470, 200, 60, 5);
                
                // Scales - animated tilting
                const tiltAngle = Math.sin(this.gameTime * 0.05) * 0.2;
                
                // Left scale
                this.ctx.fillStyle = '#e74c3c';
                this.ctx.beginPath();
                this.ctx.arc(470, 210 - tiltAngle * 10, 10, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Right scale
                this.ctx.fillStyle = '#3498db';
                this.ctx.beginPath();
                this.ctx.arc(530, 210 + tiltAngle * 10, 10, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Glow effect if not discovered
                if (!this.secretQuests.courthouse_scales.discovered) {
                    const glowIntensity = Math.sin(this.gameTime * 0.1) * 0.3 + 0.7;
                    this.ctx.fillStyle = `rgba(255, 215, 0, ${glowIntensity * 0.3})`;
                    this.ctx.beginPath();
                    this.ctx.arc(500, 200, 30, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                
                // Courthouse interior details
                // Judge's bench
                this.ctx.fillStyle = '#8b4513';
                this.ctx.fillRect(400, 150, 200, 30);
                this.ctx.fillRect(400, 150, 30, 50);
                this.ctx.fillRect(570, 150, 30, 50);
                
                // Windows with light beams
                for (let i = 0; i < 3; i++) {
                    const x = 200 + i * 200;
                    // Window frame
                    this.ctx.fillStyle = '#34495e';
                    this.ctx.fillRect(x, 50, 40, 60);
                    
                    // Light beam
                    const beamOpacity = Math.sin(this.gameTime * 0.02 + i) * 0.1 + 0.2;
                    this.ctx.fillStyle = `rgba(255, 255, 200, ${beamOpacity})`;
                    this.ctx.beginPath();
                    this.ctx.moveTo(x + 20, 110);
                    this.ctx.lineTo(x + 5, 300);
                    this.ctx.lineTo(x + 35, 300);
                    this.ctx.closePath();
                    this.ctx.fill();
                }
            },
            tavern: () => {
                // Floor pattern
                this.ctx.fillStyle = '#3d2314';
                for (let x = 0; x < this.canvas.width; x += 40) {
                    for (let y = 0; y < this.canvas.height; y += 40) {
                        if ((x + y) % 80 === 0) {
                            this.ctx.fillRect(x, y, 20, 20);
                        }
                    }
                }
                
                // Bar counter
                this.ctx.fillStyle = '#5e2c04';
                this.ctx.fillRect(700, 150, 200, 40);
                this.ctx.fillRect(700, 190, 30, 200);
                
                // Bottles on shelf
                this.ctx.fillStyle = '#2c3e50';
                for (let i = 0; i < 8; i++) {
                    this.ctx.fillRect(720 + i*20, 120, 10, 25);
                }
                
                // Tables and chairs
                this.ctx.fillStyle = '#8b4513';
                for (let i = 0; i < 6; i++) {
                    const x = 150 + (i % 3) * 200;
                    const y = 250 + Math.floor(i / 3) * 200;
                    this.ctx.fillRect(x, y, 80, 60);
                    
                    // Chairs
                    this.ctx.fillStyle = '#654321';
                    this.ctx.fillRect(x - 20, y + 15, 20, 30);
                    this.ctx.fillRect(x + 80, y + 15, 20, 30);
                    this.ctx.fillRect(x + 30, y - 20, 20, 20);
                    this.ctx.fillRect(x + 30, y + 60, 20, 20);
                    
                    // Mugs on tables
                    this.ctx.fillStyle = '#d35400';
                    this.ctx.fillRect(x + 15, y + 15, 15, 15);
                    this.ctx.fillStyle = '#f39c12';
                    this.ctx.fillRect(x + 50, y + 30, 15, 15);
                    
                    this.ctx.fillStyle = '#8b4513';
                }
                
                // Fireplace
                this.ctx.fillStyle = '#7f8c8d';
                this.ctx.fillRect(50, 300, 80, 100);
                
                // Fire animation
                const fireHeight = Math.sin(this.gameTime * 0.2) * 10 + 30;
                this.ctx.fillStyle = '#e74c3c';
                this.ctx.fillRect(60, 350, 60, 50);
                this.ctx.fillStyle = '#f39c12';
                this.ctx.fillRect(70, 330, 40, fireHeight);
                
                // Mysterious bartender glow
                if (!this.secretQuests.tavern_riddle.discovered) {
                    const bartenderGlow = Math.sin(this.gameTime * 0.1) * 0.3 + 0.7;
                    this.ctx.fillStyle = `rgba(255, 215, 0, ${bartenderGlow * 0.3})`;
                    this.ctx.beginPath();
                    this.ctx.arc(800, 200, 25, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            },
            forest: () => {
                // Tree pattern
                this.ctx.fillStyle = '#0d3d0d';
                for (let i = 0; i < 30; i++) {
                    const x = (i * 73) % this.canvas.width;
                    const y = (i * 97) % this.canvas.height;
                    this.ctx.fillRect(x, y, 8, 20);
                    // Tree tops
                    this.ctx.fillStyle = '#228b22';
                    this.ctx.fillRect(x - 4, y - 8, 16, 12);
                    this.ctx.fillStyle = '#0d3d0d';
                }
                // Path
                this.ctx.fillStyle = '#8b7355';
                this.ctx.fillRect(350, 0, 100, this.canvas.height);
                
                // Ancient statue
                this.ctx.fillStyle = '#7f8c8d';
                this.ctx.fillRect(800, 400, 40, 60);
                // Statue head
                this.ctx.fillRect(805, 380, 30, 20);
                // Statue eyes - glow if not discovered
                if (!this.secretQuests.ancient_statue.discovered) {
                    const glowIntensity = Math.sin(this.gameTime * 0.1) * 0.3 + 0.7;
                    this.ctx.fillStyle = `rgba(255, 215, 0, ${glowIntensity})`;
                } else {
                    this.ctx.fillStyle = '#333';
                }
                this.ctx.fillRect(810, 385, 5, 5);
                this.ctx.fillRect(825, 385, 5, 5);
                
                // Offering plate
                this.ctx.fillStyle = '#c0c0c0';
                this.ctx.fillRect(810, 460, 20, 5);
                
                // Stream with animated water
                this.ctx.fillStyle = '#4a90e2';
                this.ctx.fillRect(600, 200, 300, 30);
                
                // Water ripples
                const rippleTime = this.gameTime % 120;
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                for (let i = 0; i < 5; i++) {
                    const x = 650 + i * 50;
                    const y = 215;
                    const size = Math.sin((rippleTime + i * 20) * 0.05) * 5 + 5;
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, size, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                
                // Mushrooms
                for (let i = 0; i < 8; i++) {
                    const x = (i * 123) % (this.canvas.width - 100) + 50;
                    const y = (i * 157) % (this.canvas.height - 100) + 50;
                    
                    // Stem
                    this.ctx.fillStyle = '#f5f5f5';
                    this.ctx.fillRect(x, y, 6, 8);
                    
                    // Cap
                    this.ctx.fillStyle = i % 3 === 0 ? '#e74c3c' : '#3498db';
                    this.ctx.fillRect(x - 3, y - 4, 12, 6);
                }
            }
        };
        
        if (patterns[this.currentArea]) {
            patterns[this.currentArea]();
        }
    }
    
    drawBuilding(building) {
        const colors = {
            library: '#8b4513',
            market: '#ff6b35',
            courthouse: '#34495e',
            tavern: '#d35400'
        };
        
        this.ctx.fillStyle = colors[building.type] || '#666';
        this.ctx.fillRect(building.x, building.y, building.w, building.h);
        
        // Door
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(building.x + building.w/2 - 15, building.y + building.h - 30, 30, 30);
        
        // Name
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(building.name, building.x + building.w/2, building.y - 5);
    }
    
    drawExit(exit) {
        this.ctx.fillStyle = '#ffd700';
        this.ctx.fillRect(exit.x, exit.y, exit.w, exit.h);
        
        this.ctx.fillStyle = '#000';
        this.ctx.font = '8px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('→ ' + exit.name, exit.x + exit.w/2, exit.y + exit.h/2);
    }
    
    drawAreaName(name) {
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.ctx.fillRect(10, 10, 250, 40);
        
        this.ctx.fillStyle = '#ffd700';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(name, 20, 30);
        
        // Show player name
        this.ctx.fillStyle = '#ccc';
        this.ctx.font = '10px monospace';
        this.ctx.fillText(`${this.player.name} the Seeker`, 20, 45);
    }
    
    drawSecret(secret) {
        const quest = this.secretQuests[secret.type];
        if (quest && quest.completed) return;
        
        // Glowing effect
        const glowIntensity = Math.sin(this.gameTime * 0.1) * 0.3 + 0.7;
        this.ctx.fillStyle = `rgba(155, 89, 182, ${glowIntensity})`;
        this.ctx.fillRect(secret.x - 2, secret.y - 2, secret.w + 4, secret.h + 4);
        
        this.ctx.fillStyle = '#9b59b6';
        this.ctx.fillRect(secret.x, secret.y, secret.w, secret.h);
        
        // Secret symbol
        this.ctx.fillStyle = '#ffd700';
        this.ctx.font = '16px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('?', secret.x + secret.w/2, secret.y + secret.h/2 + 6);
        
        // Hint on approach
        const distance = Math.sqrt(
            Math.pow(this.player.x - (secret.x + secret.w/2), 2) + 
            Math.pow(this.player.y - (secret.y + secret.h/2), 2)
        );
        
        if (distance < 60) {
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '8px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Press SPACE', secret.x + secret.w/2, secret.y - 10);
        }
    }
    
    drawPlayer() {
        // Body
        this.ctx.fillStyle = this.player.bodyColor;
        this.ctx.fillRect(this.player.x - 8, this.player.y - 4, 16, 12);
        
        // Head
        this.ctx.fillStyle = this.player.headColor;
        this.ctx.fillRect(this.player.x - 6, this.player.y - 12, 12, 8);
        
        // Eyes
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(this.player.x - 4, this.player.y - 10, 2, 2);
        this.ctx.fillRect(this.player.x + 2, this.player.y - 10, 2, 2);
        
        // Smile
        this.ctx.fillRect(this.player.x - 3, this.player.y - 7, 6, 1);
        
        // Arms
        this.ctx.fillStyle = this.player.headColor;
        this.ctx.fillRect(this.player.x - 10, this.player.y - 2, 4, 6);
        this.ctx.fillRect(this.player.x + 6, this.player.y - 2, 4, 6);
        
        // Legs
        const legColor = this.adjustColor(this.player.bodyColor, -20);
        this.ctx.fillStyle = legColor;
        this.ctx.fillRect(this.player.x - 6, this.player.y + 8, 4, 6);
        this.ctx.fillRect(this.player.x + 2, this.player.y + 8, 4, 6);
        
        // Draw accessory
        this.drawPlayerAccessory();
    }
    
    drawNPC(npc) {
        const colors = {
            sage: { body: '#9b59b6', head: '#d1a3e0', accent: '#fff' },
            merchant: { body: '#e67e22', head: '#f39c12', accent: '#2c3e50' },
            child: { body: '#e74c3c', head: '#ffb3ba', accent: '#fff' },
            warrior: { body: '#2c3e50', head: '#bdc3c7', accent: '#e74c3c' },
            philosopher: { body: '#34495e', head: '#ecf0f1', accent: '#f39c12' },
            hermit: { body: '#8b4513', head: '#deb887', accent: '#228b22' },
            judge: { body: '#000080', head: '#f5deb3', accent: '#ffd700' },
            artist: { body: '#ff69b4', head: '#ffb6c1', accent: '#9370db' },
            scientist: { body: '#ffffff', head: '#f0e68c', accent: '#000' },
            teacher: { body: '#4682b4', head: '#f5deb3', accent: '#8b4513' }
        };
        
        const color = colors[npc.type];
        
        // Body
        this.ctx.fillStyle = color.body;
        this.ctx.fillRect(npc.x - 8, npc.y - 4, 16, 12);
        
        // Head
        this.ctx.fillStyle = color.head;
        this.ctx.fillRect(npc.x - 6, npc.y - 12, 12, 8);
        
        // Character-specific details
        this.drawNPCDetails(npc, color);
        
        // Eyes
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(npc.x - 4, npc.y - 10, 2, 2);
        this.ctx.fillRect(npc.x + 2, npc.y - 10, 2, 2);
        
        // Name label
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '10px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(npc.name, npc.x, npc.y - 18);
    }
    
    drawNPCDetails(npc, color) {
        this.ctx.fillStyle = color.accent;
        
        switch(npc.type) {
            case 'sage':
                // Beard
                this.ctx.fillRect(npc.x - 4, npc.y - 6, 8, 4);
                // Staff
                this.ctx.fillRect(npc.x + 10, npc.y - 12, 2, 20);
                break;
            case 'merchant':
                // Hat
                this.ctx.fillRect(npc.x - 7, npc.y - 14, 14, 3);
                // Bag
                this.ctx.fillRect(npc.x - 12, npc.y, 4, 6);
                break;
            case 'child':
                // Smaller size adjustment
                this.ctx.fillStyle = color.body;
                this.ctx.fillRect(npc.x - 6, npc.y - 2, 12, 8);
                break;
            case 'warrior':
                // Helmet
                this.ctx.fillRect(npc.x - 7, npc.y - 14, 14, 4);
                // Sword
                this.ctx.fillRect(npc.x + 10, npc.y - 8, 2, 12);
                break;
            case 'philosopher':
                // Thinking pose - hand to chin
                this.ctx.fillRect(npc.x - 10, npc.y - 8, 3, 4);
                break;
            case 'hermit':
                // Long beard
                this.ctx.fillRect(npc.x - 5, npc.y - 6, 10, 8);
                // Walking stick
                this.ctx.fillRect(npc.x - 12, npc.y - 10, 2, 16);
                break;
            case 'judge':
                // Gavel
                this.ctx.fillRect(npc.x + 8, npc.y - 6, 4, 2);
                this.ctx.fillRect(npc.x + 9, npc.y - 8, 2, 4);
                break;
            case 'artist':
                // Palette
                this.ctx.fillRect(npc.x - 12, npc.y - 4, 4, 3);
                // Brush
                this.ctx.fillRect(npc.x + 8, npc.y - 6, 2, 8);
                break;
            case 'scientist':
                // Lab coat buttons
                this.ctx.fillStyle = '#000';
                this.ctx.fillRect(npc.x - 2, npc.y - 2, 1, 1);
                this.ctx.fillRect(npc.x - 2, npc.y + 2, 1, 1);
                // Glasses
                this.ctx.fillRect(npc.x - 5, npc.y - 9, 4, 1);
                this.ctx.fillRect(npc.x + 1, npc.y - 9, 4, 1);
                break;
            case 'teacher':
                // Book
                this.ctx.fillRect(npc.x - 10, npc.y - 2, 3, 4);
                // Apple
                this.ctx.fillStyle = '#ff0000';
                this.ctx.fillRect(npc.x + 8, npc.y - 4, 3, 3);
                break;
        }
    }
    
    drawInteractionHints() {
        const area = this.areas[this.currentArea];
        
        // NPC hints
        area.npcs.forEach(npc => {
            const distance = Math.sqrt(
                Math.pow(this.player.x - npc.x, 2) + 
                Math.pow(this.player.y - npc.y, 2)
            );
            
            if (distance < 40 && !npc.interacted) {
                this.ctx.fillStyle = '#ffd700';
                this.ctx.font = '10px monospace';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('Press SPACE', npc.x, npc.y + 25);
            }
        });
        
        // Building hints
        area.buildings.forEach(building => {
            if (this.player.x >= building.x - 20 && this.player.x <= building.x + building.w + 20 &&
                this.player.y >= building.y - 20 && this.player.y <= building.y + building.h + 20) {
                this.ctx.fillStyle = '#ffd700';
                this.ctx.font = '10px monospace';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('Press SPACE to enter', building.x + building.w/2, building.y + building.h + 15);
            }
        });
        
        // Exit hints
        area.exits.forEach(exit => {
            if (this.player.x >= exit.x - 20 && this.player.x <= exit.x + exit.w + 20 &&
                this.player.y >= exit.y - 20 && this.player.y <= exit.y + exit.h + 20) {
                this.ctx.fillStyle = '#ffd700';
                this.ctx.font = '10px monospace';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('Press SPACE', exit.x + exit.w/2, exit.y - 10);
            }
        });
    }
    
    interact() {
        if (this.currentDialogue) return;
        
        const area = this.areas[this.currentArea];
        
        // Check NPCs
        area.npcs.forEach(npc => {
            const distance = Math.sqrt(
                Math.pow(this.player.x - npc.x, 2) + 
                Math.pow(this.player.y - npc.y, 2)
            );
            
            if (distance < 40 && !npc.interacted) {
                this.startDialogue(npc);
            }
        });
        
        // Check buildings
        area.buildings.forEach(building => {
            if (this.player.x >= building.x && this.player.x <= building.x + building.w &&
                this.player.y >= building.y && this.player.y <= building.y + building.h) {
                this.enterBuilding(building.type);
            }
        });
        
        // Check exits
        area.exits.forEach(exit => {
            if (this.player.x >= exit.x && this.player.x <= exit.x + exit.w &&
                this.player.y >= exit.y && this.player.y <= exit.y + exit.h) {
                this.changeArea(exit.to);
            }
        });
        
        // Check secrets
        if (area.secrets) {
            area.secrets.forEach(secret => {
                if (this.player.x >= secret.x && this.player.x <= secret.x + secret.w &&
                    this.player.y >= secret.y && this.player.y <= secret.y + secret.h) {
                    this.activateSecret(secret);
                }
            });
        }
    }
    
    enterBuilding(buildingType) {
        this.changeArea(buildingType);
    }
    
    changeArea(newArea) {
        this.currentArea = newArea;
        this.visitedAreas.add(newArea);
        this.player.x = 500;
        this.player.y = 375;
        
        // Show area transition effect
        this.showAreaTransition(this.areas[newArea].name);
    }
    
    activateSecret(secret) {
        const quest = this.secretQuests[secret.type];
        if (!quest) return;
        
        // Allow re-interaction with secrets that have been discovered but not completed
        if (quest.discovered && quest.completed) return;
        
        quest.discovered = true;
        this.interactionCount++;
        
        const secrets = {
            fountain: {
                text: "You touch the ancient fountain and feel a surge of wisdom. The water whispers: 'True knowledge comes from understanding oneself.'",
                reward: { wisdom: +15, compassion: +5, courage: +5 }
            },
            hidden_book: {
                text: "You discover a hidden tome titled 'The Ethics of Power'. Reading it fills you with profound insights about leadership and responsibility.",
                reward: { wisdom: +10, compassion: +10, courage: +8 }
            },
            tavern_riddle: {
                text: "The mysterious bartender asks: 'What grows stronger when shared, yet costs nothing to give?' You answer: 'Knowledge and kindness.' He nods approvingly.",
                reward: { wisdom: +8, compassion: +12, courage: +6 }
            },
            ancient_statue: {
                text: "You place a small offering on the statue's plate. The statue's eyes glow, and you hear a voice in your mind: 'Remember that courage without wisdom is merely recklessness.'",
                reward: { wisdom: +12, compassion: +5, courage: +10 }
            },
            courthouse_scales: {
                text: "As you touch the scales, they balance perfectly. A sense of justice fills you: 'True justice requires both compassion and wisdom to balance the scales of life.'",
                reward: { wisdom: +10, compassion: +15, courage: +5 }
            }
        };
        
        const secretData = secrets[secret.type];
        if (secretData) {
            this.showSecretDiscovery(secretData.text, secretData.reward);
            this.applyStatChanges(secretData.reward);
            quest.completed = true;
            
            // Dog reaction to secret discovery
            if (this.dog.active) {
                this.dogReactToSecret();
            }
            
            // Update map details
            this.mapDetails[this.currentArea].discovered = true;
        }
    }
    
    dogReactToSecret() {
        // Dog gets excited and runs in circles
        const originalX = this.dog.x;
        const originalY = this.dog.y;
        
        // Animation frames
        let frame = 0;
        const maxFrames = 60;
        const radius = 30;
        
        const animateExcitement = () => {
            if (frame >= maxFrames) {
                this.dog.x = originalX;
                this.dog.y = originalY;
                return;
            }
            
            const angle = frame * 0.2;
            this.dog.x = originalX + Math.cos(angle) * radius;
            this.dog.y = originalY + Math.sin(angle) * radius;
            
            frame++;
            requestAnimationFrame(animateExcitement);
        };
        
        animateExcitement();
    }
    
    showSecretDiscovery(text, reward) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #9b59b6, #8e44ad); color: #fff; 
            padding: 25px; border: 3px solid #ffd700; border-radius: 12px; 
            font-family: inherit; font-size: 11px; z-index: 1000; 
            text-align: center; max-width: 500px; line-height: 1.5;
            box-shadow: 0 8px 25px rgba(155, 89, 182, 0.4);
        `;
        notification.innerHTML = `<strong>🔮 SECRET DISCOVERED! 🔮</strong><br><br>${text}`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
            this.showStatChange(reward);
        }, 4000);
    }
    
    applyStatChanges(changes) {
        this.player.wisdom = Math.max(0, Math.min(100, this.player.wisdom + changes.wisdom));
        this.player.compassion = Math.max(0, Math.min(100, this.player.compassion + changes.compassion));
        this.player.courage = Math.max(0, Math.min(100, this.player.courage + changes.courage));
    }
    
    showAreaTransition(areaName) {
        const transition = document.createElement('div');
        transition.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.9); color: #ffd700; padding: 20px 40px;
            border: 2px solid #ffd700; border-radius: 8px; font-family: inherit;
            font-size: 14px; z-index: 1000; text-align: center;
            animation: fadeInOut 2s ease-in-out;
        `;
        transition.textContent = `Entering ${areaName}`;
        document.body.appendChild(transition);
        
        setTimeout(() => {
            document.body.removeChild(transition);
        }, 2000);
    }
    
    startDialogue(npc) {
        this.currentDialogue = npc;
        this.inDialogue = true;
        this.selectedChoice = 0;
        const scenario = this.scenarios[npc.type];
        
        document.getElementById('dialogue-box').classList.remove('hidden');
        document.getElementById('dialogue-text').textContent = scenario.text;
        
        const choicesContainer = document.getElementById('dialogue-choices');
        choicesContainer.innerHTML = '';
        
        scenario.choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'choice-btn';
            if (index === 0) button.classList.add('selected');
            button.textContent = `${index + 1}. ${choice.text}`;
            button.addEventListener('click', () => this.makeChoice(choice, npc));
            choicesContainer.appendChild(button);
        });
    }
    
    navigateChoices(direction) {
        const choices = document.querySelectorAll('.choice-btn');
        if (choices.length === 0) return;
        
        choices[this.selectedChoice].classList.remove('selected');
        this.selectedChoice = (this.selectedChoice + direction + choices.length) % choices.length;
        choices[this.selectedChoice].classList.add('selected');
    }
    
    selectChoice() {
        const choices = document.querySelectorAll('.choice-btn');
        if (choices.length === 0) return;
        
        const scenario = this.scenarios[this.currentDialogue.type];
        const selectedChoiceData = scenario.choices[this.selectedChoice];
        this.makeChoice(selectedChoiceData, this.currentDialogue);
    }
    
    makeChoice(choice, npc) {
        // Apply stat changes
        this.player.wisdom = Math.max(0, Math.min(100, this.player.wisdom + choice.effect.wisdom));
        this.player.compassion = Math.max(0, Math.min(100, this.player.compassion + choice.effect.compassion));
        this.player.courage = Math.max(0, Math.min(100, this.player.courage + choice.effect.courage));
        
        // Track reputation
        const totalEffect = choice.effect.wisdom + choice.effect.compassion + choice.effect.courage;
        if (totalEffect > 10) {
            this.reputation.good++;
        } else if (totalEffect < -10) {
            this.reputation.evil++;
        } else {
            this.reputation.neutral++;
        }
        
        // Mark NPC as interacted
        npc.interacted = true;
        
        // Close dialogue
        document.getElementById('dialogue-box').classList.add('hidden');
        this.currentDialogue = null;
        this.inDialogue = false;
        this.selectedChoice = 0;
        
        // Show consequence message
        if (choice.consequence) {
            this.showConsequence(choice.consequence, choice.effect);
        }
        
        // Show wisdom gained/lost
        this.showStatChange(choice.effect);
        
        // Check for game completion
        this.checkGameCompletion();
    }
    
    showConsequence(message, effect) {
        const isNegative = effect.wisdom < 0 || effect.compassion < 0 || effect.courage < 0;
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 30%; left: 50%; transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.95); color: ${isNegative ? '#ff6b6b' : '#4ecdc4'}; 
            padding: 25px; border: 2px solid ${isNegative ? '#ff6b6b' : '#4ecdc4'}; 
            border-radius: 8px; font-family: inherit; font-size: 11px; 
            z-index: 1000; text-align: center; max-width: 400px; line-height: 1.4;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3500);
    }
    
    showStatChange(effect) {
        const messages = [];
        if (effect.wisdom !== 0) messages.push(`Wisdom ${effect.wisdom > 0 ? '+' : ''}${effect.wisdom}`);
        if (effect.compassion !== 0) messages.push(`Compassion ${effect.compassion > 0 ? '+' : ''}${effect.compassion}`);
        if (effect.courage !== 0) messages.push(`Courage ${effect.courage > 0 ? '+' : ''}${effect.courage}`);
        
        if (messages.length > 0) {
            // Simple notification system
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                background: rgba(0,0,0,0.9); color: #ffd700; padding: 20px;
                border: 2px solid #ffd700; border-radius: 8px; font-family: inherit;
                font-size: 12px; z-index: 1000; text-align: center;
            `;
            notification.textContent = messages.join(' • ');
            document.body.appendChild(notification);
            
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 2000);
        }
    }
    
    updateUI() {
        document.getElementById('wisdom-value').textContent = this.player.wisdom;
        document.getElementById('compassion-value').textContent = this.player.compassion;
        document.getElementById('courage-value').textContent = this.player.courage;
        
        document.getElementById('wisdom-bar').style.width = this.player.wisdom + '%';
        document.getElementById('compassion-bar').style.width = this.player.compassion + '%';
        document.getElementById('courage-bar').style.width = this.player.courage + '%';
    }
    
    checkGameCompletion() {
        let totalNPCs = 0;
        let interactedNPCs = 0;
        
        Object.values(this.areas).forEach(area => {
            area.npcs.forEach(npc => {
                totalNPCs++;
                if (npc.interacted) interactedNPCs++;
            });
        });
        
        if (interactedNPCs === totalNPCs) {
            setTimeout(() => {
                this.showEndingMessage();
            }, 2500);
        }
    }
    
    toggleJournal() {
        const journalPanel = document.getElementById('journal-panel');
        if (journalPanel.classList.contains('hidden')) {
            journalPanel.classList.remove('hidden');
            this.journalOpen = true;
            this.journalNavIndex = 0;
            this.updateJournal();
            this.highlightJournalItem();
        } else {
            journalPanel.classList.add('hidden');
            this.journalOpen = false;
        }
    }
    
    navigateJournal(direction) {
        const activeTab = document.querySelector('.journal-tab.active').dataset.tab;
        const items = document.querySelectorAll(`#${activeTab}-page .achievement-item, #${activeTab}-page .secret-item, #${activeTab}-page .note-item`);
        
        if (items.length === 0) return;
        
        // Remove highlight from current item
        if (this.journalNavIndex >= 0 && this.journalNavIndex < items.length) {
            items[this.journalNavIndex].classList.remove('highlighted');
        }
        
        // Update index
        this.journalNavIndex = (this.journalNavIndex + direction + items.length) % items.length;
        
        // Highlight new item
        this.highlightJournalItem();
    }
    
    changeJournalTab(direction) {
        const tabs = document.querySelectorAll('.journal-tab');
        const currentTab = document.querySelector('.journal-tab.active');
        let currentIndex = 0;
        
        tabs.forEach((tab, index) => {
            if (tab === currentTab) currentIndex = index;
        });
        
        const newIndex = (currentIndex + direction + tabs.length) % tabs.length;
        const newTab = tabs[newIndex];
        
        // Simulate click on the new tab
        newTab.click();
        this.journalNavIndex = 0;
        this.highlightJournalItem();
    }
    
    highlightJournalItem() {
        const activeTab = document.querySelector('.journal-tab.active').dataset.tab;
        const items = document.querySelectorAll(`#${activeTab}-page .achievement-item, #${activeTab}-page .secret-item, #${activeTab}-page .note-item`);
        
        if (items.length === 0) return;
        
        // Add highlight to current item
        items[this.journalNavIndex].classList.add('highlighted');
        
        // Scroll item into view if needed
        items[this.journalNavIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    updateJournal() {
        // Remove any existing event listeners to prevent duplicates
        const showHintButton = document.getElementById('show-hint');
        const newShowHintButton = showHintButton.cloneNode(true);
        showHintButton.parentNode.replaceChild(newShowHintButton, showHintButton);
        
        // Update achievements
        const achievementsList = document.getElementById('achievements-list');
        achievementsList.innerHTML = '';
        
        const allAchievements = [
            { id: 'first_choice', name: 'First Steps', desc: 'Made your first moral choice', unlocked: this.achievements.includes('first_choice') },
            { id: 'wise_seeker', name: 'Wise Seeker', desc: 'Reached 80+ Wisdom', unlocked: this.achievements.includes('wise_seeker') },
            { id: 'compassionate_soul', name: 'Compassionate Soul', desc: 'Reached 80+ Compassion', unlocked: this.achievements.includes('compassionate_soul') },
            { id: 'brave_heart', name: 'Brave Heart', desc: 'Reached 80+ Courage', unlocked: this.achievements.includes('brave_heart') },
            { id: 'explorer', name: 'Town Explorer', desc: 'Visited all areas', unlocked: this.achievements.includes('explorer') },
            { id: 'saint', name: 'Saint', desc: 'Made only virtuous choices', unlocked: this.achievements.includes('saint') },
            { id: 'secret_seeker', name: 'Secret Seeker', desc: 'Discover all hidden secrets', unlocked: this.achievements.includes('secret_seeker') }
        ];
        
        if (allAchievements.some(a => a.unlocked)) {
            allAchievements.forEach(achievement => {
                const item = document.createElement('div');
                item.className = achievement.unlocked ? 'achievement-item' : 'achievement-item achievement-locked';
                
                const title = document.createElement('h5');
                title.textContent = achievement.unlocked ? `🏆 ${achievement.name}` : `🔒 ???`;
                
                const desc = document.createElement('p');
                desc.textContent = achievement.unlocked ? achievement.desc : 'Continue your journey to unlock this achievement';
                
                item.appendChild(title);
                item.appendChild(desc);
                achievementsList.appendChild(item);
            });
        } else {
            achievementsList.innerHTML = '<p class="empty-state">Complete tasks to earn achievements...</p>';
        }
        
        // Update secrets
        const secretsList = document.getElementById('secrets-list');
        secretsList.innerHTML = '';
        
        const allSecrets = [
            { id: 'fountain_secret', name: 'Ancient Fountain', desc: 'The fountain holds ancient wisdom that flows through time', discovered: this.secretQuests.fountain_secret.discovered },
            { id: 'hidden_book', name: 'The Ethics of Power', desc: 'A hidden tome containing profound insights about leadership', discovered: this.secretQuests.hidden_book.discovered },
            { id: 'tavern_riddle', name: 'Bartender\'s Riddle', desc: 'Knowledge and kindness grow stronger when shared', discovered: this.secretQuests.tavern_riddle.discovered },
            { id: 'ancient_statue', name: 'Forest Statue', desc: 'An ancient statue with wisdom about courage', discovered: this.secretQuests.ancient_statue.discovered },
            { id: 'courthouse_scales', name: 'Scales of Justice', desc: 'The scales that balance compassion and wisdom', discovered: this.secretQuests.courthouse_scales.discovered }
        ];
        
        if (allSecrets.some(s => s.discovered)) {
            allSecrets.forEach(secret => {
                if (secret.discovered) {
                    const item = document.createElement('div');
                    item.className = 'secret-item';
                    
                    const title = document.createElement('h5');
                    title.textContent = `🔮 ${secret.name}`;
                    
                    const desc = document.createElement('p');
                    desc.textContent = secret.desc;
                    
                    item.appendChild(title);
                    item.appendChild(desc);
                    secretsList.appendChild(item);
                }
            });
        } else {
            secretsList.innerHTML = '<p class="empty-state">Explore the world to discover secrets...</p>';
        }
        
        // Update notes
        const notesList = document.getElementById('notes-list');
        notesList.innerHTML = '';
        
        if (this.interactionCount > 0) {
            const philosophicalNotes = [
                { title: "On Wisdom", text: "True wisdom is knowing that you know nothing. - Socrates" },
                { title: "On Courage", text: "Courage is not the absence of fear, but rather the assessment that something else is more important than fear. - Franklin D. Roosevelt" },
                { title: "On Compassion", text: "If you want others to be happy, practice compassion. If you want to be happy, practice compassion. - Dalai Lama" }
            ];
            
            philosophicalNotes.forEach(note => {
                const item = document.createElement('div');
                item.className = 'note-item';
                
                const title = document.createElement('h5');
                title.textContent = `📝 ${note.title}`;
                
                const desc = document.createElement('p');
                desc.textContent = note.text;
                
                item.appendChild(title);
                item.appendChild(desc);
                notesList.appendChild(item);
            });
        } else {
            notesList.innerHTML = '<p class="empty-state">Your journey\'s insights will appear here...</p>';
        }
        
        // Update quests
        const questsList = document.getElementById('quests-list');
        questsList.innerHTML = '';
        
        // Count NPCs correctly
        let npcTotal = 0;
        let npcCompleted = 0;
        
        Object.values(this.areas).forEach(area => {
            if (area.npcs) {
                npcTotal += area.npcs.length;
                npcCompleted += area.npcs.filter(npc => npc.interacted).length;
            }
        });
        
        const npcProgress = npcTotal > 0 ? (npcCompleted / npcTotal * 100) : 0;
        
        const secretTotal = Object.keys(this.secretQuests).length;
        const secretCompleted = Object.values(this.secretQuests).filter(quest => quest.completed).length;
        const secretProgress = secretCompleted / secretTotal * 100;
        
        const areaTotal = Object.keys(this.mapDetails).length;
        const areaCompleted = Object.values(this.mapDetails).filter(area => area.discovered).length;
        const areaProgress = areaCompleted / areaTotal * 100;
        
        const quests = [
            { 
                name: "Philosophical Dialogues", 
                desc: `Speak with all the philosophers and characters (${npcCompleted}/${npcTotal})`,
                progress: npcProgress,
                completed: npcCompleted === npcTotal
            },
            { 
                name: "Secret Discoveries", 
                desc: `Find all hidden secrets throughout the world (${secretCompleted}/${secretTotal})`,
                progress: secretProgress,
                completed: secretCompleted === secretTotal
            },
            { 
                name: "World Explorer", 
                desc: `Visit all areas of the world (${areaCompleted}/${areaTotal})`,
                progress: areaProgress,
                completed: areaCompleted === areaTotal
            }
        ];
        
        quests.forEach(quest => {
            const item = document.createElement('div');
            item.className = quest.completed ? 'quest-item completed' : 'quest-item';
            
            const title = document.createElement('h5');
            title.textContent = quest.completed ? `✅ ${quest.name}` : quest.name;
            
            const desc = document.createElement('p');
            desc.textContent = quest.desc;
            
            const progress = document.createElement('div');
            progress.className = 'quest-progress';
            
            const progressBar = document.createElement('div');
            progressBar.className = 'quest-progress-bar';
            progressBar.style.width = `${quest.progress}%`;
            
            progress.appendChild(progressBar);
            
            item.appendChild(title);
            item.appendChild(desc);
            item.appendChild(progress);
            questsList.appendChild(item);
        });
        
        // Update hints
        const hintsList = document.getElementById('hints-list');
        hintsList.innerHTML = '';
        
        // Only show hints if player has interacted with at least one NPC
        if (npcCompleted > 0) {
            const availableHints = [
                { 
                    id: 'npc_hint', 
                    title: "Character Locations", 
                    text: "Look for characters in areas that match their profession. The Sage can be found in the library, while the Merchant is at the market."
                },
                { 
                    id: 'secret_hint', 
                    title: "Finding Secrets", 
                    text: "Secrets often glow subtly. Look for unusual objects in each area - fountains, statues, and other special items may hide wisdom."
                },
                { 
                    id: 'stat_hint', 
                    title: "Balancing Stats", 
                    text: "Different choices affect your stats in different ways. Try to balance Wisdom, Compassion, and Courage for the best outcome."
                },
                { 
                    id: 'area_hint', 
                    title: "Exploring Areas", 
                    text: "Don't forget to visit the forest and courthouse. Each area has unique characters and secrets to discover."
                },
                { 
                    id: 'dog_hint', 
                    title: "Your Companion", 
                    text: `${this.dog.name} is more than just a pet - he reacts to your discoveries and will help guide you to secrets.`
                }
            ];
            
            // Show hints based on progress
            const hintsToShow = Math.min(Math.floor(npcCompleted / 2) + 1, availableHints.length);
            
            for (let i = 0; i < hintsToShow; i++) {
                const hint = availableHints[i];
                const item = document.createElement('div');
                item.className = 'hint-item';
                
                const title = document.createElement('h5');
                title.textContent = `💡 ${hint.title}`;
                
                const desc = document.createElement('p');
                desc.textContent = hint.text;
                
                item.appendChild(title);
                item.appendChild(desc);
                hintsList.appendChild(item);
            }
            
            // Add reveal hint button functionality
            document.getElementById('show-hint').addEventListener('click', () => {
                // Always show at least one hint even if no NPCs have been interacted with
                const availableHintsCount = availableHints.length;
                const currentHintsCount = hintsList.querySelectorAll('.hint-item').length;
                
                if (currentHintsCount < availableHintsCount) {
                    const hint = availableHints[currentHintsCount];
                    const item = document.createElement('div');
                    item.className = 'hint-item';
                    
                    const title = document.createElement('h5');
                    title.textContent = `💡 ${hint.title}`;
                    
                    const desc = document.createElement('p');
                    desc.textContent = hint.text;
                    
                    item.appendChild(title);
                    item.appendChild(desc);
                    hintsList.appendChild(item);
                    
                    // Highlight the new hint
                    item.classList.add('highlighted');
                    setTimeout(() => {
                        item.classList.remove('highlighted');
                    }, 2000);
                    
                    // Remove empty state message if it exists
                    const emptyState = hintsList.querySelector('.empty-state');
                    if (emptyState) {
                        hintsList.removeChild(emptyState);
                    }
                } else {
                    alert("You've discovered all available hints!");
                }
            });
        } else {
            hintsList.innerHTML = '<p class="empty-state">Interact with characters to unlock hints...</p>';
        }
    }
    
    showEndingMessage() {
        const totalScore = this.player.wisdom + this.player.compassion + this.player.courage;
        let message = "Your philosophical journey is complete!\n\n";
        
        if (totalScore >= 280) {
            message += "🌟 ENLIGHTENED PHILOSOPHER 🌟\nYou have achieved transcendent wisdom. Your choices reflect the highest ideals of human virtue and understanding.";
        } else if (totalScore >= 240) {
            message += "✨ WISE SAGE ✨\nYour moral compass guides you true. You embody the balance of thought, feeling, and action.";
        } else if (totalScore >= 200) {
            message += "🌱 THOUGHTFUL SEEKER 🌱\nYou walk the path of wisdom with growing understanding. Your journey of self-improvement continues.";
        } else if (totalScore >= 160) {
            message += "🤔 QUESTIONING STUDENT 🤔\nYou've begun to question and grow. Philosophy is the art of living well - keep practicing.";
        } else {
            message += "🌿 BEGINNING WANDERER 🌿\nEvery great philosopher started with questions. Reflect deeply on your choices and their consequences.";
        }
        
        // Philosophical reflection based on dominant trait
        const dominant = this.player.wisdom >= this.player.compassion && this.player.wisdom >= this.player.courage ? 'wisdom' :
                        this.player.compassion >= this.player.courage ? 'compassion' : 'courage';
        
        const reflections = {
            wisdom: "Your pursuit of knowledge illuminates the path for others.",
            compassion: "Your empathy creates ripples of kindness in the world.",
            courage: "Your bravery inspires others to face their own challenges."
        };
        
        message += `\n\nYour strongest virtue: ${dominant.toUpperCase()}\n"${reflections[dominant]}"`;
        message += `\n\nFinal Stats:\nWisdom: ${this.player.wisdom}\nCompassion: ${this.player.compassion}\nCourage: ${this.player.courage}`;
        message += "\n\nPhilosophy in action: How will you apply these insights to your real life?";
        
        alert(message);
        
        // Show support creator panel instead of reloading
        setTimeout(() => {
            this.showSupportCreator();
        }, 1000);
    }
    
    showSupportCreator() {
        const supportPanel = document.getElementById('support-creator-panel');
        supportPanel.classList.remove('hidden');
        
        // Set up continue button
        document.getElementById('continue-playing').addEventListener('click', () => {
            supportPanel.classList.add('hidden');
            location.reload(); // Restart game after closing support panel
        });
        
        // Set up close button
        document.querySelector('.close-support').addEventListener('click', () => {
            supportPanel.classList.add('hidden');
            location.reload(); // Restart game after closing support panel
        });
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    new WisdomQuest();
});