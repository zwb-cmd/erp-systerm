<template>
  <site-nav></site-nav>
  <div class="container-fluid">
    <!-- 路径导航 -->
    <ol class="breadcrumb">
      <li class="active"><span class="glyphicon glyphicon-home c-erp" aria-hidden="true"></span> 您当前的位置：会员首页</li>
      <li class="active">会员明细</li>
    </ol>

    <table class="table table-striped table-bordered table-hover" :data="memberData">
      <thead>
      <tr class="text-center">
        <th v-for="value in memberColumns">
          {{value}}
        </th>
        <th>操作</th>
      </tr>
      </thead>
      <tbody>
      <tr class="text-center" id="{{memberData.id}}">
        <td>{{memberData.card_number}}</td>
        <td>{{memberData.balance}}</td>
        <td>{{memberData.score}}</td>
        <td>{{memberData.name}}</td>
        <td>{{memberData.mobile_phone}}</td>
        <td>{{memberData.birthday}}</td>
        <td>{{memberData.member_type}}</td>
        <td>{{memberData.register_store_name}}</td>
        <td>
            <span class="btn btn-primary btn-sm" @click="recharge($event)">充值</span>
            <span class="btn btn-info btn-sm" @click="updateMember($event)">编辑</span>
        </td>
      </tr>
      </tbody>
    </table>

    <!-- 表格 -->
    <grid :data="gridData" :columns="gridColumns" :operate="gridOperate"></grid>
    <!-- 翻页 -->
    <page
      :total='page.total'
      :current.sync='page.current_page'
      :display='page.per_page'
      :last-page='page.last_page' >
    </page>
  </div>

  <!--编辑弹窗-->
  <modal :show.sync="modal.editModal" :modal-size="modal.editModalSize">
    <div slot="header">
      <button type="button" class="close" @click="modal.editModal = false"><span>&times;</span></button>
      <h4 class="modal-title">会员编辑</h4>
    </div>
    <div slot="body">
      <div class="modal-body">
          <form class="form-horizontal">
            <div class="form-group">
              <label class="col-sm-4 control-label">会员卡号：</label>
              <div class="col-sm-8">
                <span style="display: inline-block; margin-top: 8px;">{{edit.member_card}}</span>
              </div>
            </div>
            <div class="form-group">
              <label class="col-sm-4 control-label">姓名：</label>
              <div class="col-sm-8">
                <input type="text" class="form-control" placeholder="请输入会员姓名" v-model="edit.name">
              </div>
            </div>
            <div class="form-group">
              <label class="col-sm-4 control-label">手机号码：</label>
              <div class="col-sm-8">
                <span style="display: inline-block; margin-top: 8px;">{{edit.phone}}</span>
              </div>
            </div>
            <div class="form-group">
              <label class="col-sm-4 control-label">微商城密码：</label>
              <div class="col-sm-8">
                <input type="password" class="form-control" v-model="edit.password">
              </div>
            </div>
            <div class="form-group">
              <label class="col-sm-4 control-label">生 日：</label>
              <div class="col-sm-8">
                <date-picker :value.sync="edit.birthday"></date-picker>
              </div>
            </div>
            <div class="form-group">
              <label class="col-sm-4 control-label">等 级：</label>
              <div class="col-sm-8">
                <select class="form-control" v-model="edit.level" disabled>
                  <option>{{edit.level}}</option>
                </select>
              </div>
            </div>
          </form>
      </div>
    </div>
    <div slot="footer">
      <button type="button" class="btn btn-default" @click="modal.editModal=false">关闭</button>
      <button type="button" class="btn btn-primary" :value="edit.id" @click="verifyEditMember($event)">保存</button>
    </div>
  </modal>

  <!--充值弹窗-->
  <modal :show.sync="modal.rechargeModal" :modal-size="modal.rechargeModalSize">
    <div slot="header">
      <button type="button" class="close"><span>&times;</span></button>
      <h4 class="modal-title">会员充值</h4>
    </div>
    <div slot="body">
      <validator name="validationRecharge">
        <form class="form-horizontal">
          <div class="form-group">
            <label class="col-sm-4 control-label">支付方式：</label>
            <div class="col-sm-8">
              <select class="form-control" v-model="edit.payment">
                <option value="cash" selected>现金</option>
                <option value="alipay">支付宝</option>
                <option value="weixin">微信支付</option>
                <option value="pos">POSE刷卡</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="col-sm-4 control-label">充值金额：</label>
            <div class="col-sm-8">
              <input type="text" class="form-control" v-model="edit.balance" @input="priceValidate" v-validate:money="{required: true}">
              <div v-if="$validationRecharge.money.touched">
                <p class="error" v-if="$validationRecharge.money.required">充值金额不能为空</p>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label class="col-sm-4 control-label">交易单号：</label>
            <div class="col-sm-8">
              <input type="text" class="form-control" placeholder="如果有请输入交易单号" v-model="edit.trade_number">
              <span v-if="hasTN" class="errT">请输入交易单号！</span>
            </div>
          </div>
        </form>
      </validator>
    </div>
    <div slot="footer">
      <button type="button" class="btn btn-default" @click="modal.rechargeModal = false">关闭</button>
      <button type="button" class="btn btn-primary" :value="edit.id" @click="verifyRecharge($event)">保存</button>
    </div>
  </modal>

