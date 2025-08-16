import React from 'react';
import TelegramSkeleton from './TelegramSkeleton';
import TelegramShimmer from './TelegramShimmer';

const RecentActivitiesSkeleton = ({ itemCount = 5 }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <TelegramShimmer>
          <TelegramSkeleton width="w-32" height="h-6" className="bg-gray-200" />
        </TelegramShimmer>
        <TelegramShimmer>
          <TelegramSkeleton width="w-24" height="h-8" rounded="rounded-md" className="bg-gray-100" />
        </TelegramShimmer>
      </div>

      {/* Activity items skeleton */}
      <div className="space-y-4">
        {Array.from({ length: itemCount }).map((_, index) => (
          <TelegramShimmer key={index} className="rounded-lg">
            <div className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
              {/* Icon skeleton */}
              <div className="flex-shrink-0">
                <TelegramSkeleton 
                  width="w-10" 
                  height="h-10" 
                  rounded="rounded-full" 
                  className="bg-gray-200"
                />
              </div>
              
              {/* Content skeleton */}
              <div className="flex-1 min-w-0">
                {/* Title skeleton */}
                <TelegramSkeleton 
                  width="w-3/4" 
                  height="h-4" 
                  className="bg-gray-200 mb-2"
                />
                
                {/* Description skeleton */}
                <TelegramSkeleton 
                  width="w-full" 
                  height="h-3" 
                  className="bg-gray-100 mb-1"
                />
                <TelegramSkeleton 
                  width="w-2/3" 
                  height="h-3" 
                  className="bg-gray-100"
                />
              </div>
              
              {/* Timestamp skeleton */}
              <div className="flex-shrink-0">
                <TelegramSkeleton 
                  width="w-16" 
                  height="h-3" 
                  className="bg-gray-100"
                />
              </div>
            </div>
          </TelegramShimmer>
        ))}
      </div>

      {/* Empty state skeleton (when no activities) */}
      <div className="text-center py-8 hidden" id="empty-state-skeleton">
        <TelegramShimmer>
          <TelegramSkeleton 
            width="w-16" 
            height="h-16" 
            rounded="rounded-full" 
            className="bg-gray-100 mx-auto mb-4"
          />
        </TelegramShimmer>
        <TelegramShimmer>
          <TelegramSkeleton 
            width="w-48" 
            height="h-4" 
            className="bg-gray-200 mx-auto"
          />
        </TelegramShimmer>
      </div>
    </div>
  );
};

export default RecentActivitiesSkeleton;