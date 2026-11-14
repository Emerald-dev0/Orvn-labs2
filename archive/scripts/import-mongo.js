require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');
const fs = require('fs');

const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
const dbName = process.env.MONGODB_DB || 'orvn-blog';

if (!mongoUri) {
  console.error('Missing MONGODB_URI in .env.local');
  process.exit(1);
}

async function importToMongo(exportFile) {
  if (!fs.existsSync(exportFile)) {
    console.error(`Export file not found: ${exportFile}`);
    process.exit(1);
  }

  console.log(`Reading ${exportFile}...`);
  const exportData = JSON.parse(fs.readFileSync(exportFile, 'utf8'));

  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);

    for (const [table, records] of Object.entries(exportData)) {
      if (!records || records.length === 0) {
        console.log(`Skipping ${table} (empty)`);
        continue;
      }

      const collection = db.collection(table);

      // Clear existing data (optional - comment out to keep existing)
      await collection.deleteMany({});
      console.log(`Cleared ${table}`);

      // Transform: convert Supabase UUIDs to MongoDB ObjectIds where needed
      // and handle special fields
      const docs = records.map(doc => ({
        ...doc,
        _id: doc.id ? doc.id : undefined, // Use Supabase UUID as _id if present
        created_at: doc.created_at ? new Date(doc.created_at) : new Date(),
        updated_at: doc.updated_at ? new Date(doc.updated_at) : new Date(),
        published_at: doc.published_at ? new Date(doc.published_at) : null,
      })).filter(doc => doc._id); // Only insert if we have an ID

      if (docs.length > 0) {
        const result = await collection.insertMany(docs, { ordered: false });
        console.log(`Inserted ${result.insertedCount} documents into ${table}`);
      }
    }

    console.log('\nImport complete!');
    console.log('Collections created:', Object.keys(exportData).filter(k => exportData[k].length > 0).join(', '));

  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await client.close();
  }
}

const exportFile = process.argv[2];
if (!exportFile) {
  console.error('Usage: node import-mongo.js <export-file.json>');
  process.exit(1);
}

importToMongo(exportFile).catch(console.error);