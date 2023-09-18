### gen_version.js

读取/packages目录下的包获取报名和版本,pkgList:{name:string,version:string}[],写入components/src/version.ts文件中，格式是：
```typescript
export const version= {
  'com1':'0.1.2',
  'com2':'0.1.3',
}
```

### bootstrap.js

创建一个新包，先创建一个空的文件夹，执行该命令。
该命令会扫描packages下的目录，根据目录名字生成对应的package.json，包含name,version和其他信息,写入readme.md

### changeLogs.js
生成修改日志

### checkDeps.js

checkDepsByAst方法，参数ast一个文件的语法树,参数filePath文件路径。
在语法树中，查找引入申明isImportDeclaration
获取引入的值 path.node.source.value,即是引入的路径
如果路径中包含src，报错
如果引入的路径中以"."开头,将其改为绝对路径并且查找文件，找不到报错
如果不是以".”开头，并且也是type引入，
如果是@ant-design/pro开头的检查包在不在。
如果不是这个开头的，就检查是否是antd react rc-field-form
不是在检查package.json的dependencies中包不包含这个包

### checPublish.js

### createRelease.js
好像是github推送

### release.js

function release

先检测git status 是否有未提交的。
再判断npm registry
通过lerna changed 检测文件是否有变化
执行npm run build
调用lerna publih
获取需要发布的包
获取otp的值
执行publish



## 基于lerna 做的版本管理
关键命令
* lerna changed
* learna version

```json
{
  "version": "independent",
  "npmClient": "pnpm",
  "useWorkspaces": true,
  "changelog": {
    "repo": "@xdf/material-components",
    "cacheDir": ".changelog"
  },
  "command": {
    "publish": {
      "exact": true
    }
  },
  "ignoreChanges": [
    "**/*.md",
    "**/*.test.ts",
    "**/*.e2e.ts",
    "**/demos/**",
    "**/fixtures/**",
    "**/dist/**",
    "**/lib/**",
    "**/es/**",
    "**/test/**"
  ],
  "save-exact": true,
  "packages": ["packages/*"]
}

```
配置lerna json中的command publish exact来控制相互之间的版本用固定版本

其中的问题：

## 1. npm 正式版本和alpha版本的关系

`npm` 是 Node.js 的包管理器，用于管理和发布 JavaScript 项目的依赖。在 `npm` 中，一个包可以有多个版本，其中包括正式版本和预发布版本（如 alpha、beta、rc 等）。

1. **正式版本**：这是一个稳定的版本，经过了完整的测试，并被认为是生产环境中可用的。正式版本遵循[语义化版本](https://semver.org/lang/zh-CN/)规范，通常由三个数字组成，例如 `1.2.3`，其中：
   - 第一个数字是主版本号
   - 第二个数字是次版本号
   - 第三个数字是修订号

2. **预发布版本**：这是一个还在开发中的版本，可能包含尚未经过完整测试的新功能或更改。预发布版本通常用于内部测试或提供给有限的用户群体进行测试。预发布版本的格式通常是 `主版本.次版本.修订号-预发布标签.预发布版本号`，例如 `1.2.3-alpha.1`。

关系总结：
- 正式版本是稳定的，适合生产环境。
- alpha、beta 或其他预发布版本是为了测试新功能或更改而发布的，可能不稳定，不建议在生产环境中使用。
- 开发者可以选择安装正式版本或预发布版本，具体取决于他们的需求和风险承受能力。

对于前端开发人员，特别是使用 Node.js、React 和其他技术栈的开发人员，了解这些版本的差异和如何在项目中使用它们是很重要的。


## 2. 依赖alpha版本呢的npm包会下载正式的包

当你在 `npm` 或 `yarn` 中明确指定依赖一个 `alpha` 版本的包时，你会下载并安装那个具体的 `alpha` 版本，而不是正式版本。

例如，如果你在 `package.json` 文件中这样指定一个依赖：

```json
{
  "dependencies": {
    "some-package": "1.2.3-alpha.1"
  }
}
```

那么，当你运行 `npm install` 或 `yarn install` 时，你会下载并安装 `some-package` 的 `1.2.3-alpha.1` 版本，而不是它的最新正式版本。

但是，如果你使用了一个范围版本（如 `^1.2.3` 或 `~1.2.3`）并且没有明确指定预发布版本，那么 `npm` 或 `yarn` 会尝试下载并安装最新的正式版本，而不是预发布版本。

总之，如果你明确指定了一个 `alpha` 版本，那么你会得到那个 `alpha` 版本。如果你想确保总是使用正式版本，你应该在 `package.json` 文件中明确指定或避免使用范围版本。


## 3.  lerna/cli changed命令

`lerna` 是一个流行的工具，用于管理具有多个包的 JavaScript 项目，这种项目结构通常被称为"monorepo"。`lerna` 提供了一系列命令来帮助开发者管理 monorepo，其中 `lerna changed` 是其中之一。

`lerna changed` 命令的主要功能是列出自上次发布以来有更改的包。这对于确定哪些包需要发布新版本非常有用。

### 使用方法：

```bash
lerna changed
```

### 主要特点：

1. **列出更改的包**：它会显示自上次发布以来有哪些包发生了更改。
2. **与其他命令结合使用**：你可以使用 `lerna changed` 与其他 `lerna` 命令结合，例如 `lerna publish`，以确保只发布那些实际发生更改的包。

### 注意事项：

- `lerna changed` 依赖于 Git 标签来确定上次发布的状态。这意味着你的 monorepo 必须使用 Git 作为版本控制，并且你应该使用 `lerna` 的发布工具来确保正确地标记你的发布。
- 如果你的包没有正确的标记或者你的 Git 历史被修改，`lerna changed` 可能不会正确地列出更改的包。

对于使用 Node.js、TypeScript、React 和其他相关技术栈的前端开发人员，了解 `lerna` 和它的命令可以帮助你更有效地管理和发布 monorepo 项目。


## 4. lerna vesion命令

`lerna version` 是 `lerna` 工具中的一个命令，用于为 monorepo 中的包更新版本号并创建 Git 标签。这个命令是 `lerna` 工作流中的一个关键部分，尤其是当你想要发布包的新版本时。

### 使用方法：

```bash
lerna version
```

### `lerna version` 的主要功能：

1. **自动更新版本号**：根据你的输入或配置，它会自动为那些有更改的包更新 `package.json` 中的版本号。
2. **创建 Git 标签**：为新的版本创建 Git 标签，这样你可以轻松地跟踪哪些更改包含在哪个版本中。
3. **推送更改和标签到远程仓库**：可以选择自动将更改和新的 Git 标签推送到远程 Git 仓库。
4. **生成更改日志**：可以配置为自动生成更改日志，列出自上次版本以来的所有更改。

### 常用选项：

- `--conventional-commits`：使用 Conventional Commits 规范来确定版本号增量（如 patch、minor、major）。
- `--create-release [type]`：创建 GitHub 或 GitLab 的发布。
- `--amend`：修改上一个 Git 提交，而不是创建一个新的提交。
- `--force-publish`：强制发布指定的包，即使它们没有更改。
- `--no-git-tag-version`：防止创建 Git 标签。
- `--no-push`：防止自动推送到远程 Git 仓库。

### 示例：

如果你想使用 Conventional Commits 规范来更新版本并自动生成更改日志，你可以这样运行：

```bash
lerna version --conventional-commits
```

总之，`lerna version` 是一个强大的命令，可以帮助你管理 monorepo 项目的版本。对于使用 TypeScript、React 和其他相关技术栈的前端开发人员，熟悉这个命令可以使版本管理和发布过程更加流畅。