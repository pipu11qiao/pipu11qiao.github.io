# css选择器


选择器可以被分为以下类型：

* 简单选择器（Simple selectors）：通过元素类型、class 或 id 匹配一个或多个元素。
* 属性选择器（Attribute selectors）：通过 属性 / 属性值 匹配一个或多个元素。
* 伪类（Pseudo-classes）：匹配处于确定状态的一个或多个元素，比如被鼠标指针悬停的元素，或当前被选中或未选中的复选框，或元素是 DOM 树中一父节点的第一个子节点。
* 伪元素（Pseudo-elements）:匹配处于相关的确定位置的一个或多个元素，例如每个段落的第一个字，或者某个元素之前生成的内容。
* 组合器（Combinators）：这里不仅仅是选择器本身，还有以有效的方式组合两个或更多的选择器用于非常特定的选择的方法。例如，你可以只选择 divs 的直系子节点的段落，或者直接跟在 headings 后面的段落。
* 多用选择器（Multiple selectors）：这些也不是单独的选择器；这个思路是将以逗号分隔开的多个选择器放在一个 CSS 规则下面， 以将一组声明应用于由这些选择器选择的所有元素。

## 简单选择器

* 类型选择器(p,h1,h2)
* 类选择器(.aa)
* ID选择器 (#aa)
* 通用选择器(*)
* 组合器
  * 后代选择器
  * 子选择器
  * 相邻兄弟选择器
  * 通用兄弟选择器

## 属性选择器

* 存在和值属性选择器

  * [attr]
  * [attr=val]
  * [attr~=val]

* 子串值属性选择器
  * [attr|=val] : 选择attr属性的值以val（包括val）或val-开头的元素（-用来处理语言编码）。
  * [attr^=val] : 选择attr属性的值以val开头（包括val）的元素。
  * [attr$=val] : 选择attr属性的值以val结尾（包括val）的元素。
  * [attr*=val] : 选择attr属性的值中包含字符串val的元素。

## 伪类和伪元素

### 伪类

一个css伪类pseudo-class是一个以冒号（：）作为前缀的关键字，当前希望样式在特定的状态下才被呈现到指定的元素时，你可以往元素的选择器后面加上对应的伪类（pseudo-class).例如当鼠标悬停在元素上面是，或者当一个checkbox被禁用或者勾选时，又或者当一个元素是它在DOM树中父元素的第一个孩子元素时
:active
:any
:checked
:default
:dir()
:disabled
:empty
:enabled
:first
:first-child
:first-of-type
:fullscreen
:focus
:hover
:indeterminate
:in-range
:invalid
:lang()
:last-child
:last-of-type
:left
:link
:not()
:nth-child()
:nth-last-child()
:nth-last-of-type()
:nth-of-type()
:only-child
:only-of-type
:optional
:out-of-range
:read-only
:read-write
:required
:right
:root
:scope
:target
:valid
:visited

### 伪元素

伪元素（Pseudo-element）跟伪类很像，但它们又有不同的地方。它们都是关键字 —— 但这次伪元素前缀是两个冒号 (::) —— 同样是添加到选择器后面达到指定某个元素的某个部分。

::after
::before
::first-letter
::first-line
::selection
::backdrop


### 参考链接
[CSS 选择器，一篇就够了](https://segmentfault.com/a/1190000013424772)