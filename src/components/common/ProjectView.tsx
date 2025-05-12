
import React, { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import { formatDate } from "../../utils/utils";
import { toast } from "sonner";
import { PlusCircle, Trash2 } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ProjectViewProps {
  solutionPrefix: string;
  solutionName: string;
  solutionDescription: string;
}

interface Project {
  id: string;
  name: string;
  lastUpdated: Date;
  workspaceId: string;
}

const ProjectView: React.FC<ProjectViewProps> = ({ 
  solutionPrefix, 
  solutionName,
  solutionDescription 
}) => {
  const { setCurrentView, setSelectedProjectName } = useAppContext();
  const { currentWorkspace } = useWorkspace();
  const [newProjectName, setNewProjectName] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Generate a storage key that includes the workspace ID
  const getStorageKey = () => {
    if (!currentWorkspace) {
      return null;
    }
    return `${currentWorkspace.id}-${solutionPrefix}-projects`;
  };
  
  // Load projects from localStorage on component mount or when workspace changes
  useEffect(() => {
    const storageKey = getStorageKey();
    if (!storageKey) {
      setProjects([]);
      return;
    }
    
    const savedProjects = localStorage.getItem(storageKey);
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
    } else {
      // Clear projects when switching to a workspace with no projects
      setProjects([]);
    }
  }, [solutionPrefix, currentWorkspace]);
  
  // Save projects to localStorage when they change
  useEffect(() => {
    const storageKey = getStorageKey();
    if (storageKey && projects.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(projects));
    } else if (storageKey) {
      // If projects array is empty, remove the item from localStorage
      localStorage.removeItem(storageKey);
    }
  }, [projects, currentWorkspace]);

  const handleCreateProject = () => {
    if (!currentWorkspace) {
      toast.error("Please select a workspace first");
      return;
    }
    
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
      lastUpdated: new Date(),
      workspaceId: currentWorkspace.id
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

  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteProject = () => {
    if (projectToDelete) {
      const updatedProjects = projects.filter(p => p.id !== projectToDelete.id);
      setProjects(updatedProjects);
      toast.success(`Project "${projectToDelete.name}" deleted successfully`);
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const viewId = `${solutionPrefix}-project-view`;

  return (
    <div id={viewId} className="project-view-area">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{solutionName} Projects</h1>
        <p className="text-gray-600">{solutionDescription}</p>
      </div>
      
      {!currentWorkspace ? (
        <div className="card">
          <div className="text-center py-8 text-gray-500">
            Please select a workspace to view or create projects.
          </div>
        </div>
      ) : (
        <>
          {/* Create New Project */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-3">Create New {solutionPrefix.toUpperCase()} Project in {currentWorkspace.name}</h2>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                id={`${solutionPrefix}-new-project-name`}
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Enter project name"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              
              <Button 
                className="btn btn-success sm:w-auto whitespace-nowrap flex gap-2 items-center"
                onClick={handleCreateProject}
              >
                <PlusCircle size={18} />
                <span>Create {solutionPrefix.toUpperCase()} Project</span>
              </Button>
            </div>
          </div>
          
          {/* Existing Projects */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-3">Existing {solutionPrefix.toUpperCase()} Projects in {currentWorkspace.name}</h2>
            
            {projects.length === 0 ? (
              <div id={`${solutionPrefix}-no-projects-message`} className="text-center py-8 text-gray-500">
                No projects created yet in this workspace. Create your first project above.
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
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenProject(project.name)}
                      >
                        Open Project
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProject(project)}
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{projectToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectView;
