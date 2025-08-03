const express = require('express');
const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const rateLimit = require('express-rate-limit');
// const { body, validationResult } = require('express-validator');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
// const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Simplified middleware for now

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// File upload middleware - commented out for now
// app.use(fileUpload({
//   limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 }, // 5MB
//   abortOnLimit: true,
//   createParentPath: true,
//   useTempFiles: true,
//   tempFileDir: '/tmp/'
// }));

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// Authentication middleware - temporarily disabled
// const authenticateAdmin = (req, res, next) => {
//   const token = req.header('Authorization')?.replace('Bearer ', '');
//   
//   if (!token) {
//     return res.status(401).json({ error: 'Access denied. No token provided.' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.admin = decoded;
//     next();
//   } catch (error) {
//     res.status(400).json({ error: 'Invalid token.' });
//   }
// };

// Input sanitization middleware - temporarily disabled
// const sanitizeInput = (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ 
//       error: 'Invalid input data',
//       details: errors.array()
//     });
//   }
//   next();
// };

// Audit logging function - simplified
const auditLog = (action, user, details) => {
  console.log('AUDIT:', action, user, details);
};

// Sample retro clothing data
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

// Authentication endpoints - temporarily simplified
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // In production, get from database
    if (username !== process.env.ADMIN_USERNAME) {
      auditLog('login_failed', username, { ip: req.ip, reason: 'invalid_username' });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Simplified validation for now
    if (password !== 'admin123') {
      auditLog('login_failed', username, { ip: req.ip, reason: 'invalid_password' });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = 'simple-token-for-testing';

    auditLog('login_success', username, { ip: req.ip });
    res.json({ token, message: 'Login successful' });
  } catch (error) {
    auditLog('login_error', req.body?.username || 'unknown', { ip: req.ip, error: error.message });
    res.status(500).json({ error: 'Server error' });
  }
});

// Image upload endpoint - simplified
app.post('/api/admin/upload', async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const image = req.files.image;
    const allowedTypes = process.env.ALLOWED_FILE_TYPES.split(',');
    const fileExtension = path.extname(image.name).toLowerCase().slice(1);

    // Validate file type
    if (!allowedTypes.includes(fileExtension)) {
      return res.status(400).json({ 
        error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}` 
      });
    }

    // Generate unique filename
    const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExtension}`;
    const uploadPath = path.join(uploadsDir, uniqueFilename);

    // Move file to uploads directory
    await image.mv(uploadPath);

    const imageUrl = `/uploads/${uniqueFilename}`;
    
    auditLog('image_upload', req.admin.username, { 
      ip: req.ip, 
      filename: uniqueFilename,
      originalName: image.name,
      size: image.size
    });

    res.json({ 
      message: 'Image uploaded successfully',
      imageUrl,
      filename: uniqueFilename
    });
  } catch (error) {
    auditLog('image_upload_error', req.admin.username, { ip: req.ip, error: error.message });
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Admin endpoints for managing products (simplified)
app.post('/api/admin/products', (req, res) => {
  const { name, price, category, description, sizes, images, details } = req.body;
  
  if (!name || !price || !category || !description || !sizes) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newProduct = {
    id: Math.max(...products.map(p => p.id)) + 1,
    name,
    price: parseFloat(price),
    category,
    description,
    sizes: Array.isArray(sizes) ? sizes : sizes.split(',').map(s => s.trim()),
    images: images && images.length > 0 ? images : ['/api/placeholder/400/500'],
    inStock: true,
    details: details || {
      material: "Cotton blend",
      care: "Machine wash cold",
      origin: "Made with care"
    }
  };

  products.push(newProduct);
  
  auditLog('product_created', 'admin', { 
    ip: req.ip, 
    productId: newProduct.id,
    productName: newProduct.name
  });
  
  res.status(201).json(newProduct);
});

app.put('/api/admin/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const productIndex = products.findIndex(p => p.id === productId);
  
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const { name, price, category, description, sizes, images, inStock, details } = req.body;
  
  products[productIndex] = {
    ...products[productIndex],
    ...(name && { name }),
    ...(price && { price: parseFloat(price) }),
    ...(category && { category }),
    ...(description && { description }),
    ...(sizes && { sizes: Array.isArray(sizes) ? sizes : sizes.split(',').map(s => s.trim()) }),
    ...(images && { images }),
    ...(inStock !== undefined && { inStock }),
    ...(details && { details })
  };

  auditLog('product_updated', 'admin', { 
    ip: req.ip, 
    productId: productId,
    productName: products[productIndex].name
  });
  
  res.json(products[productIndex]);
});

app.delete('/api/admin/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const productIndex = products.findIndex(p => p.id === productId);
  
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const deletedProduct = products.splice(productIndex, 1)[0];
  
  auditLog('product_deleted', 'admin', { 
    ip: req.ip, 
    productId: productId,
    productName: deletedProduct.name
  });
  
  res.json(deletedProduct);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Retro Clothing API server running on port ${PORT}`);
});