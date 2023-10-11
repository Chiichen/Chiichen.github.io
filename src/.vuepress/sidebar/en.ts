import { sidebar } from "vuepress-theme-hope";

export const enSidebar = sidebar({
  "/": [
    "",
    {
      text: "Articles",
      icon: "note",
      prefix: "posts/",
      children: "structure",
    },
        "intro",
  ],
});
