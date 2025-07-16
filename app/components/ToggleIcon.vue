<template>
  <UIcon
    :name="props.modelValue ? props.onIcon : props.offIcon"
    @click="emit('update:modelValue', !props.modelValue)"
  />
</template>

<script lang="ts" setup="setup">
interface Props {
  modelValue?: boolean;
  onIcon?: string;
  offIcon?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: true,
  onIcon: "i-lucide-eye",
  offIcon: "i-lucide-eye-off",
});

const emit = defineEmits<{
  (e: "update:modelValue", modelValue: boolean): void;
}>();
</script>
