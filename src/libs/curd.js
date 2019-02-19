/**
 * Created by smard on 2018/10/26.
 */
// import axios from '../libs/api.request'
import { getToken } from '../libs/util'
import HttpRequest from "./axios";

class CURD {
  constructor (baseUrl,serverUrl) {
    if (baseUrl instanceof String) {
      this.baseUrl = {
        GET: baseUrl,
        POST: baseUrl,
        PUT: baseUrl,
        DELETE: baseUrl,
        QUERY: undefined, // 这个是特殊定义的查询url
        baseQuery: undefined// 这个是查询对象
      }
      this.axios = new HttpRequest(serverUrl)
    } else {
      this.baseUrl = baseUrl
      this.axios = new HttpRequest(serverUrl)
    }
  }

  setReadParam (param) {
    this.readParam = param
  }

  setQueryParam (param) {
    this.queryParam = param
  }

  /**
   * 读取单个对象
   * @param id
   * @returns {Promise}
   */
  read (id) {
    return new Promise((resolve, reject) => {
      const token = this.loadToken()
      this.axios.request({
        url: this.baseUrl.GET,
        headers: { Authorization: 'Bearer ' + token.token },
        params: { id: id },
        method: 'get'
      })
        .then(res => {
          var data = res.data
          resolve(data)
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  /**
   * 执行查询
   * @param params
   * @returns {Promise}
   */
  readAll (params) {
    // 如果设置了QUERY url，那么执行queryAll
    if (this.baseUrl.QUERY === undefined) {
      this.setReadParam(params)
      return new Promise((resolve, reject) => {
        const token = this.loadToken()
        this.axios.request({
          url: this.baseUrl.GET,
          headers: { Authorization: 'Bearer ' + token.token },
          params: params,
          method: 'get'
        })
          .then(res => {
            var data = res.data
            resolve(data)
          })
          .catch(err => {
            reject(err)
          })
      })
    } else {
      return this.queryAll(params)
    }
  }

  /**
   * 执行非REST标准的查询,使用POST方式
   * @param param
   */
  queryAll (param) {
    var newparam = this.baseUrl.baseParam

    newparam.limit = param.l
    // param.l = undefined
    newparam.sort = param.s
    // param.s = undefined
    newparam.search = param.t
    // param.t = undefined
    newparam.start = param.a
    // param.a = undefined

    newparam.filters = {}

    for (let k in param) {
      if (k === 'l' || k === 's' || k === 't' || k === 'a') {
        continue
      }
      if (newparam.query !== undefined) {
        newparam.query[k] = param[k]
      } else {
        newparam.filters[k] = param[k]
      }
    }

    this.setQueryParam(newparam)
    return new Promise((resolve, reject) => {
      const token = this.loadToken()
      this.axios.request({
        url: this.baseUrl.QUERY,
        headers: { Authorization: 'Bearer ' + token.token },
        data: newparam,
        method: 'post'
      })
        .then(res => {
          var data = res.data
          resolve(data)
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  /**
   * 执行新建对象
   * @param obj
   * @returns {Promise}
   */
  doPost (obj) {
    return new Promise((resolve, reject) => {
      const token = this.loadToken()
      this.axios.request({
        url: this.baseUrl.POST,
        headers: { Authorization: 'Bearer ' + token.token },
        data: obj,
        method: 'post'
      })
        .then(res => {
          var data = res.data
          resolve(data)
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  /**
   * 执行修改对象
   * @param obj
   * @returns {Promise}
   */
  doPut (obj) {
    return new Promise((resolve, reject) => {
      const token = this.loadToken()
      this.axios.request({
        url: this.baseUrl.PUT + '/' + obj.id,
        headers: { Authorization: 'Bearer ' + token.token },
        data: obj,
        method: 'put'
      })
        .then(res => {
          var data = res.data
          resolve(data)
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  /**
   * 执行删除对象
   * @param ids
   * @returns {Promise}
   */
  doDelete (ids) {
    return new Promise((resolve, reject) => {
      const token = this.loadToken()
      this.axios.request({
        url: this.baseUrl.DELETE,
        headers: { Authorization: 'Bearer ' + token.token },
        params: { id: ids },
        method: 'delete'
      })
        .then(res => {
          var data = res.data
          resolve(data)
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  loadToken () {
    var token = getToken()
    if (token instanceof Object) {
      return token
    } else {
      return JSON.parse(token)
    }
  }
}

export default CURD
