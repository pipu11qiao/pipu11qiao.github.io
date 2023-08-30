
# npm包使用 [father](https://github.com/umijs/father)

father 是一款 NPM 包研发工具，能够帮助开发者更高效、高质量地研发 NPM 包、生成构建产物、再完成发布。它主要具备以下特性：

## 通过 create-father 快速创建一个 father 项目：

> $ npx create-father my-father-project

## 执行构建

>$ npx father build

### 构建模式


### Bundless

Bundless 即文件到文件的构建模式，它不对依赖做任何处理，只对源码做平行编译输出。目前社区里的 tsc、unbuild 及旧版 father 的 babel 模式都是对源码做 Bundless 构建的构建工具。

如何选择
Bundless 模式下的产物可以被项目选择性引入，同时也具备更好的可调试性。对于大部分项目而言，Bundless 应该都是最好的选择，这也是社区大部分项目的选择。

关于如何选择 ESModule 产物和 CommonJS 产物，可参考 [构建 ESModule 和 CommonJS 产物](https://github.com/umijs/father/blob/master/docs/guide/esm-cjs.md#%E5%A6%82%E4%BD%95%E9%80%89%E6%8B%A9) 文档。

ESModule 是 JavaScript 使用的模块规范，而 CommonJS 是 Node.js 使用的模块规范，这我们已经很熟悉了，所以我们的项目需要输出什么产物，只需要根据使用情况判断即可：

额外说明：

由于 Node.js 社区的 Pure ESM 推进仍有阻碍，所以为了通用性考虑，目前仍然建议大家为 Node.js 项目产出 CommonJS 产物，未来 father 也会推出同时产出 ESModule 产物的兼容方案，敬请期待
对于 Browser 运行环境，CommonJS 产物是没必要的，无论哪种模块构建工具都能帮我们解析，加上 Vite 这类使用原生 ESModule 产物的构建工具已经成熟，使用 ESModule 才是面向未来的最佳选择
Both 是指构建产物要同时用于 Browser 和 Node.js 的项目，比如 react-dom、umi 等

### Bundle
Bundle 即将源码打包的构建模式，它以入口文件作为起点、递归处理全部的依赖，然后将它们合并输出成构建产物。目前社区里的 Webpack、Rollup 及旧版 father 的 rollup 模式都是对源码做 Bundle 构建的构建工具。

在 father 4 中，仅输出 UMD 产物时会使用 Bundle 构建模式。来看一下 father 的 Bundle 构建模式会如何工作。
 [umd产物](https://github.com/umijs/father/blob/master/docs/guide/umd.md#%E5%A6%82%E4%BD%95%E9%80%89%E6%8B%A9)

只有在满足如下任意条件的情况下，才需要选择输出 UMD 产物：
1. 项目的用户可能需要将该依赖做 external 处理、并在 HTML 中通过 script 标签直接引入 CDN 上的产物（类似 React 或 antd）
2. 项目需要产出编译后的样式表给用户使用，例如将 Less 文件以特定的变量编译成 CSS 文件，常见于基于 antd、又需要自定义主题的组件库


## 开发
将构建配置设置完毕后，即可开始开发。

实时编译产物
开发过程中我们需要实时编译产物，以便进行调试、验证：

# 执行 dev 命令，开启实时编译
> $ father dev
一旦源码或配置文件发生变化，产物将会实时增量编译到输出目录。

在项目中调试
在测试项目中，使用 npm link 命令将该项目链接到测试项目中进行调试、验证：

> $ cd test-project
> $ npm link /path/to/your-father-project .

开发、验证完成后，即可 发布 该 NPM 包。


## 发布

通常仅需 4 步即可完成普通 NPM 包发布，monorepo 项目请参考各自 monorepo 方案的发包实践。

前置工作
执行 npm whoami 查看当前用户是否已经登录，如果未登录则执行 npm login
检查 package.json 中的 NPM 包名及 publishConfig 是否符合预期
更新版本号
使用 npm version 命令更新版本号，例如：

# 发布一个 patch 版本

> $ npm version patch -m "build: release %s"
该命令将会自动生成 git tag 及 git commit，并将版本号更新到 package.json 中。更多用法可参考 NPM 文档：https://docs.npmjs.com/cli/v8/commands/npm-version

构建及发布
father 4 的脚手架默认已将 项目体检命令 及构建命令配置到 prepublishOnly 脚本中：

  "scripts": {
    ...
+   "prepublishOnly": "father doctor && npm run build"
  },
所以我们只需要执行发布即可：

# NPM 会自动执行 prepublishOnly 脚本然后完成发布
$ npm publish
后置工作
**功能验证：**使用测试项目下载新发布的 NPM 包，验证功能是否正常
**更新日志：**将本次发布的变更通过 GitHub 的 Release Page 进行描述，也可以选择在前置工作中将变更描述写入 CHANGELOG.md 文件（未来 father 会提供自动化的更新日志生成能力，敬请期待）