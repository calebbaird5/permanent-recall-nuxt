<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { z } from "zod";
import type { Passage } from "@/types/api";

definePageMeta({ middleware: "auth" });

const passages = ref<Passage[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const showForm = ref(false);
const formMode = ref<"create" | "edit">("create");
const passageToEdit = ref<Passage | null>(null);
const passageToDelete = ref<Passage | null>(null);
const showDelete = ref(false);
const deleting = ref(false);

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

async function fetchPassages() {
  loading.value = true;
  try {
    const res = await $fetch("/api/passages");
    passages.value = (res as { passages: Passage[] }).passages;
  } catch {
    error.value = "Failed to load passages.";
  } finally {
    loading.value = false;
  }
}

onMounted(fetchPassages);

function openCreateForm() {
  formMode.value = "create";
  Object.assign(formState, { prompt: "", reference: "", text: "" });
  passageToEdit.value = null;
}

function openEditForm(passage: Passage) {
  formMode.value = "edit";
  Object.assign(formState, {
    prompt: passage.prompt,
    reference: passage.reference,
    text: passage.text,
  });
  passageToEdit.value = passage;
  showForm.value = true;
}

async function submitForm(close?: () => void) {
  error.value = null;
  try {
    if (formMode.value === "create") {
      if (!user.value?.id) throw new Error("User not found");
      const payload = { ...formState, userId: user.value.id };
      const res = await $fetch("/api/passages", {
        method: "POST",
        body: payload,
      });
      passages.value.push((res as { passage: Passage }).passage);
    } else if (formMode.value === "edit" && passageToEdit.value) {
      const res = await $fetch(`/api/passages/${passageToEdit.value.id}`, {
        method: "PUT",
        body: formState,
      });
      const updated = (res as { passage: Passage }).passage;
      const idx = passages.value.findIndex((p) => p.id === updated.id);
      if (idx !== -1) passages.value[idx] = updated;
    }
    if (close) close();
    showForm.value = false;
  } catch {
    error.value = "Failed to save passage.";
  }
}

function confirmDeletePassage(passage: Passage) {
  passageToDelete.value = passage;
  showDelete.value = true;
}

async function deletePassage() {
  if (!passageToDelete.value) return;
  deleting.value = true;
  error.value = null;
  try {
    await $fetch(`/api/passages/${passageToDelete.value.id}`, {
      method: "DELETE",
    });
    passages.value = passages.value.filter(
      (p) => p.id !== passageToDelete.value!.id,
    );
    showDelete.value = false;
    passageToDelete.value = null;
  } catch {
    error.value = "Failed to delete passage.";
  } finally {
    deleting.value = false;
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto py-10">
    <div class="flex justify-between items-center mb-6">
      <h1 class="font-bold text-2xl">Passages</h1>
      <UModal
        v-model:open="showForm"
        title="Create or Update Passage"
        description="A modal to create or update a passage"
      >
        <UButton
          label="Add Passage"
          icon="i-lucide-plus"
          @click="openCreateForm"
        />
        <template #content="{ close }">
          <div class="p-6">
            <h2 class="font-bold text-lg mb-4">
              {{ formMode === "create" ? "Add Passage" : "Edit Passage" }}
            </h2>
            <UForm
              :schema="schema"
              :state="formState"
              class="space-y-4"
              @submit.prevent="submitForm(close)"
            >
              <UFormField label="Prompt" name="prompt">
                <UInput v-model="formState.prompt" class="w-full" />
              </UFormField>
              <UFormField label="Reference" name="reference">
                <UInput v-model="formState.reference" class="w-full" />
              </UFormField>
              <UFormField label="Text" name="text">
                <UTextarea v-model="formState.text" :rows="4" class="w-full" />
              </UFormField>
              <div class="flex justify-end gap-2 mt-4">
                <UButton type="button" variant="outline" @click="close()"
                  >Cancel</UButton
                >
                <UButton type="submit" color="primary">
                  {{ formMode === "create" ? "Create" : "Update" }}
                </UButton>
              </div>
            </UForm>
          </div>
        </template>
      </UModal>
    </div>

    <div v-if="error" class="text-red-500 mb-4">{{ error }}</div>
    <div v-if="loading" class="flex justify-center py-10">
      <span>Loading...</span>
    </div>
    <div v-else>
      <div v-if="passages.length === 0" class="text-gray-500">
        No passages found.
      </div>
      <div
        v-for="passage in passages"
        :key="Number(passage.id)"
        class="mb-6 rounded-xl p-6 shadow-lg relative bg-muted"
      >
        <div class="flex justify-between items-start mb-2">
          <div>
            <div class="font-semibold text-lg text-primary">
              {{ passage.prompt }}
            </div>
            <div class="text-sm text-muted">
              {{ passage.reference }}
            </div>
          </div>
          <div class="flex gap-2">
            <UButton
              icon="i-lucide-pencil"
              size="xs"
              color="neutral"
              variant="soft"
              @click="() => openEditForm(passage)"
            />
            <UModal>
              <UButton
                icon="i-lucide-trash"
                size="xs"
                color="error"
                variant="soft"
                @click="confirmDeletePassage(passage)"
              />
              <template #content="{ close }">
                <div class="p-6">
                  <h2 class="font-bold text-lg mb-4">Delete Passage</h2>
                  <p>
                    Are you sure you want to delete this passage? This cannot be
                    undone.
                  </p>
                  <div class="flex justify-end gap-2 mt-4">
                    <UButton type="button" variant="outline" @click="close()"
                      >Cancel</UButton
                    >
                    <UButton
                      type="button"
                      color="error"
                      :loading="deleting"
                      @click="deletePassage"
                      >Delete</UButton
                    >
                  </div>
                </div>
              </template>
            </UModal>
          </div>
        </div>
        <div class="mt-2 whitespace-pre-line">{{ passage.text }}</div>
      </div>
    </div>
  </div>
</template>
