const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

// Import models
const Craftsman = require('./models/Craftsman');
const Product = require('./models/Product');
const Order = require('./models/Order');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://opscoder:PRv5ASUw6d5Qunz7@cluster0.s5obnul.mongodb.net/alibobo1?retryWrites=true&w=majority';

// Initial craftsmen data
const initialCraftsmen = [
  {
    name: "Ahmad Karimov",
    phone: "+998901234567",
    specialty: "Santexnik",
    price: 50000,
    rating: 4.9,
    completedJobs: 45,
    status: "active",
    description: "Professional santexnik, 5 yillik tajriba",
    joinDate: new Date("2023-01-15"),
    portfolio: [
      "/assets/ustalar/plumbing1.jpeg",
      "/assets/ustalar/plumbing2.jpeg",
      "/assets/ustalar/plumbing3.jpeg",
      "/assets/ustalar/plumbing4.jpeg"
    ]
  },
  {
    name: "Odil Saidov",
    phone: "+998901234568",
    specialty: "Elektrik",
    price: 45000,
    rating: 4.8,
    completedJobs: 38,
    status: "active",
    description: "Elektr ishlarida mutaxassis",
    joinDate: new Date("2023-02-20"),
    portfolio: [
      "/assets/ustalar/electrical1.jpeg",
      "/assets/ustalar/electrical2.jpeg",
      "/assets/ustalar/electrical3.jpeg",
      "/assets/ustalar/electrical4.jpeg"
    ]
  },
  {
    name: "Bobur Toshmatov",
    phone: "+998901234569",
    specialty: "Bosh usta",
    price: 75000,
    rating: 4.7,
    completedJobs: 52,
    status: "active",
    description: "Bosh usta, barcha turdagi qurilish ishlari",
    joinDate: new Date("2023-01-10"),
    portfolio: [
      "/assets/ustalar/construction1.jpeg",
      "/assets/ustalar/construction2.jpeg",
      "/assets/ustalar/construction3.jpeg",
      "/assets/ustalar/construction4.jpeg",
      "/assets/ustalar/renovation1.jpeg"
    ]
  },
  {
    name: "Sardor Abdullayev",
    phone: "+998901234570",
    specialty: "Duradgor",
    price: 60000,
    rating: 4.6,
    completedJobs: 29,
    status: "active",
    description: "Yog'och bilan ishlash mutaxassisi",
    joinDate: new Date("2023-03-05"),
    portfolio: [
      "/assets/ustalar/woodwork1.jpeg",
      "/assets/ustalar/woodwork2.jpeg",
      "/assets/ustalar/carpentry1.jpeg",
      "/assets/ustalar/carpentry2.jpeg"
    ]
  },
  {
    name: "Jasur Komilov",
    phone: "+998901234571",
    specialty: "Plitka ustasi",
    price: 55000,
    rating: 4.8,
    completedJobs: 33,
    status: "active",
    description: "Plitka yotqizish bo'yicha tajribali usta",
    joinDate: new Date("2023-03-12"),
    portfolio: [
      "/assets/ustalar/tiling1.jpeg",
      "/assets/ustalar/tiling2.jpeg",
      "/assets/ustalar/tiling3.jpeg",
      "/assets/ustalar/flooring1.jpeg"
    ]
  }
];

