
import React from "react";
import { User } from "lucide-react";

const AppHeader: React.FC = () => {
  return (
    <header className="app-header h-16">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        <div className="logo text-xl font-semibold flex items-center">
          <span className="text-primary">Autommerce</span>
          <span className="text-gray-700">.ai</span>
        </div>
        
        <div className="user-menu flex items-center">
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
            <User size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
