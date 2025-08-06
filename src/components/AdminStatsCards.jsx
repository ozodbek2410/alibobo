import React from 'react';

const AdminStatsCards = ({ craftsmenCount = 25, productsCount = 25, ordersCount = 0 }) => {
  const stats = [
    {
      label: 'Jami ustalar',
      value: craftsmenCount,
      icon: 'fas fa-users',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Jami mahsulotlar',
      value: productsCount,
      icon: 'fas fa-box',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      label: 'Buyurtmalar',
      value: ordersCount.toLocaleString(),
      icon: 'fas fa-shopping-cart',
      iconBg: 'bg-orange-300 bg-opacity-20',
      iconColor: 'text-primary-orange',
    },
    {
      label: 'Daromad',
      value: '45.2M',
      icon: 'fas fa-chart-line',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((item, idx) => (
        <div key={idx} className="stats-card rounded-xl p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">{item.label}</p>
              <p className="text-3xl font-bold text-primary-dark">{item.value}</p>
            </div>
            <div className={`w-12 h-12 ${item.iconBg} rounded-lg flex items-center justify-center`}>
              <i className={`${item.icon} ${item.iconColor} text-xl`}></i>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminStatsCards; 