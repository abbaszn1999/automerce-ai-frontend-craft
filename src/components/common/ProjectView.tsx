import React, { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import { formatDate } from "../../utils/utils";
import { toast } from "@/components/ui/sonner";
import { PlusCircle } from "lucide-react";

interface ProjectViewProps {
  solutionPrefix: string;
  solutionName: string;
  solutionDescription: string;
}

interface Project {
  id: string;
  name: string;
  lastUpdated: Date;
}

const ProjectView: React.FC<ProjectViewProps> = ({ 
  solutionPrefix, 
  solutionName,
  solutionDescription 
}) => {
  const { setCurrentView, setSelectedProjectName } = useAppContext();
  const [newProjectName, setNewProjectName] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  
  // Load projects from localStorage on component mount
  useEffect(() => {
    const savedProjects = localStorage.getItem(`${solutionPrefix}-projects`);
    if (savedProjects) {
      try {
        const parsedProjects = JSON.parse(savedProjects);
        // Convert string dates back to Date objects
        const projectsWithDates = parsedProjects.map((project: any) => ({
          ...project,
          lastUpdated: new Date(project.lastUpdated)
        }));
        setProjects(projectsWithDates);
      } catch (e) {
        console.error("Error loading projects:", e);
      }
    }
  }, [solutionPrefix]);
  
  // Save projects to localStorage when they change
  useEffect(() => {
    localStorage.setItem(`${solutionPrefix}-projects`, JSON.stringify(projects));
  }, [projects, solutionPrefix]);

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      toast.error("Please enter a project name");
      return;
    }
    
    const projectExists = projects.some(
      project => project.name.toLowerCase() === newProjectName.trim().toLowerCase()
    );
    
    if (projectExists) {
      toast.error("A project with this name already exists");
      return;
    }
    
    const newProject = {
      id: `${solutionPrefix}-${Date.now()}`,
      name: newProjectName.trim(),
      lastUpdated: new Date()
    };
    
    setProjects(prev => [...prev, newProject]);
    setNewProjectName("");
    
    // Automatically open the new project
    setTimeout(() => {
      handleOpenProject(newProject.name);
      toast.success(`Project "${newProject.name}" created successfully!`);
    }, 100);
  };

  const handleOpenProject = (projectName: string) => {
    setSelectedProjectName(projectName);
    setCurrentView("tool");
  };

  const viewId = `${solutionPrefix}-project-view`;

  return (
    <div id={viewId} className="project-view-area">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{solutionName} Projects</h1>
        <p className="text-gray-600">{solutionDescription}</p>
      </div>
      
      {/* Create New Project */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-3">Create New {solutionPrefix.toUpperCase()} Project</h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            id={`${solutionPrefix}-new-project-name`}
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Enter project name"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          
          <button 
            className="btn btn-success sm:w-auto whitespace-nowrap flex gap-2 items-center"
            onClick={handleCreateProject}
          >
            <PlusCircle size={18} />
            <span>Create {solutionPrefix.toUpperCase()} Project</span>
          </button>
        </div>
      </div>
      
      {/* Existing Projects */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-3">Existing {solutionPrefix.toUpperCase()} Projects</h2>
        
        {projects.length === 0 ? (
          <div id={`${solutionPrefix}-no-projects-message`} className="text-center py-8 text-gray-500">
            No projects created yet. Create your first project above.
          </div>
        ) : (
          <ul className="project-list" id={`${solutionPrefix}-project-list-container`}>
            {projects.map((project) => (
              <li key={project.id} className="project-list-item">
                <div>
                  <div className="font-medium">{project.name}</div>
                  <div className="text-xs text-gray-500">
                    Last updated: {formatDate(project.lastUpdated)}
                  </div>
                </div>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => handleOpenProject(project.name)}
                >
                  Open Project
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProjectView;
