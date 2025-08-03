import express from 'express';
import cors from 'cors';
import path from 'path';
import { promises as fs } from 'fs';
import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3003;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here-change-in-production';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
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

// Database initialization
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        description TEXT,
        images TEXT,
        sizes TEXT,
        instock BOOLEAN DEFAULT true,
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('PostgreSQL database initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Initialize database on startup
initDatabase();

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
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY createdat DESC');
    
    const products = result.rows.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images).map(convertToStaticS3Url) : [],
      sizes: product.sizes ? JSON.parse(product.sizes) : [],
      inStock: product.instock // Map database field to frontend expected field
    }));
    
    res.json(products);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const product = {
      ...result.rows[0],
      images: result.rows[0].images ? JSON.parse(result.rows[0].images).map(convertToStaticS3Url) : [],
      sizes: result.rows[0].sizes ? JSON.parse(result.rows[0].sizes) : [],
      inStock: result.rows[0].instock // Map database field to frontend expected field
    };
    
    res.json(product);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Add new product
app.post('/api/products', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    const { name, price, description, sizes, images: manualImages, inStock = true } = req.body;
    
    let images = [];
    
    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => `/uploads/${file.filename}`);
    }
    
    // Handle manual S3 URLs (from admin input)
    if (manualImages && manualImages.length > 0) {
      const parsedManualImages = typeof manualImages === 'string' ? JSON.parse(manualImages) : manualImages;
      images = [...images, ...parsedManualImages];
    }
    
    const parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes || [];
    
    const result = await pool.query(
      'INSERT INTO products (name, price, description, images, sizes, instock) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, parseFloat(price), description, JSON.stringify(images), JSON.stringify(parsedSizes), inStock]
    );
    
    const product = {
      ...result.rows[0],
      images,
      sizes: parsedSizes,
      inStock: result.rows[0].instock // Map database field to frontend expected field
    };
    
    res.status(201).json({
      ...product,
      message: 'Product added successfully'
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update product
app.put('/api/products/:id', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, sizes, keepExistingImages, images: manualImages } = req.body;
    
    const existingResult = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const existingProduct = existingResult.rows[0];
    
    let images = [];
    if (keepExistingImages === 'true') {
      images = existingProduct.images ? JSON.parse(existingProduct.images) : [];
    }
    
    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      images = keepExistingImages === 'true' ? [...images, ...newImages] : newImages;
    }
    
    // Handle manual S3 URLs (from admin input)
    if (manualImages && manualImages.length > 0) {
      const parsedManualImages = typeof manualImages === 'string' ? JSON.parse(manualImages) : manualImages;
      if (keepExistingImages === 'true') {
        images = [...images, ...parsedManualImages];
      } else {
        images = parsedManualImages;
      }
    }
    
    const parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes || [];
    
    // Handle inStock field if provided
    const inStockValue = req.body.inStock !== undefined ? req.body.inStock : existingProduct.instock;
    
    const result = await pool.query(
      'UPDATE products SET name = $1, price = $2, description = $3, images = $4, sizes = $5, instock = $6 WHERE id = $7 RETURNING *',
      [name, parseFloat(price), description, JSON.stringify(images), JSON.stringify(parsedSizes), inStockValue, id]
    );
    
    const product = {
      ...result.rows[0],
      images,
      sizes: parsedSizes,
      inStock: result.rows[0].instock // Map database field to frontend expected field
    };
    
    res.json({
      ...product,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update product stock status
app.patch('/api/products/:id/stock', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { inStock } = req.body;
    
    const result = await pool.query(
      'UPDATE products SET instock = $1 WHERE id = $2 RETURNING *',
      [inStock, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const product = {
      ...result.rows[0],
      images: result.rows[0].images ? JSON.parse(result.rows[0].images).map(convertToStaticS3Url) : [],
      sizes: result.rows[0].sizes ? JSON.parse(result.rows[0].sizes) : [],
      inStock: result.rows[0].instock
    };
    
    res.json({
      ...product,
      message: 'Stock status updated successfully'
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete product
app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'PostgreSQL'
  });
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
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await pool.end();
  console.log('Database connection closed.');
  process.exit(0);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 PostgreSQL Fullstack server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api`);
  console.log(`🗄️ Database: PostgreSQL`);
});