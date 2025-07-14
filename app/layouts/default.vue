<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const navItems = ref<NavigationMenuItem[][]>([
  [
    {
      label: "Dashboard",
      icon: "i-lucide-home",
      to: "/",
    },
    {
      label: "Passages",
      icon: "i-lucide-notebook-text",
      to: "/passages",
    },
  ],
  [
    {
      label: "User",
      icon: "i-lucide-user",
      avatar: {
        src: "https://avatars.githubusercontent.com/u/739984?v=4",
        alt: "User avatar",
      },
      children: [
        {
          label: "Profile",
          icon: "i-lucide-user",
          to: "/profile",
        },
        {
          label: "Settings",
          icon: "i-lucide-settings",
          to: "/settings",
        },
        {
          label: "Logout",
          icon: "i-lucide-log-out",
          to: "/logout",
        },
      ],
    },
  ],
]);
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <UNavigationMenu :items="navItems" content-orientation="vertical" />
    <slot />
  </div>
</template>
