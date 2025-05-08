
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
      <div className="content-wrapper">
        <AppHeader />
        <main className="content-body">
          {children}
        </main>
        <AppFooter />
      </div>
    </div>
  );
};

export default AppLayout;
