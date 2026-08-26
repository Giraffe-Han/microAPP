<?php

namespace app\common\service;

use Rtgm\sm\RtSm2;
use think\Config;
use think\Log;

/**
 * 畅行温州移动平台（融合支付/会员系统）接入服务
 *
 * 报文规范（《畅行温州移动平台标准接入V1.0.0》，以下细节已用平台样例与 dev 环境实测验证）：
 * - hdata/data 明文 JSON 先 SM4-ECB 加密转 base64，字段名为 hdataenc / dataenc
 * - 签名：报文按 key ASCII 排序拼接 key+value（sign 除外）→ SHA1 →
 *   对 SHA1 的【原始20字节】做 SM2 签名（userId = joininstid）→ 裸 r||s 64字节转 base64
 * - 响应 dataenc 用同一 SM4 密钥解密
 */
class CxwzPay
{
    /** 平台返回码：成功 */
    const RESULT_SUCCESS = '0000';

    /** 预下单业务场景：未支付订单支付申请 */
    const BIZSCENE_PAY = '00';

    /** 退款状态 */
    const REFUND_SUCCESS    = 'SUCCESS';
    const REFUND_FAIL       = 'REFUNDFAIL';
    const REFUND_ABNORMAL   = 'ABNORMAL';
    const REFUND_PROCESSING = 'PROCESSING';

    /** @var array 配置（application/extra/cxwzpay.php） */
    protected $config;

    public function __construct(array $config = [])
    {
        $this->config = array_merge((array)Config::get('cxwzpay'), $config);
    }

    // ==================== 会员系统 ====================

    /**
     * 会员授权访问授权码获取（完成本方会员与平台会员的打通）
     *
     * @param string $memberNo    本方会员唯一ID（sh_user.id）
     * @param string $mobilePhone 会员手机号
     * @param string $authType    01=基本信息 02=基本信息+实名信息
     * @return array ['pltmemberno' => ..., 'authcode' => ...]
     * @throws \Exception 平台返回非成功时抛出
     */
    public function getAuthCode($memberNo, $mobilePhone, $authType = '01')
    {
        return $this->request('/member/authaccess/authcode/get/V1', [
            'authmemberno'    => (string)$memberNo,
            'authmobilephone' => (string)$mobilePhone,
            'authinstid'      => $this->config['authinstid'],
            'authtype'        => $authType,
        ]);
    }

    /**
     * 会员授权访问会员信息查询（授权码换会员信息，含 openid）
     *
     * @param string $authCode  授权码
     * @param string $queryType 01=基本信息 02=基本信息+实名信息
     * @return array ['authmemberno','pltmemberno','nickname','mobilephone','openid',...]
     * @throws \Exception
     */
    public function queryMember($authCode, $queryType = '01')
    {
        return $this->request('/member/authaccess/member/query/V1', [
            'authcode'   => (string)$authCode,
            'authinstid' => $this->config['authinstid'],
            'querytype'  => $queryType,
        ]);
    }

    /**
     * 打通会员并返回平台会员号（授权码获取 + 信息查询 二合一）
     *
     * @param string $memberNo    本方会员唯一ID（sh_user.id）
     * @param string $mobilePhone 会员手机号
     * @return array ['pltmemberno' => ..., 'openid' => ..., 'nickname' => ...]
     * @throws \Exception
     */
    public function bindMember($memberNo, $mobilePhone)
    {
        $auth = $this->getAuthCode($memberNo, $mobilePhone);
        if (empty($auth['authcode'])) {
            throw new \Exception('平台未返回授权码');
        }
        $member = $this->queryMember($auth['authcode']);
        if (empty($member['pltmemberno'])) {
            throw new \Exception('平台未返回会员号');
        }
        return $member;
    }

    // ==================== 支付系统 ====================

    /**
     * 支付预下单（公共收银台模式）
     *
     * @param string $mchntOrderId 商户订单号（全局唯一，<=32位）
     * @param int    $amountFen    订单金额（分）
     * @param string $subject      订单描述（<=100）
     * @param string $memberNo     平台会员号（pltmemberno）
     * @param array  $extra        可选覆盖：openid/notifyurl/ip 等
     * @return array ['orderid' => 平台订单号, 'url' => 收银台url（一次性有效）]
     * @throws \Exception
     */
    public function preorder($mchntOrderId, $amountFen, $subject, $memberNo, array $extra = [])
    {
        $data = array_merge([
            'mchntorderid'   => (string)$mchntOrderId,
            'bizscene'       => self::BIZSCENE_PAY,
            'orderamt'       => (string)(int)$amountFen,
            'subject'        => mb_substr((string)$subject, 0, 100),
            'memberno'       => (string)$memberNo,
            'couponpermit'   => '02', // 押金/租金不允许优惠券抵扣
            'mealcardpermit' => '02',
            'freight'        => '0',  // 文档写 feight，实测字段为 freight
        ], $extra);

        if (!empty($this->config['notify_url']) && !isset($data['notifyurl'])) {
            $data['notifyurl'] = $this->config['notify_url'];
        }

        return $this->request('/acquirer/cashier/payorder/preorder/V1', $data);
    }

