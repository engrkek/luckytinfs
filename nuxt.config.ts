// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/image',
    '@vueuse/nuxt',
    'motion-v/nuxt',
  ],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'light',
    storageKey: 'luckytinfs-color-mode',
  },

  ui: {
    prose: true,
  },

  runtimeConfig: {
    public: {
      networkName: 'LuckyTinFS_Guest',
      sitePassword: 'luckytin02',
    },
  },

  routeRules: {
    '/': { redirect: '/blockscreening' },
  },

  compatibilityDate: '2025-07-15',

  eslint: {
    config: {
      standalone: false,
      stylistic: true,
    },
  },

  fonts: {
    families: [
      { name: 'Cedarville Cursive' },
      { name: 'Inter', weights: ['400 700'] },
      { name: 'Fraunces', weights: ['400 700'] },
      { name: 'Playpen Sans', weights: ['400 700'] },
      { name: 'Courier Prime', weights: ['400 700'] },
    ],
  },

  icon: {
    customCollections: [
      {
        prefix: 'custom',
        dir: './app/assets/icons',
      },
    ],
    clientBundle: {
      scan: true,
      includeCustomCollections: true,
    },
    provider: 'iconify',
  },

  image: {
    provider: 'none',
  },
})
