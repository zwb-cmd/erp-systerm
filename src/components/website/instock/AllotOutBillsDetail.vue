<template>
  <site-nav></site-nav>
  <div class="container-fluid">
    <!-- 路径导航 -->
    <ol class="breadcrumb">
      <li class="active"><span class="glyphicon glyphicon-home c-erp" aria-hidden="true"></span> 您当前的位置：库存首页</li>
      <li class="active">调拨出库单汇总</li>
      <li class="active">查看调拨出库单汇总</li>
    </ol>
    <summary-detail
      :table-header="gridColumns"
      :table-data="list"
      :check-url="checkUrl"
      :is-exist.sync= "isExist"
      :edit-flag.sync = 'editFlag'
      :has-validate-authority="true"
      :has-edit-authority="true"
    >
    </summary-detail>
    <!--表格详情列表-->
    <table class="table table-striped table-bordered table-hover">
      <thead>
      <tr class="text-center">
        <th v-for="value in  gridColumns2">
          {{value}}
        </th>
      </tr>
      </thead>
      <tbody>
      <tr class="text-center" v-for="entry in detailList" track-by="$index" :id="[entry.id ? entry.id : '']">
        <td>{{entry.item_code}}</td>
        <td>{{entry.item_name}}</td>
        <td v-if='editFlag'> <count :count.sync='entry.main_reference_value'></count></td>
        <td v-if='!editFlag'>{{entry.main_reference_value}}</td>
        <td>{{entry.unit_name}}</td>
        <td>{{entry.unit_specification}}</td>
      </tr>
      </tbody>
    </table>
  </div>
  <!--错误信息-->
  <error-tip :err-modal.sync="modal.errModal" :err-info="modal.errInfo"></error-tip>
</template>
<script>
  import SiteNav from '../SiteNav'
  import SummaryDetail from '../../common/SummaryDetail'
  import Count from '../../common/Count'
  import ErrorTip from '../../common/ErrorTip'
  import {requestUrl,requestSystemUrl, exchangeData, error,getDataFromApi,putDataToApi} from '../../../publicFunction/index'
  export default {
    components: {
      SummaryDetail: SummaryDetail,
      SiteNav: SiteNav,
      Count: Count,
      ErrorTip: ErrorTip
    },
    events: {
//    绑定翻页事件
      pagechange: function (currentpage) {
//        this.detailListData(currentpage)
        console.log(currentpage)
      },
//      审核失败
      checkFail: function (err){
        var self = this
        if(Number(err.data.code) === 220000){
          self.modal.errModal = true
          self.modal.errInfo =  '库存不足，操作被拒绝'
        }
      },
      //      编辑
      editGoods: function (event) {
        this.editFlag = true
      },
//      保存
      saveGoods: function (event) {
        var self = this
        var id = self.$route.params.queryId
        var item = []
        $.each(self.detailList,function (index,val) {
          var obj = {}
          obj['reference_id'] = val.item_id
          obj['id'] = val.id
          obj['amount'] = val.main_reference_value
          item.push(obj)
        })
        var data = {
          items: item
        }
        var url = requestSystemUrl + '/front-system/stock/distribution/'+ id
        putDataToApi(url,data,function (res) {
//      单条数据渲染
          self.thisOneData()
//      明细列表渲染
          self.listData({})
          self.isExist = false
          self.editFlag = false
        },function(){
            self.editFlag = true
            self.isExist = true
            self.modal.errModal = true
            self.modal.errInfo = '服务器错误'
        })
      }
    },
    ready: function () {
      var str = window.location.href
      var num = str.indexOf('AllotOutBills') + 14
      var id = str.substr(num)
      this.id = id
//      单条数据渲染
      this.thisOneData()
//      明细列表渲染
      this.listData(1)
    },
    methods: {
//      当前id的一条数据
      thisOneData: function () {
        var self = this
        getDataFromApi(requestUrl + '/front-system/stock/distribution/' + this.id + '/detail',{},function(response){
          self.list = response.data.body
          exchangeData(self.list)
        })
      },
//      明细列表渲染 /front-system/stock/products/{id}/detail
      listData: function (page) {
        var self = this
        getDataFromApi(requestUrl + '/front-system/stock/distribution/' + this.id,{},function(response){
          self.page = response.data.body.pagination
          self.detailList = response.data.body.list
        })
      }
    },
    data: function () {
      return {
        id: 0,
        page: [],
        list: [],
        isExist: false,
        detailList: [],
        checkUrl: requestUrl + '/front-system/stock/distribution/',
        gridOperate: true,
        gridColumns: {
          order_number: '单号',
          checked: '审核状态',
          warehouse_name: '收货仓库',
          creator_name: '制单人',
          auditor_name: '审核人',
          operated_at: '出货日期',
          amount: '要货数量'
        },
        modal:{
          errModal: false,
          errInfo: ''
        },
        editFlag: false,
        gridColumns2: {
          item_code: '货号',
          item_name: '品名',
          number: '出货数量',
          unit_name: '单位',
          unit_specification: '单位规格'
        }
      }
    }
  }
</script>
<style scoped>
  table thead tr th {
    text-align: center
  }

  table thead tr th:first-child {
    text-align: left;
  }

  table tbody tr td:first-child {
    text-align: left;
  }
</style>

