// 國立臺中科技大學 週末美食資料庫：一中街、第二市場、第五市場
// 2026-11-15 結合 PTT / Dcard 網友真實好評（非業配），並於 Google 地圖逐家核對：營業狀態、評分、地址、步行時間與六日營業時間
// 距離計算起點：
// - 一中街：三民校區大門（臺中市北區三民路三段 129 號）
// - 第二市場、第五市場：民生校區大門（臺中市西區三民路一段 193 號）

function buildGoogleMapsUrl(name, address) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${address}`)}`;
}

const CAMPUS_INFO = {
  yizhong: {
    id: 'yizhong',
    name: '一中街',
    originLabel: '三民校區大門',
    gateAddress: '北區三民路三段 129 號',
    nearbyMealMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('一中街 附近 平價正餐 便當 麵食'),
    nearbyDrinkMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('一中街 點心 手搖飲 飲料店')
  },
  market2: {
    id: 'market2',
    name: '第二市場',
    originLabel: '民生校區大門',
    gateAddress: '西區三民路一段 193 號',
    nearbyMealMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('台中第二市場 附近 平價正餐 魯肉飯 麵食'),
    nearbyDrinkMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('台中第二市場 點心 手搖飲 飲料')
  },
  market5: {
    id: 'market5',
    name: '第五市場',
    originLabel: '民生校區大門',
    gateAddress: '西區三民路一段 193 號',
    nearbyMealMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('台中第五市場 附近 平價正餐 麵線 爌肉飯'),
    nearbyDrinkMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('台中第五市場 點心 手搖飲 紅茶')
  }
};

