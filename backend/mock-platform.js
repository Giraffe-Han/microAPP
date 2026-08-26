/**
 * 畅行温州平台 本地 mock 服务（仅用于本地联调，不参与生产）
 *
 * 用途：dev 环境会员库里没有可用测试会员（authcode 获取返回 M701 会员不存在）时，
 * 用它替代平台，把"免密登录 + 自动注册"链路在本地完整跑通。
 *
 * 与真实平台保持一致的部分：
 * - 报文结构 joininstid/joininstssn/reqdate/reqtime/hdataenc/dataenc/sign
 * - hdata/data 走 SM4-ECB 加密后转 base64
 * - sign = key 升序拼接 key+value（不含 sign）→ SHA1 原始20字节 → SM2(裸r||s) → base64
 * - 请求签名校验不通过返回 SB997，与平台返回码一致
 *
 * 刻意与真实平台不同的部分：
 * - 会员库不做真实校验，任何手机号都视为已注册会员（否则本地无法自测）
 *
 * 启动：node mock-platform.js
 * 让后端指向它：$env:PLATFORM_BASE_URL='http://127.0.0.1:3100'; node index.js
 */
const express = require('express');
const crypto = require('crypto');
const { sm2, sm4 } = require('sm-crypto');

const PORT = process.env.MOCK_PLATFORM_PORT || 3100;

// 与 platformAuth.js 同源配置（docs/接入文档/接入参数.txt）
const SM4_KEY = '12545612345648907234561434557894';
const SM2_PUBLIC_KEY =
  '04b0820c10227017749f6ea25ef49f0d65cf53f701a0230179362470eaf45a560c3caf88558d03c0e74fad2c78cfeb1aa46e1c232d7519371ae0e33057fd0e66c3';
// mock 用同一把私钥给响应签名（dev 环境接入方与平台共用这对测试密钥）
const SM2_PRIVATE_KEY = 'cdcd3db6845a1457895328a52e109646707c6bf372ef44db69d4390989b9a5ed';

const buildSignContent = (payload) =>
  Object.keys(payload)
    .sort()
    .map((key) => `${key}${payload[key]}`)
    .join('');

const sha1Bytes = (text) => Array.from(crypto.createHash('sha1').update(text, 'utf8').digest());

const verifySign = (body, userId) => {
  const { sign, ...rest } = body || {};
  if (!sign) return false;
  const signatureHex = Buffer.from(sign, 'base64').toString('hex');
  if (signatureHex.length !== 128) return false;
  return sm2.doVerifySignature(sha1Bytes(buildSignContent(rest)), signatureHex, SM2_PUBLIC_KEY, {
    hash: true,
    der: false,
    userId
  });
};

const signBody = (body, userId) => {
  const hex = sm2.doSignature(sha1Bytes(buildSignContent(body)), SM2_PRIVATE_KEY, {
    hash: true,
    der: false,
    userId
  });
  return Buffer.from(hex, 'hex').toString('base64');
};

const encrypt = (plain) =>
  Buffer.from(sm4.encrypt(JSON.stringify(plain), SM4_KEY), 'hex').toString('base64');

const decrypt = (ciphertext) =>
  JSON.parse(sm4.decrypt(Buffer.from(ciphertext, 'base64').toString('hex'), SM4_KEY));

/** authcode -> 会员信息，一次性使用，5分钟过期 */
const authCodeStore = new Map();
/** 手机号 -> 平台会员号，保证同一手机号多次登录拿到同一个 pltmemberno */
const memberStore = new Map();

const getOrCreateMember = (mobilephone, authmemberno) => {
  if (!memberStore.has(mobilephone)) {
    const seq = String(memberStore.size + 1).padStart(6, '0');
    memberStore.set(mobilephone, {
      pltmemberno: `M${mobilephone.slice(-4)}${seq}`,
      nickname: `温州用户${mobilephone.slice(-4)}`,
      mobilephone,
      authmemberno: String(authmemberno || '')
    });
  }
  const member = memberStore.get(mobilephone);
  if (authmemberno) member.authmemberno = String(authmemberno);
  return member;
};

const app = express();
app.use(express.json({ limit: '1mb' }));

/** 统一响应：业务数据加密进 dataenc，并附响应签名 */
const respond = (res, userId, result, resultdesc, data) => {
  const body = { result, resultdesc };
  if (data) body.dataenc = encrypt(data);
  const payload = { ...body, sign: signBody(body, userId) };
  console.log(`  <- ${result} ${resultdesc}`, data ? JSON.stringify(data) : '');
  return res.json(payload);
};

/** 请求预处理：验签 + 解密，失败时直接回错误码 */
const parseRequest = (req, res) => {
  const body = req.body || {};
  const userId = body.joininstid;
  console.log(`\n-> ${req.path}  joininstid=${userId} ssn=${body.joininstssn}`);

  if (!userId || !body.sign || !body.dataenc) {
    respond(res, userId || '00000015', 'PERR', '报文要素缺失');
    return null;
  }

  if (!verifySign(body, userId)) {
    console.log('  验签失败');
    respond(res, userId, 'SB997', '签名错误');
    return null;
  }
  console.log('  验签通过');

  try {
    const hdata = body.hdataenc ? decrypt(body.hdataenc) : {};
    const data = decrypt(body.dataenc);
    console.log('  hdata =', JSON.stringify(hdata));
    console.log('  data  =', JSON.stringify(data));
    return { userId, hdata, data };
  } catch (error) {
    console.log('  解密失败:', error.message);
    respond(res, userId, 'SB998', '报文解密失败');
    return null;
  }
};

// 会员授权访问授权码获取
app.post('/member/authaccess/authcode/get/V1', (req, res) => {
  const parsed = parseRequest(req, res);
  if (!parsed) return;
  const { userId, data } = parsed;

  const { authmemberno, authmobilephone, authinstid, authtype } = data;
  if (!authmemberno || !authinstid || !authtype) {
    return respond(res, userId, 'PERR', 'data参数缺失');
  }
  if (!authmobilephone) {
    // 真实平台：授权机构为第三方机构时手机号必填
    return respond(res, userId, 'PERR', '授权机构方会员手机号必填');
  }

  const member = getOrCreateMember(String(authmobilephone), authmemberno);
  const authcode = crypto.randomBytes(16).toString('hex');
  authCodeStore.set(authcode, { ...member, expireAt: Date.now() + 5 * 60 * 1000 });

  return respond(res, userId, '0000', '成功', {
    authcode,
    pltmemberno: member.pltmemberno
  });
});

// 会员授权访问会员信息查询
app.post('/member/authaccess/member/query/V1', (req, res) => {
  const parsed = parseRequest(req, res);
  if (!parsed) return;
  const { userId, data } = parsed;

  const { authcode, authinstid, querytype } = data;
  if (!authcode || !authinstid || !querytype) {
    return respond(res, userId, 'PERR', 'data参数缺失');
  }

  const record = authCodeStore.get(authcode);
  if (!record) return respond(res, userId, 'M702', '授权码无效');
  if (record.expireAt < Date.now()) {
    authCodeStore.delete(authcode);
    return respond(res, userId, 'M703', '授权码已过期');
  }
  // 授权码一次性使用
  authCodeStore.delete(authcode);

  const member = {
    authmemberno: record.authmemberno,
    pltmemberno: record.pltmemberno,
    nickname: record.nickname,
    mobilephone: record.mobilephone
  };
  if (querytype === '02') {
    Object.assign(member, { idtype: '01', idno: '330300199001010011', name: '测试用户' });
  }
  return respond(res, userId, '0000', '成功', member);
});

app.use((req, res) => {
  console.log(`\n-> 未实现的接口 ${req.method} ${req.path}`);
  res.status(404).json({ result: 'SB404', resultdesc: 'mock平台未实现该接口' });
});

app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`畅行温州 mock 平台已启动: http://127.0.0.1:${PORT}`);
  console.log('已实现: /member/authaccess/authcode/get/V1');
  console.log('        /member/authaccess/member/query/V1');
  console.log('注意: 任何手机号都会被视为已注册会员，仅供本地联调');
  console.log('='.repeat(60));
});
