// 微信小程序 web-view 桥接工具
// H5 运行在小程序 <web-view> 内时，用于与小程序通信（智能返回等）

/**
 * 是否处于微信小程序 web-view 环境
 * __wxjs_environment 由微信在小程序 web-view 中注入，是最可靠的同步判断
 */
export function isMiniProgram() {
  if (typeof window === 'undefined') return false
  if (window.__wxjs_environment === 'miniprogram') return true
  const ua = (navigator.userAgent || '').toLowerCase()
  return /miniprogram/.test(ua) && /micromessenger/.test(ua)
}

/**
 * 直接退回小程序（关闭当前 web-view 页面，回到上一个小程序页面）
 * @param {number} delta 后退的小程序页面层数，默认 1
 * @returns {boolean} 是否成功调用桥接
 */
export function backToMiniProgram(delta = 1) {
  if (window.wx && window.wx.miniProgram && typeof window.wx.miniProgram.navigateBack === 'function') {
    window.wx.miniProgram.navigateBack({ delta })
    return true
  }
  return false
}

const ENTRY_KEY = 'h5EntryPosition'

/**
 * 记录进入 web-view 时的历史基准位置。
 * 每次小程序打开 web-view 都是全新的浏览上下文，sessionStorage 会被清空，
 * 因此仅在本次会话首次调用时记录一次。
 */
export function recordEntryPosition() {
  try {
    if (sessionStorage.getItem(ENTRY_KEY) == null) {
      const pos = window.history.state?.position ?? 0
      sessionStorage.setItem(ENTRY_KEY, String(pos))
    }
  } catch (e) {
    /* ignore */
  }
}

/**
 * 当前是否已回到 web-view 的入口页（没有可回退的 H5 流程内历史）
 */
export function isAtEntry() {
  try {
    const entry = Number(sessionStorage.getItem(ENTRY_KEY) ?? 0)
    const current = window.history.state?.position ?? 0
    return current <= entry
  } catch (e) {
    return true
  }
}

/**
 * 智能返回：
 * - 流程内（还有 H5 历史）：正常回退上一页
 * - 已处于 web-view 入口页：直接退回小程序（非小程序环境则兜底回首页）
 * @param {import('vue-router').Router} router
 */
export function smartBack(router) {
  if (isAtEntry()) {
    if (isMiniProgram() && backToMiniProgram()) return
    // 普通浏览器兜底：回首页，避免退出站点白屏
    if (router) router.replace('/home')
    return
  }
  if (router) router.back()
}
