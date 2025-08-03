import './StockIndicator.css'
import { useTranslation } from '../utils/translations'

const StockIndicator = ({ stock, lowStockThreshold = 3, language = 'es', className = '' }) => {
  const { t } = useTranslation(language)
  
  if (stock === undefined || stock === null || stock > lowStockThreshold) return null
  
  const isOutOfStock = stock <= 0
  const isLowStock = stock <= lowStockThreshold && stock > 0
  
  if (isOutOfStock) {
    return (
      <div className={`stock-indicator out-of-stock ${className}`}>
        <span className="stock-dot"></span>
        <span className="stock-text">{t('agotado')}</span>
      </div>
    )
  }
  
  if (isLowStock) {
    return (
      <div className={`stock-indicator low-stock ${className}`}>
        <span className="stock-dot"></span>
        <span className="stock-text">Solo {stock} disponibles</span>
      </div>
    )
  }
  
  return null
}

export default StockIndicator