import React from 'react';

const Services = () => {
  return (
  <section id="services" className="py-20 bg-white">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-primary-dark mb-4">Bizning xizmatlar</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
            Qurilish jarayonida sizga kerakli barcha xizmatlarni taqdim etamiz
        </p>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="bg-primary-orange w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fas fa-truck text-white"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary-dark mb-2">Bepul yetkazib berish</h3>
                <p className="text-gray-600">Toshkent shahri bo'ylab bepul yetkazib berish xizmati</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-primary-orange w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fas fa-tools text-white"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary-dark mb-2">O'rnatish xizmati</h3>
                <p className="text-gray-600">Professional ustalar tomonidan o'rnatish va ta'mirlash</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
                <div className="bg-primary-orange w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fas fa-shield-alt text-white"></i>
                </div>
                <div>
                <h3 className="text-xl font-bold text-primary-dark mb-2">Kafolat</h3>
                <p className="text-gray-600">Barcha mollalar va xizmatlar uchun kafolat beramiz</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-primary-orange w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fas fa-headset text-white"></i>
                </div>
              <div>
                <h3 className="text-xl font-bold text-primary-dark mb-2">24/7 qo'llab-quvvatlash</h3>
                <p className="text-gray-600">Har doim sizning xizmatlaringizda bo'lishga tayyormiz</p>
              </div>
            </div>
          </div>

        <div className="bg-gray-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-primary-dark mb-6">Bepul taklif oling</h3>
          <form className="space-y-4">
              <input
                type="text"
                placeholder="Ismingiz"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary-orange"
              />
              <input
                type="tel"
                placeholder="Telefon raqamingiz"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary-orange"
              />
            <select className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary-orange">
              <option>Xizmat turini tanlang</option>
              <option>Mollalar sotib olish</option>
              <option>Ustalar topish</option>
              <option>Loyiha maslahat</option>
            </select>
              <textarea
                placeholder="Loyihangiz haqida qisqacha ma'lumot"
                rows="4"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary-orange resize-none"
              ></textarea>
              <button
                type="submit"
                className="w-full bg-primary-orange text-white py-3 rounded-lg hover:bg-opacity-90 transition duration-300"
              >
              Taklif olish
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
);
};

export default Services; 