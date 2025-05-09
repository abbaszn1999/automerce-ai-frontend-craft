
import React, { createContext, useContext, useState } from "react";

interface AppContextType {
  currentSolution: string;
  setCurrentSolution: (solution: string) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  cbCurrentStage: number;
  setCbCurrentStage: (stage: number) => void;
  aeCurrentStage: number;
  setAeCurrentStage: (stage: number) => void;
}

const AppContext = createContext<AppContextType>({
  currentSolution: "ae",
  setCurrentSolution: () => {},
  currentView: "dashboard",
  setCurrentView: () => {},
  cbCurrentStage: 1,
  setCbCurrentStage: () => {},
  aeCurrentStage: 1,
  setAeCurrentStage: () => {},
});

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSolution, setCurrentSolution] = useState<string>("ae");
  const [currentView, setCurrentView] = useState<string>("dashboard");
  const [cbCurrentStage, setCbCurrentStage] = useState<number>(1);
  const [aeCurrentStage, setAeCurrentStage] = useState<number>(1);
  
  return (
    <AppContext.Provider
      value={{
        currentSolution,
        setCurrentSolution,
        currentView,
        setCurrentView,
        cbCurrentStage,
        setCbCurrentStage,
        aeCurrentStage,
        setAeCurrentStage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
