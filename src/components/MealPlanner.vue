<script setup>
import { ref } from 'vue';
import { lunchDishes, dinnerDishes, lightDishes, dinnerOnlyDishes } from '../dishes';

const mealPlan = ref({});

const getRandomDish = (dishes, usedDishes) => {
  const availableDishes = dishes.filter(dish => !usedDishes.has(dish));
  if (availableDishes.length === 0) return null; // No available dishes
  const randomIndex = Math.floor(Math.random() * availableDishes.length);
  return availableDishes[randomIndex];
};

const generateMealPlan = () => {
  const newPlan = {};
  const usedDishes = new Set();
  const daysOfWeek = [
    { day: "Monday", date: new Date() },
    { day: "Tuesday", date: new Date(Date.now() + 86400000) },
    { day: "Wednesday", date: new Date(Date.now() + 2 * 86400000) },
    { day: "Thursday", date: new Date(Date.now() + 3 * 86400000) },
    { day: "Friday", date: new Date(Date.now() + 4 * 86400000) },
    { day: "Saturday", date: new Date(Date.now() + 5 * 86400000) },
    { day: "Sunday", date: new Date(Date.now() + 6 * 86400000) },
  ];

  daysOfWeek.forEach(({ day, date }) => {
    const formattedDate = date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
    
    // For lunch, we can only use light dishes
    const lunch = getRandomDish(lunchDishes, usedDishes);
    if (lunch) usedDishes.add(lunch);
    
    // For dinner, we can use any dinner dish (light or dinner-only)
    const dinner = getRandomDish(dinnerDishes, usedDishes);
    if (dinner) usedDishes.add(dinner);

    newPlan[formattedDate] = {
      lunch: lunch || "No more lunch options",
      dinner: dinner || "No more dinner options"
    };
  });

  mealPlan.value = newPlan;
};

const replaceDish = (mealType, date) => {
  const usedDishes = new Set();
  
  // Add all current dishes to the usedDishes set except the one being replaced
  Object.entries(mealPlan.value).forEach(([currentDate, meals]) => {
    if (currentDate !== date || mealType !== 'lunch') {
      if (meals.lunch && meals.lunch !== "No more lunch options") {
        usedDishes.add(meals.lunch);
      }
    }
    if (currentDate !== date || mealType !== 'dinner') {
      if (meals.dinner && meals.dinner !== "No more dinner options") {
        usedDishes.add(meals.dinner);
      }
    }
  });

  // Get a new dish that's not already used in the week
  if (mealType === 'lunch') {
    // For lunch, we can only use light dishes
    const newDish = getRandomDish(lunchDishes, usedDishes);
    mealPlan.value[date].lunch = newDish || "No more lunch options";
  } else if (mealType === 'dinner') {
    // For dinner, we can use any dinner dish (light or dinner-only)
    const newDish = getRandomDish(dinnerDishes, usedDishes);
    mealPlan.value[date].dinner = newDish || "No more dinner options";
  }
};
</script>

<template>
  <div class="meal-planner">
    <h1>Weekly Meal Planner</h1>
    <button @click="generateMealPlan" class="generate-btn">Generate Meal Plan</button>
    
    <div v-if="Object.keys(mealPlan).length" class="meal-table">
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Lunch</th>
              <th>Dinner</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(meals, date) in mealPlan" :key="date">
              <td class="date-cell">{{ date }}</td>
              <td @click="replaceDish('lunch', date)" class="clickable meal-cell">{{ meals.lunch }}</td>
              <td @click="replaceDish('dinner', date)" class="clickable meal-cell">{{ meals.dinner }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="info-text">
        <p><small>Click on any meal to replace it with another option</small></p>
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

.meal-table {
  margin-top: 1.5rem;
  width: 100%;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin-bottom: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  min-width: 600px; /* Ensures table doesn't get too narrow on mobile */
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border: 1px solid var(--border-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

th {
  background-color: var(--header-bg);
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 10;
}

.date-cell {
  width: 20%;
  font-weight: 500;
}

.meal-cell {
  width: 40%;
}

tr:nth-child(even) {
  background-color: var(--even-row-bg);
}

tr:hover {
  background-color: var(--hover-row-bg);
}

.clickable {
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.clickable:hover {
  background-color: var(--hover-cell-bg);
}

.clickable:active::after {
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
  margin-top: 0.5rem;
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
  
  th, td {
    padding: 0.6rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 1.3rem;
  }
  
  .generate-btn {
    width: 100%;
    padding: 0.5rem;
  }
  
  th, td {
    padding: 0.5rem;
    font-size: 0.8rem;
  }
  
  .date-cell {
    width: 25%;
  }
  
  .meal-cell {
    width: 37.5%;
  }
}
</style>