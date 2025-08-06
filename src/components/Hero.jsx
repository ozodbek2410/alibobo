import React from 'react';

const Hero = () => {
  return (
  <section id="home" className="gradient-bg py-20">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-5xl font-bold text-white mb-6">
        Qurilish mollalari va <span className="text-primary-orange">ustalarni</span> bir joyda toping
      </h2>
      <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Bizning platformada siz barcha qurilish mollarini sotib olishingiz va malakali ustalarni
          topishingiz mumkin. Sifatli xizmat va ishonchli hamkorlik kafolati.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 card-hover">
          <i className="fas fa-tools text-primary-orange text-3xl mb-4"></i>
          <h3 className="text-xl font-bold text-white mb-2">Mollalar</h3>
          <p className="text-gray-300">Barcha qurilish mollalari bir joyda</p>
        </div>

        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 card-hover">
          <i className="fas fa-users text-primary-orange text-3xl mb-4"></i>
          <h3 className="text-xl font-bold text-white mb-2">Ustalar</h3>
          <p className="text-gray-300">Malakali qurilishchilar va ustalar</p>
        </div>

        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 card-hover">
          <i className="fas fa-shipping-fast text-primary-orange text-3xl mb-4"></i>
          <h3 className="text-xl font-bold text-white mb-2">Yetkazib berish</h3>
          <p className="text-gray-300">Tez va ishonchli yetkazib berish</p>
        </div>
      </div>
    </div>
  </section>
);
};

export default Hero; 