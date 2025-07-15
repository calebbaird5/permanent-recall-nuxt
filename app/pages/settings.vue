<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import * as z from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import type { SettingListResponse, SettingResponse } from '@/types/api';

definePageMeta({
  middleware: 'auth',
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

onMounted(async () => {
  if (!user.value?.id) return;
  loading.value = true;
  try {
    // Fetch all settings for this user
    const res = await $fetch<SettingListResponse>('/api/settings');
    const settings = res.settings;
    const sp = settings.find(s => s.name === 'strict-punctuation' && s.userId === user.value.id);
    const sc = settings.find(s => s.name === 'strict-capitalization' && s.userId === user.value.id);
    if (sp) {
      state.strictPunctuation = sp.value === 'true';
      settingIds.strictPunctuation = sp.id;
    }
    if (sc) {
      state.strictCapitalization = sc.value === 'true';
      settingIds.strictCapitalization = sc.id;
    }
  } catch {
    error.value = 'Failed to load settings.';
  } finally {
    loading.value = false;
  }
});

async function onSubmit(_event: FormSubmitEvent<Schema>) {
  if (!user.value?.id) return;
  loading.value = true;
  error.value = null;
  try {
    // Upsert strict-punctuation
    if (settingIds.strictPunctuation) {
      await $fetch<SettingResponse>(`/api/settings/${settingIds.strictPunctuation}`, {
        method: 'PUT',
        body: { value: state.strictPunctuation ? 'true' : 'false' },
      });
    } else {
      const res = await $fetch<SettingResponse>('/api/settings', {
        method: 'POST',
        body: { name: 'strict-punctuation', value: state.strictPunctuation ? 'true' : 'false', userId: user.value.id },
      });
      settingIds.strictPunctuation = res.setting.id;
    }
    // Upsert strict-capitalization
    if (settingIds.strictCapitalization) {
      await $fetch<SettingResponse>(`/api/settings/${settingIds.strictCapitalization}`, {
        method: 'PUT',
        body: { value: state.strictCapitalization ? 'true' : 'false' },
      });
    } else {
      const res = await $fetch<SettingResponse>('/api/settings', {
        method: 'POST',
        body: { name: 'strict-capitalization', value: state.strictCapitalization ? 'true' : 'false', userId: user.value.id },
      });
      settingIds.strictCapitalization = res.setting.id;
    }
  } catch {
    error.value = 'Failed to save settings.';
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
