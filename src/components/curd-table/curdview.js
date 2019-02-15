/**
 * Created by smard on 2018/10/29.
 */
import CURD from '@/api/curd.js'

export const CURDView = (opt) => {
  var curd = new CURD(opt.baseUrl)

  var queryParam = {
    'l': 10
  }
  return {

    name: opt.name,
    data () {
      var d = {
        columns: opt.columns,
        tableData: [],
        total: 0,
        loading: true
      }
      d[opt.newModal] = false
      d[opt.editModal] = false
      return d
    },
    methods: {
      okNew () {
        // this['newModal']=false

      },
      cancelNew () {

      },
      okEdit () {

      },
      cancleEdit () {

      },
      handleOpenNew (params) {
        this[opt.newModal] = true
      },
      handleDelete (params) {
        console.log(params)
      },
      exportExcel () {
        this.$refs.tables.exportCsv({
          filename: `table-${(new Date()).valueOf()}.csv`
        })
      },
      pageChange (page) {
        var p = page > 0 ? page - 1 : 0
        queryParam.a = p * queryParam.l
        this.refresh()
      },
      refresh () {
        curd.readAll(queryParam).then(res => {
          this.tableData = res.rows
          this.total = res.total
        })
      }
    },
    mounted () {
      this.refresh()
    }
  }
}
