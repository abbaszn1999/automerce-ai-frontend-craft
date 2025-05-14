import React, { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import { formatDate } from "../../utils/utils";
import { toast } from "sonner";
import { PlusCircle, Trash2 } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { dataService, Project } from "@/services/dataService";
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
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch projects 
  const fetchProjects = async () => {
    if (!currentWorkspace) return;
    
    setIsLoading(true);
    try {
      const data = await dataService.getProjects(currentWorkspace.id, solutionPrefix);
      setProjects(data);
    } catch (error) {
      console.error("Error in fetchProjects:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load projects when component mounts or workspace changes
  useEffect(() => {
    if (currentWorkspace) {
      fetchProjects();
    } else {
      setProjects([]);
    }
  }, [solutionPrefix, currentWorkspace]);

  const handleCreateProject = async () => {
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
    
    setIsLoading(true);
    try {
      const newProject = await dataService.createProject({
        name: newProjectName.trim(),
        solutionPrefix: solutionPrefix,
        workspaceId: currentWorkspace.id,
        description: "",
        lastUpdated: new Date()
      });
      
      setProjects(prev => [newProject, ...prev]);
      setNewProjectName("");
      
      // Automatically open the new project
      handleOpenProject(newProject.name);
      toast.success(`Project "${newProject.name}" created successfully!`);
    } catch (error) {
      console.error("Error in handleCreateProject:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenProject = (projectName: string) => {
    setSelectedProjectName(projectName);
    setCurrentView("tool");
  };

  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete || !currentWorkspace) return;

    setIsLoading(true);
    try {
      await dataService.deleteProject(projectToDelete);
      
      // Remove the project from the list
      const updatedProjects = projects.filter(p => p.id !== projectToDelete.id);
      setProjects(updatedProjects);
      toast.success(`Project "${projectToDelete.name}" deleted successfully`);
    } catch (error) {
      console.error("Error in confirmDeleteProject:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
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
                disabled={isLoading}
              >
                <PlusCircle size={18} />
                <span>Create {solutionPrefix.toUpperCase()} Project</span>
              </Button>
            </div>
          </div>
          
          {/* Existing Projects */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-3">Existing {solutionPrefix.toUpperCase()} Projects in {currentWorkspace.name}</h2>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-2 text-gray-500">Loading projects...</p>
              </div>
            ) : projects.length === 0 ? (
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
                        Last updated: {project.lastUpdated ? formatDate(project.lastUpdated) : 'N/A'}
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
              disabled={isLoading}
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
