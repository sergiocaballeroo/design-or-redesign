import { useState } from 'react'
import './ImageUpload.css'
import { API_BASE_URL } from '../config/api'

const ImageUpload = ({ onImageUploaded, token }) => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [dragActive, setDragActive] = useState(false)

  const handleFileUpload = async (files) => {
    const file = files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Tipo de archivo no válido. Use JPG, PNG o WebP.')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('El archivo es demasiado grande. Máximo 5MB.')
      return
    }

    setIsUploading(true)
    setUploadError('')

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        onImageUploaded(`${API_BASE_URL}${data.url}`)
      } else {
        setUploadError(data.error || 'Error al subir la imagen')
      }
    } catch (error) {
      setUploadError('Error de conexión al subir la imagen')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    const files = Array.from(e.dataTransfer.files)
    handleFileUpload(files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    handleFileUpload(files)
  }

  return (
    <div className="image-upload-container">
      <div 
        className={`upload-zone ${dragActive ? 'drag-active' : ''} ${isUploading ? 'uploading' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {isUploading ? (
          <div className="upload-loading">
            <div className="spinner"></div>
            <p>Subiendo imagen...</p>
          </div>
        ) : (
          <>
            <div className="upload-icon">📁</div>
            <p className="upload-text">
              Arrastra una imagen aquí o{' '}
              <label className="file-input-label">
                selecciona un archivo
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </label>
            </p>
            <p className="upload-info">
              Formatos: JPG, PNG, WebP • Máximo: 5MB
            </p>
          </>
        )}
      </div>
      
      {uploadError && (
        <div className="upload-error">
          {uploadError}
        </div>
      )}
    </div>
  )
}

export default ImageUpload