// 医疗配送 Webview 测试小程序
// globalData.baseUrl 为医疗配送 H5 的访问地址，可在首页动态修改
App({
  globalData: {
    // 本地开发默认地址（前端 vite dev 端口 5173）
    // 真机 / 生产测试请改为已部署的 https 域名，如 https://microapp.zndkfx.com
    baseUrl: 'http://localhost:5173',
    // 可选：畅行温州 SSO 授权码，填写后访问页面会自动携带 ?authcode=
    authcode: ''
  }
})
