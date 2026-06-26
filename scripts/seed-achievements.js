const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc } = require("firebase/firestore");
const fs = require("fs");
const path = require("path");

// Hỗ trợ tự đọc file .env thủ công phòng trường hợp phiên bản Node.js cũ
try {
  const envPath = path.resolve(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    envContent.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        // Loại bỏ dấu nháy đơn/kép bao quanh nếu có
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

const achievements = [
  {
    id: "ach_streak_3",
    title: "Thắp Lửa Shiba",
    desc: "Đạt chuỗi học tập liên tục từ 3 ngày trở lên để sưởi ấm cho Shiba",
    imageUrl: "/images/ui/badges/streak_3.png",
    target: {
      field: "streak",
      value: 3
    },
    unit: "ngày"
  },
  {
    id: "ach_streak_10",
    title: "Kỷ Luật Thép",
    desc: "Học tập liên tục 10 ngày không ngừng nghỉ",
    imageUrl: "/images/ui/badges/streak_10.png",
    target: {
      field: "streak",
      value: 10
    },
    unit: "ngày"
  },
  {
    id: "ach_level_5",
    title: "Học Giả Tập Sự",
    desc: "Vượt qua cấp độ nhập môn để đạt Level 5",
    imageUrl: "/images/ui/badges/level_5.png",
    target: {
      field: "level",
      value: 5
    },
    unit: "cấp"
  },
  {
    id: "ach_level_15",
    title: "Đại Học Sĩ Shiba Town",
    desc: "Chinh phục Level 15 uyên bác",
    imageUrl: "/images/ui/badges/level_15.png",
    target: {
      field: "level",
      value: 15
    },
    unit: "cấp"
  },
  {
    id: "ach_vocab_30",
    title: "Vốn Từ Nho Nhỏ",
    desc: "Thuộc lòng 30 từ vựng tiếng Nhật đầu tiên",
    imageUrl: "/images/ui/badges/vocab_30.png",
    target: {
      field: "totalLearned",
      value: 30
    },
    unit: "từ"
  },
  {
    id: "ach_vocab_100",
    title: "Bách Khoa Toàn Thư",
    desc: "Thuộc lòng thành công 100 từ vựng",
    imageUrl: "/images/ui/badges/vocab_100.png",
    target: {
      field: "totalLearned",
      value: 100
    },
    unit: "từ"
  },
  {
    id: "ach_coins_500",
    title: "Đại Gia Shiba Town",
    desc: "Tích lũy được 500 xu vàng trong ví",
    imageUrl: "/images/ui/badges/coins_500.png",
    target: {
      field: "coins",
      value: 500
    },
    unit: "xu"
  },
  {
    id: "ach_fashion_5",
    title: "Tín Đồ Thời Trang",
    desc: "Sở hữu 5 món phụ kiện/trang phục từ Gacha",
    imageUrl: "/images/ui/badges/inventory_5.png",
    target: {
      field: "inventory",
      value: 5
    },
    unit: "món"
  }
];

async function seed() {
  console.log("Starting seeding achievements into Firestore...");
  for (const ach of achievements) {
    try {
      const docRef = doc(db, "system_achievements", ach.id);
      await setDoc(docRef, ach);
      console.log(`Successfully added achievement: ${ach.id} (${ach.title})`);
    } catch (e) {
      console.error(`Error adding achievement ${ach.id}:`, e);
    }
  }
  console.log("Seeding completed!");
  process.exit(0);
}

seed();
