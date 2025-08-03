const express = require('express');
const app = express();
const PORT = 3002; // Usamos puerto diferente

// CORS manual para evitar problemas
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

// Datos de productos simples
const products = [
  {
    id: 1,
    name: "Vintage Denim Jacket",
    price: 89.99,
    category: "jackets",
    images: ["/api/placeholder/400/500", "/api/placeholder/400/500?2"],
    description: "Classic 80s inspired denim jacket with authentic vintage wash.",
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    details: { material: "100% Cotton Denim", care: "Machine wash cold", origin: "Made in Portugal" }
  },
  {
    id: 2,
    name: "Retro Turtleneck",
    price: 45.99,
    category: "tops",
    images: ["/api/placeholder/400/500?4", "/api/placeholder/400/500?5"],
    description: "Minimalist turtleneck in earthy tones, perfect for layering.",
    sizes: ["XS", "S", "M", "L"],
    inStock: true,
    details: { material: "70% Wool, 30% Cashmere", care: "Hand wash only", origin: "Made in Italy" }
  },
  {
    id: 3,
    name: "Wide Leg Trousers",
    price: 67.99,
    category: "bottoms",
    images: ["/api/placeholder/400/500?6"],
    description: "High-waisted wide leg trousers with vintage silhouette.",
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    details: { material: "65% Polyester, 35% Viscose", care: "Machine wash gentle", origin: "Made in Turkey" }
  }
];

// Rutas simples
app.get('/api/products', (req, res) => {
  console.log('📦 Products requested');
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  console.log(`🔍 Product ${req.params.id} requested`);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📦 ${products.length} products available`);
  console.log('🌐 CORS enabled for all origins');
});