import Token from '../../server/models/Token.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      try {
        const tokens = await Token.getAll();
        res.status(200).json({ success: true, data: tokens });
      } catch (dbError) {
        console.error('Database error when getting tokens:', dbError);
        // Return empty array if database is not available
        res.status(200).json({ success: true, data: [] });
      }
    } else if (req.method === 'POST') {
      const { address } = req.body;
      if (!address) {
        return res.status(400).json({ success: false, error: 'Address is required' });
      }
      try {
        const token = await Token.create(address);
        res.status(201).json({ success: true, data: token });
      } catch (dbError) {
        console.error('Database error when creating token:', dbError);
        // Return success even if database fails
        res.status(201).json({ 
          success: true, 
          data: { address, like_count: 0 },
          warning: 'Database temporarily unavailable'
        });
      }
    } else {
      res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
