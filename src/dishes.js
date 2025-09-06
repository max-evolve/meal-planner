// Light dishes that can be used for both lunch and dinner
export const lightDishes = [
    "Couscous Chana Salad",
    "Spinach Corn Sandwich",
    "Moong Dal Cheela",
    "Vermicelli",
    "Uttapam",
    "Masala Idli",
    "Idli Sambhar",
    "Tomato Soup",
    "Minestrone Soup",
    "Broccoli Soup",
    "Caesar Salad",
    "Pasta Salad",
    "Orzo Salad",
    "Smashed Potatoes Salad",
    "Brussels Sprouts Salad",
    "Tacos - Chicken",
    "Egg Curry & Roti",
    "Grilled Chicken & Veggies",
    "Spinach Thecha & Rice",
    "Paneer Kulcha",
    "Aglio E Olio",
    "Soya Pulao",
    "Noodles - Chicken",
    "Noodles - Veg",
    "Khichdi",
    "Paneer Bhurji & Roti",
    "Peri Peri Chicken / Paneer Rice Bowl",
    "Sabudana Khichdi",
    "Upma"
];

// Heavier dishes reserved only for dinner
export const dinnerOnlyDishes = [
    "Chole & Rice",
    "Shakshouka",
    "Lasagna",
    "Chicken Curry & Roti",
    "Egg Curry & Roti",
    "Bhindi Roti & Raita",
    "Rajma & Rice",
    "Katsu Curry & Rice",
    "Mushroom / White Sauce Pasta",
    "Palak Paneer & Roti",
    "Aloo Gobhi & Roti & Raita"
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