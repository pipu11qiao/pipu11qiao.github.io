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