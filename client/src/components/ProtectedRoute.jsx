import { useAuth }  from '../context/AuthContext';
import AuthForm     from './AuthForm';
const UnauthorizedPage = ({ onGoBack }) => (
  <div className="unauthorized">
    <span className="unauthorized-icon">🚫</span>
    <h2>אין לך הרשאה לדף זה</h2>
    <p>הדף הזה מיועד למנהלים בלבד.</p>
    <button className="add-btn" onClick={onGoBack}>חזור לחנות</button>
  </div>
);
const ProtectedRoute = ({ children, allowedRoles, onUnauthorized }) => {
  const { isLoggedIn, loading, user } = useAuth();
  if (loading)    return <div className="loading">טוען...</div>;
  if (!isLoggedIn) return <AuthForm />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <UnauthorizedPage onGoBack={onUnauthorized} />;
  }
  return children;
};
export default ProtectedRoute;