import { useState } from 'react'
import './SizeGuide.css'
import { useTranslation } from '../utils/translations'

const SizeGuide = ({ isOpen, onClose, category = 'bottoms', language = 'es' }) => {
  const { t } = useTranslation(language)
  const [selectedSize, setSelectedSize] = useState('')
  const [units, setUnits] = useState('cm') // cm o inches
  const [bodyMeasurements, setBodyMeasurements] = useState({
    chest: '',
    waist: '',
    hips: '',
    inseam: ''
  })
  const [recommendedSize, setRecommendedSize] = useState('')

  // Datos de tallas para diferentes categorías
  const sizeData = {
    bottoms: {
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      measurements: {
        XS: { waist: 70, hips: 90, inseam: 76 },
        S: { waist: 74, hips: 94, inseam: 78 },
        M: { waist: 78, hips: 98, inseam: 80 },
        L: { waist: 82, hips: 102, inseam: 82 },
        XL: { waist: 86, hips: 106, inseam: 84 },
        XXL: { waist: 90, hips: 110, inseam: 86 }
      },
      fitGuide: {
        XS: 'Ajuste muy ceñido - Para cintura de 68-72cm',
        S: 'Ajuste ceñido - Para cintura de 72-76cm',
        M: 'Ajuste regular - Para cintura de 76-80cm',
        L: 'Ajuste relajado - Para cintura de 80-84cm',
        XL: 'Ajuste holgado - Para cintura de 84-88cm',
        XXL: 'Ajuste muy holgado - Para cintura de 88-92cm'
      }
    },
    tops: {
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      measurements: {
        XS: { chest: 86, waist: 70, length: 65 },
        S: { chest: 90, waist: 74, length: 67 },
        M: { chest: 94, waist: 78, length: 69 },
        L: { chest: 98, waist: 82, length: 71 },
        XL: { chest: 102, waist: 86, length: 73 },
        XXL: { chest: 106, waist: 90, length: 75 }
      },
      fitGuide: {
        XS: 'Ajuste muy ceñido - Para pecho de 84-88cm',
        S: 'Ajuste ceñido - Para pecho de 88-92cm',
        M: 'Ajuste regular - Para pecho de 92-96cm',
        L: 'Ajuste relajado - Para pecho de 96-100cm',
        XL: 'Ajuste holgado - Para pecho de 100-104cm',
        XXL: 'Ajuste muy holgado - Para pecho de 104-108cm'
      }
    }
  }

  const currentSizeData = sizeData[category] || sizeData.bottoms

  const convertUnits = (value, fromCm = true) => {
    if (fromCm && units === 'inches') {
      return (value / 2.54).toFixed(1)
    }
    if (!fromCm && units === 'cm') {
      return (value * 2.54).toFixed(0)
    }
    return value
  }

  const calculateRecommendedSize = () => {
    if (!bodyMeasurements.waist && !bodyMeasurements.chest) {
      setRecommendedSize('')
      return
    }

    const inputWaist = parseFloat(bodyMeasurements.waist) || 0
    const inputChest = parseFloat(bodyMeasurements.chest) || 0
    
    // Convertir a cm si está en inches
    const waistCm = units === 'inches' ? inputWaist * 2.54 : inputWaist
    const chestCm = units === 'inches' ? inputChest * 2.54 : inputChest

    let bestSize = ''
    let minDiff = Infinity

    currentSizeData.sizes.forEach(size => {
      const measurements = currentSizeData.measurements[size]
      let diff = 0

      if (category === 'bottoms' && waistCm > 0) {
        diff = Math.abs(measurements.waist - waistCm)
      } else if (category === 'tops' && chestCm > 0) {
        diff = Math.abs(measurements.chest - chestCm)
      }

      if (diff < minDiff) {
        minDiff = diff
        bestSize = size
      }
    })

    setRecommendedSize(bestSize)
  }

  const handleMeasurementChange = (measurement, value) => {
    setBodyMeasurements(prev => ({
      ...prev,
      [measurement]: value
    }))
  }

  const resetCalculator = () => {
    setBodyMeasurements({
      chest: '',
      waist: '',
      hips: '',
      inseam: ''
    })
    setRecommendedSize('')
  }

  if (!isOpen) return null

  return (
    <div className="size-guide-overlay" onClick={onClose}>
      <div className="size-guide-modal" onClick={e => e.stopPropagation()}>
        <div className="size-guide-header">
          <h2>{t('guiaTallas')}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="size-guide-content">
          {/* Calculadora de talla */}
          <div className="size-calculator">
            <h3>Calculadora de Talla</h3>
            <p>Ingresa tus medidas para encontrar tu talla perfecta</p>
            
            <div className="units-toggle">
              <button 
                className={units === 'cm' ? 'active' : ''}
                onClick={() => setUnits('cm')}
              >
                CM
              </button>
              <button 
                className={units === 'inches' ? 'active' : ''}
                onClick={() => setUnits('inches')}
              >
                Pulgadas
              </button>
            </div>

            <div className="measurements-input">
              {category === 'tops' && (
                <div className="measurement-group">
                  <label>Pecho ({units})</label>
                  <input
                    type="number"
                    value={bodyMeasurements.chest}
                    onChange={(e) => handleMeasurementChange('chest', e.target.value)}
                    placeholder={`Ej: ${units === 'cm' ? '94' : '37'}`}
                  />
                </div>
              )}
              
              <div className="measurement-group">
                <label>Cintura ({units})</label>
                <input
                  type="number"
                  value={bodyMeasurements.waist}
                  onChange={(e) => handleMeasurementChange('waist', e.target.value)}
                  placeholder={`Ej: ${units === 'cm' ? '78' : '31'}`}
                />
              </div>

              {category === 'bottoms' && (
                <>
                  <div className="measurement-group">
                    <label>Caderas ({units})</label>
                    <input
                      type="number"
                      value={bodyMeasurements.hips}
                      onChange={(e) => handleMeasurementChange('hips', e.target.value)}
                      placeholder={`Ej: ${units === 'cm' ? '98' : '39'}`}
                    />
                  </div>
                  <div className="measurement-group">
                    <label>Entrepierna ({units})</label>
                    <input
                      type="number"
                      value={bodyMeasurements.inseam}
                      onChange={(e) => handleMeasurementChange('inseam', e.target.value)}
                      placeholder={`Ej: ${units === 'cm' ? '80' : '31'}`}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="calculator-actions">
              <button className="calculate-btn" onClick={calculateRecommendedSize}>
                Calcular Talla
              </button>
              <button className="reset-btn" onClick={resetCalculator}>
                Reiniciar
              </button>
            </div>

            {recommendedSize && (
              <div className="size-recommendation">
                <h4>Tu talla recomendada: <span className="recommended-size">{recommendedSize}</span></h4>
                <p className="fit-description">{currentSizeData.fitGuide[recommendedSize]}</p>
              </div>
            )}
          </div>

          {/* Tabla de tallas */}
          <div className="size-chart">
            <h3>Tabla de Medidas</h3>
            <div className="chart-container">
              <table>
                <thead>
                  <tr>
                    <th>Talla</th>
                    {category === 'tops' && <th>Pecho (cm)</th>}
                    <th>Cintura (cm)</th>
                    {category === 'bottoms' && <th>Caderas (cm)</th>}
                    {category === 'bottoms' && <th>Entrepierna (cm)</th>}
                    {category === 'tops' && <th>Largo (cm)</th>}
                  </tr>
                </thead>
                <tbody>
                  {currentSizeData.sizes.map(size => (
                    <tr 
                      key={size} 
                      className={`${selectedSize === size ? 'selected' : ''} ${recommendedSize === size ? 'recommended' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      <td className="size-cell">{size}</td>
                      {category === 'tops' && <td>{currentSizeData.measurements[size].chest}</td>}
                      <td>{currentSizeData.measurements[size].waist}</td>
                      {category === 'bottoms' && <td>{currentSizeData.measurements[size].hips}</td>}
                      {category === 'bottoms' && <td>{currentSizeData.measurements[size].inseam}</td>}
                      {category === 'tops' && <td>{currentSizeData.measurements[size].length}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Consejos de medición */}
          <div className="measurement-tips">
            <h3>Cómo medir correctamente</h3>
            <div className="tips-grid">
              <div className="tip">
                <span className="tip-icon">📏</span>
                <div>
                  <h4>Pecho</h4>
                  <p>Mide alrededor de la parte más ancha del pecho, manteniendo la cinta métrica paralela al suelo.</p>
                </div>
              </div>
              <div className="tip">
                <span className="tip-icon">📐</span>
                <div>
                  <h4>Cintura</h4>
                  <p>Mide alrededor de la parte más estrecha de tu cintura, generalmente justo encima del ombligo.</p>
                </div>
              </div>
              <div className="tip">
                <span className="tip-icon">📊</span>
                <div>
                  <h4>Caderas</h4>
                  <p>Mide alrededor de la parte más ancha de las caderas, manteniendo los pies juntos.</p>
                </div>
              </div>
              <div className="tip">
                <span className="tip-icon">📏</span>
                <div>
                  <h4>Entrepierna</h4>
                  <p>Mide desde la entrepierna hasta el final del pantalón deseado.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SizeGuide