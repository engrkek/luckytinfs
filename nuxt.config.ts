// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/image',
    '@nuxthub/core',
    '@nuxtjs/better-auth',
    '@pinia/nuxt',
    '@pinia/colada-nuxt',
    '@vueuse/nuxt',
    'motion-v/nuxt',
  ],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      networkName: 'LuckyTinFS_Guest',
      sitePassword: 'luckytin02',
    },
  },

  routeRules: {
    '/office/**': { auth: { user: { role: ['admin', 'moderator'] } }, appLayout: 'dashboard' },
  },

  compatibilityDate: '2025-07-15',

  hub: {
    db: {
      dialect: 'sqlite',
      casing: 'snake_case',
    },
    blob: true,
    kv: true,
  },

  vite: {
    optimizeDeps: {
      include: [
        'better-auth/client/plugins',
      ],
    },
  },

  auth: {
    hubSecondaryStorage: true,
  },

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
