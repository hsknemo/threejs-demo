/*
 * @Author: qinkai 937817514@qq.com
 * @Date: 2026-02-04 14:51:06
 * @LastEditors: qinkai 937817514@qq.com
 * @LastEditTime: 2026-02-27 13:33:46
 * @FilePath: /vite-project/src/main.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { createApp } from "vue";
import "./style.css";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import App from "./App.vue";
// import threeDemo from './threeDemo/threeDemo1.js'
// threeDemo.init()
// import "./threeDemo/smokeDemo";
// import "./threeDemo/tunnelDemo.js";
// import "./threeDemo/cubeNineScenceDemo.js";
// import "./threeDemo/heatMapScence.js";
// import "./threeDemo/heatMapPointScence.js";
// import "./threeDemo/senceCubeDemo.js";
// 隧道场景
// import "@/threeDemo/model/sdcj/main.js";
import '@/threeDemo/model/zhcsDemo/scence.js'
const app = createApp(App);
app.use(ElementPlus);
app.mount("#app");
