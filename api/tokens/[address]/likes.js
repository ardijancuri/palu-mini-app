import Like from '../../../server/models/Like.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { address } = req.query;
    console.log('Likes request for address:', address);
    
    if (!address) {
      return res.status(400).json({ success: false, error: 'Address is required' });
    }

    const userIp = req.headers['x-forwarded-for'] || 
                   req.headers['x-real-ip'] || 
                   req.connection?.remoteAddress || 
                   '127.0.0.1';

    if (req.method === 'GET') {
      console.log('Getting likes for address:', address);
      
      const likeCount = await Like.getLikeCount(address);
      const hasLiked = await Like.hasUserLiked(address, userIp);
      
      console.log('Likes data:', { likeCount, hasLiked });
      res.status(200).json({ success: true, data: { likeCount, hasLiked } });
    } else {
      res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }
  } catch (err) {
    console.error('Error in likes API:', err);
    res.status(500).json({ success: false, error: err.message, stack: err.stack });
  }
}
