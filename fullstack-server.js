const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3003;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here-change-in-production';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://designorredesign.onrender.com'] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (React build and uploads)
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database setup
const db = new sqlite3.Database('./products.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initDatabase();
  }
});

function initDatabase() {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    images TEXT,
    sizes TEXT,
    inStock BOOLEAN DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
}

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});

// Helper function to convert AWS S3 URLs to static URLs
const convertToStaticS3Url = (url) => {
  if (typeof url !== 'string') return url;
  
  if (url.includes('perxifotos.s3.us-east-2.amazonaws.com') && url.includes('X-Amz-')) {
    const match = url.match(/(https:\/\/perxifotos\.s3\.us-east-2\.amazonaws\.com\/[^?]+\.(jpeg|jpg|png|gif|webp))/i);
    if (match) {
      return match[1];
    }
  }
  return url;
};

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// API Routes

// Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { password } = req.body;
    
    if (password === ADMIN_PASSWORD) {
      const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, message: 'Login successful' });
    } else {
      res.status(401).json({ error: 'Invalid password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all products
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products ORDER BY createdAt DESC', (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    const products = rows.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images).map(convertToStaticS3Url) : [],
      sizes: product.sizes ? JSON.parse(product.sizes) : []
    }));
    
    res.json(products);
  });
});

// Add new product
app.post('/api/products', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    const { name, price, description, sizes } = req.body;
    
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => `/uploads/${file.filename}`);
    }
    
    const parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes || [];
    
    db.run(
      'INSERT INTO products (name, price, description, images, sizes) VALUES (?, ?, ?, ?, ?)',
      [name, parseFloat(price), description, JSON.stringify(images), JSON.stringify(parsedSizes)],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        res.status(201).json({
          id: this.lastID,
          name,
          price: parseFloat(price),
          description,
          images,
          sizes: parsedSizes,
          message: 'Product added successfully'
        });
      }
    );
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update product
app.put('/api/products/:id', authenticateToken, upload.array('images', 5), (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, sizes, keepExistingImages } = req.body;
    
    db.get('SELECT * FROM products WHERE id = ?', [id], (err, existingProduct) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!existingProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      let images = [];
      if (keepExistingImages === 'true') {
        images = existingProduct.images ? JSON.parse(existingProduct.images) : [];
      }
      
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => `/uploads/${file.filename}`);
        images = keepExistingImages === 'true' ? [...images, ...newImages] : newImages;
      }
      
      const parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes || [];
      
      db.run(
        'UPDATE products SET name = ?, price = ?, description = ?, images = ?, sizes = ? WHERE id = ?',
        [name, parseFloat(price), description, JSON.stringify(images), JSON.stringify(parsedSizes), id],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          
          res.json({
            id: parseInt(id),
            name,
            price: parseFloat(price),
            description,
            images,
            sizes: parsedSizes,
            message: 'Product updated successfully'
          });
        }
      );
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete product
app.delete('/api/products/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Fullstack server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api`);
});