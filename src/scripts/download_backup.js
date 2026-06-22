const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');

// Read current .env
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

console.log('Connecting to OLD Firebase Project ID:', firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function downloadBackup() {
  try {
    const backupDir = path.resolve(__dirname, '../../scratch');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // 1. Fetch system_items
    console.log('Fetching system_items...');
    const itemsSnap = await getDocs(collection(db, 'system_items'));
    const items = [];
    itemsSnap.forEach(doc => {
      const data = doc.data();
      // Auto convert .svg to .png in imageUrl
      if (data.imageUrl && data.imageUrl.endsWith('.svg')) {
        data.imageUrl = data.imageUrl.replace(/\.svg$/, '.png');
      }
      items.push({ id: doc.id, ...data });
    });
    fs.writeFileSync(
      path.join(backupDir, 'backup_items.json'),
      JSON.stringify(items, null, 2),
      'utf8'
    );
    console.log(`Saved ${items.length} items to scratch/backup_items.json (with PNG paths).`);

    // 2. Fetch daily_quests
    console.log('Fetching daily_quests...');
    const questsSnap = await getDocs(collection(db, 'daily_quests'));
    const quests = [];
    questsSnap.forEach(doc => {
      quests.push({ id: doc.id, ...doc.data() });
    });
    fs.writeFileSync(
      path.join(backupDir, 'backup_quests.json'),
      JSON.stringify(quests, null, 2),
      'utf8'
    );
    console.log(`Saved ${quests.length} quests to scratch/backup_quests.json.`);

    // 3. Fetch gacha_type_weights
    console.log('Fetching gacha_type_weights...');
    const weightsSnap = await getDoc(doc(db, 'system_config', 'gacha_type_weights'));
    const weights = weightsSnap.exists() ? weightsSnap.data() : {};
    fs.writeFileSync(
      path.join(backupDir, 'backup_weights.json'),
      JSON.stringify(weights, null, 2),
      'utf8'
    );
    console.log('Saved type weights to scratch/backup_weights.json.');

    console.log('\nBackup successfully finished! 📦');
  } catch (error) {
    console.error('Backup failed:', error);
  }
}

downloadBackup();
