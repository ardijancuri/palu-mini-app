#!/usr/bin/env node

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Token from '../server/models/Token.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

async function initializeTokens() {
  console.log('🚀 Initializing database with tokens...\n');

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

  console.log(`📊 Total tokens to add: ${allTokens.length}`);
  console.log(`   - 1st Batch: ${firstBatchTokens.length} tokens`);
  console.log(`   - 2nd Batch: ${secondBatchTokens.length} tokens`);
  console.log(`   - Community: 1 token\n`);

  const results = [];
  const errors = [];

  // Add each token to the database
  for (let i = 0; i < allTokens.length; i++) {
    const address = allTokens[i];
    const batch = i < firstBatchTokens.length ? '1st Batch' : 
                  i < firstBatchTokens.length + secondBatchTokens.length ? '2nd Batch' : 
                  'Community';
    
    try {
      const token = await Token.create(address);
      results.push({ address, batch, success: true });
      console.log(`✅ [${batch}] Added: ${address}`);
    } catch (error) {
      errors.push({ address, batch, error: error.message });
      console.log(`❌ [${batch}] Failed: ${address} - ${error.message}`);
    }
  }

  console.log('\n📈 Summary:');
  console.log(`   ✅ Successful: ${results.length}`);
  console.log(`   ❌ Failed: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(({ address, batch, error }) => {
      console.log(`   [${batch}] ${address}: ${error}`);
    });
  }

  console.log('\n🎉 Database initialization completed!');
  
  // Close database connection
  process.exit(0);
}

// Run the initialization
initializeTokens().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
