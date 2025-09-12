import { useState, useCallback } from 'react';

const useCommunityData = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchJson = async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  };

  const loadTokens = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load community token list from localStorage or use default
      const communityTokenList = JSON.parse(
        localStorage.getItem('communityTokens') || '[]'
      );

      if (communityTokenList.length === 0) {
        setTokens([]);
        return;
      }

      const results = await Promise.allSettled(
        communityTokenList.map(address => fetchJson(`/api/token/${address}`))
      );

      const successfulTokens = results
        .map((result, index) => {
          if (result.status === 'fulfilled' && result.value?.code === 0) {
            return { ...result.value.data, address: communityTokenList[index] };
          }
          return null;
        })
        .filter(Boolean);

      setTokens(successfulTokens);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { tokens, loading, error, loadTokens };
};

export default useCommunityData;
