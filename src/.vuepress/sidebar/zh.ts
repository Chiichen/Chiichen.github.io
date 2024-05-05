import { sidebar } from "vuepress-theme-hope";

export const zhSidebar = sidebar({
  "/": [
    "",
    {
      text: "编程技术",
      icon: "note",
      prefix: "posts/",
      children: "structure",
    }, 
    {
      text: "课程笔记",
      icon: "note",
      prefix: "notes/",
      children: "structure",
    },
    "intro",
  ],
});
