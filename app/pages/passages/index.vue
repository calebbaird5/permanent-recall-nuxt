<script setup lang="ts">
import { ref } from "vue";
import type { Passage } from "@/types/api";

definePageMeta({ middleware: "auth" });

const error = ref<string | null>(null);
const showForm = ref(false);
const formMode = ref<"create" | "edit">("create");
const passageToEdit = ref<Passage | null>(null);
const passageToDelete = ref<Passage | null>(null);
const showDelete = ref(false);
const deleting = ref(false);

const { data: passages } = await useFetch<Passages[]>("/api/passages");

function openCreateForm() {
  formMode.value = "create";
  passageToEdit.value = null;
}

function openEditForm(passage: Passage) {
  formMode.value = "edit";
  passageToEdit.value = passage;
  showForm.value = true;
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

function addNewPassage(passage: Passage) {
  passages.value.push(passage);
  showForm.value = false;
}

function updatePassage(updated: Passage) {
  const idx = passages.value.findIndex((p) => p.id === updated.id);
  if (idx !== -1) passages.value[idx] = updated;
  showForm.value = false;
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
        :ui="{ content: 'h-[80vh]' }"
      >
        <UButton
          label="Add Passage"
          icon="i-lucide-plus"
          @click="openCreateForm"
        />
        <template #content="{ close }">
          <UpsertPassage
            :mode="formMode"
            :passage="passageToEdit"
            @create="addNewPassage"
            @update="updatePassage"
            @cancel="close()"
          />
        </template>
      </UModal>
    </div>

    <div v-if="error" class="text-red-500 mb-4">{{ error }}</div>
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
