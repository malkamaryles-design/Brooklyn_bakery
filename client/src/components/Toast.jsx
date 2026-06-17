import { useState, useEffect } from 'react';
const Toast = ({ message }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!message) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 2500);
    return () => clearTimeout(t);
  }, [message]);
  return <div id="toast" className={visible ? 'show' : ''}>{message}</div>;
};
export default Toast;