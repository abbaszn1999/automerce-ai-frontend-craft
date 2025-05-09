
import React from "react";
import { Bell } from "lucide-react";
import AutommerceLogo from "./AutommerceLogo";

const AppHeader: React.FC = () => {
  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AutommerceLogo size="sm" />
      </div>
      
      <div className="user-menu flex items-center gap-4">
        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
};

export default AppHeader;
