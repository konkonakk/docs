// Game variables
let canvas, ctx;
let gameStarted = false;
let gameOver = false;
let score = 0;
let gravity = 0.25; // Reduced gravity to slow down falling
let speed = 2;
let gap = 150;

// Bird variables
let bird = {
    x: 50,
    y: 150,
    width: 80, // Doubled bird size
    height: 90, // Doubled bird size
    velocity: 0,
    jump: -6 // Adjusted jump power for slower falling
};

// Arrays to store mountains
let mountains = [];
let mountainWidth = 300; // Further increased width for mountains
let mountainFrequency = 150; // Adjusted frequency for wider mountains
let frameCount = 0;

// Images
let birdImg = new Image();
let mountainImg = new Image();
let backgroundImg = new Image();

// Load game images
function loadImages() {
    // Load bird image (Tiny)
    birdImg.src = 'images/tiny.png';
    birdImg.onload = function() {
        // Adjust bird dimensions based on the image
        bird.width = 100;
        bird.height = 90;
    };
    
    // Load mountain image
    mountainImg.src = 'images/mountain.png';
    mountainImg.onload = function() {
        // Adjust mountain width if needed
        mountainWidth = 300;
    };
    
    // Load background image
    backgroundImg.src = 'images/background.jpg';
}

// Initialize the game
function init() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Load game images
    loadImages();
    
    // Add event listeners for both desktop and mobile
    document.addEventListener('click', handleClick);
    document.addEventListener('touchstart', function(e) {
        // Prevent default touch behavior to avoid scrolling
        e.preventDefault();
        handleClick();
    }, { passive: false });
    
    document.addEventListener('keydown', function(e) {
        if (e.code === 'Space') {
            handleClick();
        }
    });
    
    document.getElementById('restart-button').addEventListener('click', restartGame);
    document.getElementById('restart-button').addEventListener('touchstart', function(e) {
        e.preventDefault();
        restartGame();
    }, { passive: false });
    
    // Add instructions for mobile
    if ('ontouchstart' in window) {
        document.querySelector('#start-screen p').textContent = 'Tap to start and jump';
    }
    
    // Start the game loop
    requestAnimationFrame(gameLoop);
}

// Handle click/tap events
function handleClick() {
    if (!gameStarted) {
        startGame();
    } else if (!gameOver) {
        // Make the bird jump
        bird.velocity = bird.jump;
    }
}

// Start the game
function startGame() {
    gameStarted = true;
    gameOver = false;
    score = 0;
    bird.y = 150;
    bird.velocity = 0;
    mountains = [];
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over-screen').classList.add('hidden');
    document.getElementById('score').textContent = score;
}

// Restart the game
function restartGame() {
    startGame();
}

// Game over
function endGame() {
    gameOver = true;
    document.getElementById('game-over-screen').classList.remove('hidden');
    document.getElementById('final-score').textContent = score;
}

// Update game state
function update() {
    if (!gameStarted || gameOver) return;
    
    // Update bird position
    bird.velocity += gravity;
    bird.y += bird.velocity;
    
    // Check for collision with top and bottom of screen
    // Only end the game if the bird is completely off the screen
    if (bird.y + bird.height <= 0 || bird.y >= canvas.height) {
        endGame();
    }
    
    // Add new mountains
    frameCount++;
    if (frameCount >= mountainFrequency) {
        frameCount = 0;
        
        // Random height for the mountains (only from the ground)
        const minHeight = 100; // Shorter minimum height
        const maxHeight = 300; // Shorter maximum height
        const mountainHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
        
        mountains.push({
            x: canvas.width,
            height: mountainHeight,
            passed: false
        });
    }
    
    // Update mountains position and check for collisions
    for (let i = 0; i < mountains.length; i++) {
        const m = mountains[i];
        m.x -= speed;
        
        // Check if bird passed the mountain
        if (!m.passed && m.x + mountainWidth < bird.x) {
            m.passed = true;
            score++;
            document.getElementById('score').textContent = score;
        }
        
        // Check for collision with mountains
        // Use a very forgiving collision detection
        const hitboxPadding = 40; // Significantly reduce the effective hitbox size
        
        // Only check for collision if the bird is near the mountain horizontally
        const isNearMountainHorizontally = 
            bird.x + bird.width - hitboxPadding > m.x + hitboxPadding && 
            bird.x + hitboxPadding < m.x + mountainWidth - hitboxPadding;
            
        // Only check for collision if the bird is near the mountain vertically
        const isCollidingWithMountain = 
            isNearMountainHorizontally && 
            bird.y + bird.height - hitboxPadding > canvas.height - m.height + hitboxPadding;
            
        // Debug collision
        if (isNearMountainHorizontally && isCollidingWithMountain) {
            // Only end the game if there's a definite collision
            endGame();
        }
        
        // Remove mountains that are off screen
        if (m.x + mountainWidth < 0) {
            mountains.splice(i, 1);
            i--;
        }
    }
}

// Draw game elements
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
    
    // Draw mountains
    for (let i = 0; i < mountains.length; i++) {
        const m = mountains[i];
        
        // Draw mountain from the ground
        ctx.drawImage(
            mountainImg, 
            m.x, canvas.height - m.height, 
            mountainWidth, m.height
        );
    }
    
    // Draw bird
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Initialize the game when the page loads
window.onload = init;
