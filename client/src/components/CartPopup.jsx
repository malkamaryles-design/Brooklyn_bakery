import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import '../styles/CartPopup.css';
const CartPopup = ({ visible, onClose, onGoToCart, onGoToCheckout }) => {
  const { cart, cartCount, cartTotal } = useCart();
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [visible, onClose]);
  if (!visible || cart.length === 0) return null;
  return (
    <div className={`cart-popup ${visible ? 'cart-popup--visible' : ''}`}>
      <div className="cart-popup-header">
        <span>🛒 העגלה שלך ({cartCount})</span>
        <button className="cart-popup-close" onClick={onClose}>✕</button>
      </div>
      <div className="cart-popup-items">
        {cart.map((item) => (
          <div key={item._id || item.productId} className="cart-popup-item">
            {item.imageUrl && (
              <img src={item.imageUrl} alt={item.name} />
            )}
            <div className="cart-popup-item-info">
              <span className="cart-popup-item-name">{item.name}</span>
              <span className="cart-popup-item-qty">× {item.quantity} — ₪{item.price * item.quantity}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-popup-total">
        <span>סה״כ</span>
        <span>₪{cartTotal}</span>
      </div>
      <div className="cart-popup-actions">
        <button className="cart-popup-btn cart-popup-btn--outline" onClick={onGoToCart}>
          לעגלה
        </button>
        <button className="cart-popup-btn cart-popup-btn--primary" onClick={onGoToCheckout}>
          לתשלום →
        </button>
      </div>
    </div>
  );
};
export default CartPopup;