import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "xhgame开发文档",
  description: "",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: '开始', link: '/readme' }
    ],

    sidebar: [
      {
        text: '1、说明',
        items: [
          { text: '初衷', link: '/readme' },
          { text: '架构说明', link: '/mindmap' }
        ]
      },
      {
        text: '2、EC',
        items: [
          { text: '组件挂载/卸载的过程', link: '/ec/comp_attach' },
          { text: '一个完整组件的构成', link: '/ec/comp_demo' },
          { text: '组件分类职责', link: '/ec/comp_cate' },
          { text: '组件的引用与注册', link: '/ec/comp_reg' },
        ]
      },
      {
        text: '3、组件开发',
        items: [
          { text: 'ModelComp(数据组件)', link: '/comps/modelComp' },
          { text: 'sceneComp(场景组件)', link: '/comps/sceneComp' },
          { text: 'ViewComp(Ui组件)', link: '/comps/viewComp' },
          // { text: 'GameboxComp(玩法组件)', link: '/comps/gameBoxComp' },
          // { text: 'Comp(其他组件)', link: '/comps/otherComp' },
        ]
      },
      {
        text: '4、开发工具',
        items: [
          { text: 'UI 组件生成工具', link: '/tools/README' },
          { text: '使用指南', link: '/tools/USAGE' },
          { text: '完整工作流', link: '/tools/WORKFLOW' },
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
