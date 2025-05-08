
import React, { useRef, useEffect } from "react";

interface LogDisplayProps {
  logs: string[];
  id?: string;
  maxHeight?: string;
}

const LogDisplay: React.FC<LogDisplayProps> = ({ 
  logs, 
  id,
  maxHeight = "max-h-[300px]" 
}) => {
  const logEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when logs update
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  return (
    <div className={`log-display ${maxHeight}`} id={id}>
      {logs.map((log, index) => (
        <div key={index} className="mb-1">
          <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
        </div>
      ))}
      <div ref={logEndRef} />
    </div>
  );
};

export default LogDisplay;
