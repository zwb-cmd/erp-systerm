<template>
  <admin-nav></admin-nav>
  <div class="container-fluid">
    <div class="row">
      <left-instock></left-instock>
      <div class="col-lg-10">
        <!-- 路径导航 -->
        <ol class="breadcrumb">
          <li class="active"><span class="glyphicon glyphicon-home c-erp" aria-hidden="true"></span> 您当前的位置：库存</li>
          <li class="active">库存配送出库</li>
          <li class="active">查看</li>
        </ol>
        <!--详情页面-->
        <summary-detail
          :table-header="gridColumns"
          :table-data="list"
          :grid-operate="gridOperate"
          :edit-flag.sync="editFlag"
          :check-url = 'checkUrl'
          :is-exist = 'isExist'
          :has-validate-authority="authority.validate"
          :has-edit-authority="authority.edit"
        >
        </summary-detail>
        <!--有列表切换的时候的情况-->
        <ul class="nav nav-tabs" role="tablist">
          <li role="presentation" class="active" @click="changeActive($event)" id="1"><a href="javascript:void(0)" data-toggle="tab">出库明细</a></li>
          <li role="presentation" @click="changeActive($event)" id="2"><a href="javascript:void(0)" data-toggle="tab">出库汇总</a></li>
        </ul>
        <!-- Tab panes -->
        <div class="tab-content">
          <!-- 入库明细 -->
          <div role="tabpanel" class="tab-pane active" v-if="detailModal">
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
                <td>{{entry.goods_code}}</td>
                <td>{{entry.goods_name}}</td>
                <td>{{entry.origin_stock_amount}}</td>
                <td>{{entry.target_stock_amount}}</td>
                <td>{{entry.purchase_amount}}</td>
                <td v-if="!editFlag">{{entry.number}}</td>
                <td v-if="editFlag"><count :count.sync =entry.number :flag.sync="editFlag"></count></td>
                <td>{{entry.unit_name}}</td>
                <td>{{entry.unit_specification}}</td>
                <td>{{entry.reference_number}}</td>
              </tr>
              </tbody>
            </table>
          </div>

          <!-- 入库汇总 -->
          <div role="tabpanel" class="tab-pane active"  v-if="summaryModal">
            <!--表格详情列表-->
            <table class="table table-striped table-bordered table-hover">
              <thead>
              <tr class="text-center">
                <th v-for="value in  gridColumns3">
                  {{value}}
                </th>
              </tr>
              </thead>
              <tbody>
              <tr class="text-center" v-for="entry in summarystockGoods" track-by="$index" :id="[entry.id ? entry.id : '']">
                <td>{{entry.goods_code}}</td>
                <td>{{entry.goods_name}}</td>
                <td>{{entry.origin_stock_amount}}</td>
                <td>{{entry.target_stock_amount}}</td>
                <td>{{entry.purchase_amount}}</td>
                <td>{{entry.item_amount}}</td>
                <td>{{entry.unit_name}}</td>
                <td>{{entry.unit_specification}}</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <!--错误信息-->
      <error-tip :err-modal.sync="modal.errModal" :err-info="modal.errInfo"></error-tip>
    </div>
  </div>
