/**
 * SM2 签名工具
 * 提供与 Java SDK 兼容的 SM2 签名和验签
 */
const { sm2 } = require('sm-crypto');
const { config } = require('../config');
const { logger } = require('../logger');

/**
 * 将待签名数据统一转为字节数组
 *
 * sm-crypto 的 doSignature/doVerifySignature 对字符串入参会先做一次 utf8ToHex，
 * 直接传 hex 字符串等于把 hex 文本当明文签名，必须先还原成字节。
 *
 * @param {string} data - hex 字符串或 UTF-8 字符串
 * @returns {number[]} 字节数组
 */
function toBytes(data) {
  const isHex = typeof data === 'string' && data.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(data);
  return Array.from(Buffer.from(data, isHex ? 'hex' : 'utf8'));
}

/**
 * SM2 签名
 *
 * Java SDK 调用方式:
 * SM2Utils.sign(userId.getBytes(), privateKey_bytes, sourceData_bytes)
 *
 * @param {string} message - 待签名的消息(hex字符串或UTF-8字符串)
 * @param {string} userId - 用户ID(用于Z值计算，传明文)
 * @param {Object} options - 选项
 * @param {boolean} options.der - 是否使用DER格式,默认true
 * @returns {string} 签名结果(hex字符串)
 */
function sign(message, userId, options = {}) {
  const {
    der = true
  } = options;

  try {
    const privateKey = config.sm2.privateKey;

    if (!privateKey) {
      throw new Error('SM2 私钥未配置');
    }

    // hash 固定为 true：SM2 标准要求对 SM3(Z_A || M) 签名，
    // userId 传明文，库内部会自行 utf8ToHex，预先转 hex 会被二次编码
    const signature = sm2.doSignature(toBytes(message), privateKey, {
      hash: true,
      userId,
      der
    });

    logger.debug('SM2 signature generated', {
      messageLength: message.length,
      signatureLength: signature.length
    });

    return signature;
  } catch (error) {
    logger.error('SM2 sign failed', { error: error.message });
    throw error;
  }
}

/**
 * SM2 验签
 *
 * @param {string} message - 原始消息(hex字符串或UTF-8字符串)
 * @param {string} signature - 签名(hex字符串)
 * @param {string} userId - 用户ID(传明文)
 * @param {Object} options - 选项
 * @param {boolean} options.der - 是否使用DER格式,默认true
 * @returns {boolean} 验签结果
 */
function verify(message, signature, userId, options = {}) {
  const {
    der = true
  } = options;

  try {
    const publicKey = config.sm2.publicKey;

    if (!publicKey) {
      throw new Error('SM2 公钥未配置');
    }

    const result = sm2.doVerifySignature(toBytes(message), signature, publicKey, {
      hash: true,
      userId,
      der
    });

    logger.debug('SM2 signature verification', { result });

    return result;
  } catch (error) {
    logger.error('SM2 verify failed', { error: error.message });
    return false;
  }
}

/**
 * 生成 SM2 密钥对
 *
 * @returns {Object} 包含私钥和公钥的对象
 */
function generateKeyPair() {
  const keypair = sm2.generateKeyPairHex();
  return {
    privateKey: keypair.privateKey,
    publicKey: keypair.publicKey
  };
}

/**
 * 针对 Java SDK 的兼容签名
 *
 * Java 代码:
 * SM2Utils.sign(joininstidStr.getBytes("utf-8"), Util.hexToByte(sendPrivatekey), Util.hexToByte(strForSignSha1))
 *
 * 对应 PHP 实现：sha1($joined, true) 后把原始20字节交给 RtSm2::doSign
 *
 * @param {string} userId - joininstid (UTF-8字符串)
 * @param {string} privateKeyHex - 私钥(hex字符串)
 * @param {string} sourceDataHex - 已hash的数据(hex字符串,如SHA1结果)
 * @returns {string} 签名(base64字符串,裸 r||s 64字节)
 */
function signForJavaSDK(userId, privateKeyHex, sourceDataHex) {
  try {
    // hex 还原为字节；hash=true 由库内部完成 SM3(Z_A || M)；userId 传明文
    const signature = sm2.doSignature(toBytes(sourceDataHex), privateKeyHex, {
      hash: true,
      userId,
      der: false  // Java SDK 默认使用r||s格式
    });

    // 转换为base64
    return Buffer.from(signature, 'hex').toString('base64');
  } catch (error) {
    logger.error('SM2 sign for Java SDK failed', { error: error.message });
    throw error;
  }
}

/**
 * 针对 Java SDK 的兼容验签
 *
 * @param {string} userId - joininstid (UTF-8字符串)
 * @param {string} publicKeyHex - 公钥(hex字符串)
 * @param {string} sourceDataHex - 已hash的数据(hex字符串)
 * @param {string} signatureBase64 - 签名(base64字符串)
 * @returns {boolean} 验签结果
 */
function verifyForJavaSDK(userId, publicKeyHex, sourceDataHex, signatureBase64) {
  try {
    const signatureHex = Buffer.from(signatureBase64, 'base64').toString('hex');

    return sm2.doVerifySignature(toBytes(sourceDataHex), signatureHex, publicKeyHex.toLowerCase(), {
      hash: true,
      userId,
      der: false
    });
  } catch (error) {
    logger.error('SM2 verify for Java SDK failed', { error: error.message });
    return false;
  }
}

module.exports = {
  sign,
  verify,
  generateKeyPair,
  signForJavaSDK,
  verifyForJavaSDK
};
