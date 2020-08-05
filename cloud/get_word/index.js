// 云函数入口文件
const cloud = require('wx-server-sdk')
var rp = require('request-promise')

cloud.init({
  env: "todo-list-2008m"
})
const db=cloud.database().collection("word")
// 云函数入口函数
exports.main = async (event, context) => {
  var tmp = null
  var ret = null

  await db.where({
    'id': event.userInfo.openId,
    'list_index':event.l_index
  }).get().then(res => {
    tmp = res.data
  })
  if (!tmp.length){
    await rp('http://120.25.204.153:8000/cuter?l_index=' + JSON.stringify(event.l_index) + '&wrong_name=' + JSON.stringify('none'))
      .then(function (htmlString) {

        var data = JSON.parse(htmlString)['info']
        console.log(data)
        if (data == 'no such list!')
          ret = {
            'code': 'error',
            'data': data
          }
        else{
          var t = []
          for (var i = 0; i < data.length; i++)
            t = t.concat(data[i]['id'])
          ret = {
            'code': 'success',
            'data': t
          }
        }
        console.log(ret)
      })
      .catch(function (err) {
        ret = {
          'code': 'error',
          'data': JSON.parse(err)
        }
        console.log(ret)
      })
    if (ret.code == 'success')
      await db.add({
        data: {
          'id': event.userInfo.openId,
          'list': ret.data,
          'list_index': event.l_index
        }
      }).then(res => { 
        ret = { '_id': res._id, 'id': event.userInfo.openId, 'list_index': event.l_index, 'list': ret.data}
      })
  }
  else
    ret = tmp[0]

  return ret
}