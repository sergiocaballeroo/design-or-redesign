import './LanguageSwitcher.css'

const LanguageSwitcher = ({ currentLanguage, onLanguageChange }) => {
  return (
    <div className="language-switcher">
      <button 
        className={`lang-btn ${currentLanguage === 'es' ? 'active' : ''}`}
        onClick={() => onLanguageChange('es')}
      >
        ES
      </button>
      <span className="lang-separator">|</span>
      <button 
        className={`lang-btn ${currentLanguage === 'en' ? 'active' : ''}`}
        onClick={() => onLanguageChange('en')}
      >
        EN
      </button>
    </div>
  )
}

export default LanguageSwitcher