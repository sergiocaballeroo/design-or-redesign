import { useState } from 'react'
import './ProductGrid.css'
import { useTranslation } from '../utils/translations'
import { API_BASE_URL } from '../config/api'

const ProductCard = ({ product, onAddToCart, onProductClick, language = 'es' }) => {
  const { translateProduct, t } = useTranslation(language);
  const [selectedSize, setSelectedSize] = useState('')
  const [showSizes, setShowSizes] = useState(false)

  const handleAddToCart = () => {
    if (selectedSize && product.inStock) {
      onAddToCart(product, selectedSize)
      setSelectedSize('')
      setShowSizes(false)
    }
  }

  return (
    <div className="product-card">
      <div 
        className="product-image"
        onClick={() => onProductClick(product.id)}
      >
        
        {product.images && product.images.length > 0 ? (
          <img 
            src={product.images[0].startsWith('http') 
              ? `${product.images[0]}?t=${Date.now()}` 
              : `${API_BASE_URL}${product.images[0]}?t=${Date.now()}`}
            alt={product.name}
            className="product-img"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div className="placeholder-image" style={{ display: product.images && product.images.length > 0 ? 'none' : 'flex' }}>
          <span>{product.name.split(' ')[0]}</span>
        </div>
        {product.images && product.images.length > 1 && (
          <div className="image-count">
            +{product.images.length - 1}
          </div>
        )}
        {!product.inStock && <div className="out-of-stock">{translateProduct('agotado')}</div>}
        <div className="view-details-overlay">
          <span>{t('verDetalles')}</span>
        </div>
      </div>
      
      <div className="product-info">
        <h3 
          className="product-name clickable"
          onClick={() => onProductClick(product.id)}
        >
          {translateProduct(product.name)}
        </h3>
        <p className="product-price">${product.price}</p>
        <p className="product-description">{translateProduct(product.description)}</p>
        
        {product.inStock && (
          <div className="product-actions">
            {!showSizes ? (
              <button 
                className="select-size-button"
                onClick={() => setShowSizes(true)}
              >
                {t('seleccionarTalla')}
              </button>
            ) : (
              <div className="size-selection">
                <div className="sizes">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      className={`size-button ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <div className="action-buttons">
                  <button 
                    className="add-to-cart-button"
                    onClick={handleAddToCart}
                    disabled={!selectedSize}
                  >
                    {t('agregarCarrito')}
                  </button>
                  <button 
                    className="cancel-button"
                    onClick={() => {
                      setShowSizes(false)
                      setSelectedSize('')
                    }}
                  >
                    {t('cancelar') || 'Cancelar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const ProductGrid = ({ products, onAddToCart, onProductClick, language = 'es' }) => {
  const { t } = useTranslation(language);
  return (
    <div className="product-grid">
      <div className="grid-container">
        {products.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onAddToCart={onAddToCart}
            onProductClick={onProductClick}
            language={language}
          />
        ))}
      </div>
      
      {products.length === 0 && (
        <div className="empty-state">
          <p>{language === 'es' ? 'No se encontraron productos' : 'No products found'}</p>
        </div>
      )}
    </div>
  )
}

export default ProductGrid