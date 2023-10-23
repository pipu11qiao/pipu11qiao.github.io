const data = {
  title: "title",
  box: {
    widtth: 40,
    height: 30,
  },
};
// delete data.box.width
// 对应的结构

const proxyDataState = {
  base: { name: "baseState", box: { width: 30, height: 40 } },
  modified: true,
  finalized: false,
  assigned: {},
  draft: proxyDataState,
  drafts: null,
  copy: { name: "baseState", box: proxyDataBoxState },
};
const proxyDataBoxState = {
  base: { width: 30, height: 40 },
  parent: proxyDataState,
  modified: true,
  finalized: false,
  assigned: { width: false },
  draft: { height: 40 },
  drafts: null,
  copy: { height: 40 },
};
// 数据中是对象的，会在获取时将属性改为proxy对象，在标记修改时将proxy对象赋值到copy对象上
