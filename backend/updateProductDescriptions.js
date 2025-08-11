const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

const Product = require('./models/Product');

// Подробные описания для каждого товара на основе изображений
const productDescriptions = {
  "Qizil g'isht M100": {
    description: "Yuqori sifatli qizil g'isht M100 markasi. Qurilish va me'morchilik ishlari uchun ideal. Sovuqqa chidamli, mustahkam va uzoq muddatli. Klassik qizil rang bilan binolaringizga an'anaviy va zamonaviy ko'rinish beradi. Suv shimish darajasi past, muzga chidamli.",
    brand: "O'zbekiston G'isht",
    unit: "dona"
  },
  "Makita matkap": {
    description: "Professional Makita elektr matkap. Yuqori quvvatli motor bilan jihozlangan. Metall, yog'och va plastik materiallarni teshish uchun mo'ljallangan. Ergonomik dizayn va qulay tutqich. Uzoq muddatli ishlatish uchun ishonchli. Turli xil burg'u bilan ishlaydi.",
    brand: "Makita",
    unit: "dona"
  },
  "Oq sement M400": {
    description: "Yuqori mustahkamlikdagi oq sement M400 markasi. Dekorativ ishlar va tashqi bezatish uchun ideal. Tez qotadi va yuqori mustahkamlik beradi. Oq rangi tufayli bezatish ishlarida keng qo'llaniladi. Suv va ob-havo ta'siriga chidamli.",
    brand: "Qizilqum Sement",
    unit: "kg"
  },
  "Akril bo'yoq oq": {
    description: "Yuqori sifatli akril bo'yoq oq rangi. Ichki va tashqi ishlar uchun universal. Tez quriydi va hid bermaydi. Yuvish mumkin bo'lgan sirt hosil qiladi. Ekologik toza va xavfsiz. Bir qatlam bilan yaxshi yopish xususiyati.",
    brand: "Tikkurila",
    unit: "litr"
  },
  "Elektr kabel 2.5mm": {
    description: "Yuqori sifatli elektr kabel 2.5mm kesim yuzasi bilan. Mis o'tkazgichli, PVC izolyatsiyali. Uy va ofis elektr tarmoqlari uchun mo'ljallangan. Xavfsizlik standartlariga javob beradi. Uzun muddatli ishlatish uchun ishonchli.",
    brand: "Elektrokabel",
    unit: "metr"
  },
  "Gazobeton blok": {
    description: "Yengil va issiqlik saqlash xususiyati yuqori bo'lgan gazobeton blok. Qurilish vaqtini qisqartiradi va energiya tejaydi. Yong'inga chidamli va ekologik toza. Oson kesish va ishlov berish mumkin. Yuqori issiqlik izolyatsiyasi.",
    brand: "Ytong",
    unit: "dona"
  },
  "Bosch perforator": {
    description: "Professional Bosch perforator. Beton, g'isht va toshlarni teshish uchun mo'ljallangan. Yuqori quvvatli motor va SDS+ patroni. Vibratsiyanı kamaytiruvchi texnologiya. Uzoq muddatli professional ishlar uchun ishonchli. Turli rejimlar bilan ishlaydi.",
    brand: "Bosch",
    unit: "dona"
  },
  "Armatura 12mm": {
    description: "Yuqori sifatli po'lat armatura 12mm diametrli. Temir-beton konstruksiyalarni mustahkamlash uchun. GOST standartlariga javob beradi. Korroziyaga chidamli qoplama. Qurilish va ta'mirlash ishlarida keng qo'llaniladi.",
    brand: "O'zmetall",
    unit: "metr"
  },
  "Keramik plitka": {
    description: "Chiroyli dekorativ keramik plitka. Vannaxona va oshxona uchun ideal. Suv o'tkazmaydigan va oson tozalanadi. Zamonaviy dizayn va turli xil naqshlar. Yuqori mustahkamlik va uzoq muddatli xizmat qiladi. Slip-resistant sirt.",
    brand: "Kerama Marazzi",
    unit: "m²"
  },
  "LED lampa 12W": {
    description: "Energiya tejamkor LED lampa 12W quvvatli. An'anaviy 100W lampaga teng yorug'lik beradi. Uzoq muddatli xizmat (25000 soat). Issiqlik kam chiqaradi va elektr energiyasini 80% gacha tejaydi. Zamonaviy dizayn va yumshoq yorug'lik.",
    brand: "Philips",
    unit: "dona"
  },
  "Laminat parket": {
    description: "Sifatli laminat parket zamonaviy dizayn bilan. Yog'och taqlidi, lekin arzonroq va amaliyroq. Suv va dog'larga chidamli. Oson o'rnatish va parvarish qilish. Turli xil rang va naqshlarda mavjud. Uzoq muddatli xizmat qiladi.",
    brand: "Kronotex",
    unit: "m²"
  },
  "Shifer plitka": {
    description: "Tom qoplash uchun mustahkam shifer plitka. Ob-havo ta'siriga chidamli va uzoq muddatli. Yengil va oson o'rnatish. Turli xil ranglar va shakllarda mavjud. Suv o'tkazmaydi va muzga chidamli. Ekologik toza material.",
    brand: "Eternit",
    unit: "m²"
  },
  "Santexnik truba": {
    description: "Yuqori sifatli plastik santexnik truba. Suv ta'minoti va kanalizatsiya tizimlari uchun. Korroziyaga chidamli va uzoq muddatli. Oson o'rnatish va kam xarajat. Turli diametrlar va uzunliklarda mavjud. Ekologik xavfsiz.",
    brand: "Rehau",
    unit: "metr"
  },
  "Radiator 10 sektsiya": {
    description: "Isitish radiatori 10 sektsiyali, yuqori samaradorlik bilan. Tez isitadi va issiqlikni bir tekis tarqatadi. Zamonaviy dizayn va kompakt o'lcham. Korroziyaga chidamli qoplama. Oson o'rnatish va texnik xizmat ko'rsatish.",
    brand: "Kermi",
    unit: "dona"
  },
  "Dekorativ gips": {
    description: "Ichki bezatish uchun dekorativ gips. Turli xil naqsh va teksturalar yaratish mumkin. Oson qo'llash va ishlov berish. Ekologik toza va nafas oladi. Rangga bo'yash mumkin. Professional va o'z qo'li bilan ishlash uchun mos.",
    brand: "Knauf",
    unit: "kg"
  },
  "Temir beton plita": {
    description: "Mustahkam temir beton plita. Qurilish konstruksiyalari uchun mo'ljallangan. Yuqori yuk ko'tarish qobiliyati. GOST standartlariga javob beradi. Uzoq muddatli va ishonchli. Turli o'lcham va qalinliklarda mavjud.",
    brand: "Toshkent Beton",
    unit: "dona"
  },
  "Yog'och taxta": {
    description: "Tabiiy yog'och taxta mebel va qurilish uchun. Yuqori sifatli qayin yog'ochidan tayyorlangan. Quruq va tekis sirt. Turli qalinlik va uzunliklarda mavjud. Ekologik toza va tabiiy material. Professional ishlov berish.",
    brand: "Woodmaster",
    unit: "m²"
  },
  "Metall profil": {
    description: "Qurilish uchun metall profil. Gipsokarton konstruksiyalar va yengil qurilish ishlari uchun. Galvanizli qoplama bilan korroziyaga chidamli. Oson kesish va o'rnatish. Turli o'lcham va shakllarda mavjud. Professional sifat.",
    brand: "Knauf",
    unit: "metr"
  },
  "Konditsioner split": {
    description: "Zamonaviy split konditsioner. Inverter texnologiyasi bilan energiya tejaydi. Tez sovutish va isitish funksiyasi. Shovqinsiz ishlaydi va havo tozalaydi. Masofadan boshqarish pulti bilan. Zamonaviy dizayn va yuqori samaradorlik.",
    brand: "Samsung",
    unit: "dona"
  },
  "Elektr rozetka": {
    description: "Zamonaviy elektr rozetka yuqori sifat bilan. Xavfsizlik standartlariga javob beradi. Oson o'rnatish va ishonchli kontakt. Turli xil dizayn va ranglar. Bolalar uchun himoya qopqog'i bilan. Uzoq muddatli xizmat qiladi.",
    brand: "Schneider Electric",
    unit: "dona"
  },
  "Vannaxona plitka": {
    description: "Suv o'tkazmaydigan vannaxona plitka. Maxsus qoplama bilan sirpanishga qarshi. Oson tozalash va parvarish qilish. Turli xil rang va naqshlarda. Kimyoviy moddalarga chidamli. Professional o'rnatish uchun mos.",
    brand: "Cersanit",
    unit: "m²"
  },
  "Qurilish bo'yoq": {
    description: "Tashqi ishlar uchun atmosfera bardosh bo'yoq. UV nurlar va ob-havo ta'siriga chidamli. Uzoq muddatli rang saqlaydi. Oson qo'llash va tez quriydi. Turli xil ranglar palitrasida mavjud. Professional sifat kafolati.",
    brand: "Dulux",
    unit: "litr"
  },
  "Tom materiallar": {
    description: "Yuqori sifatli tom qoplash materiallari. Suv o'tkazmaydi va ob-havo ta'siriga chidamli. Oson o'rnatish va kam xarajat. Turli xil rang va shakllarda. Uzoq muddatli xizmat kafolati. Ekologik xavfsiz materiallar.",
    brand: "Tegola",
    unit: "m²"
  },
  "Santexnik lavabo": {
    description: "Zamonaviy lavabo yuqori sifat bilan. Keramik materialdan tayyorlangan. Oson tozalash va parvarish qilish. Zamonaviy dizayn va kompakt o'lcham. Turli xil o'lcham va shakllarda. Uzoq muddatli va ishonchli xizmat.",
    brand: "Roca",
    unit: "dona"
  },
  "Shpaklovka oq": {
    description: "Devor tayyorlash uchun oq shpaklovka. Yuqori sifatli va oson qo'llash. Tez quriydi va yaxshi yopishadi. Silliq va tekis sirt hosil qiladi. Bo'yoq uchun ideal asos. Ichki ishlar uchun mo'ljallangan.",
    brand: "Vetonit",
    unit: "kg"
  }
};

// Функция для обновления описаний товаров
const updateProductDescriptions = async () => {
  try {
    // Подключение к MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB ga ulanish muvaffaqiyatli');

    // Получение всех товаров
    const products = await Product.find({});
    console.log(`📦 ${products.length} ta mahsulot topildi`);

    let updatedCount = 0;

    // Обновление каждого товара
    for (const product of products) {
      const productData = productDescriptions[product.name];
      
      if (productData) {
        await Product.findByIdAndUpdate(product._id, {
          description: productData.description,
          brand: productData.brand,
          unit: productData.unit
        });
        
        console.log(`✅ "${product.name}" mahsuloti yangilandi`);
        updatedCount++;
      } else {
        console.log(`⚠️ "${product.name}" uchun tavsif topilmadi`);
      }
    }

    console.log(`\n🎉 ${updatedCount} ta mahsulot muvaffaqiyatli yangilandi!`);

  } catch (error) {
    console.error('❌ Xatolik:', error);
  } finally {
    console.log('🔌 MongoDB ulanishi uzildi');
    mongoose.connection.close();
  }
};

// Скрипт запуска
updateProductDescriptions();