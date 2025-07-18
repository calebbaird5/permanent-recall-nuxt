<script setup lang="ts">
import { ref } from "vue";
import type { Passage } from "@/types/api";

definePageMeta({ middleware: "auth" });

const error = ref<string | null>(null);
const showForm = ref(false);

const { data: passages } = await useFetch<Passage[]>("/api/passages");

function addNewPassage(passage: Passage) {
  if (passages.value) {
    passages.value.push(passage);
    showForm.value = false;
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto py-10">
    <div class="flex justify-center items-center mb-6">
      <UModal
        v-model:open="showForm"
        title="Create Passage"
        description="Add a new passage"
      >
        <UButton label="Create Passage" icon="i-lucide-plus" />
        <template #content="{ close }">
          <UpsertPassage
            mode="create"
            @create="addNewPassage"
            @cancel="close()"
          />
        </template>
      </UModal>
    </div>

    <div v-if="error" class="text-red-500 mb-4">{{ error }}</div>
    <div v-else>
      <h2 class="font-bold text-lg mb-4">Today's Review List</h2>
      <div v-if="!passages || passages.length === 0" class="text-gray-500">
        No passages found.
      </div>
      <template v-if="passages && passages.length > 0">
        <NuxtLink
          v-for="passage in passages.slice(0, 5)"
          :key="Number(passage.id)"
          :to="`/passages/${passage.id}/review`"
        >
          <div class="mb-6 rounded-xl p-6 shadow-lg relative bg-muted">
            <div class="font-semibold text-lg text-primary">
              {{ passage.prompt }}
            </div>
          </div>
        </NuxtLink>
      </template>
    </div>
  </div>
</template>
