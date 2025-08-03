const http = require('http');
const url = require('url');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

// Crear/conectar a la base de datos
const dbPath = path.join(__dirname, 'products.db');
const db = new sqlite3.Database(dbPath);

// Crear directorio para imágenes
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Función simplificada para procesar uploads multipart
const parseMultipart = (req) => {
  return new Promise((resolve, reject) => {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('multipart/form-data')) {
      reject(new Error('No multipart data'));
      return;
    }

    const boundary = contentType.split('boundary=')[1];
    if (!boundary) {
      reject(new Error('No boundary found'));
      return;
    }

    let buffer = Buffer.alloc(0);
    req.on('data', chunk => {
      buffer = Buffer.concat([buffer, chunk]);
    });

    req.on('end', () => {
      try {
        const boundaryBuffer = Buffer.from(`--${boundary}`);
        const parts = [];
        let start = 0;
        
        while (true) {
          const boundaryIndex = buffer.indexOf(boundaryBuffer, start);
          if (boundaryIndex === -1) break;
          
          const nextBoundaryIndex = buffer.indexOf(boundaryBuffer, boundaryIndex + boundaryBuffer.length);
          if (nextBoundaryIndex === -1) break;
          
          const part = buffer.slice(boundaryIndex + boundaryBuffer.length, nextBoundaryIndex);
          const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'));
          
          if (headerEnd !== -1) {
            const headers = part.slice(0, headerEnd).toString();
            const content = part.slice(headerEnd + 4);
            
            if (headers.includes('filename=')) {
              const filenameMatch = headers.match(/filename="([^"]+)"/);
              if (filenameMatch) {
                parts.push({
                  filename: filenameMatch[1],
                  buffer: content.slice(0, content.length - 2) // Remove trailing \r\n
                });
              }
            }
          }
          
          start = nextBoundaryIndex;
        }
        
        resolve(parts);
      } catch (error) {
        reject(error);
      }
    });
  });
};

