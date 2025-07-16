<script setup lang="ts">
import { ref, reactive } from "vue";
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import type { Setting } from "@/types/api";

definePageMeta({
  middleware: "auth",
});

const { user } = useUserSession();

const schema = z.object({
  strictPunctuation: z.boolean(),
  strictCapitalization: z.boolean(),
});

type Schema = z.output<typeof schema>;

const state = reactive<Schema>({
  strictPunctuation: false,
  strictCapitalization: false,
});

const loading = ref(false);
const error = ref<string | null>(null);

const settingIds = reactive<{ [key: string]: number | null }>({
  strictPunctuation: null,
  strictCapitalization: null,
});

const { data: settings } = await useFetch<Setting[]>("/api/settings");

const strictPunctuationSetting = computed(() =>
  settings.value?.find(
    (s) => s.name === "strict-punctuation" && s.userId === user.value?.id,
  ),
);
const strictCapitalizationSetting = computed(() =>
  settings.value?.find(
    (s) => s.name === "strict-capitalization" && s.userId === user.value?.id,
  ),
);

watch(
  strictPunctuationSetting,
  () =>
    (state.strictPunctuation =
      strictPunctuationSetting.value?.value === "true"),
  { immediate: true },
);

watch(
  strictCapitalizationSetting,
  () =>
    (state.strictCapitalization =
      strictCapitalizationSetting.value?.value === "true"),
  { immediate: true },
);

async function onSubmit(_event: FormSubmitEvent<Schema>) {
  if (!user.value?.id) return;
  loading.value = true;
  error.value = null;
  try {
    // Upsert strict-punctuation
    if (strictPunctuationSetting.value) {
      await $fetch<Setting>(
        `/api/settings/${strictPunctuationSetting.value.id}`,
        {
          method: "PUT",
          body: { value: state.strictPunctuation ? "true" : "false" },
        },
      );
    } else {
      const createdSetting = await $fetch<Setting>("/api/settings", {
        method: "POST",
        body: {
          name: "strict-punctuation",
          value: state.strictPunctuation ? "true" : "false",
          userId: user.value.id,
        },
      });
      settings.value?.push?.(createdSetting);
    }
    if (settingIds.strictCapitalization) {
      await $fetch<Setting>(
        `/api/settings/${settingIds.strictCapitalization}`,
        {
          method: "PUT",
          body: { value: state.strictCapitalization ? "true" : "false" },
        },
      );
    } else {
      const createdSetting = await $fetch<Setting>("/api/settings", {
        method: "POST",
        body: {
          name: "strict-capitalization",
          value: state.strictCapitalization ? "true" : "false",
          userId: user.value.id,
        },
      });
      settings.value?.push?.(createdSetting);
    }
  } catch (e) {
    console.error(e);
    error.value = "Failed to save settings.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="max-w-md mx-auto py-10">
    <h1 class="font-bold text-2xl mb-6 text-(--ui-primary)">Settings</h1>
    <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
      <UFormField label="Strict Punctuation" name="strictPunctuation">
        <USwitch v-model="state.strictPunctuation" />
      </UFormField>
      <UFormField label="Strict Capitalization" name="strictCapitalization">
        <USwitch v-model="state.strictCapitalization" />
      </UFormField>
      <UButton type="submit" :loading="loading" color="primary">Save</UButton>
      <div v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</div>
    </UForm>
  </div>
</template>
