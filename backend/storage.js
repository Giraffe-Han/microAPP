const fs = require('fs');
const path = require('path');
const { USE_POSTGRES, ensureJsonStoreTable, query } = require('./db/pg');
const { cache, CacheKeys } = require('./cache');
const { logger } = require('./logger');

const DB_FILE = path.join(__dirname, 'data.json');
const CASES_FILE = path.join(__dirname, 'cases.json');
const CASE_CATEGORIES_FILE = path.join(__dirname, 'case_categories.json');
const USERS_FILE = path.join(__dirname, 'users.json');
const SERVICES_CONFIG_FILE = path.join(__dirname, 'services_config.json');
const REVIEWS_FILE = path.join(__dirname, 'reviews.json');

const JSON_KEYS = {
    applications: 'applications',
    cases: 'cases',
    case_categories: 'case_categories',
    users: 'users',
    services_config: 'services_config',
    reviews: 'reviews'
};

function readJsonFile(filePath, fallback) {
    try {
        if (!fs.existsSync(filePath)) return fallback;
        const data = fs.readFileSync(filePath);
        return JSON.parse(data);
    } catch (err) {
        logger.error(`Error reading ${filePath}`, { error: err.message });
        return fallback;
    }
}

function writeJsonFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        logger.error(`Error writing ${filePath}`, { error: err.message });
        return false;
    }
}

async function initStorage() {
    if (USE_POSTGRES) {
        await ensureJsonStoreTable();
        return;
    }

    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify([]));
    }
    if (!fs.existsSync(CASES_FILE)) {
        fs.writeFileSync(CASES_FILE, JSON.stringify([]));
    }
    if (!fs.existsSync(CASE_CATEGORIES_FILE)) {
        // 默认分类（兼容历史数据的 categoryId）
        const defaultCats = [
            { id: 1, name: '无人机物流', service: '无人机物流服务' },
            { id: 4, name: '无人机吊运', service: '无人机吊运服务' },
            { id: 5, name: '无人机表演', service: '航空表演' }
        ];
        fs.writeFileSync(CASE_CATEGORIES_FILE, JSON.stringify(defaultCats, null, 2));
    }
    if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, JSON.stringify([]));
    }
    if (!fs.existsSync(SERVICES_CONFIG_FILE)) {
        fs.writeFileSync(SERVICES_CONFIG_FILE, JSON.stringify({}, null, 2));
    }
    if (!fs.existsSync(REVIEWS_FILE)) {
        fs.writeFileSync(REVIEWS_FILE, JSON.stringify([]));
    }
}

async function readJsonStore(key, fallback) {
    if (!USE_POSTGRES) {
        switch (key) {
            case JSON_KEYS.users:
                return readJsonFile(USERS_FILE, fallback);
            case JSON_KEYS.cases:
                return readJsonFile(CASES_FILE, fallback);
            case JSON_KEYS.case_categories:
                return readJsonFile(CASE_CATEGORIES_FILE, fallback);
            case JSON_KEYS.services_config:
                return readJsonFile(SERVICES_CONFIG_FILE, fallback);
            case JSON_KEYS.applications:
                return readJsonFile(DB_FILE, fallback);
            case JSON_KEYS.reviews:
                return readJsonFile(REVIEWS_FILE, fallback);
            default:
                return fallback;
        }
    }

    const result = await query('SELECT data FROM json_store WHERE key = $1', [key]);
    if (!result.rows.length) return fallback;
    
    let data = result.rows[0].data;
    
    // Handle potentially double-serialized data (stored as JSON string instead of JSONB)
    // This can happen if data was previously stored with JSON.stringify()
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data);
        } catch (e) {
            console.error(`[storage] Failed to parse data for key ${key}:`, e);
            return fallback;
        }
    }
    
    return data;
}

