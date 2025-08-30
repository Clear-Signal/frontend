import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const apiURL = import.meta.env.VITE_APP_URL;

export default function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch function (can be reused for refetch)
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios({
        url: `${apiURL}${url}`,
        method: options.method || "GET",
        headers: options.headers || {},
        data: options.body || null,
        params: options.params || {},
        withCredentials: true
      });
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [url, JSON.stringify(options)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}