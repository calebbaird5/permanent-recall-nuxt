// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ["@nuxt/ui", "@nuxt/eslint", "nuxt-auth-utils"],

  css: ["~/assets/css/main.css"],

  future: {
    compatibilityVersion: 4,
  },

  compatibilityDate: "2024-11-27",

  vite: {
    server: {
      watch: {
        ignored: [
          "**/.flycheck_*",
          "**/.nuxt/**",
          "**/.output/**",
          "**/node_modules/**",
        ],
      },
    },
  },
});
