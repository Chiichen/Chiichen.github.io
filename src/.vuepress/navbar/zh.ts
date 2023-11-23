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
          { text: "编译原理笔记", icon: "edit", link: "Chapter0 前言" },
        ],
      },
      {
        text: "数据库",
        icon: "edit",
        prefix: "数据库/",
        children: [
          { text: "数据库笔记", icon: "edit", link: "Chapter1 Introduction" }
        ],
      },
      {
        text: "Linux内核",
        icon: "edit",
        prefix: "Linux内核/",
        children: [
          { text: "VsCode+Qemu开发Linux内核", icon: "edit", link: "vscode qemu开发Linux内核" },
          { text: "Linux内核Numa实现细节", icon: "edit", link: "NUMA Balance实现浅析" },
          { text: "Patch:多层内存Numa Balancing", icon: "edit", link: "Patch解读/LWN针对多层内存系统重新进行NUMA平衡" },
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
          {
            text: "Rust生命周期常见误区",
            icon: "page",
            link: "Rust/Rust生命周期常见误区.md"
          }
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
