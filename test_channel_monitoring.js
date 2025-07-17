// Test script for Channel Monitoring System
const BASE_URL = 'http://localhost:5000/api';

async function testChannelMonitoring() {
  console.log('🔍 Testing Channel Monitoring System...\n');
  
  // Test 1: Extract channel info from different URLs
  console.log('📊 Test 1: Channel Info Extraction');
  const testUrls = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://www.youtube.com/watch?v=newvideo123',
    'https://www.youtube.com/channel/UCtest',
    'https://www.instagram.com/p/testpost/',
    'https://example.com/page'
  ];
  
  for (const url of testUrls) {
    try {
      const response = await fetch(`${BASE_URL}/channel/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const result = await response.json();
      console.log(`  ${url} -> ${result ? result.platformType || 'single_page' : 'null'}`);
    } catch (error) {
      console.log(`  ${url} -> Error: ${error.message}`);
    }
  }
  
  // Test 2: Check if URLs belong to registered channels
  console.log('\n🔗 Test 2: Channel Content Detection');
  const checkUrls = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Original registration
    'https://www.youtube.com/watch?v=newvideo123', // Same channel, different video
    'https://www.youtube.com/watch?v=unrelated456', // Different channel
    'https://example.com/other-page' // Different domain
  ];
  
  for (const url of checkUrls) {
    try {
      const response = await fetch(`${BASE_URL}/channel/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const result = await response.json();
      console.log(`  ${url}`);
      console.log(`    -> Is Channel Content: ${result.isChannelContent}`);
      console.log(`    -> Creator ID: ${result.creatorId || 'none'}`);
      console.log(`    -> Platform: ${result.channelMapping?.platformType || 'n/a'}`);
    } catch (error) {
      console.log(`  ${url} -> Error: ${error.message}`);
    }
  }
  
  // Test 3: Get creator channel mappings
  console.log('\n📋 Test 3: Creator Channel Mappings');
  try {
    const response = await fetch(`${BASE_URL}/creators/14/channels`);
    const mappings = await response.json();
    console.log('  Creator 14 Channel Mappings:');
    mappings.forEach((mapping, index) => {
      console.log(`    ${index + 1}. Platform: ${mapping.platformType}`);
      console.log(`       Channel ID: ${mapping.channelId}`);
      console.log(`       URL Pattern: ${mapping.urlPattern}`);
      console.log(`       Verification URL: ${mapping.verificationUrl}`);
    });
  } catch (error) {
    console.log(`  Error fetching mappings: ${error.message}`);
  }
  
  console.log('\n✅ Channel monitoring test completed!');
}

// Run the test
testChannelMonitoring().catch(console.error);