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

let cssPath = "/relative/css";
const css = [
  {
    text: "css相关知识",
    children: [
      { text: "BFC 理解", link: `${cssPath}/BFC理解.md` },
      { text: "flex 布局", link: `${cssPath}/flex布局.md` },
      { text: "em-rem", link: `${cssPath}/em-rem.md` },
    ],
  },
];

export const sidebar = {
  "/code/vue3/": vue3,
  "/relative/css/": css,

};
