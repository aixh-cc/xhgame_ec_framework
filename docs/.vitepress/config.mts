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
          { text: '架构说明', link: '/mindmap' },
          { text: 'v1.5.0 升级指南', link: '/upgrade_v1.5.0' },
          { text: 'UiItem 使用指南：三层数据结构设计', link: '/luminous-shimmying-treehouse' },
          { text: '红点系统设计', link: '/lively-squishing-flask' },
        ]
      },
      {
        text: '2、EC',
        items: [
          { text: '组件挂载/卸载的过程', link: '/ec/comp_attach' },
          { text: '一个完整组件的构成', link: '/ec/comp_demo' },
          { text: '组件分类职责', link: '/ec/comp_cate' },
          { text: '组件的引用与注册', link: '/ec/comp_reg' },
          { text: '组件初始化参数（setup）', link: '/ec/comp_setup_args' },
          { text: '组件依赖声明（requires）', link: '/ec/comp_requires' },
          { text: '组件 onUpdate 生命周期', link: '/ec/comp_on_update' },
          { text: 'System 类型约束', link: '/ec/system_type_safety' },
          { text: 'Entity 泛型注册表', link: '/ec/entity_generic_registry' },
        ]
      },
      {
        text: '3、组件开发',
        items: [
          { text: 'ModelComp(数据组件)', link: '/comps/modelComp' },
          { text: 'sceneComp(场景组件)', link: '/comps/sceneComp' },
          { text: 'ViewComp(Ui组件)', link: '/comps/viewComp' },
          { text: 'GameBoxComp(玩法组件)', link: '/comps/gameBoxComp' },
          // { text: 'Comp(其他组件)', link: '/comps/otherComp' },
        ]
      },
      {
        text: '4、事件系统',
        items: [
          { text: '事件类型安全', link: '/event/event_type_safety' },
        ]
      },
      {
        text: '5、开发工具',
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
