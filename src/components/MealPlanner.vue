<script setup>
import { ref, computed } from 'vue';
import { lunchDishes, dinnerDishes, lightDishes, dinnerOnlyDishes } from '../dishes';

// Changed data structure to organize by day name
const mealPlan = ref({
  Monday: { lunch: null, dinner: null },
  Tuesday: { lunch: null, dinner: null },
  Wednesday: { lunch: null, dinner: null },
  Thursday: { lunch: null, dinner: null },
  Friday: { lunch: null, dinner: null },
  Saturday: { lunch: null, dinner: null },
  Sunday: { lunch: null, dinner: null }
});

// Add new refs for the dish selection modal
const showModal = ref(false);
const modalOptions = ref([]);
const currentSelection = ref({ day: null, mealType: null });

// Compute base path for assets
const basePath = computed(() => import.meta.env.PROD ? '/meal-planner' : '');

// Create path for eating out image
const eatingOutImagePath = computed(() => `${basePath.value}/images/fat_couple.jpg`);

const daysOfWeek = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

// Function to get the dates for each day of the week
const getWeekDates = () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday, etc.
  
  // Calculate the Monday of this week
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  
  // Generate all dates for the week
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }
  
  return dates;
};

// Store the current week's dates
const weekDates = ref(getWeekDates());

// Function to get image URL for a dish
// Images are now stored locally in the public/images folder
// To replace an image, simply add a new image file to that folder
// with the kebab-case name of the dish (e.g., "couscous-chana-salad.jpg")
const getDishImage = (dish) => {
  if (!dish || dish === "No more lunch options" || dish === "No more dinner options") {
    return `${basePath.value}/images/default.jpg`;
  }
  
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
    console.log(`Using direct mapping for ${dish}: ${directMappings[dish]}`);
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
  console.log(`Mapped ${dish} (${kebabCase}) to ${imageName}.jpg`);
  
  return `${basePath.value}/images/${imageName}.jpg`;
};

// Function to get available dishes for a specific meal type
const getAvailableDishes = (mealType, day) => {
  const usedDishes = new Set();
  
  // Add all current dishes to the usedDishes set except the one being replaced
  daysOfWeek.forEach(currentDay => {
    if (currentDay !== day || mealType !== 'lunch') {
      if (mealPlan.value[currentDay].lunch && mealPlan.value[currentDay].lunch !== "No more lunch options" && mealPlan.value[currentDay].lunch !== "Eating Out") {
        usedDishes.add(mealPlan.value[currentDay].lunch);
      }
    }
    if (currentDay !== day || mealType !== 'dinner') {
      if (mealPlan.value[currentDay].dinner && mealPlan.value[currentDay].dinner !== "No more dinner options" && mealPlan.value[currentDay].dinner !== "Eating Out") {
        usedDishes.add(mealPlan.value[currentDay].dinner);
      }
    }
  });

  // Return available dishes based on meal type
  if (mealType === 'lunch') {
    return lunchDishes.filter(dish => !usedDishes.has(dish));
  } else {
    return dinnerDishes.filter(dish => !usedDishes.has(dish));
  }
};

// Modified replaceDish function to support 3 options
const openDishOptions = (mealType, day) => {
  currentSelection.value = { day, mealType };
  
  // Get available dishes
  const availableDishes = getAvailableDishes(mealType, day);
  
  // Add the three options
  modalOptions.value = availableDishes;
  
  // Show the modal
  showModal.value = true;
};

// Function to select a dish option
const selectOption = (option) => {
  const { day, mealType } = currentSelection.value;
  
  if (option === 'random') {
    // Choose randomly
    const availableDishes = getAvailableDishes(mealType, day);
    if (availableDishes.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableDishes.length);
      mealPlan.value[day][mealType] = availableDishes[randomIndex];
    } else {
      mealPlan.value[day][mealType] = `No more ${mealType} options`;
    }
  } 
  else if (option === 'eating-out') {
    // Set as Eating Out
    mealPlan.value[day][mealType] = "Eating Out";
  }
  else {
    // User selected a specific dish
    mealPlan.value[day][mealType] = option;
  }
  
  // Close the modal
  showModal.value = false;
};

// Original functions with minor modifications
const getRandomDish = (dishes, usedDishes) => {
  const availableDishes = dishes.filter(dish => !usedDishes.has(dish));
  if (availableDishes.length === 0) return null; // No available dishes
  const randomIndex = Math.floor(Math.random() * availableDishes.length);
  return availableDishes[randomIndex];
};

