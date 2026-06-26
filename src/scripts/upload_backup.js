const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Read new .env (which will be updated by the user)
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

console.log('Connecting to NEW Firebase Project ID:', firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function uploadBackup() {
  const scratchDir = path.resolve(__dirname, '../../scratch');
  
  // 1. Upload system_items
  const itemsPath = path.join(scratchDir, 'backup_items.json');
  if (fs.existsSync(itemsPath)) {
    const items = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
    console.log(`Uploading ${items.length} system_items to Firestore...`);
    for (const item of items) {
      if (!item.id) continue;
      const docRef = doc(db, 'system_items', item.id);
      await setDoc(docRef, item);
      console.log(`Uploaded item: ${item.id} (${item.name})`);
    }
  } else {
    console.warn('Warning: backup_items.json not found.');
  }

  // 2. Upload daily_quests
  const questsPath = path.join(scratchDir, 'backup_quests.json');
  if (fs.existsSync(questsPath)) {
    const quests = JSON.parse(fs.readFileSync(questsPath, 'utf8'));
    console.log(`Uploading ${quests.length} daily_quests to Firestore...`);
    for (const quest of quests) {
      if (!quest.id) continue;
      const docRef = doc(db, 'daily_quests', quest.id);
      await setDoc(docRef, quest);
      console.log(`Uploaded quest: ${quest.id} (${quest.title})`);
    }
  } else {
    console.warn('Warning: backup_quests.json not found.');
  }

  // 3. Upload gacha_type_weights
  const weightsPath = path.join(scratchDir, 'backup_weights.json');
  if (fs.existsSync(weightsPath)) {
    const weights = JSON.parse(fs.readFileSync(weightsPath, 'utf8'));
    console.log('Uploading gacha_type_weights to Firestore...');
    const weightsRef = doc(db, 'system_config', 'gacha_type_weights');
    await setDoc(weightsRef, weights);
    console.log('Uploaded gacha_type_weights successfully!');
  } else {
    console.warn('Warning: backup_weights.json not found.');
  }

  console.log('\nAll backups successfully uploaded to the new Firebase project! 🎉');
}

uploadBackup();
