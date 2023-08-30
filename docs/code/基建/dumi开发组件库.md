# [dumi](https://d.umijs.org/)

dumi，中文发音嘟米，是一款为组件开发场景而生的静态站点框架，与 father 一起为开发者提供一站式的组件开发体验，father 负责组件源码构建，而 dumi 负责组件开发及组件文档生成。

安装
```zsh
# 先找个地方建个空目录。
mkdir myapp && cd myapp

# 通过官方工具创建项目，选择你需要的模板
npx create-dumi

# 选择一个模板
? Pick template type › - Use arrow-keys. Return to submit.
❯   Static Site # 用于构建网站
    React Library # 用于构建组件库，有组件例子
    Theme Package # 主题包开发脚手架，用于开发主题包

# 安装依赖后启动项目
npm start
```

## 目录结构
### 基础结构
如果你是通过 create-dumi 创建的 React 脚手架（React 选项），那么生成的目录结构大致如下：

<root>
 docs 组件库文档目录
 index.md 组件库文档首页
 guide.md 组件库其他文档路由（示意）
 src 组件库源码目录
 Foo 单个组件
 index.tsx 组件源码
 index.md 组件文档
 index.ts 组件库入口文件
 .dumirc.ts dumi 的配置文件
 .fatherrc.ts father 的配置文件，用于组件库打包
如果你创建的是静态站点（Static Site 选项），那么忽略上面的 src 目录结构即可。

### 其他目录约定

#### 全局样式
约定如下两个路径为文档添加全局样式：

创建 .dumi/global.(less|sass|scss|css)：适用于单纯的全局样式新增
创建 .dumi/overrides.(less|sass|scss|css)：适用于覆盖 dumi 默认主题或三方主题包的样式，该文件中的规则会自动提升一层优先级确保覆盖生效

#### 全局脚本

约定 .dumi/global.(js|jsx|ts|tsx) 为全局脚本文件，适用于要在全局添加自定义逻辑的场景（比如监控运行时错误并上报）。

# 约定式路由
即根据路由文件路径自动生成路由，是 dumi 默认且推荐使用的路由模式。在 dumi 里，约定式路由一共有 3 种读取方式，分别是：

类型	默认读取路径	适用场景及特点
文档路由	docs	适用于普通文档生成路由，路径下的文档会根据嵌套结构自动识别并归类到不同的导航类目下
资产路由	src	适用于资产（比如组件或 hooks）文档的生成，路径下第一层级的文档会被识别并归类到指定的类别下，dumi 默认会将 src 下的文档都归类到 /components 下
React 路由	.dumi/pages	适用于为当前站点添加额外的、无法用 Markdown 编写的复杂页面，这些页面必须使用 React 编写，识别规则与文档路由一致
