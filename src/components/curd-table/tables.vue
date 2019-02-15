<template>
  <div>
    <Row>
      <Col span="24">
      <Input icon="ios-search" v-model="searchStr" placeholder="关键词查询" style="width: auto;margin: 10px 4px ;"
             @on-click="searchClick" @on-enter="searchClick" v-show="toolConfig.search"/>
      <span style="margin: 10px 4px ;" v-show="toolConfig.advanceSearch">详细查询:</span>
      <i-switch v-model="advanceSearch" style="margin: 10px 4px ;" size="small" v-show="toolConfig.advanceSearch">
      </i-switch>
      <Button style="margin: 10px 4px ;" icon="md-refresh" id="refreshBtn" @click="refresh" shape="circle">刷新</Button>
      <slot name="searchExtend"></slot>
      <!--<Button style="margin: 10px 4px ;" @click="exportExcel">导出为Csv文件</Button>-->
      <slot name="beforeToolbar"></slot>
      <span v-show="isEditable">
      <Button style="margin: 10px 4px ;" icon="md-add" type="primary" id="newBtn" @click="handleOpenNew"
              v-show="toolConfig.create"
              :disabled="newBtnV" shape="circle">新建
      </Button>
      <Button style="margin: 10px 4px ;" icon="md-create" type="info" id="editBtn" @click="handleOpenEdit"
              :disabled="editBtnV" shape="circle" v-show="toolConfig.update">编辑
      </Button>
      <Button style="margin: 10px 4px ;" icon="md-trash" id="removeBtn" @click="openDelete" :disabled="delBtnV"
              shape="circle" v-show="toolConfig.delete">删除
      </Button>
      </span>
      <slot name="afterToolbar"></slot>
      </Col>
    </Row>
    <Card v-show="advanceSearch">

      <Form ref="formInline" inline @enter="doAdvanceSearch" :label-width="80">
        <slot name="advanceSearch"></slot>

        <Divider style="margin:4px 0px;" dashed/>
        <div align="center" style="margin:0px">
          <Button type="primary" style="margin: 0px 4px ;" icon="md-search" shape="circle" @click="doAdvanceSearch">搜索
          </Button>
          <Button style="margin: 0px 4px ;" shape="circle" @click="resetAdvanceSearch">重置</Button>
        </div>
      </Form>
    </Card>

    <Row>

      <Col span="24">
      <Table stripe border :columns="columns" :data="tableData" @on-select="tableSelect"
             @on-selection-change="tableSelectionChange"></Table>
      <Spin size="large" fix v-if="spinShow"></Spin>
      </Col>
    </Row>
    <Row>
      <Col span="24">
      <Page :total="total" :page-size="limit" style="margin: 10px 0px; height:64px;" @on-change="pageChange"
            show-elevator
            show-total></Page>
      </Col>
    </Row>

    <!-- 加载动画-->

    <!--新建对话框-->
    <Modal
      ref="newModal"
      v-model="newModal"
      :title="newModalTitle"
      :loading="modal_loading"
      :width="modalWidth"
      @on-ok="okNew">
      <Form ref="newForm" :model="newModel" label-position="right" :label-width="100" :rules="rules">
        <slot name="newForm"></slot>
      </Form>
      <div slot="footer">

        <div v-show="newAlertV" align="left">
          <Alert type="error" ref="newAlert" show-icon>
            提交失败，遇到了一些问题!
          </Alert>
        </div>
        <Button type="default" :loading="modal_loading" @click="cancelNew">取消</Button>
        <Button type="primary" :loading="modal_loading" icon="md-checkmark-circle-outline" @click="okNew">保存</Button>
      </div>
    </Modal>
    <!-- 编辑对话框-->
    <Modal
      ref="editModal"
      v-model="editModal"
      :title="editModalTitle"
      :loading="modal_loading"
      :width="modalWidth"
      @on-ok="okEdit">

      <Form ref="editForm" :model="row" label-position="right" :label-width="100" :rules="rules">
        <slot name="editForm"></slot>
      </Form>
      <div slot="footer">
        <div v-show="editAlertV" align="left">
          <Alert type="error" ref="newAlert" show-icon>
            提交失败，时遇到了一些问题!
          </Alert>
        </div>
        <Button type="default" @click="cancelEdit">取消</Button>
        <Button type="primary" :loading="modal_loading" icon="md-checkmark-circle-outline" @click="okEdit">保存</Button>
      </div>
    </Modal>

    <!-- 详细面板-->
    <Drawer
      title="详细"
      v-model="showDetail"
      width="70%"
      ref="viewDetail"
    >
      <slot name="viewDetail"></slot>
    </Drawer>

    <!--删除对话框-->
    <Modal v-model="delModal" width="360">
      <p slot="header" style="color:#f60;text-align:center">
        <Icon type="ios-information-circle"></Icon>
        <span>确定要删除选定的数据？</span>
      </p>
      <div style="text-align:center">
        <p>您当前选择的数据将要被删除.</p>
        <p>您是否确认?</p>
      </div>
      <div slot="footer">
        <Button type="primary" size="large" :loading="modal_loading" @click="delModal=false">不，我再想想</Button>
        <Button size="small" :loading="modal_loading" @click="handleDelete">立即删除</Button>
      </div>
    </Modal>

  </div>
