const mongoose = require('mongoose');
require('dotenv').config({ path: '../config.env' });

const Product = require('../models/Product');

const sampleProductsWithVariants = [
  {
    name: "Samsung Galaxy A54 5G",
    category: "elektrika",
    price: 4500000,
    oldPrice: 5000000,
    stock: 50,
    description: "Zamonaviy smartfon, yuqori sifatli kamera va tez ishlash",
    brand: "Samsung",
    unit: "dona",
    status: "active",
    badge: "Mashhur",
    hasVariants: true,
    images: [
      "https://images.uzum.uz/cj6lqj5iut9g00e1t8bg/original.jpg",
      "https://images.uzum.uz/cj6lqj5iut9g00e1t8c0/original.jpg"
    ],
    variants: [
      {
        name: "Rang",
        options: [
          {
            value: "Qora",
            price: 0,
            stock: 20,
            image: "https://images.uzum.uz/cj6lqj5iut9g00e1t8bg/original.jpg",
            sku: "GALAXY-A54-BLACK"
          },
          {
            value: "Oq",
            price: 0,
            stock: 15,
            image: "https://images.uzum.uz/cj6lqj5iut9g00e1t8c0/original.jpg",
            sku: "GALAXY-A54-WHITE"
          },
          {
            value: "Ko'k",
            price: 0,
            stock: 15,
            image: "https://images.uzum.uz/cj6lqj5iut9g00e1t8d0/original.jpg",
            sku: "GALAXY-A54-BLUE"
          }
        ]
      },
      {
        name: "Xotira",
        options: [
          {
            value: "128GB",
            price: 0,
            stock: 30,
            sku: "GALAXY-A54-128GB"
          },
          {
            value: "256GB",
            price: 500000,
            stock: 20,
            sku: "GALAXY-A54-256GB"
          }
        ]
      }
    ]
  },
  {
    name: "Nike Air Max Krossovka",
    category: "boshqalar",
    price: 850000,
    oldPrice: 1000000,
    stock: 30,
    description: "Sport krossovka, yuqori sifatli materiallar",
    brand: "Nike",
    unit: "juft",
    status: "active",
    badge: "Yangi",
    hasVariants: true,
    images: [
      "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/99486859-0ff3-46b4-949b-2d16af2ad421/air-max-90-shoes-6n7roO.png"
    ],
    variants: [
      {
        name: "Rang",
        options: [
          {
            value: "Qora",
            price: 0,
            stock: 10,
            sku: "NIKE-AM-BLACK"
          },
          {
            value: "Oq",
            price: 0,
            stock: 10,
            sku: "NIKE-AM-WHITE"
          },
          {
            value: "Qizil",
            price: 50000,
            stock: 5,
            sku: "NIKE-AM-RED"
          }
        ]
      },
      {
        name: "O'lcham",
        options: [
          {
            value: "40",
            price: 0,
            stock: 8,
            sku: "NIKE-AM-40"
          },
          {
            value: "41",
            price: 0,
            stock: 10,
            sku: "NIKE-AM-41"
          },
          {
            value: "42",
            price: 0,
            stock: 7,
            sku: "NIKE-AM-42"
          },
          {
            value: "43",
            price: 0,
            stock: 5,
            sku: "NIKE-AM-43"
          }
        ]
      }
    ]
  },
  {
    name: "Bosch Drill Mashina",
    category: "asbob-uskunalar",
    price: 1200000,
    stock: 25,
    description: "Professional drill mashina, kuchli motor",
    brand: "Bosch",
    unit: "dona",
    status: "active",
    hasVariants: true,
    images: [
      "https://images.uzum.uz/cj6lqj5iut9g00e1t8eg/original.jpg"
    ],
    variants: [
      {
        name: "Quvvat",
        options: [
          {
            value: "500W",
            price: 0,
            stock: 15,
            sku: "BOSCH-DRILL-500W"
          },
          {
            value: "750W",
            price: 200000,
            stock: 10,
            sku: "BOSCH-DRILL-750W"
          }
        ]
      },
      {
        name: "Komplekt",
        options: [
          {
            value: "Oddiy",
            price: 0,
            stock: 20,
            sku: "BOSCH-DRILL-BASIC"
          },
          {
            value: "To'liq komplekt",
            price: 300000,
            stock: 5,
            sku: "BOSCH-DRILL-FULL"
          }
        ]
      }
    ]
  },
  {
    name: "Adidas Futbolka",
    category: "boshqalar",
    price: 180000,
    stock: 40,
    description: "Sport futbolka, yumshoq material",
    brand: "Adidas",
    unit: "dona",
    status: "active",
    hasVariants: true,
    images: [
      "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/8e3b1b5d5b5d4b5d5b5d/essentials-3-stripes-tee-black.jpg"
    ],
    variants: [
      {
        name: "Rang",
        options: [
          {
            value: "Qora",
            price: 0,
            stock: 15,
            sku: "ADIDAS-SHIRT-BLACK"
          },
          {
            value: "Oq",
            price: 0,
            stock: 15,
            sku: "ADIDAS-SHIRT-WHITE"
          },
          {
            value: "Ko'k",
            price: 0,
            stock: 10,
            sku: "ADIDAS-SHIRT-BLUE"
          }
        ]
      },
      {
        name: "O'lcham",
        options: [
          {
            value: "S",
            price: 0,
            stock: 10,
            sku: "ADIDAS-SHIRT-S"
          },
          {
            value: "M",
            price: 0,
            stock: 15,
            sku: "ADIDAS-SHIRT-M"
          },
          {
            value: "L",
            price: 0,
            stock: 10,
            sku: "ADIDAS-SHIRT-L"
          },
          {
            value: "XL",
            price: 0,
            stock: 5,
            sku: "ADIDAS-SHIRT-XL"
          }
        ]
      }
    ]
  },
  {
    name: "LG Televizor 55 dyuym",
    category: "elektrika",
    price: 8500000,
    oldPrice: 9500000,
    stock: 15,
    description: "4K Smart TV, HDR qo'llab-quvvatlash",
    brand: "LG",
    unit: "dona",
    status: "active",
    badge: "Mashhur",
    hasVariants: true,
    images: [
      "https://images.uzum.uz/cj6lqj5iut9g00e1t8fg/original.jpg"
    ],
    variants: [
      {
        name: "O'lcham",
        options: [
          {
            value: "43 dyuym",
            price: -1500000,
            stock: 8,
            sku: "LG-TV-43"
          },
          {
            value: "55 dyuym",
            price: 0,
            stock: 7,
            sku: "LG-TV-55"
          },
          {
            value: "65 dyuym",
            price: 2000000,
            stock: 3,
            sku: "LG-TV-65"
          }
        ]
      },
      {
        name: "Texnologiya",
        options: [
          {
            value: "LED",
            price: 0,
            stock: 10,
            sku: "LG-TV-LED"
          },
          {
            value: "OLED",
            price: 3000000,
            stock: 5,
            sku: "LG-TV-OLED"
          }
        ]
      }
    ]
  }
];

