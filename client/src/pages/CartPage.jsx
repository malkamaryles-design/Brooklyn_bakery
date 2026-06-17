import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import PageHeader  from '../components/PageHeader';
const CartPage = ({ onGoToShop, onGoToCheckout }) => {
  const { cart, cartCount, cartTotal, changeQuantity, removeItem, cartError } = useCart();
  const { logout, isLoggedIn, openLoginModal } = useAuth();
  const handleCheckout = () => {
    if (!isLoggedIn) {
      openLoginModal(true); 
      return;
    }
    onGoToCheckout();
  };
  const handleLogout = isLoggedIn ? logout : null;
  if (cart.length === 0) {
    return (
      <>
        <PageHeader logo="/branding/logo.png" onGoToShop={onGoToShop} onLogout={handleLogout} />
        <main>
          <div className="empty-cart">
            <span className="empty-cart-icon">🛒</span>
            <h2>העגלה שלך ריקה</h2>
            <p>נראה שעוד לא הוספת שום דבר. בוא נתקן את זה!</p>
            <button className="add-btn" onClick={onGoToShop}>
              המשך לקנות
            </button>
          </div>
        </main>
      </>
    );
  }
  return (
    <>
      <PageHeader logo="/branding/logo.png" onGoToShop={onGoToShop} onLogout={handleLogout} />
      <main>
        <h2>העגלה שלי</h2>
        {}
        {cartError && <p className="error cart-error-banner">{cartError}</p>}
        <div className="cart-layout">
          {}
          <section className="cart-items" aria-label="פריטים בעגלה">
            {cart.map((item) => (
              <article key={item._id} className="cart-item">
                {}
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  onError={(e) => (e.target.src = '/placeholder.png')}
                />
                {}
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p className="price">₪{item.price} ליחידה</p>
                  {!item.available && (
                    <p className="error" style={{ margin: '4px 0 0', fontSize: '13px' }}>
                      ⚠️ {item.unavailableNote || 'מוצר זה אינו זמין כרגע'}
                    </p>
                  )}
                </div>
                {}
                <div className="qty-selector" role="group" aria-label="כמות">
                  <button
                    className="qty-btn"
                    onClick={() => changeQuantity(item._id, item.quantity - 1)}
                    aria-label="הפחת כמות"
                  >
                    −
                  </button>
                  <span className="qty-value">{item.quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => changeQuantity(item._id, item.quantity + 1)}
                    aria-label="הגדל כמות"
                  >
                    +
                  </button>
                </div>
                {}
                <p className="item-total">₪{item.price * item.quantity}</p>
                {}
                <button
                  className="remove-btn"
                  onClick={() => removeItem(item._id)}
                  aria-label={`הסר ${item.name}`}
                >
                  🗑
                </button>
              </article>
            ))}
          </section>
          {}
          <aside className="order-summary" aria-label="סיכום הזמנה">
            <h3>סיכום הזמנה</h3>
            <div className="summary-row">
              <span>סה״כ פריטים</span>
              <span>{cartCount}</span>
            </div>
            <div className="summary-row summary-total">
              <span>סה״כ לתשלום</span>
              <span>₪{cartTotal}</span>
            </div>
            <button
              className="checkout-btn"
              onClick={handleCheckout}
            >
              לתשלום →
            </button>
          </aside>
        </div>
      </main>
    </>
  );
};
export default CartPage;