const STORES = [
  // ==================== 一中街：150元內正餐（從三民校區步行計算） ====================
  {
    id: 'yz-meal-1',
    campus: 'yizhong',
    category: 'meal',
    name: '八方雲集（台中雙十店）',
    address: '臺中市北區雙十路二段47-5號',
    distanceMeters: 560,
    walkMinutes: 7,
    rating: 4.8,
    priceRange: '$65–$135',
    maxPrice: 135,
    highlights: ['招牌鍋貼', '玉米濃湯'],
    hours: {
      sat: { open: true, text: '11:00–14:30' },
      sun: { open: true, text: '11:00–14:30' }
    }
  },
  {
    id: 'yz-meal-2',
    campus: 'yizhong',
    category: 'meal',
    name: '食初 - 職人雞肉飯 一中店',
    address: '臺中市北區三民路三段126巷3號',
    distanceMeters: 120,
    walkMinutes: 2,
    rating: 4.7,
    priceRange: '$65–$115',
    maxPrice: 115,
    highlights: ['炸蛋雞魯飯', '椒麻滷肉飯'],
    hours: {
      sat: { open: true, text: '11:00–19:20' },
      sun: { open: true, text: '11:00–19:20' }
    }
  },
  {
    id: 'yz-meal-3',
    campus: 'yizhong',
    category: 'meal',
    name: '鉄人麵倉',
    address: '臺中市北區育才北路18號',
    distanceMeters: 210,
    walkMinutes: 3,
    rating: 4.7,
    priceRange: '$55–$145',
    maxPrice: 145,
    highlights: ['客製湯麵', '手作乾拌麵'],
    hours: {
      sat: { open: true, text: '11:00–14:00' },
      sun: { open: true, text: '11:00–14:00' }
    }
  },
  {
    id: 'yz-meal-4',
    campus: 'yizhong',
    category: 'meal',
    name: '丸亀製麵（台中一中店）',
    address: '臺中市北區一中街96號2樓',
    distanceMeters: 290,
    walkMinutes: 4,
    rating: 4.7,
    priceRange: '$79–$149',
    maxPrice: 149,
    highlights: ['豚骨烏龍麵', '豆皮烏龍麵'],
    hours: {
      sat: { open: true, text: '11:00–21:30' },
      sun: { open: true, text: '11:00–21:30' }
    }
  },
  {
    id: 'yz-meal-5',
    campus: 'yizhong',
    category: 'meal',
    name: '小蜜蜂炒麵',
    address: '臺中市北區育才街4號',
    distanceMeters: 220,
    walkMinutes: 3,
    rating: 4.6,
    priceRange: '$45–$85',
    maxPrice: 85,
    highlights: ['銅板炒麵', '大腸豬血湯'],
    hours: {
      sat: { open: true, text: '06:00–14:00' },
      sun: { open: true, text: '06:00–14:00' }
    }
  },
  {
    id: 'yz-meal-6',
    campus: 'yizhong',
    category: 'meal',
    name: '阿堂豬肉麵線',
    address: '臺中市北區一中街23-1號',
    distanceMeters: 280,
    walkMinutes: 4,
    rating: 4.5,
    priceRange: '$50–$80',
    maxPrice: 80,
    highlights: ['柴魚清湯麵線', '嫩滷大腸'],
    hours: {
      sat: { open: true, text: '11:00–20:00（依現場為主）' },
      sun: { open: true, text: '11:00–20:00（依現場為主）' }
    }
  },
  {
    id: 'yz-meal-7',
    campus: 'yizhong',
    category: 'meal',
    name: '忠武海苔飯捲便當',
    address: '臺中市北區育才南街37號',
    distanceMeters: 310,
    walkMinutes: 4,
    rating: 4.4,
    priceRange: '$85–$130',
    maxPrice: 130,
    highlights: ['海苔飯捲', '韓式拌飯'],
    hours: {
      sat: { open: true, text: '11:00–14:00' },
      sun: { open: false, text: '週日公休' }
    }
  },
  {
    id: 'yz-meal-8',
    campus: 'yizhong',
    category: 'meal',
    name: '茶罐子',
    address: '臺中市北區錦新街72號',
    distanceMeters: 360,
    walkMinutes: 5,
    rating: 4.4,
    priceRange: '$85–$120',
    maxPrice: 120,
    highlights: ['平價主菜便當', '配菜清爽'],
    hours: {
      sat: { open: true, text: '11:00–18:00' },
      sun: { open: false, text: '週日公休' }
    }
  },
  {
    id: 'yz-meal-9',
    campus: 'yizhong',
    category: 'meal',
    name: '和記傻瓜麵',
    address: '臺中市北區太平路119號',
    distanceMeters: 360,
    walkMinutes: 5,
    rating: 4.3,
    priceRange: '$45–$95',
    maxPrice: 95,
    highlights: ['烏醋乾麵', '貢丸蛋包湯'],
    hours: {
      sat: { open: true, text: '10:30–19:30' },
      sun: { open: true, text: '10:30–19:30' }
    }
  },
  {
    id: 'yz-meal-10',
    campus: 'yizhong',
    category: 'meal',
    name: '有智老麵店',
    address: '臺中市北區三民路三段67號',
    distanceMeters: 310,
    walkMinutes: 4,
    rating: 4.2,
    priceRange: '$45–$95',
    maxPrice: 95,
    highlights: ['古早味陽春麵', '綜合滷味'],
    hours: {
      sat: { open: true, text: '10:30–16:00' },
      sun: { open: false, text: '週日公休' }
    }
  },
  {
    id: 'yz-meal-11',
    campus: 'yizhong',
    category: 'meal',
    name: '二口美食 一中店',
    address: '臺中市北區一中街83-2號',
    distanceMeters: 295,
    walkMinutes: 4,
    rating: 4.1,
    priceRange: '$75–$125',
    maxPrice: 125,
    highlights: ['雙拼鐵板飯', '沙茶肉絲炒麵'],
    hours: {
      sat: { open: true, text: '11:00–21:30' },
      sun: { open: true, text: '11:00–21:30' }
    }
  },
  {
    id: 'yz-meal-12',
    campus: 'yizhong',
    category: 'meal',
    name: '王印製麵',
    address: '臺中市北區太平路65-1號',
    distanceMeters: 350,
    walkMinutes: 5,
    rating: 4.1,
    priceRange: '$50–$100',
    maxPrice: 100,
    highlights: ['麻辣乾麵', '麻醬麵'],
    hours: {
      sat: { open: true, text: '11:30–20:00' },
      sun: { open: true, text: '11:30–20:00' }
    }
  },

  // ==================== 一中街：點心＋手搖飲（從三民校區步行計算） ====================
  {
    id: 'yz-sd-1',
    campus: 'yizhong',
    category: 'snackdrink',
    subCategory: 'drink',
    name: '八曜和茶 台中中友三民店',
    address: '臺中市北區三民路三段193號',
    distanceMeters: 320,
    walkMinutes: 4,
    rating: 4.8,
    priceRange: '$45–$79',
    maxPrice: 79,
    highlights: ['柚香覺醒307', '牧場308鮮奶茶'],
    hours: {
      sat: { open: true, text: '10:00–22:00' },
      sun: { open: true, text: '10:00–22:00' }
    }
  },
  {
    id: 'yz-sd-2',
    campus: 'yizhong',
    category: 'snackdrink',
    subCategory: 'drink',
    name: '再睡5分鐘 台中一中店',
    address: '臺中市北區一中街129號',
    distanceMeters: 340,
    walkMinutes: 5,
    rating: 4.8,
    priceRange: '$55–$95',
    maxPrice: 95,
    highlights: ['棉被厚奶蓋', '日安紅歐蕾'],
    hours: {
      sat: { open: true, text: '12:05–20:30' },
      sun: { open: true, text: '12:05–20:30' }
    }
  },
  {
    id: 'yz-sd-3',
    campus: 'yizhong',
    category: 'snackdrink',
    subCategory: 'snack',
    name: '天使雞排-一中店',
    address: '臺中市北區一中街60號',
    distanceMeters: 300,
    walkMinutes: 4,
    rating: 4.8,
    priceRange: '$100',
    maxPrice: 100,
    highlights: ['超厚切炸雞排', '多汁酥脆'],
    hours: {
      sat: { open: true, text: '12:00–23:00' },
      sun: { open: true, text: '12:00–23:00' }
    }
  },
  {
    id: 'yz-sd-4',
    campus: 'yizhong',
    category: 'snackdrink',
    subCategory: 'drink',
    name: '迷客夏 臺中一中店',
    address: '臺中市北區三民路三段193-4號',
    distanceMeters: 330,
    walkMinutes: 4,
    rating: 4.7,
    priceRange: '$45–$85',
    maxPrice: 85,
    highlights: ['大正紅茶拿鐵', '芋頭鮮奶'],
    hours: {
      sat: { open: true, text: '10:00–22:00' },
      sun: { open: true, text: '10:00–22:00' }
    }
  },
  {
    id: 'yz-sd-5',
    campus: 'yizhong',
    category: 'snackdrink',
    subCategory: 'drink',
    name: '豐味綠豆沙牛乳專門店-一中店',
    address: '臺中市北區太平路63巷1號',
    distanceMeters: 350,
    walkMinutes: 5,
    rating: 4.6,
    priceRange: '$40–$70',
    maxPrice: 70,
    highlights: ['綿密綠豆沙牛乳', '珍珠紅豆沙'],
    hours: {
      sat: { open: true, text: '12:00–22:00' },
      sun: { open: true, text: '12:00–22:00' }
    }
  },
  {
    id: 'yz-sd-6',
    campus: 'yizhong',
    category: 'snackdrink',
    subCategory: 'drink',
    name: '得正 #台中一中計劃',
    address: '臺中市北區一中街100號',
    distanceMeters: 300,
    walkMinutes: 4,
    rating: 4.5,
    priceRange: '$35–$65',
    maxPrice: 65,
    highlights: ['焙烏龍鮮奶', '檸檬春烏龍'],
    hours: {
      sat: { open: true, text: '10:30–22:00' },
      sun: { open: true, text: '10:30–22:00' }
    }
  },
  {
    id: 'yz-sd-7',
    campus: 'yizhong',
    category: 'snackdrink',
    subCategory: 'drink',
    name: '50嵐（一中店）',
    address: '臺中市北區育才街8-2號',
    distanceMeters: 250,
    walkMinutes: 3,
    rating: 4.3,
    priceRange: '$35–$65',
    maxPrice: 65,
    highlights: ['四季春珍波椰', '紅茶瑪奇朵'],
    hours: {
      sat: { open: true, text: '09:00–23:00' },
      sun: { open: true, text: '09:00–23:00' }
    }
  },
  {
    id: 'yz-sd-8',
    campus: 'yizhong',
    category: 'snackdrink',
    subCategory: 'drink',
    name: '多多茶坊',
    address: '臺中市北區尊賢街38號',
    distanceMeters: 370,
    walkMinutes: 5,
    rating: 4.2,
    priceRange: '$25–$50',
    maxPrice: 50,
    highlights: ['隱藏版核廢料', '銅板手搖飲'],
    hours: {
      sat: { open: true, text: '10:30–22:00' },
      sun: { open: true, text: '10:30–22:00' }
    }
  },
  {
    id: 'yz-sd-9',
    campus: 'yizhong',
    category: 'snackdrink',
    subCategory: 'snack',
    name: '一中豐仁冰',
    address: '臺中市北區育才街3巷4-6號',
    distanceMeters: 240,
    walkMinutes: 3,
    rating: 4.2,
    priceRange: '$45–$60',
    maxPrice: 60,
    highlights: ['酸梅冰沙', '蜜紅豆冰淇淋'],
    hours: {
      sat: { open: true, text: '12:00–22:00' },
      sun: { open: true, text: '12:00–22:00' }
    }
  },
  {
    id: 'yz-sd-10',
    campus: 'yizhong',
    category: 'snackdrink',
    subCategory: 'snack',
    name: '盧の堡半月燒餡餅一中直營店',
    address: '臺中市北區育才南街33號',
    distanceMeters: 360,
    walkMinutes: 5,
    rating: 4.2,
    priceRange: '$45–$75',
    maxPrice: 75,
    highlights: ['九層塔半月燒', '起司豬肉燒'],
    hours: {
      sat: { open: true, text: '13:00–21:30' },
      sun: { open: true, text: '13:00–21:30' }
    }
  },
  {
    id: 'yz-sd-11',
    campus: 'yizhong',
    category: 'snackdrink',
    subCategory: 'snack',
    name: '上和園滷味',
    address: '臺中市北區育才街4號',
    distanceMeters: 225,
    walkMinutes: 3,
    rating: 4.0,
    priceRange: '$35–$90',
    maxPrice: 90,
    highlights: ['雞爪凍', '冷藏豆干鴨翅'],
    hours: {
      sat: { open: true, text: '08:00–22:00' },
      sun: { open: true, text: '08:00–22:00' }
    }
  },
  {
    id: 'yz-sd-12',
    campus: 'yizhong',
    category: 'snackdrink',
    subCategory: 'snack',
    name: '胖子雞丁雞排',
    address: '臺中市北區一中街20號',
    distanceMeters: 290,
    walkMinutes: 4,
    rating: 3.5,
    priceRange: '$60–$95',
    maxPrice: 95,
    highlights: ['無骨雞丁', '炸百頁米血'],
    hours: {
      sat: { open: false, text: '週六 17:30 才開（中午休）' },
      sun: { open: true, text: '11:30–22:30' }
    }
  },

  // ==================== 第二市場：150元內正餐（從民生校區步行計算） ====================
  {
    id: 'm2-meal-1',
    campus: 'market2',
    category: 'meal',
    name: '越南法國麵包工藝',
    address: '臺中市中區臺灣大道一段338號',
    distanceMeters: 520,
    walkMinutes: 8,
    rating: 4.4,
    priceRange: '$75–$120',
    maxPrice: 120,
    highlights: ['招牌綜合夾心', '蒜味奶油脆餅'],
    hours: {
      sat: { open: true, text: '08:00–19:00' },
      sun: { open: true, text: '08:00–19:00' }
    }
  },
  {
    id: 'm2-meal-2',
    campus: 'market2',
    category: 'meal',
    name: '承記米苔目',
    address: '臺中市中區三民路二段87號（第二市場）',
    distanceMeters: 460,
    walkMinutes: 7,
    rating: 4.3,
    priceRange: '$45–$85',
    maxPrice: 85,
    highlights: ['古早味肉燥米苔目', '乾意麵湯麵'],
    hours: {
      sat: { open: true, text: '07:30–13:30' },
      sun: { open: true, text: '07:30–13:30' }
    }
  },
  {
    id: 'm2-meal-3',
    campus: 'market2',
    category: 'meal',
    name: '立偉麵食',
    address: '臺中市中區三民路二段87號攤位175',
    distanceMeters: 455,
    walkMinutes: 7,
    rating: 4.1,
    priceRange: '$45–$100',
    maxPrice: 100,
    highlights: ['一麵三吃麻醬麵', '花生麻醬自加'],
    hours: {
      sat: { open: true, text: '09:00–15:00' },
      sun: { open: true, text: '09:00–15:00' }
    }
  },
  {
    id: 'm2-meal-4',
    campus: 'market2',
    category: 'meal',
    name: '丁山肉丸',
    address: '臺中市中區臺灣大道一段370號',
    distanceMeters: 540,
    walkMinutes: 8,
    rating: 4.0,
    priceRange: '$50–$110',
    maxPrice: 110,
    highlights: ['百年老店肉丸', '餛飩意麵'],
    hours: {
      sat: { open: true, text: '10:30–19:00' },
      sun: { open: true, text: '10:30–19:00' }
    }
  },
  {
    id: 'm2-meal-5',
    campus: 'market2',
    category: 'meal',
    name: '嵐肉燥專賣店',
    address: '臺中市中區三民路二段87號（第二市場）',
    distanceMeters: 460,
    walkMinutes: 7,
    rating: 4.0,
    priceRange: '$45–$130',
    maxPrice: 130,
    highlights: ['香蔥肉燥飯', '梅花肉飯'],
    hours: {
      sat: { open: true, text: '09:00–14:30' },
      sun: { open: true, text: '09:00–14:30' }
    }
  },
  {
    id: 'm2-meal-6',
    campus: 'market2',
    category: 'meal',
    name: '阿嬤a相思麵店',
    address: '臺中市中區三民路二段87號（第二市場）',
    distanceMeters: 465,
    walkMinutes: 7,
    rating: 3.9,
    priceRange: '$45–$100',
    maxPrice: 100,
    highlights: ['白乾麵麻醬麵', '蘿蔔糕綜合湯'],
    hours: {
      sat: { open: true, text: '07:00–18:00' },
      sun: { open: true, text: '07:00–18:00' }
    }
  },
  {
    id: 'm2-meal-7',
    campus: 'market2',
    category: 'meal',
    name: '山河魯肉飯',
    address: '臺中市中區三民路二段87號（第二市場）',
    distanceMeters: 450,
    walkMinutes: 7,
    rating: 3.8,
    priceRange: '$50–$135',
    maxPrice: 135,
    highlights: ['腿庫滷肉飯', '麻薏吻仔魚湯'],
    hours: {
      sat: { open: true, text: '05:30–15:00' },
      sun: { open: true, text: '05:30–15:00' }
    }
  },
  {
    id: 'm2-meal-8',
    campus: 'market2',
    category: 'meal',
    name: '阿棋 三代福州意麵老店',
    address: '臺中市中區三民路二段1之7號',
    distanceMeters: 445,
    walkMinutes: 7,
    rating: 3.7,
    priceRange: '$50–$110',
    maxPrice: 110,
    highlights: ['手工乾意麵', '綜合魚丸湯'],
    hours: {
      sat: { open: true, text: '08:30–17:30' },
      sun: { open: true, text: '08:30–17:30' }
    }
  },
  {
    id: 'm2-meal-9',
    campus: 'market2',
    category: 'meal',
    name: '王家菜頭粿糯米腸',
    address: '臺中市中區三民路二段87號（第二市場）',
    distanceMeters: 440,
    walkMinutes: 7,
    rating: 3.5,
    priceRange: '$55–$90',
    maxPrice: 90,
    highlights: ['菜頭粿加蛋', '糯米腸三樣套餐'],
    hours: {
      sat: { open: true, text: '06:30–18:00' },
      sun: { open: true, text: '06:30–18:00' }
    }
  },
  {
    id: 'm2-meal-10',
    campus: 'market2',
    category: 'meal',
    name: '顏記肉包餛飩湯',
    address: '臺中市中區三民路二段103號',
    distanceMeters: 470,
    walkMinutes: 7,
    rating: 3.3,
    priceRange: '$35–$110',
    maxPrice: 110,
    highlights: ['筍丁鮮肉包', '傳統餛飩湯'],
    hours: {
      sat: { open: true, text: '08:00–17:30' },
      sun: { open: true, text: '08:00–17:30' }
    }
  },

  // ==================== 第二市場：點心＋手搖飲（從民生校區步行計算） ====================
  {
    id: 'm2-sd-1',
    campus: 'market2',
    category: 'snackdrink',
    subCategory: 'drink',
    name: '迷客夏Milksha 臺中第二市場店',
    address: '臺中市中區臺灣大道一段362號',
    distanceMeters: 530,
    walkMinutes: 8,
    rating: 4.7,
    priceRange: '$45–$85',
    maxPrice: 85,
    highlights: ['珍珠紅茶拿鐵', '青檸香茶'],
    hours: {
      sat: { open: true, text: '10:00–20:00' },
      sun: { open: true, text: '10:00–20:00' }
    }
  },
  {
    id: 'm2-sd-2',
    campus: 'market2',
    category: 'snackdrink',
    subCategory: 'drink',
    name: '吉鋒愛玉檸檬',
    address: '臺中市中區大同街41號',
    distanceMeters: 490,
    walkMinutes: 7,
    rating: 4.5,
    priceRange: '$40–$60',
    maxPrice: 60,
    highlights: ['手洗檸檬愛玉', '酸甜消暑解膩'],
    hours: {
      sat: { open: true, text: '09:00–18:00' },
      sun: { open: true, text: '09:00–18:00' }
    }
  },
  {
    id: 'm2-sd-3',
    campus: 'market2',
    category: 'snackdrink',
    subCategory: 'snack',
    name: '天天饅頭',
    address: '臺中市中區台灣大道一段336巷',
    distanceMeters: 510,
    walkMinutes: 8,
    rating: 4.4,
    priceRange: '$6–$60',
    maxPrice: 60,
    highlights: ['現炸紅豆小饅頭', '銅板古早點心'],
    hours: {
      sat: { open: true, text: '09:00–18:00' },
      sun: { open: true, text: '09:00–18:00' }
    }
  },
  {
    id: 'm2-sd-4',
    campus: 'market2',
    category: 'snackdrink',
    subCategory: 'snack',
    name: '鄒氏餡餅蔥油餅',
    address: '臺中市中區三民路二段（第二市場外側）',
    distanceMeters: 445,
    walkMinutes: 7,
    rating: 4.4,
    priceRange: '$35–$70',
    maxPrice: 70,
    highlights: ['爆汁牛肉餡餅', '香酥蔥油餅'],
    hours: {
      sat: { open: true, text: '12:00–18:00' },
      sun: { open: true, text: '12:00–18:00' }
    }
  },
  {
    id: 'm2-sd-5',
    campus: 'market2',
    category: 'snackdrink',
    subCategory: 'drink',
    name: '旺咖啡 ONE coffee',
    address: '臺中市中區三民路二段85號（第二市場1-11號攤）',
    distanceMeters: 460,
    walkMinutes: 7,
    rating: 4.4,
    priceRange: '$55–$110',
    maxPrice: 110,
    highlights: ['市場手沖單品', '拿鐵冰咖啡'],
    hours: {
      sat: { open: true, text: '09:00–17:30' },
      sun: { open: true, text: '09:00–17:30' }
    }
  },
  {
    id: 'm2-sd-6',
    campus: 'market2',
    category: 'snackdrink',
    subCategory: 'drink',
    name: '麻古茶坊（台中第二市場店）',
    address: '臺中市中區三民路二段60號',
    distanceMeters: 435,
    walkMinutes: 7,
    rating: 4.3,
    priceRange: '$40–$95',
    maxPrice: 95,
    highlights: ['楊枝甘露', '高山金萱'],
    hours: {
      sat: { open: true, text: '09:30–21:30' },
      sun: { open: true, text: '10:00–21:00' }
    }
  },
  {
    id: 'm2-sd-7',
    campus: 'market2',
    category: 'snackdrink',
    subCategory: 'snack',
    name: '洪瑞珍三明治（中山路本舖）',
    address: '臺中市中區中山路125-2號',
    distanceMeters: 620,
    walkMinutes: 9,
    rating: 4.1,
    priceRange: '$35–$50',
    maxPrice: 50,
    highlights: ['招牌火腿三明治', '起司全麥吐司'],
    hours: {
      sat: { open: true, text: '09:00–21:00' },
      sun: { open: true, text: '09:00–21:00' }
    }
  },
  {
    id: 'm2-sd-8',
    campus: 'market2',
    category: 'snackdrink',
    subCategory: 'drink',
    name: '老賴紅茶（第二市場總店）',
    address: '臺中市中區三民路二段87號（第二市場7180攤）',
    distanceMeters: 440,
    walkMinutes: 7,
    rating: 3.7,
    priceRange: '$35–$85',
    maxPrice: 85,
    highlights: ['老賴紅茶', '招牌豆漿紅茶'],
    hours: {
      sat: { open: true, text: '06:30–17:30' },
      sun: { open: true, text: '06:30–17:30' }
    }
  },
  {
    id: 'm2-sd-9',
    campus: 'market2',
    category: 'snackdrink',
    subCategory: 'snack',
    name: '蜜藏地瓜',
    address: '臺中市中區臺灣大道一段381號',
    distanceMeters: 560,
    walkMinutes: 8,
    rating: 3.7,
    priceRange: '$50–$100',
    maxPrice: 100,
    highlights: ['麥芽蜜地瓜', '古早味甜地瓜'],
    hours: {
      sat: { open: true, text: '08:00–15:30' },
      sun: { open: true, text: '08:00–15:30' }
    }
  },

  // ==================== 第五市場：150元內正餐（從民生校區步行計算） ====================
  {
    id: 'm5-meal-1',
    campus: 'market5',
    category: 'meal',
    name: '第五市場素炒麵 芋頭粥',
    address: '臺中市西區樂群街64號',
    distanceMeters: 655,
    walkMinutes: 9,
    rating: 4.6,
    priceRange: '$45–$85',
    maxPrice: 85,
    highlights: ['古早味素炒麵', '綿密芋頭粥'],
    hours: {
      sat: { open: true, text: '06:30–13:00' },
      sun: { open: true, text: '06:30–13:00' }
    }
  },
  {
    id: 'm5-meal-2',
    campus: 'market5',
    category: 'meal',
    name: '第五市場心緣素食',
    address: '臺中市西區自治街28號',
    distanceMeters: 590,
    walkMinutes: 8,
    rating: 4.5,
    priceRange: '$45–$95',
    maxPrice: 95,
    highlights: ['自助夾菜飯', '養生素食湯麵'],
    hours: {
      sat: { open: true, text: '06:00–13:00' },
      sun: { open: true, text: '06:00–13:00' }
    }
  },
  {
    id: 'm5-meal-3',
    campus: 'market5',
    category: 'meal',
    name: '加加麵線糊（原鹿港嘉慶）',
    address: '臺中市西區樂群街51號',
    distanceMeters: 630,
    walkMinutes: 9,
    rating: 4.4,
    priceRange: '$50–$95',
    maxPrice: 95,
    highlights: ['鹿港赤肉麵線糊', '大腸蚵仔麵線'],
    hours: {
      sat: { open: true, text: '06:00–13:00' },
      sun: { open: true, text: '06:00–13:00' }
    }
  },
  {
    id: 'm5-meal-4',
    campus: 'market5',
    category: 'meal',
    name: '麵粉遇見水',
    address: '臺中市西區民生路83號',
    distanceMeters: 430,
    walkMinutes: 6,
    rating: 4.4,
    priceRange: '$65–$135',
    maxPrice: 135,
    highlights: ['麻婆豆腐腰帶麵', '招牌椒麻拌麵'],
    hours: {
      sat: { open: true, text: '11:00–13:30' },
      sun: { open: false, text: '週日公休' }
    }
  },
  {
    id: 'm5-meal-5',
    campus: 'market5',
    category: 'meal',
    name: '阿彬爌肉飯',
    address: '臺中市西區樂群街41號',
    distanceMeters: 600,
    walkMinutes: 8,
    rating: 4.2,
    priceRange: '$50–$115',
    maxPrice: 115,
    highlights: ['入口即化爌肉飯', '古早味筍干湯'],
    hours: {
      sat: { open: true, text: '06:00–13:00' },
      sun: { open: true, text: '06:00–13:00' }
    }
  },
  {
    id: 'm5-meal-6',
    campus: 'market5',
    category: 'meal',
    name: '第五市場蚵仔粥',
    address: '臺中市西區樂群街80號',
    distanceMeters: 680,
    walkMinutes: 9,
    rating: 4.2,
    priceRange: '$45–$140',
    maxPrice: 140,
    highlights: ['鮮甜蚵仔粥', '酥炸紅燒肉'],
    hours: {
      sat: { open: true, text: '09:00–20:00' },
      sun: { open: true, text: '09:00–20:00' }
    }
  },
  {
    id: 'm5-meal-7',
    campus: 'market5',
    category: 'meal',
    name: '第五市場陳記蚵仔麵線',
    address: '臺中市西區自立街21-1號',
    distanceMeters: 670,
    walkMinutes: 9,
    rating: 4.2,
    priceRange: '$55–$95',
    maxPrice: 95,
    highlights: ['綜合大腸蚵仔麵線', '油蔥九層塔香'],
    hours: {
      sat: { open: true, text: '09:30–16:30' },
      sun: { open: true, text: '09:30–16:30' }
    }
  },
  {
    id: 'm5-meal-8',
    campus: 'market5',
    category: 'meal',
    name: '自治街大腸麵線',
    address: '臺中市西區自治街4號',
    distanceMeters: 520,
    walkMinutes: 7,
    rating: 4.2,
    priceRange: '$50–$85',
    maxPrice: 85,
    highlights: ['蒜泥大腸麵線', '平價早餐炒麵'],
    hours: {
      sat: { open: true, text: '06:00–13:30' },
      sun: { open: true, text: '06:00–13:30' }
    }
  },
  {
    id: 'm5-meal-9',
    campus: 'market5',
    category: 'meal',
    name: '丸東碗粿',
    address: '臺中市西區樂群街59-2號',
    distanceMeters: 645,
    walkMinutes: 9,
    rating: 4.2,
    priceRange: '$40–$85',
    maxPrice: 85,
    highlights: ['麻豆古早味碗粿', '綜合魚丸湯'],
    hours: {
      sat: { open: true, text: '06:00–13:00' },
      sun: { open: true, text: '06:00–13:00' }
    }
  },
  {
    id: 'm5-meal-10',
    campus: 'market5',
    category: 'meal',
    name: '樂群手工麵線',
    address: '臺中市西區樂群街45-6號',
    distanceMeters: 610,
    walkMinutes: 8,
    rating: 4.1,
    priceRange: '$55–$90',
    maxPrice: 90,
    highlights: ['一週只開四天', '綜合大腸肉羹麵線'],
    hours: {
      sat: { open: true, text: '07:00–13:00' },
      sun: { open: false, text: '週日休息' }
    }
  },
  {
    id: 'm5-meal-11',
    campus: 'market5',
    category: 'meal',
    name: '金鶴魯排骨飯',
    address: '臺中市西區自立街4-2號',
    distanceMeters: 640,
    walkMinutes: 9,
    rating: 4.0,
    priceRange: '$95–$125',
    maxPrice: 125,
    highlights: ['古早味魯排骨', '現炸雞腿飯'],
    hours: {
      sat: { open: true, text: '11:00–14:00' },
      sun: { open: false, text: '週日公休' }
    }
  },
  {
    id: 'm5-meal-12',
    campus: 'market5',
    category: 'meal',
    name: '古味清蒸肉圓',
    address: '臺中市西區樂群街62號',
    distanceMeters: 650,
    walkMinutes: 9,
    rating: 3.8,
    priceRange: '$45–$95',
    maxPrice: 95,
    highlights: ['清蒸肉圓', '滷肉飯黃乾麵'],
    hours: {
      sat: { open: true, text: '07:30–19:00' },
      sun: { open: true, text: '07:30–19:00' }
    }
  },

  // ==================== 第五市場：點心＋手搖飲（從民生校區步行計算） ====================
  {
    id: 'm5-sd-1',
    campus: 'market5',
    category: 'snackdrink',
    subCategory: 'drink',
    name: '二般手路茶 台中樂群店',
    address: '臺中市西區樂群街96號',
    distanceMeters: 710,
    walkMinutes: 10,
    rating: 4.9,
    priceRange: '$45–$85',
    maxPrice: 85,
    highlights: ['手熬蔗糖鮮奶茶', '冬瓜青茶'],
    hours: {
      sat: { open: true, text: '10:00–20:30' },
      sun: { open: true, text: '10:00–20:30' }
    }
  },
  {
    id: 'm5-sd-2',
    campus: 'market5',
    category: 'snackdrink',
    subCategory: 'drink',
    name: '阿鎮現榨果汁',
    address: '臺中市西區府後街33號',
    distanceMeters: 330,
    walkMinutes: 5,
    rating: 4.8,
    priceRange: '$50–$85',
    maxPrice: 85,
    highlights: ['木瓜牛奶', '酪梨牛奶'],
    hours: {
      sat: { open: true, text: '10:00–19:00' },
      sun: { open: false, text: '週日公休' }
    }
  },
  {
    id: 'm5-sd-3',
    campus: 'market5',
    category: 'snackdrink',
    subCategory: 'drink',
    name: '別茶人 府後總店',
    address: '臺中市西區府後街62號',
    distanceMeters: 260,
    walkMinutes: 4,
    rating: 4.7,
    priceRange: '$40–$85',
    maxPrice: 85,
    highlights: ['古早味麥香鮮奶茶', '現萃冷泡純茶'],
    hours: {
      sat: { open: true, text: '10:00–19:00' },
      sun: { open: true, text: '10:00–19:00' }
    }
  },
  {
    id: 'm5-sd-4',
    campus: 'market5',
    category: 'snackdrink',
    subCategory: 'drink',
    name: '一沐日 台中中華店',
    address: '臺中市西區民生路124-1號',
    distanceMeters: 350,
    walkMinutes: 5,
    rating: 4.6,
    priceRange: '$40–$75',
    maxPrice: 75,
    highlights: ['逮丸奶茶草仔粿', '粉粿桂花檸檬'],
    hours: {
      sat: { open: true, text: '10:00–22:00' },
      sun: { open: true, text: '10:00–22:00' }
    }
  },
  {
    id: 'm5-sd-5',
    campus: 'market5',
    category: 'snackdrink',
    subCategory: 'drink',
    name: '50嵐 民生店',
    address: '臺中市西區民生路163號',
    distanceMeters: 430,
    walkMinutes: 6,
    rating: 4.5,
    priceRange: '$35–$65',
    maxPrice: 65,
    highlights: ['冰淇淋紅茶', '黃金烏龍拿鐵'],
    hours: {
      sat: { open: true, text: '09:30–21:30' },
      sun: { open: true, text: '09:30–21:30' }
    }
  },
  {
    id: 'm5-sd-6',
    campus: 'market5',
    category: 'snackdrink',
    subCategory: 'snack',
    name: '不一樣饅頭',
    address: '臺中市西區民生路87號',
    distanceMeters: 440,
    walkMinutes: 6,
    rating: 4.5,
    priceRange: '$15–$50',
    maxPrice: 50,
    highlights: ['銅板烤饅頭', '花生芋頭甜餡餅'],
    hours: {
      sat: { open: true, text: '09:00–19:00' },
      sun: { open: false, text: '週日公休' }
    }
  },
  {
    id: 'm5-sd-7',
    campus: 'market5',
    category: 'snackdrink',
    subCategory: 'drink',
    name: '太空紅茶冰',
    address: '臺中市西區樂群街41-1號',
    distanceMeters: 590,
    walkMinutes: 8,
    rating: 4.4,
    priceRange: '$20–$35',
    maxPrice: 35,
    highlights: ['袋裝古早味紅茶冰', '銅板必喝解膩'],
    hours: {
      sat: { open: true, text: '07:00–15:00' },
      sun: { open: true, text: '07:00–15:00' }
    }
  },
  {
    id: 'm5-sd-8',
    campus: 'market5',
    category: 'snackdrink',
    subCategory: 'snack',
    name: '游記潤餅',
    address: '臺中市西區樂群街60號',
    distanceMeters: 650,
    walkMinutes: 9,
    rating: 4.3,
    priceRange: '$50–$60',
    maxPrice: 60,
    highlights: ['爆餡蔬菜潤餅', '老饕必加芥末'],
    hours: {
      sat: { open: true, text: '09:00–14:00' },
      sun: { open: true, text: '09:00–14:00' }
    }
  },
  {
    id: 'm5-sd-9',
    campus: 'market5',
    category: 'snackdrink',
    subCategory: 'snack',
    name: '添 上海點心肉包',
    address: '臺中市西區樂群街66號',
    distanceMeters: 660,
    walkMinutes: 9,
    rating: 4.3,
    priceRange: '$25–$80',
    maxPrice: 80,
    highlights: ['鮮肉大包', '竹筍肉包'],
    hours: {
      sat: { open: true, text: '05:00–13:00' },
      sun: { open: true, text: '05:00–13:00' }
    }
  },
  {
    id: 'm5-sd-10',
    campus: 'market5',
    category: 'snackdrink',
    subCategory: 'snack',
    name: '樂群冷凍芋',
    address: '臺中市西區樂群街94巷3號',
    distanceMeters: 700,
    walkMinutes: 10,
    rating: 4.3,
    priceRange: '$45–$75',
    maxPrice: 75,
    highlights: ['綿密冷凍芋', '古早味綜合豆花'],
    hours: {
      sat: { open: true, text: '10:30–19:00' },
      sun: { open: true, text: '10:30–19:00' }
    }
  },
  {
    id: 'm5-sd-11',
    campus: 'market5',
    category: 'snackdrink',
    subCategory: 'drink',
    name: '茶湯會 台中民生店',
    address: '臺中市西區民生路124-4號',
    distanceMeters: 360,
    walkMinutes: 5,
    rating: 4.3,
    priceRange: '$40–$80',
    maxPrice: 80,
    highlights: ['觀音拿鐵', '翡翠檸檬'],
    hours: {
      sat: { open: true, text: '09:30–21:00' },
      sun: { open: true, text: '09:30–21:00' }
    }
  },
  {
    id: 'm5-sd-12',
    campus: 'market5',
    category: 'snackdrink',
    subCategory: 'snack',
    name: '港伯梅仔冰',
    address: '臺中市西區自治街24號',
    distanceMeters: 580,
    walkMinutes: 8,
    rating: 4.1,
    priceRange: '$35–$60',
    maxPrice: 60,
    highlights: ['手工酸梅冰', '古早味李子冰'],
    hours: {
      sat: { open: true, text: '10:00–18:00' },
      sun: { open: true, text: '10:00–18:00' }
    }
  }
];

STORES.forEach((store) => {
  if (!store.mapsUrl) {
    store.mapsUrl = buildGoogleMapsUrl(store.name, store.address);
  }
});
