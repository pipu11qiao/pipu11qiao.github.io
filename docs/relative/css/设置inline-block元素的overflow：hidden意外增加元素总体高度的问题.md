摘要: 设置inline-block元素的overflow：hidden意外增加元素总体高度的问题工作中遇到的一个问题，设置inline-block元素的overflow：hidden意外增加元素总体高度。


描述如下：

设 A为子容器，B为父容器。

A设置为inline-block，并且overflow为hidden，A高度为23，B高度为30。

A设置为block，A高度为23，B高度为23。

通过stackoverflow找到原因（http://stackoverflow.com/questions/22421782/css-overflow-hidden-increases-height-of-container），摘抄如下：

Let me explain to you why this is happening.

According to CSS 2.1 Specs,

The baseline of an ‘inline-block’ is the baseline of its last line box in the normal flow, unless it has either no in-flow line boxes or if its ‘overflow’ property has a computed value other than ‘visible’, in which case the baseline is the bottom margin edge.
To explain in simple words,

i) If inline-block in question has its overflow property set to visible (which is by default so no need to set though). Then its baseline would be the baseline of the containing block of the line. ii) If inline-block in question has its overflow property set to OTHER THAN visible. Then its bottom margin would be on the baseline of the line of containing box.

So, in your case the inline-block cell has overflow:hidden (not VISIBLE), so its margin-bottom, the border of cell is at the baseline of the container element container.

That is why the element cell looks pushed upwards and the height of container appears increased. You can avoid that by setting cell to display:block.

翻译如下：

‘inline-block’的baseline是其在normal flow中的最后一个line box的baseline，除非它没有in-flow line boxes，或者其‘overflow’属性不等于‘visible’，这种情况下，其baseline位于bottom margin边上。

解释如下：

i) 如果inline-block的overflow设为visible（默认属性），则其baseline是当前行的containing block的baseline。

ii) 如果overflow设为其他，则其bottom margin位于前行的containing block的baseline；

我们这种情况下，inline-block元素的overlow：hidden，所以元素的底部边框在父元素的baseline。

因此高度才会看起来增加了。

1. 解决方法
常用的解决方法是为上述inline-block元素添加vertical-align: bottom。你可以在上面的例子中在线测试下。
2. 解决方法
可以将inline-block设为block，即可解决问题。