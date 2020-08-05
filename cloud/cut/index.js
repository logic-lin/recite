// 云函数入口文件
const cloud = require('wx-server-sdk')
const cv = require('opencv')
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const fileID = 'cloud://todo-list-2008m.746f-todo-list-2008m-1301183520/4_Im4.jpeg'
  const res = await cloud.downloadFile({
    fileID: fileID,
  })
  const buffer = res.fileContent
  return buffer.toString('base64')
}