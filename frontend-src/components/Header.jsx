import './Header.css'
import LanguageSwitcher from './LanguageSwitcher'
import { useTranslation } from '../utils/translations'

const Header = ({ cartItemsCount, onCartClick, showNavigation = true, onToggleSidebar, sidebarOpen, language = 'es', onLanguageChange, onGoToHome, onGoToCollection, currentView }) => {
  const { t } = useTranslation(language);
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
          <div className="logo">
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