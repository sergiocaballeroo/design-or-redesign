import './Footer.css'
import { useTranslation } from '../utils/translations'

const Footer = ({ language = 'es' }) => {
  const { t } = useTranslation(language);
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>design or redesign</h3>
          <p>{t('brandDescription')}</p>
        </div>
        
        <div className="footer-section">
          <h4>{t('tienda')}</h4>
          <ul>
            <li><button onClick={() => window.scrollTo(0, 0)}>{t('nuevosLanzamientos')}</button></li>
            <li><button onClick={() => window.scrollTo(0, 0)}>{t('camisetas')}</button></li>
            <li><button onClick={() => window.scrollTo(0, 0)}>{t('pantalones')}</button></li>
            <li><button onClick={() => window.scrollTo(0, 0)}>{t('chaquetas')}</button></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>{t('soporte')}</h4>
          <ul>
            <li><button onClick={() => window.open(`https://wa.me/5215634596804?text=${encodeURIComponent(t('whatsappSizeGuide'))}`, '_blank')}>{t('guiaTallas')}</button></li>
            <li><button onClick={() => window.open(`https://wa.me/5215634596804?text=${encodeURIComponent(t('whatsappReturns'))}`, '_blank')}>{t('devoluciones')}</button></li>
            <li><button onClick={() => window.open(`https://wa.me/5215634596804?text=${encodeURIComponent(t('whatsappContact'))}`, '_blank')}>{t('contacto')}</button></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>{t('conecta')}</h4>
          <ul>
            <li><button onClick={() => window.open('https://www.instagram.com/design.or.redesign/?igsh=ZXZpZ3g2bWJuNTR6', '_blank')}>Instagram</button></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2024 design or redesign. {t('derechosReservados')}</p>
      </div>
    </footer>
  )
}

export default Footer