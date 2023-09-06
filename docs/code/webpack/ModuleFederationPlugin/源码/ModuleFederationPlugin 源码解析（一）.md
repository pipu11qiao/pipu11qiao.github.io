# 序言

本文是 Webpack ModuleFederationPlugin（后面简称 MF） 源码解析 文章中的第一篇，在此系列文章中，我将带领大家抽丝剥茧、一步步地去解析 MF 源码。当然为了帮助大家理解，可能中间也会涉及到 Webpack 源码中的其它实现，我会根据情况或浅或深的一并进行讲解。因为看 Webpack 源码需要掌握的知识量非常大，所以为了更好理解文章中的内容，你最好有如下 Webpack 相关的背景知识：

对 Webpack 核心的数据结构：Dependency、Module、Chunk 等有基本的认识
了解 Webpack 中的插件机制，对基于 tabpable 的 Hooks 机制有一定的了解，如果写过 Webpack 插件就更好了
看过 MF 的官方文档，对其带来的革命性作用有基本的认识，如果了解一些其应用场景就更好了

话不多说，让我们开始正文。

## 背景 

先简单说一下为什么要去阅读 MF 的源码，我个人理解阅读源码有两个原因：一，它的实现非常优秀，通过阅读源码能学习一些设计思想和编程技巧；二，工作或者自己的项目使用到了，但是官方给的文档不太够，遇到问题无论最后有没有解决，都有点摸不着头脑，阅读源码是为了更好地了解其内部实现，遇到问题更容易 debug。

而我阅读 MF 的源码，主要是出于第二种目的，当然我个人对 Webpack 也是非常感兴趣。目前我们部门 B 端的产品是基于 MF 实现的微前端架构，而我主要负责 B 端的开发以及参与 B 端性能优化专项，今年大部分时间都是跟 MF “搏斗”。
虽然到目前为止，性能优化已经获得了一些阶段性的胜利，但是实际上在这个过程中，我们还是走了很多弯路。这些弯路不少是由于对 MF 内部的实现细节不够了解导致的，当然除此之外，我们还需要建立一套规范的 MF 标准化开发流程。所以，阅读 MF 源码对于我个人来说非常有必要。
首先，我们先简单了解下 MF 相关知识。


## MF 基本介绍

首先，MF 是一个 Webpack 的官方插件，在 Webpack 生态中有茫茫多的插件中，好像一个插件有点微不足道。但是，MF 的作者称其为 “A game-changer in JavaScript architecture”，当然从构建工具的角度来讲，有点言过其实，因为它只能用于 Webpack 中。但是从它带来的 JavaScript 架构设计上的理念：远程依赖共享（复用组件或者其它逻辑）， 我觉得其实是给前端带来新的思考视角。

以前我们复用组件或者逻辑主要的方式有：

* 抽离一个 NPM 包，从维护性和复用性角度来讲，是目前最常见的方式。缺点在于，在微前端架构中，如果 fix 了一个 NPM 包问题，那么每一个应用都需要升级版本，重新构建打包部署上线，多团队开发的时候非常低效；
* 将产物打包成 UMD 的格式，然后通过 CDN 的方式能一定程度解决重新构建打包上线的问题，但是随着复用的组件和逻辑越多，可能会引入很多多余的 chunk 问题（如果对性能有很高的要求） 。比如 A 和 B 组件同时依赖了 lodash，那么打包成 UMD 格式有多余的 lodash chunk，没法复用。

我们来看下 MF 是怎么解决这个问题的。首先看一个简单的 MF 使用的例子，假设我们现在有两个应用 app1 和 app2：

```javascript
// app1 webpack.config.js
module.exports = {
  // 省略其它配置
	plugins: [
    new ModuleFederationPlugin({
      name: 'app1',
      filename: 'remoteEntry.js',
      remotes: {
        app2: 'app2@http://localhost:3002/remoteEntry.js',
      },
      exposes: {
        './input': './src/components/Input'
      },
      shared: {
        'react': {
          singleton: true, 
          requiredVersion: require('./package.json').dependencies.react
        },
        'react-dom': {
          singleton: true,
          requiredVersion: require('./package.json').dependencies['react-dom']
        },
        'lodash': {
          requiredVersion: require('./package.json').dependencies['lodash'],
          singleton: true,
        }
      }
    }),
  ] 
}

// app1 src/components/Input.tsx
import * as React from 'react'
import { Input } from 'antd'

export default function WrapperInput () {
  return (
    <div>
      app1 input: <Input />
    </div>
  )
}

// app1 src/App.tsx
import { Input } from 'antd';
import * as React from 'react';

const RemoteButton = React.lazy(() => import('app2/Button'));

const App = () => (
  <div>
    <h1>Typescript</h1>
    <h2>App 1</h2>
    <React.Suspense fallback="Loading Button">
      <RemoteButton />
    </React.Suspense>
    <div>
      <Input />
    </div>
  </div>
);

export default App;    

```

