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
      // Default community token addresses
      const defaultTokens = [
        '0x64FF4F3739daC4040C510C6a6b2190ac32ff4444',
        '0xa524b11473b7ce7eb1dc883a585e64471a734444',
        '0x58fc1d27d5acbfae0565b581b75da96c6c374444',
        '0x380bf199b3173cf7b3b321848ae1c5014a124444',
        '0x27B02Bc573023e0173854ff64b7beaf8A3c04444',
        '0x36765928c3d4aBf286f2B67120C093c26a284444',
      ];

      // Load community token list from localStorage or use default
      const storedTokens = JSON.parse(
        localStorage.getItem('communityTokens') || '[]'
      );
      
      // Combine stored tokens with default tokens (avoid duplicates)
      const communityTokenList = [...new Set([...defaultTokens, ...storedTokens])];

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
