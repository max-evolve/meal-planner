<script setup>
import { ref, onMounted, computed } from 'vue';
import { lunchDishes, dinnerDishes } from '../dishes';

// Combine all dishes
const allDishes = [...new Set([...lunchDishes, ...dinnerDishes])];

// Compute base path for assets
const basePath = computed(() => import.meta.env.PROD ? '/meal-planner' : '');

// Function to get image URL for a dish
const getDishImage = (dish) => {
  // Special naming cases for dishes that don't follow standard mapping
  const directMappings = {
    "Soya Pulao": "/images/chili-soya-fried-rice.jpg",
    "Chicken/Veg Tacos": "/images/tacos.jpg",
    "Veg / Chicken Noodles": "/images/noodles.jpg",
    "Upma": "/images/vermicelli.jpg",
    "Palak Paneer & Rice/Roti": "/images/palak-paneer.jpg",
    "Bhindi Roti & Raita": "/images/bhindi-raita-roti.jpg",
    "Katsu Curry & Rice": "/images/katsu-curry.jpg",
    "Shakshouka": "/images/shakshouka.jpg"
  };
  
  // Check for direct mapping first
  if (directMappings[dish]) {
    return `${basePath.value}${directMappings[dish]}`;
  }
  
  // Convert dish name to kebab case for image filename
  const kebabCase = dish.toLowerCase()
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/\//g, '-')      // Replace slashes with hyphens
    .replace(/&/g, '-and-')   // Replace & with 'and'
    .replace(/[^\w-]/g, '');  // Remove special characters except hyphens
  
  // For simplicity, map specific cases that need special handling
  const specialCases = {
    'chili-soya-and-fried-rice': 'chili-soya-fried-rice',
    'peri-peri-chicken--paneer-rice-bowl': 'peri-peri-chicken-rice-bowl',
    'mushroom--white-sauce-pasta': 'mushroom-white-sauce-pasta',
    'aloo-gobhi-and-roti-and-raita': 'aloo-gobhi-roti-raita',
    'rajma-and-rice': 'rajma-rice',
    'chicken-curry-and-roti': 'chicken-curry-roti',
    'egg-curry-and-roti': 'egg-curry-roti',
    'bhindi-raita-and-roti': 'bhindi-raita-roti',
    'paneer-bhurji-and-roti': 'paneer-bhurji-roti',
    'chole-and-rice': 'chole-rice',
    'chickenveg-tacos': 'tacos',
    'veg--chicken-noodles': 'noodles',
    'katsu-curry-and-rice': 'katsu-curry',
    'palak-paneer-and-riceroti': 'palak-paneer',
    'bhindi-roti-and-raita': 'bhindi-raita-roti',
    'gobhi-aloo-raita': 'gobhi-aloo-raita'
  };
  
  const imageName = specialCases[kebabCase] || kebabCase;
  
  return `${basePath.value}/images/${imageName}.jpg`;
};

// Track image loading status
const imageStatus = ref({});

// Check if image exists
const checkImage = (dish) => {
  const img = new Image();
  const src = getDishImage(dish);
  
  img.onload = () => {
    imageStatus.value[dish] = { status: 'success', src };
  };
  
  img.onerror = () => {
    imageStatus.value[dish] = { status: 'error', src };
  };
  
  img.src = src;
};

// Check all images on mount
onMounted(() => {
  allDishes.forEach(dish => {
    checkImage(dish);
  });
});
</script>

<template>
  <div class="debug-container">
    <h1>Image Debug Page</h1>
    <div class="status-summary">
      <p>Total dishes: {{ allDishes.length }}</p>
      <p>Loaded successfully: {{ Object.values(imageStatus).filter(s => s.status === 'success').length }}</p>
      <p>Failed to load: {{ Object.values(imageStatus).filter(s => s.status === 'error').length }}</p>
    </div>
    
    <div class="image-grid">
      <div v-for="dish in allDishes" :key="dish" class="image-item" :class="{ 'image-error': imageStatus[dish]?.status === 'error' }">
        <h3>{{ dish }}</h3>
        <div class="image-container">
          <img v-if="imageStatus[dish]" :src="imageStatus[dish].src" :alt="dish" :class="{ 'error': imageStatus[dish].status === 'error' }">
          <div v-else class="loading">Loading...</div>
        </div>
        <p v-if="imageStatus[dish]" class="path">{{ imageStatus[dish].src }}</p>
        <p v-if="imageStatus[dish]?.status === 'error'" class="error-message">Failed to load</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.debug-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

.status-summary {
  background-color: #f0f0f0;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.image-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  background-color: white;
}

.image-error {
  background-color: #ffeeee;
  border-color: #ffaaaa;
}

.image-container {
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0;
}

img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}

img.error {
  opacity: 0.3;
}

.loading {
  color: #888;
}

.path {
  font-size: 12px;
  color: #555;
  word-break: break-all;
}

.error-message {
  color: red;
  font-weight: bold;
}
</style> 