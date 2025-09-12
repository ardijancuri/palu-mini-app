import { useState, useCallback } from 'react';

const useTokenData = () => {
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
      const tokenList = [
        '0xd743d3c50ebd82f9173b599383979d10f3494444', // $Totakeke
        '0xcf640fdf9b3d9e45cbd69fda91d7e22579c14444', // $Gorilla
        '0x47a1eb0b825b73e6a14807beaecafef199d5477c', // $CaptainBNB
        '0x29776fcd48e9506f9421cec21cd48304ff564444', // $Halou
        '0x9c27c4072738cf4b7b0b7071af0ad5666bddc096', // $NianNian
        '0x6f88dbed8f178f71f6a0c27df10d4f0b8ddf4444', // $U
        '0xa49fa5e8106e2d6d6a69e78df9b6a20aab9c4444', // $Donkey
        '0x11471f07151142960b2c008d86865798d69c4444', // $emmm
        '0xcaae2a2f939f51d97cdfa9a86e79e3f085b799f3', // $TUT
        '0x12b4356c65340fb02cdff01293f95febb1512f3b', // $Broccoli
        '0x9cb3ab4fb21cf910da2ce6800753dbd866784444', // $Clifford
        '0x04f5fd877b1448e94228f6377de3fa27d1df4444', // $MBGA
        '0x3a08a614ceb8b2380a022e5d35873fd2d8e64444'  // $Founder
      ];

      const results = await Promise.allSettled(
        tokenList.map(address => fetchJson(`/api/token/${address}`))
      );

      const successfulTokens = results
        .map((result, index) => {
          if (result.status === 'fulfilled' && result.value?.code === 0) {
            return { ...result.value.data, address: tokenList[index] };
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

export default useTokenData;
