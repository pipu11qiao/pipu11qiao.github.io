import { defineUserConfig } from "vuepress";
import { defaultTheme } from "@vuepress/theme-default";
import { navbar } from "./navbar";
import { sidebar } from "./sidebar";

export default defineUserConfig({
  lang: "zh-CN",
  title: "Pipu",
  description: "pipu的博客",
  theme: defaultTheme({
    logo: "/images/logo.png",
    repo: "https://github.com/pipu11qiao/pipu11qiao.github.io",
    navbar,
    sidebar,
  }),
});
