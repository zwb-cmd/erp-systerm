// 导入jquery
import $ from 'jquery'
import Vue from 'vue'
// 请求服务器路径
export var requestUrl = 'http://192.168.1.150:1401/mock/v1'
// token值
export var token = window.localStorage.getItem('token')
// 后台0,1状态展示
export function exchangeData (origindata) {
  $.each(origindata, function (index, val) {
    if (val.checked !== null) {
      if (val.checked === 0) {
        val.checked = '未审核'
      } else {
        val.checked = '已审核'
      }
    }
    if (val.receipt_status !== null) {
      if (val.receipt_status === 0) {
        val.receipt_status = '未处理'
      } else {
        val.receipt_status = '已处理'
      }
    }
  })
}
// 所有页面搜索方法
export function searchRequest(url, data, callback) {
  var cur = new Vue()
  cur.$http({
      url: url,
      method: 'get',
      data: data,
      headers: {'X-Overpowered-Token': token}
    })
    .then(function (response) {
      callback && callback(response)
    }, function (err) {
      console.log(err)
    })
}
