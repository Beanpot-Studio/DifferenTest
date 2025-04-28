<template>
  <div class="counter">
    <h2>Count: {{ count }}</h2>
    <button @click="increment">Increment</button>
    <button @click="decrement">Decrement</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)

const increment = () => {
  count.value++
}

const decrement = () => {
  count.value--
}
</script>

<style scoped>
.counter {
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