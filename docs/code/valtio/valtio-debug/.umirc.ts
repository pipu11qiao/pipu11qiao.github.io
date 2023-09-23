import { defineConfig } from '@umijs/max';

type defineConfigPramas = Parameters<typeof defineConfig>;

const FE_ENV = process.env.FE_ENV;
const NODE_ENV = process.env.NODE_ENV;
const LOCAL_ENV = process.env.LOCAL_ENV;
const HTTPS = process.env.HTTPS;
const NOAUTH = process.env.NOAUTH;
/**
 * devtool是关于sourceMap的配置
 * 开发环境使用cheap-module-source-map，生成sourceMap比较快
 * 线上生成返回false，不生成sourceMap
 * 测试环境（qa，uat，demo）devTool设置为sourceMap，拿到完整的sourceMap（试了其他的，比如cheap-module-source-map，在build的时候不生效）
 * https://webpack.docschina.org/configuration/devtool/
 */
const isDevelopment = NODE_ENV === 'development';

const devtool = (() => {
  if (NODE_ENV === 'development') {
    return 'cheap-module-source-map';
  } else {
    if (FE_ENV === 'online') return 'source-map';
  }
})();

export const baseConf = {
  esbuildMinifyIIFE: true,
  define: {
    NOAUTH,
    LOCAL_ENV,
    FE_ENV,
  },
  title: 'valtio debug',
  hash: true,
  outputPath: 'dist',
  model: {},
  initialState: {},
  forkTSChecker: {
    async: false,
  },
  links: [],
  headScripts: [
    // iconpark 配置文件
    'https://lf1-cdn-tos.bytegoofy.com/obj/iconpark/svg_23151_374.45055b07a88f561e12dc988ee76c8e06.js',
  ],
  devtool,
  routes: [
    {
      path: '/',
      redirect: '/test',
    },
    // { path: '/home', component: './Page1' },
    {
      path: '/test',
      component: './Test',
    },
  ],

  npmClient: 'pnpm',
  clickToComponent: {},
  mfsu:
    NODE_ENV === 'development'
      ? {
          strategy: 'eager',
        }
      : false,
  proxy: {
    '/yapi': {
      // 为了解决本地https启动请求yapi跨域问题
      target: 'http://yapi.koolearn-inc.com',
      changeOrigin: true,
      pathRewrite: { '^/yapi': '' },
    },
  },
};

export default defineConfig(baseConf as any);
