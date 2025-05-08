import React from "react";
import { useAppContext } from "../context/AppContext";

const SolutionSelector: React.FC = () => {
  const { currentSolution, setCurrentSolution, setCurrentView } = useAppContext();

  const solutions = [
    { id: "ae", name: "Attribute Extraction" },
    { id: "cb", name: "Collection Builder" },
    { id: "ho", name: "Header Optimization" },
    { id: "lhf", name: "Low Hanging Fruits" },
    { id: "il", name: "Internal Links" },
    { id: "opb", name: "On-Page Boosting" }
  ];

  const handleSolutionChange = (solutionId: "ae" | "cb" | "ho" | "lhf" | "il" | "opb") => {
    setCurrentSolution(solutionId);
    setCurrentView("project");
  };

  return (
    <nav className="solution-selector" id="main-solution-selector">
      <div className="solution-tabs flex items-center overflow-x-auto">
        {solutions.map(solution => (
          <button
            key={solution.id}
            className={`solution-tab ${currentSolution === solution.id ? "active" : ""}`}
            onClick={() => handleSolutionChange(solution.id as any)}
            aria-selected={currentSolution === solution.id}
          >
            {solution.name}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default SolutionSelector;

