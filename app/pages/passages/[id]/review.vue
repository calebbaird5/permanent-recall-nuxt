<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";
import { FieldStatus } from "../../../components/TextFeedback.vue";
import type { Passage } from "~/types/api";
import type { Setting } from "@prisma/client";

definePageMeta({ middleware: "auth" });

const route = useRoute();

const passageId = Number(route.params.id);
if (!passageId) {
  throw createError({ statusCode: 404, statusMessage: "Passage not found" });
}

const { data: passage } = await useFetch<Passage>(`/api/passages/${passageId}`);
if (!passage.value) {
  throw createError({ statusCode: 404, statusMessage: "Passage not found" });
}
// At this point, passage.value is guaranteed to be defined.
// You can use a non-null assertion to help TypeScript understand this:
const passageValue = passage.value!;


const tabs = ref<TabsItem[]>([
  {
    label: "Learn",
    slot: "learn" as const,
    icon: "i-lucide-book-open",
  },
  {
    label: "Test",
    slot: "test" as const,
    icon: "i-lucide-check-square",
  },
]);

const showPrompt = ref(true);
const showReference = ref(false);
const showText = ref(false);

const formState = reactive({
  prompt: "",
  reference: "",
  text: "",
});

const { data: settings } = await useFetch<Setting[]>("/api/settings");

// Extract settings for answer checking
const strictCapitalization = computed(() =>
  settings.value?.find(s => s.name === "strict-capitalization")?.value === "true" || false
);
const strictPunctuation = computed(() =>
  settings.value?.find(s => s.name === "strict-punctuation")?.value === "true" || false
);

const showFeedback = ref(false);

const referenceStatus = ref(FieldStatus.unchecked)
const textStatus = ref(FieldStatus.unchecked)

function checkAnswers() {
  showFeedback.value = !showFeedback.value
}

const error = ref<string | null>(null);
const reviewing = ref(false);
async function markReviewed() {
  if ([referenceStatus.value, textStatus.value].includes(FieldStatus.unchecked)) {
    checkAnswers()
  }

  if (![referenceStatus.value, textStatus.value].every(s => s === FieldStatus.correct)) {
    error.value = 'Invalid Entry.'
    return
  }

  error.value = null;
  reviewing.value = true;
  try {
    await $fetch(`/api/passages/${passageId}/review`, {
      method: "PUT",
    });
    await navigateTo("/dashboard");
  } catch {
    error.value = "Failed to save passage.";
  } finally {
    reviewing.value = false;
  }
}

</script>

<template>
  <UTabs :items="tabs" :ui="{ trigger: 'grow' }" class="gap-4 w-full" variant="link">
    <template #learn>
      <div class="flex flex-col gap-4">
        <div class="flex items-start">
          <h2 class="text-2xl font-bold flex items-center gap-2">
            Prompt:
            <ToggleIcon v-model="showPrompt" />
          </h2>
          <p v-if="showPrompt" class="ml-2 text-2xl">{{ passage?.prompt }}</p>
        </div>
        <div class="flex items-start">
          <h3 class="text-2xl font-bold flex items-center gap-2">
            Reference:
            <ToggleIcon v-model="showReference" />
          </h3>
          <p v-if="showReference" class="ml-2 text-2xl">
            {{ passage?.reference }}
          </p>
        </div>
        <div class="flex items-start">
          <h3 class="text-xl font-bold flex items-center gap-2">
            Text:
            <ToggleIcon v-model="showText" />
          </h3>
          <p v-if="showText" class="ml-2 text-xl whitespace-pre-wrap">
            {{ passage?.text }}
          </p>
        </div>
      </div>
    </template>

    <template #test>
      <UForm :state="formState" class="space-y-4">
        <h2 class="text-2xl font-bold flex items-center gap-2">
          {{ passage?.prompt }}
        </h2>
        <UFormField label="Reference" name="reference">
          <UInput v-model="formState.reference" class="w-full" :ui="{
            base: [
              ...[referenceStatus !== FieldStatus.unchecked && 'border-1'],
              ...[referenceStatus === FieldStatus.correct && 'border-green-500'],
              ...[referenceStatus === FieldStatus.incorrect && 'border-red-500'],
            ]
          }" />
          <template v-if="showFeedback" #help>
            <TextFeedback :entered="formState?.reference" :expected="passageValue.reference"
              :strict-capitalization="strictCapitalization" :strict-punctuation="strictPunctuation"
              @update-text="(text: string) => (formState.reference = text)"
              @checked="status => referenceStatus = status" />
          </template>
        </UFormField>


        <UFormField label="Text" name="text">
          <UTextarea v-model="formState.text" :rows="4" class="w-full" :ui="{
            base: [
              ...[textStatus !== FieldStatus.unchecked && 'border-1'],
              ...[textStatus === FieldStatus.correct && 'border-green-500'],
              ...[textStatus === FieldStatus.incorrect && 'border-red-500'],
            ]
          }" />

          <template v-if="showFeedback" #help>
            <TextFeedback :entered="formState?.text" :expected="passageValue.text"
              :strict-capitalization="strictCapitalization" :strict-punctuation="strictPunctuation"
              @update-text="(text: string) => (formState.text = text)" @checked="status => textStatus = status" />
          </template>
        </UFormField>

        <div class="flex justify-between gap-2 mt-4">
          <UButton type="button" variant="outline" @click="checkAnswers">{{ showFeedback ? 'Hide' : 'Check' }} Answers
          </UButton>
          <UButton color="primary" :loading="reviewing" @click="markReviewed">
            Mark as Reviewed
          </UButton>
        </div>
        <div v-if="error" class="text-red-500 mb-4">{{ error }}</div>
      </UForm>
    </template>
  </UTabs>
</template>
