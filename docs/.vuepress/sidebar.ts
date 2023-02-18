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


let nodePath = "/relative/node";
const node = [
  {
    text: "node相关知识",
    children: [
      { text: "nodejs事件循环", link: `${nodePath}/nodejs事件循环.md` },
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
   ],
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
    ],
  },
];

let htmlPath = "/relative/html";
const html = [
  {
    text: "html相关知识",
    children: [
      { text: "重排和重绘", link: `${htmlPath}/重排和重绘.md` },
   ],
  },
];

export const sidebar = {
  "/code/vue3/": vue3,
  [jsPath]: js,
  [cssPath]: css,
  [htmlPath]: html,
  [nodePath]: node,
};
