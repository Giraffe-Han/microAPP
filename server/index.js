const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(bodyParser.json());

// Initialize DB
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([]));
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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
