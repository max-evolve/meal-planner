# Dish Images

This folder contains images for all dishes used in the meal planner application. These images are referenced by the meal planner component using a naming convention based on the dish names.

## Image Naming Convention

Images are named using kebab-case (lowercase with hyphens) of the dish names. For example:
- "Couscous Chana Salad" → `couscous-chana-salad.jpg`
- "Paneer Bhurji & Roti" → `paneer-bhurji-roti.jpg`
- "Chicken Curry & Roti" → `chicken-curry-roti.jpg`

## Replacing Images

To replace an image for a specific dish:

1. Prepare your new image (ideally square format for best display)
2. Convert the dish name to kebab-case following these rules:
   - Convert to lowercase
   - Replace spaces with hyphens
   - Replace "/" with hyphens
   - Replace "&" with "-and-"
   - Remove special characters
3. Save the image with the resulting filename (e.g., `dish-name.jpg`) in this folder
4. The application will automatically use your new image

## Special Cases

Some dish names have special mappings to handle formatting differences. These are handled automatically by the application, but if you're adding new images, be aware of these patterns:

- Dishes with "/" like "Peri Peri Chicken / Paneer Rice Bowl" → `peri-peri-chicken-rice-bowl.jpg`
- Dishes with "&" like "Rajma & Rice" → `rajma-rice.jpg`

## Default Image

The `default.jpg` image is used when a dish doesn't have a corresponding image. 