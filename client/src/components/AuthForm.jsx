import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { loginUser, registerUser } from '../services/authService';
import { validateEmail, validatePassword, validateName } from '../utils/validators';
const AuthForm = () => {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const validate = () => {
    const e = {};
    if (isRegister && !validateName(name))  e.name     = 'שם חייב להכיל לפחות 2 תווים';
    if (!validateEmail(email))              e.email    = 'כתובת אימייל לא תקינה';
    if (!validatePassword(password))        e.password = 'הסיסמה חייבת להכיל לפחות 6 תווים';
    return e;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const data = isRegister
        ? await registerUser(name.trim(), email, password)
        : await loginUser(email, password);
      login(data.token, data.user ?? null);
      window.history.replaceState(null, '', '/shop');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };
  const switchMode = () => {
    setIsRegister((s) => !s);
    setErrors({});
    setServerError('');
    setName('');
  };
  return (
    <div className="auth-form">
      <h2>{isRegister ? 'הרשמה' : 'התחברות'}</h2>
      <form onSubmit={handleSubmit} noValidate>
        {}
        {isRegister && (
          <>
            <input
              type="text"
              placeholder="שם מלא *"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </>
        )}
        <input
          type="email"
          placeholder="אימייל"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.email && <p className="field-error">{errors.email}</p>}
        <input
          type="password"
          placeholder="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.password && <p className="field-error">{errors.password}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? 'שולח...' : isRegister ? 'הרשמה' : 'התחברות'}
        </button>
      </form>
      {serverError && <p className="error">{serverError}</p>}
      <p className="auth-toggle" onClick={switchMode}>
        {isRegister ? 'כבר יש לך חשבון? התחבר' : 'אין לך חשבון? הירשם'}
      </p>
    </div>
  );
};
export default AuthForm;