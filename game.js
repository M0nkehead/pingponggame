const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const playerScoreElement = document.getElementById('playerScore');
const aiScoreElement = document.getElementById('aiScore');

// Set canvas size
canvas.width = 800;
canvas.height = 400;

// Game objects
const paddleWidth = 10;
const paddleHeight = 60;
const ballSize = 8;

const player = {
    y: canvas.height / 2 - paddleHeight / 2,
    score: 0,
    speed: 8
};

const ai = {
    y: canvas.height / 2 - paddleHeight / 2,
    score: 0,
    speed: 5
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    speed: 5,
    dx: 5,
    dy: 5,
    reset() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        // Randomize initial direction
        this.dx = this.speed * (Math.random() < 0.5 ? 1 : -1);
        this.dy = this.speed * (Math.random() * 2 - 1);
    }
};

let gameLoop;
let gameActive = false;

// Event listeners
document.addEventListener('mousemove', movePlayerPaddle);
startButton.addEventListener('click', startGame);

function movePlayerPaddle(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    
    // Keep paddle within canvas bounds
    if (mouseY >= paddleHeight/2 && mouseY <= canvas.height - paddleHeight/2) {
        player.y = mouseY - paddleHeight/2;
    }
}

function moveAIPaddle() {
    const paddleCenter = ai.y + paddleHeight/2;
    const ballCenter = ball.y;
    
    // Add some delay to make AI beatable
    if (paddleCenter < ballCenter - 35) {
        ai.y += ai.speed;
    } else if (paddleCenter > ballCenter + 35) {
        ai.y -= ai.speed;
    }

    // Keep AI paddle within canvas bounds
    if (ai.y < 0) ai.y = 0;
    if (ai.y + paddleHeight > canvas.height) ai.y = canvas.height - paddleHeight;
}

function startGame() {
    if (!gameActive) {
        gameActive = true;
        player.score = 0;
        ai.score = 0;
        updateScore();
        ball.reset();
        startButton.textContent = 'Reset Game';
        gameLoop = setInterval(update, 16); // ~60fps
    } else {
        resetGame();
    }
}

function resetGame() {
    gameActive = false;
    clearInterval(gameLoop);
    player.score = 0;
    ai.score = 0;
    updateScore();
    ball.reset();
    player.y = canvas.height / 2 - paddleHeight / 2;
    ai.y = canvas.height / 2 - paddleHeight / 2;
    startButton.textContent = 'Start Game';
    draw();
}

function updateScore() {
    playerScoreElement.textContent = player.score;
    aiScoreElement.textContent = ai.score;
}

function checkCollision(paddle, x, y) {
    return x >= paddle.x && 
           x <= paddle.x + paddleWidth &&
           y >= paddle.y && 
           y <= paddle.y + paddleHeight;
}

function update() {
    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom
    if (ball.y <= 0 || ball.y >= canvas.height) {
        ball.dy *= -1;
    }

    // Ball collision with paddles
    const playerX = 50;
    const aiX = canvas.width - 50 - paddleWidth;

    if (checkCollision({x: playerX, y: player.y}, ball.x, ball.y)) {
        ball.dx = Math.abs(ball.dx) * 1.1; // Increase speed slightly
        const relativeIntersectY = (player.y + (paddleHeight/2)) - ball.y;
        const normalizedRelativeIntersectY = relativeIntersectY / (paddleHeight/2);
        ball.dy = -normalizedRelativeIntersectY * ball.speed;
    }

    if (checkCollision({x: aiX, y: ai.y}, ball.x, ball.y)) {
        ball.dx = -Math.abs(ball.dx) * 1.1; // Increase speed slightly
        const relativeIntersectY = (ai.y + (paddleHeight/2)) - ball.y;
        const normalizedRelativeIntersectY = relativeIntersectY / (paddleHeight/2);
        ball.dy = -normalizedRelativeIntersectY * ball.speed;
    }

    // Scoring
    if (ball.x < 0) {
        ai.score++;
        updateScore();
        ball.reset();
    } else if (ball.x > canvas.width) {
        player.score++;
        updateScore();
        ball.reset();
    }

    moveAIPaddle();
    draw();
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.strokeStyle = '#333';
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    ctx.fillStyle = '#fff';
    // Player paddle
    ctx.fillRect(50, player.y, paddleWidth, paddleHeight);
    // AI paddle
    ctx.fillRect(canvas.width - 50 - paddleWidth, ai.y, paddleWidth, paddleHeight);

    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ballSize, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.closePath();
}

// Initial draw
draw();