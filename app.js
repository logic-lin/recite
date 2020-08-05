//app.js
App({
  onLaunch: function () {
    wx.cloud.init({
      env: "todo-list-2008m"
    })
  }, 
  globalData: {
    userInfo: null
  }
})