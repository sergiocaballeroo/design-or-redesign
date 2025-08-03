# design or redesign - E-commerce Fullstack

Tienda online de pantalones streetwear con administración completa.

## 🚀 Deployment en Render

### Paso 1: Preparar el código
```bash
# Construir el frontend
npm run build
```

### Paso 2: Subir a GitHub
1. Crear repositorio en GitHub
2. Subir el código del backend (carpeta `retro-clothing-backend`)

### Paso 3: Crear Web Service en Render
1. Ir a [render.com](https://render.com)
2. Crear cuenta / Login
3. Conectar GitHub
4. Crear **Web Service**
5. Seleccionar tu repositorio
6. Configurar:
   - **Name**: `designorredesign`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### Paso 4: Variables de Entorno
Agregar en Render:
- `NODE_ENV`: `production`
- `JWT_SECRET`: (generar automáticamente)
- `ADMIN_PASSWORD`: `admin123` (cambiar en producción)

### Paso 5: Deploy
- Hacer click en **Create Web Service**
- Esperar deployment (5-10 minutos)
- Tu sitio estará en: `https://designorredesign.onrender.com`

## 🔧 Funcionalidades

### Cliente
- ✅ Catálogo de productos responsivo
- ✅ Filtros por colección, corte, talla
- ✅ Carrito de compras
- ✅ Checkout vía WhatsApp
- ✅ Idiomas: Español/Inglés
- ✅ Diseño móvil optimizado

### Administrador
- ✅ Login seguro (Ctrl+Shift+A+D+M)
- ✅ Agregar/editar/eliminar productos
- ✅ Subir imágenes
- ✅ Gestión de inventario
- ✅ Base de datos SQLite

## 🛠️ Desarrollo Local

```bash
# Instalar dependencias
npm install

# Construir frontend
npm run build

# Iniciar servidor
npm start
```

- Frontend: http://localhost:3003
- API: http://localhost:3003/api
- Admin: Ctrl+Shift+A+D+M

## 📱 URLs de Producción

- **Sitio**: https://designorredesign.onrender.com
- **API**: https://designorredesign.onrender.com/api
- **Admin**: https://designorredesign.onrender.com (usar combinación de teclas)

## 🔐 Acceso Admin

- **Combinación**: `Ctrl+Shift+A+D+M`
- **Password**: `admin123` (cambiar en producción)

## 📦 Stack Tecnológico

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: SQLite
- **Hosting**: Render
- **Uploads**: Sistema de archivos local