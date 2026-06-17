import { useState, useEffect, useRef, useCallback } from 'react';
import { useCart }                      from '../context/CartContext';
import { useAuth }                      from '../context/AuthContext';
import { getProducts }                  from '../services/productService';
import Toast                            from '../components/Toast';
import CartPopup                        from '../components/CartPopup';
import '../styles/ShopPage.css';
const ShopPage = ({ onGoToCart, onGoToAdmin, onGoToAccount, onGoToCheckout }) => {
  const { addItem, cartCount, cartError } = useCart();
  const { logout, user, isLoggedIn, openLoginModal } = useAuth();
  const [products,       setProducts]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [fetchError,     setFetchError]     = useState(null);
  const [toast,          setToast]          = useState('');
  const [addingId,       setAddingId]       = useState(null);
  const [activeCategory, setActiveCategory] = useState('');
  const [showCartPopup,  setShowCartPopup]  = useState(false);
  const [searchQuery,    setSearchQuery]    = useState('');
  const [showPill,       setShowPill]       = useState(false);
  const prevCategoryRef                     = useRef('');
  const bannerRef                           = useRef(null);
  useEffect(() => {
    getProducts()
      .then((data) => { setProducts(data); setLoading(false); })
      .catch(() => { setFetchError('לא ניתן לטעון מוצרים'); setLoading(false); });
  }, []);
  useEffect(() => {
    const banner = bannerRef.current;
    if (!banner) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowPill(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(banner);
    return () => observer.disconnect();
  }, []);
  useEffect(() => { if (cartError) setToast(cartError); }, [cartError]);
  const grouped = () => {
    const filtered = searchQuery.trim()
      ? products.filter((p) => p.name?.toLowerCase().includes(searchQuery.toLowerCase()))
      : products;
    const map = {};
    filtered.forEach((p) => {
      const cat = p.category?.trim() || 'ללא קטגוריה';
      (map[cat] = map[cat] || []).push(p);
    });
    return Object.entries(map).sort(([a], [b]) =>
      a === 'ללא קטגוריה' ? 1 : b === 'ללא קטגוריה' ? -1 : a.localeCompare(b, 'he')
    );
  };
  const categories = grouped();
  useEffect(() => {
    if (categories.length === 0) return;
    setActiveCategory(categories[0][0]);
    prevCategoryRef.current = categories[0][0];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const newCat = visible[0].target.dataset.category;
        if (newCat && newCat !== prevCategoryRef.current) {
          setActiveCategory(newCat);
          prevCategoryRef.current = newCat;
        }
      },
      { rootMargin: '-10% 0px -60% 0px', threshold: 0 }
    );
    categories.forEach(([cat]) => {
      const el = document.getElementById(`cat-${cat}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [products]);
  const handleAdd = async (product) => {
    setAddingId(product._id);
    await addItem(product, 1);
    setToast(`"${product.name}" נוסף לעגלה ✓`);
    setShowCartPopup(true);
    setAddingId(null);
  };
  const handleClosePopup = useCallback(() => setShowCartPopup(false), []);
  const handleGoToCart  = () => onGoToCart();
  const handleGoToAdmin = () => onGoToAdmin();
  const scrollToCategory = (cat) =>
    document.getElementById(`cat-${cat}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return (
    <div className="shop-page">
      {}
      <div className="shop-hero-banner" ref={bannerRef}>
        <img
          src="/branding/TOP.png"
          alt="Brooklyn Bake Shop"
          className="shop-banner-bg"
        />
      </div>
      {}
      <div className="shop-action-bar">
        <div className="shop-action-bar-inner">
          <img src="/branding/logo.png" alt="Brooklyn Bake Shop" className="shop-navbar-logo" />
          <div className="shop-navbar-actions">
            {user?.role === 'admin' && (
              <button className="shop-nav-btn" onClick={handleGoToAdmin}>
                ⚙️ ניהול
              </button>
            )}
            {isLoggedIn && (
              <button className="shop-nav-btn" onClick={onGoToAccount}>
                👤 החשבון שלי
              </button>
            )}
            <button
              className="shop-cart-btn"
              onClick={handleGoToCart}
              aria-label="פתח עגלה"
            >
              🛒
              {cartCount > 0 && (
                <span className="shop-cart-badge">{cartCount}</span>
              )}
            </button>
            {isLoggedIn ? (
              <button className="shop-nav-btn" onClick={logout}>
                יציאה
              </button>
            ) : (
              <button className="shop-nav-btn" onClick={() => openLoginModal(false)}>
                התחברות
              </button>
            )}
          </div>
        </div>
      </div>
      {}
      {loading    && <p className="shop-status">טוען מוצרים...</p>}
      {fetchError && <p className="shop-status shop-status--error">{fetchError}</p>}
      {}
      {!loading && !fetchError && (
        <div className="shop-container">
          {}
          <div className="shop-search-bar">
            <input
              type="text"
              placeholder="🔍 חיפוש מוצר..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="shop-search-input"
            />
          </div>
          {}
          <aside className="category-sidebar" aria-label="קטגוריות">
            <span className="category-sidebar-label">תפריט</span>
            <nav>
              {categories.map(([cat]) => (
                <button
                  key={cat}
                  onClick={() => scrollToCategory(cat)}
                  className={`sidebar-btn${activeCategory === cat ? ' sidebar-btn--active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </nav>
          </aside>
          {}
          <main className="shop-main">
            {}
            {activeCategory && showPill && (
              <div className="category-pill-bar" aria-live="polite">
                <span className="category-pill">{activeCategory}</span>
              </div>
            )}
            {categories.map(([cat, items]) => (
              <section
                key={cat}
                id={`cat-${cat}`}
                data-category={cat}
                className="category-section"
              >
                <h2 className="category-heading">{cat}</h2>
                <div className="products-grid">
                  {items.map((product) => (
                    <article key={product._id} className="product-card">
                      {}
                      <div className="product-card-img-wrapper">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          onError={(e) => (e.target.src = '/placeholder.png')}
                          className="product-card-img"
                        />
                        {!product.available && (
                          <div className="product-unavailable-overlay">
                            <span className="product-unavailable-badge">לא זמין</span>
                          </div>
                        )}
                      </div>
                      {}
                      <div className="product-card-body">
                        <h3 className="product-card-title">{product.name}</h3>
                        {product.description && (
                          <p className="product-card-desc">{product.description}</p>
                        )}
                        {!product.available && product.unavailableNote && (
                          <p className="product-card-unavailable-note">
                            ⚠️ {product.unavailableNote}
                          </p>
                        )}
                        {}
                        <div className="product-card-footer">
                          <span className="product-card-price">₪{product.price}</span>
                          <button
                            onClick={() => handleAdd(product)}
                            disabled={addingId === product._id || !product.available}
                            className="btn-add-to-cart"
                            aria-label={`הוסף ${product.name} לעגלה`}
                          >
                            {addingId === product._id ? '...' : '+ הוסף'}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </main>
        </div>
      )}
      <CartPopup
        visible={showCartPopup}
        onClose={handleClosePopup}
        onGoToCart={() => { handleClosePopup(); handleGoToCart(); }}
        onGoToCheckout={() => {
          handleClosePopup();
          if (!isLoggedIn) {
            openLoginModal(true); 
          } else {
            onGoToCheckout();
          }
        }}
      />
      <Toast message={toast} />
    </div>
  );
};
export default ShopPage;