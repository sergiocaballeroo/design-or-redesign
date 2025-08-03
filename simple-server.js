const http = require('http');
const url = require('url');

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
    images: ["/api/placeholder/400/500?4"],
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

const server = http.createServer((req, res) => {
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

  if (path === '/api/products' && req.method === 'GET') {
    const { category } = parsedUrl.query;
    let filteredProducts = products;
    
    if (category && category !== 'all') {
      filteredProducts = products.filter(product => product.category === category);
    }
    
    res.writeHead(200);
    res.end(JSON.stringify(filteredProducts));
  } else if (path.startsWith('/api/products/') && req.method === 'GET') {
    const id = parseInt(path.split('/')[3]);
    const product = products.find(p => p.id === id);
    if (product) {
      res.writeHead(200);
      res.end(JSON.stringify(product));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Product not found' }));
    }
  } else if (path === '/api/admin/login' && req.method === 'POST') {
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
  } else if (path === '/api/admin/products' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const productData = JSON.parse(body);
        const newProduct = {
          id: Math.max(...products.map(p => p.id)) + 1,
          ...productData
        };
        products.push(newProduct);
        res.writeHead(201);
        res.end(JSON.stringify(newProduct));
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else if (path.startsWith('/api/admin/products/') && req.method === 'PUT') {
    const id = parseInt(path.split('/')[4]);
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const productData = JSON.parse(body);
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
          products[index] = { ...products[index], ...productData };
          res.writeHead(200);
          res.end(JSON.stringify(products[index]));
        } else {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Product not found' }));
        }
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else if (path.startsWith('/api/admin/products/') && req.method === 'DELETE') {
    const id = parseInt(path.split('/')[4]);
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products.splice(index, 1);
      res.writeHead(200);
      res.end(JSON.stringify({ message: 'Product deleted' }));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Product not found' }));
    }
  } else if (path === '/health' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'OK', message: 'Server running!' }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

const PORT = 3003;
server.listen(PORT, () => {
  console.log(`✅ Pure Node.js server running on http://localhost:${PORT}`);
  console.log(`📦 ${products.length} products ready`);
  console.log('🔥 No dependencies, just pure Node.js');
});