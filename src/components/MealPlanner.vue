<script setup>
import { ref, computed } from 'vue';
import { lunchDishes, dinnerDishes, lightDishes, dinnerOnlyDishes } from '../dishes';

// Dynamic meal plan structure based on actual days
const mealPlan = ref({});

// Add new refs for the dish selection modal
const showModal = ref(false);
const modalOptions = ref([]);
const currentSelection = ref({ day: null, mealType: null });
const searchQuery = ref('');
const allDishes = ref([]);
const usedDishes = ref(new Set());
const clickTimeout = ref(null);

// Reactive arrays for dishes (so we can add new ones)
const lightDishesReactive = ref([...lightDishes]);
const dinnerOnlyDishesReactive = ref([...dinnerOnlyDishes]);

// Helper function to convert text to Title Case
const toTitleCase = (str) => {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

// Compute base path for assets
const basePath = computed(() => import.meta.env.PROD ? '/meal-planner' : '');

// Removed eating out image path (no longer needed)

// Add selected start date ref
const selectedStartDate = ref(new Date());

// Function to generate date options (today + next 6 days)
const getDateOptions = () => {
  const options = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    const fullDateStr = `${dayName}, ${dateStr}`;
    
    options.push({
      date: new Date(date),
      display: fullDateStr,
      value: date.toISOString().split('T')[0] // YYYY-MM-DD format for value
    });
  }
  
  return options;
};

// Store date options
const dateOptions = ref(getDateOptions());

// Function to get the week data (day names and dates) starting from selected date
const getWeekData = (startDate = selectedStartDate.value) => {
  const weekData = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    weekData.push({
      dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
      dateStr: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dateKey: date.toLocaleDateString('en-US', { weekday: 'long' }) // Use actual day name as key
    });
  }
  
  return weekData;
};

// Store the current week's data
const weekData = ref(getWeekData());