    /**
     * 支付订单查询（确认支付状态，也可查退款订单）
     *
     * @param string $mchntOrderId 商户订单号（与 orderid 二选一）
     * @param string $orderId      平台订单号
     * @return array ['mchntorderid','orderid','tradetime','orderamt','payamt','paytype',...]
     * @throws \Exception
     */
    public function queryPayOrder($mchntOrderId = '', $orderId = '')
    {
        $data = [];
        if ($mchntOrderId !== '') {
            $data['mchntorderid'] = (string)$mchntOrderId;
        }
        if ($orderId !== '') {
            $data['orderid'] = (string)$orderId;
        }
        if (!$data) {
            throw new \Exception('商户订单号和平台订单号必须传一个');
        }
        // 文档写 queryPayOrde，实测路径为 queryPayOrder
        return $this->request('/acquirer/cashier/payorder/queryPayOrder/V1', $data);
    }

    /**
     * 申请退款（押金退回等）
     *
     * @param string $mchntOrderId       原支付商户订单号
     * @param string $refundMchntOrderId 退款商户订单号（非成功可用同号重发/查询）
     * @param int    $goodsAmountFen     退款商品金额（分）
     * @param int    $freightFen         退款运费（分）
     * @return array ['status' => SUCCESS|REFUNDFAIL|ABNORMAL|PROCESSING, 'refundpayamt', 'refundtime']
     * @throws \Exception
     */
    public function refund($mchntOrderId, $refundMchntOrderId, $goodsAmountFen, $freightFen = 0)
    {
        $data = [
            'mchntorderid'       => (string)$mchntOrderId,
            'refundmchntorderid' => (string)$refundMchntOrderId,
            'refundgoodsamt'     => (string)(int)$goodsAmountFen,
            'refundfreight'      => (string)(int)$freightFen,
        ];

        if (!empty($this->config['refund_notify_url'])) {
            $data['notifyurl'] = $this->config['refund_notify_url'];
        }

        return $this->request('/acquirer/cashier/payorder/refund/V1', $data);
    }

    /**
     * 退款查询
     *
     * @param string $refundMchntOrderId 退款商户订单号
     * @return array ['status' => ..., 'refundpayamt', 'refundtime']
     * @throws \Exception
     */
    public function queryRefund($refundMchntOrderId)
    {
        return $this->request('/acquirer/cashier/payorder/queryRefund/V1', [
            'refundmchntorderid' => (string)$refundMchntOrderId,
        ]);
    }

    // ==================== 报文处理 ====================

    /**
     * 发起一次平台请求：组装报文 → 加密 → 签名 → POST → 校验返回码 → 解密业务数据
     *
     * @param string $path 接口路径
     * @param array  $data 业务 data 明文
     * @return array 解密后的业务应答 data
     * @throws \Exception result 非 0000 时抛出（消息含平台错误码和描述）
     */
    public function request($path, array $data)
    {
        $hdata = [
            'instid'  => $this->config['instid'],
            'mchntid' => $this->config['mchntid'],
            'chnlid'  => $this->config['chnlid'],
        ];

        $body = [
            'joininstid'  => $this->config['joininstid'],
            'joininstssn' => $this->genSsn(),
            'reqdate'     => date('Ymd'),
            'reqtime'     => date('His'),
            'hdataenc'    => $this->sm4Encrypt($this->jsonEncode($hdata)),
            'dataenc'     => $this->sm4Encrypt($this->jsonEncode($data)),
        ];
        $body['sign'] = $this->sign($body);

        $responseRaw = $this->httpPost($this->config['base_url'] . $path, $this->jsonEncode($body));

        $response = json_decode($responseRaw, true);
        if (!is_array($response) || !isset($response['result'])) {
            Log::error("[CxwzPay] {$path} 非法响应: " . mb_substr($responseRaw, 0, 500));
            throw new \Exception('支付平台响应异常，请稍后重试');
        }

        $result     = (string)$response['result'];
        $resultDesc = (string)($response['resultdesc'] ?? '');
        $decrypted  = [];
        if (!empty($response['dataenc'])) {
            $plain = $this->sm4Decrypt($response['dataenc']);
            $decrypted = json_decode($plain, true) ?: [];
        }

        // PERR 等参数错误时业务数据可能在明文 data 里
        if (!$decrypted && !empty($response['data']) && is_array($response['data'])) {
            $decrypted = $response['data'];
        }

        Log::info("[CxwzPay] {$path} result={$result} desc={$resultDesc}");

        if ($result !== self::RESULT_SUCCESS) {
            throw new \Exception("支付平台错误[{$result}]{$resultDesc}");
        }

        return $decrypted;
    }

    /**
     * 报文签名：key ASCII 排序拼接 key+value（不含 sign）→ SHA1 原始字节
     * → SM2 签名（userId=joininstid）→ 裸 r||s 64字节 base64
     */
    public function sign(array $body)
    {
        unset($body['sign']);
        ksort($body, SORT_STRING);

        $joined = '';
        foreach ($body as $key => $value) {
            $joined .= $key . $value;
        }

        $digest = sha1($joined, true);

        $sm2 = new RtSm2('hex');
        $derHex = trim($sm2->doSign($digest, $this->config['sm2_private'], $this->config['joininstid']));

        return $this->derToRawBase64($derHex);
    }