// Crear tabla de productos si no existe
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    images TEXT NOT NULL,
    description TEXT,
    sizes TEXT NOT NULL,
    inStock BOOLEAN DEFAULT 1,
    material TEXT,
    care TEXT,
    origin TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insertar productos iniciales solo si la tabla está vacía
  db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
    if (row.count === 0) {
      const initialProducts = [
        {
          name: "Vintage Denim Jacket",
          price: 89.99,
          category: "jackets",
          images: JSON.stringify(["/api/placeholder/400/500", "/api/placeholder/400/500?2"]),
          description: "Classic 80s inspired denim jacket with authentic vintage wash.",
          sizes: JSON.stringify(["S", "M", "L", "XL"]),
          material: "100% Cotton Denim",
          care: "Machine wash cold",
          origin: "Made in Portugal"
        },
        {
          name: "Retro Turtleneck",
          price: 45.99,
          category: "tops",
          images: JSON.stringify(["/api/placeholder/400/500?4"]),
          description: "Minimalist turtleneck in earthy tones, perfect for layering.",
          sizes: JSON.stringify(["XS", "S", "M", "L"]),
          material: "70% Wool, 30% Cashmere",
          care: "Hand wash only",
          origin: "Made in Italy"
        },
        {
          name: "Wide Leg Trousers",
          price: 67.99,
          category: "bottoms",
          images: JSON.stringify(["/api/placeholder/400/500?6"]),
          description: "High-waisted wide leg trousers with vintage silhouette.",
          sizes: JSON.stringify(["S", "M", "L", "XL"]),
          material: "65% Polyester, 35% Viscose",
          care: "Machine wash gentle",
          origin: "Made in Turkey"
        }
      ];

      const stmt = db.prepare(`INSERT INTO products 
        (name, price, category, images, description, sizes, material, care, origin) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      
      initialProducts.forEach(product => {
        stmt.run(
          product.name, product.price, product.category, product.images,
          product.description, product.sizes, product.material, product.care, product.origin
        );
      });
      stmt.finalize();
      console.log('✅ Initial products loaded');
    }
  });
});

// Función para convertir URLs temporales de S3 a URLs estáticas
const convertToStaticS3Url = (url) => {
  if (typeof url !== 'string') return url;
  
  // Si es una URL de S3 temporal (con tokens), convertir a estática
  if (url.includes('perxifotos.s3.us-east-2.amazonaws.com') && url.includes('X-Amz-')) {
    // Extraer solo la parte de la URL hasta el .jpeg/.jpg/.png
    const match = url.match(/(https:\/\/perxifotos\.s3\.us-east-2\.amazonaws\.com\/[^?]+\.(jpeg|jpg|png|gif|webp))/i);
    if (match) {
      return match[1];
    }
  }
  
  return url;
};

// Función para convertir row de DB a formato producto
const formatProduct = (row) => ({
  id: row.id,
  name: row.name,
  price: row.price,
  category: row.category,
  images: JSON.parse(row.images).map(convertToStaticS3Url),
  description: row.description,
  sizes: JSON.parse(row.sizes),
  inStock: !!row.inStock,
  details: {
    material: row.material,
    care: row.care,
    origin: row.origin
  }
});

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  console.log(`${req.method} ${path}`);

  // POST /api/upload - Subir imagen (versión simplificada)
  if (path === '/api/upload' && req.method === 'POST') {
    console.log('Upload request received');
    console.log('Content-Type:', req.headers['content-type']);
    
    if (!req.headers['content-type'] || !req.headers['content-type'].includes('multipart/form-data')) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Content-Type debe ser multipart/form-data' }));
      return;
    }

    try {
      const files = await parseMultipart(req);
      console.log('Files parsed:', files.length);
      
      if (files.length === 0) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'No file uploaded' }));
        return;
      }

      const file = files[0];
      console.log('Processing file:', file.filename);
      
      const timestamp = Date.now();
      const ext = path.extname(file.filename) || '.jpg';
      const filename = `product_${timestamp}${ext}`;
      const filepath = path.join(uploadsDir, filename);

      await writeFile(filepath, file.buffer);
      console.log('File saved to:', filepath);

      const imageUrl = `/uploads/${filename}`;
      res.writeHead(200);
      res.end(JSON.stringify({ 
        url: imageUrl,
        filename: filename,
        message: 'File uploaded successfully' 
      }));
    } catch (error) {
      console.error('Upload error:', error);
      console.error('Error stack:', error.stack);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Upload failed: ' + error.message }));
    }
  }
  
  // GET /api/placeholder/:size - Generar placeholder dinámico
  else if (path.startsWith('/api/placeholder/') && req.method === 'GET') {
    const params = path.split('/');
    const size = params[3] || '400/500';
    const [width, height] = size.split('/').map(Number);
    const w = width || 400;
    const h = height || 500;
    
    // Crear SVG placeholder
    const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#999" text-anchor="middle" dy=".3em">
        ${w}×${h}
      </text>
    </svg>`;
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.writeHead(200);
    res.end(svg);
  }

  // GET /uploads/:filename - Servir imágenes
  else if (path.startsWith('/uploads/') && req.method === 'GET') {
    const filename = path.split('/uploads/')[1];
    const filepath = path.join(uploadsDir, filename);
    
    if (fs.existsSync(filepath)) {
      const ext = path.extname(filename).toLowerCase();
      const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
      };
      
      res.setHeader('Content-Type', mimeTypes[ext] || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache 1 año
      
      const fileStream = fs.createReadStream(filepath);
      fileStream.pipe(res);
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Image not found' }));
    }
  }

  // GET /api/products - Obtener productos con filtrado opcional
  else if (path === '/api/products' && req.method === 'GET') {
    const { category } = parsedUrl.query;
    let query = 'SELECT * FROM products';
    let params = [];
    
    if (category && category !== 'all') {
      query += ' WHERE category = ?';
      params.push(category);
    }
    
    db.all(query, params, (err, rows) => {
      if (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Database error' }));
        return;
      }
      const products = rows.map(formatProduct);
      res.writeHead(200);
      res.end(JSON.stringify(products));
    });
  }
  
  // GET /api/products/:id - Obtener producto específico
  else if (path.startsWith('/api/products/') && req.method === 'GET') {
    const id = parseInt(path.split('/')[3]);
    db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
      if (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Database error' }));
        return;
      }
      if (row) {
        res.writeHead(200);
        res.end(JSON.stringify(formatProduct(row)));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Product not found' }));
      }
    });
  }
  
  // POST /api/admin/login - Login de admin
  else if (path === '/api/admin/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { username, password } = JSON.parse(body);
        
        if (username === 'admin' && password === 'admin1234') {
          res.writeHead(200);
          res.end(JSON.stringify({ 
            token: 'admin-token-' + Date.now(),
            message: 'Login successful' 
          }));
        } else {
          res.writeHead(401);
          res.end(JSON.stringify({ error: 'Credenciales incorrectas' }));
        }
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  }
  
  // POST /api/admin/products - Crear nuevo producto
  else if (path === '/api/admin/products' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const productData = JSON.parse(body);
        console.log('Creating product:', productData);
        
        const stmt = db.prepare(`INSERT INTO products 
          (name, price, category, images, description, sizes, material, care, origin) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        
        stmt.run(
          productData.name,
          productData.price,
          productData.category,
          JSON.stringify(productData.images),
          productData.description,
          JSON.stringify(productData.sizes),
          productData.details?.material || '',
          productData.details?.care || '',
          productData.details?.origin || '',
          function(err) {
            if (err) {
              res.writeHead(500);
              res.end(JSON.stringify({ error: 'Database error' }));
              return;
            }
            
            // Obtener el producto recién creado
            db.get('SELECT * FROM products WHERE id = ?', [this.lastID], (err, row) => {
              if (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Database error' }));
                return;
              }
              res.writeHead(201);
              res.end(JSON.stringify(formatProduct(row)));
            });
          }
        );
        stmt.finalize();
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  }
  
  // PUT /api/admin/products/:id - Actualizar producto
  else if (path.startsWith('/api/admin/products/') && req.method === 'PUT') {
    const id = parseInt(path.split('/')[4]);
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const productData = JSON.parse(body);
        
        const stmt = db.prepare(`UPDATE products SET 
          name = ?, price = ?, category = ?, images = ?, description = ?, 
          sizes = ?, material = ?, care = ?, origin = ?
          WHERE id = ?`);
        
        stmt.run(
          productData.name,
          productData.price,
          productData.category,
          JSON.stringify(productData.images),
          productData.description,
          JSON.stringify(productData.sizes),
          productData.details?.material || '',
          productData.details?.care || '',
          productData.details?.origin || '',
          id,
          function(err) {
            if (err) {
              res.writeHead(500);
              res.end(JSON.stringify({ error: 'Database error' }));
              return;
            }
            
            if (this.changes === 0) {
              res.writeHead(404);
              res.end(JSON.stringify({ error: 'Product not found' }));
              return;
            }
            
            // Obtener el producto actualizado
            db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
              if (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Database error' }));
                return;
              }
              res.writeHead(200);
              res.end(JSON.stringify(formatProduct(row)));
            });
          }
        );
        stmt.finalize();
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  }
  
  // DELETE /api/admin/products/:id - Eliminar producto
  else if (path.startsWith('/api/admin/products/') && req.method === 'DELETE') {
    const id = parseInt(path.split('/')[4]);
    
    const stmt = db.prepare('DELETE FROM products WHERE id = ?');
    stmt.run(id, function(err) {
      if (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Database error' }));
        return;
      }
      
      if (this.changes === 0) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Product not found' }));
        return;
      }
      
      res.writeHead(200);
      res.end(JSON.stringify({ message: 'Product deleted' }));
    });
    stmt.finalize();
  }
  
  // GET /health - Health check
  else if (path === '/health' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'OK', message: 'Server running with SQLite!' }));
  }
  
  // 404 - Not found
  else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

const PORT = 3003;
server.listen(PORT, () => {
  console.log(`✅ SQLite server running on http://localhost:${PORT}`);
  console.log(`📦 Database: ${dbPath}`);
  console.log('🔥 Products persist between restarts!');
});

// Cerrar la base de datos correctamente al terminar
process.on('SIGINT', () => {
  console.log('\n🔄 Closing database connection...');
  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err.message);
    } else {
      console.log('✅ Database connection closed.');
    }
    process.exit(0);
  });
});