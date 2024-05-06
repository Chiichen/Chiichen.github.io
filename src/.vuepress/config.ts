import { defineUserConfig } from "vuepress";
import { viteBundler } from '@vuepress/bundler-vite'
import { docsearchPlugin } from "@vuepress/plugin-docsearch";
import { registerComponentsPlugin } from '@vuepress/plugin-register-components'
import theme from "./theme.js";
import { getDirname, path } from '@vuepress/utils'
import { googleAnalyticsPlugin } from '@vuepress/plugin-google-analytics'
const __dirname = getDirname(import.meta.url)
export default defineUserConfig({
  bundler: viteBundler({
    viteOptions: {},
    vuePluginOptions: {},
  }),
  head: [
    /*************** start 添加谷歌统计 ***********/
    [
      "script",
      {
        src: "https://www.googletagmanager.com/gtag/js?id=G-0ENBRM6T52",
        async: true
      }
    ],
    [
      "script",
      {},
      `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-0ENBRM6T52');
      `
    ],
    /*************** end 添加谷歌统计 ***********/
  ],
  plugins: [
    // googleAnalyticsPlugin({
    //   id: 'G-0ENBRM6T52',
    // }),
    registerComponentsPlugin({
      componentsDir: path.resolve(__dirname, './components'),
    }),
    docsearchPlugin({
      appId: 'KPJEYDTI5K',

      apiKey: '80f988070f3872d6d0e6595399a2a9d3',

      indexName: 'chiichenio',

      // insights: true, // Optional, automatically send insights when user interacts with search results

      // container: '### REPLACE ME WITH A CONTAINER (e.g. div) ###'

      // debug: false // Set debug to true if you want to inspect the modal

      locales: {
        '/': {
          placeholder: "搜索文档",
          translations: {
            button: {
              buttonText: "搜索文档",
              buttonAriaLabel: "搜索文档",
            },
            modal: {
              searchBox: {
                resetButtonTitle: "清除查询条件",
                resetButtonAriaLabel: "清除查询条件",
                cancelButtonText: "取消",
                cancelButtonAriaLabel: "取消",
              },
              startScreen: {
                recentSearchesTitle: "搜索历史",
                noRecentSearchesText: "没有搜索历史",
                saveRecentSearchButtonTitle: "保存至搜索历史",
                removeRecentSearchButtonTitle: "从搜索历史中移除",
                favoriteSearchesTitle: "收藏",
                removeFavoriteSearchButtonTitle: "从收藏中移除",
              },
              errorScreen: {
                titleText: "无法获取结果",
                helpText: "你可能需要检查你的网络连接",
              },
              footer: {
                selectText: "选择",
                navigateText: "切换",
                closeText: "关闭",
                searchByText: "搜索提供者",
              },
              noResultsScreen: {
                noResultsText: "无法找到相关结果",
                suggestedQueryText: "你可以尝试查询",
                reportMissingResultsText: "你认为该查询应该有结果？",
                reportMissingResultsLinkText: "点击反馈",
              },
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
  base: "/",
  port: 10086,
  locales: {
    "/": {
      lang: "zh-CN",
      title: "ChiChen's Blog",
      description: "博客杂谈",
    },
    "/en/": {
      lang: "en-US",
      title: "ChiChen's Blog",
      description: "A blog of mine",

    },
  },

  theme,

  // Enable it with pwa
  // shouldPrefetch: false,
});
