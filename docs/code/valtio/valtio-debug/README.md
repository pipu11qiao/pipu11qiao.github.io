# README

东方甄选 B 端脚手架

### 1. 主技术栈：

本项目基于`@umijs/max` 模板项目，主要技术栈如下

umi4 + React18 + Typescript + Antd 5.x + pnpm

更多功能参考 [Umi Max 简介](https://umijs.org/docs/max/introduce)

### 2. 包管理器

包管理器统一至 pnpm，已通过 preinstall hook 限制可使用的包管理器。

但 npm 在安装单个包的时候可能会跳过校验，请大家注意，统一使用 pnpm 进行依赖安装。

### 3. 主题

在.umirc 中进行配置 token；

说明文档：[design token 说明文档](https://ant.design/docs/react/customize-theme-cn)

一般同一个项目，在开始开发的时候，由设计老师在主题编辑器（[https://ant.design/theme-editor-cn](https://ant.design/theme-editor-cn)）中配置好主题，前端直接导入生成的 json 文件

长白山主题是由设计师进行配置的。

```json
const baseConf = {
    antd: {
        theme: {
            token: {
                colorPrimary: '#00a85f',
                ...
            },
        },
    },
}
```

### 4. 图标 icons

所有 icons 收敛至 iconPark, 联系sunhaiyang@xdfzx.com 添加权限。

地址： https://iconpark.oceanengine.com/projects/23151/detail

后续 icons 禁止自行放到项目中, 使用时使用 components 下的 IconPark 组件，传递 name，size, color(只有 icon 本身不带颜色才支持)。示例如下：

```jsx
import IconPark from '@/components/IconPark';

function Home() {
  return <IconPark size={24} name="naguserselect" />;
}
```

name 从下图所示地方拿

![](https://p8.dfzxvip.com/CA2630FA-CCF0-491E-A742-652C92130691-aa200ea2.png)

如果 iconpark 上新增或删除了图标，请更新.umirc 中的 headScripts 字段，里面有 iconpark 的链接

### 5. 关于请求

本项目通过 yapi-to-typescript 与 yapi 进行打通；

后端人员写完 yapi 文档后，在项目中运行`npm run ytt`，此时将与 yapi 进行同步。yapi-to-typescript 会将相关请求入参和出参的 TS 类型，生成到`src/services/model/${projectName}/${categoryName}`中。我们在写网络请求接口时，可以直接引用入参和出参类型，具体参照`src/pages/Account/UserInfo/index.tsx`

另外，函数式组件内的相关网络请求，建议使用 ahooks 中的`useRequest`和`usePagination`进行封装，详见 [ahooks 文档](https://ahooks.js.org/zh-CN/hooks/use-request/index)

```jsx
import { usePagination } from 'ahooks';
import { AccountService } from '@/services';
import {
  QueryUserInfoByParamRequest,
  QueryUserInfoByParamResponse,
} from '@/services/model/yunYingHouTaiYongHuGuanLi/gongGongFenLei';

const { queryUserInfoByParam } = AccountService;

const UserInfo: React.FC = () => {
  const [searchFormParams, setSearchFormParams] =
    useState <
    ISearchParams >
    {
      nickName: '',
    };
  // 列表查询功能
  const { data: resData, pagination } = usePagination(
    // usePagination会自动回传current和pageSize
    ({ current, pageSize }) =>
      queryUserInfoByParam({
        pageNo: current,
        pageSize: pageSize,
        nickName: searchFormParams.nickName,
      }),
    {
      refreshDeps: [searchFormParams],
    },
  );

  return <></>;
};
```

### 5. 关于 router

router 配置在@/router 文件夹下

建议格式:

```jsx
  {
    name: '用户',
    path: '/account',
    routes: [
      {
        name: '账号管理',
        path: '/account/manage',
        routes: [
          {
            name: '用户信息查询',
            path: '/account/manage/userInfo',
            component: './Account/UserInfo',
          },
        ],
      }
    ],
  }
```

每一级新的路由不要和前一级路由使用相同名字

不建议格式:

```jsx
  {
    name: '用户',
    path: '/account',
    routes: [
      {
        name: '账号管理',
        path: '/account',
        routes: [
          {
            name: '用户信息查询',
            path: '/account/userInfo',
            component: './Account/UserInfo',
          },
        ],
      }
    ],
  }
```

### 6. 登陆

本项目已接入 passport 登陆，会在域名下种 cookie，需绑定本地 host。本地可绑定 host，例如：127.0.0.1 local-dev.dfzxvip.com 项目启动请访问 http://local-dev.dfzxvip.com/端口号

#### 环境变量接入，添加了额外的环境变量，需要的时候可以使用

> cross-env LOCAL_ENV=aaa pnpm run dev 在全局就可以获取到 LOCAL_ENV 得值 console.log(`LOCAL_ENV`, LOCAL_ENV); // LOCAL_ENV aaa

开启 https 访问需要使用 https 协议

> pnpm run dev:https

> cross-env NOAUTH=1 HTTPS=1 max dev 通过 NOAUTH=1 控制是否校验菜单权限 pnpm run dev:noauth
