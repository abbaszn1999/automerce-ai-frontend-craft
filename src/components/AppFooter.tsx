
import React from "react";

const AppFooter: React.FC = () => {
  return (
    <footer className="app-footer bg-white border-t border-gray-200 py-4 px-6 mt-8">
      <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
        <div className="mb-2 md:mb-0">
          © {new Date().getFullYear()} Autommerce.ai. All rights reserved.
        </div>
        <div className="flex space-x-4">
          <a href="#" className="hover:text-primary hover:underline">Terms</a>
          <a href="#" className="hover:text-primary hover:underline">Privacy</a>
          <a href="#" className="hover:text-primary hover:underline">Support</a>
          <a href="#" className="hover:text-primary hover:underline">Documentation</a>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
