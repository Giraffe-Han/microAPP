/**
 * 手机短信验证码
 *
 * 当前一期未接入真实短信服务商，provider 默认为 'log'：
 * 验证码仅写入日志，接口在非生产环境回传 devCode 供联调。
 * 接入服务商时只需实现下方 providers 中对应的发送函数并配置环境变量，
 * 业务侧（注册、找回、绑定手机号）调用方式无需改动。
 */
const crypto = require('crypto');
const { config } = require('./config');
const { logger } = require('./logger');

// 验证码场景
const SmsScene = {
    REGISTER: 'register',
    RESET_PASSWORD: 'reset_password',
    BIND_PHONE: 'bind_phone'
};

const SCENE_TEMPLATES = {
    [SmsScene.REGISTER]: (code) => `【低空综合服务平台】您的注册验证码是 ${code}，5分钟内有效，请勿泄露给他人。`,
    [SmsScene.RESET_PASSWORD]: (code) => `【低空综合服务平台】您正在重置登录密码，验证码 ${code}，5分钟内有效。`,
    [SmsScene.BIND_PHONE]: (code) => `【低空综合服务平台】您的手机号绑定验证码是 ${code}，5分钟内有效。`
};

// `${scene}:${phone}` -> { code, expiresAt, sentAt, attempts }
const store = new Map();

// 单个验证码最多允许的校验次数，超出即失效
const MAX_ATTEMPTS = 5;

function keyOf(scene, phone) {
    return `${scene}:${phone}`;
}

function randomNumericCode(length) {
    let code = '';
    for (let i = 0; i < length; i++) {
        code += crypto.randomInt(10);
    }
    return code;
}

/**
 * 各服务商发送实现。未接入时抛错，由 sendSms 统一处理。
 */
const providers = {
    /**
     * 日志通道：一期占位实现
     */
    async log(phone, content) {
        logger.info('[SMS模拟]', { phone, content });
        return { messageId: `log-${Date.now()}`, providerMsg: '日志模拟' };
    },

    /**
     * 阿里云短信：配置 SMS_ALIYUN_* 后实现
     * 依赖：@alicloud/dysmsapi20170525
     */
    async aliyun() {
        throw new Error('阿里云短信通道尚未接入');
    },

    /**
     * 腾讯云短信：配置 SMS_TENCENT_* 后实现
     * 依赖：tencentcloud-sdk-nodejs
     */
    async tencent() {
        throw new Error('腾讯云短信通道尚未接入');
    }
};

/**
 * 发送一条短信
 * @returns {Promise<{ messageId: string, providerMsg: string }>}
 */
async function sendSms(phone, content) {
    const send = providers[config.sms.provider];

    if (!send) {
        throw new Error(`未知的短信通道: ${config.sms.provider}`);
    }

    return send(phone, content);
}

function clearExpired() {
    const now = Date.now();
    for (const [key, item] of store.entries()) {
        if (item.expiresAt <= now) store.delete(key);
    }
}

/**
 * 发送场景验证码
 * @returns {Promise<{ ok: boolean, message?: string, expiresIn?: number, devCode?: string }>}
 */
async function sendSmsCode(phone, scene) {
    const buildContent = SCENE_TEMPLATES[scene];

    if (!buildContent) {
        return { ok: false, message: '不支持的验证码场景' };
    }

    const key = keyOf(scene, phone);
    const existing = store.get(key);

    // 同一手机号同一场景的重发节流
    if (existing) {
        const elapsed = Date.now() - existing.sentAt;
        if (elapsed < config.sms.resendInterval) {
            const wait = Math.ceil((config.sms.resendInterval - elapsed) / 1000);
            return { ok: false, message: `请求过于频繁，请 ${wait} 秒后重试` };
        }
    }

    const code = randomNumericCode(config.sms.codeLength);

    try {
        await sendSms(phone, buildContent(code));
    } catch (err) {
        logger.error('短信验证码发送失败', { phone, scene, error: err.message });
        return { ok: false, message: '验证码发送失败，请稍后重试' };
    }

    store.set(key, {
        code,
        expiresAt: Date.now() + config.sms.codeTTL,
        sentAt: Date.now(),
        attempts: 0
    });

    const result = {
        ok: true,
        expiresIn: Math.floor(config.sms.codeTTL / 1000)
    };

    // 非生产环境回传验证码，便于本地与测试环境联调
    if (config.sms.exposeDevCode) {
        result.devCode = code;
    }

    return result;
}

/**
 * 校验场景验证码，成功后立即失效
 * @returns {{ ok: boolean, message?: string }}
 */
function verifySmsCode(phone, scene, input) {
    if (!phone || !input) {
        return { ok: false, message: '请输入短信验证码' };
    }

    const key = keyOf(scene, phone);
    const item = store.get(key);

    if (!item) {
        return { ok: false, message: '请先获取短信验证码' };
    }

    if (item.expiresAt <= Date.now()) {
        store.delete(key);
        return { ok: false, message: '验证码已过期，请重新获取' };
    }

    item.attempts += 1;
    if (item.attempts > MAX_ATTEMPTS) {
        store.delete(key);
        return { ok: false, message: '验证次数过多，请重新获取验证码' };
    }

    if (String(input).trim() !== item.code) {
        return { ok: false, message: '短信验证码错误' };
    }

    store.delete(key);
    return { ok: true };
}

setInterval(clearExpired, 60 * 1000).unref();

module.exports = {
    SmsScene,
    sendSms,
    sendSmsCode,
    verifySmsCode
};
