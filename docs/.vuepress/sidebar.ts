let reactPath = "/code/react";
const react = [
  {
    text: "原理",
    children: [
      { text: "react设计理念", link: `${reactPath}/2.react设计理念.md` },
      { text: "源码架构", link: `${reactPath}/3.react源码架构.md` },
      { text: "源码目录和调试", link: `${reactPath}/4.源码目录和调试.md` },
      { text: "jsx和核心api", link: `${reactPath}/5.jsx和核心api.md` },
      {
        text: "legacy和concurrent",
        link: `${reactPath}/6.legacy和concurrent.md`,
      },
      { text: "fiber架构", link: `${reactPath}/7.fiber架构.md` },
      { text: "render阶段", link: `${reactPath}/8.render阶段.md` },
      { text: "diff算法", link: `${reactPath}/9.diff算法.md` },
      { text: "commit阶段", link: `${reactPath}/10.commit阶段.md` },
      { text: "生命周期调用顺序", link: `${reactPath}/11.生命周期调用顺序.md` },

      { text: "状态更新流程", link: `${reactPath}/12.状态更新流程.md` },
      { text: "hooks源码", link: `${reactPath}/13.hooks源码.md` },
      { text: "手写hooks", link: `${reactPath}/14.手写hooks.md` },
      { text: "shedular-lane", link: `${reactPath}/15.shedular-lane.md` },
      { text: "concurrent模式", link: `${reactPath}/16.concurrent模式.md` },
      { text: "context", link: `${reactPath}/17.context.md` },
      { text: "调度原理", link: `${reactPath}/调度原理.md` },
      { text: "代数效应", link: `${reactPath}/代数效应.md` },
      { text: "总结", link: `${reactPath}/总结.md` },
    ],
  },
];

const vue3 = [
  {
    text: "原理",
    children: [
      { text: "vue3-1", link: "/code/vue3/vue3-1.md" },
      { text: "vue3-2", link: "/code/vue3/vue3-2.md" },
      { text: "vue3-3", link: "/code/vue3/vue3-3.md" },
    ],
  },
];

let jsPath = "/relative/js";
const js = [
  {
    text: "js相关知识",
    children: [
      { text: "js事件循环", link: `${jsPath}/js事件循环.md` },
      { text: "js常见编程题", link: `${jsPath}/js常见编程题.md` },
      { text: "v8垃圾回收", link: `${jsPath}/v8垃圾回收.md` },
      { text: "js知识点", link: `${jsPath}/js知识点.md` },
      { text: "async-await原理", link: `${jsPath}/async-await原理.md` },
      { text: "作用域", link: `${jsPath}/作用域.md` },
    ],
  },
];

let tsPath = "/relative/ts";
const ts = [
  {
    text: "ts相关知识",
    children: [{ text: "ts1", link: `${tsPath}/ts1.md` }],
  },
];

let cssPath = "/relative/css";
const css = [
  {
    text: "css相关知识",
    children: [
      { text: "BFC 理解", link: `${cssPath}/BFC理解.md` },
      { text: "flex 布局", link: `${cssPath}/flex布局.md` },
      { text: "em-rem", link: `${cssPath}/em-rem.md` },
      { text: "盒模型", link: `${cssPath}/盒模型.md` },
      { text: "css选择器", link: `${cssPath}/css选择器.md` },
      { text: "css权重", link: `${cssPath}/css权重.md` },
      { text: "div居中", link: `${cssPath}/div居中.md` },
      { text: "移动端适配", link: `${cssPath}/移动端适配.md` },
      {
        text: "clientHeight,offsetHeight,scrollHeight",
        link: `${cssPath}/clientHeight,offsetHeight,scrollHeight.md`,
      },
      { text: "matric", link: `${cssPath}/matric.md` },
    ],
  },
];

let htmlPath = "/relative/html";
const html = [
  {
    text: "html相关知识",
    children: [
      { text: "重排和重绘", link: `${htmlPath}/重排和重绘.md` },
      { text: "浏览器架构", link: `${htmlPath}/chrome浏览器架构.md` },
      { text: "worker", link: `${htmlPath}/worker.md` },
      { text: "缓存", link: `${htmlPath}/缓存.md` },
    ],
  },
];
let networkPath = "/relative/network";
const network = [
  {
    text: "网络相关知识",
    children: [
      { text: "http", link: `${networkPath}/http.md` },
      { text: "https", link: `${networkPath}/https.md` },
      { text: "http2", link: `${networkPath}/http2.md` },
      { text: "http3", link: `${networkPath}/http3.md` },
      { text: "websocket", link: `${networkPath}/websocket.md` },
      { text: "udp", link: `${networkPath}/udp.md` },
      { text: "type_of_url", link: `${networkPath}/type_of_url.md` },
      { text: "tcp", link: `${networkPath}/tcp.md` },
    ],
  },
];

let nodePath = "/relative/node";
const node = [
  {
    text: "node相关知识",
    children: [
      { text: "nodejs事件循环", link: `${nodePath}/nodejs事件循环.md` },
      { text: "模块", link: `${nodePath}/模块.md` },
      { text: "koa洋葱模型", link: `${nodePath}/koa洋葱模型.md` },
    ],
  },
];

let performancePath = "/relative/performance";
const performance = [
  {
    text: "性能相关知识",

    children: [
      {
        text: "网页图片加载优化方案",
        link: `${performancePath}/网页图片加载优化方案.md`,
      },
      {
        text: "常见前端安全问题及解决方案",
        link: `${performancePath}/网页图片加载优化方案常见前端安全问题及解决方案.md`,
      },
    ],
  },
];
let designPatternPath = "/relative/design-pattern";
const designPattern = [
  {
    text: "设计模式知识",

    children: [
      {
        text: "面试之设计模式",
        link: `${designPatternPath}/面试之设计模式.md`,
      },
      {
        text: "发布订阅和观察者",
        link: `${designPatternPath}/发布订阅和观察者.md`,
      },
      {
        text: "职责链模式",
        link: `${designPatternPath}/职责链模式.md`,
      },
    ],
  },
];

let problemPath = "/problem";
const problem = [
  {
    text: "问题清单",
    children: [
      {
        text: "react-button事件触发问题",
        link: `${networkPath}/react-button事件触发问题.md`,
      },
      { text: "下载设置", link: `${networkPath}/download_direct.md` },
      { text: "open打开异步链接", link: `${networkPath}/open打开异步链接.md` },
      { text: "一些问题", link: `${networkPath}/一些问题.md` },
    ],
  },
];

export const sidebar = {
  "/code/vue3/": vue3,
  [reactPath]: react,
  [jsPath]: js,
  [tsPath]: ts,
  [cssPath]: css,
  [htmlPath]: html,
  [networkPath]: network,
  [nodePath]: node,
  [performancePath]: performance,
  [designPatternPath]: designPattern,
  [problemPath]: problem,
};
