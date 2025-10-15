import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2024-09-01',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  ui: {
    theme: {
      colors: {
        primary: 'emerald'
      }
    }
  },
  vite: {
    build: {
      target: 'esnext'
    }
  }
})
