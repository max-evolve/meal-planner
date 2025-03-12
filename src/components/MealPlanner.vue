<script setup>
import { ref } from 'vue';
import { lunchDishes, dinnerDishes } from '../dishes';

const mealPlan = ref({});

const getRandomDish = (dishes, usedDishes) => {
  const availableDishes = dishes.filter(dish => !usedDishes.has(dish));
  if (availableDishes.length === 0) return null; // No available dishes
  const randomIndex = Math.floor(Math.random() * availableDishes.length);
  return availableDishes[randomIndex];
};

const generateMealPlan = () => {
  const newPlan = {};
  const usedLunchDishes = new Set();
  const usedDinnerDishes = new Set();
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
    const formattedDate = date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long' });
    const lunch = getRandomDish(lunchDishes, usedLunchDishes);
    const dinner = getRandomDish(dinnerDishes, usedDinnerDishes);

    if (lunch) usedLunchDishes.add(lunch);
    if (dinner) usedDinnerDishes.add(dinner);

    newPlan[formattedDate] = {
      lunch: lunch || "No more lunch options",
      dinner: dinner || "No more dinner options"
    };
  });

  mealPlan.value = newPlan;
};

// Function to replace a meal with a new random dish
const replaceDish = (mealType, date) => {
  const usedDishes = new Set(Object.values(mealPlan.value).flatMap(meal => meal.lunch).concat(Object.values(mealPlan.value).flatMap(meal => meal.dinner)));

  if (mealType === 'lunch') {
    const newDish = getRandomDish(lunchDishes, usedDishes);
    mealPlan.value[date].lunch = newDish || "No more lunch options";
  } else if (mealType === 'dinner') {
    const newDish = getRandomDish(dinnerDishes, usedDishes);
    mealPlan.value[date].dinner = newDish || "No more dinner options";
  }
};
</script>

<template>
  <div class="meal-planner">
    <h1>Weekly Meal Planner</h1>
    <button @click="generateMealPlan">Generate Meal Plan</button>
    
    <div v-if="Object.keys(mealPlan).length" class="meal-table">
      <h2>Your Meal Plan for the Week</h2>
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
              <td>{{ date }}</td>
              <td @click="replaceDish('lunch', date)" class="clickable">{{ meals.lunch }}</td>
              <td @click="replaceDish('dinner', date)" class="clickable">{{ meals.dinner }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
body {
  background-color: #ffffff; /* Set the entire background to white */
}

.meal-planner {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
  background-color: #ffffff; /* White background for the planner */
  /* Removed border-radius and box-shadow */
}

h1 {
  color: #1877f2; /* Facebook blue */
  text-align: center;
  margin-bottom: 20px;
}

button {
  display: block;
  margin: 0 auto;
  padding: 10px 20px;
  background-color: #1877f2; /* Facebook blue */
  color: white;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #36a372; /* Darker green on hover */
}

.meal-table {
  margin-top: 2rem;
}

.table-wrapper {
  max-height: 400px; /* Set a fixed height for the table wrapper */
  overflow-y: auto; /* Allow scrolling if content exceeds height */
}

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed; /* Fix the table layout */
}

th, td {
  border: 1px solid #ddd;
  padding: 8px; /* Reduced padding for smaller cell height */
  text-align: left;
  color: black; /* Black text */
  height: 30px; /* Reduced height for rows */
}

th {
  background-color: #f0f2f5; /* Light gray for header */
}

tr:nth-child(even) {
  background-color: #f9f9f9; /* Light gray for even rows */
}

tr:hover {
  background-color: #e9ecef; /* Slightly darker gray on hover */
}

.clickable {
  cursor: pointer; /* Change cursor to pointer for clickable cells */
  transition: background-color 0.3s;
}

.clickable:hover {
  background-color: #e0e0e0; /* Highlight on hover */
}
</style>