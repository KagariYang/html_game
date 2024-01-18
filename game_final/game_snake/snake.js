const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scale = 20;
const rows = canvas.height / scale;
const columns = canvas.width / scale;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;

let snake;
let fruit;

const eatSound = new Audio('../res/sound/eat.mp3');

(function setup() {
    snake = new Snake();
    fruit = new Fruit();
    fruit.pickLocation();
    score = 0; // 重置得分为0
    document.getElementById('score').innerText = score;
    document.getElementById('high-score').innerText = highScore;

    window.setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        fruit.draw();
        snake.update();
        snake.draw();

        if (snake.eat(fruit)) {
            fruit.pickLocation();
            score++;
            document.getElementById('score').innerText = score;

            if (score > highScore) {
                highScore = score;
                localStorage.setItem('highScore', highScore);
                document.getElementById('high-score').innerText = highScore;
            }
        }

        if (snake.checkCollision()) {
            score = 0; // 重置得分
            document.getElementById('score').innerText = score;
        }
    }, 100);
}());

window.addEventListener('keydown', (evt) => {
    const direction = evt.key.replace('Arrow', '');
    snake.changeDirection(direction);
});



function drawScore() {
    const scoreText = document.getElementById('score');
    scoreText.innerText = score;
}


function Snake() {
    this.x = 0;
    this.y = 0;
    this.xSpeed = scale * 1;
    this.ySpeed = 0;
    this.total = 0;
    this.tail = [];

    this.draw = function() {
        ctx.fillStyle = "#FF0000";  // 蛇头颜色
        ctx.fillRect(this.x, this.y, scale, scale);

        ctx.fillStyle = "#555555";  // 蛇身颜色
        for (let i = 0; i < this.tail.length; i++) {
            ctx.fillRect(this.tail[i].x, this.tail[i].y, scale, scale);
        }
    };

    this.update = function() {
        for (let i = 0; i < this.tail.length - 1; i++) {
            this.tail[i] = this.tail[i + 1];
        }

        this.tail[this.total - 1] = { x: this.x, y: this.y };

        this.x += this.xSpeed;
        this.y += this.ySpeed;

        if (this.x > canvas.width) {
            this.x = 0;
        }

        if (this.y > canvas.height) {
            this.y = 0;
        }

        if (this.x < 0) {
            this.x = canvas.width;
        }

        if (this.y < 0) {
            this.y = canvas.height;
        }
    };

    this.eat = function(fruit) {
        if (this.x === fruit.x && this.y === fruit.y) {
            eatSound.play();
            this.total++;
            return true;
        }

        return false;
    };

    this.checkCollision = function() {
        for (var i = 0; i < this.tail.length; i++) {
            if (this.x === this.tail[i].x && this.y === this.tail[i].y) {
                this.total = 0;
                this.tail = [];
                return true; // 发生碰撞时返回true
            }
        }
        return false; // 没有发生碰撞时返回false
    };

    this.changeDirection = function(direction) {
        switch(direction) {
            case 'Up':
                this.xSpeed = 0;
                this.ySpeed = -scale * 1;
                break;
            case 'Down':
                this.xSpeed = 0;
                this.ySpeed = scale * 1;
                break;
            case 'Left':
                this.xSpeed = -scale * 1;
                this.ySpeed = 0;
                break;
            case 'Right':
                this.xSpeed = scale * 1;
                this.ySpeed = 0;
                break;
        }
    };
}

function Fruit() {
    this.x;
    this.y;

    this.pickLocation = function() {
        this.x = (Math.floor(Math.random() * rows - 1) + 1) * scale;
        this.y = (Math.floor(Math.random() * columns - 1) + 1) * scale;
    };

    this.draw = function() {
        ctx.fillStyle = "#4CAF50"; // 果实颜色
        ctx.fillRect(this.x, this.y, scale, scale);
    };
}

// 页面加载时设置用户名和添加返回按钮事件
window.onload = function() {
    const username = localStorage.getItem('username');
    if (username) {
        document.getElementById('current-user').innerText = `当前用户： ${username}`;
    }
};

// 返回按钮的事件处理函数
function goBack() {
    window.location.href = '../game_selection.html'; // 修改为游戏选择页面的正确路径
}