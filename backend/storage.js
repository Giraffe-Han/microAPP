const fs = require('fs');
const path = require('path');
const { USE_POSTGRES, ensureJsonStoreTable, query } = require('./db/pg');

const DB_FILE = path.join(__dirname, 'data.json');
const CASES_FILE = path.join(__dirname, 'cases.json');
const USERS_FILE = path.join(__dirname, 'users.json');
const SERVICES_CONFIG_FILE = path.join(__dirname, 'services_config.json');

const JSON_KEYS = {
    applications: 'applications',
    cases: 'cases',
    users: 'users',
    services_config: 'services_config'
};

function readJsonFile(filePath, fallback) {
    try {
        if (!fs.existsSync(filePath)) return fallback;
        const data = fs.readFileSync(filePath);
        return JSON.parse(data);
    } catch (err) {
        console.error(`[storage] Error reading ${filePath}:`, err);
        return fallback;
    }
}

function writeJsonFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error(`[storage] Error writing ${filePath}:`, err);
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
    if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, JSON.stringify([]));
    }
    if (!fs.existsSync(SERVICES_CONFIG_FILE)) {
        fs.writeFileSync(SERVICES_CONFIG_FILE, JSON.stringify({}, null, 2));
    }
}

async function readJsonStore(key, fallback) {
    if (!USE_POSTGRES) {
        switch (key) {
            case JSON_KEYS.users:
                return readJsonFile(USERS_FILE, fallback);
            case JSON_KEYS.cases:
                return readJsonFile(CASES_FILE, fallback);
            case JSON_KEYS.services_config:
                return readJsonFile(SERVICES_CONFIG_FILE, fallback);
            case JSON_KEYS.applications:
                return readJsonFile(DB_FILE, fallback);
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
            case JSON_KEYS.services_config:
                return writeJsonFile(SERVICES_CONFIG_FILE, data);
            case JSON_KEYS.applications:
                return writeJsonFile(DB_FILE, data);
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
    return readJsonStore(JSON_KEYS.users, []);
}

async function writeUsersDB(data) {
    return writeJsonStore(JSON_KEYS.users, data);
}

async function readCasesDB() {
    return readJsonStore(JSON_KEYS.cases, []);
}

async function writeCasesDB(data) {
    return writeJsonStore(JSON_KEYS.cases, data);
}

async function readApplicationsDB() {
    return readJsonStore(JSON_KEYS.applications, []);
}

async function writeApplicationsDB(data) {
    return writeJsonStore(JSON_KEYS.applications, data);
}

async function readServicesConfig() {
    return readJsonStore(JSON_KEYS.services_config, {});
}

async function writeServicesConfig(data) {
    return writeJsonStore(JSON_KEYS.services_config, data);
}

module.exports = {
    initStorage,
    readUsersDB,
    writeUsersDB,
    readCasesDB,
    writeCasesDB,
    readApplicationsDB,
    writeApplicationsDB,
    readServicesConfig,
    writeServicesConfig
};

