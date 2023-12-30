import { hopeTheme } from "vuepress-theme-hope";
import { enNavbar, zhNavbar } from "./navbar/index.js";
import { enSidebar, zhSidebar } from "./sidebar/index.js";

export default hopeTheme({
  hostname: "https://chiichen.github.io/",

  author: {
    name: "Chiichen",
  },

  iconAssets: "iconfont",

  logo: "/logo.svg",

  repo: "Chiichen/Chiichen.github.io",
  docsBranch: "master",
  docsDir: "src",

  blog: {
    medias: {
      BiliBili: "https://space.bilibili.com/8427907?spm_id_from=333.1007.0.0",
      Discord: "https://example.com",
      Email: "chiichen@qq.com",
      Facebook: "https://example.com",
      GitHub: "https://github.com/Chiichen",
      Gmail: "kejian2531693734@gmail.com",
      Instagram: "https://example.com",
      Lines: "https://example.com",
      Linkedin: "https://example.com",
      Pinterest: "https://example.com",
      QQ: "https://example.com",
      Reddit: "https://example.com",
      Steam: "https://steamcommunity.com/profiles/76561198280284334/",
      Twitter: "https://example.com",
      Wechat: "https://example.com",
      Weibo: "https://example.com",
      Whatsapp: "https://example.com",
      Youtube: "https://example.com",
      Zhihu: "https://www.zhihu.com/people/hacker.fucker",
    },
  },

  locales: {
    "/en/": {
      // navbar
      navbar: enNavbar,

      // sidebar
      sidebar: enSidebar,

      footer: "Default footer",

      displayFooter: true,

      blog: {
        description: "A FrontEnd programmer",
        intro: "/en/intro.html",
      },

      metaLocales: {
        editLink: "Edit this page on GitHub",
      },
    },

    /**
     * Chinese locale config
     */
    "/": {
      // navbar
      navbar: zhNavbar,

      // sidebar
      sidebar: zhSidebar,

      footer: "默认页脚",

      displayFooter: true,

      blog: {
        description: "一个前端开发者",
        intro: "/intro.html",
      },

      // page meta
      metaLocales: {
        editLink: "在 GitHub 上编辑此页",
      },
    },
  },

  //   encrypt: {
  //     config: {
  //       "/demo/encrypt.html": ["1234"],
  //       "/zh/demo/encrypt.html": ["1234"],
  //     },
  //   },

  plugins: {
    blog: true,

    comment: {

      provider: "Giscus",
      repo: "Chiichen/Chiichen.github.io",
      repoId: "R_kgDOKevcoA",
      category: "Announcements",
      categoryId: "DIC_kwDOKevcoM4CaDrF",
      mapping: "title",
    },

    // all features are enabled for demo, only preserve features you need here
    mdEnhance: {
      align: true,
      attrs: true,
      codetabs: true,
      figure: true,
      gfm: true,
      imgLazyload: true,
      imgSize: true,
      include: true,
      mark: true,
      mathjax: true,
      mermaid: true,
      stylize: [
        {
          matcher: "Recommended",
          replacer: ({ tag }) => {
            if (tag === "em")
              return {
                tag: "Badge",
                attrs: { type: "tip" },
                content: "Recommended",
              };
          },
        },
      ],
      sub: true,
      sup: true,
      tabs: true,
      vPre: true,
    },

    // uncomment these if you want a PWA
    //     pwa: {
    //       favicon: "/favicon.ico",
    //       cacheHTML: true,
    //       cachePic: true,
    //       appendBase: true,
    //       apple: {
    //         icon: "/assets/icon/apple-icon-152.png",
    //         statusBarColor: "black",
    //       },
    //       msTile: {
    //         image: "/assets/icon/ms-icon-144.png",
    //         color: "#ffffff",
    //       },
    //       manifest: {
    //         icons: [
    //           {
    //             src: "/assets/icon/chrome-mask-512.png",
    //             sizes: "512x512",
    //             purpose: "maskable",
    //             type: "image/png",
    //           },
    //           {
    //             src: "/assets/icon/chrome-mask-192.png",
    //             sizes: "192x192",
    //             purpose: "maskable",
    //             type: "image/png",
    //           },
    //           {
    //             src: "/assets/icon/chrome-512.png",
    //             sizes: "512x512",
    //             type: "image/png",
    //           },
    //           {
    //             src: "/assets/icon/chrome-192.png",
    //             sizes: "192x192",
    //             type: "image/png",
    //           },
    //         ],
    //         shortcuts: [
    //           {
    //             name: "Demo",
    //             short_name: "Demo",
    //             url: "/demo/",
    //             icons: [
    //               {
    //                 src: "/assets/icon/guide-maskable.png",
    //                 sizes: "192x192",
    //                 purpose: "maskable",
    //                 type: "image/png",
    //               },
    //             ],
    //           },
    //         ],
    //       },
    //     },
  },
});
