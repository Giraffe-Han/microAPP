const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const multer = require('multer'); // Import multer

const app = express();
const PORT = process.env.PORT || 3000; //读取 process.env.PORT
const DB_FILE = path.join(__dirname, 'data.json');
const CASES_FILE = path.join(__dirname, 'cases.json');
const USERS_FILE = path.join(__dirname, 'users.json');

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

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

// Initialize Users DB
if (!fs.existsSync(USERS_FILE)) {
    const defaultUsers = [
        {
            id: '1',
            phone: 'wzdkjjfzyxgs',
            password: 'admin', // Plain text for demo
            name: 'wzdkjjfzyxgs',
            role: 'admin',
            avatar: '',
            createTime: new Date().toISOString()
        }
    ];
    fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
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

// Login Endpoint
app.post('/api/login', (req, res) => {
    const { phone, password } = req.body;
    const users = readUsersDB();
    const user = users.find(u => u.phone === phone && u.password === password);

    if (user) {
        // In a real app, generate a token here
        const { password, ...userInfo } = user;
        res.json({ success: true, user: userInfo });
    } else {
        res.status(401).json({ success: false, message: 'Invalid phone or password' });
    }
});

// Register Endpoint
app.post('/api/register', (req, res) => {
    const { phone, password, name } = req.body;
    const users = readUsersDB();
    
    if (users.find(u => u.phone === phone)) {
        return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const newUser = {
        id: Date.now().toString(),
        phone,
        password,
        name: name || `User${phone.slice(-4)}`,
        role: 'user',
        avatar: '',
        createTime: new Date().toISOString()
    };

    users.push(newUser);
    if (writeUsersDB(users)) {
        const { password, ...userInfo } = newUser;
        res.json({ success: true, user: userInfo });
    } else {
        res.status(500).json({ success: false, message: 'Failed to create user' });
    }
});

// Update User Profile
app.post('/api/user/update', (req, res) => {
    const { id, name, avatar, phone } = req.body;
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

// Get Users (Admin only usually, but simplified here)
app.get('/api/users', (req, res) => {
    const users = readUsersDB();
    const safeUsers = users.map(({ password, ...u }) => u); // Exclude password
    res.json(safeUsers);
});

// Update User Role
app.post('/api/user/role', (req, res) => {
    const { id, role } = req.body;
    let users = readUsersDB();
    const index = users.findIndex(u => u.id === id);

    if (index !== -1) {
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

// Submit Application
app.post('/api/submit', (req, res) => {
    const application = req.body;
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
    const index = db.findIndex(item => item.id === id);

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
app.get('/api/list', (req, res) => {
    const { startDate, endDate, userId } = req.query;
    let db = readDB();

    // Filter by User ID if provided
    if (userId) {
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
app.get('/api/export', (req, res) => {
    const { startDate, endDate } = req.query;
    let db = readDB();

    if (startDate || endDate) {
        db = db.filter(item => {
            const itemDate = new Date(item.createTime).getTime();
            const start = startDate ? new Date(startDate).getTime() : 0;
            const end = endDate ? new Date(endDate).getTime() : Infinity;
            return itemDate >= start && itemDate <= end;
        });
    }
    
    // Flatten data for Excel (handle nested objects if any, or just dump)
    const excelData = db.map(item => {
        // Basic flattening for common fields
        return {
            ID: item.id,
            提交时间: new Date(item.createTime).toLocaleString(),
            服务名称: item.serviceName || '',
            联系人: item.contactName || '',
            联系电话: item.contactPhone || '',
            // 培训服务字段
            学员姓名: item.traineeName || '',
            学员电话: item.traineePhone || '',
            性别: item.traineeGender === 'male' ? '男' : (item.traineeGender === 'female' ? '女' : ''),
            出生日期: item.traineeBirthday || '',
            身份证号: item.traineeIdCard || '',
            考试机型: item.examModel || '',
            证照级别: item.licenseLevel || '',
            有无基础: item.hasExperience === 'yes' ? '有' : (item.hasExperience === 'no' ? '无' : ''),
            // 物流服务字段
            客户类型: item.customerType === 'enterprise' ? '企业' : '个人',
            企业名称: item.companyName || '',
            货物类型: item.cargoType || '',
            货物重量: item.cargoWeight || '',
            起运地: item.startAddress || '',
            目的地: item.endAddress || '',
            状态: '待处理' // Default status
        };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, "Applications");

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="applications.xlsx"');
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
    const index = cases.findIndex(c => c.id === updatedCase.id);

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
    console.log(`Server is running on http://localhost:${PORT}`);
});
