<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Must be at least 8 characters"),
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  name: undefined,
  email: undefined,
  password: undefined,
});

const error = ref<string | null>(null);
const loading = ref(false);

async function onSubmit(event: FormSubmitEvent<Schema>) {
  error.value = null;
  loading.value = true;
  try {
    await $fetch("/api/auth/register", {
      method: "POST",
      body: event.data,
    });
    await navigateTo("/");
  } catch (e) {
    if (e instanceof Error) {
      error.value = e.message;
    } else {
      error.value = "Registration failed";
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <UContainer class="max-w-md py-10">
    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormField label="Name" name="name">
        <UInput v-model="state.name" class="w-full" />
      </UFormField>

      <UFormField label="Email" name="email">
        <UInput v-model="state.email" class="w-full" />
      </UFormField>

      <UFormField label="Password" name="password">
        <UInput v-model="state.password" type="password" class="w-full" />
      </UFormField>

      <UButton type="submit" :loading="loading"> Register </UButton>

      <div v-if="error" class="text-red-500 text-sm mt-2">
        {{ error }}
      </div>
    </UForm>
    <div class="mt-4 text-center">
      <ULink to="/login"> Already have an account? Login </ULink>
    </div>
  </UContainer>
</template>