const generateMealPlan = () => {
  const usedDishes = new Set();
  
  // Update the week dates when generating a new meal plan
  weekDates.value = getWeekDates();
  
  // Generate a meal plan for each day of the week
  daysOfWeek.forEach(day => {
    // For lunch, we can only use light dishes
    const lunch = getRandomDish(lunchDishes, usedDishes);
    if (lunch) usedDishes.add(lunch);
    
    // For dinner, we can use any dinner dish (light or dinner-only)
    const dinner = getRandomDish(dinnerDishes, usedDishes);
    if (dinner) usedDishes.add(dinner);

    mealPlan.value[day] = {
      lunch: lunch || "No more lunch options",
      dinner: dinner || "No more dinner options"
    };
  });
};

// Original replaceDish function is now only used by the random option selector

// Initialize with empty plan
const hasMeals = ref(false);

// New function to check if we have meals planned
const checkForMeals = () => {
  hasMeals.value = daysOfWeek.some(day => 
    mealPlan.value[day].lunch !== null || mealPlan.value[day].dinner !== null
  );
};
</script>

<template>
  <div class="meal-planner">
    <h1>Weekly Meal Planner</h1>
    <button @click="generateMealPlan(); hasMeals = true;" class="generate-btn">
      Generate Meal Plan
    </button>
    
    <div v-if="hasMeals" class="weekly-calendar">
      <!-- Calendar Header Row -->
      <div class="calendar-header">
        <div class="corner-cell"></div>
        <div class="day-header" v-for="(day, index) in daysOfWeek" :key="day">
          <div class="day-name">{{ day }}</div>
          <div class="day-date">{{ weekDates[index] }}</div>
        </div>
      </div>
      
      <!-- Lunch Row -->
      <div class="meal-row">
        <div class="meal-type">Lunch</div>
        <div 
          v-for="day in daysOfWeek" 
          :key="`lunch-${day}`" 
          class="meal-cell" 
          @click="openDishOptions('lunch', day)"
        >
          <div class="meal-content" v-if="mealPlan[day].lunch">
            <img 
              :src="mealPlan[day].lunch === 'Eating Out' ? eatingOutImagePath : getDishImage(mealPlan[day].lunch)" 
              :alt="mealPlan[day].lunch" 
              class="dish-image"
              :class="{'eating-out': mealPlan[day].lunch === 'Eating Out'}"
            >
            <div class="dish-name">{{ mealPlan[day].lunch }}</div>
          </div>
          <div class="empty-meal" v-else>Click to add</div>
        </div>
      </div>
      
      <!-- Dinner Row -->
      <div class="meal-row">
        <div class="meal-type">Dinner</div>
        <div 
          v-for="day in daysOfWeek" 
          :key="`dinner-${day}`" 
          class="meal-cell" 
          @click="openDishOptions('dinner', day)"
        >
          <div class="meal-content" v-if="mealPlan[day].dinner">
            <img 
              :src="mealPlan[day].dinner === 'Eating Out' ? eatingOutImagePath : getDishImage(mealPlan[day].dinner)" 
              :alt="mealPlan[day].dinner" 
              class="dish-image"
              :class="{'eating-out': mealPlan[day].dinner === 'Eating Out'}"
            >
            <div class="dish-name">{{ mealPlan[day].dinner }}</div>
          </div>
          <div class="empty-meal" v-else>Click to add</div>
        </div>
      </div>
      
      <div class="info-text">
        <p><small>Click on any meal to replace it with another option</small></p>
      </div>
    </div>
    
    <!-- Dish Selection Modal -->
    <div v-if="showModal" class="modal-overlay" @click="showModal = false">
      <div class="modal-content" @click.stop>
        <h2>Select an option for {{ currentSelection.mealType === 'lunch' ? 'Lunch' : 'Dinner' }}</h2>
        
        <div class="option-buttons">
          <button @click="selectOption('random')" class="option-btn random-btn">
            🎲 Choose Randomly
          </button>
          <button @click="selectOption('eating-out')" class="option-btn eating-out-btn">
            🍽️ Eating Out
          </button>
        </div>
        
        <div class="dish-list">
          <h3>Or select a specific dish:</h3>
          <div class="dish-grid">
            <div 
              v-for="dish in modalOptions" 
              :key="dish" 
              class="dish-option"
              @click="selectOption(dish)"
            >
              <img :src="getDishImage(dish)" :alt="dish" class="option-image">
              <div class="option-name">{{ dish }}</div>
            </div>
          </div>
        </div>
        
        <button class="close-btn" @click="showModal = false">Cancel</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
:root {
  --primary-color: #1877f2;
  --hover-color: #36a372;
  --background-color: #ffffff;
  --text-color: #333333;
  --border-color: #e0e0e0;
  --header-bg: #f0f2f5;
  --even-row-bg: #f9f9f9;
  --hover-row-bg: #e9ecef;
  --hover-cell-bg: #e0e0e0;
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--background-color);
  color: var(--text-color);
  font-family: 'Arial', sans-serif;
}

.meal-planner {
  width: 100%;
  max-width: 100%;
  padding: 1rem;
  box-sizing: border-box;
}