</template>
<style>
</style>
<script>
  import $ from 'jquery'
  import Grid from '../../../common/Grid'
  import Page from '../../../common/Page'
  import AdminNav from '../../AdminNav'
  import Modal from '../../../common/Modal'
  import Summary from '../../../common/Summary'
  import DatePicker from  '../../../common/DatePicker'
  import LeftInstock from '../../common/LeftInstock'
  import SummaryDetail from '../../../common/SummaryDetail'
  import Count from '../../../common/Count'
  import ErrorTip  from '../../../common/ErrorTip'
  import {requestUrl,requestSystemUrl,getDataFromApi,token,exchangeData,detailNull,searchRequest,deleteRequest,checkRequest,finishRequest,putDataToApi,systermAuthority} from '../../../../publicFunction/index'
  export default{
    components: {
      Grid: Grid,
      Page: Page,
      Modal: Modal,
      AdminNav: AdminNav,
      Summary: Summary,
      DatePicker: DatePicker,
      LeftInstock:LeftInstock,
      SummaryDetail: SummaryDetail,
      Count: Count,
      ErrorTip: ErrorTip
    },
    events: {
//    绑定翻页事件
      pagechange: function (currentpage) {
        var self = this
        this.$http({
          url:requestSystemUrl + '/backend-system/purchase/purchase',
          data: {
            page: currentpage
          },
          method: 'get',
          headers: {'X-Overpowered-Token': token}
        }).then(function (response) {
          self.page = response.data.body.pagination
          self.list = response.data.body.list
          exchangeData(self.list)
        }, function (err) {
          console.log(err)
        })
      },
//     完成請求
      finishFromApi: function (id) {
        var self = this
        finishRequest(requestSystemUrl +'/backend-system/purchase/purchase/'+ id +'/finished',function(response){
          console.log('finished')
        })
      },
//         审核失败
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
        this.isExist =  true
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
          obj['amount'] = val.number
          obj['reference_type'] = val.item_type
          item.push(obj)
        })
        var data = {
          items: item
        }
        var url = requestSystemUrl + '/backend-system/stock/distribution/'+ id
        putDataToApi(url,data,function (res) {
          self.editFlag = false
          self.isExist =  false
          self.listData()
        },function (err){
          self.editFlag = true
          self.isExist = true
          self.modal.errModal = true
          self.modal.errInfo = "服务器错误"
        })
      }
    },
    ready: function () {
      this.listData()
//     权限判断
      if(systermAuthority.indexOf('distribution-out-list-check') > -1) {
        this.authority.validate = true
      }
      if(systermAuthority.indexOf('distribution-out-list-edit') > -1) {
        this.authority.edit = true
      }
    },
    methods: {
      listData: function (page) {
        var currentId = this.$route.params.queryId
        var self = this
//        获取商品列表详情
        var url = requestSystemUrl + '/backend-system/stock/distribution/' + currentId
//       获取单个列表详情
        var purchaseUrl  = requestSystemUrl + '/backend-system/stock/distribution/' + currentId + '/get'
//       获取商品列表详情
        getDataFromApi(url,{},function(response){
          self.detailList = response.data.body.list
        })
//        获取采购列表详情
        getDataFromApi(purchaseUrl,{},function(response){
          self.list = response.data.body
          exchangeData(self.list)
        })
      },
      //       切换
      changeActive: function (event) {
        var cur = $(event.currentTarget)
        cur.addClass('active').siblings('li').removeClass('active')
        switch (Number(cur.attr('id'))){
          case 1:
            this.detailModal = true
            this.summaryModal = false
            break
          case 2:
            this.detailModal = false
            this.summaryModal = true
            this.summary()
        }
      },
      //          汇总方法
      summary: function () {
        var self = this
        self.summaryPrice = 0
        this.summarystockGoods = []
        this.summarystockGoods =this.summarystockGoods.concat(self.detailList)
        $.each(this.summarystockGoods,function (index,val){
          val.item_amount = val.number
        })
        this.summarystockGoods = this.summaryMethod ("goods_code", this.summarystockGoods)
      },
//     汇总方法
      summaryMethod: function (ObjPropInArr, array){
        var hash={};
        var result=[];
        for(var i=0;i<array.length;i++){
          if(hash[array[i][ObjPropInArr]]){
            hash[array[i][ObjPropInArr]].item_amount=Number(array[i].item_amount) + Number( hash[array[i][ObjPropInArr]].item_amount)
          }else{
            hash[array[i][ObjPropInArr]]=array[i];
          }
        }
        for(var j in hash){
          result.push(hash[j])
        }
        return result
      }
    },
    data: function () {
      return {
        page: [],
        list: {},
        detailList: [],
        summarystockGoods: [],
        isExist: false,
        editFlag: false,
        detailModal: true,
        summaryModal: false,
        checkUrl: requestSystemUrl + '/backend-system/stock/distribution/',
        modal:{
          errModal: false,
          errInfo: 'high,这是错误提示'
        },
        authority: {
          validate: false,
          edit: false
        },
        gridColumns: {
          order_number: '配送单号',
          checked: '审核状态',
          stream_origin_name: '出货仓库',
          warehouse_name: '调入仓库',
          creator_name: '制单人',
          auditor_name: '审核人',
          operated_at: '配送时间',
          amount: '配送数量'
        },
        gridColumns2: {
          goods_code: "货号",
          goods_name: "品名",
          origin_stock_amount: "出货仓库库存",
          target_stock_amount:"调入仓库库存",
          purchase_amount:"要货数量",
          number:"配送数量",
          unit_name: "采购单位",
          unit_specification: '单位规格',
          reference_number: '来源要货单号',
        },
        gridColumns3: {
          code: "货号",
          name: "品名",
          specification_unit:"出货仓库库存",
          aruc: "调入仓库库存",
          order_quantity:"要货数量",
          purchase_quantity:"配送数量",
          purchase_price:"采购单位",
          unit_specification: "单位规格"
        }
      }
    }
  }
</script>
