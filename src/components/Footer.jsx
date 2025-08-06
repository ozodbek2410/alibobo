import React from 'react';

const Footer = () => {
  return (
    <footer id="footer" className="bg-primary-dark text-white py-16">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <i className="fas fa-hammer text-primary-orange text-2xl"></i>
              <h3 className="text-xl font-bold">Alibobo</h3>
          </div>
          <p className="text-gray-300 mb-4">
              Qurilish mollalari va ustalarni topishning eng oson yo'li. Sizning orzuingizdagi uyni
              qurishda yordam beramiz.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-300 hover:text-primary-orange transition duration-300">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="text-gray-300 hover:text-primary-orange transition duration-300">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" className="text-gray-300 hover:text-primary-orange transition duration-300">
              <i className="fab fa-telegram-plane"></i>
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Mollalar</h4>
          <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-primary-orange transition duration-300">
                  G'isht va bloklar
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-primary-orange transition duration-300">
                  Asbob-uskunalar
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-primary-orange transition duration-300">
                  Bo'yoq va lak
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-primary-orange transition duration-300">
                  Elektr mollalari
                </a>
              </li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Ustalar</h4>
          <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-primary-orange transition duration-300">
                  Bosh ustalar
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-primary-orange transition duration-300">
                  Santexniklar
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-primary-orange transition duration-300">
                  Elektriklar
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-primary-orange transition duration-300">
                  Bezak ustalar
                </a>
              </li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Aloqa</h4>
          <ul className="space-y-2">
            <li className="flex items-center text-gray-300">
              <i className="fas fa-phone mr-2 text-primary-orange"></i>
              +998 90 123 45 67
            </li>
            <li className="flex items-center text-gray-300">
              <i className="fas fa-envelope mr-2 text-primary-orange"></i>
                info@alibobo.uz
            </li>
            <li className="flex items-center text-gray-300">
              <i className="fas fa-map-marker-alt mr-2 text-primary-orange"></i>
              Toshkent, O'zbekiston
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-12 pt-8 text-center">
          <p className="text-gray-300">&copy; 2025 Alibobo. Barcha huquqlar himoyalangan.</p>
      </div>
    </div>
  </footer>
);
};

export default Footer; 