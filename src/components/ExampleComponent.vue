<template>
  <div class="example">
    <h1>{{ title }}</h1>
    <button @click="$emit('click')">Click me</button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()

defineEmits<{
  (e: 'click'): void
}>()
</script>

<style scoped>
.example {
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  max-width: 200px;
  margin: 1rem;
}

button {
  margin: 0.5rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
}
</style> 