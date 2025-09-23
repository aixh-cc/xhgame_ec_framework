import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "My Awesome Project",
  description: "A VitePress Site",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      },
      {
        text: '开始',
        items: [
          { text: '说明', link: '/readme' },
          { text: '架构说明', link: '/mindmap' },
          {
            text: '第一个游戏-倒水游戏', link: '/design-game', items: [
              { text: '核心代码', link: '/daoshui-game-core' },
              { text: '单元测试', link: '/daoshui-game-test' },
              { text: '套用游戏模板', link: '/daoshui-game-template' },
              { text: '与黑盒子桥接', link: '/daoshui-game-bridge' },
            ]
          },
          { text: '设计原则', link: '/shejiyuanze' },
          { text: '架构说明', link: '/file-readme' },
          { text: '思维导图', link: '/framework-architecture-mindmap' },
          { text: '快速入门', link: '/framework-usage' },
          { text: 'ItemView', link: '/itemview' },
          { text: 'UiView', link: '/uiview' },
          { text: '服务ecs', link: '/server-ecs' },
          { text: '服务实体', link: '/server-ecs-entity' },
          { text: 'table表格配置项', link: '/table' },
          { text: 'Runtime API Examples', link: '/api-examples' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
