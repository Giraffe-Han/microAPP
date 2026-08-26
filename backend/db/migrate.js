require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const fs = require('fs');
const path = require('path');
const { USE_POSTGRES, ensureJsonStoreTable, query } = require('./pg');

// 与 storage.js 中的 JSON_KEYS / 文件映射保持一致
const DATA_KEYS = {
    users: path.join(__dirname, '..', 'users.json'),
    cases: path.join(__dirname, '..', 'cases.json'),
    case_categories: path.join(__dirname, '..', 'case_categories.json'),
    applications: path.join(__dirname, '..', 'data.json'),
    services_config: path.join(__dirname, '..', 'services_config.json'),
    reviews: path.join(__dirname, '..', 'reviews.json'),
    medical_orders: path.join(__dirname, '..', 'medical_orders.json'),
    medical_certifications: path.join(__dirname, '..', 'medical_certifications.json'),
    medical_pads: path.join(__dirname, '..', 'medical_pads.json'),
    medical_contacts: path.join(__dirname, '..', 'medical_contacts.json'),
    medical_ratings: path.join(__dirname, '..', 'medical_ratings.json'),
    medical_sms_logs: path.join(__dirname, '..', 'medical_sms_logs.json')
};

// services_config 是对象，其余都是数组
const OBJECT_KEYS = new Set(['services_config']);

function readJsonFile(filePath, fallback) {
    try {
        if (!fs.existsSync(filePath)) return fallback;
        const raw = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(raw);
    } catch (err) {
        console.error(`[migrate] Failed to read ${filePath}:`, err);
        return fallback;
    }
}

async function upsertJsonStore(key, data) {
    // pg 库会把 JS 数组序列化成 Postgres 数组字面量，导致 JSONB 解析失败，
    // 因此统一 JSON.stringify 后显式转换为 jsonb（单次序列化，不会存成字符串）
    await query(
        `
        INSERT INTO json_store (key, data, updated_at)
        VALUES ($1, $2::jsonb, NOW())
        ON CONFLICT (key)
        DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
        `,
        [key, JSON.stringify(data)]
    );
}

async function migrate() {
    if (!USE_POSTGRES) {
        console.error('[migrate] USE_POSTGRES is not enabled. Aborting.');
        process.exit(1);
    }

    await ensureJsonStoreTable();

    for (const [key, filePath] of Object.entries(DATA_KEYS)) {
        const fallback = OBJECT_KEYS.has(key) ? {} : [];
        const data = readJsonFile(filePath, fallback);
        await upsertJsonStore(key, data);
        const count = Array.isArray(data) ? `${data.length} 条` : '对象';
        console.log(`[migrate] ${key} -> 已写入 (${count})`);
    }

    console.log('[migrate] PostgreSQL json_store 迁移完成。');
    process.exit(0);
}

migrate().catch(err => {
    console.error('[migrate] Failed:', err);
    process.exit(1);
});

