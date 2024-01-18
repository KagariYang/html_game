let grid = document.getElementById('grid');
let scoreDisplay = document.getElementById('score');
let timeDisplay = document.getElementById('time');
let bestTimeDisplay = document.getElementById('bestTime');
let startButton = document.querySelector('button');
let difficultySelect = document.getElementById('difficulty'); // 难度选择器
let score = 0;
let bestTime = localStorage.getItem("bestTime") || ''; // 如果没有最佳时间，则默认为空字符串
let startTime;
let timer;
let firstChoice = null;
let freezeClicks = false;
let lines = []; // 存储当前绘制的线条
let gameStarted = false; // 游戏开始标志


// 在文件顶部，创建声音实例
const matchSound = new Audio('../res/sound/match.mp3');
const mismatchSound = new Audio('../res/sound/mismatch.mp3');
const victorySound = new Audio('../res/sound/victory.mp3');


// 定义图标
let icons = ["🍎", "🍌", "🍇", "🍉", "🍓", "🍒", "🍑", "🍍", "🥥", "🥝"];

// 更新最佳时间显示
bestTimeDisplay.textContent = bestTime;

// 定义难度设置
let difficultySettings = {
    easy: { gridSize: 4, iconSet: icons.slice(0, 8) }, // 简单难度较少图标
    medium: { gridSize: 5, iconSet: icons }, // 中等难度为全部图标
    hard: { gridSize: 6, iconSet: icons.concat(icons) } // 困难难度为更多图标
};

startButton.addEventListener('click', startGame);

// 页面加载时检查是否有存储的用户名
document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');  // 从localStorage获取用户名
    if (username) {
        document.getElementById('usernameDisplay').textContent = username;  // 显示用户名
    } else {
        // 如果没有找到用户名，重定向到登录页面
        window.location.href = '../login.html';
    }
});

// 退出函数
function returnToSelection() {
    // localStorage.removeItem('username');  // 移除存储的用户名
    window.location.href = '../game_selection.html';  // 跳转回选择页面
}

function startGame() {
    if(timer) {
        clearInterval(timer); // 清除现有的计时器
    }
    gameStarted = true;
    grid.innerHTML = '';  // 清空网格
    score = 0;  // 重置得分
    updateScore();
    let difficulty = difficultySelect.value;
    let { gridSize, iconSet } = difficultySettings[difficulty];
    grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`; // 根据难度调整网格大小
    let gameIcons = [...iconSet];  // 根据难度获取图标集
    gameIcons = gameIcons.length > gridSize * gridSize / 2 ? gameIcons.slice(0, gridSize * gridSize / 2) : gameIcons;
    gameIcons = [...gameIcons, ...gameIcons];  // 创建配对
    gameIcons.sort(() => 0.5 - Math.random());  // 随机排序

    gameIcons.forEach(icon => {
        let iconElement = document.createElement('div');
        iconElement.classList.add('grid-item');
        iconElement.textContent = icon;
        iconElement.dataset.icon = icon;
        iconElement.addEventListener('click', handleIconClick);
        grid.appendChild(iconElement);
    });

    startTime = new Date(); // 重置开始时间
    timer = setInterval(() => {
        let elapsedTime = Math.round((new Date() - startTime) / 1000);
        timeDisplay.textContent = elapsedTime.toString();
    }, 1000);
}

function updateTimer() {
    const now = new Date();
    const timeSpent = Math.round((now - startTime) / 1000);  // 计算用时（秒）
    timeDisplay.textContent = timeSpent.toString();
}

function drawLine(fromElement, toElement, isError = false) {
    const line = document.createElement('div');
    line.classList.add('line');
    if (isError) {
        line.classList.add('error');
    }

    // 获取方块和网格的位置信息
    const fromRect = fromElement.getBoundingClientRect();
    const toRect = toElement.getBoundingClientRect();
    const gridRect = grid.getBoundingClientRect();

    // 计算方块中心点的屏幕绝对位置
    const fromX = fromRect.left + fromRect.width / 2;
    const fromY = fromRect.top + fromRect.height / 2;
    const toX = toRect.left + toRect.width / 2;
    const toY = toRect.top + toRect.height / 2;

    // 计算起点和终点相对于网格的位置
    const lineX = fromX - gridRect.left;
    const lineY = fromY - gridRect.top;

    // 根据两点坐标计算连线的长度和角度
    const length = Math.sqrt((fromX - toX) ** 2 + (fromY - toY) ** 2);
    const angle = Math.atan2(toY - fromY, toX - fromX) * 180 / Math.PI;

    // 设置连线的位置、长度和角度
    line.style.width = `${length}px`;
    line.style.top = `${lineY}px`;
    line.style.left = `${lineX}px`;
    line.style.transform = `rotate(${angle}deg)`;
    line.style.transformOrigin = '0 0'; // 设置变换的原点为线条的起始点

    grid.appendChild(line);
    lines.push(line); // 将新创建的线条添加到数组中

    // 设置线条和图标同时消失
    setTimeout(() => {
        line.remove();
        lines = lines.filter(l => l !== line); // 从数组中移除
    }, 500);
}

function handleIconClick(event) {
    if (!gameStarted || freezeClicks) return;

    let target = event.currentTarget;
    target.classList.add('selected');

    if (!firstChoice) {
        firstChoice = target;
    } else {
        if (firstChoice.dataset.icon === target.dataset.icon) {
            // 匹配成功
            drawLine(firstChoice, target);
            score += 10;
            updateScore();
            // 如果匹配成功，播放匹配声音
            matchSound.play();

            setTimeout(() => {
                firstChoice.classList.add('removed');
                target.classList.add('removed');
                firstChoice = null;
                checkGameOver();
            }, 500);
        } else {
            // 匹配失败
            drawLine(firstChoice, target, true);
            freezeClicks = true;
            mismatchSound.play();
            setTimeout(() => {
                firstChoice.classList.remove('selected');
                target.classList.remove('selected');
                firstChoice = null;
                freezeClicks = false;
            }, 500);
        }
    }
}

function checkGameOver() {
    let unmatchedIcons = document.querySelectorAll('.grid-item:not(.removed)').length;
    if (unmatchedIcons === 0) {
        clearInterval(timer); // 停止计时器
        victorySound.play();
        let currentTime = parseInt(timeDisplay.textContent);
        updateBestTime(currentTime);
        gameStarted = false;
        startButton.disabled = false;
        alert(`恭喜你完成游戏！用时：${currentTime}秒，得分：${score}`);
    }
}

function updateBestTime(currentTime) {
    if (!bestTime || currentTime < bestTime) {
        bestTime = currentTime;
        bestTimeDisplay.textContent = bestTime.toString();
        localStorage.setItem("bestTime", bestTime); // 存储到localStorage
    }
}

function updateScore() {
    scoreDisplay.textContent = score.toString();
}

// 保证页面加载时不自动开始游戏