app2 的部分代码：

```javascript
// app2 webpack.config.js
module.exports = {
  // 省略其它配置
  plugins: [
    new ModuleFederationPlugin({
      name: 'app2',
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/Button',
      },
      remotes: {
        app1: 'app1@http://localhost:3001/remoteEntry.js',
      },
  }),
}

// app2 src/Button.tsx
import * as React from 'react';

const Button = () => <button>App 3 Button</button>;

export default Button;

// app2 src/App.tsx
import * as React from 'react';

import LocalButton from './Button';
import RemoteInput from 'app1/input';

const App = () => (
  <div>
    <h1>Typescript</h1>
    <h2>App 3</h2>
    <LocalButton />
    <React.Suspense fallback={null}>
      <RemoteInput />
    </React.Suspense>
  </div>
);

export default App;
```


简单的 Webpack 配置，我们就可以实现 app1 和 app2 两个应用之间的组件远程共享，从代码看，我们知道 app1 依赖了 app2 的 Button 组件，而 app2 依赖了 app1 的 Input 组件。
当然不止如此，MF 还可以做到：

依赖复用， app1 和 app2 同时依赖了 react 和 react-dom，那我们可以在双方的 Webpack 配置中，将两个依赖配置成 shared，而且通过 requiredVersion 指定版本；
微前端架构，微前端架构有很多实现的方式，比如 iframe、web-component 等，但是 MF 的出现，使得实现一套微前端的架构更加简单，也能非常容易解决微前端架构中的一些组件复用问题、频繁构建部署上线问题；
支持服务端渲染，MF 的实现不依赖浏览器，同样的代码，只需要将 Webpack 配置中的target改成

node，那么构建的产物就能支持 SSR。
到这里，读者已经对 MF 的使用和定位有了基本的印象，根据 MF 带来的全新的复用能力，我们可以做一些应用场景的思考。


应用场景

#### 微前端架构

微前端是这几年比较火的一个前端应用架构方案，其中比较核心的一点是各子应用之间要做到独立开发，独立构建部署上线。 从上一节对 MF 的介绍中，我们发现它天然就已经有这个优势，因此为了设计一个基于 MF 的微前端架构，我们要解决的第一点是子应用之间需要有个类似中心化的服务，将其它子应用的服务地址下发给需要消费的子应用；第二点，我们要解决子应用之间的一些通信问题，例如共享的一些用户状态。 当然还有一些其它问题，例如 UI 一致性问题。

基于以上的问题，我们可以很容易想到一种非常经典的微前端架构方案，那就是基于一个基座服务的中心化的架构方式。


每个 APP 都是一个子应用，这里可以有两种方式：如果完全不需要依赖基座的状态，则可以做成一个更加通用的前端服务，只作为提供方，在 MF 中也称为 remotes 应用。如果需要依赖主应用的状态，或者说只导出路由让基座帮忙注册，这样就可以共享基座的所有状态，这种方式与我们现在 B 端的架构方式类似。这样的架构方式，也能通过 MF shared 机制锁定 UI 库的版本，保证所有子应用 UI 的一致性。


#### 服务化的 library 和 components
跳出微前端架构，假设我们现在的场景是维护一个巨型前端应用，我们发现随着页面和依赖的第三方依赖逐渐增多，那么每次开发构建部署上线的时长也会不断增加。虽然 Webpack v5+ 版本已经做了很多优化例如本地缓存，但是对于巨型应用，我们还是发现构建还是非常低效。于是，基于 MF 的能力，我们可以做这样的一个架构设计：