</template>
<script>
  import $ from 'jquery'
  import SiteNav from '../SiteNav'
  import Modal from '../../common/Modal'
  import Grid from '../../common/Grid'
  import Page from '../../common/Page'
  import DatePicker from  '../../common/DatePicker'
  import {
    requestSystemUrl,
    token,
    getDataFromSiteApi,
    postSiteDataToApi,
    putDataToApi,
    error } from '../../../publicFunction/index'
  export default {
    components: {
      Modal: Modal,
      Page: Page,
      DatePicker: DatePicker,
      Grid: Grid,
      SiteNav: SiteNav
    },
    events: {
//    绑定翻页事件
      pagechange: function (currentpage) {
        this.listData(currentpage)
      }
    },
    ready: function () {
//    会员详情-列表渲染
      this.listData(1)
    },
    methods: {
//    数据渲染
      listData: function (page) {
        var self = this
        var id = self.$route.params.queryId
        var url = requestSystemUrl + '/front-system/member/member/' + id
        var data = {
          page: page
        }
        getDataFromSiteApi(url, data, function (response) {
//          单条
          self.memberData = response.data.body.data
          self.memberData.balance = Number(Number(self.memberData.balance) * 0.01).toFixed(2)

//          列表
          self.page = response.data.body.pagination
          self.gridData = response.data.body.list
          $.each(self.gridData, function (index, value) {
            if(value.balance != ''){
              value.balance = '￥' + (value.balance * 0.01).toFixed(2)
            }
            if(value.balance_change != ''){
              value.balance_change = '￥' + (value.balance_change * 0.01).toFixed(2)
            }

            switch(value.operate_type){
              case 1:
                value.point_type = '会员卡充值'
                break;
              case 5:
                value.point_type = 'erp管理系统变更'
                break;
              case 6:
                value.point_type = '退货退款'
                break;
              case 2:
                if(value.balance_change == 0){
                  value.point_type = '订单交易'
                }else{
                  value.point_type = '会员余额支付'
                }
                break;
            }

            switch(value.note){
              case 'alipay':
                value.note = '支付宝支付:' + value.trade_number
                break;
              case 'weixin':
                value.note = '微信支付:' + value.trade_number
                break;
              case 'pos':
                value.note = 'pos支付:' + value.trade_number
                break;
              case 'cash':
                value.note = '现金支付'
                break;
            }
          })
        })
      },
//    编辑会员资料
      updateMember: function (event) {
//      弹出模态框
        this.modal.editModal = true
//      编辑数据
        var id = Number($(event.currentTarget).parents('tr').attr('id'))
        var card_number = $(event.currentTarget).parents('tr').find('td:first-child').text()
        var name = $(event.currentTarget).parents('tr').find('td:nth-child(4)').text()
        var phone = $(event.currentTarget).parents('tr').find('td:nth-child(5)').text()
        var birthday = $(event.currentTarget).parents('tr').find('td:nth-child(6)').text()
        var level = $(event.currentTarget).parents('tr').find('td:nth-child(7)').text()

        this.edit.id = id
        this.edit.member_card = card_number.replace(/(^\s*)|(\s*$)/g, '')
        this.edit.name = name.replace(/(^\s*)|(\s*$)/g, '')
        this.edit.phone = phone.replace(/(^\s*)|(\s*$)/g, '')
        this.edit.birthday = birthday.replace(/(^\s*)|(\s*$)/g, '')
        this.edit.level = level.replace(/(^\s*)|(\s*$)/g, '')
      },
//    保存修改的会员数据
      saveUpdateMember: function (event) {
        var self = this
        var id = self.edit.id

        var url = requestSystemUrl + '/front-system/member/member/' + id
        var data = {
          name: self.edit.name,
          birthday: self.edit.birthday,
          level: self.edit.level,
          password: self.edit.password
        }
        putDataToApi(url, data, function (response) {
          self.modal.editModal = false
//    会员详情-列表渲染
          self.listData(1)
        })
      },
//    编辑会员的验证
      verifyEditMember: function (e) {
        var self = this
        self.saveUpdateMember(e)
        /*this.$validate(function () {
          if (self.$validationEditMember.invalid) {
            self.$validationEditMember.level.touched = true
            e.preventDefault()
          } else {
            self.saveUpdateMember(e)
          }
        })*/
      },
//    充值金额
      recharge: function (event) {
        var id = Number($(event.currentTarget).parents('tr').attr('id'))
        var card_number = $(event.currentTarget).parents('tr').find('td:first-child').text()
        this.edit.id = id
        this.edit.member_card = card_number.replace(/(^\s*)|(\s*$)/g, '')
        this.modal.rechargeModal = true
      },
//    保存充值金额
      saveRecharge: function (event) {
        var self = this
        var id = self.edit.id
        var url = requestSystemUrl + '/front-system/member/member/' + id + '/recharge'
        var data = {
          money: self.edit.balance,
          payment: self.edit.payment,
          member_card: self.edit.member_card,
          trade_number: self.edit.trade_number
        }
        if (self.edit.payment == 'cash') {
          self.hasTN = false
          putDataToApi(url, data, function (response) {
            self.modal.rechargeModal = false
//    会员详情-列表渲染
            self.listData(1)
          })
        } else {
//          判断是否填写交易单号
          if (!self.edit.trade_number) {
            self.hasTN = true
          } else {
            putDataToApi(url, data, function (response) {
              self.modal.rechargeModal = false
//    会员详情-列表渲染
              self.listData(1)
            })
          }
        }
      },
//    充值金额的验证
      verifyRecharge: function (e) {
        var self = this
        console.log('2222')
        this.$validate(function () {
          console.log('333333')
          if (self.$validationRecharge.invalid) {
            console.log('444444')
            self.$validationRecharge.money.touched = true
            e.preventDefault()
          } else {
            self.saveRecharge(e)
          }
        })
      },

//    金额正则
      priceValidate: function () {
        var re = /^\d{0,8}\.{0,1}(\d{1,2})?$/
        if (!re.test(this.edit.balance)) {
          this.edit.balance =  ''
        }
      }
    },
    data: function () {
      return {
        hasTN: false,
//        弹窗
        modal: {
          rechargeModalSize: 'modal-sm',
          editModalSize: 'modal-sm',
          editModal: false,
          rechargeModal: false,
        },
//        编辑、充值
        edit: {
          member_card: '',
          name: '',
          phone: '',
          password: '',
          birthday: '',
          level: '',
          id: '',
          payment: '',
          balance: '',
          status: '',
          trade_number: ''
        },
        member_level_group: [],
        page: [],
        gridData: [],
        gridColumns: {
          point_type: "操作类型",
          balance_change: "余额变更",
          score_change: "积分变更",
          balance: "最新余额",
          score: "最新积分",
          created_at: "操作时间",
          note: "备注"
        },
        memberOperate: true,
        memberData: [],
        memberColumns: {
          member_card: "会员卡号",
          balance: "余额",
          score: "积分",
          name: "姓名",
          phone: "手机号码",
          birthday: "生日",
          level: "等级",
          open_card_store: "开卡点"
        }
      }
    },
    compiled: function () {
      var self = this
//    新增会员获取会员等级
      var url = requestSystemUrl + '/front-system/coupon'
      getDataFromSiteApi(url, {}, function (response) {
        self.member_level_group = response.data.body.list
      })
    }
  }
</script>
<style scoped>
  h1 {
    color: #42b983;
  }
  .errT{
    float: left;
    color: red;
    font-size: 12px;
  }
</style>

