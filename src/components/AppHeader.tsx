
import React from "react";
import { User, Bell } from "lucide-react";
import AutommerceLogo from "./AutommerceLogo";

const AppHeader: React.FC = () => {
  return (
    <header className="content-header">
      <div className="flex items-center gap-4">
        <AutommerceLogo size="sm" />
      </div>
      
      <div className="user-menu flex items-center gap-4">
        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">user@autommerce.ai</span>
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
            <User size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
