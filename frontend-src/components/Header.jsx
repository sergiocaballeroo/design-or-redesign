import { useState, useEffect } from 'react'
import './Header.css'
import LanguageSwitcher from './LanguageSwitcher'
import { useTranslation } from '../utils/translations'

const Header = ({ cartItemsCount, onCartClick, showNavigation = true, onToggleSidebar, sidebarOpen, language = 'es', onLanguageChange, onGoToHome, onGoToCollection, currentView, onAdminAccess }) => {
  const { t } = useTranslation(language);
  const [logoTapCount, setLogoTapCount] = useState(0);
  const [tapTimer, setTapTimer] = useState(null);
  // Handle logo taps for mobile admin access
  const handleLogoTap = () => {
    if (tapTimer) {
      clearTimeout(tapTimer);
    }
    
    const newCount = logoTapCount + 1;
    setLogoTapCount(newCount);
    
    if (newCount === 7) {
      // 7 taps reached - trigger admin access
      setLogoTapCount(0);
      if (onAdminAccess) {
        onAdminAccess();
      }
      return;
    }
    
    // Reset counter after 2 seconds of no taps
    const timer = setTimeout(() => {
      setLogoTapCount(0);
    }, 2000);
    
    setTapTimer(timer);
  };
  
  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (tapTimer) {
        clearTimeout(tapTimer);
      }
    };
  }, [tapTimer]);

  const navItems = [
    { value: 'inicio', label: t('inicio'), action: onGoToHome },
    { value: 'coleccion', label: t('coleccion'), action: onGoToCollection },
    { value: 'nosotros', label: t('nosotros'), action: () => window.open('https://www.instagram.com/design.or.redesign/?igsh=ZXZpZ3g2bWJuNTR6', '_blank') },
    { value: 'contacto', label: t('contacto'), action: () => window.open(`https://wa.me/5215634596804?text=${encodeURIComponent(t('whatsappGeneral'))}`, '_blank') }
  ]

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          {onToggleSidebar && (
            <button 
              className="sidebar-toggle"
              onClick={onToggleSidebar}
              aria-label={sidebarOpen ? 'Cerrar filtros' : 'Abrir filtros'}
            >
              <span className={`hamburger ${sidebarOpen ? 'open' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          )}
          <div className="logo" onClick={handleLogoTap} style={{ cursor: 'pointer', userSelect: 'none' }}>
            <h1>design or redesign</h1>
          </div>
        </div>
        
        {showNavigation && (
          <nav className="navigation">
            {navItems.map(item => (
              <button
                key={item.value}
                className="nav-button"
                onClick={item.action}
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}

        <div className="cart-section">
          <LanguageSwitcher 
            currentLanguage={language}
            onLanguageChange={onLanguageChange}
          />
          <button className="cart-button" onClick={onCartClick}>
            <span className="cart-icon">□</span>
            <span className="cart-text">{t('cart')}</span>
            {cartItemsCount > 0 && (
              <span className="cart-count">{cartItemsCount}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header