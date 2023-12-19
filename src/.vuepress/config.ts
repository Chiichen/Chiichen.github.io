import { defineUserConfig } from "vuepress";
import { docsearchPlugin } from "@vuepress/plugin-docsearch";
import { registerComponentsPlugin } from '@vuepress/plugin-register-components'
import theme from "./theme.js";
import { getDirname, path } from '@vuepress/utils'
import { googleAnalyticsPlugin } from '@vuepress/plugin-google-analytics'
import { hopeTheme } from "vuepress-theme-hope";
const __dirname = getDirname(import.meta.url)
export default defineUserConfig({
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
      description: "vuepress-theme-hope 的博客演示",
    },
    "/en/": {
      lang: "en-US",
      title: "ChiChen's Blog",
      description: "A blog of a",

    },
  },

  theme: hopeTheme({
    // 默认为 GitHub. 同时也可以是一个完整的 URL
    repo: "Chiichen/Chiichen.github.io",
    // 自定义仓库链接文字。默认从 `repo` 中自动推断为
    // "GitHub" / "GitLab" / "Gitee" / "Bitbucket" 其中之一，或是 "Source"。
    repoLabel: "GitHub",
    // 是否在导航栏内显示仓库链接，默认为 `true`
    repoDisplay: true,
  }),

  // Enable it with pwa
  // shouldPrefetch: false,
});


