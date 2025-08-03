import { useState, useEffect } from 'react'
import './AdvancedSearch.css'
import { useTranslation } from '../utils/translations'

const AdvancedSearch = ({ 
  onSearch, 
  onFiltersChange, 
  language = 'es',
  products = []
}) => {
  const { t } = useTranslation(language)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 1000 },
    colors: [],
    styles: [],
    sizes: []
  })
  const [isExpanded, setIsExpanded] = useState(false)
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 })

  // Calcular rango de precios dinámicamente basado en productos
  useEffect(() => {
    if (products.length > 0) {
      const prices = products.map(p => p.price).filter(p => p > 0)
      const minPrice = Math.min(...prices)
      const maxPrice = Math.max(...prices)
      setPriceRange({ min: minPrice, max: maxPrice })
      setFilters(prev => ({
        ...prev,
        priceRange: { min: minPrice, max: maxPrice }
      }))
    }
  }, [products])

  // Obtener opciones únicas de los productos
  const getUniqueValues = (key) => {
    const values = products.flatMap(product => {
      if (key === 'colors') {
        // Extraer colores de las imágenes o descripción
        return ['Negro', 'Blanco', 'Gris', 'Azul', 'Rojo'] // Por ahora valores fijos
      }
      if (key === 'styles') {
        return [product.category]
      }
      if (key === 'sizes') {
        return product.sizes || []
      }
      return []
    })
    return [...new Set(values)].filter(Boolean)
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    onSearch(value)
  }

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters }
    
    if (filterType === 'priceRange') {
      newFilters.priceRange = value
    } else {
      // Para arrays (colors, styles, sizes)
      if (newFilters[filterType].includes(value)) {
        newFilters[filterType] = newFilters[filterType].filter(item => item !== value)
      } else {
        newFilters[filterType] = [...newFilters[filterType], value]
      }
    }
    
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      priceRange: priceRange,
      colors: [],
      styles: [],
      sizes: []
    }
    setFilters(clearedFilters)
    setSearchTerm('')
    onFiltersChange(clearedFilters)
    onSearch('')
  }

  const activeFiltersCount = 
    filters.colors.length + 
    filters.styles.length + 
    filters.sizes.length +
    (filters.priceRange.min !== priceRange.min || filters.priceRange.max !== priceRange.max ? 1 : 0)

  return (
    <div className="advanced-search">
      <div className="search-header">
        <div className="search-input-container">
          <input
            type="text"
            placeholder={t('buscarProductos')}
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <button 
          className={`filters-toggle ${isExpanded ? 'active' : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {t('filtros')} {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          <span className={`arrow ${isExpanded ? 'up' : 'down'}`}>▼</span>
        </button>
      </div>

      {isExpanded && (
        <div className="filters-panel">
          {/* Filtro de Precio */}
          <div className="filter-group">
            <h4>{t('precio')}</h4>
            <div className="price-range">
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange.min}
                  onChange={(e) => handleFilterChange('priceRange', {
                    ...filters.priceRange,
                    min: parseInt(e.target.value) || 0
                  })}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange.max}
                  onChange={(e) => handleFilterChange('priceRange', {
                    ...filters.priceRange,
                    max: parseInt(e.target.value) || 1000
                  })}
                />
              </div>
              <div className="price-slider">
                <input
                  type="range"
                  min={priceRange.min}
                  max={priceRange.max}
                  value={filters.priceRange.min}
                  onChange={(e) => handleFilterChange('priceRange', {
                    ...filters.priceRange,
                    min: parseInt(e.target.value)
                  })}
                  className="slider-min"
                />
                <input
                  type="range"
                  min={priceRange.min}
                  max={priceRange.max}
                  value={filters.priceRange.max}
                  onChange={(e) => handleFilterChange('priceRange', {
                    ...filters.priceRange,
                    max: parseInt(e.target.value)
                  })}
                  className="slider-max"
                />
              </div>
            </div>
          </div>

          {/* Filtro de Colores */}
          <div className="filter-group">
            <h4>{t('colores')}</h4>
            <div className="color-filters">
              {getUniqueValues('colors').map(color => (
                <button
                  key={color}
                  className={`color-filter ${filters.colors.includes(color) ? 'active' : ''}`}
                  onClick={() => handleFilterChange('colors', color)}
                >
                  <span className={`color-swatch color-${color.toLowerCase()}`}></span>
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro de Estilos */}
          <div className="filter-group">
            <h4>{t('categoria')}</h4>
            <div className="style-filters">
              {getUniqueValues('styles').map(style => (
                <button
                  key={style}
                  className={`style-filter ${filters.styles.includes(style) ? 'active' : ''}`}
                  onClick={() => handleFilterChange('styles', style)}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro de Tallas */}
          <div className="filter-group">
            <h4>{t('tallas')}</h4>
            <div className="size-filters">
              {getUniqueValues('sizes').map(size => (
                <button
                  key={size}
                  className={`size-filter ${filters.sizes.includes(size) ? 'active' : ''}`}
                  onClick={() => handleFilterChange('sizes', size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-actions">
            <button className="clear-filters" onClick={clearFilters}>
              {t('limpiarFiltros')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedSearch