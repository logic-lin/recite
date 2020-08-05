// 云函数入口文件
const cloud = require('wx-server-sdk')
var rp = require('request-promise')
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  var ret = null
  await rp({
    url:'http://www.youdao.com/w/eng/'+event.word+'/',
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36(KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36',
      'Host': 'www.youdao.com'
    },
    json: true
  })
    .then(function (htmlString) {
      ret = {'code':'success','data':htmlString}
    })
    .catch(function (err) {
      ret = {'code': 'error','data':err}
      console.log(err)
      // res = JSON.parse(err)
      // console.log(res)
    })
    if(ret.code == 'success'){
      var str = ret['data'].replace(/\n/g,'')

      var patrn_ul = /<ul>(.*?)<\/ul>/gi
      var patrn_li = /<li>(.*?)<\/li>/gi
      var ul = patrn_ul.exec(str)[1]

      console.log(ul)

      var list = []
      var tmp
      while ((tmp = patrn_li.exec(ul)) != null)
        list.push(tmp[1])
      ret['data'] = list
    }
  return ret


}