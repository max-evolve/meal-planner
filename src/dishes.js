// ============================================
// DISHES ELIGIBLE FOR RANDOM GENERATION
// ============================================

// Light dishes eligible for random generation (can be used for both lunch and dinner)
export const lightDishesRandomEligible = [
    "Couscous Chana Salad",
    "Spinach Corn Sandwich",
    "Moong Dal Cheela",
    "Vermicelli with Veggies",
    "Soup + Grilled Chicken/Paneer ",
    "Chicken Caesar Salad",
    "Pasta Salad",
    "Orzo Salad",
    "Chicken burrito roll",
    "Egg Curry & Roti",
    "Grilled Chicken & Veggies",
    "Soya/Panner Cholle Pulao",
    "Noodles - Chicken",
    "Paneer Bhurji & Roti",
    "Rice Bowl - Peri Peri Chicken",
    "Rice Bowl - Kung Pao Chicken",
    "Rice Bowl - Peri Peri Paneer",
    "Upma"
];

// Heavier dishes eligible for random generation (reserved only for dinner)
export const dinnerOnlyDishesRandomEligible = [
    "Shakshouka + Bread",
    "Chicken Curry & Rice/Roti",
    "Egg Curry & Rice/Roti",
    "Katsu Curry & Rice",
    "Palak Paneer & Roti",
    
    
];

// ============================================
// DISHES EXCLUDED FROM RANDOM (MANUAL ONLY)
// ============================================

// Light dishes excluded from random generation but available for manual selection
export const lightDishesManualOnly = [
    // Add dishes here that you want to exclude from random generation
    // but still be able to select manually
    "Masala Idli",
    "Smashed Potatoes Salad",
    "Brussels Sprouts Salad",
    "Minestrone Soup",
    "Broccoli Soup",
    "Uttapam",
    "Paneer Kulcha",
    "Spinach Thecha & Rice",
    "Noodles - Veg",
    "Khichdi",
    "Sabudana Khichdi",
    "Soya Salad Bowl",
    "Aglio E Olio",
];

// Dinner-only dishes excluded from random generation but available for manual selection
export const dinnerOnlyDishesManualOnly = [
    // Add dishes here that you want to exclude from random generation
    // but still be able to select manually
    "Chole & Rice",
    "Lasagna",
    "Bhindi, Roti & Raita",
    "Rajma & Rice",
    "Mushroom / White Sauce Pasta",
    "Aloo Gobhi & Roti & Raita"

];

// ============================================
// COMBINED CATEGORIES (for backward compatibility and modal display)
// ============================================

// All light dishes (both random-eligible and manual-only)
export const lightDishes = [
    ...lightDishesRandomEligible,
    ...lightDishesManualOnly
];

// All dinner-only dishes (both random-eligible and manual-only)
export const dinnerOnlyDishes = [
    ...dinnerOnlyDishesRandomEligible,
    ...dinnerOnlyDishesManualOnly
];

// All dishes suitable for lunch (only light dishes)
export const lunchDishes = [
    ...lightDishes
];

// All dishes suitable for dinner (includes both light dishes and dinner-only dishes)
export const dinnerDishes = [
    ...lightDishes,
    ...dinnerOnlyDishes
];

// Dishes eligible for random generation (for meal plan generation)
export const lunchDishesRandomEligible = [
    ...lightDishesRandomEligible
];

export const dinnerDishesRandomEligible = [
    ...lightDishesRandomEligible,
    ...dinnerOnlyDishesRandomEligible
];