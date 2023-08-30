jscodeshift是一个重构代码的工具集，对recast（一个通过分析AST做代码修改的库）做了封装，通过jscodeshift编写codemod, 然后对指定文件运行就可以批量重构代码，大大减少了体力劳动，并可复用。常见的react升级的codemod就是基于jscodeshift的
## 用法

### 1. 创建codemod

```javascript
module.exports = function(fileInfo, api) {
  return api.jscodeshift(fileInfo.source)
    .findVariableDeclarators('foo')
    .renameTo('bar')
    .toSource();
}
```
这里api.jscodeshift将字符串源文件fileInfo.source转换为一个可遍历/操作的Collection, 使用ast的第一步就是要找到指定的ast节点，findVariableDeclarators('foo')就是找到变量foo的声明语句。找到节点下一步就是进行操作，Collection的api是像jQuery一样链式调用的，很方便，renameTo('bar')是把变量foo重命名为bar, 这里renameTo不光修改了foo声明的地方，还向下遍历把作用域内出现的都替换了。最后一步是toSource把处理后的ast转换为字符串输出。这就是codemod的基本流程：找到节点->操作节点->输出

### 2. 使用codemod

terminal内使用：
```javascript
$ npx jscodeshift -t mycodemod.js file

```
犯的一个错误：ts文件要指定 --parser=ts --extensions=js,ts

### [Collection](https://github.com/facebook/jscodeshift/blob/main/src/Collection.js)

jscodeshift对recast的一个重要封装就是Collection, 顾名思义Collection是一个ast节点集合, 这里和jQuery或数据库的操作真的很像，比如api.jscodeshift(fileInfo.source).findVariableDeclarators('foo')是不是就是$('.foo')或db.collection.find( { id: 'foo' } } )
Collection通过api.jscodeshift(fileInfo.source).find获得

find(type: recast.NamedTypes, filter): Collection
type: ast节点类型，通过ast神器astexplorer可以查看对应节点类型. 然后每个类型都是api.jscodeshift上的一个属性，比如api.jscodeshift.VariableDeclaration
filter: 是一个ast节点的部分样貌, find就是去找符合的节点
比如找名字为foo的标识符：

```javascript
const { j: jscodeshift } = api
j(fileInfo.source)
    .find(j.Identtifier, { name: 'foo' })
```

而且前面的findVariableDeclarators就是对find的封装：

```javascript
findVariableDeclarators: function(name) {
    const filter = name ? {id: {name: name}} : null;
    return this.find(VariableDeclarator, filter);
  }

```

当然如果要找的节点很复杂，使用find不好一次性找到，就需要使用Collection.filter找

filter(path): Collection

比如要找一个声明时有两个元素的数组[1,2]:
复制代码const { j: jscodeshift } = api;

```javascript
j(fileInfo.source)
   .find(j.ArrayExpression)
   .filter((path) => {
     return path.node.elements.length === 2;
   });

```

### [Builder](https://github.com/facebook/jscodeshift#builders)

另一个重要的概念是Builder, 即ast构造器，有时我们不只要修改节点，还要创造节点，比如自动导入foo模块，也即是要在代码里插入：

```javascript
import foo from 'foo';
```

此时就要构造这个节点

```javascript
j.importDeclaration(
  [j.importDefaultDeclaration(j.identifier('foo'))],
  j.literal('foo')
);
```
jscodeshift所有ast相关操作都来自于[ast-types](https://github.com/benjamn/ast-types), 具体构造器参数可以查看ast-types


构造器构造的代码类型，参赛[babel-doc](https://babeljs.io/docs/babel-types)




修改后通过prettier进行格式化

prettier --write <file-path>