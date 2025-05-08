
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
    <div className={`progress-bar ${height}`} id={id}>
      <div 
        className="progress-bar-fill" 
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
