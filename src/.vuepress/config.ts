import { defineUserConfig } from "vuepress";
import theme from "./theme.js";

export default defineUserConfig({
  base: "/",
  port: 10086,
  locales: {
    "/": {
      lang: "zh-CN",
      title: "ChiChen's Blog",
      description: "vuepress-theme-hope 的博客演示",
    },
    "/en/": {
      lang: "en-US",
      title: "ChiChen's Blog",
      description: "A blog of a",

    },
  },

  theme,

  // Enable it with pwa
  // shouldPrefetch: false,
});
