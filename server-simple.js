const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Basic middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'],
  credentials: true
}));
app.use(express.json());

// Sample retro clothing data with updated structure
let products = [
  {
    id: 1,
    name: "Vintage Denim Jacket",
    price: 89.99,
    category: "jackets",
    images: [
      "/api/placeholder/400/500",
      "/api/placeholder/400/500?2",
      "/api/placeholder/400/500?3"
    ],
    description: "Classic 80s inspired denim jacket with authentic vintage wash. Features classic button closure, chest pockets, and a timeless fit that works with everything in your wardrobe.",
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    details: {
      material: "100% Cotton Denim",
      care: "Machine wash cold, hang dry",
      origin: "Made in Portugal"
    }
  },
  {
    id: 2,
    name: "Retro Turtleneck",
    price: 45.99,
    category: "tops",
    images: [
      "/api/placeholder/400/500?4",
      "/api/placeholder/400/500?5"
    ],
    description: "Minimalist turtleneck in earthy tones, perfect for layering. Soft ribbed texture and relaxed fit make this piece essential for cooler weather.",
    sizes: ["XS", "S", "M", "L"],
    inStock: true,
    details: {
      material: "70% Wool, 30% Cashmere",
      care: "Hand wash only",
      origin: "Made in Italy"
    }
  },
  {
    id: 3,
    name: "Wide Leg Trousers",
    price: 67.99,
    category: "bottoms",
    images: [
      "/api/placeholder/400/500?6",
      "/api/placeholder/400/500?7",
      "/api/placeholder/400/500?8"
    ],
    description: "High-waisted wide leg trousers with vintage silhouette. Features a comfortable elastic waistband and flowy design that elongates the legs.",
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    details: {
      material: "65% Polyester, 35% Viscose",
      care: "Machine wash gentle, low iron",
      origin: "Made in Turkey"
    }
  },
  {
    id: 4,
    name: "Oversized Blazer",
    price: 125.99,
    category: "jackets",
    images: [
      "/api/placeholder/400/500?9",
      "/api/placeholder/400/500?10"
    ],
    description: "Structured oversized blazer with minimalist design. Perfect for professional settings or elevated casual looks.",
    sizes: ["S", "M", "L"],
    inStock: false,
    details: {
      material: "95% Wool, 5% Elastane",
      care: "Dry clean only",
      origin: "Made in Spain"
    }
  },
  {
    id: 5,
    name: "Cropped Sweater",
    price: 54.99,
    category: "tops",
    images: [
      "/api/placeholder/400/500?11",
      "/api/placeholder/400/500?12",
      "/api/placeholder/400/500?13"
    ],
    description: "Soft knit cropped sweater in neutral tones. Versatile piece that pairs beautifully with high-waisted bottoms.",
    sizes: ["XS", "S", "M", "L", "XL"],
    inStock: true,
    details: {
      material: "50% Merino Wool, 50% Acrylic",
      care: "Hand wash or gentle cycle",
      origin: "Made in Scotland"
    }
  },
  {
    id: 6,
    name: "Straight Cut Jeans",
    price: 78.99,
    category: "bottoms",
    images: [
      "/api/placeholder/400/500?14",
      "/api/placeholder/400/500?15",
      "/api/placeholder/400/500?16"
    ],
    description: "High-quality straight cut jeans with vintage fit. Classic five-pocket styling with premium denim that improves with wear.",
    sizes: ["26", "28", "30", "32", "34"],
    inStock: true,
    details: {
      material: "100% Organic Cotton Denim",
      care: "Machine wash cold, air dry",
      origin: "Made in Japan"
    }
  }
];

// Routes
app.get('/api/products', (req, res) => {
  const { category, inStock } = req.query;
  let filteredProducts = products;

  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }

  if (inStock === 'true') {
    filteredProducts = filteredProducts.filter(p => p.inStock);
  }

  res.json(filteredProducts);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

app.get('/api/categories', (req, res) => {
  const categories = [...new Set(products.map(p => p.category))];
  res.json(categories);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Simple Retro Clothing API server running on port ${PORT}`);
  console.log(`📦 Serving ${products.length} products`);
  console.log(`🌐 CORS enabled for: http://localhost:5175`);
});