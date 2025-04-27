App({
  globalData: {
    phoneNumber: '13031260794'
  },
  onLaunch() {
    // 初始化云开发环境
    if (wx.cloud) {
      wx.cloud.init({
        env: 'cloud-development-env', // 云开发环境ID，请替换为实际环境ID
        traceUser: true,
      });
      console.log('云开发环境初始化成功');
    } else {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    }
  },
  onShow() {
    // 小程序显示时执行
  },
  onHide() {
    // 小程序隐藏时执行
  }
}) 