import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './ProductDetail.css'
import Header from './Header'
import ImageZoom from './ImageZoom'
import SizeGuide from './SizeGuide'
import { useTranslation } from '../utils/translations'
import { API_ENDPOINTS, API_BASE_URL } from '../config/api'

const ProductDetail = ({ productId, onBack, onAddToCart, cartItems, onCartClick, language = 'es' }) => {
  const navigate = useNavigate()
  const { t, translateProduct } = useTranslation(language);
  const [product, setProduct] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [showSizeGuide, setShowSizeGuide] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [productId])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_ENDPOINTS.products}/${productId}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Product data received:', data)
        setProduct(data)
      } else {
        console.error('Product not found:', response.status)
        setProduct(null)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (selectedSize && product && product.inStock) {
      for (let i = 0; i < quantity; i++) {
        onAddToCart(product, selectedSize)
      }
      setSelectedSize('')
      setQuantity(1)
    }
  }

  const nextImage = () => {
    const images = getProductImages()
    if (images && images.length > 0) {
      setSelectedImageIndex((prev) => 
        prev === images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    const images = getProductImages()
    if (images && images.length > 0) {
      setSelectedImageIndex((prev) => 
        prev === 0 ? images.length - 1 : prev - 1
      )
    }
  }

  const getProductImages = () => {
    if (!product) return []
    // Verificar si existe images array, sino usar image como string
    if (product.images && Array.isArray(product.images)) {
      return product.images
    } else if (product.image) {
      return [product.image]
    }
    return ['/api/placeholder/400/500']
  }

  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="loading-spinner"></div>
        <p>{t('cargandoProducto')}</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="product-detail-error">
        <h2>{t('productoNoEncontrado')}</h2>
        <button onClick={onBack} className="back-button">
          ← {t('volverCatalogo')}
        </button>
      </div>
    )
  }

  return (
    <div className="product-detail-page">
      <Header 
        cartItemsCount={cartItems ? cartItems.reduce((sum, item) => sum + item.quantity, 0) : 0}
        onCartClick={onCartClick}
        language={language}
        onLanguageChange={() => {}}
        onGoToHome={() => navigate('/')}
        onGoToCollection={() => navigate('/coleccion')}
        currentPath={window.location.pathname}
        onAdminAccess={() => {}}
        showNavigation={true}
      />
      
      <div className="product-detail">
        <div className="product-detail-header">
          <button onClick={() => navigate('/coleccion')} className="back-button">
            ← {t('volverCatalogo')}
          </button>
          <div className="breadcrumb">
            <button onClick={() => navigate('/')}>{t('inicio')}</button>
            <span>/</span>
            <button onClick={() => navigate('/coleccion')}>{translateProduct(product.category)}</button>
            <span>/</span>
            <span>{translateProduct(product.name)}</span>
          </div>
        </div>

      <div className="product-detail-content">
        <div className="product-images">
          <div className="main-image-container">
            <div className="main-image">
              {getProductImages().length > 0 ? (
                <ImageZoom
                  src={getProductImages()[selectedImageIndex].startsWith('http') 
                    ? `${getProductImages()[selectedImageIndex]}?t=${Date.now()}` 
                    : `${API_BASE_URL}${getProductImages()[selectedImageIndex]}?t=${Date.now()}`}
                  alt={`${product.name} - Imagen ${selectedImageIndex + 1}`}
                  className="detail-product-img"
                />
              ) : null}
              <div className="placeholder-image" style={{ display: getProductImages().length > 0 ? 'none' : 'flex' }}>
                <span>{product.name.split(' ')[0]}</span>
              </div>
              <div className="image-counter">
                {selectedImageIndex + 1} / {getProductImages().length}
              </div>
              
              {getProductImages().length > 1 && (
                <>
                  <button 
                    className="image-nav prev" 
                    onClick={prevImage}
                    aria-label="Imagen anterior"
                  >
                    ‹
                  </button>
                  <button 
                    className="image-nav next" 
                    onClick={nextImage}
                    aria-label="Siguiente imagen"
                  >
                    ›
                  </button>
                </>
              )}
            </div>
          </div>

          {getProductImages().length > 1 && (
            <div className="image-thumbnails">
              {getProductImages().map((image, index) => (
                <button
                  key={index}
                  className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img 
                    src={image.startsWith('http') ? image : `${API_BASE_URL}${image}`}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className="thumbnail-img"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                  <div className="thumbnail-placeholder" style={{ display: 'none' }}>
                    {index + 1}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-info">
          <div className="product-header">
            <h1>{translateProduct(product.name)}</h1>
            <p className="product-price">${product.price}</p>
            
            {!product.inStock && (
              <div className="out-of-stock-badge">{t('agotado')}</div>
            )}
          </div>

          <div className="product-description">
            <p>{translateProduct(product.description)}</p>
          </div>

          {product.details && (
            <div className="product-details">
              <h3>{t('detallesProducto')}</h3>
              <ul>
                <li><strong>{t('material')}:</strong> {translateProduct(product.details.material)}</li>
                <li><strong>{t('cuidado')}:</strong> {translateProduct(product.details.care)}</li>
                <li><strong>{t('origen')}:</strong> {translateProduct(product.details.origin)}</li>
              </ul>
            </div>
          )}

          <div className="size-selection">
            <div className="size-header">
              <h3>{t('seleccionarTalla')}</h3>
              <button 
                className="size-guide-button"
                onClick={() => setShowSizeGuide(true)}
              >
                📏 {t('guiaTallas')}
              </button>
            </div>
            <div className="sizes">
              {product.sizes && product.sizes.length > 0 ? product.sizes.map(size => (
                <button
                  key={size}
                  className={`size-button ${selectedSize === size ? 'selected' : ''} ${!product.inStock ? 'disabled' : ''}`}
                  onClick={() => product.inStock && setSelectedSize(size)}
                  disabled={!product.inStock}
                >
                  {size}
                </button>
              )) : (
                <p>{language === 'es' ? 'No hay tallas disponibles' : 'No sizes available'}</p>
              )}
            </div>
          </div>

          {product.inStock && (
            <div className="product-purchase">

              <div className="quantity-selection">
                <h3>{t('cantidad')}</h3>
                <div className="quantity-controls">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="quantity-button"
                  >
                    −
                  </button>
                  <span className="quantity-display">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="quantity-button"
                  >
                    +
                  </button>
                </div>
              </div>

              <button 
                className="add-to-cart-button"
                onClick={handleAddToCart}
                disabled={!selectedSize}
              >
                {selectedSize 
                  ? `${t('agregarCarrito')} ${quantity} - $${(product.price * quantity).toFixed(2)}`
                  : t('seleccionaTalla')
                }
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
      
      {/* Guía de tallas modal */}
      <SizeGuide
        isOpen={showSizeGuide}
        onClose={() => setShowSizeGuide(false)}
        category={product?.category === 'tops' ? 'tops' : 'bottoms'}
        language={language}
      />
    </div>
  )
}

export default ProductDetail