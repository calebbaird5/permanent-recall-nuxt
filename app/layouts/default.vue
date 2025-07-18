<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const { loggedIn, user, clear: clearSession } = useUserSession();

async function logout() {
  await clearSession();
  await navigateTo("/");
}

const navItems = computed(() => {
  const items: NavigationMenuItem[][] = [
    [
      {
        label: "Home",
        icon: "i-lucide-home",
        to: "/",
        ui: !loggedIn.value ? { item: "hidden sm:inline" } : undefined,
      },
      {
        label: "Dashboard",
        icon: "i-lucide-list-checks",
        to: "/dashboard",
        ui: !loggedIn.value ? { item: "hidden sm:inline" } : undefined,
      },
      {
        label: "Passages",
        icon: "i-lucide-notebook-text",
        to: "/passages",
        ui: !loggedIn.value ? { item: "hidden sm:inline" } : undefined,
      },
    ],
  ];

  if (loggedIn.value) {
    items.push([
      {
        label: user.value?.name ?? "User",
        ui: { linkLabel: "hidden sm:inline" },
        icon: "i-lucide-user",
        avatar: {
          alt: user.value?.name ?? "A",
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
            onSelect: logout,
          },
        ],
      },
    ]);
  } else {
    items.push([
      {
        label: "Login",
        icon: "i-lucide-log-in",
        to: "/login",
      },
      {
        label: "Register",
        icon: "i-lucide-user-plus",
        to: "/register",
      },
    ]);
  }

  return items;
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <UNavigationMenu :items="navItems" content-orientation="vertical" />
    <slot />
  </div>
</template>
