import { useState, useEffect } from 'react'
import './AdminPanel.css'
import ImageUpload from './ImageUpload'
import { API_ENDPOINTS } from '../config/api'

const AdminPanel = ({ token }) => {
  const [products, setProducts] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'tops',
    description: '',
    sizes: '',
    images: [''],
    inStock: true,
    details: {
      material: '',
      care: '',
      origin: ''
    }
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.products)
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.startsWith('details.')) {
      const detailKey = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        details: {
          ...prev.details,
          [detailKey]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  const handleImageChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? value : img)
    }))
  }

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }))
  }

  const removeImageField = (index) => {
    if (formData.images.length > 1) {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      sizes: formData.sizes.split(',').map(s => s.trim()),
      images: formData.images.filter(img => img.trim() !== '')
    }

    try {
      let response
      if (editingProduct) {
        response = await fetch(`http://localhost:3003/api/admin/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(productData)
        })
      } else {
        response = await fetch('http://localhost:3003/api/admin/products', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(productData)
        })
      }

      if (response.ok) {
        await fetchProducts()
        resetForm()
      }
    } catch (error) {
      console.error('Error saving product:', error)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setIsAddingNew(false)
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      description: product.description,
      sizes: product.sizes.join(', '),
      images: product.images || [''],
      inStock: product.inStock,
      details: product.details || {
        material: '',
        care: '',
        origin: ''
      }
    })
  }

  const handleDelete = async (productId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await fetch(`http://localhost:3003/api/admin/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        await fetchProducts()
      } catch (error) {
        console.error('Error deleting product:', error)
      }
    }
  }

  const handleImageUploaded = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images.filter(img => img.trim() !== ''), imageUrl]
    }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      category: 'tops',
      description: '',
      sizes: '',
      images: [''],
      inStock: true,
      details: {
        material: '',
        care: '',
        origin: ''
      }
    })
    setEditingProduct(null)
    setIsAddingNew(false)
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Panel de Administración</h1>
        <button 
          className="add-product-btn"
          onClick={() => {
            setEditingProduct(null)
            setFormData({
              name: '',
              price: '',
              category: 'tops',
              description: '',
              sizes: '',
              images: [''],
              inStock: true,
              details: {
                material: '',
                care: '',
                origin: ''
              }
            })
            setIsAddingNew(true)
          }}
        >
          + Agregar Producto
        </button>
      </div>

      {(isAddingNew || editingProduct) && (
        <div className="product-form-container">
          <div className="form-header">
            <h2>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            <button className="cancel-btn" onClick={resetForm}>×</button>
          </div>
          
          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-row">
              <div className="form-group">
                <label>Nombre del Producto</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Precio</label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Categoría</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="tops">Tops</option>
                  <option value="bottoms">Bottoms</option>
                  <option value="jackets">Jackets</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Tallas (separadas por coma)</label>
                <input
                  type="text"
                  name="sizes"
                  value={formData.sizes}
                  onChange={handleInputChange}
                  placeholder="S, M, L, XL"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                required
              />
            </div>

            <div className="form-group">
              <label>Imágenes del Producto</label>
              
              <ImageUpload 
                onImageUploaded={handleImageUploaded}
                token={token}
              />
              
              {formData.images.map((image, index) => (
                <div key={index} className="image-input-row">
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    placeholder={`URL de imagen ${index + 1}`}
                  />
                  {formData.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="remove-image-btn"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addImageField}
                className="add-image-btn"
              >
                + Agregar URL manualmente
              </button>
            </div>

            <div className="form-group">
              <label>Detalles del Producto</label>
              <div className="details-inputs">
                <input
                  type="text"
                  name="details.material"
                  value={formData.details.material}
                  onChange={handleInputChange}
                  placeholder="Material (ej: 100% Algodón)"
                />
                <input
                  type="text"
                  name="details.care"
                  value={formData.details.care}
                  onChange={handleInputChange}
                  placeholder="Cuidado (ej: Lavado a máquina)"
                />
                <input
                  type="text"
                  name="details.origin"
                  value={formData.details.origin}
                  onChange={handleInputChange}
                  placeholder="Origen (ej: Hecho en España)"
                />
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="inStock"
                  checked={formData.inStock}
                  onChange={handleInputChange}
                />
                En Stock
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="save-btn">
                {editingProduct ? 'Actualizar' : 'Crear'} Producto
              </button>
              <button type="button" className="cancel-btn" onClick={resetForm}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="products-table">
        <h2>Productos ({products.length})</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Categoría</th>
                <th>Tallas</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>${product.price}</td>
                  <td>{product.category}</td>
                  <td>{product.sizes.join(', ')}</td>
                  <td>
                    <span className={`stock-status ${product.inStock ? 'in-stock' : 'out-stock'}`}>
                      {product.inStock ? 'En Stock' : 'Agotado'}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button 
                        className="edit-btn"
                        onClick={() => handleEdit(product)}
                      >
                        Editar
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete(product.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {products.length === 0 && (
            <div className="empty-products">
              <p>No hay productos registrados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminPanel