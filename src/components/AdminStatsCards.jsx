import React from 'react';

const AdminStatsCards = ({ 
  statistics = null, 
  editStats = null,
  loading = false, 
  error = null,
  formatNumber = (num) => num?.toLocaleString() || '0'
}) => {
  
  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="stats-card rounded-xl p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );

  // Error component
  const ErrorCard = ({ label, icon, iconBg, iconColor }) => (
    <div className="stats-card rounded-xl p-6 border-red-200 bg-red-50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{label}</p>
          <p className="text-3xl font-bold text-red-500">—</p>
          <p className="text-xs text-red-400 mt-1">Ошибка загрузки</p>
        </div>
        <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center opacity-50`}>
          <i className={`${icon} ${iconColor} text-xl`}></i>
        </div>
      </div>
    </div>
  );

  // Calculate growth indicator
  const getGrowthIndicator = (growth) => {
    if (typeof growth !== 'number' || isNaN(growth)) return null;
    
    const isPositive = growth > 0;
    const isNegative = growth < 0;
    
    if (growth === 0) return null;
    
    return (
      <div className={`flex items-center text-xs mt-1 ${
        isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'
      }`}>
        <i className={`fas ${
          isPositive ? 'fa-arrow-up' : isNegative ? 'fa-arrow-down' : 'fa-minus'
        } mr-1`}></i>
        <span>{Math.abs(growth)}%</span>
      </div>
    );
  };

  // Format revenue with compact notation
  const formatRevenue = (amount) => {
    if (!amount || amount === 0) return '0';
    
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    
    return formatNumber(amount);
  };

  const stats = [
    {
      label: 'Jami ustalar',
      value: loading ? '...' : formatNumber(statistics?.craftsmen?.total),
      subValue: statistics?.craftsmen?.recentlyAdded ? `+${statistics.craftsmen.recentlyAdded} (7 kun)` : null,
      icon: 'fas fa-users',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Jami mahsulotlar',
      value: loading ? '...' : formatNumber(statistics?.products?.total),
      subValue: statistics?.products?.recentlyAdded ? `+${statistics.products.recentlyAdded} (7 kun)` : null,
      icon: 'fas fa-box',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      label: 'Buyurtmalar',
      value: loading ? '...' : formatNumber(statistics?.orders?.total),
      subValue: statistics?.orders?.recentlyCreated ? `+${statistics.orders.recentlyCreated} (7 kun)` : null,
      icon: 'fas fa-shopping-cart',
      iconBg: 'bg-orange-300 bg-opacity-20',
      iconColor: 'text-primary-orange',
    },
    {
      label: 'Tahrirlar',
      value: loading ? '...' : formatNumber(editStats?.total || 0),
      subValue: editStats?.thisWeek ? `${editStats.thisWeek} (bu hafta)` : null,
      breakdown: editStats?.byType ? `M: ${editStats.byType.products}, U: ${editStats.byType.craftsmen}, B: ${editStats.byType.orders}` : null,
      icon: 'fas fa-edit',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
    },
    {
      label: 'Daromad',
      value: loading ? '...' : formatRevenue(statistics?.revenue?.total),
      subValue: statistics?.revenue?.thisMonth ? `${formatRevenue(statistics.revenue.thisMonth)} (bu oy)` : null,
      growth: statistics?.revenue?.growth,
      icon: 'fas fa-chart-line',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {[...Array(5)].map((_, idx) => (
          <LoadingSkeleton key={idx} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {stats.map((item, idx) => {
        if (error) {
          return <ErrorCard key={idx} {...item} />;
        }

        return (
          <div key={idx} className="stats-card rounded-xl p-6 card-hover bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-600 text-sm font-medium">{item.label}</p>
                <p className="text-3xl font-bold text-primary-dark mt-1">{item.value}</p>
                
                {/* Sub-value (recent additions) */}
                {item.subValue && (
                  <p className="text-xs text-gray-500 mt-1">{item.subValue}</p>
                )}
                
                {/* Breakdown for edits */}
                {item.breakdown && (
                  <p className="text-xs text-gray-500 mt-1" title="Mahsulotlar: M, Ustalar: U, Buyurtmalar: B">
                    {item.breakdown}
                  </p>
                )}
                
                {/* Growth indicator */}
                {item.growth !== undefined && getGrowthIndicator(item.growth)}
              </div>
              
              <div className={`w-12 h-12 ${item.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <i className={`${item.icon} ${item.iconColor} text-xl`}></i>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminStatsCards; 