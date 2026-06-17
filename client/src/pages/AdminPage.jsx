import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../services/productService';
import { getAllOrders, updateOrderStatus } from '../services/orderService';
import { STATUS_LABELS, STATUS_COLORS } from '../constants/orderStatus';
import { formatDate } from '../utils/formatDate';
import PageHeader from '../components/PageHeader';
import OrderCard  from '../components/OrderCard';
const EMPTY_FORM = {
  name: '',
  price:     '',
  category: '',
  description: '',
  imageUrl:  '',
};
const AdminPage = ({ onGoToShop }) => {
  const { logout } = useAuth();
  const [products,   setProducts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [formError,  setFormError]  = useState('');
  const [formSaving, setFormSaving] = useState(false);
  const [rowState,   setRowState]   = useState({});
  const [orders,       setOrders]       = useState([]);
  const [ordersLoading, setOrdersLoad]  = useState(true);
  const [ordersError,   setOrdersError] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [activeTab,     setActiveTab]   = useState('products'); 
  const loadProducts = () => {
    setLoading(true);
    getProducts()
      .then((data) => { setProducts(data); setLoading(false); })
      .catch(() => { setError('שגיאה בטעינת המוצרים'); setLoading(false); });
  };
  useEffect(loadProducts, []);
  const loadOrders = () => {
    setOrdersLoad(true);
    getAllOrders()
      .then((data) => { setOrders(data); setOrdersLoad(false); })
      .catch(() => { setOrdersError('שגיאה בטעינת הזמנות'); setOrdersLoad(false); });
  };
  useEffect(loadOrders, []);
  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      loadOrders();
    } catch (err) {
      setOrdersError(err.message);
    }
  };
  const getRow = (id, product) =>
    rowState[id] ?? {
      price:  product.price,
      note:   product.unavailableNote ?? '',
      saving: false,
    };
  const setRow = (id, patch) =>
    setRowState((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? { price: '', note: '', saving: false }), ...patch },
    }));
  const clearRow = (id) =>
    setRowState((prev) => { const next = { ...prev }; delete next[id]; return next; });
  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim())                return setFormError('שם מוצר הוא שדה חובה');
    if (!form.price || isNaN(form.price))  return setFormError('יש להזין מחיר תקין');
    setFormSaving(true);
    try {
      await createProduct({ ...form, price: Number(form.price) });
      setForm(EMPTY_FORM);
      loadProducts();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormSaving(false);
    }
  };
  const handlePriceUpdate = async (product) => {
    const row = getRow(product._id, product);
    if (isNaN(row.price) || Number(row.price) < 0) return;
    setRow(product._id, { saving: true });
    try {
      await updateProduct(product._id, { price: Number(row.price) });
      clearRow(product._id);   
      loadProducts();
    } catch (err) {
      setError(err.message);
      setRow(product._id, { saving: false });
    }
  };
  const handleToggleAvailable = async (product) => {
    const newValue = !product.available;
    setRow(product._id, { saving: true });
    try {
      await updateProduct(product._id, { available: newValue });
      clearRow(product._id);
      loadProducts();
    } catch (err) {
      setError(err.message);
      setRow(product._id, { saving: false });
    }
  };
  const handleNoteUpdate = async (product) => {
    const row = getRow(product._id, product);
    setRow(product._id, { saving: true });
    try {
      await updateProduct(product._id, { unavailableNote: row.note });
      clearRow(product._id);
      loadProducts();
    } catch (err) {
      setError(err.message);
      setRow(product._id, { saving: false });
    }
  };
  const handleDelete = async (productId, name) => {
    if (!window.confirm(`למחוק את "${name}"?`)) return;
    try {
      await deleteProduct(productId);
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <>
      <PageHeader title="⚙️ לוח ניהול" onGoToShop={onGoToShop} onLogout={logout} />
      <main className="rtl-main">
        {}
        <div className="admin-tabs">
          <button
            className={`admin-tab${activeTab === 'products' ? ' admin-tab--active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            🛍️ מוצרים
          </button>
          <button
            className={`admin-tab${activeTab === 'orders' ? ' admin-tab--active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📦 הזמנות
            {orders.filter((o) => o.status === 'pending').length > 0 && (
              <span className="admin-orders-badge">
                {orders.filter((o) => o.status === 'pending').length}
              </span>
            )}
          </button>
        </div>
        {}
        {activeTab === 'products' && (
          <>
        {}
        <section className="admin-section">
          <h2>הוספת מוצר חדש</h2>
          <form className="admin-form" onSubmit={handleCreate}>
            <input
              placeholder="שם מוצר *"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <input
              type="number"
              placeholder="מחיר (₪) *"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            />
            <input
              placeholder="קטגוריה"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            />
            <input
              placeholder="תיאור"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
            <input
              placeholder="כתובת תמונה (URL)"
              value={form.imageUrl}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
            />
            {formError && <p className="error">{formError}</p>}
            <button className="add-btn" type="submit" disabled={formSaving}>
              {formSaving ? 'שומר...' : '+ הוסף מוצר'}
            </button>
          </form>
        </section>
        {}
        <section className="admin-section">
          <h2>ניהול מוצרים קיימים</h2>
          <div className="margin-bottom-sm">
            <input
              type="text"
              placeholder="🔍 חיפוש מוצר..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="search-input"
            />
          </div>
          {loading && <p className="loading">טוען...</p>}
          {error   && <p className="error">{error}</p>}
          {!loading && products
            .filter((p) => !productSearch.trim() || p.name?.toLowerCase().includes(productSearch.toLowerCase()))
            .map((product) => {
            const row  = getRow(product._id, product);
            const name = product.name;
            return (
              <article key={product._id} className="admin-product-row">
                {}
                <img
                  src={product.imageUrl}
                  alt={name}
                  onError={(e) => (e.target.src = '/placeholder.png')}
                />
                <div className="admin-product-info">
                  <strong>{name}</strong>
                  {product.description && <span className="card-desc">{product.description}</span>}
                </div>
                {}
                <div className="admin-field-group">
                  <label>מחיר ₪</label>
                  <div className="admin-inline">
                    <input
                      type="number"
                      className="admin-price-input"
                      value={row.price}
                      onChange={(e) => setRow(product._id, { price: e.target.value })}
                    />
                    <button
                      className="admin-save-btn"
                      onClick={() => handlePriceUpdate(product)}
                      disabled={row.saving}
                    >
                      שמור
                    </button>
                  </div>
                </div>
                {}
                <div className="admin-field-group">
                  <label>זמינות</label>
                  <button
                    className={`toggle-btn ${product.available ? 'toggle-on' : 'toggle-off'}`}
                    onClick={() => handleToggleAvailable(product)}
                    disabled={row.saving}
                  >
                    {product.available ? '✓ זמין' : '✗ לא זמין'}
                  </button>
                </div>
                {}
                {!product.available && (
                  <div className="admin-field-group admin-note">
                    <label>סיבת אי-זמינות</label>
                    <div className="admin-inline">
                      <input
                        placeholder="למשל: אזל המלאי"
                        value={row.note}
                        onChange={(e) => setRow(product._id, { note: e.target.value })}
                      />
                      <button
                        className="admin-save-btn"
                        onClick={() => handleNoteUpdate(product)}
                        disabled={row.saving}
                      >
                        שמור
                      </button>
                    </div>
                  </div>
                )}
                {}
                <button
                  className="remove-btn admin-delete"
                  onClick={() => handleDelete(product._id, name)}
                  aria-label={`מחק ${name}`}
                >
                  🗑 מחק
                </button>
              </article>
            );
          })}
        </section>
          </>
        )}
        {}
        {activeTab === 'orders' && (
          <section className="admin-section">
            <h2>כל ההזמנות</h2>
            {ordersLoading && <p className="loading">טוען הזמנות...</p>}
            {ordersError   && <p className="error">{ordersError}</p>}
            {!ordersLoading && orders.length === 0 && (
              <p>אין הזמנות עדיין.</p>
            )}
            {!ordersLoading && orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                formatDate={formatDate}
                adminFooter={(o) => (
                  <div className="order-status-select-group">
                    <label>עדכן סטטוס:</label>
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o._id, e.target.value)}
                      className="order-status-select"
                    >
                      <option value="pending">ממתין לאישור</option>
                      <option value="preparing">בהכנה</option>
                      <option value="shipped">יצא למשלוח</option>
                      <option value="delivered">נמסר</option>
                    </select>
                  </div>
                )}
              />
            ))}
          </section>
        )}
      </main>
    </>
  );
};
export default AdminPage;