/**
 * 畅行温州平台连通性测试脚本
 * 运行方式: node test-platform.js [authcode]
 */

const axios = require('axios');
const crypto = require('crypto');
const { sm2, sm4 } = require('sm-crypto');

// 配置（与 platformAuth.js 保持一致）
const PLATFORM_BASE_URL = process.env.PLATFORM_BASE_URL || 'https://dev.jieyisoft.com:11296';
const JOIN_INST_ID = process.env.PLATFORM_JOININST_ID || '00000010';
const H_INST_ID = process.env.PLATFORM_INST_ID || '00000001';
const MCHNT_ID = process.env.PLATFORM_MCHNT_ID || '100000010003';
const CHNL_ID = process.env.PLATFORM_CHNL_ID || '03';
const AUTH_INST_ID = process.env.PLATFORM_AUTH_INST_ID || '00000001';
const SM2_PRIVATE_KEY = process.env.PLATFORM_SM2_PRIVATE_KEY || 'a180a91baed06c50a92699d0fd6ca03412ad9f246a643396a07957b8933de643';
const SM4_KEY_RAW = process.env.PLATFORM_SM4_KEY || '67651926067651926067651926067651';
const SM4_KEY = SM4_KEY_RAW.length === 32 && /^[0-9a-fA-F]+$/.test(SM4_KEY_RAW)
  ? SM4_KEY_RAW
  : Buffer.from(SM4_KEY_RAW, 'utf8').toString('hex');

console.log('\n========== 畅行温州平台连通性测试 ==========\n');

// 1. 打印当前配置
console.log('【1. 当前配置】');
console.log(`  - 平台地址: ${PLATFORM_BASE_URL}`);
console.log(`  - joininstid: ${JOIN_INST_ID}`);
console.log(`  - instid: ${H_INST_ID}`);
console.log(`  - mchntid: ${MCHNT_ID}`);
console.log(`  - chnlid: ${CHNL_ID}`);
console.log(`  - SM2私钥: ${SM2_PRIVATE_KEY.substring(0, 8)}...${SM2_PRIVATE_KEY.substring(SM2_PRIVATE_KEY.length - 8)}`);
console.log(`  - SM4密钥: ${SM4_KEY.substring(0, 8)}...${SM4_KEY.substring(SM4_KEY.length - 8)}`);
console.log();

// 辅助函数
const formatDateTime = (date) => {
  const pad = (n) => String(n).padStart(2, '0');
  return {
    reqdate: `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`,
    reqtime: `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  };
};

const buildJoinInstSsn = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const rand = Math.floor(Math.random() * 1e6).toString().padStart(6, '0');
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
  const hexCipher = sm4.encrypt(JSON.stringify(plain), SM4_KEY);
  return Buffer.from(hexCipher, 'hex').toString('base64');
};

const decryptPayload = (ciphertext) => {
  const hexCipher = Buffer.from(ciphertext, 'base64').toString('hex');
  const plainText = sm4.decrypt(hexCipher, SM4_KEY);
  return JSON.parse(plainText);
};

// 2. 测试 SM4 加密解密
console.log('【2. SM4 加密解密测试】');
try {
  const testData = { test: 'hello', time: Date.now() };
  const encrypted = encryptPayload(testData);
  const decrypted = decryptPayload(encrypted);
  
  if (JSON.stringify(testData) === JSON.stringify(decrypted)) {
    console.log('  ✅ SM4 加密解密正常');
  } else {
    console.log('  ❌ SM4 解密结果不匹配');
  }
} catch (err) {
  console.log('  ❌ SM4 加密解密失败:', err.message);
}
console.log();

// 3. 测试 SM2 签名
console.log('【3. SM2 签名测试】');
try {
  const testPayload = { test: 'data', time: '20260120120000' };
  const signature = signPayload(testPayload);
  console.log('  ✅ SM2 签名正常');
  console.log(`  签名结果: ${signature.substring(0, 20)}...`);
} catch (err) {
  console.log('  ❌ SM2 签名失败:', err.message);
}
console.log();

// 4. 测试网络连通性
console.log('【4. 网络连通性测试】');
const testConnectivity = async () => {
  try {
    const response = await axios.get(PLATFORM_BASE_URL, { 
      timeout: 10000,
      validateStatus: () => true // 接受任何状态码
    });
    console.log(`  ✅ 网络连通 (HTTP ${response.status})`);
    return true;
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      console.log('  ❌ 连接被拒绝 - 服务器可能未启动或端口错误');
    } else if (err.code === 'ENOTFOUND') {
      console.log('  ❌ DNS解析失败 - 域名不存在');
    } else if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') {
      console.log('  ❌ 连接超时 - 可能是网络问题或防火墙阻止');
    } else {
      console.log(`  ❌ 网络错误: ${err.message}`);
    }
    return false;
  }
};

// 5. 测试 SSO 接口（如果提供了 authcode）
const testSSOLogin = async (authcode) => {
  console.log('\n【5. SSO 登录接口测试】');
  console.log(`  使用 authcode: ${authcode}`);
  
  try {
    const { reqdate, reqtime } = formatDateTime(new Date());
    const hdata = { instid: H_INST_ID, mchntid: MCHNT_ID, chnlid: CHNL_ID };
    const data = { authcode, authinstid: AUTH_INST_ID, querytype: '01' };
    
    const body = {
      joininstid: JOIN_INST_ID,
      joininstssn: buildJoinInstSsn(),
      reqdate,
      reqtime,
      hdataenc: encryptPayload(hdata),
      dataenc: encryptPayload(data)
    };
    body.sign = signPayload(body);
    
    console.log('\n  请求报文:');
    console.log(`    joininstid: ${body.joininstid}`);
    console.log(`    joininstssn: ${body.joininstssn}`);
    console.log(`    reqdate: ${body.reqdate}`);
    console.log(`    reqtime: ${body.reqtime}`);
    
    const response = await axios.post(
      `${PLATFORM_BASE_URL}/member/authaccess/member/query/V1`,
      body,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      }
    );
    
    console.log('\n  响应:');
    console.log(`    result: ${response.data.result}`);
    console.log(`    resultdesc: ${response.data.resultdesc}`);
    
    if (response.data.result === '0000') {
      console.log('  ✅ SSO 接口调用成功');
      if (response.data.dataenc) {
        const userData = decryptPayload(response.data.dataenc);
        console.log('\n  用户信息:');
        console.log(`    authmemberno: ${userData.authmemberno || '-'}`);
        console.log(`    pltmemberno: ${userData.pltmemberno || '-'}`);
        console.log(`    nickname: ${userData.nickname || '-'}`);
        console.log(`    mobilephone: ${userData.mobilephone || '-'}`);
      }
    } else {
      console.log(`  ❌ SSO 接口返回错误: ${response.data.resultdesc}`);
    }
  } catch (err) {
    console.log(`  ❌ SSO 接口调用失败: ${err.message}`);
    if (err.response) {
      console.log(`    HTTP 状态: ${err.response.status}`);
      console.log(`    响应内容: ${JSON.stringify(err.response.data)}`);
    }
  }
};

// 执行测试
(async () => {
  const connected = await testConnectivity();
  
  const authcode = process.argv[2];
  if (authcode) {
    await testSSOLogin(authcode);
  } else {
    console.log('\n【5. SSO 登录接口测试】');
    console.log('  ⚠️  未提供 authcode，跳过 SSO 测试');
    console.log('  提示: 运行 node test-platform.js <authcode> 进行完整测试');
  }
  
  console.log('\n========== 测试完成 ==========\n');
})();
