<script setup lang="ts">
import { ref } from "vue";
import type { Passage, PassageReviewList } from "@/types/api";

definePageMeta({ middleware: "auth" });

const error = ref<string | null>(null);
const showForm = ref(false);

const { data: reviewList } = await useFetch<PassageReviewList>("/api/passages/review-list");

function addNewPassage(passage: Passage) {
  if (reviewList.value?.daily) {
    reviewList.value.daily.push(passage);
    showForm.value = false;
  }
}

const noPassages = computed(() => {
  if (!reviewList.value) return true

  // if any of the passage arrays have passages the return false
  if (Object.values(reviewList.value).some((arr: Passage[]) => arr?.length)) return false

  return true
})
const reviewCategories: { key: keyof PassageReviewList, label: string }[] = [
  { key: "daily", label: "Daily Review" },
  { key: "weekly", label: "Weekly Review" },
  { key: "monthly", label: "Monthly Review" },
  { key: "yearly", label: "Yearly Review" },
];
</script>

<template>
  <div class="max-w-2xl mx-auto py-10">
    <div class="flex justify-center items-center mb-6">
      <UModal v-model:open="showForm" title="Create Passage" description="Add a new passage">
        <UButton label="Create Passage" icon="i-lucide-plus" />
        <template #content="{ close }">
          <UpsertPassage mode="create" @create="addNewPassage" @cancel="close()" />
        </template>
      </UModal>
    </div>

    <div v-if="error" class="text-red-500 mb-4">{{ error }}</div>
    <div v-else>
      <h2 class="font-bold text-lg mb-4">Today's Review List</h2>
      <div v-if="noPassages" class="text-gray-500">No passages found.</div>
      <template v-for="cat in reviewCategories" :key="cat.key">
        <div v-if="reviewList?.[cat.key]?.length">
          <h2 class="font-bold text-lg mb-4">{{ cat.label }}</h2>
          <NuxtLink v-for="passage in reviewList[cat.key]" :key="passage.id" :to="`/passages/${passage.id}/review`">
            <div class="mb-6 rounded-xl p-6 shadow-lg relative bg-muted">
              <div class="font-semibold text-lg text-primary">
                {{ passage.prompt }}
              </div>
            </div>
          </NuxtLink>
        </div>
      </template>
    </div>
  </div>
</template>
