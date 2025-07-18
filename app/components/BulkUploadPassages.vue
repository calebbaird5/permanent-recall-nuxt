<script setup lang="ts">
import { ref, computed } from "vue";
import { z } from "zod";
import type { Passage } from "@/types/api";
import type { TabsItem } from "@nuxt/ui";

const emit = defineEmits(["success"]);

const input = ref("");
const error = ref<string | null>(null);
const loading = ref(false);
const preview = ref<any[]>([]);
const uploaded = ref<Passage[] | null>(null);
const inputMode = ref<'manual' | 'file'>('manual');
const fileInput = ref<HTMLInputElement | null>(null);

const inputTabs = ref<TabsItem[]>([
  {
    label: "Manual Entry",
    slot: "manual" as const,
    icon: "i-lucide-edit-3",
  },
  {
    label: "Upload File",
    slot: "file" as const,
    icon: "i-lucide-upload",
  },
]);

const passageSchema = z.object({
  prompt: z.string().min(1),
  reference: z.string().min(1),
  text: z.string().min(1),
});

function parseInput(text: string) {
  // Try JSON first
  try {
    const json = JSON.parse(text);
    if (Array.isArray(json) && json.every(obj => obj && typeof obj === 'object' && 'prompt' in obj && 'reference' in obj && 'text' in obj)) {
      return json.map(obj => ({
        prompt: String(obj.prompt),
        reference: String(obj.reference),
        text: String(obj.text),
      }));
    }
  } catch (e) {
    // Not JSON, fall through to CSV/TSV
  }
  // Try to parse as CSV/TSV or multi-line (Prompt, Reference, Text per line)
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const parsed: { prompt: string; reference: string; text: string }[] = [];
  for (const line of lines) {
    // Try CSV, then TSV, then pipe, then triple-colon
    let parts = line.split(",");
    if (parts.length < 3) parts = line.split("\t");
    if (parts.length < 3) parts = line.split("|");
    if (parts.length < 3) parts = line.split(":::");
    if (parts.length < 3) continue;
    parsed.push({
      prompt: parts[0]?.trim() || "",
      reference: parts[1]?.trim() || "",
      text: parts.slice(2).join(" ").trim(),
    });
  }
  return parsed;
}

function previewPassages() {
  error.value = null;
  preview.value = [];
  if (!input.value.trim()) return;
  const parsed = parseInput(input.value);
  if (!parsed.length) {
    error.value =
      "Could not parse any passages. Use CSV, TSV, or 'Prompt,Reference,Text' per line.";
    return;
  }
  // Validate
  const valid = parsed.filter((p) => {
    try {
      passageSchema.parse(p);
      return true;
    } catch {
      return false;
    }
  });
  if (!valid.length) {
    error.value = "No valid passages found.";
    return;
  }
  preview.value = valid;
}

async function upload() {
  error.value = null;
  loading.value = true;
  uploaded.value = null;
  try {
    const parsed = preview.value;
    if (!parsed.length) {
      error.value = "Nothing to upload.";
      return;
    }
    const res = await $fetch("/api/passages/bulk", {
      method: "POST",
      body: parsed,
    });
    uploaded.value = res;
    emit("success");
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || "Upload failed.";
  } finally {
    loading.value = false;
  }
}

function onFileChange(e: Event) {
  error.value = null;
  const target = e.target as HTMLInputElement;
  const file = target.files && target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    const text = event.target?.result as string;
    input.value = text;
    previewPassages();
  };
  reader.onerror = () => {
    error.value = 'Failed to read file.';
  };
  reader.readAsText(file);
}
</script>

<template>
  <div class="h-full p-4 flex flex-col gap-4 overflow-y-scroll">
    <div v-if="uploaded">
      <div class="text-green-600 font-bold mb-2">
        Successfully uploaded {{ uploaded.length }} passages!
      </div>
      <UButton color="primary" @click="$emit('success')">Close</UButton>
    </div>
    <template v-else>
      <UTabs :items="inputTabs" v-model="inputMode" :ui="{ trigger: 'grow' }" class="gap-4 w-full mb-2" variant="link">
        <template #manual>
          <UFormField label="Paste passages (CSV, TSV, or Prompt,Reference,Text per line):" name="bulk-uploader"
            class="flex-1 flex flex-col" :ui="{ container: 'flex-1 w-full' }">
            <UTextarea ref="textareaRef" v-model="input" :ui="{ base: 'h-full' }" placeholder="Prompt,Reference,Text"
              class="w-full h-full" />
          </UFormField>
        </template>
        <template #file>
          <div class="flex flex-col gap-2">
            <label for="file-upload" class="font-medium">Upload .json or .csv file:</label>
            <input ref="fileInput" id="file-upload" type="file" accept=".json,.csv,text/csv,application/json"
              @change="onFileChange" class="mb-2" />
            <div v-if="input" class="text-xs text-gray-500">File loaded: {{ fileInput?.files?.[0]?.name }}</div>
          </div>
        </template>
      </UTabs>
      <UButton color="primary" @click="previewPassages" class="mb-2">Preview</UButton>
      <div v-if="error" class="text-red-500 mb-2">{{ error }}</div>
      <div v-if="preview.length">
        <div class="font-semibold mb-1">
          Preview ({{ preview.length }} passages):
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm border">
            <thead>
              <tr>
                <th class="border px-2 py-1">Prompt</th>
                <th class="border px-2 py-1">Reference</th>
                <th class="border px-2 py-1">Text</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(p, i) in preview" :key="i">
                <td class="border px-2 py-1">{{ p.prompt }}</td>
                <td class="border px-2 py-1">{{ p.reference }}</td>
                <td class="border px-2 py-1">{{ p.text }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <UButton color="primary" :loading="loading" class="mt-2" @click="upload">Upload</UButton>
      </div>
    </template>
  </div>
</template>
