# 基于tapable的插件机制理解

本文主要介绍了使用[tapable](https://github.com/webpack/tapable)库来完成任务插件的机制，模仿[enhanced-resolve](https://github.com/webpack/enhanced-resolve)的插件机制来完成的，希望看完后对webpack和enhanced-resolve库的源码阅读过程有帮助,在面对复杂任务场景的时候可以考虑使用该插件机制。

### 前置知识

对tapable有基本的了解，

### 任务描述 webpack中[resolve](https://webpack.js.org/configuration/resolve/)的工作

enhanced-resolve 主要是用来处理解析路径，通过配webpacp配置中的resolve配置项，来影响resolve的结果。现在我们简化一下要处理的任务，只处理一部分任务

module
relative
absolute


alias
root
extension

文件夹  是否是个module
alias 重新查找
root 拼接路径