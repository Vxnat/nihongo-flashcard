const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// 1. Read .env variables manually to avoid dependency issues
const envPath = path.resolve(__dirname, '../../.env');
if (!fs.existsSync(envPath)) {
  console.error('Error: .env file not found at ' + envPath);
  process.exit(1);
}
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const cleanLine = line.trim();
  if (!cleanLine || cleanLine.startsWith('#')) return;
  const eqIdx = cleanLine.indexOf('=');
  if (eqIdx > 0) {
    const key = cleanLine.substring(0, eqIdx).trim();
    const val = cleanLine.substring(eqIdx + 1).trim();
    env[key] = val;
  }
});

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log('Initializing Firebase with Project ID:', firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper function to safe parse JSON
function readJson(relativeFilePath) {
  const fullPath = path.resolve(__dirname, '../../', relativeFilePath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`Warning: File not found at ${fullPath}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

async function runMigration() {
  try {
    // 2. Load configurations
    const gachaPool = readJson('public/data/configs/gacha_pool.json') || [];
    const shopItems = readJson('public/data/configs/shop_items.json') || {};
    const dailyQuests = readJson('public/data/configs/daily_quests.json') || [];
    const typeWeights = readJson('public/data/configs/gacha_type_weights.json') || {};

    console.log(`Loaded: ${gachaPool.length} gacha items, ${dailyQuests.length} quests.`);

    // Map to hold unified items by ID
    const unifiedItems = new Map();

    // A. Add Gacha items
    gachaPool.forEach(item => {
      unifiedItems.set(item.id, {
        ...item,
        isGacha: true,
        isShop: false,
        cost: 0
      });
    });

    // B. Add Shop EXCLUSIVE_GOODS (and merge if duplicates exist)
    const exclusives = shopItems.EXCLUSIVE_GOODS || [];
    exclusives.forEach(item => {
      if (unifiedItems.has(item.id)) {
        const existing = unifiedItems.get(item.id);
        unifiedItems.set(item.id, {
          ...existing,
          ...item, // merges metadata
          isShop: true,
          cost: item.cost || 50
        });
      } else {
        unifiedItems.set(item.id, {
          ...item,
          isGacha: false,
          isShop: true,
          cost: item.cost || 50
        });
      }
    });

    // C. Add Shop CONSUMABLE_BUFFS
    const consumables = shopItems.CONSUMABLE_BUFFS || [];
    consumables.forEach(item => {
      // Consumables are not in gacha, only in shop
      unifiedItems.set(item.id, {
        ...item,
        type: 'consumable',
        isGacha: false,
        isShop: true,
        cost: item.cost || 50
      });
    });

    const itemsToUpload = Array.from(unifiedItems.values());
    console.log(`Unified items count: ${itemsToUpload.length}`);

    // D. Upload system_items to Firestore
    console.log('Uploading system_items...');
    for (const item of itemsToUpload) {
      if (!item.id) continue;
      const docRef = doc(db, 'system_items', item.id);
      await setDoc(docRef, item);
      console.log(`Uploaded item: ${item.id} (${item.name})`);
    }

    // E. Upload daily_quests to Firestore
    console.log('Uploading daily_quests...');
    for (const quest of dailyQuests) {
      if (!quest.id) continue;
      const docRef = doc(db, 'daily_quests', quest.id);
      await setDoc(docRef, quest);
      console.log(`Uploaded quest: ${quest.id} (${quest.title})`);
    }

    // F. Upload gacha_type_weights to system_config/gacha_type_weights
    console.log('Uploading gacha_type_weights...');
    const weightsRef = doc(db, 'system_config', 'gacha_type_weights');
    await setDoc(weightsRef, typeWeights);
    console.log('Uploaded gacha_type_weights successfully!');

    console.log('\nMigration completed successfully! 🎉');
  } catch (error) {
    console.error('Migration failed with error:', error);
  }
}

runMigration();
