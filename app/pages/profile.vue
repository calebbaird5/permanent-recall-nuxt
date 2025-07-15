<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import type { User } from "@/types/api";

definePageMeta({
  middleware: "auth",
});

const { user, fetch: refreshSession } = useUserSession();
const error = ref<string | null>(null);
const loading = ref(false);
const showPassword = ref(false);

const schema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .optional()
      .or(z.literal("")),
    passwordConfirm: z.string().optional().or(z.literal("")),
  })
  .refine((data) => !data.password || data.password === data.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  });

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  name: (user.value as User)?.name ?? "",
  email: (user.value as User)?.email ?? "",
  password: "",
  passwordConfirm: "",
});

onMounted(() => {
  // Prefill user info if available
  if (user.value) {
    state.name = (user.value as User).name ?? "";
    state.email = (user.value as User).email ?? "";
  }
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  error.value = null;
  loading.value = true;
  try {
    const id = (user.value as User).id;
    if (!id) throw new Error("User ID is missing");
    const body: Record<string, unknown> = {};
    if (event.data.name !== (user.value as User).name)
      body.name = event.data.name;
    if (event.data.email !== (user.value as User).email)
      body.email = event.data.email;
    if (showPassword.value && event.data.password) {
      body.password = event.data.password;
    }
    await $fetch(`/api/users/${id}`, {
      method: "PUT",
      body,
    });
    await refreshSession?.();
    showPassword.value = false;
    state.password = "";
    state.passwordConfirm = "";
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null) {
      const err = e as { data?: { message?: string }; message?: string };
      error.value = err.data?.message || err.message || "Update failed";
    } else {
      error.value = "Update failed";
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <UContainer class="max-w-md mx-auto py-10">
    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormField label="Name" name="name">
        <UInput v-model="state.name" class="w-full" />
      </UFormField>

      <UFormField label="Email" name="email">
        <UInput v-model="state.email" class="w-full" />
      </UFormField>

      <template v-if="showPassword">
        <UFormField label="New Password" name="password">
          <UInput v-model="state.password" type="password" class="w-full" />
        </UFormField>
        <UFormField label="Confirm Password" name="passwordConfirm">
          <UInput
            v-model="state.passwordConfirm"
            type="password"
            class="w-full"
          />
        </UFormField>
      </template>
      <UButton type="submit" :loading="loading" color="primary">
        Update Profile
      </UButton>

      <UButton
        type="button"
        @click="showPassword = !showPassword"
        variant="outline"
        color="primary"
        class="ml-4"
      >
        {{ showPassword ? "Cancel Password Change" : "Change Password" }}
      </UButton>

      <div v-if="error" class="text-red-500 text-sm mt-2">
        {{ error }}
      </div>
    </UForm>
  </UContainer>
</template>
