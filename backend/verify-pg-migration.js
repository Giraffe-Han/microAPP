// 本地 PostgreSQL 迁移校验脚本：比对 JSON 源文件与 json_store 条数、检查 JSONB 类型、验证读取路径
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const fs = require('fs');
const path = require('path');
const { query } = require('./db/pg');

const DATA_KEYS = {
    users: 'users.json',
    cases: 'cases.json',
    case_categories: 'case_categories.json',
    applications: 'data.json',
    services_config: 'services_config.json',
    reviews: 'reviews.json',
    medical_orders: 'medical_orders.json',
    medical_certifications: 'medical_certifications.json',
    medical_pads: 'medical_pads.json',
    medical_contacts: 'medical_contacts.json',
    medical_ratings: 'medical_ratings.json',
    medical_sms_logs: 'medical_sms_logs.json'
};

function readSource(file, fallback) {
    const p = path.join(__dirname, file);
    if (!fs.existsSync(p)) return fallback;
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

async function main() {
    const result = await query('SELECT key, data, jsonb_typeof(data) AS type FROM json_store');
    const rows = new Map(result.rows.map(r => [r.key, r]));

    let failed = 0;
    for (const [key, file] of Object.entries(DATA_KEYS)) {
        const source = readSource(file, Array.isArray(file) ? [] : null);
        const row = rows.get(key);
        if (!row) {
            console.log(`FAIL ${key}: json_store 中缺少该 key`);
            failed++;
            continue;
        }

        const expectedType = Array.isArray(source) ? 'array' : 'object';
        const srcCount = Array.isArray(source) ? source.length : Object.keys(source).length;
        const dbCount = Array.isArray(row.data) ? row.data.length : Object.keys(row.data).length;
        const typeOk = row.type === expectedType && typeof row.data !== 'string';
        const countOk = srcCount === dbCount;

        console.log(
            `${typeOk && countOk ? 'OK  ' : 'FAIL'} ${key}: type=${row.type} 源=${srcCount} 库=${dbCount}`
        );
        if (!typeOk || !countOk) failed++;
    }

    // 中文内容抽样，确认编码正常
    const sample = await query(
        `SELECT data -> 0 ->> 'name' AS name FROM json_store WHERE key = 'case_categories'`
    );
    console.log('中文抽样(case_categories[0].name):', sample.rows[0] && sample.rows[0].name);

    console.log(failed === 0 ? '\n全部校验通过' : `\n校验失败项: ${failed}`);
    process.exit(failed === 0 ? 0 : 1);
}

main().catch(err => {
    console.error('校验脚本执行失败:', err);
    process.exit(1);
});