// Initial products data
const initialProducts = [
  {
    name: "Qizil g'isht M100",
    category: "gisht",
    description: "Yuqori sifatli qizil g'isht, qurilish uchun ideal",
    price: 450,
    stock: 5000,
    unit: "dona",
    image: "/assets/mahsulotlar/qizil-gisht.jpeg",
    rating: 4.8,
    reviews: 156,
    badge: "Mashhur",
    oldPrice: 500,
    addedDate: new Date("2024-01-10"),
    sold: 850
  },
  {
    name: "Makita matkap",
    category: "asbob",
    description: "Professional elektr matkap, qurilish ishlari uchun",
    price: 850000,
    stock: 25,
    unit: "dona",
    image: "/assets/mahsulotlar/makita-drill.jpeg",
    rating: 4.9,
    reviews: 312,
    badge: "Chegirma",
    oldPrice: 950000,
    addedDate: new Date("2024-01-12"),
    sold: 12
  },
  {
    name: "Oq sement M400",
    category: "gisht",
    description: "Yuqori mustahkamlikdagi oq sement, barcha turdagi qurilish ishlariga mos",
    price: 35000,
    stock: 150,
    unit: "kg",
    image: "/assets/mahsulotlar/oq-sement.jpeg",
    rating: 4.7,
    reviews: 89,
    addedDate: new Date("2024-01-08"),
    sold: 320
  },
  {
    name: "Akril bo'yoq oq",
    category: "boyoq",
    description: "Ichki va tashqi ishlar uchun sifatli bo'yoq",
    price: 45000,
    stock: 200,
    unit: "litr",
    image: "/assets/mahsulotlar/oq-boyoq.jpeg",
    rating: 4.8,
    reviews: 267,
    badge: "Mashhur",
    oldPrice: 52000,
    addedDate: new Date("2024-01-15"),
    sold: 150
  },
  {
    name: "Elektr kabel 2.5mm",
    category: "elektr",
    description: "Yuqori sifatli elektr kabel, uy va ofis uchun",
    price: 12000,
    stock: 500,
    unit: "metr",
    image: "/assets/mahsulotlar/elektr-kabel.jpeg",
    rating: 4.6,
    reviews: 134,
    addedDate: new Date("2024-01-20"),
    sold: 280
  },
  {
    name: "Gazobeton blok",
    category: "gisht",
    description: "Yengil va issiqlik saqlash xususiyati yuqori blok",
    price: 8500,
    stock: 800,
    unit: "dona",
    image: "/assets/mahsulotlar/gazobeton.png",
    rating: 4.7,
    reviews: 95,
    addedDate: new Date("2024-01-22"),
    sold: 420
  },
  {
    name: "Bosch perforator",
    category: "asbob",
    description: "Professional perforator, beton va g'isht uchun",
    price: 1200000,
    stock: 15,
    unit: "dona",
    image: "/assets/mahsulotlar/bosch-perforator.jpeg",
    rating: 4.9,
    reviews: 187,
    badge: "Yangi",
    addedDate: new Date("2024-01-25"),
    sold: 8
  },
  {
    name: "Armatura 12mm",
    category: "gisht",
    description: "Yuqori sifatli po'lat armatura, mustahkam qurilish uchun",
    price: 15000,
    stock: 300,
    unit: "metr",
    image: "/assets/mahsulotlar/armatura.jpeg",
    rating: 4.6,
    reviews: 78,
    addedDate: new Date("2024-01-28"),
    sold: 180
  },
  {
    name: "Keramik plitka",
    category: "dekor",
    description: "Chiroyli dekorativ keramik plitka, vannaxona va oshxona uchun",
    price: 85000,
    stock: 120,
    unit: "m²",
    image: "/assets/mahsulotlar/dekor-plitka.jpeg",
    rating: 4.8,
    reviews: 156,
    badge: "Mashhur",
    addedDate: new Date("2024-02-01"),
    sold: 65
  },
  {
    name: "LED lampa 12W",
    category: "elektr",
    description: "Energiya tejamkor LED lampa, uzoq muddatli",
    price: 25000,
    stock: 400,
    unit: "dona",
    image: "/assets/mahsulotlar/led-lampa.jpeg",
    rating: 4.7,
    reviews: 203,
    addedDate: new Date("2024-02-03"),
    sold: 320
  },
  {
    name: "Laminat parket",
    category: "dekor",
    description: "Sifatli laminat parket, zamonaviy dizayn",
    price: 120000,
    stock: 80,
    unit: "m²",
    image: "/assets/mahsulotlar/laminat.jpeg",
    rating: 4.6,
    reviews: 89,
    addedDate: new Date("2024-02-05"),
    sold: 45
  },
  {
    name: "Bolgar DeWalt",
    category: "asbob",
    description: "Kuchli bolgar, metall va tosh kesish uchun",
    price: 650000,
    stock: 20,
    unit: "dona",
    image: "/assets/mahsulotlar/bolgar-dewalt.jpeg",
    rating: 4.8,
    reviews: 124,
    badge: "Chegirma",
    oldPrice: 750000,
    addedDate: new Date("2024-02-08"),
    sold: 16
  },
  {
    name: "Konditsioner",
    category: "elektr",
    description: "Inverter konditsioner, energiya tejamkor",
    price: 3500000,
    stock: 12,
    unit: "dona",
    image: "/assets/mahsulotlar/konditsioner.jpeg",
    rating: 4.9,
    reviews: 67,
    badge: "Premium",
    addedDate: new Date("2024-02-10"),
    sold: 5
  },
  {
    name: "Gips shpaklovka",
    category: "boyoq",
    description: "Sifatli gips shpaklovka, devor tayyorlash uchun",
    price: 18000,
    stock: 250,
    unit: "kg",
    image: "/assets/mahsulotlar/gips-shpaklovka.jpeg",
    rating: 4.5,
    reviews: 112,
    addedDate: new Date("2024-02-12"),
    sold: 190
  },
  {
    name: "Mozaika plitka",
    category: "dekor",
    description: "Chiroyli mozaika plitka, vannaxona dekoratsiyasi uchun",
    price: 95000,
    stock: 60,
    unit: "m²",
    image: "/assets/mahsulotlar/mozaika.jpeg",
    rating: 4.7,
    reviews: 78,
    addedDate: new Date("2024-02-15"),
    sold: 28
  },
  {
    name: "Radiator",
    category: "elektr",
    description: "Issitish radiatori, uy va ofis uchun",
    price: 450000,
    stock: 35,
    unit: "dona",
    image: "/assets/mahsulotlar/radiator.jpeg",
    rating: 4.6,
    reviews: 94,
    addedDate: new Date("2024-02-18"),
    sold: 22
  }
];

