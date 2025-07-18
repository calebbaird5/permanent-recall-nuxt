<script setup lang="ts">
const { loggedIn } = useUserSession();

const features = [
  {
    icon: 'i-lucide-notebook-text',
    title: 'Add & Organize Passages',
    description: 'Store anything you want to memorize, with prompts, references, and full text.'
  },
  {
    icon: 'i-lucide-check-square',
    title: 'Spaced Repetition Reviews',
    description: 'Review passages daily, weekly, monthly, or yearly—just when you need it for maximum retention.'
  },
  {
    icon: 'i-lucide-flame',
    title: 'Test & Track Your Recall',
    description: 'Type out your answers, get instant feedback, and see your progress as you master each passage.'
  }
];
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-8 h-screen">
    <div class="text-center space-y-4">
      <h1 class="font-bold text-4xl md:text-5xl drop-shadow-sm text-primary">Permanent Recall</h1>
      <p class="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">
        Master memorization with your own personal spaced repetition system. Add passages—quotes, scripture, poetry, or
        anything you want to remember—and review them on a scientifically proven schedule. Test your recall, get instant
        feedback, and track your progress over time.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
      <UCard v-for="feature in features" :key="feature.title" class="shadow-lg" :ui="{ body: 'bg-elevated' }">
        <template #default>
          <div class="flex flex-col items-center">
            <span :class="feature.icon + ' text-3xl mb-2'" />
            <h2 class="font-semibold text-lg mb-1">{{ feature.title }}</h2>
            <p class="text-gray-600 text-sm text-center">{{ feature.description }}</p>
          </div>
        </template>
      </UCard>
    </div>

    <div v-if="!loggedIn" class="flex flex-col items-center gap-4 mt-6">
      <div class="flex gap-4">
        <UButton label="Login" icon="i-lucide-log-in" to="/login" size="lg" />
        <UButton label="Register" icon="i-lucide-user-plus" to="/register" size="lg" variant="outline" />
      </div>
      <p class="text-gray-500 text-sm">Get started for free—your memory will thank you!</p>
    </div>
  </div>
</template>
