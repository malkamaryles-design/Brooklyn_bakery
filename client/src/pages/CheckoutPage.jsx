import { useState } from 'react';
import { useCart }  from '../context/CartContext';
import { useAuth }  from '../context/AuthContext';
import { placeOrder } from '../services/orderService';
import { STATUS_LABELS } from '../constants/orderStatus';
import { validateEmail, validatePhone } from '../utils/validators';
const STEPS = ['פרטים אישיים', 'משלוח', 'תשלום', 'סיכום'];
const CheckoutPage = ({ onSuccess, onCancel }) => {
  const { cart, cartCount, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [step, setStep]       = useState(0);
  const [submitting, setSub]  = useState(false);
  const [error, setError]     = useState('');
  const [placedOrder, setPlaced] = useState(null);
  const [customer, setCustomer] = useState({
    name:  user?.name  || '',
    email: user?.email || '',
    phone: '',
  });
  const [delivery, setDelivery] = useState({ type: 'pickup' });
  const [address, setAddress] = useState({
    city: '',
    street: '',
    houseNumber: '',
    apartment: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('store'); 
  const [cardForm, setCardForm] = useState({
    number: '',
    expiry: '',
    cvv: '',
    holderName: '',
  });
  const validateStep = () => {
    if (step === 0) {
      if (!customer.name.trim())         return 'שם מלא הוא שדה חובה';
      if (!validateEmail(customer.email)) return 'אימייל לא תקין';
      if (!validatePhone(customer.phone)) return 'מספר טלפון לא תקין';
    }
    if (step === 1 && delivery.type === 'delivery') {
      if (!address.city.trim())        return 'עיר היא שדה חובה';
      if (!address.street.trim())      return 'רחוב הוא שדה חובה';
      if (!address.houseNumber.trim()) return 'מספר בית הוא שדה חובה';
    }
    if (step === 2 && paymentMethod === 'card') {
      if (!cardForm.number.trim() || cardForm.number.replace(/\s/g, '').length < 16)
        return 'מספר כרטיס לא תקין';
      if (!cardForm.expiry.trim())     return 'תוקף כרטיס נדרש';
      if (!cardForm.cvv.trim() || cardForm.cvv.length < 3)
        return 'CVV לא תקין';
      if (!cardForm.holderName.trim()) return 'שם בעל הכרטיס נדרש';
    }
    return null;
  };
  const handleNext = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    setStep((s) => s + 1);
  };
  const buildAddressString = () => {
    const parts = [address.street, address.houseNumber, address.apartment, address.city]
      .filter(Boolean);
    return parts.join(', ');
  };
  const handleSubmit = async () => {
    setSub(true);
    setError('');
    try {
      const orderDelivery = delivery.type === 'pickup'
        ? { type: 'pickup', address: '' }
        : { type: 'delivery', address: buildAddressString() };
      const { order } = await placeOrder({ customer, delivery: orderDelivery });
      clearCart();
      setPlaced(order);
    } catch (err) {
      setError(err.message);
    } finally {
      setSub(false);
    }
  };
  if (placedOrder) {
    return (
      <div className="checkout-page" dir="rtl">
        <div className="checkout-success">
          <span className="checkout-success-icon">🎉</span>
          <h2>ההזמנה התקבלה!</h2>
          <p>תודה {customer.name}, ההזמנה שלך בדרך.</p>
          <div className="checkout-order-summary">
            <p><strong>מספר הזמנה:</strong> #{placedOrder._id.slice(-6).toUpperCase()}</p>
            <p><strong>סטטוס:</strong> {STATUS_LABELS[placedOrder.status]}</p>
            <p><strong>סה״כ:</strong> ₪{placedOrder.total}</p>
          </div>
          <div className="checkout-success-actions">
            <button className="add-btn" onClick={onSuccess}>חזרה לחנות</button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="checkout-page" dir="rtl">
      {}
      <header className="checkout-header">
        <button className="outline-btn" onClick={onCancel}>← חזור לעגלה</button>
        <h1>תשלום</h1>
      </header>
      {}
      <div className="checkout-steps">
        {STEPS.map((label, i) => (
          <div key={i} className={`checkout-step${i === step ? ' active' : i < step ? ' done' : ''}`}>
            <span className="checkout-step-num">{i < step ? '✓' : i + 1}</span>
            <span className="checkout-step-label">{label}</span>
          </div>
        ))}
      </div>
      <div className="checkout-body">
        {}
        {step === 0 && (
          <section className="checkout-section">
            <h2>פרטים אישיים</h2>
            <div className="checkout-form">
              <label>שם מלא *</label>
              <input
                placeholder="ישראל ישראלי"
                value={customer.name}
                onChange={(e) => setCustomer((p) => ({ ...p, name: e.target.value }))}
              />
              <label>אימייל *</label>
              <input
                type="email"
                placeholder="israel@example.com"
                value={customer.email}
                onChange={(e) => setCustomer((p) => ({ ...p, email: e.target.value }))}
              />
              <label>טלפון *</label>
              <input
                type="tel"
                placeholder="050-0000000"
                value={customer.phone}
                onChange={(e) => setCustomer((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
          </section>
        )}
        {}
        {step === 1 && (
          <section className="checkout-section">
            <h2>אפשרות משלוח</h2>
            <div className="checkout-delivery-options">
              <label className={`delivery-option${delivery.type === 'pickup' ? ' selected' : ''}`}>
                <input
                  type="radio"
                  name="delivery"
                  value="pickup"
                  checked={delivery.type === 'pickup'}
                  onChange={() => setDelivery({ type: 'pickup' })}
                />
                <span className="delivery-option-icon">🏪</span>
                <div>
                  <strong>איסוף עצמי</strong>
                  <p>איסוף מהמאפייה — ללא עלות נוספת</p>
                </div>
              </label>
              <label className={`delivery-option${delivery.type === 'delivery' ? ' selected' : ''}`}>
                <input
                  type="radio"
                  name="delivery"
                  value="delivery"
                  checked={delivery.type === 'delivery'}
                  onChange={() => { setDelivery({ type: 'delivery' }); setPaymentMethod('card'); }}
                />
                <span className="delivery-option-icon">🚚</span>
                <div>
                  <strong>משלוח לבית</strong>
                  <p>משלוח עד הבית</p>
                </div>
              </label>
            </div>
            {delivery.type === 'delivery' && (
              <div className="checkout-form margin-top-md">
                <label>עיר *</label>
                <input
                  placeholder="תל אביב"
                  value={address.city}
                  onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))}
                />
                <label>רחוב *</label>
                <input
                  placeholder="הרצל"
                  value={address.street}
                  onChange={(e) => setAddress((p) => ({ ...p, street: e.target.value }))}
                />
                <label>מספר בית *</label>
                <input
                  placeholder="12"
                  value={address.houseNumber}
                  onChange={(e) => setAddress((p) => ({ ...p, houseNumber: e.target.value }))}
                />
                <label>קומה / דירה</label>
                <input
                  placeholder="קומה 3, דירה 8"
                  value={address.apartment}
                  onChange={(e) => setAddress((p) => ({ ...p, apartment: e.target.value }))}
                />
              </div>
            )}
          </section>
        )}
        {}
        {step === 2 && (
          <section className="checkout-section">
            <h2>תשלום</h2>
            <div className="checkout-delivery-options margin-bottom-md">
              {delivery.type === 'pickup' && (
                <label className={`delivery-option${paymentMethod === 'store' ? ' selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'store'}
                    onChange={() => setPaymentMethod('store')}
                  />
                  <span className="delivery-option-icon">💵</span>
                  <div>
                    <strong>תשלום בחנות</strong>
                    <p>תשלום בעת האיסוף</p>
                  </div>
                </label>
              )}
              <label className={`delivery-option${paymentMethod === 'card' ? ' selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                />
                <span className="delivery-option-icon">💳</span>
                <div>
                  <strong>כרטיס אשראי</strong>
                  <p>תשלום מאובטח באשראי</p>
                </div>
              </label>
            </div>
            {paymentMethod === 'card' && (
              <div className="checkout-form">
                <div className="checkout-payment-note margin-bottom-md">
                  <span>🔒</span>
                  <p>דף תשלום מאובטח (דימוי — לא נשמר)</p>
                </div>
                <label>מספר כרטיס *</label>
                <input
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  value={cardForm.number}
                  onChange={(e) => setCardForm((p) => ({ ...p, number: e.target.value }))}
                />
                <div className="flex-row-gap-md">
                  <div className="flex-1">
                    <label>תוקף *</label>
                    <input
                      placeholder="MM/YY"
                      maxLength={5}
                      value={cardForm.expiry}
                      onChange={(e) => setCardForm((p) => ({ ...p, expiry: e.target.value }))}
                    />
                  </div>
                  <div className="flex-1">
                    <label>CVV *</label>
                    <input
                      type="password"
                      placeholder="•••"
                      maxLength={4}
                      value={cardForm.cvv}
                      onChange={(e) => setCardForm((p) => ({ ...p, cvv: e.target.value }))}
                    />
                  </div>
                </div>
                <label>שם בעל הכרטיס *</label>
                <input
                  placeholder="ישראל ישראלי"
                  value={cardForm.holderName}
                  onChange={(e) => setCardForm((p) => ({ ...p, holderName: e.target.value }))}
                />
              </div>
            )}
          </section>
        )}
        {}
        {step === 3 && (
          <section className="checkout-section">
            <h2>סיכום הזמנה</h2>
            <div className="checkout-summary-block">
              <h3>פרטים אישיים</h3>
              <p>{customer.name} · {customer.phone}</p>
              <p>{customer.email}</p>
            </div>
            <div className="checkout-summary-block">
              <h3>משלוח</h3>
              <p>{delivery.type === 'pickup'
                ? '🏪 איסוף עצמי'
                : `🚚 ${address.street} ${address.houseNumber}${address.apartment ? `, ${address.apartment}` : ''}, ${address.city}`}
              </p>
            </div>
            <div className="checkout-summary-block">
              <h3>תשלום</h3>
              <p>{paymentMethod === 'store'
                ? '💵 תשלום בחנות'
                : `💳 כרטיס אשראי ****${cardForm.number.slice(-4)}`}
              </p>
            </div>
            <div className="checkout-summary-block">
              <h3>פריטים ({cartCount})</h3>
              {cart.map((item) => (
                <div key={item._id || item.productId} className="checkout-item-row">
                  <span>{item.name} × {item.quantity}</span>
                  <span>₪{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="checkout-item-row checkout-total-row">
                <strong>סה״כ לתשלום</strong>
                <strong>₪{cartTotal}</strong>
              </div>
            </div>
          </section>
        )}
        {}
        {error && <p className="error checkout-error">{error}</p>}
        {}
        <div className="checkout-nav">
          {step > 0 && (
            <button className="outline-btn" onClick={() => { setStep((s) => s - 1); setError(''); }}>
              הקודם
            </button>
          )}
          {step < 3 ? (
            <button className="add-btn" onClick={handleNext}>הבא →</button>
          ) : (
            <button className="add-btn checkout-confirm-btn" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'שולח...' : 'אישור הזמנה ✓'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default CheckoutPage;