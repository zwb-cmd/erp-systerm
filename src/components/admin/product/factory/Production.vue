<template>
  <admin-nav></admin-nav>
  <div class="container-fluid">
    <div class="row">
      <left-production></left-production>
      <div class="col-lg-10">
        <!-- 路径导航 -->
        <ol class="breadcrumb">
          <li class="active"><span class="glyphicon glyphicon-home c-erp" aria-hidden="true"></span> 您当前的位置：生产首页</li>
          <li class="active">工厂生产单</li>
          <li class="active">列表</li>
        </ol>

        <!-- 页头 -->
        <div class="page-header">
          <form class="form-inline">
            <div class="form-group">
              <label>单号</label>
              <input type="text" class="form-control" placeholder="请输入单号" v-model="searchData.document_number">
            </div>
            <div class="form-group ml10">
              <label>审核状态</label>
              <select class="form-control" v-model="searchData.checked">
                <option value="">请选择</option>
                <option value="0">未审核</option>
                <option value="1">已审核</option>
              </select>
            </div>
            <div class="form-group ml10">
              <label>制单人</label>
              <select class="form-control" v-model="searchData.creator_id">
                <option value="">请选择</option>
                <option :value="item.id" v-for="item in orderMaker">{{item.name}}</option>
              </select>
            </div>
            <div class="form-group ml10 ">
              <label>制单时间段</label>
              <date-picker :value.sync="searchData.start_time" :time-text="timetext1"
                           :timewidth="timewidth"></date-picker>
              <date-picker :value.sync="searchData.end_time" :time-text="timetext2"
                           :timewidth="timewidth"></date-picker>
            </div>
            <div class="form-group">
              <label>生产时间段</label>
              <date-picker :value.sync="searchData.start_receive_time" :time-text="timetext1"
                           :timewidth="timewidth"></date-picker>
              <date-picker :value.sync="searchData.end_receive_time" :time-text="timetext2"
                           :timewidth="timewidth"></date-picker>
            </div>
            <span type="submit" class="btn btn-primary" @click="searchMethod(1)">搜索</span>
            <span class="btn btn-warning" @click="cancelSearch()">撤销搜索</span>
            <a :href="exports" target="_blank" v-if="authority.exports"><span class="btn btn-info spanblocks fr mr10">导出</span></a>
            <span v-if="authority.create" class="btn btn-info spanblocks fr mr10" v-link="{ path: '/admin/production/factoryProduction/factoryCreat'}">新建生产单</span>
          </form>
        </div>
        <!-- 表格 -->
        <summary
          :table-data="list"
          :table-header="gridColumns"
          :page="page"
          :check-url="checkUrl"
          :finish-url="checkUrl"
          :finish-flag="true"
          :has-validate-authority="authority.validate"
          :has-look-authority = "authority.look"
          :has-finish-authority="authority.finish"
          :has-delete-authority= "authority.delete"
        >
        </summary>
        <!--错误信息-->
        <error-tip :err-modal.sync="modal.errModal" :err-info="modal.errInfo"></error-tip>
      </div>
    </div>
  </div>
</template>
<style scoped>
  .timewidth{
    width:100px;
  }
