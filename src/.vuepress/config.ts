import { defineUserConfig } from "vuepress";
import { docsearchPlugin } from "@vuepress/plugin-docsearch";
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
  plugins: [
    docsearchPlugin({
      appId: 'KPJEYDTI5K',

      apiKey: '80f988070f3872d6d0e6595399a2a9d3',

      indexName: 'chiichenio',

      insights: true, // Optional, automatically send insights when user interacts with search results

      // container: '### REPLACE ME WITH A CONTAINER (e.g. div) ###'

      // debug: false // Set debug to true if you want to inspect the modal
      locales: {
        '/': {
          placeholder: '搜索文档',
          translations: {
            button: {
              buttonText: '搜索文档',
            },
          },
        },
        '/en/': {
          placeholder: 'Search Documentation',
          translations: {
            button: {
              buttonText: 'Search Documentation',
            },
          },
        },
      },
    }),
  ],
  theme,

  // Enable it with pwa
  // shouldPrefetch: false,
});
