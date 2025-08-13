const mongoose = require('mongoose');
require('dotenv').config({ path: '../config.env' });

const Craftsman = require('../models/Craftsman');

const sampleCraftsmen = [
  {
    name: "Akmal Karimov",
    phone: "+998901234567",
    specialty: "Qurilish ustasi",
    price: 150000,
    status: "active",
    description: "10 yillik tajribaga ega qurilish ustasi. Uy qurilishi, ta'mirlash ishlari.",
    image: "/assets/ustalar/construction1.jpeg",
    portfolio: [
      "/assets/ustalar/construction1.jpeg",
      "/assets/ustalar/construction2.jpeg"
    ]
  },
  {
    name: "Bobur Toshmatov",
    phone: "+998901234568",
    specialty: "Elektrik ustasi",
    price: 120000,
    status: "active",
    description: "Elektr montaj ishlari, simlar o'tkazish, rozetka va kalitlar o'rnatish.",
    image: "/assets/ustalar/electric1.jpeg",
    portfolio: [
      "/assets/ustalar/electric1.jpeg"
    ]
  },
  {
    name: "Davron Nazarov",
    phone: "+998901234569",
    specialty: "Santexnik",
    price: 100000,
    status: "active",
    description: "Suv quvurlari, kanalizatsiya, vannalar va dushlar o'rnatish.",
    image: "/assets/ustalar/plumber1.jpeg",
    portfolio: []
  },
  {
    name: "Eldor Rahimov",
    phone: "+998901234570",
    specialty: "Duradgor",
    price: 130000,
    status: "active",
    description: "Yog'och ishlari, mebel yasash, eshik va deraza o'rnatish.",
    image: "/assets/ustalar/carpenter1.jpeg",
    portfolio: [
      "/assets/ustalar/carpenter1.jpeg",
      "/assets/ustalar/carpenter2.jpeg",
      "/assets/ustalar/carpenter3.jpeg"
    ]
  },
  {
    name: "Farrux Abdullayev",
    phone: "+998901234571",
    specialty: "Rassomlik ustasi",
    price: 80000,
    status: "active",
    description: "Devor bo'yash, dekorativ ishlari, interer dizayni.",
    image: "/assets/ustalar/painter1.jpeg",
    portfolio: [
      "/assets/ustalar/painter1.jpeg"
    ]
  },
  {
    name: "Gafur Mirzayev",
    phone: "+998901234572",
    specialty: "Plitkachi",
    price: 140000,
    status: "active",
    description: "Kafel, plitka yotqizish, vannaxona va oshxona ta'mirlash.",
    image: "/assets/ustalar/tiler1.jpeg",
    portfolio: []
  }
];

async function seedCraftsmen() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing craftsmen
    await Craftsman.deleteMany({});
    console.log('🗑️ Cleared existing craftsmen');

    // Insert sample craftsmen
    const result = await Craftsman.insertMany(sampleCraftsmen);
    console.log(`✅ Created ${result.length} sample craftsmen`);

    // Verify the data
    const count = await Craftsman.countDocuments();
    const activeCount = await Craftsman.countDocuments({ status: 'active' });
    console.log(`📊 Total craftsmen: ${count}`);
    console.log(`👷 Active craftsmen: ${activeCount}`);

    console.log('\n📋 Created craftsmen:');
    result.forEach((craftsman, index) => {
      console.log(`  ${index + 1}. ${craftsman.name} - ${craftsman.specialty} (${craftsman.status})`);
    });

  } catch (error) {
    console.error('❌ Error seeding craftsmen:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

seedCraftsmen();