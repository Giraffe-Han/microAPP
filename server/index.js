const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const multer = require('multer'); // Import multer
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000; //读取 process.env.PORT
const DB_FILE = path.join(__dirname, 'data.json');
const CASES_FILE = path.join(__dirname, 'cases.json');
const USERS_FILE = path.join(__dirname, 'users.json');
const SERVICES_CONFIG_FILE = path.join(__dirname, 'services_config.json');
const JWT_SECRET = process.env.JWT_SECRET || 'low-altitude-platform-secret';
const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || '30m';
const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL || '7d';
const SUPER_ADMIN_PHONE = process.env.SUPER_ADMIN_PHONE || 'wzdkjjfzyxgs';

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

function getClientIp(req) {
    const xf = req.headers['x-forwarded-for'];
    let ip =
        (typeof xf === 'string' && xf.split(',')[0].trim()) ||
        (Array.isArray(xf) && xf[0]) ||
        req.socket?.remoteAddress ||
        req.ip ||
        '';
    if (ip.startsWith('::ffff:')) ip = ip.slice(7);
    return ip;
}

function hashToSeed(str) {
    // FNV-1a 32-bit
    let h = 2166136261;
    const s = String(str || '');
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

function sanitizeUser(user) {
    if (!user) return null;
    const { password, passwordHash, refreshToken, refreshTokenExpiresAt, ...safe } = user;
    return safe;
}

function generateTokens(user) {
    const accessToken = jwt.sign(
        { sub: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_TTL }
    );
    const refreshToken = jwt.sign(
        { sub: user.id, type: 'refresh' },
        JWT_SECRET,
        { expiresIn: REFRESH_TOKEN_TTL }
    );
    const decoded = jwt.decode(refreshToken) || {};
    return {
        accessToken,
        refreshToken,
        refreshTokenExpiresAt: decoded.exp ? decoded.exp * 1000 : null
    };
}

function findUserById(userId) {
    const users = readUsersDB();
    return users.find(u => u.id === userId);
}

function authRequired(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!token) {
        return res.status(401).json({ success: false, message: '未登录或登录已过期' });
    }
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const user = findUserById(payload.sub);
        if (!user) {
            return res.status(401).json({ success: false, message: '用户不存在或登录已失效' });
        }
        req.user = sanitizeUser(user);
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: '登录已过期，请重新登录' });
    }
}

function authOptional(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!token) {
        return next();
    }
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const user = findUserById(payload.sub);
        if (user) {
            req.user = sanitizeUser(user);
        }
    } catch (err) {
        // ignore invalid token for optional auth
    }
    next();
}

function roleRequired(roles = []) {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: '未登录或登录已过期' });
        }
        if (!roles.includes(user.role)) {
            return res.status(403).json({ success: false, message: '无权限访问' });
        }
        next();
    };
}

async function verifyUserPassword(user, inputPassword) {
    if (!user || !inputPassword) return false;
    if (user.passwordHash) {
        return bcrypt.compare(inputPassword, user.passwordHash);
    }
    return user.password === inputPassword;
}

// Client IP helper (LAN testing / 分发)
app.get('/api/client-ip', (req, res) => {
    const ip = getClientIp(req);
    res.json({ success: true, ip });
});

// Game assignment based on IP (seed + bucket for future sharding)
app.get('/api/games/assign', (req, res) => {
    const ip = getClientIp(req);
    const seed = hashToSeed(ip || 'unknown');
    res.json({
        success: true,
        ip,
        playerKey: ip || 'unknown',
        seed,
        bucket: seed % 4,
        assignedAt: new Date().toISOString()
    });
});

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'public/uploads');
        if (!fs.existsSync(uploadDir)){
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Upload Endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const fileUrl = '/uploads/' + req.file.filename;
    res.json({ success: true, url: fileUrl });
});

// Initialize DB
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

// Initialize Services Config
if (!fs.existsSync(SERVICES_CONFIG_FILE)) {
    // Robust default: avoid require() when file doesn't exist
    // 服务配置由后台管理页维护，缺省为空对象也可运行
    fs.writeFileSync(SERVICES_CONFIG_FILE, JSON.stringify({}, null, 2));
}

// Initialize Users DB
if (!fs.existsSync(USERS_FILE)) {
    const defaultUsers = [
        {
            id: '1',
            phone: 'wzdkjjfzyxgs',
            password: 'admin', // legacy plain text (kept for compatibility)
            passwordHash: bcrypt.hashSync('admin', 10),
            name: 'wzdkjjfzyxgs',
            role: 'admin',
            avatar: '',
            createTime: new Date().toISOString()
        }
    ];
    fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
}

// Ensure DSL admin and standard admin exist (Patch)
function ensureAdminUsers() {
    let users = readUsersDB();
    let modified = false;

    const superAdminIndex = users.findIndex(u => u.phone === SUPER_ADMIN_PHONE);
    if (superAdminIndex === -1) {
        users.push({
            id: randomUUID(),
            phone: SUPER_ADMIN_PHONE,
            password: 'admin',
            passwordHash: bcrypt.hashSync('admin', 10),
            name: SUPER_ADMIN_PHONE,
            role: 'admin',
            avatar: '',
            createTime: new Date().toISOString()
        });
        modified = true;
    } else if (users[superAdminIndex].role !== 'admin') {
        users[superAdminIndex].role = 'admin';
        modified = true;
    }

    // Check DSLadmin
    if (!users.find(u => u.phone === 'DSLadmin')) {
        users.push({
            id: 'dsl_admin_id',
            phone: 'DSLadmin',
            password: 'dkjjfwy2026DSL', // legacy plain text (kept for compatibility)
            passwordHash: bcrypt.hashSync('dkjjfwy2026DSL', 10),
            name: 'DSL管理员',
            role: 'dsl_admin',
            avatar: '',
            createTime: new Date().toISOString()
        });
        modified = true;
    }

    // Ensure existing admins have passwordHash
    users = users.map(user => {
        if (user.role && !user.passwordHash && user.password) {
            modified = true;
            return { ...user, passwordHash: bcrypt.hashSync(user.password, 10) };
        }
        return user;
    });

    if (modified) {
        writeUsersDB(users);
        console.log('Admin users patched/ensured.');
    }
}

// Initialize Cases DB with default data if not exists
if (!fs.existsSync(CASES_FILE)) {
    const defaultCases = [
      {
        id: 1,
        categoryId: 1,
        title: '公园外卖空投服务',
        description: '深圳中心公园无人机外卖航线，10分钟极速送达，空投肯德基、奈雪等千种商品',
        service: '无人机物流服务',
        location: '深圳市中心公园',
        date: '2024-12-15',
        views: '1.2k',
        coverType: 'image',
        cover: 'https://wenzhoumall-prod.oss-cn-shanghai.aliyuncs.com/test/shop/20250930/0fa02eb2dc8b4a6382784fedc0b44dc0.jpg?Expires=3337231191&OSSAccessKeyId=LTAI5tSbLByCMG16D3eoErCU&Signature=Zk8QXbZAJhw08908Er3iuy9dKg0%3D',
        media: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800' },
          { type: 'video', url: 'https://videos.pexels.com/video-files/3045163/3045163-hd_1920_1080_24fps.mp4', poster: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800' }
        ],
        fullDescription: '联合丰翼科技、美团无人机等企业，在深圳中心公园开通无人机外卖配送航线。以深业上城为起点，最快10分钟即可将肯德基、奈雪的茶等超千种商品“空投”至公园内指定接收柜。解决了公园内点外卖难、定位不准、配送慢等痛点，为市民提供“从天而降”的便捷服务体验。',
        highlights: [
          '10分钟极速送达，效率提升300%',
          '精准定位空投柜，取餐更方便',
          '覆盖肯德基、奈雪等千种商品',
          '无接触配送，科技感十足'
        ]
      },
      {
        id: 4,
        categoryId: 4,
        title: '山区基站设备吊装',
        description: '偏远山区通信基站设备吊装，解决传统吊装无法到达的难题',
        service: '无人机吊运服务',
        location: '四川省凉山州',
        date: '2024-09-15',
        views: '1.8k',
        coverType: 'video',
        cover: '/video/lift1.mp4',
        media: [
          { type: 'video', url: '/video/lift1.mp4' },
          { type: 'video', url: '/video/lift2.mp4' },
          { type: 'video', url: '/video/lift3.mp4' }
        ],
        fullDescription: '在海拔3000米的偏远山区，道路崎岖，传统吊装设备无法到达。使用大型吊运无人机，成功将重达50kg的基站设备运送至指定位置并完成安装。',
        highlights: [
          '突破地形限制，吊运能力强',
          '精准定位，误差小于10cm',
          '降低成本40%，缩短工期60%',
          '零安全事故，施工人员零风险'
        ]
      }
    ];
    fs.writeFileSync(CASES_FILE, JSON.stringify(defaultCases, null, 2));
}

// Helper to read DB
const readDB = () => {
    try {
        const data = fs.readFileSync(DB_FILE);
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading DB:", err);
        return [];
    }
};

// Helper to read Cases DB
const readCasesDB = () => {
    try {
        const data = fs.readFileSync(CASES_FILE);
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading Cases DB:", err);
        return [];
    }
};

// Helper to read Users DB
const readUsersDB = () => {
    try {
        const data = fs.readFileSync(USERS_FILE);
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading Users DB:", err);
        return [];
    }
};

// Helper to read Services Config
const readServicesConfig = () => {
    try {
        if (!fs.existsSync(SERVICES_CONFIG_FILE)) return {};
        const data = fs.readFileSync(SERVICES_CONFIG_FILE);
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading Services Config:", err);
        return {};
    }
};

// Helper to write Services Config
const writeServicesConfig = (data) => {
    try {
        fs.writeFileSync(SERVICES_CONFIG_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error("Error writing Services Config:", err);
        return false;
    }
};

// Helper to write Users DB
const writeUsersDB = (data) => {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error("Error writing Users DB:", err);
        return false;
    }
};

// Helper to write DB
const writeDB = (data) => {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error("Error writing DB:", err);
        return false;
    }
};

// Helper to write Cases DB
const writeCasesDB = (data) => {
    try {
        fs.writeFileSync(CASES_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error("Error writing Cases DB:", err);
        return false;
    }
};

async function handleLogin(req, res) {
    try {
        const { phone, username, password } = req.body || {};
        const loginId = (phone || username || '').trim();
        if (!loginId || !password) {
            return res.status(400).json({ success: false, message: '账号或密码不能为空' });
        }
        const users = readUsersDB();
        const user = users.find(u => u.phone === loginId || u.username === loginId);
        const isValid = await verifyUserPassword(user, password);
        if (!user || !isValid) {
            return res.status(401).json({ success: false, message: '账号或密码错误' });
        }

        // Upgrade legacy users to hashed password
        if (!user.passwordHash) {
            user.passwordHash = await bcrypt.hash(password, 10);
            user.password = user.password || '';
            writeUsersDB(users);
        }

        const tokens = generateTokens(user);
        const updatedUsers = users.map(u => {
            if (u.id === user.id) {
                return { ...u, refreshToken: tokens.refreshToken, refreshTokenExpiresAt: tokens.refreshTokenExpiresAt };
            }
            return u;
        });
        writeUsersDB(updatedUsers);

        res.json({ success: true, user: sanitizeUser(user), ...tokens });
    } catch (err) {
        console.error('[login] failed:', err);
        res.status(500).json({ success: false, message: '登录服务异常', detail: err?.message || 'unknown' });
    }
}

// Login Endpoint (legacy)
app.post('/api/login', handleLogin);

// Auth Login Endpoint
app.post('/api/auth/login', handleLogin);

// Register Endpoint (legacy)
app.post('/api/register', async (req, res) => {
    const { phone, password, name } = req.body || {};
    const users = readUsersDB();
    if (!phone || !password) {
        return res.status(400).json({ success: false, message: '手机号或密码不能为空' });
    }
    if (users.find(u => u.phone === phone)) {
        return res.status(400).json({ success: false, message: '用户已存在' });
    }

    const newUser = {
        id: randomUUID(),
        phone,
        password: '', // do not keep plain text
        passwordHash: await bcrypt.hash(password, 10),
        name: name || `User${phone.slice(-4)}`,
        role: 'user',
        avatar: '',
        createTime: new Date().toISOString()
    };

    users.push(newUser);
    if (writeUsersDB(users)) {
        const tokens = generateTokens(newUser);
        const updatedUsers = users.map(u => {
            if (u.id === newUser.id) {
                return { ...u, refreshToken: tokens.refreshToken, refreshTokenExpiresAt: tokens.refreshTokenExpiresAt };
            }
            return u;
        });
        writeUsersDB(updatedUsers);
        res.json({ success: true, user: sanitizeUser(newUser), ...tokens });
    } else {
        res.status(500).json({ success: false, message: 'Failed to create user' });
    }
});

// Auth Register Endpoint
app.post('/api/auth/register', async (req, res) => {
    const { phone, password, name } = req.body || {};
    const users = readUsersDB();
    if (!phone || !password) {
        return res.status(400).json({ success: false, message: '手机号或密码不能为空' });
    }
    if (users.find(u => u.phone === phone)) {
        return res.status(400).json({ success: false, message: '用户已存在' });
    }

    const newUser = {
        id: randomUUID(),
        phone,
        password: '',
        passwordHash: await bcrypt.hash(password, 10),
        name: name || `User${phone.slice(-4)}`,
        role: 'user',
        avatar: '',
        createTime: new Date().toISOString()
    };

    users.push(newUser);
    if (writeUsersDB(users)) {
        const tokens = generateTokens(newUser);
        const updatedUsers = users.map(u => {
            if (u.id === newUser.id) {
                return { ...u, refreshToken: tokens.refreshToken, refreshTokenExpiresAt: tokens.refreshTokenExpiresAt };
            }
            return u;
        });
        writeUsersDB(updatedUsers);
        res.json({ success: true, user: sanitizeUser(newUser), ...tokens });
    } else {
        res.status(500).json({ success: false, message: 'Failed to create user' });
    }
});

// Auth Me
app.get('/api/auth/me', authRequired, (req, res) => {
    res.json({ success: true, user: req.user });
});

// Auth Refresh
app.post('/api/auth/refresh', (req, res) => {
    const { refreshToken } = req.body || {};
    if (!refreshToken) {
        return res.status(400).json({ success: false, message: '缺少 refresh token' });
    }
    let payload;
    try {
        payload = jwt.verify(refreshToken, JWT_SECRET);
    } catch (err) {
        return res.status(401).json({ success: false, message: 'refresh token 无效或已过期' });
    }
    if (payload.type !== 'refresh') {
        return res.status(401).json({ success: false, message: 'refresh token 类型不正确' });
    }

    const users = readUsersDB();
    const user = users.find(u => u.id === payload.sub);
    if (!user || user.refreshToken !== refreshToken) {
        return res.status(401).json({ success: false, message: 'refresh token 无效' });
    }

    const accessToken = jwt.sign(
        { sub: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_TTL }
    );
    res.json({ success: true, accessToken });
});

// Auth Logout
app.post('/api/auth/logout', authRequired, (req, res) => {
    const users = readUsersDB();
    const updatedUsers = users.map(u => {
        if (u.id === req.user.id) {
            return { ...u, refreshToken: '', refreshTokenExpiresAt: null };
        }
        return u;
    });
    writeUsersDB(updatedUsers);
    res.json({ success: true });
});

// Update User Profile
app.post('/api/user/update', authRequired, (req, res) => {
    const { id, name, avatar, phone } = req.body || {};
    if (req.user.role !== 'admin' && req.user.id !== id) {
        return res.status(403).json({ success: false, message: '无权限修改该用户' });
    }
    let users = readUsersDB();
    const index = users.findIndex(u => u.id === id);

    if (index !== -1) {
        users[index] = { ...users[index], name, avatar, phone }; // Keep role and password intact for now
        if (writeUsersDB(users)) {
            const { password, ...userInfo } = users[index];
            res.json({ success: true, user: userInfo });
        } else {
            res.status(500).json({ success: false, message: 'Failed to update user' });
        }
    } else {
        res.status(404).json({ success: false, message: 'User not found' });
    }
});

// Get Users (Admin only)
app.get('/api/users', authRequired, roleRequired(['admin', 'dsl_admin']), (req, res) => {
    const users = readUsersDB();
    const safeUsers = users.map(u => sanitizeUser(u));
    res.json(safeUsers);
});

// Update User Role
app.post('/api/user/role', authRequired, roleRequired(['admin']), (req, res) => {
    const { id, role } = req.body || {};
    let users = readUsersDB();
    const index = users.findIndex(u => u.id === id);

    if (index !== -1) {
        const requester = req.user;
        const target = users[index];
        const allowedRoles = ['user', 'admin', 'dsl_admin'];

        if (requester.phone !== SUPER_ADMIN_PHONE) {
            return res.status(403).json({ success: false, message: '仅超级管理员可调整权限' });
        }
        if (target.phone === SUPER_ADMIN_PHONE) {
            return res.status(400).json({ success: false, message: '超级管理员权限不可修改' });
        }
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ success: false, message: '非法角色' });
        }

        users[index].role = role;
        if (writeUsersDB(users)) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, message: 'Failed to update user role' });
        }
    } else {
        res.status(404).json({ success: false, message: 'User not found' });
    }
});

// Study Showcase (merged into services config for ID 9)
app.get('/api/study/showcase', (req, res) => {
    const config = readServicesConfig();
    const data = config['9']?.studyShowcase || [];
    res.json({ success: true, data });
});

app.post('/api/study/showcase', (req, res) => {
    const { items } = req.body || {};
    if (!Array.isArray(items)) {
        return res.status(400).json({ success: false, message: 'items must be an array' });
    }

    const config = readServicesConfig();
    if (!config['9']) config['9'] = {};
    
    config['9'].studyShowcase = items
        .filter(it => it && typeof it === 'object')
        .map(it => ({
            title: String(it.title || '').trim(),
            desc: String(it.desc || '').trim(),
            image: String(it.image || '').trim()
        }))
        .filter(it => it.title || it.desc || it.image);

    if (writeServicesConfig(config)) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false, message: 'Failed to save showcase' });
    }
});

// Services Config (All text editable)
app.get('/api/services/config', (req, res) => {
    const config = readServicesConfig();
    res.json({ success: true, data: config });
});

app.post('/api/services/config', authRequired, roleRequired(['admin', 'dsl_admin']), (req, res) => {
    const { config } = req.body;
    if (!config || typeof config !== 'object') {
        return res.status(400).json({ success: false, message: 'Invalid config' });
    }

    if (writeServicesConfig(config)) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false, message: 'Failed to save services config' });
    }
});

