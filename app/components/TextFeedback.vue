<script setup lang="ts">
const emit = defineEmits<{
  (e: "updateText", text: string): void;
}>();

const { expected, entered } = defineProps<{
  expected: string;
  entered: string;
}>();


// Settings for answer checking - simplified without external store
const strictCapitalization = ref(false);
const strictPunctuation = ref(false);

function isCorrect(entered: string, expected: string): boolean {
  let enteredNormalized = entered;
  let expectedNormalized = expected;

  if (!strictCapitalization.value) {
    enteredNormalized = enteredNormalized.toUpperCase();
    expectedNormalized = expectedNormalized.toUpperCase();
  }

  if (!strictPunctuation.value) {
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
  const enteredWords = (entered ?? "").split(" ");
  const expectedWords = (expected ?? "").split(" ");
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

enum FieldStatus {
  incorrect = -1,
  unmarked,
  correct,
}

interface DiffWord {
  expected: string;
  entered: string;
  correct: boolean;
}

const status = ref(FieldStatus.unmarked);
const showFeedback = ref(false);
</script>

<template>
  <div
    v-if="showFeedback && status === FieldStatus.incorrect"
    class="space-y-2"
  >
    <div class="text-sm text-red">Incorrect entry.</div>
    <div class="flex flex-wrap gap-1">
      <template v-for="(word, i) in diff" :key="i">
        <span v-if="word.correct" class="px-1 text-green">
          {{ word.expected }}
        </span>
        <span
          v-else
          class="px-1 text-error"
          @click="updateText(word.expected, i)"
        >
          {{ word.entered || "..." }}
        </span>
      </template>
    </div>
    <UButton size="xs" variant="ghost" @click="showFeedback = false">
      Hide Feedback
    </UButton>
  </div>
</template>
