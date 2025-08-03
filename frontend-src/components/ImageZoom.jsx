import { useState } from 'react'
import './ImageZoom.css'

const ImageZoom = ({ src, alt, className = '' }) => {
  const [showModal, setShowModal] = useState(false)

  const handleClick = () => {
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  return (
    <>
      <div className={`image-zoom-container ${className}`}>
        <img
          src={src}
          alt={alt}
          className="zoomable-image"
          onClick={handleClick}
        />
        
        {/* Indicador de zoom sutil */}
        <div className="zoom-indicator">
          <span className="zoom-icon">🔍</span>
        </div>
      </div>

      {/* Modal simple para ampliar */}
      {showModal && (
        <div className="zoom-modal" onClick={closeModal}>
          <div className="zoom-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="zoom-modal-close" onClick={closeModal}>
              ×
            </button>
            <img
              src={src}
              alt={`${alt} - Ampliada`}
              className="zoom-modal-image"
            />
          </div>
        </div>
      )}
    </>
  )
}

export default ImageZoom