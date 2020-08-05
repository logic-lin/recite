// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: "todo-list-2008m"
})

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database().collection('list')

  var tmp = await db.where({
    'id': event.userInfo.openId
  }).get()
  
  if(tmp.data.length == 0)
    return db.add({
      data: {
        id: event.userInfo.openId,
        data: event.list
      }
    })
  else
    return db.doc(tmp.data[0]._id).update({
      data: {
        data: event.list
      }
    })
    
}