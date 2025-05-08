
import React from "react";

interface ProgressBarProps {
  progress: number;
  id?: string;
  height?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  id,
  height = "h-2"
}) => {
  return (
    <div className={`progress-bar ${height} bg-gray-200 rounded-full overflow-hidden`} id={id}>
      <div 
        className="progress-bar-fill h-full bg-autommerce-orange transition-all duration-300 ease-out" 
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