async function writeJsonStore(key, data) {
    if (!USE_POSTGRES) {
        switch (key) {
            case JSON_KEYS.users:
                return writeJsonFile(USERS_FILE, data);
            case JSON_KEYS.cases:
                return writeJsonFile(CASES_FILE, data);
            case JSON_KEYS.case_categories:
                return writeJsonFile(CASE_CATEGORIES_FILE, data);
            case JSON_KEYS.services_config:
                return writeJsonFile(SERVICES_CONFIG_FILE, data);
            case JSON_KEYS.applications:
                return writeJsonFile(DB_FILE, data);
            case JSON_KEYS.reviews:
                return writeJsonFile(REVIEWS_FILE, data);
            default:
                return false;
        }
    }

    // Pass data directly to pg library - it handles JSONB serialization automatically
    // Note: pg library converts JS objects/arrays to JSON for JSONB columns
    await query(
        `
        INSERT INTO json_store (key, data, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (key)
        DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
        `,
        [key, data]
    );
    return true;
}

async function readUsersDB() {
    // 使用缓存,60秒过期
    return cache.getOrSet(CacheKeys.USERS, () => readJsonStore(JSON_KEYS.users, []), 60 * 1000);
}

async function writeUsersDB(data) {
    cache.delete(CacheKeys.USERS); // 清除缓存
    return writeJsonStore(JSON_KEYS.users, data);
}

async function readCasesDB() {
    // 案例数据变化不频繁,缓存5分钟
    return cache.getOrSet(CacheKeys.CASES, () => readJsonStore(JSON_KEYS.cases, []), 5 * 60 * 1000);
}

async function writeCasesDB(data) {
    cache.delete(CacheKeys.CASES);
    return writeJsonStore(JSON_KEYS.cases, data);
}

async function readCaseCategoriesDB() {
    // 分类数据基本不变,缓存10分钟
    const defaults = [
        { id: 1, name: '无人机物流', service: '无人机物流服务' },
        { id: 4, name: '无人机吊运', service: '无人机吊运服务' },
        { id: 5, name: '无人机表演', service: '航空表演' }
    ];
    return cache.getOrSet(
        CacheKeys.CASE_CATEGORIES,
        async () => {
            const data = await readJsonStore(JSON_KEYS.case_categories, null);
            if (Array.isArray(data) && data.length) return data;
            // 若为空则写入默认分类并返回
            await writeJsonStore(JSON_KEYS.case_categories, defaults);
            return defaults;
        },
        10 * 60 * 1000
    );
}

async function writeCaseCategoriesDB(data) {
    cache.delete(CacheKeys.CASE_CATEGORIES);
    return writeJsonStore(JSON_KEYS.case_categories, data);
}

async function readApplicationsDB() {
    // 申请数据缓存1分钟
    return cache.getOrSet(CacheKeys.APPLICATIONS, () => readJsonStore(JSON_KEYS.applications, []), 60 * 1000);
}

async function writeApplicationsDB(data) {
    cache.delete(CacheKeys.APPLICATIONS);
    return writeJsonStore(JSON_KEYS.applications, data);
}

async function readServicesConfig() {
    // 服务配置缓存5分钟
    return cache.getOrSet(CacheKeys.SERVICES_CONFIG, () => readJsonStore(JSON_KEYS.services_config, {}), 5 * 60 * 1000);
}

async function writeServicesConfig(data) {
    cache.delete(CacheKeys.SERVICES_CONFIG);
    return writeJsonStore(JSON_KEYS.services_config, data);
}

async function readReviewsDB() {
    return cache.getOrSet(CacheKeys.REVIEWS, () => readJsonStore(JSON_KEYS.reviews, []), 60 * 1000);
}

async function writeReviewsDB(data) {
    cache.delete(CacheKeys.REVIEWS);
    return writeJsonStore(JSON_KEYS.reviews, data);
}

module.exports = {
    initStorage,
    readUsersDB,
    writeUsersDB,
    readCasesDB,
    writeCasesDB,
    readCaseCategoriesDB,
    writeCaseCategoriesDB,
    readApplicationsDB,
    writeApplicationsDB,
    readServicesConfig,
    writeServicesConfig,
    readReviewsDB,
    writeReviewsDB
};

