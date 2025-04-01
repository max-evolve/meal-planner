// Script to download images to the local folder
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';  // You might need to install this: npm install node-fetch

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Object containing dish names and image URLs
const dishImagesMap = {
  // Light dishes
  "couscous-chana-salad": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=300&auto=format&fit=crop",
  "spinach-corn-sandwich": "https://images.unsplash.com/photo-1554433607-66b5efe9d304?q=80&w=300&auto=format&fit=crop",
  "moong-dal-cheela": "https://images.unsplash.com/photo-1635321593217-40050ad13c74?q=80&w=300&auto=format&fit=crop",
  "vermicelli": "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=300&auto=format&fit=crop",
  "uttapam": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=300&auto=format&fit=crop",
  "masala-idli": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=300&auto=format&fit=crop",
  "idli-sambhar": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=300&auto=format&fit=crop",
  "tomato-soup": "https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=300&auto=format&fit=crop",
  "minestrone-soup": "https://images.unsplash.com/photo-1578020190125-d7f00887c079?q=80&w=300&auto=format&fit=crop",
  "broccoli-soup": "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?q=80&w=300&auto=format&fit=crop",
  "caesar-salad": "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=300&auto=format&fit=crop",
  "pasta-salad": "https://images.unsplash.com/photo-1473093226795-af9932fe5856?q=80&w=300&auto=format&fit=crop",
  "orzo-salad": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=300&auto=format&fit=crop",
  "smashed-potatoes-salad": "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?q=80&w=300&auto=format&fit=crop",
  "brussels-sprouts-salad": "https://images.unsplash.com/photo-1507565524853-a6d38cfdbec1?q=80&w=300&auto=format&fit=crop",
  "tacos": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=300&auto=format&fit=crop",
  "egg-curry": "https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=300&auto=format&fit=crop",
  "grilled-chicken-veggies": "https://images.unsplash.com/photo-1432139509613-5c4255815697?q=80&w=300&auto=format&fit=crop",
  "gobhi-aloo-raita": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=300&auto=format&fit=crop",
  "spinach-thecha-rice": "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?q=80&w=300&auto=format&fit=crop",
  "paneer-kulcha": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=300&auto=format&fit=crop",
  "aglio-e-olio": "https://images.unsplash.com/photo-1608219992759-8d74ed8d76eb?q=80&w=300&auto=format&fit=crop",
  "chili-soya-fried-rice": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=300&auto=format&fit=crop",
  "noodles": "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?q=80&w=300&auto=format&fit=crop",
  "shakshouka": "https://images.unsplash.com/photo-1590412200988-a436970781fa?q=80&w=300&auto=format&fit=crop",
  "khichdi": "https://images.unsplash.com/photo-1621263764928-df1444c5e859?q=80&w=300&auto=format&fit=crop",
  "paneer-bhurji-roti": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d6?q=80&w=300&auto=format&fit=crop",
  "peri-peri-chicken-rice-bowl": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=300&auto=format&fit=crop",
  "sabudana-khichdi": "https://images.unsplash.com/photo-1567337710282-00832b415979?q=80&w=300&auto=format&fit=crop",
  "upma": "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=300&auto=format&fit=crop",
  "soya-pulao": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=300&auto=format&fit=crop",
  
  // Dinner only dishes
  "lasagna": "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?q=80&w=300&auto=format&fit=crop",
  "sabudana": "https://images.unsplash.com/photo-1567337710282-00832b415979?q=80&w=300&auto=format&fit=crop",
  "chicken-curry-roti": "https://images.unsplash.com/photo-1604152135912-04a022e23696?q=80&w=300&auto=format&fit=crop",
  "egg-curry-roti": "https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=300&auto=format&fit=crop",
  "bhindi-raita-roti": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=300&auto=format&fit=crop",
  "rajma-rice": "https://images.unsplash.com/photo-1585937421612-70a008356ae4?q=80&w=300&auto=format&fit=crop",
  "katsu-curry": "https://images.unsplash.com/photo-1574484284002-952d92456975?q=80&w=300&auto=format&fit=crop",
  "mushroom-white-sauce-pasta": "https://images.unsplash.com/photo-1645112411341-6c4fd023882c?q=80&w=300&auto=format&fit=crop",
  "chicken-breast-veggies": "https://images.unsplash.com/photo-1518492104633-130d0cc84637?q=80&w=300&auto=format&fit=crop",
  "palak-paneer": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=300&auto=format&fit=crop",
  "aloo-gobhi-roti-raita": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=300&auto=format&fit=crop",
  "chole-rice": "https://images.unsplash.com/photo-1585937421612-70a008356ae4?q=80&w=300&auto=format&fit=crop",
  "katsu-curry-rice": "https://images.unsplash.com/photo-1574484284002-952d92456975?q=80&w=300&auto=format&fit=crop",
  "bhindi-roti-raita": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=300&auto=format&fit=crop",
  "palak-paneer-rice-roti": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=300&auto=format&fit=crop",
  
  // Default image
  "default": "https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?q=80&w=300&auto=format&fit=crop"
};

// Function to download an image
const downloadImage = (url, filename) => {
  return new Promise((resolve, reject) => {
    const imgPath = path.join(__dirname, 'public', 'images', filename);
    const file = fs.createWriteStream(imgPath);
    
    https.get(url, (response) => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${filename}`);
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(imgPath, () => {}); // Delete the file if there's an error
        console.error(`Error downloading ${filename}:`, err.message);
        reject(err);
      });
    }).on('error', (err) => {
      fs.unlink(imgPath, () => {}); // Delete the file if there's an error
      console.error(`Error downloading ${filename}:`, err.message);
      reject(err);
    });
  });
};

// Download all images
const downloadAllImages = async () => {
  try {
    const downloadPromises = Object.entries(dishImagesMap).map(([name, url]) => {
      return downloadImage(url, `${name}.jpg`);
    });
    
    await Promise.all(downloadPromises);
    console.log('All images downloaded successfully!');
  } catch (err) {
    console.error('Error downloading images:', err);
  }
};

// Run the download function
downloadAllImages(); 