// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/image',
    '@nuxthub/core',
    '@onmax/nuxt-better-auth',
    '@pinia/nuxt',
    '@pinia/colada-nuxt',
    '@vueuse/nuxt',
    'motion-v/nuxt',
  ],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'light',
    storageKey: 'luckytinfs-color-mode',
  },

  runtimeConfig: {
    // Server-only — printed on each member's private mailbox QR as ?key=
    memberMailboxKeys: {
      maloi: '_oSkd2B6nVyk5LB5d8lTDb_Y',
      jhoanna: '1aqlwGGP-h6Qfx8hdgEP-XWA',
      bini: 'SuIGnhhSexYZ_MYbRyXxlL3C',
    },
    public: {
      networkName: 'LuckyTinFS_Guest',
      sitePassword: 'luckytin02',
    },
  },

  routeRules: {
    '/office/**': { auth: { user: { role: ['admin', 'moderator'] } }, appLayout: 'dashboard' },
    '/api/office/**': { auth: { user: { role: ['admin', 'moderator'] } } },
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
        'compressorjs',
        'vue-advanced-cropper',
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
      { name: 'Fraunces', weights: ['400 700'] },
      { name: 'Playpen Sans', weights: ['400 700'] },
      { name: 'Courier Prime', weights: ['400 700'] },
      // Local letter fonts (public/fonts) — weight 400 matches unweighted filenames
      { name: 'Nice Gourmet Script Trial', provider: 'local', weights: [400] },
      { name: 'A.Casual.Handwritten.Pen', provider: 'local', weights: [400] },
      { name: 'Au Bord de la Seine', provider: 'local', weights: [400] },
      { name: 'DK Crayon Crumble', provider: 'local', weights: [400] },
      { name: 'Elegant Bloom', provider: 'local', weights: [400] },
      { name: 'Handflair', provider: 'local', weights: [400] },
      { name: 'Lazy Dog', provider: 'local', weights: [400] },
      { name: 'Le Jardin du Bonheur', provider: 'local', weights: [400] },
      { name: 'Privilege People', provider: 'local', weights: [400] },
      { name: 'Salmon Bake', provider: 'local', weights: [400] },
      { name: 'Summer Nyumer', provider: 'local', weights: [400] },
      { name: 'Tentang Nanti Demo', provider: 'local', weights: [400] },
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