我们可以将平时使用的第三方库和组件库，分别做成一个单独的服务，如果部门技术栈统一的项目可以通过 MF 插件远程使用这两个服务，这样无论是开发时还是上线构建都可以省掉这部分的构建时间，一定程度上提高了开发效率。
MF 的使用姿势非常灵活，你可以根据开发需要，充分挖掘更多的使用场景。MF 介绍的部分就到这里，下面我们正式进入源码解析的内容。


## ModuleFederationPlugin 源码解析

#### 入口源码
MF 插件相关的源码放在 lib/container 下，我们首先看下 lib/container/ModuleFedration.js的代码：

```javascript
// 省略一些 import 代码

class ModuleFederationPlugin {
	/**
	 * @param {ModuleFederationPluginOptions} options options
	 */
	constructor(options) {
		validate(options);

		this._options = options;
	}

	/**
	 * Apply the plugin
	 * @param {Compiler} compiler the compiler instance
	 * @returns {void}
	 */
	apply(compiler) {
		const { _options: options } = this;
		// expose 模块编译产物导出的类型，选项有 var、umd、commonjs、module 等，跟 output 配置中的 library 作用是一样的
		// var 代表输出的模块是挂在 window 对象上
		const library = options.library || { type: "var", name: options.name };
		// remote 模的类型，选项有 var、umd、commonjs、module 等，跟 output 配置中的 library 作用是一样的
		const remoteType =
			options.remoteType ||
			(options.library && isValidExternalsType(options.library.type)
				? /** @type {ExternalsType} */ (options.library.type)
				: "script");
		// 	enabledLibraryTypes 专门存储 entry 需要输出的 library 类型，然后被 EnableLibraryPlugin 插件消费，
		if (
			library &&
			!compiler.options.output.enabledLibraryTypes.includes(library.type)
		) {
			compiler.options.output.enabledLibraryTypes.push(library.type);
		}
		// 在完成所有内部插件注册后处理 MF 插件
		compiler.hooks.afterPlugins.tap("ModuleFederationPlugin", () => {
			if (
				options.exposes &&
				(Array.isArray(options.exposes)
					? options.exposes.length > 0
					: Object.keys(options.exposes).length > 0)
			) {
				// 如果有 expose 配置，则注册一个 ContainerPlugin
				new ContainerPlugin({
					name: options.name,
					library,
					filename: options.filename,
					runtime: options.runtime,
					shareScope: options.shareScope,
					exposes: options.exposes
				}).apply(compiler);
			}
			if (
				options.remotes &&
				(Array.isArray(options.remotes)
					? options.remotes.length > 0
					: Object.keys(options.remotes).length > 0)
			) {
				// 如果有 remotes 配置，则初始化一个 ContainerReferencePlugin
				new ContainerReferencePlugin({
					remoteType,
					shareScope: options.shareScope,
					remotes: options.remotes
				}).apply(compiler);
			}
			if (options.shared) {
				// 如果有 shared 配置，则初始化一个 SharePlugin
				new SharePlugin({
					shared: options.shared,
					shareScope: options.shareScope
				}).apply(compiler);
			}
		});
	}
}

```

从代码中可以看出，MF 插件入口的代码其实不复杂，核心的代码不到 100 行，我们首先把焦点放在插件初始化的 options参数上，它的类型为 ModuleFederationPluginOptions。
这里有个细节可以注意下，因为 Webpack 的源码是用纯 JS 写的，为了弥补如像 TypeScript 的类型注释的优势使得源码更加可读的问题，Webpack 使用了 JSDoc 配合 VS Code，在大多数场景下也能起到类型注释的效果，而 Webpack 根目录下的 declarations目录使用了 TS 定义了核心的一些数据类型，然后导出给其它 JS 文件在使用 JSDoc 时使用。
我们回到主题，我们看下ModuleFederationPluginOptions的类型定义：

