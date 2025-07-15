<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import { useRoute } from "vue-router";

const { fetch: refreshSession } = useUserSession();
const route = useRoute();
const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Must be at least 8 characters"),
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  email: undefined,
  password: undefined,
});

const error = ref<string | null>(null);

async function onSubmit(event: FormSubmitEvent<Schema>) {
  error.value = null; // Clear any previous errors

  try {
    await $fetch("/api/auth/login", {
      method: "POST",
      body: event.data,
    });

    await refreshSession();
    const redirect = route.query.redirect as string | undefined;
    await navigateTo(redirect || "/");
  } catch (e) {
    console.error("Login failed", e);
    error.value = "Invalid email or password";
  }
}
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField label="Email" name="email">
      <UInput v-model="state.email" />
    </UFormField>

    <UFormField label="Password" name="password">
      <UInput v-model="state.password" type="password" />
    </UFormField>

    <UButton type="submit"> Submit </UButton>

    <div v-if="error" class="text-red-500 text-sm mt-2">
      {{ error }}
    </div>
  </UForm>
</template>
