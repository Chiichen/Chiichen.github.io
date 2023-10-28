import { sidebar } from "vuepress-theme-hope";

export const enSidebar = sidebar({
  "/en/": [
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