// Submit Application
app.post('/api/submit', authOptional, (req, res) => {
    const application = req.body;
    if (req.user && !application.userId) {
        application.userId = req.user.id;
    }
    application.id = Date.now().toString(); // Simple ID
    application.createTime = new Date().toISOString(); // Server timestamp

    const db = readDB();
    db.push(application);
    writeDB(db);

    res.json({ success: true, message: 'Application submitted successfully', id: application.id });
});

// Update Application Status
app.post('/api/update', (req, res) => {
    const { id, status } = req.body;
    let db = readDB();
    const index = db.findIndex(item => item.id == id);

    if (index !== -1) {
        db[index].status = status;
        if (writeDB(db)) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, message: 'Failed to write to database' });
        }
    } else {
        res.status(404).json({ success: false, message: 'Application not found' });
    }
});

// Get Applications (with optional filtering)
app.get('/api/list', authRequired, (req, res) => {
    const { startDate, endDate } = req.query;
    let db = readDB();

    const role = req.user?.role;
    const userId = req.user?.id;

    // DSL管理员权限：仅支持查阅管理无人机赛事(ID 13)信息
    if (role === 'dsl_admin') {
        db = db.filter(item => item.serviceId === '13');
    } else if (userId && role !== 'admin') {
        // Filter by User ID if provided (for regular users)
        db = db.filter(item => item.userId === userId);
    }

    if (startDate || endDate) {
        db = db.filter(item => {
            const itemDate = new Date(item.createTime).getTime();
            const start = startDate ? new Date(startDate).getTime() : 0;
            const end = endDate ? new Date(endDate).getTime() : Infinity;
            return itemDate >= start && itemDate <= end;
        });
    }

    // Sort by newest first
    db.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));

    res.json(db);
});

