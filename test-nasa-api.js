/**
 * QUICK NASA HORIZONS API TEST
 * Run: node test-nasa-api.js
 * 
 * PASS: If it returns position data
 * FAIL: If it times out or returns errors
 */

// Using native fetch (Node 18+)

async function testNASAHorizons() {
  console.log('🧪 Testing NASA Horizons API...\n');
  
  const tests = [
    {
      name: 'Test 1: Lookup 3I/ATLAS',
      url: 'https://ssd.jpl.nasa.gov/api/horizons_lookup.api?sstr=3I/ATLAS&group=com&format=json',
      timeout: 5000
    },
    {
      name: 'Test 2: Lookup C/2025 N1', 
      url: 'https://ssd.jpl.nasa.gov/api/horizons_lookup.api?sstr=C/2025%20N1&group=com&format=json',
      timeout: 5000
    },
    {
      name: 'Test 3: Get Earth position (control test)',
      url: 'https://ssd.jpl.nasa.gov/api/horizons.api?COMMAND=399&EPHEM_TYPE=VECTOR&CENTER=@sun&START_TIME=2025-10-01&STOP_TIME=2025-10-02&STEP_SIZE=1d&format=json&OUT_UNITS=AU-D&REF_SYSTEM=ICRF&VEC_TABLE=2',
      timeout: 10000
    }
  ];

  let allPassed = true;

  for (const test of tests) {
    try {
      console.log(`⏳ ${test.name}...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), test.timeout);
      
      const response = await fetch(test.url, { 
        signal: controller.signal,
        headers: { 'User-Agent': '3IAtlas/1.0' }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.log(`   ❌ FAIL: HTTP ${response.status} ${response.statusText}`);
        allPassed = false;
        continue;
      }
      
      const data = await response.json();
      
      if (data.count !== undefined && data.count === 0) {
        console.log(`   ⚠️  WARN: Found but count=0 (object may not exist in database)`);
      } else if (data.result) {
        console.log(`   ✅ PASS: Got data`);
      } else {
        console.log(`   ❌ FAIL: Unexpected response format`);
        allPassed = false;
      }
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log(`   ❌ FAIL: Timeout (>${test.timeout}ms)`);
      } else {
        console.log(`   ❌ FAIL: ${error.message}`);
      }
      allPassed = false;
    }
  }

  console.log('\n' + '='.repeat(60));
  if (allPassed) {
    console.log('✅ NASA HORIZONS API: WORKING');
    console.log('   Continue with current implementation');
  } else {
    console.log('❌ NASA HORIZONS API: FAILED');
    console.log('   Recommendation: Implement astronomy-engine fallback');
  }
  console.log('='.repeat(60));
  
  return allPassed;
}

testNASAHorizons().catch(console.error);
