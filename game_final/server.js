// 导入所需模块
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');

// 连接到MongoDB数据库
mongoose.connect('mongodb://localhost:27017/userDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));

// 定义用户模型
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});
const User = mongoose.model('User', userSchema);

// 创建Express应用
const app = express();
app.use(express.json());
app.use(cors());

// 提供静态文件服务，此处所有静态文件（HTML、CSS、JS等）都在项目根目录
app.use(express.static(path.join(__dirname, '/')));

// 注册新用户的路由
app.post('/register', async (req, res) => {
    try {
        // 检查用户是否已存在
        let user = await User.findOne({ username: req.body.username });
        if (user) return res.status(400).send('用户名已存在');

        // 对密码进行加密
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // 创建新用户
        user = new User({ username: req.body.username, password: hashedPassword });
        await user.save();

        res.send({ username: user.username }); // 发送用户名回客户端
    } catch (error) {
        res.status(500).send("注册过程中出现错误");
    }
});

// 用户登录的路由
app.post('/login', async (req, res) => {
    try {
        // 检查用户是否存在
        const user = await User.findOne({ username: req.body.username });
        if (!user) return res.status(400).send('用户名或密码不正确');

        // 检查密码是否正确
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).send('用户名或密码不正确');

        res.send({ username: user.username }); // 发送用户名回客户端
    } catch (error) {
        res.status(500).send("登录过程中出现错误");
    }
});

// 监听端口
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`服务器正在监听端口 ${port}...`));