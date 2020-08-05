
Page({

  /**
   * 页面的初始数据
   */
  data: {
    _id:null,
    list: [],
    check_list:[],
    important_list:[],
    list_index:1,
    page:0,
    index:-1,
    width:180,
    opacity: 1.0,
    is_trans:false,
    translation:[],
    is_important:false,
    mode:false//true为重点模式
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    Array.prototype.remove = function (val) {
      var index = this.indexOf(val);
      if (index > -1) {
        this.splice(index, 1);
      }
    };
    wx.setNavigationBarTitle({
      title: '单词普通模式',
    })
},

getList(){
  let that = this
  wx.showLoading({
    title: '获取List'+that.data.list_index+'中',
    mask:true
  })
  wx.cloud.callFunction({
    name: 'get_word',
    data: {
      l_index: that.data.list_index
    }
  }).then(res => {
    console.log(res)
    let data = res.result.data
    if (data == 'no such list!') {
        wx.showToast({
          title: '不存在该单词列表',
          icon: 'none',
          duration: 1500
        })
        return
    }
    that.setData({
      _id: res.result._id,
      check_list: res.result.list,
      list: [].concat(res.result.list),
      index:0,
      mode:false
    })
    wx.hideLoading()
  }).catch(err => {
    console.log(err)
    wx.showToast({
      title: '获取失败',
      icon: 'none',
      duration: 1500
    })
    wx.hideLoading()
  })
  
},
hide(){
  this.setData({
    opacity:this.data.opacity == 1.0?0.2:1.0
  })
},
next(){
  if (this.data.list.length){
    let index = this.data.index
    let list = this.data.list
    if (index < list.length - 1)
      this.setData({
        index: index + 1,
      })
    else
      wx.showToast({
        title: '已到末尾',
        icon: 'none',
        duration: 1500
      })
  }
  
},
last(){
  if(this.data.list.length){
    let index = this.data.index
    let list = this.data.list
    if (index > 0)
      this.setData({
        index: index - 1,
      })
    else
      wx.showToast({
        title: '已到头',
        icon: 'none',
        duration: 1500
      })
  }
  
},
toHead(){
  if (this.data.list.length)
    this.setData({
      index: 0
    })
},
toEnd(){
  if (this.data.list.length)
    this.setData({
      index: this.data.list.length-1
    })

},
listchange(e){
  this.setData({
    list_index:parseInt(e.detail.value)
  })
},
sliderchange(e){
  this.setData({
    width:e.detail.value*2+100
  })
  console.log(this.data.width)

},
know(){

  if (this.data.list.length) {
    let index = this.data.index
    let list = this.data.list
    list.splice(index,1)
    this.setData({
      list: list,
      index: index>=list.length?list.length-1:index
    })
  }
},
wrong(){
  let that = this
  let str = this.data.list[this.data.index]
  var name = str.split('|')[0]
  console.log(name)
  if (this.data.list.length) {
    wx.showModal({
      title: '提示',
      content: '确认要删除该页面吗？',
      success: function (res) {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'wrong_word',
            data: {
              l_index: that.data.list_index,
              wrong_name: name
            }
          }).then(res=>{
            console.log(res)
            if (res.result.data.info == 'success')
              that.pass()
          })
        } 
      }
    })
  }
},
pass(){
  if (this.data.list.length) {
    wx.showLoading({
      title: '',
      mask:true
    })
    let that = this
    this.data.check_list.remove(this.data.list[this.data.index])
    this.data.check_list.remove(this.data.list[this.data.index]+'|sign')
    wx.cloud.callFunction({
      name: 'pass',
      data: {
        list: that.data.check_list,
        _id:that.data._id
      }
    }).then(res => {
      console.log(res)
      wx.hideLoading()
      that.know()
    }).catch(e=>{
      console.log(e)
      wx.showToast({
        title: '网络连接错误',
        icon: 'none',
        duration: 1500
      })
      wx.hideLoading()
    })   
  }
},
input_word(e){
  this.setData({
    check_word: e.detail.value
  })
},
translate() {
  let that = this
  if (that.data.check_word)
    wx.cloud.callFunction({
      name: 'translate',
      data: {
        word: that.data.check_word
      },
      success: function (res) {
        if(res.result.code == 'success')
          that.setData({
            translation: res.result.data
          })
        else
          wx.showToast({
            title: '获取翻译失败',
            icon: 'none',
            duration: 1500
          })
        
      },
      fail: function (err) {
        console.log(err)
      }
    })
  else
    wx.showToast({
      title: '不能为空',
      icon: 'none',
      duration: 1500
    })

},
trans(){
  this.setData({
    is_trans: !this.data.is_trans
  })
  // this.translate(this.data.check_word)
},
sign(){
  if (this.data.list.length) {
    wx.showLoading({
      title: '标记中...',
      mask: true
    })

    let that = this
    let check_list = this.data.check_list
    var str = this.data.list[this.data.index]
    var tmp = str.split('|')
    console.log(str)
    check_list.splice(check_list.indexOf(str), 1, tmp.length > 1 ? tmp[0] : tmp[0] + '|sign')
    this.data.list.splice(this.data.list.indexOf(str), 1, tmp.length > 1 ? tmp[0] : tmp[0] + '|sign')

    wx.cloud.callFunction({
      name: 'pass',
      data: {
        list: that.data.check_list,
        _id: that.data._id
      }
    }).then(res => {
      console.log(res)
      that.setData({
        index: that.data.index,
        list: that.data.list
      })
      console.log(that.data)
      wx.hideLoading()
    }).catch(e => {
      console.log(e)
      wx.showToast({
        title: '网络连接错误',
        icon: 'none',
        duration: 1500
      })
      wx.hideLoading()
    })
  }

},
change_mode(){
  var mode = this.data.mode
  let list = this.data.check_list
  var tmp = []

  if(!mode){
    for(var i = 0 ; i < list.length ; i++)
      if (list[i].indexOf('|') > 0)
        tmp.push(list[i])
    this.setData({
      list : tmp,
      index: tmp.length ? 0 : -1
    })
  }
  else
    this.setData({
      list: tmp.concat(list),
      index: list.length?0:-1
    })
  
  this.setData({
    mode: !mode
  })
  console.log(this.data)
  wx.setNavigationBarTitle({
    title: mode ? '单词普通模式' :'单词重点模式'
  })
},
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})