</style>
<script>
  import $ from 'jquery'
  import Grid from '../../../common/Grid'
  import Page from '../../../common/Page'
  import AdminNav from '../../AdminNav'
  import Modal from '../../../common/Modal'
  import Summary from '../../../common/Summary'
  import DatePicker from  '../../../common/DatePicker'
  import LeftProduction from '../../common/LeftProduction'
  import ErrorTip from '../../../common/ErrorTip'
  import {
    requestUrl,
    requestSystemUrl,
    getDataFromApi,
    token,
    exchangeData,
    searchRequest,
    deleteRequest,
    checkRequest,
    finishRequest,
    systermAuthority,
    changeStatus} from '../../../../publicFunction/index'
  export default{
    components: {
      Grid: Grid,
      Page: Page,
      Modal: Modal,
      AdminNav: AdminNav,
      Summary: Summary,
      DatePicker: DatePicker,
      ErrorTip: ErrorTip,
      LeftProduction: LeftProduction
    },
    events: {
//    绑定翻页事件
      pagechange: function (currentpage) {
        this.searchMethod(currentpage)
      },
//     删除请求
      deleteFromApi: function (id) {
        var self = this
        deleteRequest(requestSystemUrl + '/backend-system/produce/factory/'+ id,function(response){
          self.listData({})
        })
      },
//     完成請求
      finishFromApi: function (id) {
        var self = this
        finishRequest(requestSystemUrl + '/backend-system/produce/factory/'+ id +'/finished',function(response){
          console.log('finished')
        })
      },
//    查看详情
      gotoDetail: function (id){
        window.location.href = '/#!/admin/production/factoryProduction/detail/'+ id
      },
      //    审核失败
      checkFail: function (err){
        var self = this
        if(Number(err.data.code) === 220000){
          self.modal.errModal = true
          self.modal.errInfo = '库存不足，操作被拒绝'
        }
      }
    },
    ready: function () {
      var self = this
//      获取制单人
      getDataFromApi( requestUrl + '/backend-system/store/get/account',{},function(response){
        self.orderMaker = response.data.body.list
      })
      this.listData({})
//    权限判断
//      查看
      if(systermAuthority.indexOf('factory-produce-list-index') > -1){
        this.authority.look = true
      }
//      审核
      if(systermAuthority.indexOf('factory-produce-list-check') > -1){
        this.authority.validate = true
      }
//      完成
      if(systermAuthority.indexOf('factory-produce-list-over') > -1){
        this.authority.finish = true
      }
//      删除
      if(systermAuthority.indexOf('factory-produce-list-delete') > -1){
        this.authority.delete = true
      }
//      导出
      if(systermAuthority.indexOf('factory-produce-list-export') > -1){
        this.authority.exports = true
      }
//      新建
      if(systermAuthority.indexOf('factory-produce-list-create') > -1){
        this.authority.create = true
      }
    },
    methods: {
//      列表数据渲染
      listData: function (data) {
        var self = this
        var url = requestUrl + '/backend-system/produce/factory'
        getDataFromApi(url,data,function(response){
          self.list = response.data.body.list
          self.page = response.data.body.pagination
          exchangeData(self.list)
        })
      },
      searchMethod: function (page) {
        var data ={
          document_number: this.searchData.document_number || '',
          checked: this.searchData.checked || '',
          creator_id: this.searchData.creator_id || '',
          start_time: this.searchData.start_time,
          end_time: this.searchData.end_time,
          start_receive_time: this.searchData.start_receive_time || '',
          end_receive_time: this.searchData.end_receive_time || '',
          type: 'ManageAccount',
          page:page
        }
        this.listData(data)
      },
//    撤销搜索
      cancelSearch: function () {
        this.searchData.document_number = ''
        this.searchData.start_time = ''
        this.searchData.end_time = ''
        this.searchData.start_receive_time = ''
        this.searchData.end_receive_time = ''
        this.searchData.checked = ''
        this.searchData.creator_id = ''
        this.listData()
      }
    },
    computed: {
//      导出
      exports: function () {
        var url = requestSystemUrl + '/backend-system/' + token + '/export' + '/produce/factory'
        var data =
          'document_number=' + this.searchData.document_number + '&' +
          'checked=' + this.searchData.checked + '&' +
          'creator_id=' + this.searchData.creator_id + '&' +
          'start_time=' + this.searchData.start_time + '&' +
          'end_time=' + this.searchData.end_time + '&' +
          'start_receive_time=' + this.searchData.start_receive_time + '&' +
          'end_receive_time=' + this.searchData.end_receive_time
        return this.exportUrl = url + '/export-excel?' + data
      }
    },
    data: function () {
      return {
        timetext1: '开始时间',
        timetext2: '结束时间',
        checkUrl: requestSystemUrl + '/backend-system/produce/factory/',
        page: [],
        list: [],
        warehouseList: [],
        modal:{
          errModal: false,
          errInfo: 'high,这是错误提示'
        },
        time:{
          startTime:'',
          startTime1:'',
          endTime:'',
          endTime1:'',
        },
        orderMaker: [],
        gridColumns: {
          document_number: '生产单号',
          checked: '审核状态',
          creator_name: '制单人',
          auditor_name: '审核人',
          created_at: '制单时间',
          operated_at: '生产时间',
          amount: '生产数量'
        },
        timewidth: "timewidth",
        searchData: {
          document_number: '',
          checked: '',
          start_time: '',
          end_time: '',
          start_receive_time: '',
          end_receive_time: '',
          stream_origin_id: '',
          creator_id: ''
        },
        authority: {
          validate: false,
          look: false,
          finish: false,
          delete: false,
          exports: false,
          create: false
        }
      }
    }
  }
</script>