```typescript
export interface ModuleFederationPluginOptions {
	/**
	 * container 应用导出的模块配置，一般是一个对象
	 */
	exposes?: Exposes;
	/**
	 * 打包产物的文件名称
	 */
	filename?: string;
	/**
	 * 构建产物的类型，里面的 type 配置可以是 umd、commonjs、var 等类型
	 */
	library?: LibraryOptions;
	/**
	 * container 的名称
	 */
	name?: string;
	/**
	 * 依赖的 remote 应用 library 类型，配置的值可以是 umd、commonjs、script、var 等
	 */
	remoteType?: ExternalsType;
	/**
	 * container 应用依赖的远程应用
	 */
	remotes?: Remotes;
	/**
	 * 配置了该选项，会为模块split 一个以该名称命名的 chunk
	 */
	runtime?: EntryRuntime;
	/**
	 * 所有共享模块的作用域名称，默认为 default，很少会修改
	 */
	shareScope?: string;
	/**
	 * 应用之间需要共享的模块
	 */
	shared?: Shared;
}

```

每个选项我都用注释做了简单的介绍，我们重点关注几个常用的配置，对于 library、runtime、
remoteType等配置平时很少使用，这里先不过多介绍，后面看到相关的源码可以再回顾。
filename和 name比较好理解，以上一小节的 app1 的 Webpack 配置为例，我们可以看到其配置如下：
arduino复制代码
```javascript
   new ModuleFederationPlugin({
      name: 'app1',
      filename: 'remoteEntry.js',
      // 省略其它配置
   })   

```

如果这样配置，app1 正好expose了一些模块给其它应用消费，例如 app2，则 app2 首先要通过 app1 的
name去找到它，也就是会在 remotes的配置中添加 app1 的指向，这里等会介绍 remotes选项时再细说。而 app2 在运行时就会加载到 app1 的构建产物 remoteEntry.js，访问 app2 的服务，打开 network，我们可以看到其加载了 app1 的 remoteEntry.js：
我们重点介绍下 exposes、remotes、shared等选项。
在上面的 MF 插件源码中，其核心的几行代码就是，在 afterPlugins hook触发后（完成其它所有内置插件初始化后），根据是否有上面三个配置，来决定是否要注册 ContainerPlugin、
ContainerReferencePlugin、SharePlugin等插件。所以更加核心的实现，是分别交给了上面三个插件去完成。

### Exposes
exposes的配置是告诉 Webpack 当前应用导出给其它应用消费的模块，首先我们来看下 exposes配置的类型定义：

```javascript
export type Exposes = (ExposesItem | ExposesObject)[] | ExposesObject;

export type ExposesItem = string;

export type ExposesItems = ExposesItem[];

export interface ExposesObject {
	[k: string]: ExposesConfig | ExposesItem | ExposesItems;
}

export interface ExposesConfig {
	import: ExposesItem | ExposesItems;
	name?: string;
}

```

上面的类型定义相对来说比较简单，只是套娃比较多，还是以上面 app1 的 Webpack 配置为例，据我平时了解到的，最常见的配置方式还是：

```javascript
exposes: {
	'./input': './src/components/Input'
},

```

但是你也可以配置

```javascript
exposes: {
	'./input': {
    name: 'input',
    import: './src/components/Input'  
  }
},

```
这种方式配置会有什么不一样了？这里会留一个悬念，在看后续的源码中，我们再详细介绍。

#### Remotes
remotes配置是告诉 Webpack 当前应用依赖了哪些远程应用，我们来看下其类型定义：

```javascript
export type Remotes = (RemotesItem | RemotesObject)[] | RemotesObject;

export type RemotesItem = string;

export type RemotesItems = RemotesItem[];

export interface RemotesObject {
	[k: string]: RemotesConfig | RemotesItem | RemotesItems;
}

export interface RemotesConfig {
	/**
	 * 共享模块需要依赖的其它模块
	 */
	external: RemotesItem | RemotesItems;
	// 共享作用域的名称，默认为 default
	shareScope?: string;
}

```

还是以 app1 为例，我们回顾其 remote 的配置：
```javascript
remotes: {
  app2: 'app2@http://localhost:3002/remoteEntry.js',
},

```

告诉了 Webpack 如果需要消费 app2 导出的模块，那么则需要加载 app2 服务的 remoteEntry.js文件，所以 app1 在初始化的时候就会加载此文件，然后通过下面的方式加载 app2 导出的模块：
```javascript
import RemoteButton from 'app2/Button';

```
是不是有点神奇，这里面的实现用了什么黑魔法，简单的几个配置，然后启动服务，就能消费其它远程应用的模块。保持耐心，后续我们将慢慢揭开其神秘的面纱。

#### Shared

