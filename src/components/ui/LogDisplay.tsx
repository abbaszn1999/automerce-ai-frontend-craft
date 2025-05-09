
import React, { useRef, useEffect } from "react";

interface LogItem {
  id?: string;
  message: string;
  timestamp?: string;
  level?: string;
}

interface LogDisplayProps {
  logs: string[] | LogItem[];
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

  // Function to render log item based on type
  const renderLogItem = (log: string | LogItem, index: number) => {
    if (typeof log === 'string') {
      return (
        <div key={index} className="mb-1">
          <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
        </div>
      );
    } else {
      // It's a LogItem
      return (
        <div key={log.id || index} className="mb-1">
          <span className="text-gray-500">[{log.timestamp || new Date().toLocaleTimeString()}]</span>
          {log.level && <span className={`ml-1 mr-2 ${getLogLevelClass(log.level)}`}>[{log.level}]</span>}
          {log.message}
        </div>
      );
    }
  };

  // Function to get class based on log level
  const getLogLevelClass = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-amber-500';
      case 'info':
        return 'text-blue-500';
      case 'success':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className={`log-display bg-slate-50 p-4 rounded border overflow-y-auto ${maxHeight}`} id={id}>
      {logs.length === 0 ? (
        <div className="text-gray-500 italic">No logs available</div>
      ) : (
        logs.map((log, index) => renderLogItem(log, index))
      )}
      <div ref={logEndRef} />
    </div>
  );
};

export default LogDisplay;
