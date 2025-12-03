Page({
  data: {
    // Replace this with your actual HTTPS URL
    url: 'http://172.16.158.58:5174/low-altitude/home/'
  },
  onLoad(options) {
    // Enable this if you need to handle shared links or parameters
    if (options.url) {
        this.setData({ url: decodeURIComponent(options.url) });
    }
  }
})
