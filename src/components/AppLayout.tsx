
import React from "react";
import { AppProvider } from "../context/AppContext";
import AppHeader from "./AppHeader";
import SolutionSelector from "./SolutionSelector";
import AppFooter from "./AppFooter";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col">
        <AppHeader />
        <SolutionSelector />
        <main className="main-content flex-1">
          {children}
        </main>
        <AppFooter />
      </div>
    </AppProvider>
  );
};

export default AppLayout;
