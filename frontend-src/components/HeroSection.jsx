import { useTranslation } from '../utils/translations'
import './HeroSection.css'

const HeroSection = ({ language = 'es', onViewCollection }) => {
  const { t } = useTranslation(language);

  const heroContent = {
    es: {
      title: "PANTALONES",
      subtitle: "QUE REDEFINEN",
      highlight: "TU ESTILO",
      description: "Cada corte cuenta una historia. Cada diseño es una declaración.",
      cta: "EXPLORAR COLECCIÓN"
    },
    en: {
      title: "PANTS THAT",
      subtitle: "REDEFINE",
      highlight: "YOUR STYLE", 
      description: "Every cut tells a story. Every design is a statement.",
      cta: "EXPLORE COLLECTION"
    }
  };

  const content = heroContent[language];

  return (
    <section className="hero-section">
      <div className="hero-background">
        <div className="hero-overlay"></div>
      </div>
      
      <div className="hero-content">
        <div className="hero-text">
          <div className="hero-title">
            <h1>
              <span className="title-line">{content.title}</span>
              <span className="subtitle-line">{content.subtitle}</span>
              <span className="highlight-line">{content.highlight}</span>
            </h1>
          </div>
          
          <p className="hero-description">{content.description}</p>
          
          <button className="hero-cta" onClick={onViewCollection}>
            {content.cta}
            <span className="cta-arrow">→</span>
          </button>
        </div>
        
        <div className="hero-visual">
          <div className="visual-element">
            <div className="logo-display">
              <img 
                src="/logo.png" 
                alt="design or redesign logo" 
                className="hero-logo-image"
              />
            </div>
          </div>
        </div>
      </div>
      
    </section>
  )
}

export default HeroSection