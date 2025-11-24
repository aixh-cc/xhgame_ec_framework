import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "My Awesome Project",
  description: "A VitePress Site",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: '开始', link: '/readme' }
    ],

    sidebar: [
      { text: '架构初衷', link: '/readme' },
      { text: '架构说明', link: '/mindmap' },
      {
        text: '组件开发',
        items: [
          { text: 'ModelComp(数据组件)', link: '/modelComp' },
          { text: 'sceneComp(场景组件)', link: '/sceneComp' },
          { text: 'ViewComp(Ui组件)', link: '/viewComp' },
          { text: 'GameboxComp(玩法组件)', link: '/gameBoxComp' },
          { text: 'Comp(其他组件)', link: '/otherComp' },
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
