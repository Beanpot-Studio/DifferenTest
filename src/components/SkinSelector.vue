<template>
  <div class="skin-selector p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow mb-6">
    <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Choose Your Theme</h3>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <div
        v-for="skin in availableSkins"
        :key="skin.id"
        class="skin-option border rounded-lg cursor-pointer transition-all duration-200 overflow-hidden"
        :class="{
          'ring-2 ring-offset-2 ring-[rgb(var(--cat-primary))] border-[rgb(var(--cat-primary))]': currentSkin === skin.id && currentSkin === 'cats',
          'ring-2 ring-offset-2 ring-primary-500 border-primary-500': currentSkin === skin.id && currentSkin !== 'cats',
          'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-600' : currentSkin !== skin.id
        }"
        @click="selectSkin(skin.id)"
        role="radio"
        :aria-checked="currentSkin === skin.id"
        :aria-label="skin.name"
        tabindex="0"
        @keypress.enter.space="selectSkin(skin.id)"
      >
        <img 
          :src="skin.preview || '/placeholder-preview.png'" 
          :alt="`${skin.name} preview`" 
          class="w-full h-24 sm:h-28 object-cover bg-gray-200 dark:bg-gray-700"
          @error="handleImageError"  
        />
        <div class="p-3 text-center">
          <h4 class="font-medium text-sm text-gray-900 dark:text-gray-100">{{ skin.name }}</h4>
          <!-- Optional: Add description or age range if needed -->
          <!-- <p class="text-xs text-gray-500 dark:text-gray-400">{{ skin.description }}</p> -->
          <!-- <span class="text-xs text-gray-500 dark:text-gray-400">Age: {{ skin.ageRange }}</span> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSkin } from '../composables/useSkin';

const { currentSkin, availableSkins, setSkin } = useSkin();

const selectSkin = (skinId: string) => {
  setSkin(skinId);
};

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  if (target) {
    target.src = '/placeholder-preview.png'; // Path to your placeholder
  }
};

// Placeholder image handling (if needed, create a placeholder image)
// const placeholderPreview = '/placeholder-preview.png';

</script>

<style scoped>
.skin-option:hover {
  @apply shadow-md transform scale-[1.03];
}

.skin-option img {
  /* Ensure images don't break layout */
  display: block;
}
</style> 