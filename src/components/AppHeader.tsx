
import React from "react";
import { User, Bell, LogOut } from "lucide-react";
import AutommerceLogo from "./AutommerceLogo";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";

const AppHeader: React.FC = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AutommerceLogo size="sm" />
      </div>
      
      <div className="user-menu flex items-center gap-4">
        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">{user?.email || "user@autommerce.ai"}</span>
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
            <User size={18} />
          </button>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut size={18} className="mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
