<script setup>
import { ref } from 'vue';
import MealPlanner from './components/MealPlanner.vue';
import DebugImages from './components/DebugImages.vue';

const showDebug = ref(false);

const toggleDebug = () => {
  showDebug.value = !showDebug.value;
};
</script>

<template>
  <div class="app-container">
    <div class="debug-toggle">
      <button @click="toggleDebug">{{ showDebug ? 'Show Meal Planner' : 'Debug Images' }}</button>
    </div>
    
    <MealPlanner v-if="!showDebug" />
    <DebugImages v-else />
  </div>
</template>

<style>
.app-container {
  position: relative;
}

.debug-toggle {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 100;
}

.debug-toggle button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.debug-toggle button:hover {
  background-color: #45a049;
}
</style> 