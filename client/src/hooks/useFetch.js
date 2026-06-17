import { useState, useEffect, useCallback } from 'react';
const useFetch = (fetchFn, errorMsg = 'שגיאה בטעינת הנתונים') => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchFn()
      .then((result) => { setData(result); setLoading(false); })
      .catch(() => { setError(errorMsg); setLoading(false); });
  }, [fetchFn, errorMsg]);
  useEffect(() => { load(); }, [load]);
  return { data, loading, error, reload: load };
};
export default useFetch;