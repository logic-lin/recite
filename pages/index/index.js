// pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    menu:false,
    sort:'ddl_sort',
    today:"",
    today_sort:0,
    open:false,
    commit:{do_time:"",content:"",ddl:""},
    list:[],
    change:-1
  },
  test() {
    // wx.cloud.callFunction({
    //   name: 'translate',
    //   data:{
    //     word:'user'
    //   },
    //   success: function (res) {
    //     console.log(res.result.data)
    //   },
    //   fail: function (err) {
    //     console.log(err)
    //   }
    // })
  },
  onLoad: function (options) {
    let that = this
    var da = new Date()
    var tmp = da.getFullYear() + "-" + (da.getMonth() < 9 ? "0":'') + (da.getMonth()+1) + '-' + (da.getDate() < 10 ? "0":'')+da.getDate()
    
    this.setData({
      today:tmp,
      today_sort: new Date(tmp)
    })
    wx.getStorage({
      key: 'list',
      success: function(res) {
        that.data.list = res.data
        that.sort(that.data.sort)
      },
    })
    

  },
  menu(){
    this.setData({
      menu: !this.data.menu,
    })
  },
  edit(){
    this.setData({
      open:!this.data.open,
      change: -1,
      commit: { do_time: "", content: "", ddl: "" },
    })

  },
  upload(){
    let that = this
    wx.showModal({
      title: '提示',
      content: '上传将会将本地列表覆盖云端的列表，是否继续执行？',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading({
            title: '同步中',
            mask: true
          })
          wx.cloud.callFunction({
            name: "upload",
            data: { list: that.data.list },
            success(res) {
              wx.hideLoading()
              wx.showToast({
                title: '同步成功',
                icon: 'none',
                duration: 2000
              })
            },
            fail(res) {
              console.log(res)
              wx.hideLoading()
              wx.showToast({
                title: '同步失败',
                icon: 'none',
                duration: 2000
              })
            }
          }); 
        }
      }
    })

  },
  download(){
    let that = this
    wx.showModal({
      title: '提示',
      content: '下载将会获取云端储存的列表覆盖本地列表，是否继续执行？',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading({
            title: '获取中',
            mask: true
          })
          wx.cloud.callFunction({
            name: "download",
            success(res) {
              wx.hideLoading()
              wx.showToast({
                title: '获取成功',
                icon: 'none',
                duration: 2000
              })
              that.data.list = res.result.data[0].data
              that.sort(that.data.sort)
              wx.setStorage({
                key: 'list',
                data: that.data.list,
                success: function (res) {
                  that.setData({
                    list: that.data.list
                  })
                }
              })
            },
            fail(res) {
              wx.hideLoading()
              console.log(res)
              wx.showToast({
                title: '获取失败',
                icon: 'none',
                duration: 2000
              })
            }
          });  
        }
      }
    })
  },
  sorted(){
    this.data.sort = this.data.sort == 'ddl_sort' ? 'do_sort' : 'ddl_sort'
    var tmp = this.data.sort == "ddl_sort" ? 'DDL' : '执行时间'
    wx.showToast({
      title: '切换为' + tmp + '排序',
      icon: 'none',
      duration: 2000
    })
    this.sort(this.data.sort)
  },
  inputed(e){
    if (e.currentTarget.dataset.key == 'content')
      res = e.detail.value
    else
    {
      var tmp = e.detail.value.split('-')
      var res=''
      for(var i =0;i<tmp.length;i++)
        res = res + (tmp[i].length == 1?'0':'') + tmp[i]+'-'
      res = res.substr(0, res.length-1)
    }
    const key = `commit.${e.currentTarget.dataset.key}`
    this.setData({
      [key] : res
    })
  },
  change(e){
    this.setData({
      change: e.currentTarget.dataset.index
    })

    
  },
  cancel(){
    this.setData({
      change: -1
    })
  },
  query(){
    let data = this.data.list[this.data.change]
    this.setData({
      open:true,
      'commit.content': data['content'],
      'commit.ddl': data['ddl'],
      'commit.do_time': data['do_time']
    })
  },
  del(e){
    this.data.list.splice(e.currentTarget.dataset.index, 1)
    let that = this
    wx.setStorage({
      key: 'list',
      data: that.data.list,
      success: function (res) {
        that.setData({
          list: that.data.list,
          change: -1
        })
      }
    })
  },
  commit(){
    let obj = this.data.commit
    var flag = true
    for (let key in obj) {
      if(!obj[key])
        flag = false
    }
    if(flag)
    {
      this.save()
      wx.showToast({
        title: '编辑成功'
      })
    }
    else
      wx.showToast({
        icon: 'none',
        title: '不能存在空'
      })
  },
  save(){
    let change = this.data.change
    let that =this
    if(change+1)
      this.data.list[change] = this.data.commit
    else
      this.data.list.push(this.data.commit)
    this.data.commit.do_sort = new Date(this.data.commit.do_time).getTime()
    this.data.commit.ddl_sort = new Date(this.data.commit.ddl).getTime()


    wx.setStorage({
      key: 'list',
      data: that.data.list,
      success: function (res) {
        that.setData({
          list: that.data.list,
          open: false,
          change: -1,
          commit: {do_time: "", content: "", ddl: ""}
        })
        that.sort(that.data.sort)
      }
    })
  },
  sort(key){
    console.log("sort")
    let list = this.data.list
    var compare = function (prop) {
      return function (obj1, obj2) {
        var val1 = obj1[prop];
        var val2 = obj2[prop]; 
        if (val1 < val2) 
          return -1;
        else
          return 1;
      }
    }
    list.sort(compare(key))
    let today = this.data.today_sort
    let data = this.data.list
    for(var i = 0 ; i<data.length ; i++){
      data[i].rest = Math.ceil((data[i].ddl_sort - today) / (24 * 60 * 60 * 1000))
    }
    this.setData({
      list :this.data.list
    })
    console.log(list)
  }
})