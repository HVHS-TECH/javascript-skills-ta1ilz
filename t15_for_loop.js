<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Retro Pixel Shooter</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #111;
            color: #fff;
            font-family: 'Courier New', Courier, monospace;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            overflow: hidden;
        }
        #gameContainer {
            position: relative;
            box-shadow: 0 0 20px rgba(255, 0, 0, 0.3);
        }
        canvas {
            border: 4px solid #fff;
            background-color: #1a1a24;
            image-rendering: -moz-crisp-edges;
            image-rendering: -webkit-crisp-edges;
            image-rendering: pixelated;
            image-rendering: crisp-edges;
            display: block;
        }
        #ui {
            position: absolute;
            top: 10px;
            left: 10px;
            font-size: 18px;
            text-shadow: 2px 2px #000;
            pointer-events: none;
            user-select: none;
        }
        #weaponUi {
            position: absolute;
            top: 10px;
            right: 10px;
            font-size: 18px;
            text-shadow: 2px 2px #000;
            text-align: right;
            pointer-events: none;
            user-select: none;
        }
        #gameOverScreen {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            display: none;
            user-select: none;
        }
        button {
            background-color: #e74c3c;
            border: 2px solid #fff;
            color: white;
            padding: 10px 20px;
            font-size: 18px;
            font-family: 'Courier New', Courier, monospace;
            cursor: pointer;
            margin-top: 15px;
        }
        button:hover {
            background-color: #c0392b;
        }
        .controls-hint {
            margin-top: 10px;
            color: #888;
            font-size: 14px;
            user-select: none;
        }
    </style>
