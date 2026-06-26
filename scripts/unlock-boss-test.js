const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc } = require("firebase/firestore");
const fs = require("fs");
const path = require("path");

// Load environment variables from .env
try {
  const envPath = path.resolve(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    envContent.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
          value = value.substring(1, value.length - 1);
        }
        if (value.length > 0 && value.charAt(0) === "'" && value.charAt(value.length - 1) === "'") {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    });
    console.log("Loaded environment variables from .env successfully.");
  }
} catch (e) {
  console.warn("Unable to load .env manually:", e.message);
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.projectId) {
  console.error("Error: FIREBASE_PROJECT_ID is missing from environment. Please check your .env file.");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Read card IDs of sys_n5_kana_01
const deckFilePath = path.resolve(__dirname, "../public/data/decks/n5/sys_n5_kana_01.json");
if (!fs.existsSync(deckFilePath)) {
  console.error("Error: sys_n5_kana_01.json not found at", deckFilePath);
  process.exit(1);
}

try {
  const cardsData = JSON.parse(fs.readFileSync(deckFilePath, "utf8"));
  const cardIds = cardsData.map(card => card.id);
  console.log(`Loaded ${cardIds.length} card IDs from sys_n5_kana_01.json`);

  const docId = "BZ3HD8VJIgPjVG3J6YeiwPK7FdB2_sys_n5_kana_01";
  const progressData = {
    userId: "BZ3HD8VJIgPjVG3J6YeiwPK7FdB2",
    deckId: "sys_n5_kana_01",
    knownIds: cardIds,
    bossStatus: "boss_unlocked",
    bossFailedAttempts: 0,
    updatedAt: new Date().toISOString()
  };

  async function run() {
    try {
      const docRef = doc(db, "user_progress", docId);
      await setDoc(docRef, progressData, { merge: true });
      console.log(`Successfully updated doc user_progress/${docId} with boss_unlocked status!`);
      process.exit(0);
    } catch (error) {
      console.error("Error updating progress doc:", error);
      process.exit(1);
    }
  }

  run();
} catch (err) {
  console.error("Failed to parse JSON file or run update:", err);
  process.exit(1);
}
