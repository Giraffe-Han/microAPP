Page({
  data: {
    // Replace this with your actual HTTPS URL
    url: 'https://microapp.wzdkfx.com/'
  },
  onLoad(options) {
    // Enable this if you need to handle shared links or parameters
    if (options.url) {
        this.setData({ url: decodeURIComponent(options.url) });
    }
  }
})
