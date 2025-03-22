import type { HeadConfig } from 'vitepress'

export const head: HeadConfig[] = [
  [
    'link',
    {
      rel: 'icon',
      href: 'https://rayadaschn.github.io/front-end-life/favicon.ico',
    },
  ],
  [
    'meta',
    {
      name: 'keywords',
      content: 'Effective Typescript, book',
    },
  ],
  [
    'script',
    {
      async: '',
      src: 'https://www.googletagmanager.com/gtag/js?id=G-HXK7YZ1S4N',
    },
  ],
  [
    'script',
    {},
    "window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', 'G-HXK7YZ1S4N');",
  ],
]
