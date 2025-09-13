import Like from '../../../server/models/Like.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { address } = req.query;
    console.log('Like request for address:', address);
    
    if (!address) {
      return res.status(400).json({ success: false, error: 'Address is required' });
    }

    const userIp = req.headers['x-forwarded-for'] || 
                   req.headers['x-real-ip'] || 
                   req.connection?.remoteAddress || 
                   '127.0.0.1';

    console.log('User IP:', userIp);

    if (req.method === 'POST') {
      console.log('Adding like for address:', address);
      
      // First, ensure the token exists in the database
      const Token = (await import('../../../server/models/Token.js')).default;
      await Token.create(address);
      
      const like = await Like.addLike(address, userIp);
      const likeCount = await Like.getLikeCount(address);
      
      console.log('Like added successfully:', { like, likeCount });
      res.status(200).json({ success: true, data: { liked: true, likeCount } });
    } else {
      res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }
  } catch (err) {
    console.error('Error in like API:', err);
    res.status(500).json({ success: false, error: err.message, stack: err.stack });
  }
}
