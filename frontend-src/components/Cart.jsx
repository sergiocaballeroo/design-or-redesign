import './Cart.css'
import { useTranslation } from '../utils/translations'

const Cart = ({ isOpen, onClose, items, onRemoveItem, onUpdateQuantity, language = 'es' }) => {
  const { t, translateProduct } = useTranslation(language);
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const handleWhatsAppCheckout = (cartItems, totalAmount) => {
    if (cartItems.length === 0) return;

    const currency = '$'; // Puedes cambiar a MXN si prefieres
    const phoneNumber = '5215634596804'; // Tu número de WhatsApp
    
    const orderDetails = cartItems.map(item => 
      `• ${translateProduct(item.name)}\n  Talla: ${item.size} | Cantidad: ${item.quantity} | ${currency}${(item.price * item.quantity).toFixed(2)}`
    ).join('\n\n');

    const message = language === 'es' ? `
🛍️ ¡Hola! Quiero realizar este pedido:

${orderDetails}

💰 TOTAL: ${currency}${totalAmount.toFixed(2)}

¿Podrías confirmar disponibilidad y método de pago?

¡Gracias!
    `.trim() : `
🛍️ Hello! I want to place this order:

${orderDetails}

💰 TOTAL: ${currency}${totalAmount.toFixed(2)}

Could you confirm availability and payment method?

Thank you!
    `.trim();

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }

  if (!isOpen) return null

  return (
    <div className="cart-overlay">
      <div className="cart-sidebar">
        <div className="cart-header">
          <h2>{t('carrito')}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="cart-content">
          {items.length === 0 ? (
            <div className="empty-cart">
              <p>{t('carritoVacio')}</p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {items.map((item, index) => (
                  <div key={`${item.id}-${item.size}-${index}`} className="cart-item">
                    <div className="item-info">
                      <h4>{translateProduct(item.name)}</h4>
                      <p className="item-details">{language === 'es' ? 'Talla' : 'Size'}: {item.size}</p>
                      <p className="item-price">${item.price}</p>
                    </div>
                    
                    <div className="item-controls">
                      <div className="quantity-controls">
                        <button 
                          onClick={() => onUpdateQuantity(item.id, item.size, item.quantity - 1)}
                          className="quantity-button"
                        >
                          −
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item.id, item.size, item.quantity + 1)}
                          className="quantity-button"
                        >
                          +
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => onRemoveItem(item.id, item.size)}
                        className="remove-button"
                      >
                        {t('eliminar')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-footer">
                <div className="cart-total">
                  <h3>{t('total')}: ${total.toFixed(2)}</h3>
                </div>
                <button 
                  className="checkout-button"
                  onClick={() => handleWhatsAppCheckout(items, total)}
                >
                  {t('checkoutWhatsApp')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Cart