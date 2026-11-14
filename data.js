// 國立臺中科技大學 三民校區 & 民生校區 六日午餐與手搖飲資料庫（49 間實地資料）
// 條件：
// 1. 三民校區（北區三民路三段129號）與民生校區（西區三民路一段193號）分開
// 2. 步行 10 分鐘以內（約 750 公尺內）
// 3. 正餐 <= 150 元、手搖飲 <= 100 元（正餐與飲料分開，不含點心）
// 4. 區分週六中午與週日中午營業時間，僅顯示當日中午有營業的店家

function buildGoogleMapsUrl(name, address) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${address}`)}`;
}

const CAMPUS_INFO = {
  sanmin: {
    id: 'sanmin',
    name: '三民校區',
    gateAddress: '北區三民路三段 129 號'
  },
  minsheng: {
    id: 'minsheng',
    name: '民生校區',
    gateAddress: '西區三民路一段 193 號'
  }
};

const STORES = [
  // ==================== 三民校區：150元以內正餐 (12間) ====================
  {
    id: 'sm-meal-1',
    campus: 'sanmin',
    category: 'meal',
    name: '食の初-炸蛋雞魯飯',
    address: '臺中市北區三民路三段126巷3號1樓',
    distanceMeters: 120,
    walkMinutes: 2,
    rating: 4.8,
    priceRange: '$65–$115',
    maxPrice: 115,
    highlights: ['炸蛋雞魯飯', '椒麻滷肉飯'],
    hours: {
      sat: { open: true, text: '11:30–19:00' },
      sun: { open: true, text: '11:30–19:00' }
    }
  },
  {
    id: 'sm-meal-2',
    campus: 'sanmin',
    category: 'meal',
    name: '金三益健康茶飲（鍋燒意麵）',
    address: '臺中市北區育才北路3號',
    distanceMeters: 190,
    walkMinutes: 2,
    rating: 4.4,
    priceRange: '$110–$150',
    maxPrice: 150,
    highlights: ['經典鍋燒意麵', '沙茶鍋燒'],
    hours: {
      sat: { open: true, text: '10:30–21:00' },
      sun: { open: true, text: '10:30–21:00' }
    }
  },
  {
    id: 'sm-meal-3',
    campus: 'sanmin',
    category: 'meal',
    name: '小蜜蜂炒麵・肉燥飯',
    address: '臺中市北區育才街4號',
    distanceMeters: 220,
    walkMinutes: 3,
    rating: 4.3,
    priceRange: '$35–$85',
    maxPrice: 85,
    highlights: ['古早味炒麵', '肉燥飯'],
    hours: {
      sat: { open: true, text: '10:00–19:00' },
      sun: { open: true, text: '10:00–19:00' }
    }
  },
  {
    id: 'sm-meal-4',
    campus: 'sanmin',
    category: 'meal',
    name: '忠武海苔飯捲便當',
    address: '臺中市北區育才街6巷15號',
    distanceMeters: 270,
    walkMinutes: 3,
    rating: 4.3,
    priceRange: '$80–$110',
    maxPrice: 110,
    highlights: ['飯捲便當', '附湯與麥茶'],
    hours: {
      sat: { open: true, text: '11:00–20:30' },
      sun: { open: true, text: '11:00–20:30' }
    }
  },
  {
    id: 'sm-meal-5',
    campus: 'sanmin',
    category: 'meal',
    name: '丸亀製麵（台中一中店）',
    address: '臺中市北區一中街96號2樓',
    distanceMeters: 290,
    walkMinutes: 4,
    rating: 4.7,
    priceRange: '$84–$149',
    maxPrice: 149,
    highlights: ['豚骨烏龍麵', '湯烏龍麵'],
    hours: {
      sat: { open: true, text: '11:00–21:30' },
      sun: { open: true, text: '11:00–21:30' }
    }
  },
  {
    id: 'sm-meal-6',
    campus: 'sanmin',
    category: 'meal',
    name: '大阪拓海家拉麵',
    address: '臺中市北區一中街93號',
    distanceMeters: 300,
    walkMinutes: 4,
    rating: 4.8,
    priceRange: '$100–$150',
    maxPrice: 150,
    highlights: ['豚骨拉麵', '滑蛋咖哩飯'],
    hours: {
      sat: { open: true, text: '11:00–22:00' },
      sun: { open: true, text: '11:00–22:00' }
    }
  },
  {
    id: 'sm-meal-7',
    campus: 'sanmin',
    category: 'meal',
    name: '有智老麵店',
    address: '臺中市北區三民路三段67號',
    distanceMeters: 310,
    walkMinutes: 4,
    rating: 4.2,
    priceRange: '$45–$95',
    maxPrice: 95,
    highlights: ['古早味乾麵', '爌肉飯'],
    hours: {
      sat: { open: true, text: '10:30–16:00' },
      sun: { open: false, text: '週日公休' }
    }
  },
  {
    id: 'sm-meal-8',
    campus: 'sanmin',
    category: 'meal',
    name: '福氣咖哩',
    address: '臺中市北區三民路三段201巷1-1號',
    distanceMeters: 370,
    walkMinutes: 5,
    rating: 4.6,
    priceRange: '$95–$150',
    maxPrice: 150,
    highlights: ['豬排咖哩', '免費續飯醬'],
    hours: {
      sat: { open: true, text: '11:30–14:00' },
      sun: { open: true, text: '11:30–14:00' }
    }
  },
  {
    id: 'sm-meal-9',
    campus: 'sanmin',
    category: 'meal',
    name: '一中飯飯（飯飯食事）',
    address: '臺中市北區育才南街1號',
    distanceMeters: 410,
    walkMinutes: 5,
    rating: 4.0,
    priceRange: '$120–$150',
    maxPrice: 150,
    highlights: ['招牌燒肉飯', '牛五花丼'],
    hours: {
      sat: { open: true, text: '11:00–14:00' },
      sun: { open: true, text: '11:00–14:00' }
    }
  },
  {
    id: 'sm-meal-10',
    campus: 'sanmin',
    category: 'meal',
    name: '利家咖哩（一中店）',
    address: '臺中市北區錦新街52號',
    distanceMeters: 420,
    walkMinutes: 5,
    rating: 4.4,
    priceRange: '$135–$150',
    maxPrice: 150,
    highlights: ['日式家常咖哩', '雙拼咖哩'],
    hours: {
      sat: { open: true, text: '11:30–14:30' },
      sun: { open: true, text: '11:30–14:30' }
    }
  },
  {
    id: 'sm-meal-11',
    campus: 'sanmin',
    category: 'meal',
    name: '鉄人麵倉',
    address: '臺中市北區太平路巷弄',
    distanceMeters: 450,
    walkMinutes: 6,
    rating: 4.3,
    priceRange: '$95–$145',
    maxPrice: 145,
    highlights: ['復古湯麵', '手作乾麵'],
    hours: {
      sat: { open: true, text: '11:30–20:30' },
      sun: { open: true, text: '11:30–20:30' }
    }
  },
  {
    id: 'sm-meal-12',
    campus: 'sanmin',
    category: 'meal',
    name: '八方雲集（台中雙十店）',
    address: '臺中市北區雙十路二段47-5號',
    distanceMeters: 560,
    walkMinutes: 7,
    rating: 4.8,
    priceRange: '$65–$135',
    maxPrice: 135,
    highlights: ['韓式鍋貼', '酸辣湯麵'],
    hours: {
      sat: { open: true, text: '11:00–14:30' },
      sun: { open: true, text: '11:00–14:30' }
    }
  },

  // ==================== 三民校區：100元以內手搖飲 (15間) ====================
  {
    id: 'sm-drink-1',
    campus: 'sanmin',
    category: 'drink',
    name: '季緣（一中店）',
    address: '臺中市北區三民路三段114號1樓',
    distanceMeters: 90,
    walkMinutes: 1,
    rating: 4.7,
    priceRange: '$45–$85',
    maxPrice: 85,
    highlights: ['水蜜桃青韻茶', '鮮奶免費加珠'],
    hours: {
      sat: { open: true, text: '10:30–22:00' },
      sun: { open: true, text: '10:30–21:00' }
    }
  },
  {
    id: 'sm-drink-2',
    campus: 'sanmin',
    category: 'drink',
    name: 'Chatime 烏內（中友店）',
    address: '臺中市北區三民路三段141號',
    distanceMeters: 170,
    walkMinutes: 2,
    rating: 4.5,
    priceRange: '$50–$85',
    maxPrice: 85,
    highlights: ['醇乳白蘭', '蜜烏龍'],
    hours: {
      sat: { open: true, text: '11:00–22:00' },
      sun: { open: true, text: '11:00–22:00' }
    }
  },
  {
    id: 'sm-drink-3',
    campus: 'sanmin',
    category: 'drink',
    name: '先喝道（台中中友店）',
    address: '臺中市北區三民路三段161號C棟1F',
    distanceMeters: 230,
    walkMinutes: 3,
    rating: 4.4,
    priceRange: '$45–$80',
    maxPrice: 80,
    highlights: ['英式水果茶', '玫瑰海鹽奶蓋'],
    hours: {
      sat: { open: true, text: '10:30–22:00' },
      sun: { open: true, text: '11:00–21:30' }
    }
  },
  {
    id: 'sm-drink-4',
    campus: 'sanmin',
    category: 'drink',
    name: '50嵐（一中店）',
    address: '臺中市北區育才街8-2號',
    distanceMeters: 250,
    walkMinutes: 3,
    rating: 4.3,
    priceRange: '$35–$65',
    maxPrice: 65,
    highlights: ['四季春珍波椰', '波霸奶茶'],
    hours: {
      sat: { open: true, text: '09:00–23:00' },
      sun: { open: true, text: '09:00–23:00' }
    }
  },
  {
    id: 'sm-drink-5',
    campus: 'sanmin',
    category: 'drink',
    name: '再睡5分鐘（台中一中店）',
    address: '臺中市北區尊賢街7號1樓',
    distanceMeters: 310,
    walkMinutes: 4,
    rating: 4.6,
    priceRange: '$50–$95',
    maxPrice: 95,
    highlights: ['棉被厚奶蓋', '日安紅濃茶歐蕾'],
    hours: {
      sat: { open: true, text: '12:05–21:30' },
      sun: { open: true, text: '12:05–21:00' }
    }
  },
  {
    id: 'sm-drink-6',
    campus: 'sanmin',
    category: 'drink',
    name: '八曜和茶（台中中友三民店）',
    address: '臺中市北區三民路三段193號',
    distanceMeters: 320,
    walkMinutes: 4,
    rating: 4.6,
    priceRange: '$45–$79',
    maxPrice: 79,
    highlights: ['柚香覺醒 307', '炙燒濃乳 308'],
    hours: {
      sat: { open: true, text: '10:00–22:30' },
      sun: { open: true, text: '10:00–22:30' }
    }
  },
  {
    id: 'sm-drink-7',
    campus: 'sanmin',
    category: 'drink',
    name: '迷客夏（臺中一中店）',
    address: '臺中市北區三民路三段193-4號',
    distanceMeters: 330,
    walkMinutes: 4,
    rating: 4.6,
    priceRange: '$45–$85',
    maxPrice: 85,
    highlights: ['珍珠紅茶拿鐵', '青檸香茶'],
    hours: {
      sat: { open: true, text: '10:00–22:00' },
      sun: { open: true, text: '10:00–21:00' }
    }
  },
  {
    id: 'sm-drink-8',
    campus: 'sanmin',
    category: 'drink',
    name: '一沐日（一中尊賢店）',
    address: '臺中市北區尊賢街32號1樓',
    distanceMeters: 340,
    walkMinutes: 4,
    rating: 4.5,
    priceRange: '$45–$75',
    maxPrice: 75,
    highlights: ['粉粿桂花檸檬', '逮丸奶茶'],
    hours: {
      sat: { open: true, text: '11:00–23:00' },
      sun: { open: true, text: '11:00–22:00' }
    }
  },
  {
    id: 'sm-drink-9',
    campus: 'sanmin',
    category: 'drink',
    name: '清心福全（台中一中店）',
    address: '臺中市北區太平路89號',
    distanceMeters: 350,
    walkMinutes: 5,
    rating: 4.2,
    priceRange: '$30–$65',
    maxPrice: 65,
    highlights: ['優多綠茶', '烏龍綠茶'],
    hours: {
      sat: { open: true, text: '09:00–22:00' },
      sun: { open: true, text: '09:00–22:00' }
    }
  },
  {
    id: 'sm-drink-10',
    campus: 'sanmin',
    category: 'drink',
    name: '可不可熟成紅茶（一中店）',
    address: '臺中市北區一中街25號',
    distanceMeters: 390,
    walkMinutes: 5,
    rating: 4.5,
    priceRange: '$35–$75',
    maxPrice: 75,
    highlights: ['熟成紅茶', '白玉歐蕾'],
    hours: {
      sat: { open: true, text: '10:00–22:00' },
      sun: { open: true, text: '10:00–22:00' }
    }
  },
  {
    id: 'sm-drink-11',
    campus: 'sanmin',
    category: 'drink',
    name: '大苑子（台中一中店）',
    address: '臺中市北區一中街25-3號',
    distanceMeters: 400,
    walkMinutes: 5,
    rating: 4.9,
    priceRange: '$45–$95',
    maxPrice: 95,
    highlights: ['芭樂梅', '鮮果綠茶'],
    hours: {
      sat: { open: true, text: '10:30–22:00' },
      sun: { open: true, text: '10:30–21:00' }
    }
  },
  {
    id: 'sm-drink-12',
    campus: 'sanmin',
    category: 'drink',
    name: '萬波島嶼紅茶（台中一中店）',
    address: '臺中市北區太平路63巷1號',
    distanceMeters: 430,
    walkMinutes: 5,
    rating: 4.9,
    priceRange: '$35–$85',
    maxPrice: 85,
    highlights: ['島嶼紅茶', '蘭葉那堤'],
    hours: {
      sat: { open: true, text: '10:00–21:30' },
      sun: { open: true, text: '10:00–21:00' }
    }
  },
  {
    id: 'sm-drink-13',
    campus: 'sanmin',
    category: 'drink',
    name: '得正（#一中計劃）',
    address: '臺中市北區育才南街23號1樓',
    distanceMeters: 440,
    walkMinutes: 6,
    rating: 4.4,
    priceRange: '$40–$75',
    maxPrice: 75,
    highlights: ['春烏龍', '芝士奶蓋春烏龍'],
    hours: {
      sat: { open: true, text: '10:30–22:30' },
      sun: { open: true, text: '10:30–22:00' }
    }
  },
  {
    id: 'sm-drink-14',
    campus: 'sanmin',
    category: 'drink',
    name: '龜記茗品（台中一中店）',
    address: '臺中市北區一中街167巷1號',
    distanceMeters: 480,
    walkMinutes: 6,
    rating: 4.5,
    priceRange: '$45–$80',
    maxPrice: 80,
    highlights: ['紅柚翡翠', '蘋果紅萱'],
    hours: {
      sat: { open: true, text: '10:30–22:30' },
      sun: { open: true, text: '10:30–22:00' }
    }
  },
  {
    id: 'sm-drink-15',
    campus: 'sanmin',
    category: 'drink',
    name: '手作功夫茶（一中旗艦店）',
    address: '臺中市北區一中街231號',
    distanceMeters: 510,
    walkMinutes: 6,
    rating: 4.3,
    priceRange: '$35–$80',
    maxPrice: 80,
    highlights: ['38奶霸', '寒天柚香飲'],
    hours: {
      sat: { open: true, text: '10:30–22:00' },
      sun: { open: true, text: '10:30–22:00' }
    }
  },

  // ==================== 民生校區：150元以內正餐 (13間) ====================
  {
    id: 'ms-meal-1',
    campus: 'minsheng',
    category: 'meal',
    name: '米娜手作弁當',
    address: '臺中市西區林森路46號',
    distanceMeters: 220,
    walkMinutes: 3,
    rating: 4.9,
    priceRange: '$90–$150',
    maxPrice: 150,
    highlights: ['舒肥嫩雞胸餐盒', '燉梅花豬飯'],
    hours: {
      sat: { open: true, text: '10:30–19:00' },
      sun: { open: true, text: '10:30–19:00' }
    }
  },
  {
    id: 'ms-meal-2',
    campus: 'minsheng',
    category: 'meal',
    name: '阿照麵店（府後店）',
    address: '臺中市西區府後街53號',
    distanceMeters: 290,
    walkMinutes: 4,
    rating: 4.4,
    priceRange: '$45–$100',
    maxPrice: 100,
    highlights: ['古早味魯肉飯', '乾意麵・丸子湯'],
    hours: {
      sat: { open: true, text: '11:00–14:00' },
      sun: { open: false, text: '週日公休' }
    }
  },
  {
    id: 'ms-meal-3',
    campus: 'minsheng',
    category: 'meal',
    name: '八方雲集（台中四維店）',
    address: '臺中市西區府後街38-1號',
    distanceMeters: 310,
    walkMinutes: 4,
    rating: 4.8,
    priceRange: '$65–$130',
    maxPrice: 130,
    highlights: ['招牌鍋貼', '韭菜水餃'],
    hours: {
      sat: { open: true, text: '10:30–19:00' },
      sun: { open: true, text: '10:30–19:00' }
    }
  },
  {
    id: 'ms-meal-4',
    campus: 'minsheng',
    category: 'meal',
    name: '津拉麵',
    address: '臺中市西區府後街31號',
    distanceMeters: 340,
    walkMinutes: 4,
    rating: 4.3,
    priceRange: '$110–$150',
    maxPrice: 150,
    highlights: ['豚骨拉麵', '日式蛋包飯'],
    hours: {
      sat: { open: true, text: '11:20–14:00' },
      sun: { open: false, text: '週日公休' }
    }
  },
  {
    id: 'ms-meal-5',
    campus: 'minsheng',
    category: 'meal',
    name: '阿海麵店（越式／台式）',
    address: '臺中市西區民生路91-1號',
    distanceMeters: 370,
    walkMinutes: 5,
    rating: 4.5,
    priceRange: '$90–$130',
    maxPrice: 130,
    highlights: ['越式河粉', '乾拌烤肉飯'],
    hours: {
      sat: { open: true, text: '11:00–14:00' },
      sun: { open: false, text: '週日公休' }
    }
  },
  {
    id: 'ms-meal-6',
    campus: 'minsheng',
    category: 'meal',
    name: '好麵熟',
    address: '臺中市西區三民路一段78號',
    distanceMeters: 380,
    walkMinutes: 5,
    rating: 4.9,
    priceRange: '$105–$150',
    maxPrice: 150,
    highlights: ['重慶小麵', '手工水餃'],
    hours: {
      sat: { open: true, text: '11:00–14:00' },
      sun: { open: false, text: '週日公休' }
    }
  },
  {
    id: 'ms-meal-7',
    campus: 'minsheng',
    category: 'meal',
    name: '麵粉遇見水',
    address: '臺中市西區民生路83號',
    distanceMeters: 390,
    walkMinutes: 5,
    rating: 4.7,
    priceRange: '$65–$120',
    maxPrice: 120,
    highlights: ['招牌腰帶麵', '麻辣乾拌麵'],
    hours: {
      sat: { open: true, text: '11:00–14:30' },
      sun: { open: false, text: '週日公休' }
    }
  },
  {
    id: 'ms-meal-8',
    campus: 'minsheng',
    category: 'meal',
    name: '自治街手工麵線糊',
    address: '臺中市西區自治街4號',
    distanceMeters: 460,
    walkMinutes: 6,
    rating: 4.3,
    priceRange: '$55–$85',
    maxPrice: 85,
    highlights: ['綜合手工麵線糊', '大腸蚵仔麵線'],
    hours: {
      sat: { open: true, text: '07:30–13:30' },
      sun: { open: true, text: '07:30–13:30' }
    }
  },
  {
    id: 'ms-meal-9',
    campus: 'minsheng',
    category: 'meal',
    name: '吳房子餐館 Wu House',
    address: '臺中市西區林森路133號',
    distanceMeters: 470,
    walkMinutes: 6,
    rating: 4.8,
    priceRange: '$100–$135',
    maxPrice: 135,
    highlights: ['厚切排骨飯', '豪大雞腿飯'],
    hours: {
      sat: { open: true, text: '11:00–14:00' },
      sun: { open: true, text: '11:00–14:00' }
    }
  },
  {
    id: 'ms-meal-10',
    campus: 'minsheng',
    category: 'meal',
    name: '阿彬爌肉飯',
    address: '臺中市西區樂群街41號',
    distanceMeters: 510,
    walkMinutes: 7,
    rating: 4.4,
    priceRange: '$75–$115',
    maxPrice: 115,
    highlights: ['Q軟爌肉飯', '菜頭湯'],
    hours: {
      sat: { open: true, text: '06:30–14:00' },
      sun: { open: true, text: '06:30–14:00' }
    }
  },
  {
    id: 'ms-meal-11',
    campus: 'minsheng',
    category: 'meal',
    name: '第五市場蚵仔粥',
    address: '臺中市西區樂群街80號',
    distanceMeters: 560,
    walkMinutes: 7,
    rating: 4.2,
    priceRange: '$60–$140',
    maxPrice: 140,
    highlights: ['肉粥／蚵仔粥', '酥炸紅燒肉'],
    hours: {
      sat: { open: true, text: '10:30–20:00' },
      sun: { open: true, text: '10:30–20:00' }
    }
  },
  {
    id: 'ms-meal-12',
    campus: 'minsheng',
    category: 'meal',
    name: '金鶴魯排骨飯',
    address: '臺中市西區自立街4-2號',
    distanceMeters: 620,
    walkMinutes: 8,
    rating: 4.2,
    priceRange: '$90–$125',
    maxPrice: 125,
    highlights: ['招牌魯排骨便當', '雞腿便當'],
    hours: {
      sat: { open: true, text: '11:00–13:30' },
      sun: { open: false, text: '週日公休' }
    }
  },
  {
    id: 'ms-meal-13',
    campus: 'minsheng',
    category: 'meal',
    name: '陳記蚵仔麵線',
    address: '臺中市西區自立街21-1號',
    distanceMeters: 650,
    walkMinutes: 8,
    rating: 4.4,
    priceRange: '$60–$95',
    maxPrice: 95,
    highlights: ['大腸蚵仔麵線', '肉羹麵線'],
    hours: {
      sat: { open: true, text: '10:15–17:00' },
      sun: { open: true, text: '10:15–17:00' }
    }
  },

  // ==================== 民生校區：100元以內手搖飲 (9間) ====================
  {
    id: 'ms-drink-1',
    campus: 'minsheng',
    category: 'drink',
    name: '別茶人（府後總店）',
    address: '臺中市西區府後街62號',
    distanceMeters: 260,
    walkMinutes: 3,
    rating: 4.5,
    priceRange: '$50–$85',
    maxPrice: 85,
    highlights: ['芭樂檸檬汁', '水果茶'],
    hours: {
      sat: { open: true, text: '11:00–19:30' },
      sun: { open: false, text: '週日公休' }
    }
  },
  {
    id: 'ms-drink-2',
    campus: 'minsheng',
    category: 'drink',
    name: '阿鎮現榨果汁',
    address: '臺中市西區府後街33號',
    distanceMeters: 330,
    walkMinutes: 4,
    rating: 4.6,
    priceRange: '$50–$85',
    maxPrice: 85,
    highlights: ['綜合果汁', '木瓜牛奶'],
    hours: {
      sat: { open: true, text: '10:00–19:00' },
      sun: { open: false, text: '週日公休' }
    }
  },
  {
    id: 'ms-drink-3',
    campus: 'minsheng',
    category: 'drink',
    name: '一沐日（台中中華／民生店）',
    address: '臺中市西區民生路124-1號',
    distanceMeters: 350,
    walkMinutes: 4,
    rating: 4.6,
    priceRange: '$45–$75',
    maxPrice: 75,
    highlights: ['粉粿桂花檸檬', '逮丸奶茶'],
    hours: {
      sat: { open: true, text: '10:00–20:45' },
      sun: { open: true, text: '10:00–19:45' }
    }
  },
  {
    id: 'ms-drink-4',
    campus: 'minsheng',
    category: 'drink',
    name: '茶湯會（台中民生店）',
    address: '臺中市西區民生路124-4號',
    distanceMeters: 360,
    walkMinutes: 5,
    rating: 4.2,
    priceRange: '$45–$80',
    maxPrice: 80,
    highlights: ['觀音拿鐵', '翡翠檸檬'],
    hours: {
      sat: { open: true, text: '10:00–21:00' },
      sun: { open: true, text: '10:00–21:00' }
    }
  },
  {
    id: 'ms-drink-5',
    campus: 'minsheng',
    category: 'drink',
    name: '50嵐（民生店）',
    address: '臺中市西區民生路163號',
    distanceMeters: 430,
    walkMinutes: 6,
    rating: 4.3,
    priceRange: '$35–$65',
    maxPrice: 65,
    highlights: ['四季春珍波椰', '紅茶拿鐵'],
    hours: {
      sat: { open: true, text: '09:00–21:45' },
      sun: { open: true, text: '09:00–21:45' }
    }
  },
  {
    id: 'ms-drink-6',
    campus: 'minsheng',
    category: 'drink',
    name: '十二韻（林森店）',
    address: '臺中市西區林森路218號',
    distanceMeters: 540,
    walkMinutes: 7,
    rating: 4.5,
    priceRange: '$35–$75',
    maxPrice: 75,
    highlights: ['輕焙烏龍', '蜂蜜檸檬'],
    hours: {
      sat: { open: true, text: '10:00–21:00' },
      sun: { open: true, text: '10:00–21:00' }
    }
  },
  {
    id: 'ms-drink-7',
    campus: 'minsheng',
    category: 'drink',
    name: '二般手路茶（台中樂群店）',
    address: '臺中市西區樂群街96號',
    distanceMeters: 580,
    walkMinutes: 7,
    rating: 4.6,
    priceRange: '$45–$85',
    maxPrice: 85,
    highlights: ['手路紅茶', '鮮果茶飲'],
    hours: {
      sat: { open: true, text: '10:00–16:00' },
      sun: { open: true, text: '10:00–16:00' }
    }
  },
  {
    id: 'ms-drink-8',
    campus: 'minsheng',
    category: 'drink',
    name: '清心福全（林森店）',
    address: '臺中市西區林森路249號',
    distanceMeters: 590,
    walkMinutes: 8,
    rating: 4.1,
    priceRange: '$30–$65',
    maxPrice: 65,
    highlights: ['優多綠茶', '烏龍綠茶'],
    hours: {
      sat: { open: true, text: '10:00–21:00' },
      sun: { open: true, text: '10:00–21:00' }
    }
  },
  {
    id: 'ms-drink-9',
    campus: 'minsheng',
    category: 'drink',
    name: '麻古茶坊（台中第二市場店）',
    address: '臺中市中區三民路二段60號',
    distanceMeters: 730,
    walkMinutes: 9,
    rating: 4.3,
    priceRange: '$50–$95',
    maxPrice: 95,
    highlights: ['芝芝葡萄果粒', '柳橙果粒茶'],
    hours: {
      sat: { open: true, text: '09:30–21:30' },
      sun: { open: true, text: '10:00–21:00' }
    }
  }
].map((store) => ({
  ...store,
  mapsUrl: buildGoogleMapsUrl(store.name, store.address)
}));