    /**
     * 验签（平台回调通知用）：同样的拼接规则，用平台公钥验证
     *
     * @param array  $body       含 sign 的完整报文
     * @param string $publicKey  验签公钥（hex，默认取配置 sm2_public）
     * @return bool
     */
    public function verifySign(array $body, $publicKey = '')
    {
        $signB64 = (string)($body['sign'] ?? '');
        if ($signB64 === '') {
            return false;
        }
        unset($body['sign']);
        ksort($body, SORT_STRING);

        $joined = '';
        foreach ($body as $key => $value) {
            $joined .= $key . $value;
        }
        $digest = sha1($joined, true);

        $raw = base64_decode($signB64, true);
        if ($raw === false || strlen($raw) !== 64) {
            return false;
        }

        $sm2 = new RtSm2('hex');
        try {
            return (bool)$sm2->verifySign(
                $digest,
                $this->rawToDerHex($raw),
                strtolower($publicKey !== '' ? $publicKey : $this->config['sm2_public']),
                $this->config['joininstid']
            );
        } catch (\Exception $e) {
            Log::error('[CxwzPay] 验签异常: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * SM4-ECB 加密并转 base64
     */
    public function sm4Encrypt($plain)
    {
        $encrypted = openssl_encrypt($plain, 'sm4-ecb', $this->sm4Key(), OPENSSL_RAW_DATA);
        if ($encrypted === false) {
            throw new \Exception('SM4加密失败');
        }
        return base64_encode($encrypted);
    }

    /**
     * base64 → SM4-ECB 解密
     */
    public function sm4Decrypt($base64)
    {
        $cipher = base64_decode($base64, true);
        if ($cipher === false) {
            throw new \Exception('响应密文base64解码失败');
        }
        $plain = openssl_decrypt($cipher, 'sm4-ecb', $this->sm4Key(), OPENSSL_RAW_DATA);
        if ($plain === false) {
            throw new \Exception('SM4解密失败');
        }
        return $plain;
    }

    /**
     * SM4 密钥：配置为32位hex字符串时转16字节，16字符时按ASCII直接使用
     */
    protected function sm4Key()
    {
        $key = (string)$this->config['sm4_key'];
        if (strlen($key) === 32 && ctype_xdigit($key)) {
            return hex2bin($key);
        }
        return $key;
    }

    /**
     * DER hex 签名 → 裸 r||s 64字节 base64（平台要求的 sign 格式）
     */
    protected function derToRawBase64($derHex)
    {
        $bin = hex2bin($derHex);
        $pos = 2;
        if (ord($bin[1]) & 0x80) {
            $pos += ord($bin[1]) & 0x7f;
        }
        $lenR = ord($bin[$pos + 1]);
        $r = substr($bin, $pos + 2, $lenR);
        $pos = $pos + 2 + $lenR;
        $lenS = ord($bin[$pos + 1]);
        $s = substr($bin, $pos + 2, $lenS);

        $pad = function ($v) {
            return str_pad(ltrim($v, "\x00"), 32, "\x00", STR_PAD_LEFT);
        };
        return base64_encode($pad($r) . $pad($s));
    }

    /**
     * 裸 r||s 64字节 → DER hex（验签时给 SM2 库用）
     */
    protected function rawToDerHex($raw)
    {
        $encodeInt = function ($bin) {
            $bin = ltrim($bin, "\x00");
            if ($bin === '') {
                $bin = "\x00";
            }
            if (ord($bin[0]) & 0x80) {
                $bin = "\x00" . $bin;
            }
            return "\x02" . chr(strlen($bin)) . $bin;
        };
        $body = $encodeInt(substr($raw, 0, 32)) . $encodeInt(substr($raw, 32));
        return bin2hex("\x30" . chr(strlen($body)) . $body);
    }

    /**
     * 接入方流水号：yyyyMMddHHmmss + 6位随机 = 20位全局唯一
     */
    protected function genSsn()
    {
        return date('YmdHis') . str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * JSON 编码（不转义中文和斜杠，保证与签名串一致）
     */
    protected function jsonEncode(array $data)
    {
        return json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    /**
     * HTTPS POST（json）
     */
    protected function httpPost($url, $jsonBody)
    {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $jsonBody,
            CURLOPT_HTTPHEADER     => [
                'Accept: application/json',
                'Content-Type: application/json;charset=utf-8',
            ],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => (int)($this->config['timeout'] ?? 30),
            // dev 环境自签名证书；正式环境如证书有效建议改为开启校验
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => 0,
        ]);
        $response = curl_exec($ch);
        $error    = curl_error($ch);
        curl_close($ch);

        if ($response === false) {
            Log::error("[CxwzPay] 请求失败 {$url}: {$error}");
            throw new \Exception('支付平台网络请求失败，请稍后重试');
        }
        return (string)$response;
    }
}