// Variant tizimi bo'lmagan oddiy mahsulotlar
const simpleProducts = [
  {
    name: "Cement M400",
    category: "g'isht-va-bloklar",
    price: 45000,
    stock: 100,
    description: "Yuqori sifatli cement, qurilish ishlari uchun",
    brand: "O'zbekiston",
    unit: "qop",
    status: "active",
    hasVariants: false,
    images: [
      "https://images.uzum.uz/cj6lqj5iut9g00e1t8gg/original.jpg"
    ]
  },
  {
    name: "Metall truba 20mm",
    category: "metall-va-armatura",
    price: 25000,
    stock: 200,
    description: "Galvanizlangan metall truba",
    brand: "Toshkent Metall",
    unit: "metr",
    status: "active",
    hasVariants: false,
    images: [
      "https://images.uzum.uz/cj6lqj5iut9g00e1t8hg/original.jpg"
    ]
  }
];

async function seedProductsWithVariants() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️ Cleared existing products');

    // Insert variant products
    const variantProducts = await Product.insertMany(sampleProductsWithVariants);
    console.log(`✅ Created ${variantProducts.length} products with variants`);

    // Insert simple products
    const simpleProductsResult = await Product.insertMany(simpleProducts);
    console.log(`✅ Created ${simpleProductsResult.length} simple products`);

    // Verify the data
    const totalCount = await Product.countDocuments();
    const variantCount = await Product.countDocuments({ hasVariants: true });
    console.log(`📊 Total products: ${totalCount}`);
    console.log(`🎯 Products with variants: ${variantCount}`);

    console.log('\n📋 Created products with variants:');
    variantProducts.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} - ${product.variants.length} variant types`);
      product.variants.forEach(variant => {
        console.log(`     - ${variant.name}: ${variant.options.length} options`);
      });
    });

    console.log('\n📋 Created simple products:');
    simpleProductsResult.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} - No variants`);
    });

  } catch (error) {
    console.error('❌ Error seeding products:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

seedProductsWithVariants();