require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_API_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Add VITE_SUPABASE_URL and SUPABASE_API_KEY to .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function exportAllData() {
  console.log('Exporting data from Supabase...');

  const tables = [
    'blog_posts',
    'blog_categories',
    'blog_tags',
    'blog_comments',
    'newsletter_subscribers',
    'blog_authors',
  ];

  const exportData = {};

  for (const table of tables) {
    console.log(`Fetching ${table}...`);
    let allData = [];
    let from = 0;
    const batchSize = 1000;

    while (true) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .range(from, from + batchSize - 1);

      if (error) {
        console.error(`Error fetching ${table}:`, error.message);
        break;
      }

      if (!data || data.length === 0) break;

      allData = allData.concat(data);
      from += batchSize;

      if (data.length < batchSize) break;
    }

    exportData[table] = allData;
    console.log(`  → ${allData.length} records`);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `supabase-export-${timestamp}.json`;

  fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
  console.log(`\nExported to ${filename}`);

  return exportData;
}

exportAllData().catch(console.error);