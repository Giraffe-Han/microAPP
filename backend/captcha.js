/**
 * 图形验证码
 * 自绘 SVG，无额外依赖；小程序端可请求 PNG 格式（经 sharp 转码）
 */
const crypto = require('crypto');
const { config } = require('./config');
const { logger } = require('./logger');

// 剔除易混淆字符 0/O/1/I/L/Z/2
const CHARS = '3456789ABCDEFGHJKMNPQRSTUVWXY';

// captchaId -> { code, expiresAt }
const store = new Map();

// 单实例内存上限，超出时按过期时间淘汰最旧的记录
const MAX_ENTRIES = 5000;

function randomInt(max) {
    return crypto.randomInt(max);
}

function pick(list) {
    return list[randomInt(list.length)];
}

function randomCode(length) {
    let code = '';
    for (let i = 0; i < length; i++) {
        code += CHARS[randomInt(CHARS.length)];
    }
    return code;
}

/**
 * 生成 SVG 图形，包含字符扰动、干扰线与噪点
 */
function buildSvg(text) {
    const width = 120;
    const height = 44;
    const colors = ['#2f7ef7', '#667eea', '#e8663d', '#3f9d5a', '#8e44ad', '#c0392b'];

    const glyphs = text.split('').map((char, index) => {
        const x = 14 + index * ((width - 28) / text.length);
        const y = height / 2 + 7 + randomInt(7) - 3;
        const rotate = randomInt(31) - 15;
        const fontSize = 22 + randomInt(5);
        return `<text x="${x}" y="${y}" fill="${pick(colors)}" font-size="${fontSize}" font-family="Verdana,Arial,sans-serif" font-weight="bold" transform="rotate(${rotate} ${x} ${y})">${char}</text>`;
    }).join('');

    const lines = Array.from({ length: 3 }, () => {
        const x1 = randomInt(width);
        const y1 = randomInt(height);
        const x2 = randomInt(width);
        const y2 = randomInt(height);
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${pick(colors)}" stroke-width="1" stroke-opacity="0.5" />`;
    }).join('');

    const dots = Array.from({ length: 24 }, () => {
        const cx = randomInt(width);
        const cy = randomInt(height);
        return `<circle cx="${cx}" cy="${cy}" r="1" fill="${pick(colors)}" fill-opacity="0.6" />`;
    }).join('');

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`
        + `<rect width="${width}" height="${height}" fill="#f7f8fa" />`
        + dots + lines + glyphs
        + '</svg>';
}

/**
 * 清理过期记录；容量超限时淘汰最早过期的记录
 */
function evict() {
    const now = Date.now();
    for (const [id, item] of store.entries()) {
        if (item.expiresAt <= now) store.delete(id);
    }

    if (store.size <= MAX_ENTRIES) return;

    const sorted = [...store.entries()].sort((a, b) => a[1].expiresAt - b[1].expiresAt);
    const overflow = store.size - MAX_ENTRIES;
    for (let i = 0; i < overflow; i++) {
        store.delete(sorted[i][0]);
    }
}

/**
 * 生成验证码
 * @returns {{ captchaId: string, svg: string, expiresIn: number }}
 */
function createCaptcha() {
    evict();

    const code = randomCode(config.captcha.length);
    const captchaId = crypto.randomUUID();

    store.set(captchaId, {
        code: code.toUpperCase(),
        expiresAt: Date.now() + config.captcha.ttl
    });

    return {
        captchaId,
        svg: buildSvg(code),
        expiresIn: Math.floor(config.captcha.ttl / 1000)
    };
}

/**
 * 校验验证码（一次性消费：无论成败都失效，避免重放与暴力枚举）
 * @returns {{ ok: boolean, message?: string }}
 */
function verifyCaptcha(captchaId, input) {
    if (!config.captcha.enabled) {
        return { ok: true };
    }

    if (!captchaId || !input) {
        return { ok: false, message: '请输入图形验证码' };
    }

    const item = store.get(captchaId);
    store.delete(captchaId);

    if (!item) {
        return { ok: false, message: '验证码已失效，请点击图片刷新' };
    }

    if (item.expiresAt <= Date.now()) {
        return { ok: false, message: '验证码已过期，请点击图片刷新' };
    }

    if (String(input).trim().toUpperCase() !== item.code) {
        return { ok: false, message: '图形验证码错误' };
    }

    return { ok: true };
}

/**
 * 将 SVG 转为 PNG Buffer，供不支持 SVG 的端（微信小程序 image 组件）使用
 * sharp 不可用时返回 null，由调用方回退到 SVG
 */
async function svgToPng(svg) {
    try {
        const sharp = require('sharp');
        return await sharp(Buffer.from(svg)).png().toBuffer();
    } catch (err) {
        logger.warn('图形验证码 PNG 转码失败，回退 SVG', { error: err.message });
        return null;
    }
}

// 定期清理过期验证码
setInterval(evict, 60 * 1000).unref();

module.exports = {
    createCaptcha,
    verifyCaptcha,
    svgToPng
};
