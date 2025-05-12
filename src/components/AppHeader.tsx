
import React from "react";
import { User, Bell, LogOut } from "lucide-react";
import AutommerceLogo from "./AutommerceLogo";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const AppHeader: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleAuthAction = () => {
    if (user) {
      signOut();
    } else {
      navigate('/auth');
    }
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
        
        {user ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">{user.email}</span>
            <button className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
              <User size={18} />
            </button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleAuthAction}
              className="flex items-center gap-1"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </Button>
          </div>
        ) : (
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleAuthAction}
          >
            Login
          </Button>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
