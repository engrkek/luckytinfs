// eslint.config.mjs
import antfu from '@antfu/eslint-config'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  antfu({
    stylistic: true,
    vue: true,
    typescript: true,
    ignores: ['server/db/migrations/*'],
  }, {
    rules: {
      'no-console': 'off',
      'node/prefer-global/process': 'off',
      'vue/max-attributes-per-line': ['error', { singleline: 4 }],
      'vue/singleline-html-element-content-newline': ['error', {
        ignores: ['NuxtLink', 'ULink', 'a', 'span', 'pre'],
      }],
    },
  }),
)