h1 {
  color: var(--primary-color);
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
}

.generate-btn {
  display: block;
  margin: 0 auto 1.5rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  font-size: 1rem;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.generate-btn:hover {
  background-color: var(--hover-color);
  transform: translateY(-2px);
}

.generate-btn:active {
  transform: translateY(0);
}

/* Calendar-style Weekly View Styles */
.weekly-calendar {
  width: 100%;
  margin-top: 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.calendar-header {
  display: grid;
  grid-template-columns: 100px repeat(7, 1fr);
  background-color: var(--header-bg);
}

.corner-cell {
  border-right: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}

.day-header {
  padding: 0.75rem;
  text-align: center;
  border-right: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  min-height: 60px;
  position: relative;
}

.day-name {
  font-weight: 600;
}

.day-date {
  font-size: 0.8rem;
  color: #666;
}

.meal-row {
  display: grid;
  grid-template-columns: 100px repeat(7, 1fr);
}

.meal-type {
  padding: 0.75rem;
  background-color: var(--header-bg);
  font-weight: 600;
  border-right: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.meal-cell {
  padding: 0.75rem;
  min-height: 140px;
  border-right: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  overflow: auto;
  flex-direction: column;
  gap: 0.5rem;
}

.meal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.dish-image {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 35px;
  margin-bottom: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.meal-cell:hover .dish-image {
  transform: scale(1.05);
}

.dish-name {
  font-size: 0.85rem;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.empty-meal {
  color: #888;
  font-size: 0.9rem;
  font-style: italic;
}

.meal-cell:hover {
  background-color: var(--hover-cell-bg);
}

.meal-cell:active::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.05);
  pointer-events: none;
}

.info-text {
  text-align: center;
  color: #666;
  margin: 0.75rem 0;
  padding: 0 0.75rem;
}

/* Media Queries for Responsive Design */
@media (max-width: 768px) {
  .meal-planner {
    padding: 0.75rem;
  }
  
  h1 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .generate-btn {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
  
  .calendar-header, .meal-row {
    grid-template-columns: 80px repeat(7, 1fr);
  }
  
  .day-header, .meal-type, .meal-cell {
    padding: 0.5rem;
    font-size: 0.9rem;
  }
  
  .meal-cell {
    min-height: 120px;
  }
  
  .dish-image {
    width: 60px;
    height: 60px;
    border-radius: 30px;
  }
}

@media (max-width: 480px) {
  .weekly-calendar {
    overflow-x: auto;
  }
  
  .calendar-header, .meal-row {
    grid-template-columns: 60px repeat(7, 100px);
    min-width: 760px; /* Ensure grid doesn't shrink too much */
  }
  
  h1 {
    font-size: 1.3rem;
  }
  
  .generate-btn {
    width: 100%;
    padding: 0.5rem;
  }
  
  .day-header, .meal-type, .meal-cell {
    padding: 0.5rem;
    font-size: 0.8rem;
  }
  
  .meal-cell {
    min-height: 100px;
  }
  
  .dish-image {
    width: 50px;
    height: 50px;
    border-radius: 25px;
  }
  
  .dish-name {
    font-size: 0.75rem;
    -webkit-line-clamp: 2;
  }
}

/* New modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 20px;
}

.modal-content h2 {
  text-align: center;
  color: var(--primary-color);
  margin-top: 0;
  margin-bottom: 20px;
}

.option-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.option-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  min-width: 150px;
}

.random-btn {
  background-color: #4CAF50;
  color: white;
}

.random-btn:hover {
  background-color: #3e8e41;
}

.eating-out-btn {
  background-color: #ff9800;
  color: white;
}

.eating-out-btn:hover {
  background-color: #e68a00;
}

.dish-list {
  margin-top: 20px;
}

.dish-list h3 {
  text-align: center;
  margin-bottom: 15px;
  color: #555;
}

.dish-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
}

.dish-option {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dish-option:hover {
  background-color: #f5f5f5;
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.option-image {
  width: 80px;
  height: 80px;
  border-radius: 40px;
  object-fit: cover;
  margin-bottom: 10px;
}

.option-name {
  text-align: center;
  font-size: 0.9rem;
}

.close-btn {
  display: block;
  margin: 20px auto 0;
  padding: 8px 15px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.close-btn:hover {
  background-color: #d32f2f;
}

.eating-out {
  opacity: 0.6;
  filter: grayscale(80%);
}

/* Media queries for the modal */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    padding: 15px;
  }
  
  .dish-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
  }
  
  .option-image {
    width: 70px;
    height: 70px;
  }
}

@media (max-width: 480px) {
  .option-buttons {
    flex-direction: column;
  }
  
  .dish-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
  
  .option-image {
    width: 60px;
    height: 60px;
  }
  
  .option-name {
    font-size: 0.8rem;
  }
}
</style>