# JavaScript文件类型检查

TypeScript 2.3以后的版本支持使用--checkJs对.js文件进行类型检查和错误提示。

你可以通过添加// @ts-nocheck注释来忽略类型检查；相反，你可以通过去掉--checkJs设置并添加一个// @ts-check注释来选则检查某些.js文件。 你还可以使用// @ts-ignore来忽略本行的错误。 如果你使用了tsconfig.json，JS检查将遵照一些严格检查标记，如noImplicitAny，strictNullChecks等。 但因为JS检查是相对宽松的，在使用严格标记时可能会有些出乎意料的情况。

对比.js文件和.ts文件在类型检查上的差异，有如下几点需要注意：


### 支持的JSDoc
下面的列表列出了当前所支持的JSDoc注解，你可以用它们在JavaScript文件里添加类型信息。

注意，没有在下面列出的标记（例如@async）都是还不支持的。

* @type
* @param (or @arg or @argument)
* @returns (or @return)
* @typedef
* @callback
* @template
* @class (or @constructor)
* @this
* @extends (or @augments)
* @enum