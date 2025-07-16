<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";
import type { Passage } from "~/types/api";

definePageMeta({ middleware: "auth" });

const route = useRoute();

const passageId = Number(route.params.id);
if (!passageId) {
  throw new Error("Invalid Passage Id");
}

const { data: passage } = await useFetch<Passage>(`/api/passages/${passageId}`);

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

const formState = reactive<Partial<Passage>>({
  prompt: "",
  reference: "",
  text: "",
});

// Settings for answer checking - simplified without external store
// const strictCapitalization = ref(false);
// const strictPunctuation = ref(false);

// const textDiff = computed(() =>
//   // stringDiff(formState.text ?? "", passage.value?.text ?? ""),
// );

// function checkText() {
//   // const correct = textDiff.value.every((el) => el.correct);
//   if (correct) {
//     textStatus.value = FieldStatus.correct;
//   } else {
//     textStatus.value = FieldStatus.incorrect;
//   }
//   return correct;
// }

// function checkAnswers() {
//   // const referenceCheck = checkReference();
//   const textCheck = checkText();
//   showReferenceFeedback.value = !referenceCheck;
//   showTextFeedback.value = !textCheck;
//   return referenceCheck && textCheck;
// }

// function updateText(value: string, i: number) {
//   if (formState.text) {
//     // formState.text = getUpdatedWords(formState.text, value, i);
//     checkText();
//   }
// }

const error = ref<string | null>(null);
const reviewing = ref(false);
async function markReviewed() {
  // Check if answers are correct before allowing review
  // const referenceCorrect = checkReference();
  // const textCorrect = checkText();

  // if (!referenceCorrect || !textCorrect) {
  //   error.value = "Please correct all answers before marking as reviewed.";
  //   return;
  // }

  error.value = null;
  reviewing.value = true;
  try {
    await $fetch(`/api/passages/${passageId}/review`, {
      method: "PUT",
    });
    // Reset status after successful review
    // referenceStatus.value = FieldStatus.unmarked;
    // textStatus.value = FieldStatus.unmarked;
    // showReferenceFeedback.value = false;
    // showTextFeedback.value = false;
  } catch {
    error.value = "Failed to save passage.";
  } finally {
    reviewing.value = false;
  }
}
</script>

<template>
  <UTabs
    :items="tabs"
    :ui="{ trigger: 'grow' }"
    class="gap-4 w-full"
    variant="link"
  >
    <template #learn>
      <div class="flex flex-col gap-4">
        <div class="flex items-start">
          <h2 class="text-2xl font-bold flex items-center gap-2">
            Prompt: <ToggleIcon v-model="showPrompt" />
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
          <UInput
            v-model="formState.reference"
            class="w-full"
            :class="{
              // 'border-green-500': referenceStatus === FieldStatus.correct,
              // 'border-red-500': referenceStatus === FieldStatus.incorrect,
            }"
          />
        </UFormField>

        <!-- <Feedback
          :entered="formState?.reference"
          :expected="passage?.reference"
          @updateText="(text: string) => (formState.reference = text)"
        /> -->

        <UFormField label="Text" name="text">
          <UTextarea
            v-model="formState.text"
            :rows="4"
            class="w-full"
            :class="{
              // 'border-green-500': textStatus === FieldStatus.correct,
              // 'border-red-500': textStatus === FieldStatus.incorrect,
            }"
          />
        </UFormField>

        <!-- Text feedback -->
        <!-- <div
          v-if="showTextFeedback && textStatus === FieldStatus.incorrect"
          class="space-y-2"
        >
          <div class="text-sm text-red">Incorrect text. Please fix:</div>
          <div class="flex flex-wrap gap-1">
            <template v-for="(word, i) in textDiff" :key="i">
              <span
                v-if="word.correct"
                class="px-1 py-0.5 bg-green-100 text-green-800 rounded"
              >
                {{ word.expected }}
              </span>
              <UButton
                v-else
                size="xs"
                variant="outline"
                color="red"
                @click="updateText(word.expected, i)"
                class="px-1 py-0.5"
              >
                {{ word.entered || "..." }}
              </UButton>
            </template>
          </div>
          <UButton size="xs" variant="ghost" @click="showTextFeedback = false">
            Hide Feedback
          </UButton>
        </div> -->

        <div class="flex justify-between gap-2 mt-4">
          <UButton type="button" variant="outline"> Check Answers </UButton>
          <UButton
            color="primary"
            :loading="reviewing"
            :disabled="
              false
              // referenceStatus !== FieldStatus.correct ||
              // textStatus !== FieldStatus.correct
            "
            @click="markReviewed"
          >
            Mark as Reviewed
          </UButton>
        </div>
        <div v-if="error" class="text-red-500 mb-4">{{ error }}</div>
      </UForm>
    </template>
  </UTabs>
</template>
