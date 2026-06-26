const fs = require('fs');
const path = require('path');
const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc } = require("firebase/firestore");

// Custom .env parser to avoid dependency issues
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      if (key) {
        process.env[key] = val;
      }
    }
  });
  console.log("Environment variables loaded from .env");
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log("Initializing Firebase with project:", firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const animeItems = [
  {
    id: "acc_luffy_strawhat",
    type: "accessory",
    name: "Mũ Rơm Luffy",
    description: "Chiếc mũ rơm quý giá của Vua Hải Tặc tương lai, biểu tượng của ý chí tự do.",
    rarity: "epic",
    imageUrl: "https://res.cloudinary.com/dczte5kyo/image/upload/v1719000001/shiba_town/accessory/icon/luffy_strawhat.png",
    avatarUrl: "",
    booster: "",
    animation: "none",
    shardTarget: 3,
    japanesePoint: { 
      word: "麦わら帽子 (Mugiwara bōshi)", 
      meaning: "Mũ rơm", 
      grammarNote: "Mũ làm bằng rơm khô. Trong tiếng Nhật, 'Mugiwara' (麦わら) có nghĩa là rơm, còn 'Bōshi' (帽子) có nghĩa là mũ/nón." 
    },
    audioUrl: "",
    bonesPerHour: 0,
    hpBonus: 0,
    atkBonus: 15,
    defBonus: 5,
    critBonus: 0,
    rpgSlot: "head",
    isGacha: true,
    isShop: true,
    cost: 100
  },
  {
    id: "out_goku_gi",
    type: "outfit",
    name: "Võ Phục Quy Tông",
    description: "Bộ võ phục màu cam huyền thoại của môn phái Quy Lão Kame.",
    rarity: "legendary",
    imageUrl: "https://res.cloudinary.com/dczte5kyo/image/upload/v1719000002/shiba_town/outfit/icon/goku_gi.png",
    avatarUrl: "",
    booster: "",
    animation: "none",
    shardTarget: 5,
    japanesePoint: { 
      word: "道着 (Dōgi)", 
      meaning: "Võ phục", 
      grammarNote: "Đồng phục mặc khi luyện võ. Từ này ghép bởi chữ 'Đạo' (道 - con đường/học thuật) và 'Y' (着 - quần áo)." 
    },
    audioUrl: "",
    bonesPerHour: 0,
    hpBonus: 100,
    atkBonus: 30,
    defBonus: 20,
    critBonus: 0,
    rpgSlot: "armor",
    isGacha: true,
    isShop: true,
    cost: 250
  },
  {
    id: "acc_tanjiro_mask",
    type: "accessory",
    name: "Mặt Nạ Cáo Hộ Mệnh",
    description: "Mặt nạ cáo gỗ do Urokodaki khắc phép trừ tà để bảo vệ học trò.",
    rarity: "rare",
    imageUrl: "https://res.cloudinary.com/dczte5kyo/image/upload/v1719000003/shiba_town/accessory/icon/tanjiro_mask.png",
    avatarUrl: "",
    booster: "",
    animation: "none",
    shardTarget: 2,
    japanesePoint: { 
      word: "狐の面 (Kitsune no men)", 
      meaning: "Mặt nạ cáo", 
      grammarNote: "'Kitsune' (狐) nghĩa là con cáo. 'Men' (面) là mặt nạ. Mặt nạ cáo đóng vai trò tâm linh trừ tà rất lớn trong văn hóa cổ Nhật Bản." 
    },
    audioUrl: "",
    bonesPerHour: 0,
    hpBonus: 0,
    atkBonus: 0,
    defBonus: 15,
    critBonus: 3,
    rpgSlot: "earring",
    isGacha: true,
    isShop: false,
    cost: 50
  },
  {
    id: "acc_nezuko_bamboo",
    type: "accessory",
    name: "Ống Tre Khóa Quỷ Nezuko",
    description: "Ống tre nhỏ dùng để kìm hãm và khóa đi bản tính quỷ dữ của Nezuko.",
    rarity: "rare",
    imageUrl: "https://res.cloudinary.com/dczte5kyo/image/upload/v1719000004/shiba_town/accessory/icon/nezuko_bamboo.png",
    avatarUrl: "",
    booster: "",
    animation: "none",
    shardTarget: 2,
    japanesePoint: { 
      word: "竹筒 (Taketsutsu)", 
      meaning: "Ống tre", 
      grammarNote: "'Take' (竹) là tre. 'Tsutsu' (筒) nghĩa là ống/ống rỗng. Từ ghép biểu thị vật dụng hình ống làm từ thân cây tre." 
    },
    audioUrl: "",
    bonesPerHour: 0,
    hpBonus: 50,
    atkBonus: 0,
    defBonus: 10,
    critBonus: 0,
    rpgSlot: "earring",
    isGacha: true,
    isShop: true,
    cost: 60
  },
  {
    id: "acc_excalibur",
    type: "accessory",
    name: "Thánh Kiếm Excalibur",
    description: "Thanh bảo kiếm huyền thoại hội tụ hào quang của Vua Arthur.",
    rarity: "mythic",
    imageUrl: "https://res.cloudinary.com/dczte5kyo/image/upload/v1719000005/shiba_town/accessory/icon/excalibur.png",
    avatarUrl: "",
    booster: "",
    animation: "none",
    shardTarget: 8,
    japanesePoint: { 
      word: "聖剣 (Seiken)", 
      meaning: "Thánh kiếm", 
      grammarNote: "Ghép bởi chữ 'Thánh' (聖 - linh thiêng, cao quý) và 'Kiếm' (剣 - thanh kiếm). Ám chỉ vũ khí có quyền năng siêu nhiên bảo vệ lẽ phải." 
    },
    audioUrl: "",
    bonesPerHour: 0,
    hpBonus: 0,
    atkBonus: 60,
    defBonus: 0,
    critBonus: 12,
    rpgSlot: "gloves",
    isGacha: true,
    isShop: false,
    cost: 50
  },
  {
    id: "mount_shenron",
    type: "accessory",
    name: "Rồng Thần Shenron",
    description: "Rồng thần tối cao ngự trị bầu trời ban phát điều ước cho người sở hữu ngọc.",
    rarity: "divine",
    imageUrl: "https://res.cloudinary.com/dczte5kyo/image/upload/v1719000006/shiba_town/accessory/icon/shenron.png",
    avatarUrl: "",
    booster: "",
    animation: "none",
    shardTarget: 10,
    japanesePoint: { 
      word: "神龍 (Shinryū)", 
      meaning: "Rồng thần", 
      grammarNote: "'Shin' (神) là thần thánh, linh thiêng. 'Ryū/Ryuu' (龍) là rồng. Trong phim Dragon Ball, tên Rồng Thần được đọc theo âm Hán-Việt/Trung Quốc là Shenron." 
    },
    audioUrl: "",
    bonesPerHour: 0,
    hpBonus: 250,
    atkBonus: 0,
    defBonus: 35,
    critBonus: 5,
    rpgSlot: "mount",
    isGacha: true,
    isShop: false,
    cost: 50
  },
  {
    id: "aura_super_saiyan",
    type: "accessory",
    name: "Hào Quang Siêu Saiyan",
    description: "Lớp năng lượng ki bùng cháy màu vàng chói lọi bốc lên từ chiến binh Saiyan.",
    rarity: "legendary",
    imageUrl: "https://res.cloudinary.com/dczte5kyo/image/upload/v1719000007/shiba_town/accessory/icon/super_saiyan_aura.png",
    avatarUrl: "",
    booster: "",
    animation: "none",
    shardTarget: 5,
    japanesePoint: { 
      word: "オーラ (Ōra)", 
      meaning: "Hào quang khí tức", 
      grammarNote: "Từ mượn tiếng Anh 'Aura'. Dùng để chỉ tầng khí tức hay năng lượng đặc biệt bao bọc và tỏa ra xung quanh sinh vật." 
    },
    audioUrl: "",
    bonesPerHour: 0,
    hpBonus: 0,
    atkBonus: 40,
    defBonus: 0,
    critBonus: 10,
    rpgSlot: "aura",
    isGacha: true,
    isShop: true,
    cost: 300
  },
  {
    id: "cos_naruto_hokage",
    type: "costume",
    name: "Cải Trang Hokage Đệ Thất",
    description: "Bộ trang phục cải trang Hokage Đệ Thất Uzumaki Naruto đầy danh vọng.",
    rarity: "legendary",
    imageUrl: "https://res.cloudinary.com/dczte5kyo/image/upload/v1719000008/shiba_town/costume/icon/naruto_hokage.png",
    avatarUrl: "https://res.cloudinary.com/dczte5kyo/image/upload/v1719000008/shiba_town/costume/avatar/naruto_hokage.png",
    booster: "coin_boost_10",
    animation: "float",
    shardTarget: 6,
    japanesePoint: { 
      word: "火影 (Hokage)", 
      meaning: "Hỏa Ảnh", 
      grammarNote: "Chức vụ đứng đầu Làng Lá (Konoha). Ghép từ chữ 'Hỏa' (火 - lửa) và 'Ảnh' (影 - cái bóng). Tượng trưng cho người bảo hộ tối cao hệ Hỏa." 
    },
    audioUrl: "",
    bonesPerHour: 0,
    hpBonus: 120,
    atkBonus: 25,
    defBonus: 15,
    critBonus: 0,
    rpgSlot: "armor",
    isGacha: true,
    isShop: true,
    cost: 400
  },
  {
    id: "cos_luffy_gear5",
    type: "costume",
    name: "Cải Trang Thần Mặt Trời Nika",
    description: "Trạng thái thức tỉnh Nika giải phóng tự do tuyệt đối của Luffy Gear 5.",
    rarity: "divine",
    imageUrl: "https://res.cloudinary.com/dczte5kyo/image/upload/v1719000009/shiba_town/costume/icon/luffy_gear5.png",
    avatarUrl: "https://res.cloudinary.com/dczte5kyo/image/upload/v1719000009/shiba_town/costume/avatar/luffy_gear5.png",
    booster: "xp_boost_15",
    animation: "pulse",
    shardTarget: 10,
    japanesePoint: { 
      word: "太陽の神 (Taiyō no kami)", 
      meaning: "Thần Mặt Trời", 
      grammarNote: "'Taiyō' (太陽) nghĩa là mặt trời. Chữ 'no' (の) dùng kết nối thuộc sở hữu. 'Kami' (神) là thần thánh. Chỉ vị thần tối cao đem lại tự do." 
    },
    audioUrl: "",
    bonesPerHour: 0,
    hpBonus: 200,
    atkBonus: 50,
    defBonus: 0,
    critBonus: 15,
    rpgSlot: "armor",
    isGacha: true,
    isShop: false,
    cost: 50
  },
  {
    id: "theme_throne_heroes",
    type: "theme",
    name: "Đền Thờ Anh Hùng",
    description: "Giao diện hình nền đền thờ cổ kính tráng lệ nơi tụ hội các anh linh Servant.",
    rarity: "epic",
    imageUrl: "https://res.cloudinary.com/dczte5kyo/image/upload/v1719000010/shiba_town/theme/icon/throne_heroes.png",
    avatarUrl: "",
    booster: "",
    animation: "none",
    shardTarget: 3,
    japanesePoint: { 
      word: "英霊 (Eirei)", 
      meaning: "Anh linh / Linh hồn anh hùng", 
      grammarNote: "'Ei' (英) là xuất chúng, anh hùng. 'Rei' (霊) là linh hồn. Chỉ những linh hồn vĩ đại được triệu hồi làm Servant trong series Fate." 
    },
    audioUrl: "",
    bonesPerHour: 0,
    hpBonus: 0,
    atkBonus: 0,
    defBonus: 0,
    critBonus: 0,
    rpgSlot: "head",
    isGacha: true,
    isShop: true,
    cost: 150
  },
  {
    id: "meme_saitama_punch",
    type: "meme",
    name: "Một Đấm Thức Tỉnh Saitama",
    description: "Mẹo học tập siêu tốc mô phỏng cú đấm một phát đo ván của Thánh Phồng Tôm.",
    rarity: "common",
    imageUrl: "https://res.cloudinary.com/dczte5kyo/image/upload/v1719000011/shiba_town/meme/icon/saitama_punch.png",
    avatarUrl: "",
    booster: "",
    animation: "none",
    shardTarget: 2,
    japanesePoint: { 
      word: "一撃 (Ichigeki)", 
      meaning: "Một cú đấm / Một đòn", 
      grammarNote: "'Ichi' (一) là số một. 'Geki' (撃) nghĩa là đánh/tấn công. Dùng để nói về việc giải quyết trận đấu chỉ bằng một đòn tấn công duy nhất." 
    },
    audioUrl: "",
    bonesPerHour: 0,
    hpBonus: 0,
    atkBonus: 0,
    defBonus: 0,
    critBonus: 0,
    rpgSlot: "head",
    isGacha: true,
    isShop: false,
    cost: 50
  },
  {
    id: "fur_totoro_bed",
    type: "furniture",
    name: "Giường Ngủ Bụng Totoro",
    description: "Chiếc giường êm ái mô phỏng bụng khổng lồ mềm mại của thần rừng Totoro.",
    rarity: "epic",
    imageUrl: "https://res.cloudinary.com/dczte5kyo/image/upload/v1719000012/shiba_town/furniture/icon/totoro_bed.png",
    avatarUrl: "",
    booster: "",
    animation: "none",
    shardTarget: 4,
    japanesePoint: { 
      word: "森の主 (Mori no nushi)", 
      meaning: "Thần bảo hộ rừng già", 
      grammarNote: "'Mori' (森) là khu rừng rộng lớn. 'Nushi' (主) có nghĩa là vị chủ quản, thần linh cai quản khu vực đó." 
    },
    audioUrl: "",
    bonesPerHour: 12,
    hpBonus: 0,
    atkBonus: 0,
    defBonus: 0,
    critBonus: 0,
    rpgSlot: "head",
    isGacha: true,
    isShop: true,
    cost: 200,
    furnitureSlot: "floor",
    roomStyle: { bottom: "16%", left: "28%", width: "42%", height: "24%" }
  },
  {
    id: "buff_double_bones",
    type: "consumable",
    name: "Bùa Nhân Đôi Xương",
    description: "Lá bùa linh thú nhân đôi sản lượng Xương thu hoạch trong vòng 24 giờ.",
    rarity: "rare",
    imageUrl: "https://res.cloudinary.com/dczte5kyo/image/upload/v1719000013/shiba_town/consumable/icon/buff_double_bones.png",
    avatarUrl: "",
    booster: "",
    animation: "none",
    shardTarget: 1,
    japanesePoint: { 
      word: "倍増 (Baizō)", 
      meaning: "Nhân đôi / Tăng gấp đôi", 
      grammarNote: "Ghép bởi chữ 'Bội' (倍 - gấp lên) và 'Tăng' (増 - tăng lên). Thể hiện việc tăng gấp hai lần số lượng." 
    },
    audioUrl: "",
    bonesPerHour: 0,
    hpBonus: 0,
    atkBonus: 0,
    defBonus: 0,
    critBonus: 0,
    rpgSlot: "head",
    isGacha: false,
    isShop: true,
    cost: 50
  },
  {
    id: "buff_lucky_gacha",
    type: "consumable",
    name: "Bùa May Mắn Gacha",
    description: "Bùa may mắn đền thờ giúp tăng tỷ lệ nhận vật phẩm hiếm cho 5 lượt quay tiếp theo.",
    rarity: "epic",
    imageUrl: "https://res.cloudinary.com/dczte5kyo/image/upload/v1719000014/shiba_town/consumable/icon/buff_lucky_gacha.png",
    avatarUrl: "",
    booster: "",
    animation: "none",
    shardTarget: 1,
    japanesePoint: { 
      word: "幸運 (Kōun)", 
      meaning: "May mắn / Vận may tốt", 
      grammarNote: "Ghép bởi chữ 'Hạnh' (幸 - hạnh phúc) và 'Vận' (運 - vận mệnh). Biểu thị vận may tốt lành, tốt đẹp đến bất ngờ." 
    },
    audioUrl: "",
    bonesPerHour: 0,
    hpBonus: 0,
    atkBonus: 0,
    defBonus: 0,
    critBonus: 0,
    rpgSlot: "head",
    isGacha: false,
    isShop: true,
    cost: 80
  }
];

async function seed() {
  console.log(`Starting to seed ${animeItems.length} items with complete fields...`);
  for (const item of animeItems) {
    try {
      const docRef = doc(db, "system_items", item.id);
      await setDoc(docRef, item);
      console.log(`Successfully seeded complete item: ${item.name} (${item.id})`);
    } catch (e) {
      console.error(`Error seeding item ${item.id}:`, e);
    }
  }
  console.log("Seeding complete! 🚀");
  process.exit(0);
}

seed();
