import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import ProductGrid from './components/ProductGrid'
import Cart from './components/Cart'
import Footer from './components/Footer'
import AdminPanel from './components/AdminPanel'
import ProductDetail from './components/ProductDetail'
import AdminLogin from './components/AdminLogin'
import Sidebar from './components/Sidebar'
import HeroSection from './components/HeroSection'
import { API_ENDPOINTS } from './config/api'

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [products, setProducts] = useState([])
  const [cartItems, setCartItems] = useState([])
  const [selectedFilters, setSelectedFilters] = useState({
    coleccion: 'Todos',
    corte: 'Todos', 
    talla: 'Todas'
  })
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken'))
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'es')

  // Verificar puerto correcto al cargar
  useEffect(() => {
    const currentPort = window.location.port;
    if (currentPort === '5175') {
      window.location.href = `http://localhost:5173${window.location.pathname}${window.location.search}`;
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [selectedFilters])


  const fetchProducts = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.products)
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }


  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const addToCart = (product, size) => {
    const existingItem = cartItems.find(item => 
      item.id === product.id && item.size === size
    )

    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.id === product.id && item.size === size
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCartItems([...cartItems, { ...product, size, quantity: 1 }])
    }
  }

  const removeFromCart = (productId, size) => {
    setCartItems(cartItems.filter(item => 
      !(item.id === productId && item.size === size)
    ))
  }

  const updateQuantity = (productId, size, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId, size)
    } else {
      setCartItems(cartItems.map(item =>
        item.id === productId && item.size === size
          ? { ...item, quantity: newQuantity }
          : item
      ))
    }
  }

  const handleProductClick = (productId) => {
    navigate(`/producto/${productId}`)
  }

  const handleBackToShop = () => {
    navigate('/coleccion')
    // Refrescar productos al volver del admin o producto detalle
    fetchProducts()
  }

  const handleGoToCollection = () => {
    navigate('/coleccion')
  }

  const handleGoToHome = () => {
    navigate('/')
  }

  const handleAdminAccess = () => {
    if (adminToken) {
      navigate('/admin')
    } else {
      setShowAdminLogin(true)
    }
  }

  const handleLoginSuccess = (token) => {
    setAdminToken(token)
    setShowAdminLogin(false)
    navigate('/admin')
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    setAdminToken(null)
    navigate('/coleccion')
  }

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage)
    localStorage.setItem('language', newLanguage)
  }

  const handleViewCollection = () => {
    navigate('/coleccion')
  }

  // Listener para combinación de teclas secreta (Ctrl+Shift+A+D+M)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyA') {
        const sequence = ['KeyD', 'KeyM']
        let index = 0
        
        const sequenceHandler = (event) => {
          if (event.code === sequence[index]) {
            index++
            if (index === sequence.length) {
              handleAdminAccess()
              document.removeEventListener('keydown', sequenceHandler)
            }
          } else {
            index = 0
            document.removeEventListener('keydown', sequenceHandler)
          }
        }
        
        document.addEventListener('keydown', sequenceHandler)
        setTimeout(() => {
          document.removeEventListener('keydown', sequenceHandler)
        }, 3000) // 3 segundos para completar la secuencia
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [adminToken])

  // Componente para la página de inicio
  const HomePage = () => (
    <div className="app">
      <Header 
        cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
        showNavigation={true}
        language={language}
        onLanguageChange={handleLanguageChange}
        onGoToHome={handleGoToHome}
        onGoToCollection={handleGoToCollection}
        currentPath={location.pathname}
        onAdminAccess={handleAdminAccess}
      />

      <HeroSection 
        language={language}
        onViewCollection={handleViewCollection}
      />

      <Cart 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={removeFromCart}
        onUpdateQuantity={updateQuantity}
        language={language}
      />

      <Footer language={language} />
      
      {showAdminLogin && (
        <AdminLogin 
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setShowAdminLogin(false)}
        />
      )}
    </div>
  )

  // Componente para la página de colección
  const CollectionPage = () => (
    <div className="app">
      <Header 
        cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        language={language}
        onLanguageChange={handleLanguageChange}
        onGoToHome={handleGoToHome}
        onGoToCollection={handleGoToCollection}
        currentPath={location.pathname}
        onAdminAccess={handleAdminAccess}
      />
      
      <div className="main-layout">
        <Sidebar 
          onFilterChange={handleFilterChange}
          selectedFilters={selectedFilters}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          language={language}
        />
        
        <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <ProductGrid 
            products={products} 
            onAddToCart={addToCart}
            onProductClick={handleProductClick}
            language={language}
          />
        </main>
      </div>

      <Cart 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={removeFromCart}
        onUpdateQuantity={updateQuantity}
        language={language}
      />

      <Footer language={language} />
      
      {showAdminLogin && (
        <AdminLogin 
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setShowAdminLogin(false)}
        />
      )}
    </div>
  )

  // Componente para la página de producto
  const ProductPage = () => {
    const productId = parseInt(location.pathname.split('/')[2])
    return (
      <div className="app">
        <ProductDetail 
          productId={productId}
          onBack={handleBackToShop}
          onAddToCart={addToCart}
          cartItems={cartItems}
          onCartClick={() => setIsCartOpen(true)}
          language={language}
          onLanguageChange={handleLanguageChange}
        />
      </div>
    )
  }

  // Componente para la página de admin
  const AdminPage = () => {
    if (!adminToken) {
      navigate('/')
      return null
    }
    
    return (
      <div className="app">
        <div className="admin-nav">
          <button 
            className="nav-back-btn"
            onClick={() => {
              navigate('/')
              fetchProducts() // Refrescar productos al salir del admin
            }}
          >
            ← Volver al Inicio
          </button>
          <button 
            className="logout-btn"
            onClick={handleLogout}
          >
            Cerrar Sesión
          </button>
        </div>
        <AdminPanel token={adminToken} />
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/coleccion" element={<CollectionPage />} />
      <Route path="/producto/:id" element={<ProductPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  )
}

export default App