</template>

<script>
import CURD from '@/libs/curd.js'
export default {
  selections: [],
  row: null,
  curd: Object,
  name: 'CURDTable',
  props: {
    modalWidth: {
      type: [Number, String],
      default () {
        return 500
      }
    },
    menuLoad: { // 手动加载，初始化时，不下载数据
      type: Boolean,
      default () {
        return false
      }
    },
    nohandle: { // 不创建每行的操作按钮
      type: Boolean,
      default () {
        return false
      }
    },
    toolConfig: {
      type: Object,
      default () {
        return {
          create: true,
          update: true,
          delete: true,
          detail: true,
          advanceSearch: true,
          search: true
        }
      }
    },
    master: {
      type: String,
      default () {
        return null
      }
    },
    masterField: {
      type: String,
      default () {
        return null
      }
    },
    limit: {
      type: [Number],
      default () {
        return 10
      }
    },
    sort: {
      type: String,
      default () {
        return null
      }
    },
    baseUrl: '',
    RESTUrl: {
      type: Object,
      default () {
        return null
      }
    },
    readOnly: {
      type: Boolean,
      default () {
        return false
      }
    },
    inlineView: {
      type: Boolean,
      default () {
        return true
      }
    },
    inlineDel: {
      type: Boolean,
      default () {
        return false
      }
    },
    columns: {
      type: Array,
      default () {
        return []
      }
    },
    rules: {
      type: Object,
      default () {
        return null
      }
    },
    title: '',
    handlePostNew: {
      type: Function,
      default () {
        return ''
      }
    },
    handlePutUpdate: {
      type: Function,
      default () {
        return ''
      }
    }
  },
  data () {
    return {
      advanceSearch: false,
      newModal: false,
      editModal: false,
      delModal: false,
      newBtnV: false,
      editBtnV: true,
      delBtnV: true,
      modal_loading: false,
      searchStr: '',
      queryParam: {
        l: 10,
        s: 'id'
      },
      advanceParam: {},
      tableColumns: [],
      tableData: [],
      total: 0,
      newModalTitle: '新建',
      editModalTitle: '编辑',
      spinShow: true,
      newAlertV: false,
      editAlertV: false,
      isEditable: true,
      hadInit: false,
      showDetail: false,
      newModel: {}, // 关联表单的newModel
      editModel: {}, // 编辑时的Model
      row: {}// 当前选择编辑的对象
    }
  },

  methods: {

    /**
       * 展开新建对话框的方法
       * @param params
       */
    handleOpenNew (params) {
      this.newAlertV = false
      if (this.$slots.newForm[0].componentInstance.defaultData !== undefined) {
        this.$slots.newForm[0].componentInstance.entity = this.$slots.newForm[0].componentInstance.defaultData()
      } else {
        this.$slots.newForm[0].componentInstance.entity = {
          id: '""'
        }
      }
      this.newModel = this.$slots.newForm[0].componentInstance.entity
      //        this.$refs.newForm.resetFields()
      if (this.masterField !== null) {
        this.$slots.newForm[0].componentInstance.entity[this.masterField] = this.queryParam[this.masterField]
      }
      this.newModal = true
    },
    /**
       * 执行保存
       * @returns {boolean}
       */
    okNew () {
      // TODO 先校验

      if (this.rules === null) {
        this.actionNew()
      } else {
        this.$refs.newForm.validate((valid) => {
          if (valid) {
            this.actionNew()
          }
        })
      }

      return true
    },
    actionNew () {
      this.modal_loading = true
      var obj = this.$slots.newForm[0].componentInstance.entity
      if (this.masterField !== null) {
        obj[this.masterField] = this.master
      }
      if (obj !== null) {
        this.curd.doPost(obj).then(res => {
          this.newModal = false
          this.refresh()
          this.$emit('after-create', res.data)
        }).catch(err => {
          console.log(err)
          this.newAlertV = true
          //            this.$refs.newModal.$data.buttonLoading = false
        })
        // TODO 出错处理
      } else {
        // TODO 关闭loading？
      }
      this.modal_loading = false
      this.newAlertV = false
    },
    /**
       * 取消新增保存
       */
    cancelNew () {
      this.newModal = false
      this.newAlertV = false
    },
    /**
       * 打开编辑对话框
       * @param params
       */
    handleOpenEdit (params) {
      //        this.$refs.editForm.resetFields()

      this.newAlertV = false
      this.$slots.editForm[0].componentInstance.entity = this.row
      //        this.$refs.editForm.resetFields()
      this.editModal = true
    },
    /**
       * 保存编辑
       * @returns {boolean}
       */
    okEdit () {
      if (this.rules === null) {
        this.actionEdit()
      } else {
        this.$refs.editForm.validate((valid) => {
          if (valid) {
            this.actionEdit()
          } else {

          }
        })
      }
      return true
    },
    actionEdit () {
      this.modal_loading = true
      var obj = this.$slots.editForm[0].componentInstance.entity
      if (obj !== null) {
        this.curd.doPut(obj).then(res => {
          this.editModal = false
          this.refresh()
          this.$emit('after-update', res.data)
        }).catch(err => {
          console.log('do put error', err)
          resolve([])
          this.editAlertV = true
        })
      } else {
        // TODO 关闭loading？
      }

      this.modal_loading = false
      this.editAlertV = false
    },
    /**
       * 取消编辑
       */
    cancelEdit () {
      this.editModal = false
      this.editAlertV = false
    },

    /**
       * 打开删除提示
       */
    openDelete () {
      this.delModal = true
    },
    /**
       * 执行删除
       * @param params
       */
    handleDelete (params) {
      var ids = ''
      var split = ''
      var selections = []

      this.selections.forEach((va, idx, vary) => {
        selections.push(va)
        ids = ids + split + va.id
        split = ','
      })
      if (ids.length > 0) {
        this.curd.doDelete(ids).then(res => {
          this.delModal = false
          this.refresh()
          this.$emit('after-delete', selections)
          resolve([])
        }).catch(err => {
          console.log('do delete error', err)
          resolve([])
        })
      }
      this.modal_loading = false
    },
    exportExcel () {
      this.$refs.tables.exportCsv({
        filename: `table-${(new Date()).valueOf()}.csv`
      })
    },
    /**
       * 翻页，或者页码变化
       * @param page
       */
    pageChange (page) {
      var p = page > 0 ? page - 1 : 0
      this.queryParam.a = p * this.queryParam.l
      this.refresh()
    },

    /**
       * 重新加载数据，无论是第一次加载数据还是刷新都是调用这个方法
       */
    refresh () {
      this.spinShow = true
      this.curd.readAll(this.queryParam).then(res => {
        if (res.rows === undefined) {
          res.rows = res.data
        }
        for (var i = 0; res.rows !== null && i < res.rows.length; i++) {
          if (res.rows[i]._id !== undefined) {
            res.rows[i].id = res.rows[i]._id
          }
        }
        this.tableData = res.rows === null ? [] : res.rows
        this.total = res.total
        this.spinShow = false
      }).catch(err => {
        console.log(err)
        this.$Message.error('数据读取出错,不能加载数据。')
        this.spinShow = false
      })
    },
    /**
       * 快速搜索。当快速搜索框按下回车或者点击搜索后，执行搜索
       */
    searchClick () {
      this.queryParam.a = 0
      if (this.searchStr !== '' && this.searchField !== undefined) {
        this.queryParam[this.searchField + '_'] = this.searchStr
      } else {
        this.queryParam[this.searchField + '_'] = undefined
      }
      this.refresh()
    },
    /**
       * 执行高级搜索
       */
    doAdvanceSearch () {
      this.queryParam.a = 0
      this.queryParam[this.searchField + '_'] = undefined
      for (let item in this.advanceParam) {
        this.queryParam[item] = undefined
      }
      this.advanceParam = this.$slots.advanceSearch[0].componentInstance.getParam()
      for (let item in this.advanceParam) {
        this.queryParam[item] = this.advanceParam[item]
      }
      //      console.log(this.queryParam)
      this.refresh()
    },
    /**
       * 重置高级搜索，把高级搜索框所有条件重置，并且刷新一次数据。
       */
    resetAdvanceSearch () {
      this.queryParam.a = 0
      this.queryParam[this.searchField + '_'] = undefined
      for (let item in this.advanceParam) {
        this.queryParam[item] = undefined
      }

      this.advanceParam = this.$slots.advanceSearch[0].componentInstance.reset()
      this.refresh()
    },
    /**
       * 选择行
       * @param selection
       * @param row
       */
    tableSelect (selection, row) {
      this.selections = selection
      this.row = row
    },
    /**
       * 发生选择事件
       * @param selection
       */
    tableSelectionChange (selection) {
      this.selections = selection
      if (selection.length > 1) {
        this.editBtnV = true
        this.delBtnV = false
      }
      if (selection.length === 1) {
        this.editBtnV = false
        this.delBtnV = false
      }
      if (selection.length === 0) {
        this.editBtnV = true
        this.delBtnV = true
      }

      this.$emit('on-selection-change', selection)
    }
  },
  /**
     * 初始化
     */
  mounted () {
    // 初始化RESTUrl
    if (this.RESTUrl == null) { // 如果RESTUrl对象没有设置，那么就用baseUrl创建一个默认的
      this.RESTUrl = {
        GET: this.baseUrl,
        POST: this.baseUrl,
        PUT: this.baseUrl,
        DELETE: this.baseUrl
      }
    }

    if (this.$slots.advanceSearch === undefined || this.$slots.advanceSearch.length === 0) {
      this.toolConfig.advanceSearch = false
    }

    this.curd = new CURD(this.RESTUrl)
    this.isEditable = !this.readOnly
    this.queryParam.l = this.limit
    this.queryParam.s = this.sort
    this.columns.forEach((item) => {
      if (item.main === true && item.render === undefined) { // 主要字段，并且没有设置渲染
        item.render = (h, params) => {
          return h('a',
            {
              props: { href: '#' },
              style: { 'font-weight': 'bold' },
              on: {
                click: () => {
                  this.$slots.viewDetail[0].componentInstance.entity = params.row
                  this.showDetail = true
                }
              }
            }, params.row[item.key])
        }
      }
      if (item.main === true && this.searchField === undefined) {
        this.searchField = item.key
      }
    })
    if (!this.hadInit && !this.nohandle) {
      //        初始化行的编辑按钮

      this.columns.push(
        {
          title: '操作',
          key: 'handle',
          width: 100,
          render: (h, params) => {
            var btns = []
            if (this.toolConfig.detail) {
              btns[btns.length] =
                  h('Button', {
                    props: {
                      type: 'default',
                      size: 'small'
                    },
                    style: {
                      marginRight: '5px'
                    },
                    on: {
                      click: () => {
                        if (this.$slots.viewDetail.length > 0) {
                          this.$slots.viewDetail[0].componentInstance.entity = params.row
                          this.showDetail = true
                        }
                      }
                    }
                  }, '详细')
            }
            /*              if (this.isEditable && this.toolConfig.delete) {
                btns[btns.length] =
                  h('Button', {
                    props: {
                      type: 'default',
                      size: 'small'
                    },
                    on: {
                      click: () => {
                        //                      this.remove(params.index)
                      }
                    }
                  }, '删除')
              } */
            return h('div', btns)
          }
        }
      )
    }

    this.hadInit = true

    this.editModalTitle = this.editModalTitle + this.title
    this.newModalTitle = this.newModalTitle + this.title
    if (this.menuLoad) {
      this.spinShow = false
      return // 设置未手动刷新，直接返回，不加载数据
    }
    if (this.masterField !== null) {
      if (this.master !== null) {
        this.refresh()
      }
    } else {
      this.refresh()
    }
  },
  watch: {
    master (val) {
      console.log('master  val:' + val)
      if (this.masterField !== null && val !== null && val !== undefined && val !== '') {
        this.queryParam[this.masterField] = val
        //          if (!this.menuLoad) {
        this.refresh()
        //          }
      }
    }

  }
}
</script>

<style>

</style>
