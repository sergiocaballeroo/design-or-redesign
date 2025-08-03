import { useState, useRef, useEffect } from 'react'
import './ImageZoom.css'

const ImageZoom = ({ src, alt, className = '' }) => {
  const [isZoomed, setIsZoomed] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showZoomedImage, setShowZoomedImage] = useState(false)
  const imageRef = useRef(null)
  const zoomedImageRef = useRef(null)

  const handleMouseEnter = () => {
    setIsZoomed(true)
    setShowZoomedImage(true)
  }

  const handleMouseLeave = () => {
    setIsZoomed(false)
    setShowZoomedImage(false)
  }

  const handleMouseMove = (e) => {
    if (!imageRef.current) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setMousePosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) })
  }

  const handleClick = () => {
    // Abrir imagen en modal para móviles
    setShowZoomedImage(!showZoomedImage)
  }

  // Cerrar modal con ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowZoomedImage(false)
      }
    }

    if (showZoomedImage) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [showZoomedImage])

  return (
    <div className={`image-zoom-container ${className}`}>
      <div 
        className="image-zoom-wrapper"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          className={`zoomable-image ${isZoomed ? 'zoomed' : ''}`}
        />
        
        {/* Cursor de zoom en desktop */}
        {isZoomed && (
          <div 
            className="zoom-cursor"
            style={{
              left: `${mousePosition.x}%`,
              top: `${mousePosition.y}%`,
            }}
          />
        )}

        {/* Indicador de zoom */}
        <div className="zoom-indicator">
          <span className="zoom-icon">🔍</span>
          <span className="zoom-text">Haz click para ampliar</span>
        </div>
      </div>

      {/* Imagen ampliada para desktop */}
      {isZoomed && showZoomedImage && (
        <div className="zoomed-image-container desktop-zoom">
          <img
            ref={zoomedImageRef}
            src={src}
            alt={`${alt} - Ampliada`}
            className="zoomed-image"
            style={{
              transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
            }}
          />
        </div>
      )}

      {/* Modal de imagen para móviles */}
      {showZoomedImage && (
        <div className="zoom-modal mobile-zoom" onClick={() => setShowZoomedImage(false)}>
          <div className="zoom-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="zoom-modal-close"
              onClick={() => setShowZoomedImage(false)}
            >
              ×
            </button>
            <img
              src={src}
              alt={`${alt} - Ampliada`}
              className="zoom-modal-image"
            />
            <div className="zoom-controls">
              <span>Pellizca para hacer zoom</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageZoom