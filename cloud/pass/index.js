// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: "todo-list-2008m"
})

// 云函数入口函数
exports.main = async (event, context) => {
  return cloud.database().collection('word').doc(event._id).update({
    data: {
      list:event.list,
    },
    success: function (res) {
      console.log(res)
    },
    fail: function (res) {
      console.log(res)
    }
  })
}