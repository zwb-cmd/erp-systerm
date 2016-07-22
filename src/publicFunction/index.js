// 导入jquery
import $ from 'jquery'
import Vue from 'vue'
// 请求服务器路径
export var requestUrl = 'http://192.168.1.150:1401/v1'
//  请求服务器路径真实接口
export var requestSystemUrl = 'http://192.168.1.150:1401/v1'
var token = window.localStorage.getItem('token') ? window.localStorage.getItem('token') : ''
// 后台0,1状态展示
export function exchangeData(origindata) {
  $.each(origindata, function (index, val) {
    if (val.checked !== undefined) {
      if (val.checked === 0) {
        val.checked = '未审核'
      } else if (val.checked === 1) {
        val.checked = '已审核'
      } else {
        val.checked = '已完成'
      }
    }
    if (val.receipt_status !== undefined) {
      if (val.receipt_status === 0) {
        val.receipt_status = '未处理'
      } else {
        val.receipt_status = '已处理'
      }
    }
    if (val.status !== undefined) {
      if (val.status === 0) {
        val.status = '关闭'
      } else {
        val.status = '开启'
      }
    }
  })
}
//后台登录方法
export function adminLogin(loginUrl, data) {
  var cur = new Vue()
  cur.$http.post(loginUrl, data).then(function (response) {
    var curtoken = response.headers('X-Overpowered-Token-Set')
    window.localStorage.setItem('token', curtoken)
    token = window.localStorage.getItem('token')
    window.location.href = '?#!/admin/setting'
  }, function (err) {
    console.log(err)
  })
}
// 导出token
export {token}
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
// 删除按钮请求方法
export function deleteRequest(url, id, callback) {
  var cur = new Vue()
  cur.$http({
    url: url + id,
    method: 'delete',
    headers: {'X-Overpowered-Token': token}
  })
    .then(function (response) {
      callback && callback(response)
    }, function (err) {
      console.log(err)
    })
}
// 审核按钮请求方法
export function checkRequest(url, id, callback) {
  var cur = new Vue()
  cur.$http({
    url: requestUrl + url + id,
    method: 'put',
    headers: {'X-Overpowered-Token': token}
  })
    .then(function (response) {
      callback && callback(response)
    }, function (err) {
      console.log(err)
    })
}
// 完成按钮请求方法
export function finishRequest(url, id, callback) {
  var cur = new Vue()
  cur.$http({
    url: requestUrl + url + id,
    method: 'put',
    headers: {'X-Overpowered-Token': token}
  })
    .then(function (response) {
      callback && callback(response)
    }, function (err) {
      console.log(err)
    })
}
// 获取数据的方法
export function getDataFromApi(url, data, callback) {
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
      if (err.status === 401) {
        window.location.href = '?#!/admin/login'
      }
    })
}
//  post提交数据的方法
export function postDataToApi(url, data, callback) {
  var cur = new Vue()
  cur.$http({
    url: url,
    method: 'post',
    data: data,
    headers: {'X-Overpowered-Token': token}
  })
    .then(function (response) {
      callback && callback(response)
    }, function (err) {
      console.log(err)
    })
}
//错误处理-mfy
export function listDataError(err) {
  console.log(err)
}
