# Supabase Keep-Alive Script
# Run manually or via cron to prevent Supabase free tier from pausing

require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

async function pingSupabase() {
  const endpoints = [
    { url: `${SUPABASE_URL}/rest/v1/`, name: 'REST API' },
    { url: `${SUPABASE_URL}/auth/v1/health`, name: 'Auth Health' },
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint.url, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        signal: AbortSignal.timeout(30000),
      });
      console.log(`✓ ${endpoint.name}: HTTP ${response.status}`);
    } catch (error) {
      console.error(`✗ ${endpoint.name}: ${error.message}`);
    }
  }
}

pingSupabase();