MF 关于 shared配置部分是我个人觉得最复杂的部分，当然 SharedPlugin的实现也是相对来说比较复杂，因为这里牵扯到一些需要 shared配置延伸出的例如单例问题。 先留个悬念，稍后解释单例问题，我们还是先看 shared配置类型定义：

```javascript
export type Shared = (SharedItem | SharedObject)[] | SharedObject;

export type SharedItem = string;

export interface SharedObject {
	[k: string]: SharedConfig | SharedItem;
}

export interface SharedConfig {
  // 配置了 eager 是告诉 webpack 该模块是作为一个 initial chunk，无论怎么样，初始化都需要加载该模块
	eager?: boolean;
	// 共享模块依赖的模块
	import?: false | SharedItem;
	// 共享模块的包名
	packageName?: string;
  // 共享模块的版本 
	requiredVersion?: false | string;
	// 如果配置了 key，查找共享模块的时候，会在当前共享作用域查找配置的 key
	shareKey?: string;
	// 共享作用域
	shareScope?: string;
	// 是否需要保持单例
	singleton?: boolean;
	// 是否需要严格校验共享模块的版本，只有配置了 requiredVersion 配置该选型才有效
	strictVersion?: boolean;
  // 指定提供的模块的版本，将会替代低版本的模块，但是不会替代版本更好的模块
	version?: false | string;
}

```
从 SharedConfig类型我们就可以看到 shared配置有很多的场景需要适配，每个配置我都做了简单注释来介绍。当然可能这个时候，不熟悉 MF 的小伙伴看到这些配置可能是懵逼的状态。不用着急，这些配置项，在后面更加具体的源码使用场景，我会再进行介绍，这里先留个印象。
我们还是看下 app1 的配置：
```javascript
shared: {
	'react': {
   	 singleton: true, 
     requiredVersion: require('./package.json').dependencies.react
   },
   'react-dom': {
      singleton: true,
      requiredVersion: require('./package.json').dependencies['react-dom']
    },
    'lodash': {
      requiredVersion: require('./package.json').dependencies['lodash'],
      singleton: true,
   }
}

```
这里分别将 react、react-dom、lodash等三方包配置成了 shared，这样有什么作用了？
实际上 shared配置是告诉 Webpack 这些依赖需要共享（复用） ，因为在 MF 的远程模块消费机制里面，多个应用之间可能会依赖相同的三方包，如果没有一个共享机制，那么一定会导致多余的 chunk 加载，而且还有其它需要解决的问题。
以前面的 app1 和 app2 为例，app1 本身是一个 react 应用，它依赖了 app2 的一个组件，而 app2 同样也依赖了 react ，那么如果没有这个共享模块的机制，那么 app1 消费 app2 的组件可能就还需要加载 app2 的构建的 react 依赖。而且我们知道，react 的运行机制是在同一个JS runtime 里面，是不能同时存在两个 react 实例的，这也是
singleton配置的由来，它的作用就是为了解决类似这样的场景。
当然，要讲清楚这部分的原理，还有运行机制，除了需要一定的 MF 使用经验外，还需要对其源码有一定的了解，我们后续在剖析 SharedPlugin插件源码时再详细聊。
#### 小结
虽然 MF 插件入口的源码部分相对来说还是不复杂的，所以本小节我们聚焦在其配置上。实际上对于 上面提到的一些配置，例如 MF 插件的 library、remoteType等配置在官网是没有提到的，包括 exposes、
remotes、shared等配置的一些更加高级的选项，这也是 Webpack 配置复杂然后官网又不完全介绍一直被人诟病的地方。

## 总结

本文我们从 MF 插件主入口出发，分析了其插件的注册时机，并且通过阅读这部分的源码，我们了解到：

插件的配置选项除了常用的 exposes、remotes、shared、filename、name 等之外还有

library、remoteType、sharedScope等配置项，可以指定 exposes和 remotes模块的
library类型；

MF 核心的源码实现是通过其它三个插件 ContainerPlugin、

ContainerReferencePlugin、SharePlugin 等来实现，然后根据是否传入 exposes、
remotes、shared来决定是否需要初始化各个插件；

exposes、remotes、shared等选项有很多进阶的配置，特别是 shared配置比较复杂，从共享三方依赖、单例、版本锁定等角度思考，就可以想象这里面的设计不简单。
