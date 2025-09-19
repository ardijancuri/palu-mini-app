import Token from '../../server/models/Token.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    // 1st Batch tokens (Dashboard)
    const firstBatchTokens = [
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

    // 2nd Batch tokens (Community)
    const secondBatchTokens = [
      '0x64FF4F3739daC4040C510C6a6b2190ac32ff4444',
      '0xa524b11473b7ce7eb1dc883a585e64471a734444',
      '0x58fc1d27d5acbfae0565b581b75da96c6c374444',
      '0x380bf199b3173cf7b3b321848ae1c5014a124444',
      '0x27B02Bc573023e0173854ff64b7beaf8A3c04444',
      '0x36765928c3d4aBf286f2B67120C093c26a284444',
    ];

    // Community page token
    const communityToken = '0xb75a7e8876df49a74cc4c76c6bda161a8ea4b483';

    // Combine all tokens
    const allTokens = [...firstBatchTokens, ...secondBatchTokens, communityToken];

    console.log('Initializing database with tokens:', allTokens.length);

    const results = [];
    const errors = [];

    // Add each token to the database
    for (const address of allTokens) {
      try {
        const token = await Token.create(address);
        results.push({ address, success: true, token });
        console.log(`✓ Added token: ${address}`);
      } catch (error) {
        errors.push({ address, error: error.message });
        console.log(`✗ Failed to add token: ${address} - ${error.message}`);
      }
    }

    const response = {
      success: true,
      message: `Database initialization completed`,
      summary: {
        total: allTokens.length,
        successful: results.length,
        failed: errors.length,
        firstBatch: firstBatchTokens.length,
        secondBatch: secondBatchTokens.length,
        community: 1
      },
      results,
      errors
    };

    console.log('Database initialization summary:', response.summary);
    res.status(200).json(response);

  } catch (err) {
    console.error('Error initializing database:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message,
      stack: err.stack 
    });
  }
}
