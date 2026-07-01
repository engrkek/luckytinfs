// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/image',
    '@vueuse/nuxt',
  ],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      networkName: 'LuckyTinFS_Guest',
      sitePassword: 'luckytin02',
    },
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
})
