import { navbar } from "vuepress-theme-hope";

export const zhNavbar = navbar([
  "/",
  {
    text: "博文",
    icon: "edit",
    prefix: "/posts/",
    children: [
      {
        text: "编译原理",
        icon: "edit",
        prefix: "编译原理/",
        children: [
          { text: "Chapter1 编译器组成", icon: "edit", link: "Chapter1 编译器组成" },
          { text: "Chapter2 词法分析", icon: "edit", link: "Chapter2 词法分析" },
          { text: "Chapter3 语法分析", icon: "edit", link: "Chapter3 语法分析" },
          { text: "Chapter4 语义分析", icon: "edit", link: "Chapter4 语义分析" },
         { text: "Chapter5 代码生成", icon: "edit", link: "Chapter5 代码生成" },
        ],
      },
      {
        text: "Linux内核",
        icon: "edit",
        prefix:"Linux内核/",
        children:[
            {text:"VsCode+Qemu开发Linux内核",icon:"edit",link:"vscode qemu开发Linux内核"},
            {text:"Linux内核Numa实现细节",icon:"edit",link:"NUMA Balancing"},
        ],
      },
      {
        text: "杂谈",
        icon: "edit",
        prefix: "杂谈/",
        children: [
          {
            text: "震惊!!1=0",
            icon: "page",
            link: "编程杂谈/震惊!1等于0.md",
          },
          {
            text: "记一次 GP Debug 的心路历程",
            icon: "page",
            link: "Debug杂谈/记一次 GP Debug 的心路历程.md",
          },
        ],
      },

    ],
  },
  {
    text: "V2 文档",
    icon: "note",
    link: "https://theme-hope.vuejs.press/zh/",
  },
]);
