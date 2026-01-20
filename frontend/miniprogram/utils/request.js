const BASE_URL = 'http://localhost:3000' // 根据实际后端地址修改

export function request(options) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: options.header || {},
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          reject(res)
        }
      },
      fail: (err) => {
        // 如果是本地开发没有后端，可以返回 mock 数据或抛出错误
        console.warn('API Request Fail:', options.url, err)
        reject(err)
      }
    })
  })
}

export function getStoredUser() {
  try {
    const userStr = uni.getStorageSync('user')
    return userStr ? JSON.parse(userStr) : null
  } catch (e) {
    return null
  }
}

