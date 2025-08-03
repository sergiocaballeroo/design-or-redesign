import './StockIndicator.css'
import { useTranslation } from '../utils/translations'

const StockIndicator = ({ stock, lowStockThreshold = 5, language = 'es' }) => {
  const { t } = useTranslation(language)
  
  if (stock === undefined || stock === null) return null
  
  const isLowStock = stock <= lowStockThreshold && stock > 0
  const isOutOfStock = stock <= 0
  
  const getStockStatus = () => {
    if (isOutOfStock) {
      return {
        text: t('agotado'),
        className: 'out-of-stock',
        icon: '❌'
      }
    }
    
    if (isLowStock) {
      return {
        text: `${t('ultimasPiezas')} (${stock})`,
        className: 'low-stock',
        icon: '⚠️'
      }
    }
    
    return {
      text: t('disponible'),
      className: 'in-stock',
      icon: '✅'
    }
  }
  
  const status = getStockStatus()
  
  return (
    <div className={`stock-indicator ${status.className}`}>
      <span className="stock-icon">{status.icon}</span>
      <span className="stock-text">{status.text}</span>
      {isLowStock && (
        <div className="urgency-pulse" />
      )}
    </div>
  )
}

export default StockIndicator