import { useState } from 'react'
import './Sidebar.css'
import { useTranslation } from '../utils/translations'

const Sidebar = ({ onFilterChange, selectedFilters, isOpen, onClose, language = 'es' }) => {
  const { t } = useTranslation(language);
  const [expandedSections, setExpandedSections] = useState({
    coleccion: true,
    corte: true,
    talla: true
  })

  const filters = {
    coleccion: [
      { key: 'Todos', label: t('todos') },
      { key: 'Urban Drop', label: t('urbanDrop') },
      { key: 'Limited Edition', label: t('limitedEdition') },
      { key: 'Classic', label: t('classic') }
    ],
    corte: [
      { key: 'Todos', label: t('todos') },
      { key: 'Baggy', label: t('baggy') },
      { key: 'Tapered', label: t('tapered') },
      { key: 'Wide Leg', label: t('wideLeg') },
      { key: 'Straight', label: t('straight') }
    ],
    talla: [
      { key: 'Todas', label: t('todas') },
      { key: 'XS', label: 'XS' },
      { key: 'S', label: 'S' },
      { key: 'M', label: 'M' },
      { key: 'L', label: 'L' },
      { key: 'XL', label: 'XL' },
      { key: 'XXL', label: 'XXL' }
    ]
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleFilterClick = (filterType, value) => {
    onFilterChange(filterType, value)
  }

  const getFilterTitle = (filterType) => {
    const titles = {
      coleccion: t('colecciones'),
      corte: t('cortes'),
      talla: t('tallas')
    }
    return titles[filterType] || filterType
  }

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>{t('filtros')}</h3>
          <button className="sidebar-close" onClick={onClose}>
            ×
          </button>
        </div>

      {Object.entries(filters).map(([filterType, options]) => (
        <div key={filterType} className="filter-section">
          <button 
            className="filter-header"
            onClick={() => toggleSection(filterType)}
          >
            <span className="filter-title">
              {getFilterTitle(filterType)}
            </span>
            <span className={`filter-toggle ${expandedSections[filterType] ? 'expanded' : ''}`}>
              ▼
            </span>
          </button>
          
          {expandedSections[filterType] && (
            <div className="filter-options">
              {options.map(option => (
                <button
                  key={option.key}
                  className={`filter-option ${
                    selectedFilters[filterType] === option.key ? 'active' : ''
                  }`}
                  onClick={() => handleFilterClick(filterType, option.key)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
      </aside>
    </>
  )
}

export default Sidebar