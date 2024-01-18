// 注册函数
function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.text())
    .then(data => alert(data));
}

// 登录函数
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.text())
    .then(data => {
        alert(data);
        if (data === '{"username":"' + username + '"}') {
            // 如果登录成功
            localStorage.setItem('username', username);  // 存储用户名到localStorage
            window.location.href = 'game_selection.html';  // 跳转到游戏选择页面
        }
    });
}

// 退出登录函数
function logout() {
    localStorage.removeItem('username'); // 移除存储的用户名
    window.location.href = 'login.html'; // 跳转回登录页面
}