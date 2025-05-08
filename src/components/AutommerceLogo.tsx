
import React from "react";

interface AutommerceLogoProps {
  variant?: "default" | "white";
  size?: "sm" | "md" | "lg";
}

const AutommerceLogo: React.FC<AutommerceLogoProps> = ({ 
  variant = "default", 
  size = "md" 
}) => {
  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10"
  };

  if (variant === "white") {
    return (
      <div className="flex items-center">
        <div className="flex flex-col">
          <span className={`font-bold text-white ${size === "sm" ? "text-lg" : size === "md" ? "text-xl" : "text-2xl"}`}>
            Autommerce
          </span>
          <span className={`text-white/80 ${size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base"}`}>
            E-commerce with AI Excellence
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <div className="mr-2">
        <svg 
          className={sizeClasses[size]} 
          viewBox="0 0 100 100" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M50 5 L75 20 L90 50 L75 80 L50 95 L25 80 L10 50 L25 20 Z" fill="#F76D01" />
          <path d="M30 70 L50 80 L70 70 C60 90 40 90 30 70 Z" fill="#C40000" />
          <path d="M30 40 L70 40 C80 50 80 60 70 70 L50 80 L30 70 C20 60 20 50 30 40 Z" fill="#400095" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className={`font-bold text-gray-800 ${size === "sm" ? "text-lg" : size === "md" ? "text-xl" : "text-2xl"}`}>
          Autommerce
        </span>
        <span className={`text-gray-600 ${size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base"}`}>
          E-commerce with AI Excellence
        </span>
      </div>
    </div>
  );
};

export default AutommerceLogo;
