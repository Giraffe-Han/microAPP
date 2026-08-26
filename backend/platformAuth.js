const axios = require('axios');
const crypto = require('crypto');
const { sm2, sm4 } = require('sm-crypto');
const { logger } = require('./logger');

// 畅行温州平台对接配置（测试环境）
// 来源：docs/接入文档/接入参数.txt
// 更新日期：2026-01-20
const PLATFORM_BASE_URL = process.env.PLATFORM_BASE_URL || 'https://dev.jieyisoft.com:11296';
const JOIN_INST_ID = process.env.PLATFORM_JOININST_ID || '00000015';
const H_INST_ID = process.env.PLATFORM_INST_ID || '00000001';
const MCHNT_ID = process.env.PLATFORM_MCHNT_ID || '150000150001';
const CHNL_ID = process.env.PLATFORM_CHNL_ID || '03';
const AUTH_INST_ID = process.env.PLATFORM_AUTH_INST_ID || '00000015';
const SM2_PRIVATE_KEY = process.env.PLATFORM_SM2_PRIVATE_KEY || 'cdcd3db6845a1457895328a52e109646707c6bf372ef44db69d4390989b9a5ed';
const SM2_PUBLIC_KEY = process.env.PLATFORM_SM2_PUBLIC_KEY || '04b0820c10227017749f6ea25ef49f0d65cf53f701a0230179362470eaf45a560c3caf88558d03c0e74fad2c78cfeb1aa46e1c232d7519371ae0e33057fd0e66c3';

// 平台返回码：成功
const RESULT_SUCCESS = '0000';

// SM4密钥处理：
// 配置为32位hex字符串时直接作为hex使用（代表16字节密钥），16位字符时按ASCII转hex
const SM4_KEY_RAW = process.env.PLATFORM_SM4_KEY || '12545612345648907234561434557894';
const SM4_KEY = /^[0-9a-fA-F]{32}$/.test(SM4_KEY_RAW)
  ? SM4_KEY_RAW
  : Buffer.from(SM4_KEY_RAW, 'utf8').toString('hex');

const platformClient = axios.create({
  baseURL: PLATFORM_BASE_URL,
  timeout: 30000
});

const ensureConfig = () => {
  if (!PLATFORM_BASE_URL) throw new Error('平台接口地址未配置');
  if (!JOIN_INST_ID) throw new Error('平台joininstid未配置');
  if (!H_INST_ID) throw new Error('平台hdata.instid未配置');
  if (!MCHNT_ID) throw new Error('平台hdata.mchntid未配置');
  if (!CHNL_ID) throw new Error('平台hdata.chnlid未配置');
  if (!SM2_PRIVATE_KEY) throw new Error('平台SM2私钥未配置');
  if (!SM4_KEY) throw new Error('平台SM4密钥未配置');
};

const formatDateTime = (date) => {
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = date.getFullYear();
  const MM = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return {
    reqdate: `${yyyy}${MM}${dd}`,
    reqtime: `${hh}${mm}${ss}`
  };
};

const buildJoinInstSsn = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(
    now.getHours()
  )}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const rand = Math.floor(Math.random() * 1e6)
    .toString()
    .padStart(6, '0');
  return `${ts}${rand}`.slice(0, 20);
};

const buildSignContent = (payload) => {
  const keys = Object.keys(payload).sort();
  return keys.map((key) => `${key}${payload[key]}`).join('');
};

/**
 * 报文签名：key ASCII 排序拼接 key+value（不含 sign）→ SHA1 原始20字节
 * → SM2 签名（内部做 SM3(Z_A || M)，userId = joininstid）→ 裸 r||s 64字节转 base64
 *
 * 两个必须注意的 sm-crypto 语义（否则平台返回 SB997 签名错误）：
 * 1. doSignature 对字符串入参会先做一次 utf8ToHex，所以摘要必须传字节数组，
 *    传 hex 字符串等于把40个字符当明文签名；
 * 2. hash 必须为 true，Z_A 杂凑由库内部完成，且 userId 要传明文，
 *    库内部会自行 utf8ToHex，预先转 hex 会被二次编码。
 */
const signPayload = (payload) => {
  const digest = crypto.createHash('sha1').update(buildSignContent(payload), 'utf8').digest();
  const signatureHex = sm2.doSignature(Array.from(digest), SM2_PRIVATE_KEY, {
    hash: true,
    der: false,
    userId: JOIN_INST_ID
  });
  return Buffer.from(signatureHex, 'hex').toString('base64');
};

/**
 * 报文验签（平台回调通知场景）：与签名同样的拼接规则，用平台公钥校验
 *
 * @param {Object} payload 含 sign 的完整报文
 * @param {string} publicKey 验签公钥（hex），默认取平台配置公钥
 * @returns {boolean}
 */
const verifySign = (payload, publicKey = SM2_PUBLIC_KEY) => {
  const { sign, ...rest } = payload || {};
  if (!sign || !publicKey) return false;
  try {
    const signatureHex = Buffer.from(sign, 'base64').toString('hex');
    // 平台 sign 是裸 r||s 共64字节
    if (signatureHex.length !== 128) return false;
    const digest = crypto.createHash('sha1').update(buildSignContent(rest), 'utf8').digest();
    return sm2.doVerifySignature(Array.from(digest), signatureHex, publicKey.toLowerCase(), {
      hash: true,
      der: false,
      userId: JOIN_INST_ID
    });
  } catch (error) {
    logger.error('平台报文验签异常', { error: error.message });
    return false;
  }
};

const encryptPayload = (plain) => {
  // 文档要求：明文JSON → SM4 ECB模式加密 → hex输出 → 转base64
  // sm4.encrypt 默认 ECB + PKCS#7，输出 hex 字符串
  const hexCipher = sm4.encrypt(JSON.stringify(plain), SM4_KEY);
  return Buffer.from(hexCipher, 'hex').toString('base64');
};

const decryptPayload = (ciphertext) => {
  // 解密：base64 → hex → SM4解密
  const hexCipher = Buffer.from(ciphertext, 'base64').toString('hex');
  const plainText = sm4.decrypt(hexCipher, SM4_KEY);
  return JSON.parse(plainText);
};

const buildRequestBody = (data) => {
  const { reqdate, reqtime } = formatDateTime(new Date());
  const hdata = {
    instid: H_INST_ID,
    mchntid: MCHNT_ID,
    chnlid: CHNL_ID
  };

  const body = {
    joininstid: JOIN_INST_ID,
    joininstssn: buildJoinInstSsn(),
    reqdate,
    reqtime,
    hdataenc: encryptPayload(hdata),
    dataenc: encryptPayload(data)
  };

  return {
    ...body,
    sign: signPayload(body)
  };
};

const postPlatform = async (path, data) => {
  ensureConfig();
  const body = buildRequestBody(data);

  let res;
  try {
    res = await platformClient.post(path, body, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json;charset=utf-8'
      }
    });
  } catch (error) {
    logger.error('平台接口请求失败', { path, error: error.message });
    throw new Error('平台网络请求失败，请稍后重试');
  }

  const response = res?.data;
  if (!response || !response.result) {
    logger.error('平台响应非法', { path, body: JSON.stringify(response || '').slice(0, 500) });
    throw new Error('平台响应异常，请稍后重试');
  }

  const result = String(response.result);
  const resultdesc = response.resultdesc || '';

  // 先解密业务数据再判返回码：PERR 等参数错误时平台会把明细放在明文 data 里
  let decrypted = {};
  if (response.dataenc) {
    try {
      decrypted = decryptPayload(response.dataenc) || {};
    } catch (error) {
      logger.error('平台响应解密失败', { path, result, error: error.message });
    }
  }
  if (!Object.keys(decrypted).length && response.data && typeof response.data === 'object') {
    decrypted = response.data;
  }

  logger.info('平台接口调用完成', { path, result, resultdesc });

  if (result !== RESULT_SUCCESS) {
    throw new Error(`平台错误[${result}]${resultdesc}`);
  }

  return { ...response, data: decrypted };
};

/**
 * 会员授权访问授权码获取（完成本方会员与平台会员的打通）
 *
 * 用于本地自测：不依赖从畅行温州 App 跳转，可自行签发 authcode 后跑完整免密登录流程
 *
 * @param {string} memberNo 本方会员唯一ID
 * @param {string} mobilePhone 会员手机号
 * @param {string} authType 01=基本信息 02=基本信息+实名信息
 * @returns {Promise<Object>} { pltmemberno, authcode }
 */
const getAuthCode = async (memberNo, mobilePhone, authType = '01') => {
  const response = await postPlatform('/member/authaccess/authcode/get/V1', {
    authmemberno: String(memberNo),
    authmobilephone: String(mobilePhone),
    authinstid: AUTH_INST_ID,
    authtype: authType
  });
  return response?.data || {};
};

const queryMemberByAuthCode = async (authcode) => {
  const response = await postPlatform('/member/authaccess/member/query/V1', {
    authcode,
    authinstid: AUTH_INST_ID,
    querytype: '01'
  });
  return response?.data || {};
};

module.exports = {
  getAuthCode,
  queryMemberByAuthCode,
  signPayload,
  verifySign
};
