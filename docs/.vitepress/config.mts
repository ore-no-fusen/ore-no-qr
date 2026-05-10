import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: '俺のQR',
  description: 'DESIGN DOCS PORTAL',
  base: '/docs/',
  themeConfig: {
    nav: [
      { text: 'INDEX', link: '/' },
      { text: '000', link: '/000_REQUIREMENTS' },
      { text: '001', link: '/001_OVERVIEW' },
      { text: '002', link: '/002_WEB' },
      { text: '003', link: '/003_TEST' },
      { text: '004', link: '/004_GLOSSARY' }
    ],

    sidebar: [
      {
        text: 'ドキュメント一覧',
        items: [
          { text: 'INDEX', link: '/' },
          { text: '000 要求仕様', link: '/000_REQUIREMENTS' },
          { text: '001 システム全体像', link: '/001_OVERVIEW' },
          { text: '002 Web機能仕様', link: '/002_WEB' },
          { text: '003 テスト仕様', link: '/003_TEST' },
          { text: '004 用語集', link: '/004_GLOSSARY' }
        ]
      }
    ],

    search: {
      provider: 'local'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ore-no-fusen/ore-no-qr' }
    ]
  }
})
