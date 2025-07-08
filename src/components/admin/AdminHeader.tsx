
import React from 'react';

const AdminHeader: React.FC = () => {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-white mb-2 font-serif">
        ✨ TaleForge Admin Panel
      </h1>
      <p className="text-purple-200">
        Manage AI providers and story generation settings
      </p>
    </div>
  );
};

export default AdminHeader;
