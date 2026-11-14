// 國立臺中科技大學 三民校區 & 民生校區 六日午餐與手搖飲資料庫
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
    gateAddress: '臺中市北區三民路三段 129 號'
  },
  minsheng: {
    id: 'minsheng',
    name: '民生校區',
    gateAddress: '臺中市西區三民路一段 193 號'
  }
};

const STORES = [
  // ==================== 三民校區：150元以內正餐 ====================
  {
    id: 'sm-meal-1',
    campus: 'sanmin',
    category: 'meal',
    name: '食の初-炸蛋雞魯飯職人專門店',
    address: '臺中市北區三民路三段126巷3號1樓',
    distanceMeters: 120,
    walkMinutes: 2,
    rating: 4.8,
    priceRange: '$65–$115',
    maxPrice: 115,
    highlights: ['招牌炸蛋雞魯飯', '椒麻滷肉飯', '蔥油雞肉飯'],
    description: '正門斜對面巷內人氣小吃，半熟炸蛋配椒麻滷汁雞魯飯百元內吃得飽。',
    hours: {
      sat: { open: true, text: '11:30–19:00' },
      sun: { open: true, text: '11:30–19:00' }
    }
  },
  {
    id: 'sm-meal-2',
    campus: 'sanmin',
    category: 'meal',
    name: '忠武海苔飯捲便當',
    address: '臺中市北區育才街6巷15號',
    distanceMeters: 270,
    walkMinutes: 3,
    rating: 4.3,
    priceRange: '$80–$110',
    maxPrice: 110,
    highlights: ['忠武飯捲便當', '泡菜豬肉組合', '內用免費湯飲'],
    description: '高 CP 值韓式飯捲便當，可選三樣配菜且內用附免費熱湯與冷飲。',
    hours: {
      sat: { open: true, text: '11:00–20:30' },
      sun: { open: true, text: '11:00–20:30' }
    }
  },
  {
    id: 'sm-meal-3',
    campus: 'sanmin',
    category: 'meal',
    name: '大阪拓海家拉麵',
    address: '臺中市北區一中街93號',
    distanceMeters: 300,
    walkMinutes: 4,
    rating: 4.8,
    priceRange: '$100–$150',
    maxPrice: 150,
    highlights: ['豚骨拉麵', '滑蛋咖哩飯', '日式丼飯'],
    description: '一中商圈老字號平價日式麵飯館，百元出頭就能吃拉麵或咖哩丼飯，份量充足。',
    hours: {
      sat: { open: true, text: '11:00–22:00' },
      sun: { open: true, text: '11:00–22:00' }
    }
  },
  {
    id: 'sm-meal-4',
    campus: 'sanmin',
    category: 'meal',
    name: '有智老麵店',
    address: '臺中市北區三民路三段67號',
    distanceMeters: 310,
    walkMinutes: 4,
    rating: 4.2,
    priceRange: '$45–$95',
    maxPrice: 95,
    highlights: ['古早味乾麵', '爌肉飯', '豬腳飯'],
    description: '傳承一甲子的古早味銅板麵飯老店，注意每週日固定公休。',
    hours: {
      sat: { open: true, text: '10:30–16:00' },
      sun: { open: false, text: '週日公休' }
    }
  },
  {
    id: 'sm-meal-5',
    campus: 'sanmin',
    category: 'meal',
    name: '福氣咖哩',
    address: '臺中市北區三民路三段201巷1-1號1樓',
    distanceMeters: 370,
    walkMinutes: 5,
    rating: 4.6,
    priceRange: '$95–$150',
    maxPrice: 150,
    highlights: ['厚切豬排咖哩', '炸蝦咖哩飯', '內用續飯醬湯'],
    description: '中友百貨旁高評價咖哩店，內用白飯、熱湯與咖哩醬免費續加。',
    hours: {
      sat: { open: true, text: '11:30–14:00（午間）' },
      sun: { open: true, text: '11:30–14:00（午間）' }
    }
  },
  {
    id: 'sm-meal-6',
    campus: 'sanmin',
    category: 'meal',
    name: '一中飯飯（飯飯食事）',
    address: '臺中市北區育才南街1號',
    distanceMeters: 410,
    walkMinutes: 5,
    rating: 4.0,
    priceRange: '$120–$150',
    maxPrice: 150,
    highlights: ['招牌燒肉飯（中/大盛）', '炙燒牛五花丼', '唐揚雞飯'],
    description: '育才南街人氣燒肉丼飯，中盛 120 元起、大盛 150 元內就能吃得滿足。',
    hours: {
      sat: { open: true, text: '11:00–14:00（午間）' },
      sun: { open: true, text: '11:00–14:00（午間）' }
    }
  },
  {
    id: 'sm-meal-7',
    campus: 'sanmin',
    category: 'meal',
    name: '八方雲集（台中雙十店）',
    address: '臺中市北區雙十路二段47-5號',
    distanceMeters: 560,
    walkMinutes: 7,
    rating: 4.8,
    priceRange: '$65–$135',
    maxPrice: 135,
    highlights: ['韓式辣味鍋貼', '招牌水餃', '酸辣湯麵'],
    description: '一中商圈外圍出餐穩定的平價麵食鍋貼店，輕鬆控制在 150 元預算內。',
    hours: {
      sat: { open: true, text: '11:00–14:30（午間）' },
      sun: { open: true, text: '11:00–14:30（午間）' }
    }
  },

  // ==================== 三民校區：100元以內手搖飲 ====================
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
    highlights: ['水蜜桃青韻茶王', '葡萄青韻茶王', '鮮奶茶免費加珍珠'],
    description: '就在中科大三民大門對面，主打台灣單一產區原葉茶與真實果肉飲品。',
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
    highlights: ['醇乳白蘭', '蜜烏龍', '香型烏龍奶茶'],
    description: '中友對面的潮流概念店，主打花果香焙火烏龍與順口鮮乳茶。',
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
    address: '臺中市北區三民路三段161號C棟1樓',
    distanceMeters: 230,
    walkMinutes: 3,
    rating: 4.4,
    priceRange: '$45–$80',
    maxPrice: 80,
    highlights: ['英式水果茶', '玫瑰海鹽奶蓋', '英式鮮奶茶'],
    description: '古典玫瑰園旗下平價好茶，週六上午 10:30 開門、週日配合百貨 11:00 營業。',
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
    highlights: ['四季春珍波椰', '波霸奶茶', '黃金烏龍拿鐵'],
    description: '經典高 CP 值連鎖茶飲，一中商圈內走路 3 分鐘可達，全品項百元內。',
    hours: {
      sat: { open: true, text: '09:00–23:00' },
      sun: { open: true, text: '09:00–23:00' }
    }
  },
  {
    id: 'sm-drink-5',
    campus: 'sanmin',
    category: 'drink',
    name: '八曜和茶（台中中友三民店）',
    address: '臺中市北區三民路三段193號',
    distanceMeters: 320,
    walkMinutes: 4,
    rating: 4.6,
    priceRange: '$45–$79',
    maxPrice: 79,
    highlights: ['柚香覺醒 307', '曜喜好茶', '炙燒濃乳 308'],
    description: '台中超人氣和風無咖啡因穀物茶與輕焙烏龍專賣店，週末人潮較多。',
    hours: {
      sat: { open: true, text: '10:00–22:30' },
      sun: { open: true, text: '10:00–22:30' }
    }
  },
  {
    id: 'sm-drink-6',
    campus: 'sanmin',
    category: 'drink',
    name: '一沐日（一中尊賢店）',
    address: '臺中市北區尊賢街32號1樓',
    distanceMeters: 340,
    walkMinutes: 4,
    rating: 4.5,
    priceRange: '$45–$75',
    maxPrice: 75,
    highlights: ['粉粿桂花檸檬', '逮丸奶茶', '油切蕎麥茶'],
    description: '招牌手工草仔粿與粉粿配料人氣超高，週六開到 23:00、週日開到 22:00。',
    hours: {
      sat: { open: true, text: '11:00–23:00' },
      sun: { open: true, text: '11:00–22:00' }
    }
  },
  {
    id: 'sm-drink-7',
    campus: 'sanmin',
    category: 'drink',
    name: '得正（#一中計劃）',
    address: '臺中市北區育才南街23號1樓',
    distanceMeters: 440,
    walkMinutes: 6,
    rating: 4.4,
    priceRange: '$40–$75',
    maxPrice: 75,
    highlights: ['春烏龍', '芝士奶蓋春烏龍', '烘烏龍鮮奶'],
    description: '專攻烏龍茶系列，清爽茶韻搭配午餐最解膩，週六與週日打烊時間略有不同。',
    hours: {
      sat: { open: true, text: '10:30–22:30' },
      sun: { open: true, text: '10:30–22:00' }
    }
  },
  {
    id: 'sm-drink-8',
    campus: 'sanmin',
    category: 'drink',
    name: '龜記茗品（台中一中店）',
    address: '臺中市北區一中街167巷1號',
    distanceMeters: 480,
    walkMinutes: 6,
    rating: 4.5,
    priceRange: '$45–$80',
    maxPrice: 80,
    highlights: ['紅柚翡翠', '蘋果紅萱', '阿源楊桃紅'],
    description: '果茶與古早味茶飲口碑極佳，週六營業至 22:30、週日營業至 22:00。',
    hours: {
      sat: { open: true, text: '10:30–22:30' },
      sun: { open: true, text: '10:30–22:00' }
    }
  },

  // ==================== 民生校區：150元以內正餐 ====================
  {
    id: 'ms-meal-1',
    campus: 'minsheng',
    category: 'meal',
    name: '阿照麵店（府後店）',
    address: '臺中市西區府後街53號',
    distanceMeters: 290,
    walkMinutes: 4,
    rating: 4.4,
    priceRange: '$45–$100',
    maxPrice: 100,
    highlights: ['古早味魯肉飯', '乾意麵', '手工丸子湯'],
    description: '民生校區學生最愛的銅板午餐首選，週六僅營業中午、週日固定公休。',
    hours: {
      sat: { open: true, text: '11:00–14:00' },
      sun: { open: false, text: '週日公休' }
    }
  },
  {
    id: 'ms-meal-2',
    campus: 'minsheng',
    category: 'meal',
    name: '八方雲集（台中四維店）',
    address: '臺中市西區府後街38-1號',
    distanceMeters: 310,
    walkMinutes: 4,
    rating: 4.8,
    priceRange: '$65–$130',
    maxPrice: 130,
    highlights: ['招牌鍋貼', '韭菜水餃', '牛肉湯麵'],
    description: '就在府後街四維街口附近，週六與週日中午皆穩定營業，快速又平價。',
    hours: {
      sat: { open: true, text: '10:30–19:00' },
      sun: { open: true, text: '10:30–19:00' }
    }
  },
  {
    id: 'ms-meal-3',
    campus: 'minsheng',
    category: 'meal',
    name: '津拉麵',
    address: '臺中市西區府後街31號',
    distanceMeters: 340,
    walkMinutes: 4,
    rating: 4.3,
    priceRange: '$110–$150',
    maxPrice: 150,
    highlights: ['平價豚骨拉麵', '日式蛋包飯', '味噌拉麵'],
    description: '隱藏在府後街巷內的平價日式拉麵與蛋包飯，週六中午有開、週日固定店休。',
    hours: {
      sat: { open: true, text: '11:20–14:00（午間）' },
      sun: { open: false, text: '週日公休' }
    }
  },
  {
    id: 'ms-meal-4',
    campus: 'minsheng',
    category: 'meal',
    name: '麵粉遇見水',
    address: '臺中市西區民生路83號',
    distanceMeters: 390,
    walkMinutes: 5,
    rating: 4.5,
    priceRange: '$85–$135',
    maxPrice: 135,
    highlights: ['招牌腰帶麵', '麻辣乾拌麵', '麻婆豆腐拌麵'],
    description: '文青風格眷村拌麵館，手工寬麵條 Q 彈香麻帶勁，週六中午營業、週日公休。',
    hours: {
      sat: { open: true, text: '11:00–14:00（午間）' },
      sun: { open: false, text: '週日公休' }
    }
  },
  {
    id: 'ms-meal-5',
    campus: 'minsheng',
    category: 'meal',
    name: '自治街手工麵線糊',
    address: '臺中市西區自治街4號',
    distanceMeters: 460,
    walkMinutes: 6,
    rating: 4.3,
    priceRange: '$55–$85',
    maxPrice: 85,
    highlights: ['綜合手工麵線糊', '大腸蚵仔麵線', '肉羹麵線'],
    description: '加入沙茶與九層塔提味的在地手工麵線糊，週六週日中午皆有營業至 13:30。',
    hours: {
      sat: { open: true, text: '07:30–13:30' },
      sun: { open: true, text: '07:30–13:30' }
    }
  },
  {
    id: 'ms-meal-6',
    campus: 'minsheng',
    category: 'meal',
    name: '阿彬爌肉飯',
    address: '臺中市西區樂群街41號',
    distanceMeters: 510,
    walkMinutes: 7,
    rating: 4.4,
    priceRange: '$75–$115',
    maxPrice: 115,
    highlights: ['Q軟爌肉飯', '肉燥飯', '菜頭湯'],
    description: '第五市場人氣爌肉飯，皮 Q 肉嫩醬香下飯，週六與週日皆賣到下午 14:00（售完為止）。',
    hours: {
      sat: { open: true, text: '06:30–14:00' },
      sun: { open: true, text: '06:30–14:00' }
    }
  },
  {
    id: 'ms-meal-7',
    campus: 'minsheng',
    category: 'meal',
    name: '第五市場蚵仔粥（肉粥・紅燒肉）',
    address: '臺中市西區樂群街80號',
    distanceMeters: 560,
    walkMinutes: 7,
    rating: 4.2,
    priceRange: '$60–$140',
    maxPrice: 140,
    highlights: ['招牌肉粥／蚵仔粥', '酥炸紅燒肉', '湯泡飯組合'],
    description: '週一公休、週末六日照常營業的人氣市場正餐，一碗粥配紅燒肉剛剛好。',
    hours: {
      sat: { open: true, text: '10:30–20:00' },
      sun: { open: true, text: '10:30–20:00' }
    }
  },
  {
    id: 'ms-meal-8',
    campus: 'minsheng',
    category: 'meal',
    name: '金鶴魯排骨飯',
    address: '臺中市西區自立街4-2號',
    distanceMeters: 620,
    walkMinutes: 8,
    rating: 4.2,
    priceRange: '$100–$130',
    maxPrice: 130,
    highlights: ['招牌魯排骨飯', '控肉便當', '雞腿便當'],
    description: '第五市場知名古早味便當，週六中午有開，週日固定公休。',
    hours: {
      sat: { open: true, text: '11:00–13:30（午間）' },
      sun: { open: false, text: '週日公休' }
    }
  },
  {
    id: 'ms-meal-9',
    campus: 'minsheng',
    category: 'meal',
    name: '陳記蚵仔麵線',
    address: '臺中市西區自立街21-1號',
    distanceMeters: 650,
    walkMinutes: 8,
    rating: 4.4,
    priceRange: '$60–$95',
    maxPrice: 95,
    highlights: ['大腸蚵仔麵線', '肉羹麵線', '特製辣醬'],
    description: '30 年老字號麵線，配料給得大方且帶有沙茶香氣，週六週日皆有營業。',
    hours: {
      sat: { open: true, text: '10:15–17:00' },
      sun: { open: true, text: '10:15–17:00' }
    }
  },

  // ==================== 民生校區：100元以內手搖飲 ====================
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
    highlights: ['芭樂檸檬汁', '現打水果茶', '古早味原茶'],
    description: '距離民生校區僅 3 分鐘步程，主打新鮮水果特調，週六營業、週日公休。',
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
    highlights: ['綜合現榨果汁', '木瓜牛奶', '西瓜汁'],
    description: '府後街超人氣現打果汁老店，真材實料無添加，週六 10:00–19:00 營業、週日公休。',
    hours: {
      sat: { open: true, text: '10:00–19:00' },
      sun: { open: false, text: '週日公休' }
    }
  },
  {
    id: 'ms-drink-3',
    campus: 'minsheng',
    category: 'drink',
    name: '茶湯會（台中民生店）',
    address: '臺中市西區民生路124-4號',
    distanceMeters: 360,
    walkMinutes: 5,
    rating: 4.2,
    priceRange: '$45–$80',
    maxPrice: 80,
    highlights: ['觀音拿鐵', '翡翠檸檬', '蔗香紅茶'],
    description: '民生路上距離校區最近的人氣連鎖茶飲之一，週六與週日中午皆有營業。',
    hours: {
      sat: { open: true, text: '10:00–21:00' },
      sun: { open: true, text: '10:00–21:00' }
    }
  },
  {
    id: 'ms-drink-4',
    campus: 'minsheng',
    category: 'drink',
    name: '50嵐（民生店）',
    address: '臺中市西區民生路163號',
    distanceMeters: 430,
    walkMinutes: 6,
    rating: 4.3,
    priceRange: '$35–$65',
    maxPrice: 65,
    highlights: ['四季春珍波椰', '紅茶拿鐵', '8冰綠'],
    description: '臺中教育大學旁經典門市，步行 6 分鐘可達，週六日從早上 9 點開到晚上。',
    hours: {
      sat: { open: true, text: '09:00–22:00' },
      sun: { open: true, text: '09:00–22:00' }
    }
  },
  {
    id: 'ms-drink-5',
    campus: 'minsheng',
    category: 'drink',
    name: '清心福全（林森店）',
    address: '臺中市西區林森路249號',
    distanceMeters: 590,
    walkMinutes: 8,
    rating: 4.1,
    priceRange: '$30–$65',
    maxPrice: 65,
    highlights: ['優多綠茶', '烏龍綠茶', '珍珠奶茶'],
    description: '林森路上平價解渴好選擇，全品項多在 65 元以內，週末皆正常營業。',
    hours: {
      sat: { open: true, text: '10:00–21:00' },
      sun: { open: true, text: '10:00–21:00' }
    }
  },
  {
    id: 'ms-drink-6',
    campus: 'minsheng',
    category: 'drink',
    name: '麻古茶坊（台中第二市場店）',
    address: '臺中市中區三民路二段60號',
    distanceMeters: 730,
    walkMinutes: 9,
    rating: 4.3,
    priceRange: '$50–$95',
    maxPrice: 95,
    highlights: ['芝芝葡萄果粒', '柳橙果粒茶', '高山金萱'],
    description: '沿三民路往北步行約 9 分鐘可達，週六與週日開店時間略有不同。',
    hours: {
      sat: { open: true, text: '09:30–21:30' },
      sun: { open: true, text: '10:00–21:00' }
    }
  }
].map((store) => ({
  ...store,
  mapsUrl: buildGoogleMapsUrl(store.name, store.address)
}));
