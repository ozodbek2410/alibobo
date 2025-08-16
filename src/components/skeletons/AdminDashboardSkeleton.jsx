import React from 'react';
import TelegramSkeleton from './TelegramSkeleton';
import TelegramShimmer from './TelegramShimmer';
import RecentActivitiesSkeleton from './RecentActivitiesSkeleton';

const AdminDashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header skeleton */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <TelegramShimmer>
              <TelegramSkeleton 
                width="w-6" 
                height="h-6" 
                className="bg-gray-200 lg:hidden"
              />
            </TelegramShimmer>
            <TelegramShimmer>
              <TelegramSkeleton 
                width="w-32" 
                height="h-8" 
                className="bg-gray-200"
              />
            </TelegramShimmer>
          </div>
          
          <div className="flex items-center space-x-4">
            <TelegramShimmer>
              <TelegramSkeleton 
                width="w-8" 
                height="h-8" 
                rounded="rounded-full" 
                className="bg-gray-200"
              />
            </TelegramShimmer>
          </div>
        </div>
      </header>

      {/* Main content skeleton */}
      <main className="p-6 max-w-7xl mx-auto">
        {/* Stats Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <TelegramShimmer key={index}>
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <TelegramSkeleton 
                    width="w-8" 
                    height="h-8" 
                    rounded="rounded-lg" 
                    className="bg-gray-200"
                  />
                  <TelegramSkeleton 
                    width="w-4" 
                    height="h-4" 
                    className="bg-gray-100"
                  />
                </div>
                <TelegramSkeleton 
                  width="w-16" 
                  height="h-8" 
                  className="bg-gray-200 mb-2"
                />
                <TelegramSkeleton 
                  width="w-20" 
                  height="h-4" 
                  className="bg-gray-100"
                />
              </div>
            </TelegramShimmer>
          ))}
        </div>
        
        {/* Recent Activities skeleton */}
        <RecentActivitiesSkeleton itemCount={5} />
      </main>
    </div>
  );
};

export default AdminDashboardSkeleton;