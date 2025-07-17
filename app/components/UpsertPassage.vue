<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { z } from "zod";
import type { Passage } from "@/types/api";

const emit = defineEmits<{
  (e: "create" | "update", passage: Passage): void;
  (e: "cancel"): void;
}>();

const { mode, passage = null } = defineProps<{
  mode: "edit" | "create";
  passage?: Passage | null;
}>();

const error = ref<string | null>(null);

const { user } = useUserSession();

const schema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  reference: z.string().min(1, "Reference is required"),
  text: z.string().min(1, "Text is required"),
});

type Schema = z.output<typeof schema>;

const formState = reactive<Partial<Schema>>({
  prompt: "",
  reference: "",
  text: "",
});

watch(
  () => passage,
  (newPassage) => {
    if (newPassage) {
      formState.prompt = newPassage.prompt;
      formState.reference = newPassage.reference;
      formState.text = newPassage.text;
    } else {
      formState.prompt = "";
      formState.reference = "";
      formState.text = "";
    }
  },
  { immediate: true },
);

async function submitForm() {
  error.value = null;
  try {
    let passageRes: Passage;
    switch (mode) {
      case "create": {
        if (!user.value?.id) throw new Error("User not found");
        const payload = { ...formState, userId: user.value.id };
        passageRes = await $fetch("/api/passages", {
          method: "POST",
          body: payload,
        });
        emit("create", passageRes);
        break;
      }

      case "edit":
        if (!passage) {
          error.value = "No passage to edit.";
          return;
        }

        passageRes = await $fetch(`/api/passages/${passage.id}`, {
          method: "PUT",
          body: formState,
        });
        emit("update", passageRes);
        break;
    }
  } catch {
    error.value = "Failed to save passage.";
  }
}

const textareaRef = ref<HTMLTextAreaElement | null>(null);

const resize = () => {
  if (textareaRef.value) {
    if (textareaRef.value.style && textareaRef.value.scrollHeight) {
      textareaRef.value.style.height = textareaRef.value.scrollHeight + "px";
    }
  }
};

// Resize on mount and whenever text changes
onMounted(resize);
watch(() => formState.text, resize);
</script>

<template>
  <div class="p-6 h-full flex flex-col">
    <h2 class="font-bold text-lg mb-4">
      {{ mode === "create" ? "Add Passage" : "Edit Passage" }}
    </h2>
    <UForm
      :schema="schema"
      :state="formState"
      class="space-y-4 flex flex-col flex-1"
      @submit.prevent="submitForm()"
    >
      <UFormField label="Prompt" name="prompt">
        <UInput v-model="formState.prompt" class="w-full" />
      </UFormField>
      <UFormField label="Reference" name="reference">
        <UInput v-model="formState.reference" class="w-full" />
      </UFormField>
      <UFormField
        label="Text"
        name="text"
        class="flex-1 flex flex-col"
        :ui="{ container: 'flex-1' }"
      >
        <UTextarea
          ref="textareaRef"
          v-model="formState.text"
          class="w-full h-full"
          :ui="{ base: 'h-full' }"
        />
      </UFormField>
      <div class="flex justify-end gap-2 mt-4">
        <UButton type="button" variant="outline" @click="() => emit('cancel')">
          Cancel
        </UButton>
        <UButton type="submit" color="primary">
          {{ mode === "create" ? "Create" : "Update" }}
        </UButton>
      </div>

      <div v-if="error" class="text-red-500 mb-4">{{ error }}</div>
    </UForm>
  </div>
</template>