// Export to Excel
app.get('/api/export', authRequired, roleRequired(['admin', 'dsl_admin']), (req, res) => {
    const { startDate, endDate, ids } = req.query;
    let db = readDB();
    const role = req.user?.role;

    // DSL管理员权限过滤
    if (role === 'dsl_admin') {
        db = db.filter(item => item.serviceId === '13');
    }

    // 如果指定了IDS，则只导出选中的项
    if (ids) {
        const idList = ids.split(',');
        db = db.filter(item => idList.includes(item.id.toString()));
    } else if (startDate || endDate) {
        db = db.filter(item => {
            const itemDate = new Date(item.createTime).getTime();
            const start = startDate ? new Date(startDate).getTime() : 0;
            const end = endDate ? new Date(endDate).getTime() : Infinity;
            return itemDate >= start && itemDate <= end;
        });
    }
    
    // Flatten data for Excel
    const excelData = db.map(item => {
        const baseData = {
            ID: item.id,
            提交时间: new Date(item.createTime).toLocaleString(),
            服务名称: item.serviceName || '',
            状态: item.status || '待处理'
        };

        if (item.serviceId === '13') {
            return {
                ...baseData,
                注册号: item.regNo || '',
                注册角色: item.competitionRoleText || '',
                单位名称: item.companyName || '',
                姓名: item.name || '',
                性别: item.gender === 'male' ? '男' : '女',
                证件号: item.idCard || '',
                组别: item.competitionGroup || item.athleteGroup || '',
                参赛项目: item.competitionProject || '',
                联系电话: item.phone || item.managerPhone || item.contactPhone || '',
                电子邮箱: item.email || '',
                所在地: item.location || '',
                等级: item.level || '',
                有效期: item.validDate || '',
                负责人: item.manager || '',
                主要对接人: item.contactPerson || '',
                备注: item.remark || ''
            };
        }

        return {
            ...baseData,
            联系人: item.contactName || '',
            联系电话: item.contactPhone || '',
            学员姓名: item.traineeName || '',
            学员电话: item.traineePhone || '',
            性别: item.traineeGender === 'male' ? '男' : (item.traineeGender === 'female' ? '女' : ''),
            身份证号: item.traineeIdCard || '',
            考试机型: item.examModel || '',
            证照级别: item.licenseLevel || '',
            客户类型: item.customerType === 'enterprise' ? '企业' : '个人',
            企业名称: item.companyName || '',
            货物类型: item.cargoType || '',
            起运地: item.startAddress || '',
            目的地: item.endAddress || ''
        };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, "Applications");

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', `attachment; filename="export_${Date.now()}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
});

// Get Cases (with pagination)
app.get('/api/cases', (req, res) => {
    let cases = readCasesDB();
    const { categoryId, page, limit } = req.query;

    // Filter by category
    if (categoryId && categoryId !== '0') {
        cases = cases.filter(c => c.categoryId == categoryId);
    }

    // Sort newest first
    cases.sort((a, b) => new Date(b.date) - new Date(a.date)); // Assuming date field or createTime. Existing code didn't sort explicitly but it's good practice. Or use 'id' which is timestamp.
    // Actually existing code didn't sort cases.json. I'll sort by id (timestamp) descending.
    cases.sort((a, b) => b.id - a.id);

    if (page && limit) {
        const p = parseInt(page);
        const l = parseInt(limit);
        const start = (p - 1) * l;
        const end = start + l;
        const paginated = cases.slice(start, end);
        res.json({
            data: paginated,
            total: cases.length,
            page: p,
            limit: l
        });
    } else {
        res.json(cases);
    }
});

// Create Case
app.post('/api/cases/create', (req, res) => {
    const newCase = req.body;
    newCase.id = Date.now(); // Simple ID generation
    let cases = readCasesDB();
    cases.unshift(newCase); // Add to top
    if (writeCasesDB(cases)) {
        res.json({ success: true, id: newCase.id });
    } else {
        res.status(500).json({ success: false, message: 'Failed to create case' });
    }
});

// Update Case
app.post('/api/cases/update', (req, res) => {
    const updatedCase = req.body;
    let cases = readCasesDB();
    const index = cases.findIndex(c => c.id == updatedCase.id);

    if (index !== -1) {
        cases[index] = { ...cases[index], ...updatedCase };
        if (writeCasesDB(cases)) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, message: 'Failed to write to database' });
        }
    } else {
        // Optional: Add new case if not found, or return 404. For now, let's assume editing existing.
        // But user might want to add cases later. Let's support simple update for now.
        res.status(404).json({ success: false, message: 'Case not found' });
    }
});

// Delete Case
app.post('/api/cases/delete', (req, res) => {
    const { id } = req.body;
    let cases = readCasesDB();
    const index = cases.findIndex(c => c.id == id);

    if (index !== -1) {
        cases.splice(index, 1);
        if (writeCasesDB(cases)) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, message: 'Failed to write to database' });
        }
    } else {
        res.status(404).json({ success: false, message: 'Case not found' });
    }
});

// Handle SPA routing: Serve index.html for all non-API routes
app.get('*', (req, res) => {
    // If it's an API request that wasn't handled above, return 404
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ success: false, message: 'API not found' });
    }
    
    // If it looks like a static file (has extension) but wasn't found in public/, return 404
    // This prevents returning index.html for missing js/css files
    if (req.path.includes('.')) {
        return res.status(404).send('Not Found');
    }

    // Otherwise serve index.html for client-side routing (Vue Router)
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    ensureAdminUsers();
    console.log('Server is running on http://localhost:' + PORT);
});
