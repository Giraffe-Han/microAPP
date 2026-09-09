// 一次性种子脚本：把 docs/policy 下的《用户协议》《隐私政策》正文写入协议存储
// 用法：node seed-agreements.js （在 backend 目录下执行）
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { readServicesConfig, writeServicesConfig } = require('./storage');

// 取 markdown 中「## 正文」之后的内容作为协议正文
function extractBody(md) {
    const marker = '## 正文';
    const idx = md.indexOf(marker);
    const body = idx === -1 ? md : md.slice(idx + marker.length);
    return body.replace(/^[\s\r\n]+/, '').replace(/\s+$/, '');
}

(async () => {
    const policyDir = path.join(__dirname, '..', 'docs', 'policy');
    const userMd = fs.readFileSync(path.join(policyDir, '用户协议.md'), 'utf8');
    const privacyMd = fs.readFileSync(path.join(policyDir, '隐私政策.md'), 'utf8');

    const config = await readServicesConfig();
    if (!config._system) config._system = {};
    if (!config._system.agreements) config._system.agreements = {};

    const now = new Date().toISOString();
    config._system.agreements.user = {
        title: '用户协议',
        content: extractBody(userMd),
        version: 'v1.0.0',
        updatedAt: now
    };
    config._system.agreements.privacy = {
        title: '隐私政策',
        content: extractBody(privacyMd),
        version: 'v1.0.0',
        updatedAt: now
    };

    const ok = await writeServicesConfig(config);
    console.log('write ok:', ok);

    // 回读校验
    const check = await readServicesConfig();
    const a = (check._system && check._system.agreements) || {};
    console.log('user.title:', a.user && a.user.title, 'len:', a.user ? a.user.content.length : 0);
    console.log('privacy.title:', a.privacy && a.privacy.title, 'len:', a.privacy ? a.privacy.content.length : 0);
    console.log('user head:', a.user ? a.user.content.slice(0, 30).replace(/\n/g, ' ') : '');
    console.log('privacy head:', a.privacy ? a.privacy.content.slice(0, 30).replace(/\n/g, ' ') : '');
    process.exit(0);
})().catch((e) => {
    console.error('seed failed:', e);
    process.exit(1);
});
