// 云函数入口文件
const cloud = require('wx-server-sdk')
var rp = require('request-promise')
cloud.init()
const admin = 'oZZH25QG-7CX6LzLubaj8lssc1DI'
// 云函数入口函数
exports.main = async (event, context) => {
  var ret = { code: 'success', data: 'no right!' }
  if (event.userInfo.openId == admin){
    
    await rp('http://120.25.204.153:8000/cuter?l_index=' + JSON.stringify(event.l_index) + '&wrong_name=' + JSON.stringify(event.wrong_name))
      .then(function (htmlString) {
        var data = JSON.parse(htmlString)
        ret = { code: 'success', data: data }
      })
      .catch(function (err) {
        console.log(err)
        ret = {code:'error',data:err}
        // res = JSON.parse(err)
        // console.log(res)
      })
  }
  return ret


}