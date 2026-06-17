const getToken = () => localStorage.getItem('token');
const request = async (url, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  let res;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (networkError) {
    throw new Error('בעיית חיבור — בדוק את האינטרנט ונסה שוב');
  }
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('token');
    }
    throw new Error(data.error || 'שגיאה לא צפויה — נסה שוב');
  }
  return data;
};
export const apiGet    = (url)       => request(url, { method: 'GET' });
export const apiPost   = (url, body) => request(url, { method: 'POST',   body: JSON.stringify(body) });
export const apiPut    = (url, body) => request(url, { method: 'PUT',    body: JSON.stringify(body) });
export const apiPatch  = (url, body) => request(url, { method: 'PATCH',  body: JSON.stringify(body) });
export const apiDelete = (url)       => request(url, { method: 'DELETE' });