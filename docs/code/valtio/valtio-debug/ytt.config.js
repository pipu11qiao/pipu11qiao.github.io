import { defineConfig } from 'yapi-to-typescript';
// import { defineConfig } from '../../plugins/yapi-to-typescript';
// import type { Interface } from '../../plugins/yapi-to-typescript/lib/esm';
import { pinyin } from 'pinyin-pro';
import { camelCase } from 'camel-case';

import * as fs from 'fs';
import * as path from 'path';
const PATH_API_MODULES = 'src/services/model';

let localConfig = {
  projects: [],
};
try {
  const curLocalConfig = require('./ytt.config.local.js');
  if (curLocalConfig) {
    localConfig = {
      ...localConfig,
      ...curLocalConfig,
    };
  }
} catch (e) {}
/**
 * 把api文件名从中文转为拼音驼峰
 * @param interfaceInfo
 * @returns
 */
function camelCaseApiFileName(interfaceInfo) {
  const projectName = pinyin(interfaceInfo._project.name, {
    pattern: 'pinyin',
    toneType: 'none',
  });
  const categoryName = pinyin(interfaceInfo._category.name, {
    pattern: 'pinyin',
    toneType: 'none',
  });
  return `${PATH_API_MODULES}/${camelCase(projectName)}/${camelCase(
    categoryName,
  )}.ts`;
}

/**
 * 把API内容转化为项目要求内容
 */
function optimizeApiContent() {
  const projectLists = fs.readdirSync(path.join(__dirname, PATH_API_MODULES));
  console.log(projectLists, 'projectLists');
  projectLists.forEach((project) => {
    const fileLists = fs.readdirSync(
      path.join(__dirname, PATH_API_MODULES + '/' + project),
    );
    console.log(fileLists, 'fileLists');
    const apiFileLists = fileLists.filter((file) => file.endsWith('.ts'));
    apiFileLists.forEach((apiFile) => {
      const apiFilePath = path.join(
        __dirname,
        PATH_API_MODULES + '/' + project,
        apiFile,
      );
      const apiStr = fs.readFileSync(apiFilePath, 'utf-8');
      let newApiStr = apiStr;
      const reg =
        /@请求头 `([^`]+) ([^`]+)`([\s\S]{0,200}export (interface|type) )(?!(Get|Post))(\w+(Request|Response))/g;
      let matchResult;
      while ((matchResult = reg.exec(newApiStr))) {
        newApiStr = newApiStr.replace(
          matchResult[0],
          `* @请求头 \`${matchResult[1]} ${matchResult[2]}\`${
            matchResult[3]
          }${camelCase(matchResult[1] + matchResult[2])}${matchResult[7]}`,
        );
        console.log(camelCase(matchResult[1] + matchResult[2]));
      }
      fs.writeFileSync(apiFilePath, newApiStr);
    });
  });
}

export default defineConfig(
  {
    serverUrl: 'http://yapi.eastbuy.com/', //基于 YApi 的项目，此处填 YApi 首页地址
    typesOnly: true, //是否只生成接口请求内容和返回内容的 TypeSript 类型，是则请求文件和请求函数都不会生成
    target: 'typescript', //要生成的目标代码类型
    outputFilePath: camelCaseApiFileName, //输出文件路径
    dataKey: 'data',
    projects: [
      ...localConfig.projects,
    ],
  },
  // 钩子
  {
    success() {
      // 转换API内容
      optimizeApiContent();
    },
    fail() {
      // 生成失败时触发
    },
    complete() {
      // 生成完毕时触发（无论成功、失败） 删除request.ts文件
      // const requestFile = path.join(__dirname, PATH_REQUEST);
      // if (fs.existsSync(requestFile)) {
      //   fs.unlinkSync(requestFile);
      // }
    },
  },
);
