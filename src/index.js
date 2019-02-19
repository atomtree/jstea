// import CURDTable from './components/curd-table/tables.vue'
// import Config from './config'
//
// const components = {
//     CURDTable
//     // ...如果还有的话继续添加
//
// };
//
// const iview = {
//     ...components,
// };
//
// const install = function(Vue, opts = {}) {
//     if (install.installed) return;
//     Object.keys(components).forEach(key => {
//         Vue.component(key, iview[key]);
//     });
// };
//
// // auto install
// if (typeof window !== 'undefined' && window.Vue) {
//     install(window.Vue);
// }
//
// const API = {
//     ...components,
//     Config
// };
//
// export default API
import Vue from 'vue'
Vue.config.productionTip = false

export { default as CURDTable } from './components/curd-table'
export { default as config } from './config/index'
export { SetTitle, SetBaseUrl } from './config/index'
