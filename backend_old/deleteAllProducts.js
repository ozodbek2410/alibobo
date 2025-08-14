const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

// Import Product model
const Product = require('./models/Product');

async function deleteAllProducts() {
  try {
    // Connect to MongoDB
    console.log('MongoDB ga ulanmoqda...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB ga muvaffaqiyatli ulandi');

    // Count existing products
    const productCount = await Product.countDocuments();
    console.log(`Hozirda bazada ${productCount} ta mahsulot mavjud`);

    if (productCount === 0) {
      console.log('Bazada mahsulotlar yo\'q');
      return;
    }

    // Delete all products
    console.log('Barcha mahsulotlarni o\'chirmoqda...');
    const result = await Product.deleteMany({});
    
    console.log(`✅ Muvaffaqiyatli o'chirildi: ${result.deletedCount} ta mahsulot`);
    console.log('Barcha mahsulotlar bazadan o\'chirildi');

  } catch (error) {
    console.error('❌ Xatolik yuz berdi:', error.message);
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('connection')) {
      console.log('\n💡 Tavsiya:');
      console.log('1. MongoDB Atlas IP whitelist ni tekshiring');
      console.log('2. Yoki config.env da local MongoDB ishlatishga o\'ting');
      console.log('3. MongoDB servisi ishlab turganini tekshiring');
    }
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB ulanishi yopildi');
    process.exit(0);
  }
}

// Run the deletion
deleteAllProducts();
