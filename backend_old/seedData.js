const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

// Import models
const Craftsman = require('./models/Craftsman');
const Product = require('./models/Product');
const Order = require('./models/Order');

// Initial craftsmen data - 25 ta usta (faqat admin panel maydonlari va mavjud rasmlar bilan)
const initialCraftsmen = [
  {
    name: "Ahmad Karimov",
    specialty: "Santexnik",
    phone: "+998901234567",
    location: "Toshkent",
    experience: 8,
    price: 50000,
    status: "active",
    description: "Professional santexnik, barcha turdagi santexnik ishlarini bajaradi",
    image: "/assets/ustalar/plumbing1.jpeg",
    portfolio: []
  },
  {
    name: "Odil Saidov",
    specialty: "Elektrik",
    phone: "+998901234568",
    location: "Samarqand",
    experience: 12,
    price: 45000,
    status: "active",
    description: "Malakali elektrik, elektr montaj va ta'mirlash ishlari",
    image: "/assets/ustalar/electrical1.jpeg",
    portfolio: []
  },
  {
    name: "Bobur Toshmatov",
    specialty: "Bosh usta",
    phone: "+998901234569",
    location: "Buxoro",
    experience: 15,
    price: 75000,
    status: "active",
    description: "Tajribali bosh usta, barcha turdagi qurilish ishlarini boshqaradi",
    image: "/assets/ustalar/construction1.jpeg",
    portfolio: []
  },
  {
    name: "Sardor Abdullayev",
    specialty: "Duradgor",
    phone: "+998901234570",
    location: "Andijon",
    experience: 10,
    price: 60000,
    status: "active",
    description: "Professional duradgor, yog'och bilan ishlash bo'yicha mutaxassis",
    image: "/assets/ustalar/carpentry1.jpeg",
    portfolio: []
  },
  {
    name: "Jasur Komilov",
    specialty: "Plitka ustasi",
    phone: "+998901234571",
    location: "Namangan",
    experience: 7,
    price: 55000,
    status: "active",
    description: "Plitka yotqizish bo'yicha malakali usta",
    image: "/assets/ustalar/tiling1.jpeg",
    portfolio: []
  },
  {
    name: "Rustam Nazarov",
    specialty: "Bo'yoqchi",
    phone: "+998901234572",
    location: "Farg'ona",
    experience: 6,
    price: 40000,
    status: "active",
    description: "Professional bo'yoqchi, ichki va tashqi bo'yash ishlari",
    image: "/assets/ustalar/painting1.jpeg",
    portfolio: []
  },
  {
    name: "Dilshod Rahimov",
    specialty: "Konditsioner ustasi",
    phone: "+998901234573",
    location: "Toshkent",
    experience: 9,
    price: 65000,
    status: "active",
    description: "Konditsioner o'rnatish va ta'mirlash mutaxassisi",
    image: "/assets/ustalar/aircon1.jpeg",
    portfolio: []
  },
  {
    name: "Aziz Yusupov",
    specialty: "Oshpaz",
    phone: "+998901234574",
    location: "Samarqand",
    experience: 11,
    price: 35000,
    status: "active",
    description: "Professional oshpaz, turli milliy taomlar tayyorlaydi",
    image: "/assets/ustalar/renovation1.jpeg",
    portfolio: []
  },
  {
    name: "Nodir Karimov",
    specialty: "Avtomobil ustasi",
    phone: "+998901234575",
    location: "Buxoro",
    experience: 13,
    price: 70000,
    status: "active",
    description: "Avtomobil ta'mirlash bo'yicha tajribali mutaxassis",
    image: "/assets/ustalar/automech1.jpeg",
    portfolio: []
  },
  {
    name: "Sherzod Tursunov",
    specialty: "Temirchi",
    phone: "+998901234576",
    location: "Andijon",
    experience: 8,
    price: 55000,
    status: "active",
    description: "Metall konstruksiyalar va temirchilik ishlari ustasi",
    image: "/assets/ustalar/metalwork1.jpeg",
    portfolio: []
  },
  {
    name: "Otabek Mirzayev",
    specialty: "Kompyuter ustasi",
    phone: "+998901234577",
    location: "Namangan",
    experience: 5,
    price: 45000,
    status: "active",
    description: "Kompyuter va texnika ta'mirlash mutaxassisi",
    image: "/assets/ustalar/machinery1.jpeg",
    portfolio: []
  },
  {
    name: "Bekzod Aliyev",
    specialty: "Tikuvchi",
    phone: "+998901234578",
    location: "Farg'ona",
    experience: 12,
    price: 30000,
    status: "active",
    description: "Professional tikuvchi, kiyim tikish va ta'mirlash",
    image: "/assets/ustalar/woodwork1.jpeg",
    portfolio: []
  },
  {
    name: "Jamshid Hasanov",
    specialty: "Fotograf",
    phone: "+998901234579",
    location: "Toshkent",
    experience: 7,
    price: 80000,
    status: "active",
    description: "Professional fotograf, turli xil suratga olish xizmatlari",
    image: "/assets/ustalar/glazing1.jpeg",
    portfolio: []
  },
  {
    name: "Farrux Qodirov",
    specialty: "Muzikachi",
    phone: "+998901234580",
    location: "Samarqand",
    experience: 14,
    price: 90000,
    status: "active",
    description: "Professional muzikachi, to'ylar va tadbirlar uchun",
    image: "/assets/ustalar/flooring1.jpeg",
    portfolio: []
  },
  {
    name: "Davron Ergashev",
    specialty: "Massajchi",
    phone: "+998901234581",
    location: "Buxoro",
    experience: 6,
    price: 40000,
    status: "active",
    description: "Davolash massaji bo'yicha mutaxassis",
    image: "/assets/ustalar/insulation1.jpeg",
    portfolio: []
  },
  {
    name: "Sanjar Ibragimov",
    specialty: "Haydovchi",
    phone: "+998901234582",
    location: "Andijon",
    experience: 10,
    price: 25000,
    status: "active",
    description: "Tajribali haydovchi, transport xizmatlari",
    image: "/assets/ustalar/doors1.jpeg",
    portfolio: []
  },
  {
    name: "Ulug'bek Normatov",
    specialty: "Tozalovchi",
    phone: "+998901234583",
    location: "Namangan",
    experience: 4,
    price: 20000,
    status: "active",
    description: "Professional tozalash xizmatlari",
    image: "/assets/ustalar/drywall1.jpeg",
    portfolio: []
  },
  {
    name: "Muzaffar Toshev",
    specialty: "Bog'bon",
    phone: "+998901234584",
    location: "Farg'ona",
    experience: 9,
    price: 35000,
    status: "active",
    description: "Bog'dorchilik va landshaft dizayni mutaxassisi",
    image: "/assets/ustalar/balcony1.jpeg",
    portfolio: []
  },
  {
    name: "Abdulla Rakhimov",
    specialty: "Sartarosh",
    phone: "+998901234585",
    location: "Toshkent",
    experience: 8,
    price: 15000,
    status: "active",
    description: "Professional sartarosh, zamonaviy soch turmagi",
    image: "/assets/ustalar/concrete1.jpeg",
    portfolio: []
  },
  {
    name: "Islom Kamalov",
    specialty: "Shifokor",
    phone: "+998901234586",
    location: "Samarqand",
    experience: 16,
    price: 100000,
    status: "active",
    description: "Tajribali shifokor, umumiy amaliyot",
    image: "/assets/ustalar/gas1.jpeg",
    portfolio: []
  },
  {
    name: "Akmal Jurayev",
    specialty: "Dizayner",
    phone: "+998901234587",
    location: "Buxoro",
    experience: 7,
    price: 85000,
    status: "active",
    description: "Grafik va veb dizayn bo'yicha mutaxassis",
    image: "/assets/ustalar/ironwork1.jpeg",
    portfolio: []
  },
  {
    name: "Tohir Nazarov",
    specialty: "Quruvchi",
    phone: "+998901234588",
    location: "Andijon",
    experience: 11,
    price: 60000,
    status: "active",
    description: "Umumiy qurilish ishlari bo'yicha usta",
    image: "/assets/ustalar/masonry1.jpeg",
    portfolio: []
  },
  {
    name: "Bakhtiyor Saidov",
    specialty: "Poyabzal ustasi",
    phone: "+998901234589",
    location: "Namangan",
    experience: 13,
    price: 25000,
    status: "active",
    description: "Poyabzal ta'mirlash va tikish ustasi",
    image: "/assets/ustalar/pipes1.jpeg",
    portfolio: []
  },
  {
    name: "Karim Tursunov",
    specialty: "Soatchi",
    phone: "+998901234590",
    location: "Farg'ona",
    experience: 12,
    price: 30000,
    status: "active",
    description: "Soat ta'mirlash bo'yicha mutaxassis",
    image: "/assets/ustalar/plastering1.jpeg",
    portfolio: []
  },
  {
    name: "Oybek Mirzayev",
    specialty: "Veterinar",
    phone: "+998901234591",
    location: "Toshkent",
    experience: 9,
    price: 75000,
    status: "active",
    description: "Hayvonlar shifokor, veterinariya xizmatlari",
    image: "/assets/ustalar/roofing1.jpeg",
    portfolio: []
  }
];

