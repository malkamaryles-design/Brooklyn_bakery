import { useState, useEffect, useRef } from 'react';
import { useAuth }    from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthForm       from './components/AuthForm';
import ShopPage       from './pages/ShopPage';
import CartPage       from './pages/CartPage';
import CheckoutPage   from './pages/CheckoutPage';
import AccountPage    from './pages/AccountPage';
import AdminPage      from './pages/AdminPage';
import './styles/App.css';
const VALID = ['shop','cart','checkout','account','admin'];
const read = () => {
  const p = window.location.pathname.slice(1).split(/[#?]/)[0];
  return VALID.includes(p) ? p : 'shop';
};
const App = () => {
  const {
    user, isLoggedIn, loading,
    isLoginModalOpen, closeLoginModal, pendingCheckout, clearPendingCheckout,
  } = useAuth();
  const [page, setPage] = useState(read);
  function go(p) {
    if (p === page) return;
    window.history.pushState(null, '', '/' + p);
    setPage(p);
  }
  useEffect(() => {
    function onPop() { setPage(read()); }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  useEffect(() => {
    window.history.replaceState(null, '', '/' + page);
  }, []);
  const prev = useRef(isLoggedIn);
  useEffect(() => {
    if (isLoggedIn && !prev.current && pendingCheckout) {
      clearPendingCheckout();
      go('checkout');
    }
    if (!isLoggedIn && prev.current) go('shop');
    prev.current = isLoggedIn;
  }, [isLoggedIn]);
  if (loading) return <div className="loading">טוען...</div>;
  const modal = isLoginModalOpen && (
    <div className="login-modal-overlay" onClick={closeLoginModal}>
      <div className="login-modal-content" onClick={e => e.stopPropagation()}>
        <button className="login-modal-close" onClick={closeLoginModal}>✕</button>
        <AuthForm />
      </div>
    </div>
  );
  let view;
  switch (page) {
    case 'admin':
      view = <ProtectedRoute allowedRoles={['admin']} onUnauthorized={() => go('shop')}><AdminPage onGoToShop={() => go('shop')} /></ProtectedRoute>;
      break;
    case 'checkout':
      view = isLoggedIn
        ? <CheckoutPage onSuccess={() => go('shop')} onCancel={() => go('cart')} />
        : <ProtectedRoute><CheckoutPage onSuccess={() => go('shop')} onCancel={() => go('cart')} /></ProtectedRoute>;
      break;
    case 'account':
      view = <ProtectedRoute onUnauthorized={() => go('shop')}><AccountPage onGoToShop={() => go('shop')} /></ProtectedRoute>;
      break;
    case 'cart':
      view = <CartPage onGoToShop={() => go('shop')} onGoToCheckout={() => go('checkout')} />;
      break;
    default:
      view = <ShopPage onGoToCart={() => go('cart')} onGoToCheckout={() => go('checkout')} onGoToAccount={() => go('account')} onGoToAdmin={user?.role === 'admin' ? () => go('admin') : null} />;
  }
  return <>{view}{modal}</>;
};
export default App;