// Computed property for filtered dishes based on search
const filteredDishes = computed(() => {
  if (!searchQuery.value) {
    return allDishes.value;
  }
  const filtered = allDishes.value.filter(dish => 
    dish.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
  
  // If no matches found and there's a search query, show "Add new" option
  if (filtered.length === 0 && searchQuery.value.trim()) {
    return [`Add "${toTitleCase(searchQuery.value.trim())}" To List`];
  }
  
  return filtered;
});

// Computed property to detect duplicate dishes and assign colors
const duplicateColors = computed(() => {
  const dishCounts = {};
  const colorMap = {};
  const colors = [
    '#ffcdd2', '#f8bbd9', '#e1bee7', '#d1c4e9', '#c5cae9',
    '#bbdefb', '#b3e5fc', '#b2ebf2', '#b2dfdb', '#c8e6c8',
    '#dcedc8', '#f0f4c3', '#fff9c4', '#ffecb3', '#ffe0b2'
  ];
  let colorIndex = 0;
  
  // Count occurrences of each dish
  weekData.value.forEach(dayData => {
    const dayName = dayData.dayName;
    const lunch = mealPlan.value[dayName]?.lunch;
    const dinner = mealPlan.value[dayName]?.dinner;
    
    if (lunch && lunch !== "Eating Out") {
      dishCounts[lunch] = (dishCounts[lunch] || 0) + 1;
    }
    if (dinner && dinner !== "Eating Out") {
      dishCounts[dinner] = (dishCounts[dinner] || 0) + 1;
    }
  });
  
  // Assign colors to dishes that appear more than once
  Object.keys(dishCounts).forEach(dish => {
    if (dishCounts[dish] > 1) {
      colorMap[dish] = colors[colorIndex % colors.length];
      colorIndex++;
    }
  });
  
  return colorMap;
});

// Removed getDishImage function (no longer using images)

// Function to get available dishes for a specific meal type
const getAvailableDishes = (mealType, day) => {
  const usedDishes = new Set();
  
  // Add all current dishes to the usedDishes set except the one being replaced
  weekData.value.forEach(dayData => {
    const currentDay = dayData.dayName;
    if (currentDay !== day || mealType !== 'lunch') {
      if (mealPlan.value[currentDay]?.lunch && mealPlan.value[currentDay].lunch !== "No more lunch options" && mealPlan.value[currentDay].lunch !== "Eating Out") {
        usedDishes.add(mealPlan.value[currentDay].lunch);
      }
    }
    if (currentDay !== day || mealType !== 'dinner') {
      if (mealPlan.value[currentDay]?.dinner && mealPlan.value[currentDay].dinner !== "No more dinner options" && mealPlan.value[currentDay].dinner !== "Eating Out") {
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
  
  // Get ALL dishes regardless of lunch/dinner categorization (using reactive arrays)
  const allPossibleDishes = [...lightDishesReactive.value, ...dinnerOnlyDishesReactive.value];
  
  // Get currently used dishes (excluding the one being replaced)
  const currentlyUsed = new Set();
  weekData.value.forEach(dayData => {
    const currentDay = dayData.dayName;
    if (currentDay !== day || mealType !== 'lunch') {
      if (mealPlan.value[currentDay]?.lunch && mealPlan.value[currentDay].lunch !== "No more lunch options" && mealPlan.value[currentDay].lunch !== "Eating Out") {
        currentlyUsed.add(mealPlan.value[currentDay].lunch);
      }
    }
    if (currentDay !== day || mealType !== 'dinner') {
      if (mealPlan.value[currentDay]?.dinner && mealPlan.value[currentDay].dinner !== "No more dinner options" && mealPlan.value[currentDay].dinner !== "Eating Out") {
        currentlyUsed.add(mealPlan.value[currentDay].dinner);
      }
    }
  });
  
  // Store all dishes and used dishes for the modal
  allDishes.value = allPossibleDishes.sort((a, b) => a.localeCompare(b));
  usedDishes.value = currentlyUsed;
  
  // Clear search query
  searchQuery.value = '';
  
  // Show the modal
  showModal.value = true;
};

// Function to select a dish option
const selectOption = (option) => {
  const { day, mealType } = currentSelection.value;
  
  if (option === 'eating-out') {
    // Set as Eating Out
    mealPlan.value[day][mealType] = "Eating Out";
  }
  else if (option.startsWith('Add "') && option.endsWith('" To List')) {
    // Extract the new dish name from the option
    const newDishName = option.slice(5, -9); // Remove 'Add "' and '" To List'
    
    // Add to light dishes (making it available for both lunch and dinner)
    lightDishesReactive.value.push(newDishName);
    
    // Set the meal to the new dish
    mealPlan.value[day][mealType] = newDishName;
  }
  else {
    // User selected a specific dish (allow even if already used)
    mealPlan.value[day][mealType] = option;
  }
  
  // Close the modal
  showModal.value = false;
};

// Function to handle single click with delay (to allow double-click)
const handleSingleClick = (mealType, day) => {
  // Clear any existing timeout
  if (clickTimeout.value) {
    clearTimeout(clickTimeout.value);
  }
  
  // Set a timeout to open modal after delay
  clickTimeout.value = setTimeout(() => {
    openDishOptions(mealType, day);
  }, 300); // 300ms delay to allow for double-click
};

// Function to handle double-click for random dish selection
const handleDoubleClick = (mealType, day) => {
  // Clear the single-click timeout to prevent modal from opening
  if (clickTimeout.value) {
    clearTimeout(clickTimeout.value);
    clickTimeout.value = null;
  }
  // Get all possible dishes
  const allPossibleDishes = [...lightDishesReactive.value, ...dinnerOnlyDishesReactive.value];
  
  // Get currently used dishes (excluding the one being replaced)
  const currentlyUsed = new Set();
  weekData.value.forEach(dayData => {
    const currentDay = dayData.dayName;
    if (currentDay !== day || mealType !== 'lunch') {
      if (mealPlan.value[currentDay]?.lunch && mealPlan.value[currentDay].lunch !== "No more lunch options" && mealPlan.value[currentDay].lunch !== "Eating Out") {
        currentlyUsed.add(mealPlan.value[currentDay].lunch);
      }
    }
    if (currentDay !== day || mealType !== 'dinner') {
      if (mealPlan.value[currentDay]?.dinner && mealPlan.value[currentDay].dinner !== "No more dinner options" && mealPlan.value[currentDay].dinner !== "Eating Out") {
        currentlyUsed.add(mealPlan.value[currentDay].dinner);
      }
    }
  });
  
  // Filter available dishes (exclude already used ones)
  const availableDishes = allPossibleDishes.filter(dish => !currentlyUsed.has(dish));
  
  // Select random dish
  if (availableDishes.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableDishes.length);
    const randomDish = availableDishes[randomIndex];
    mealPlan.value[day][mealType] = randomDish;
  } else {
    // If no available dishes, use any dish
    if (allPossibleDishes.length > 0) {
      const randomIndex = Math.floor(Math.random() * allPossibleDishes.length);
      const randomDish = allPossibleDishes[randomIndex];
      mealPlan.value[day][mealType] = randomDish;
    }
  }
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
  
  // Update the week data when generating a new meal plan using selected start date
  weekData.value = getWeekData(selectedStartDate.value);
  
  // Clear existing meal plan
  mealPlan.value = {};
  
  // Generate a meal plan for each day of the week
  weekData.value.forEach(dayData => {
    const dayName = dayData.dayName;
    
    // For lunch, we can only use light dishes
    const lunch = getRandomDish(lunchDishes, usedDishes);
    if (lunch) usedDishes.add(lunch);
    
    // For dinner, we can use any dinner dish (light or dinner-only)
    const dinner = getRandomDish(dinnerDishes, usedDishes);
    if (dinner) usedDishes.add(dinner);

    mealPlan.value[dayName] = {
      lunch: lunch || "No more lunch options",
      dinner: dinner || "No more dinner options"
    };
  });
};

// Function to handle date selection change
const onDateChange = (event) => {
  const selectedValue = event.target.value;
  const selectedOption = dateOptions.value.find(option => option.value === selectedValue);
  if (selectedOption) {
    selectedStartDate.value = selectedOption.date;
    // Update week data immediately when date changes
    weekData.value = getWeekData(selectedStartDate.value);
  }
};

// Original replaceDish function is now only used by the random option selector

// Initialize with empty plan
const hasMeals = ref(false);

// New function to check if we have meals planned
const checkForMeals = () => {
  hasMeals.value = weekData.value.some(dayData => 
    mealPlan.value[dayData.dayName]?.lunch !== null || mealPlan.value[dayData.dayName]?.dinner !== null
  );
};
</script>

<template>
  <div class="meal-planner">
    <h1>Weekly Meal Planner</h1>
    
    <div class="controls-section">
      <div class="date-selector">
        <label for="start-date">Start Date:</label>
        <select 
          id="start-date" 
          :value="selectedStartDate.toISOString().split('T')[0]" 
          @change="onDateChange"
          class="date-select"
        >
          <option 
            v-for="option in dateOptions" 
            :key="option.value" 
            :value="option.value"
          >
            {{ option.display }}
          </option>
        </select>
      </div>
      
      <button @click="generateMealPlan(); hasMeals = true;" class="generate-btn">
        Generate Meal Plan
      </button>
    </div>
    
    <div v-if="hasMeals" class="weekly-calendar">
      <!-- Calendar Header Row - Now shows meal types -->
      <div class="calendar-header">
        <div class="corner-cell"></div>
        <div class="meal-header">
          <div class="meal-name">Lunch</div>
        </div>
        <div class="meal-header">
          <div class="meal-name">Dinner</div>
        </div>
      </div>
      
      <!-- Day Rows - Each day gets its own row -->
      <div 
        v-for="dayData in weekData" 
        :key="dayData.dayName"
        class="day-row"
      >
        <!-- Day Header -->
        <div class="day-header-cell">
          <div class="day-name">{{ dayData.dayName }}</div>
          <div class="day-date">{{ dayData.dateStr }}</div>
        </div>
        
        <!-- Lunch Cell -->
        <div 
          class="meal-cell" 
          @click="handleSingleClick('lunch', dayData.dayName)"
          @dblclick="handleDoubleClick('lunch', dayData.dayName)"
          :style="mealPlan[dayData.dayName]?.lunch && duplicateColors[mealPlan[dayData.dayName].lunch] ? 
            { backgroundColor: duplicateColors[mealPlan[dayData.dayName].lunch] } : {}"
        >
          <div class="meal-content" v-if="mealPlan[dayData.dayName]?.lunch">
            <div class="dish-name">{{ mealPlan[dayData.dayName].lunch }}</div>
          </div>
          <div class="empty-meal" v-else>Click to add</div>
        </div>
        
        <!-- Dinner Cell -->
        <div 
          class="meal-cell" 
          @click="handleSingleClick('dinner', dayData.dayName)"
          @dblclick="handleDoubleClick('dinner', dayData.dayName)"
          :style="mealPlan[dayData.dayName]?.dinner && duplicateColors[mealPlan[dayData.dayName].dinner] ? 
            { backgroundColor: duplicateColors[mealPlan[dayData.dayName].dinner] } : {}"
        >
          <div class="meal-content" v-if="mealPlan[dayData.dayName]?.dinner">
            <div class="dish-name">{{ mealPlan[dayData.dayName].dinner }}</div>
          </div>
          <div class="empty-meal" v-else>Click to add</div>
        </div>
      </div>
      
      <div class="info-text">
        <p><small>Click to select from list • Double-click for random dish</small></p>
      </div>
    </div>
    
    <!-- Dish Selection Modal -->
    <div v-if="showModal" class="modal-overlay" @click="showModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Select {{ currentSelection.mealType === 'lunch' ? 'Lunch' : 'Dinner' }}</h2>
          <button class="close-btn-header" @click="showModal = false" aria-label="Close">×</button>
        </div>
        
        <div class="dish-list">
          <div class="search-section">
            <input 
              v-model="searchQuery"
              type="text"
              placeholder="Search dishes..."
              class="search-input"
            />
          </div>
          
          <h3>All Options:</h3>
          <div class="dish-text-list">
            <button 
              v-for="dish in filteredDishes" 
              :key="dish" 
              class="dish-text-option"
              :class="{ 
                'already-chosen': usedDishes.has(dish),
                'add-new-option': dish.includes('To List')
              }"
              @click="selectOption(dish)"
            >
              {{ dish }}
              <span v-if="usedDishes.has(dish)" class="chosen-indicator">✓</span>
              <span v-if="dish.includes('To List')" class="add-new-indicator">+</span>
            </button>
            <button 
              v-if="!searchQuery || 'eating out'.includes(searchQuery.toLowerCase())"
              @click="selectOption('eating-out')" 
              class="dish-text-option eating-out-option"
            >
              🍽️ Eating Out
            </button>
          </div>
        </div>
        
        <button class="close-btn-footer" @click="showModal = false">Close</button>
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

.controls-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.date-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.date-selector label {
  font-weight: 600;
  color: var(--text-color);
  font-size: 1rem;
}

.date-select {
  padding: 0.5rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  background-color: white;
  color: var(--text-color);
  font-size: 1rem;
  cursor: pointer;
  transition: border-color 0.3s, box-shadow 0.3s;
  min-width: 200px;
}

.date-select:hover {
  border-color: var(--primary-color);
}

.date-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(24, 119, 242, 0.1);
}

.generate-btn {
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
  grid-template-columns: 100px repeat(2, 1fr);
  background-color: var(--header-bg);
}

.corner-cell {
  border-right: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  min-height: 40px;
}

.meal-header {
  padding: 0.5rem;
  text-align: center;
  border-right: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  background-color: var(--header-bg);
}

.meal-name {
  font-weight: 600;
  font-size: 0.9rem;
}

.day-row {
  display: grid;
  grid-template-columns: 100px repeat(2, 1fr);
}

.day-header-cell {
  padding: 0.5rem;
  background-color: var(--header-bg);
  font-weight: 600;
  border-right: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  min-height: 100px;
}

.day-name {
  font-weight: 600;
  font-size: 0.85rem;
}

.day-date {
  font-size: 0.75rem;
  color: #666;
}

.meal-cell {
  padding: 0.75rem;
  min-height: 80px;
  border-right: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.meal-content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.dish-name {
  font-size: 0.85rem;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-height: 1.3;
  font-weight: 500;
}

.empty-meal {
  color: #888;
  font-size: 0.8rem;
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
    padding: 0.5rem;
  }
  
  h1 {
    font-size: 1.4rem;
    margin-bottom: 0.8rem;
  }
  
  .controls-section {
    gap: 0.6rem;
    margin-bottom: 0.8rem;
  }
  
  .date-select {
    min-width: 160px;
    font-size: 0.85rem;
    padding: 0.4rem 0.8rem;
  }
  
  .generate-btn {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
  
  .calendar-header, .day-row {
    grid-template-columns: 80px repeat(2, 1fr);
  }
  
  .meal-header, .day-header-cell, .meal-cell {
    padding: 0.4rem;
    font-size: 0.8rem;
  }
  
  .day-header-cell {
    min-height: 80px;
  }
  
  .meal-cell {
    min-height: 70px;
  }
  
  .dish-name {
    font-size: 0.8rem;
  }
  
  .day-name {
    font-size: 0.8rem;
  }
  
  .day-date {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .meal-planner {
    padding: 0.3rem;
  }
  
  .weekly-calendar {
    overflow-x: auto;
  }
  
  .calendar-header, .day-row {
    grid-template-columns: 70px repeat(2, 1fr);
    min-width: 300px;
  }
  
  h1 {
    font-size: 1.2rem;
    margin-bottom: 0.6rem;
  }
  
  .controls-section {
    gap: 0.4rem;
    margin-bottom: 0.6rem;
  }
  
  .date-select {
    width: 100%;
    min-width: unset;
    font-size: 0.8rem;
    padding: 0.3rem 0.6rem;
  }
  
  .generate-btn {
    width: 100%;
    padding: 0.4rem;
    font-size: 0.8rem;
  }
  
  .meal-header, .day-header-cell, .meal-cell {
    padding: 0.3rem;
    font-size: 0.75rem;
  }
  
  .day-header-cell {
    min-height: 70px;
  }
  
  .meal-cell {
    min-height: 60px;
  }
  
  .dish-name {
    font-size: 0.75rem;
    -webkit-line-clamp: 3;
    line-height: 1.2;
  }
  
  .day-name {
    font-size: 0.75rem;
  }
  
  .day-date {
    font-size: 0.65rem;
  }
  
  .empty-meal {
    font-size: 0.7rem;
  }
}

/* Modal styles */
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
  padding: 1rem;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 450px;
  max-height: 85vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1rem 0.5rem 1rem;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  color: var(--primary-color);
  margin: 0;
  font-size: 1.1rem;
}

.close-btn-header {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn-header:hover {
  background-color: #f0f0f0;
}

/* Removed random section styles (no longer needed) */

.eating-out-option {
  background-color: #fff3e0 !important;
  border-color: #ffcc80 !important;
  color: #e65100 !important;
}

.eating-out-option:hover {
  background-color: #ffe0b2 !important;
  border-color: #ffb74d !important;
}

.dish-list {
  padding: 1rem;
  flex: 1;
}

.search-section {
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 16px; /* Prevent zoom on iOS */
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(24, 119, 242, 0.1);
}

.dish-list h3 {
  margin: 0 0 0.75rem 0;
  color: #555;
  font-size: 0.95rem;
}

.dish-text-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
}

.dish-text-option {
  width: 100%;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  font-size: 0.85rem;
  color: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dish-text-option:hover {
  background-color: #e9ecef;
  border-color: var(--primary-color);
  transform: translateY(-1px);
}

.dish-text-option:active {
  transform: translateY(0);
}

.dish-text-option.already-chosen {
  background-color: #f0f0f0;
  color: #666;
  border-color: #d0d0d0;
}

.dish-text-option.already-chosen:hover {
  background-color: #e8e8e8;
  border-color: #c0c0c0;
}

.chosen-indicator {
  color: #28a745;
  font-weight: bold;
  font-size: 0.9rem;
}

.add-new-option {
  background-color: #e3f2fd !important;
  border-color: #2196f3 !important;
  color: #1565c0 !important;
  font-weight: 600;
}

.add-new-option:hover {
  background-color: #bbdefb !important;
  border-color: #1976d2 !important;
}

.add-new-indicator {
  color: #2196f3;
  font-weight: bold;
  font-size: 1rem;
}

.close-btn-footer {
  margin: 0.5rem 1rem 1rem 1rem;
  padding: 0.75rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.close-btn-footer:hover {
  background-color: #5a6268;
}

/* Removed eating-out image styles (no longer using images) */

/* Media queries for the modal */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
  }
  
  .modal-content {
    max-width: 380px;
  }
  
  /* Removed random section responsive styles */
  
  .modal-header {
    padding: 0.75rem 0.75rem 0.5rem 0.75rem;
  }
  
  .modal-header h2 {
    font-size: 1rem;
  }
  
  .dish-list {
    padding: 0.75rem;
  }
  
  .search-input {
    padding: 0.6rem;
    font-size: 16px; /* Maintain 16px to prevent zoom */
  }
  
  .dish-text-option {
    padding: 0.6rem;
    font-size: 0.8rem;
  }
  
  .close-btn-footer {
    margin: 0.5rem 0.75rem 0.75rem 0.75rem;
    padding: 0.6rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 0;
    align-items: flex-start;
  }
  
  .modal-content {
    max-width: none;
    width: 100%;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
  }
  
  .modal-header {
    padding: 1rem;
    position: sticky;
    top: 0;
    background-color: white;
    z-index: 10;
  }
  
  .modal-header h2 {
    font-size: 1.1rem;
  }
  
  .close-btn-header {
    width: 32px;
    height: 32px;
    font-size: 1.5rem;
  }
  
  .dish-list {
    padding: 1rem;
    flex: 1;
    overflow-y: auto;
  }
  
  .dish-list h3 {
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }
  
  .dish-text-list {
    gap: 0.5rem;
    max-height: none;
  }
  
  .search-input {
    padding: 0.75rem;
    font-size: 16px; /* Maintain 16px to prevent zoom */
  }
  
  .dish-text-option {
    padding: 0.75rem;
    font-size: 0.9rem;
    min-height: 48px; /* Better touch target */
  }
  
  /* Removed random section mobile styles */
  
  .close-btn-footer {
    margin: 0;
    padding: 1rem;
    font-size: 1rem;
    position: sticky;
    bottom: 0;
    background-color: white;
    border-top: 1px solid #eee;
  }
}
</style>