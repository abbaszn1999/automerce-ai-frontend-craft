
import React from "react";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";
import AppFooter from "./AppFooter";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AppSidebar />
      <div className="flex-1 min-w-0 ml-64">
        <AppHeader />
        <main className="px-6 py-6">
          {children}
        </main>
        <AppFooter />
      </div>
    </div>
  );
};

export default AppLayout;