</head>
<body>

    <div id="gameContainer">
        <canvas id="gameCanvas" width="800" height="600"></canvas>
        <div id="ui">
            <div>SCORE: <span id="scoreVal">0</span></div>
            <div>HP: <span id="hpVal">100</span>%</div>
        </div>
        <div id="weaponUi">
            <div>WEAPON: <span id="weaponName">Blaster</span></div>
            <div>AMMO: <span id="ammoVal">∞</span></div>
            <div style="font-size: 12px; color: #aaa;">Press Q to swap</div>
        </div>
        <div id="gameOverScreen">
            <h1 style="color: #ff3333; font-size: 40px; margin: 0;">GAME OVER</h1>
            <p>Your Score: <span id="finalScore">0</span></p>
            <button id="restartBtn">PLAY AGAIN</button>
        </div>
    </div>
    
    <div class="controls-hint">
        WASD to Move | Mouse to Aim | Left Click to Shoot | Q to Switch Weapons
    </div>

    <script>
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        
        // Block right-clicks inside canvas
        window.addEventListener('contextmenu', e => e.preventDefault());

        // Core Game Engine State
        let score = 0;
        let gameOver = false;
        const keys = {};
        const mouse = { x: 0, y: 0, leftDown: false };

        // Weapon Blueprint Data Array
        const WEAPONS = [
            { name: "Blaster", fireRate: 200, damage: 25, speed: 12, color: '#00ffff', maxAmmo: Infinity, ammo: Infinity, burst: 1 },
            { name: "Spreadshot", fireRate: 350, damage: 15, speed: 9, color: '#ff00ff', maxAmmo: 40, ammo: 40, burst: 3 },
            { name: "Plasma Cannon", fireRate: 600, damage: 70, speed: 7, color: '#ffff00', maxAmmo: 15, ammo: 15, burst: 1 }
        ];
        let currentWeaponIndex = 0;
        let lastShotTime = 0;

        // Interactive Hero Properties
        const player = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            size: 24,
            speed: 4.5,
            hp: 100,
            maxHp: 100,
            angle: 0
        };

        // Component Repositories
        let bullets = [];
        let enemies = [];
        let particles = [];
        let ammoPickups = [];

        // Dynamic Keyboard / Pointer Inputs
        window.addEventListener('keydown', (e) => {
            keys[e.key.toLowerCase()] = true;
            if (e.key.toLowerCase() === 'q' && !gameOver) {
                currentWeaponIndex = (currentWeaponIndex + 1) % WEAPONS.length;
                updateUi();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            keys[e.key.toLowerCase()] = false;
        });
        
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) mouse.leftDown = true;
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 0) mouse.leftDown = false;
        });

        document.getElementById('restartBtn').addEventListener('click', resetGame);

        // Procedural Custom Pixel Mesh Elements
        function drawPixelPlayer(ctx, x, y, angle) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            
            // Pixel Base Layout
            ctx.fillStyle = '#3498db'; 
            ctx.fillRect(-9, -9, 18, 18);
            ctx.fillStyle = '#2980b9'; 
            ctx.fillRect(-9, 3, 6, 6);
            ctx.fillRect(3, 3, 6, 6);
            
            // Yellow View Lens facing mouse target direction
            ctx.fillStyle = '#f1c40f'; 
            ctx.fillRect(3, -6, 6, 12);
            
            // Pixel Weapon Structure
            ctx.fillStyle = '#7f8c8d';
            ctx.fillRect(9, -3, 9, 6);
            
            ctx.restore();
        }

        function drawPixelEnemy(ctx, x, y, type) {
            ctx.save();
            ctx.translate(x, y);
            
            if (type === 'fast') {
                ctx.fillStyle = '#e67e22'; 
                ctx.fillRect(-8, -8, 16, 16);
                ctx.fillStyle = '#2c3e50'; 
                ctx.fillRect(-4, -4, 4, 4);
                ctx.fillRect(4, -4, 4, 4);
            } else {
                ctx.fillStyle = '#e74c3c'; 
                ctx.fillRect(-12, -12, 24, 24);
                ctx.fillStyle = '#962d22'; 
                ctx.fillRect(-4, -4, 8, 8);
            }
            ctx.restore();
        }

        function createExplosion(x, y, color) {
            for (let i = 0; i < 10; i++) {
                particles.push({
                    x: x,
                    y: y,
                    vx: (Math.random() - 0.5) * 6,
                    vy: (Math.random() - 0.5) * 6,
                    size: Math.random() * 4 + 2,
                    color: color,
                    life: Math.random() * 15 + 10
                });
            }
        }

        function spawnEnemy() {
            if (gameOver) return;
            
            let x, y;
            if (Math.random() < 0.5) {
                x = Math.random() < 0.5 ? -30 : canvas.width + 30;
                y = Math.random() * canvas.height;
            } else {
                x = Math.random() * canvas.width;
                y = Math.random() < 0.5 ? -30 : canvas.height + 30;
            }

            const type = Math.random() > 0.35 ? 'normal' : 'fast';
            const hp = type === 'normal' ? 50 : 20;
            const speed = type === 'normal' ? 1.6 : 3.2;

            enemies.push({ x, y, type, hp, speed, size: type === 'normal' ? 14 : 10 });
        }

        // Clocked Entity Spawn Invocations
        setInterval(spawnEnemy, 1000);
        setInterval(() => {
            if (Math.random() > 0.4 && !gameOver) {
                ammoPickups.push({
                    x: Math.random() * (canvas.width - 60) + 30,
                    y: Math.random() * (canvas.height - 60) + 30,
                    size: 14
                });
            }
        }, 7000);

        function fireWeapon() {
            const now = Date.now();
            const wp = WEAPONS[currentWeaponIndex];

            if (now - lastShotTime < wp.fireRate) return;
            if (wp.ammo <= 0) return;

            lastShotTime = now;
            if (wp.maxAmmo !== Infinity) wp.ammo--;

            if (wp.burst === 3) {
                const baseAngle = player.angle;
                const offsets = [-0.25, 0, 0.25];
                offsets.forEach(offset => {
                    bullets.push({
                        x: player.x + Math.cos(player.angle) * 16,
                        y: player.y + Math.sin(player.angle) * 16,
                        vx: Math.cos(baseAngle + offset) * wp.speed,
                        vy: Math.sin(baseAngle + offset) * wp.speed,
                        damage: wp.damage,
                        color: wp.color,
                        size: 5
                    });
                });
            } else {
                bullets.push({
                    x: player.x + Math.cos(player.angle) * 16,
                    y: player.y + Math.sin(player.angle) * 16,
                    vx: Math.cos(player.angle) * wp.speed,
                    vy: Math.sin(player.angle) * wp.speed,
                    damage: wp.damage,
