const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

const Product = require('./models/Product');

// Функция для проверки товаров в базе данных
const checkProducts = async () => {
  try {
    // Подключение к MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB ga ulanish muvaffaqiyatli');

    // Получение всех товаров
    const products = await Product.find({});
    console.log(`📦 Jami ${products.length} ta mahsulot topildi:\n`);

    // Вывод только названий товаров
    products.forEach((product, index) => {
      console.log(`${index + 1}. "${product.name}" - ${product.category} - ${product.price} so'm`);
    });

  } catch (error) {
    console.error('❌ Xatolik:', error);
  } finally {
    console.log('🔌 MongoDB ulanishi uzildi');
    mongoose.connection.close();
  }
};

// Скрипт запуска
checkProducts();