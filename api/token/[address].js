import https from 'https';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { address } = req.query;
  if (!address) {
    return res.status(400).json({ error: 'Missing address' });
  }

  const target = `https://four.meme/meme-api/v1/private/token/get/v2?address=${encodeURIComponent(address)}`;

  try {
    const response = await fetch(target);
    
    if (!response.ok) {
      console.error(`API Error for ${address}: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({ 
        error: 'External API error', 
        status: response.status,
        statusText: response.statusText 
      });
    }
    
    const data = await response.json();
    console.log(`API Success for ${address}:`, data);
    
    res.status(response.status).json(data);
  } catch (err) {
    console.error(`API Error for ${address}:`, err);
    res.status(502).json({ error: 'Upstream error', detail: err.message });
  }
}
