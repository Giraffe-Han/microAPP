const axios = require('axios');
const crypto = require('crypto');
const { sm2, sm4 } = require('sm-crypto');

// 畅行温州平台对接配置（根据真实报文提取）
const PLATFORM_BASE_URL = process.env.PLATFORM_BASE_URL || 'https://app.wzsjy.com:8446';
const JOIN_INST_ID = process.env.PLATFORM_JOININST_ID || '00000010';
const H_INST_ID = process.env.PLATFORM_INST_ID || '00000001';
const MCHNT_ID = process.env.PLATFORM_MCHNT_ID || '100000010003';
const CHNL_ID = process.env.PLATFORM_CHNL_ID || '03';
const AUTH_INST_ID = process.env.PLATFORM_AUTH_INST_ID || '00000001';
const SM2_PRIVATE_KEY = process.env.PLATFORM_SM2_PRIVATE_KEY || 'C2993EDE51A683DB26B9988DF8D3785147AE5AFD2AE0E1CE5BD98328829D3423';
// SM4密钥需要转为hex格式（1234567890123456 -> 31323334353637383930313233343536）
const SM4_KEY_RAW = process.env.PLATFORM_SM4_KEY || '1234567890123456';
const SM4_KEY = Buffer.from(SM4_KEY_RAW, 'utf8').toString('hex');

const platformClient = axios.create({
  baseURL: PLATFORM_BASE_URL,
  timeout: 15000
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

const signPayload = (payload) => {
  const signContent = buildSignContent(payload);
  const digestHex = crypto.createHash('sha1').update(signContent).digest('hex');
  const signatureHex = sm2.doSignature(digestHex, SM2_PRIVATE_KEY, {
    hash: false,
    userId: JOIN_INST_ID
  });
  return Buffer.from(signatureHex, 'hex').toString('base64');
};

const encryptPayload = (plain) => {
  // 文档要求：SM4加密 → hex输出 → 转base64
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
  const res = await platformClient.post(path, body, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  if (!res?.data) {
    throw new Error('平台响应为空');
  }
  if (res.data.result && res.data.result !== '0000') {
    throw new Error(res.data.resultdesc || '平台返回失败');
  }
  if (res.data.dataenc) {
    return {
      ...res.data,
      data: decryptPayload(res.data.dataenc)
    };
  }
  return res.data;
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
  queryMemberByAuthCode
};
