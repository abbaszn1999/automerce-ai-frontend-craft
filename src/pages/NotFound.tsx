
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import AppLayout from "../components/AppLayout";

const NotFound: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center py-16">
        <h1 className="text-4xl font-bold mb-4 text-primary">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! Page not found</p>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          The page you are looking for might have been removed, had its name changed, 
          or is temporarily unavailable.
        </p>
        <a href="/" className="btn btn-primary">
          Return to Dashboard
        </a>
      </div>
    </AppLayout>
  );
};

export default NotFound;