// Initial orders data
const initialOrders = [
  {
    customerName: "Aziz Karimov",
    customerPhone: "+998901234001",
    customerAddress: "Toshkent sh., Chilonzor t., 15-uy",
    items: [
      { name: "Qizil g'isht M100", price: 450, quantity: 1000 },
      { name: "Oq sement M400", price: 35000, quantity: 10 }
    ],
    totalAmount: 800000,
    status: "pending",
    orderDate: new Date("2024-01-25"),
    notes: "Tez yetkazib berish kerak"
  },
  {
    customerName: "Malika Saidova",
    customerPhone: "+998901234002",
    customerAddress: "Toshkent sh., Sergeli t., 45-uy",
    items: [
      { name: "Makita matkap", price: 850000, quantity: 1 },
      { name: "Asboblar to'plami", price: 450000, quantity: 1 }
    ],
    totalAmount: 1300000,
    status: "completed",
    orderDate: new Date("2024-01-20"),
    completedDate: new Date("2024-01-22"),
    notes: "O'z vaqtida yetkazildi"
  },
  {
    customerName: "Bobur Toshmatov",
    customerPhone: "+998901234003",
    customerAddress: "Toshkent sh., Yashnobod t., 78-uy",
    items: [
      { name: "Akril bo'yoq oq", price: 45000, quantity: 5 },
      { name: "Grunt asos", price: 35000, quantity: 3 }
    ],
    totalAmount: 300000,
    status: "processing",
    orderDate: new Date("2024-01-23"),
    notes: "Ranglar aralashmasini tayyorlab bering"
  },
  {
    customerName: "Dilshod Rahimov",
    customerPhone: "+998901234004",
    customerAddress: "Toshkent sh., Mirabad t., 23-uy",
    items: [
      { name: "Mis kabel 2.5mm", price: 8500, quantity: 50 },
      { name: "Rozetka to'plami", price: 25000, quantity: 10 }
    ],
    totalAmount: 675000,
    status: "pending",
    orderDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Kecha
    notes: "Elektr materiallari kerak"
  },
  {
    customerName: "Fazilat Usmonova",
    customerPhone: "+998901234005",
    customerAddress: "Toshkent sh., Shayxontohur t., 67-uy",
    items: [
      { name: "Qizil g'isht M100", price: 450, quantity: 2000 },
      { name: "Oq sement M400", price: 35000, quantity: 20 },
      { name: "Akril bo'yoq oq", price: 45000, quantity: 8 }
    ],
    totalAmount: 1860000,
    status: "completed",
    orderDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 kun oldin
    completedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    notes: "Katta qurilish loyihasi uchun materiallar"
  }
];

async function seedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB ga ulanish muvaffaqiyatli');

    // Clear existing data
    console.log('🗑️ Mavjud ma\'lumotlarni o\'chirish...');
    await Craftsman.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log('✅ Mavjud ma\'lumotlar o\'chirildi');

    // Insert craftsmen
    console.log('👷 Ustalar qo\'shilmoqda...');
    const savedCraftsmen = await Craftsman.insertMany(initialCraftsmen);
    console.log(`✅ ${savedCraftsmen.length} ta usta qo'shildi`);

    // Insert products
    console.log('📦 Mahsulotlar qo\'shilmoqda...');
    const savedProducts = await Product.insertMany(initialProducts);
    console.log(`✅ ${savedProducts.length} ta mahsulot qo'shildi`);

    // Insert orders
    console.log('📋 Buyurtmalar qo\'shilmoqda...');
    const savedOrders = await Order.insertMany(initialOrders);
    console.log(`✅ ${savedOrders.length} ta buyurtma qo'shildi`);

    console.log('\n🎉 Barcha demo ma\'lumotlar muvaffaqiyatli qo\'shildi!');
    console.log(`📊 Jami: ${savedCraftsmen.length} usta, ${savedProducts.length} mahsulot, ${savedOrders.length} buyurtma`);

  } catch (error) {
    console.error('❌ Xatolik:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB ulanishi uzildi');
  }
}

// Run the seeding
seedData(); 