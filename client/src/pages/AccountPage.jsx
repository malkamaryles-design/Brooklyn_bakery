import { useState } from 'react';
import { useAuth }         from '../context/AuthContext';
import { getMyOrders }     from '../services/orderService';
import { updateProfile, changePassword }   from '../services/authService';
import useFetch            from '../hooks/useFetch';
import { formatDate }      from '../utils/formatDate';
import PageHeader          from '../components/PageHeader';
import OrderCard           from '../components/OrderCard';
const AccountPage = ({ onGoToShop }) => {
  const { user, logout, isLoggedIn } = useAuth();
  const { data: orders, loading, error } = useFetch(getMyOrders, 'לא ניתן לטעון הזמנות');
  const [activeTab, setActiveTab] = useState('orders'); 
  const [profileForm, setProfileForm] = useState({
    name:  user?.name  || '',
    email: user?.email || '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg]       = useState('');
  const [isEditing, setIsEditing]         = useState(false);
  const [passwordForm, setPasswordForm]   = useState({ current: '', newPass: '', confirm: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg]     = useState('');
  const handleProfileSave = async () => {
    setProfileSaving(true);
    setProfileMsg('');
    try {
      await updateProfile(profileForm);
      setProfileMsg('הפרטים עודכנו בהצלחה ✓');
      setIsEditing(false);
    } catch (err) {
      setProfileMsg(err.message || 'שגיאה בעדכון');
    } finally {
      setProfileSaving(false);
    }
  };
  const handlePasswordChange = async () => {
    setPasswordMsg('');
    if (!passwordForm.current || !passwordForm.newPass) {
      return setPasswordMsg('יש למלא את כל השדות');
    }
    if (passwordForm.newPass.length < 6) {
      return setPasswordMsg('סיסמה חדשה חייבת להכיל לפחות 6 תווים');
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      return setPasswordMsg('הסיסמאות לא תואמות');
    }
    setPasswordSaving(true);
    try {
      await changePassword(passwordForm.current, passwordForm.newPass);
      setPasswordMsg('הסיסמה שונתה בהצלחה ✓');
      setPasswordForm({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      setPasswordMsg(err.message || 'שגיאה בשינוי סיסמה');
    } finally {
      setPasswordSaving(false);
    }
  };
  const [searchDate, setSearchDate] = useState('');
  const filteredOrders = (orders || []).filter((order) => {
    if (!searchDate) return true;
    const orderDate = new Date(order.createdAt).toLocaleDateString('he-IL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
    return orderDate.includes(searchDate);
  });
  return (
    <div dir="rtl">
      <PageHeader
        logo="/branding/logo.png"
        onGoToShop={onGoToShop}
        onLogout={isLoggedIn ? logout : null}
      />
      <main>
        <section className="admin-section">
          <h2>שלום, {user?.name}</h2>
        </section>
        {}
        <div className="admin-tabs">
          <button
            className={`admin-tab${activeTab === 'orders' ? ' admin-tab--active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📦 ההזמנות שלי
          </button>
          <button
            className={`admin-tab${activeTab === 'profile' ? ' admin-tab--active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            ✏️ פרופיל
          </button>
        </div>
        {}
        {activeTab === 'profile' && (
          <section className="admin-section">
            <h2>פרטים אישיים</h2>
            <div className="checkout-form">
              <label>שם</label>
              <input
                value={profileForm.name}
                disabled={!isEditing}
                onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
              />
              <label>אימייל</label>
              <input
                type="email"
                value={profileForm.email}
                disabled={!isEditing}
                onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
              />
              {profileMsg && <p className={profileMsg.includes('✓') ? 'success-msg' : 'error'}>{profileMsg}</p>}
              {!isEditing ? (
                <button className="add-btn" onClick={() => setIsEditing(true)}>
                  ✏️ ערוך פרטים
                </button>
              ) : (
                <div className="flex-row-gap-sm">
                  <button className="add-btn" onClick={handleProfileSave} disabled={profileSaving}>
                    {profileSaving ? 'שומר...' : 'שמור'}
                  </button>
                  <button className="outline-btn" onClick={() => { setIsEditing(false); setProfileMsg(''); }}>
                    ביטול
                  </button>
                </div>
              )}
            </div>
            {}
            <div className="checkout-form" style={{}}>
              <h3 style={{ marginTop: '24px', marginBottom: '12px', color: '#ff2d8a' }}>שינוי סיסמה</h3>
              <label>סיסמה נוכחית</label>
              <input
                type="password"
                value={passwordForm.current}
                onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))}
                placeholder="הסיסמה הנוכחית"
              />
              <label>סיסמה חדשה</label>
              <input
                type="password"
                value={passwordForm.newPass}
                onChange={(e) => setPasswordForm((p) => ({ ...p, newPass: e.target.value }))}
                placeholder="סיסמה חדשה (6+ תווים)"
              />
              <label>אימות סיסמה חדשה</label>
              <input
                type="password"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))}
                placeholder="הקלד שוב את הסיסמה החדשה"
              />
              {passwordMsg && <p className={passwordMsg.includes('✓') ? 'success-msg' : 'error'}>{passwordMsg}</p>}
              <button className="add-btn" onClick={handlePasswordChange} disabled={passwordSaving}>
                {passwordSaving ? 'מעדכן...' : '🔒 שנה סיסמה'}
              </button>
            </div>
          </section>
        )}
        {}
        {activeTab === 'orders' && (
          <section className="admin-section">
            <h2>ההזמנות שלי</h2>
            {}
            <div className="margin-bottom-md">
              <input
                type="text"
                placeholder="חפש לפי תאריך (למשל 15/06/2026)"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="search-input"
              />
            </div>
            {loading && <p className="loading">טוען הזמנות...</p>}
            {error   && <p className="error">{error}</p>}
            {!loading && filteredOrders.length === 0 && (
              <div className="empty-cart">
                <span className="empty-cart-icon">📦</span>
                <h3>{searchDate ? 'לא נמצאו הזמנות בתאריך זה' : 'אין הזמנות עדיין'}</h3>
                {!searchDate && <p>לאחר שתבצע הזמנה היא תופיע כאן.</p>}
                {!searchDate && <button className="add-btn" onClick={onGoToShop}>לחנות</button>}
              </div>
            )}
            {!loading && filteredOrders.map((order) => (
              <OrderCard key={order._id} order={order} formatDate={formatDate} />
            ))}
          </section>
        )}
      </main>
    </div>
  );
};
export default AccountPage;