// Initial products data - 25 ta mahsulot (admin panel kategoriyalari va rasmlar bilan)
const initialProducts = [
  {
    name: "Qizil g'isht M100",
    category: "gisht",
    description: "Yuqori sifatli qizil g'isht, qurilish uchun ideal",
    price: 450,
    stock: 5000,
    unit: "dona",
    image: "/assets/mahsulotlar/qizil-gisht.jpeg",
    badge: ""
  },
  {
    name: "Makita matkap",
    category: "asbob",
    description: "Professional elektr matkap, qurilish ishlari uchun",
    price: 850000,
    oldPrice: 950000,
    stock: 25,
    unit: "dona",
    image: "/assets/mahsulotlar/makita-drill.jpeg",
    badge: "Chegirma"
  },
  {
    name: "Oq sement M400",
    category: "gisht",
    description: "Yuqori mustahkamlikdagi oq sement",
    price: 35000,
    stock: 150,
    unit: "kg",
    image: "/assets/mahsulotlar/oq-sement.jpeg",
    badge: ""
  },
  {
    name: "Akril bo'yoq oq",
    category: "boyoq",
    description: "Ichki va tashqi ishlar uchun sifatli bo'yoq",
    price: 45000,
    oldPrice: 52000,
    stock: 200,
    unit: "litr",
    image: "/assets/mahsulotlar/oq-boyoq.jpeg",
    badge: "Mashhur"
  },
  {
    name: "Elektr kabel 2.5mm",
    category: "elektr",
    description: "Yuqori sifatli elektr kabel",
    price: 12000,
    stock: 500,
    unit: "metr",
    image: "/assets/mahsulotlar/elektr-kabel.jpeg",
    badge: ""
  },
  {
    name: "Gazobeton blok",
    category: "gisht",
    description: "Yengil va issiqlik saqlash xususiyati yuqori",
    price: 8500,
    stock: 800,
    unit: "dona",
    image: "/assets/mahsulotlar/gazobeton.png",
    badge: ""
  },
  {
    name: "Bosch perforator",
    category: "asbob",
    description: "Professional perforator, beton va g'isht uchun",
    price: 1200000,
    stock: 15,
    unit: "dona",
    image: "/assets/mahsulotlar/bosch-perforator.jpeg",
    badge: "Yangi"
  },
  {
    name: "Armatura 12mm",
    category: "metall",
    description: "Yuqori sifatli po'lat armatura",
    price: 15000,
    stock: 300,
    unit: "metr",
    image: "/assets/mahsulotlar/armatura.jpeg",
    badge: ""
  },
  {
    name: "Keramik plitka",
    category: "dekor",
    description: "Chiroyli dekorativ keramik plitka",
    price: 85000,
    stock: 120,
    unit: "m²",
    image: "/assets/mahsulotlar/dekor-plitka.jpeg",
    badge: "Mashhur"
  },
  {
    name: "LED lampa 12W",
    category: "elektr",
    description: "Energiya tejamkor LED lampa",
    price: 25000,
    stock: 400,
    unit: "dona",
    image: "/assets/mahsulotlar/led-lampa.jpeg",
    badge: ""
  },
  {
    name: "Laminat parket",
    category: "yog'och",
    description: "Sifatli laminat parket, zamonaviy dizayn",
    price: 120000,
    stock: 80,
    unit: "m²",
    image: "/assets/mahsulotlar/laminat.jpeg",
    badge: ""
  },
  {
    name: "Shifer plitka",
    category: "tom",
    description: "Tom qoplash uchun mustahkam shifer",
    price: 25000,
    stock: 250,
    unit: "m²",
    image: "/assets/mahsulotlar/shifer.jpeg",
    badge: ""
  },
  {
    name: "Santexnik truba",
    category: "santexnika",
    description: "Plastik santexnik truba, suv uchun",
    price: 18000,
    stock: 180,
    unit: "metr",
    image: "/assets/mahsulotlar/truba.jpeg",
    badge: ""
  },
  {
    name: "Radiator 10 sektsiya",
    category: "issiqlik",
    description: "Isitish radiatori, yuqori samaradorlik",
    price: 450000,
    oldPrice: 520000,
    stock: 35,
    unit: "dona",
    image: "/assets/mahsulotlar/radiator.jpeg",
    badge: "Chegirma"
  },
  {
    name: "Dekorativ gips",
    category: "gips",
    description: "Ichki bezatish uchun dekorativ gips",
    price: 28000,
    stock: 90,
    unit: "kg",
    image: "/assets/mahsulotlar/gips-shpaklovka.jpeg",
    badge: ""
  },
  {
    name: "Temir beton plita",
    category: "temir",
    description: "Mustahkam temir beton konstruksiya",
    price: 180000,
    stock: 45,
    unit: "dona",
    image: "/assets/mahsulotlar/beton.jpeg",
    badge: ""
  },
  {
    name: "Yog'och taxta",
    category: "yog'och",
    description: "Tabiiy yog'och taxta, mebel uchun",
    price: 95000,
    stock: 120,
    unit: "m²",
    image: "/assets/mahsulotlar/parket.jpeg",
    badge: "Mashhur"
  },
  {
    name: "Metall profil",
    category: "metall",
    description: "Qurilish uchun metall profil",
    price: 35000,
    stock: 200,
    unit: "metr",
    image: "/assets/mahsulotlar/metalloprofil.jpeg",
    badge: ""
  },
  {
    name: "Konditsioner split",
    category: "issiqlik",
    description: "Zamonaviy split konditsioner",
    price: 2500000,
    stock: 12,
    unit: "dona",
    image: "/assets/mahsulotlar/konditsioner.jpeg",
    badge: "Yangi"
  },
  {
    name: "Elektr rozetka",
    category: "elektr",
    description: "Zamonaviy elektr rozetka",
    price: 8500,
    stock: 300,
    unit: "dona",
    image: "/assets/mahsulotlar/rozetka.png",
    badge: ""
  },
  {
    name: "Vannaxona plitka",
    category: "dekor",
    description: "Suv o'tkazmaydigan vannaxona plitka",
    price: 75000,
    stock: 85,
    unit: "m²",
    image: "/assets/mahsulotlar/mozaika.jpeg",
    badge: ""
  },
  {
    name: "Qurilish bo'yoq",
    category: "boyoq",
    description: "Tashqi ishlar uchun atmosfera bardosh bo'yoq",
    price: 65000,
    oldPrice: 78000,
    stock: 75,
    unit: "litr",
    image: "/assets/mahsulotlar/qora-boyoq.jpeg",
    badge: "Chegirma"
  },
  {
    name: "Tom materiallar",
    category: "tom",
    description: "Yuqori sifatli tom qoplash materiallar",
    price: 32000,
    stock: 150,
    unit: "m²",
    image: "/assets/mahsulotlar/tom-material.jpeg",
    badge: ""
  },
  {
    name: "Santexnik lavabo",
    category: "santexnika",
    description: "Zamonaviy lavabo, yuqori sifat",
    price: 125000,
    stock: 45,
    unit: "dona",
    image: "/assets/mahsulotlar/lavabo.jpeg",
    badge: ""
  },
  {
    name: "Shpaklovka oq",
    category: "gips",
    description: "Devor tayyorlash uchun shpaklovka",
    price: 22000,
    stock: 120,
    unit: "kg",
    image: "/assets/mahsulotlar/shpaklovka.jpeg",
    badge: ""
  }
];

// Seed function
const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB ga ulanish muvaffaqiyatli');

    // Clear existing data
    console.log('🗑️ Mavjud ma\'lumotlarni o\'chirish...');
    await Craftsman.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log('✅ Mavjud ma\'lumotlar o\'chirildi');

    // Add craftsmen
    console.log('👷 Ustalar qo\'shilmoqda...');
    const craftsmen = await Craftsman.insertMany(initialCraftsmen);
    console.log(`✅ ${craftsmen.length} ta usta qo'shildi`);

    // Add products
    console.log('📦 Mahsulotlar qo\'shilmoqda...');
    const products = await Product.insertMany(initialProducts);
    console.log(`✅ ${products.length} ta mahsulot qo'shildi`);

    console.log(`\n🎉 Barcha ma'lumotlar muvaffaqiyatli qo'shildi!`);
    console.log(`📊 Jami: ${craftsmen.length} usta, ${products.length} mahsulot`);

  } catch (error) {
    console.error('❌ Xatolik:', error);
  } finally {
    console.log('🔌 MongoDB ulanishi uzildi');
    mongoose.connection.close();
  }
};

// Run the seed function
seedData();