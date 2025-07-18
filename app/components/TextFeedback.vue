<script lang="ts">
export enum FieldStatus {
  incorrect = "Incorrect",
  unchecked = 'Unchecked',
  correct = "correct",
}
</script>
<script setup lang="ts">
const emit = defineEmits<{
  (e: "updateText", text: string): void;
  (e: "checked", text: FieldStatus): void;
}>();

const { expected, entered, strictCapitalization = false, strictPunctuation = false } = defineProps<{
  expected: string;
  entered: string;
  strictCapitalization?: boolean;
  strictPunctuation?: boolean;
}>();

function isCorrect(entered: string, expected: string): boolean {
  let enteredNormalized = entered;
  let expectedNormalized = expected;

  if (!strictCapitalization) {
    enteredNormalized = enteredNormalized.toUpperCase();
    expectedNormalized = expectedNormalized.toUpperCase();
  }

  if (!strictPunctuation) {
    enteredNormalized = enteredNormalized.replace(
      /[.,/#!$%^&*;:{}=\-_`~()]/g,
      "",
    );
    expectedNormalized = expectedNormalized.replace(
      /[.,/#!$%^&*;:{}=\-_`~()]/g,
      "",
    );
  }

  return enteredNormalized === expectedNormalized;
}

function stringDiff(entered: string, expected: string): DiffWord[] {
  const enteredWords = (entered ?? "").split(/\s+/);
  const expectedWords = (expected ?? "").split(/\s+/);
  const result = enteredWords.map((el, i) => {
    const expectedWord: string =
      i < expectedWords.length && expectedWords[i] !== undefined
        ? expectedWords[i]
        : "";
    return {
      entered: el,
      expected: expectedWord,
      correct: isCorrect(el, expectedWord),
    };
  });
  if (
    enteredWords.length < expectedWords.length &&
    enteredWords[enteredWords.length - 1]
  ) {
    const expectedWord = expectedWords[enteredWords.length];
    result.push({
      entered: "",
      expected: expectedWord !== undefined ? expectedWord : "",
      correct: false,
    });
  }
  return result;
}

function getUpdatedWords(
  original: string,
  newValue: string,
  index: number,
): string {
  const words = original.split(" ");
  words.splice(index, 1, newValue);
  return words.join(" ");
}

function updateText(value: string, i: number) {
  if (entered) {
    emit("updateText", getUpdatedWords(entered, value, i));
  }
}

const diff = computed(() => stringDiff(entered, expected));

interface DiffWord {
  expected: string;
  entered: string;
  correct: boolean;
}

const status = ref(FieldStatus.unchecked);
const showFeedback = ref(true);
watch(diff, (newVal) => {
  const newValue = newVal.some(dw => !dw.correct) ? FieldStatus.incorrect : FieldStatus.correct
  status.value = newValue
  emit("checked", newValue)
}, { immediate: true }
);
</script>

<template>
  <div v-if="showFeedback && status === FieldStatus.incorrect" class="space-y-2">
    <div class="text-sm text-red">Incorrect entry.</div>
    <div class="flex flex-wrap gap-1">
      <template v-for="(word, i) in diff" :key="i">
        <span v-if="word.correct" class="text-green">
          {{ word.expected }}
        </span>
        <span v-else class="text-error cursor-help" @click="updateText(word.expected, i)">
          {{ word.entered || "..." }}
        </span>
      </template>
    </div>
  </div>
  <UButton size="xs" variant="ghost" @click="showFeedback = !showFeedback">
    {{ showFeedback ? 'Hide' : 'Show' }} Feedback
  </UButton>
</template>
