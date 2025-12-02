Page({
  data: {
    // Replace this with your actual HTTPS URL
    url: 'https://29c46993.r7.cpolar.cn/home'
  },
  onLoad(options) {
    // Enable this if you need to handle shared links or parameters
    if (options.url) {
        this.setData({ url: decodeURIComponent(options.url) });
    }
  }
})
