import React from 'react';
import AdminDashboardSkeleton from './AdminDashboardSkeleton';

const AdminLoadingLayout = () => {
  return (
    <div className="flex-1 lg:ml-64">
      <AdminDashboardSkeleton />
    </div>
  );
};

export default AdminLoadingLayout;