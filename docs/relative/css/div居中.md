# div 居中

1. flext 布局

```css
display: flex;
justify-content: center;
align-items: center;
```

2. position
父元素设置为：position: relative;
子元素设置为：position: absolute;
距上50%，据左50%，然后减去元素自身宽度的一半距离就可以实现

3. position tansform 

如果元素未知宽度，只需将上面例子中的 margin: -50px 0 0 -50px;替换为：transform: translate(-50%,-50%);


4. position（元素已知宽度）（left，right，top，bottom为0，maigin：auto ）

```html
style>        
    .box{            
        width: 300px;            
        height: 300px;           
        background-color: red;            
        position: relative;        
    }        
    .box .a{            
        width: 100px;            
        height: 100px;            
        background-color: blue;            
        position: absolute;            
        top: 0;            
        bottom: 0;            
        left: 0;            
        right: 0;            
        margin: auto;        
    }    
</style>
HTML 代码：
 <div class="box">        
    <div class="a">love</div>    
</div>

```
5. table-cell布局实现
able 实现垂直居中，子集元素可以是块元素，也可以不是块元素

## 参考链接
[史上最全）div居中的几种方法](https://juejin.cn/post/6844903821529841671)