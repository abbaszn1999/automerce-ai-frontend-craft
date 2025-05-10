
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface Project {
  id: string;
  name: string;
  created_at: string;
}

const AttributeExtraction: React.FC = () => {
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newProjectName, setNewProjectName] = useState("");

  const loadProjects = () => {
    try {
      setIsLoading(true);
      
      // Get all keys in localStorage that start with 'ae-project-'
      const projectKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('ae-project-')) {
          projectKeys.push(key);
        }
      }
      
      // Load all projects from localStorage
      const loadedProjects: Project[] = [];
      projectKeys.forEach(key => {
        const projectData = localStorage.getItem(key);
        if (projectData) {
          loadedProjects.push(JSON.parse(projectData));
        }
      });
      
      setProjects(loadedProjects);
    } catch (error) {
      console.error("Error loading projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadProjects();
  }, []);
  
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast.error("Project name is required");
      return;
    }
    
    try {
      // Create a new project with a unique ID
      const projectId = `proj_${Date.now()}`;
      const newProject: Project = {
        id: projectId,
        name: newProjectName.trim(),
        created_at: new Date().toISOString()
      };
      
      // Save to localStorage
      localStorage.setItem(`ae-project-${projectId}`, JSON.stringify(newProject));
      
      // Add to projects list
      setProjects([...projects, newProject]);
      
      toast.success("Project created successfully");
      setNewProjectName("");
      
      // Navigate directly to the project setup page
      navigate(`/ae/project/${projectId}`);
      
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project");
    }
  };
  
  const handleOpenProject = (projectId: string) => {
    // Navigate directly to the project page
    navigate(`/ae/project/${projectId}`);
  };

  if (isLoading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Attribute Enrichment Projects</h1>
        <p className="text-muted-foreground mt-1">
          Extract and organize product attributes using AI to enhance your product data quality and improve filtering options.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Create New AE Project</h3>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="flex-grow"
            />
            <Button onClick={handleCreateProject} className="flex items-center gap-1 bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4" />
              <span>Create AE Project</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Existing AE Projects</h3>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No projects created yet. Create your first project above.</p>
            </div>
          ) : (
            <div className="border rounded-md divide-y">
              {projects.map(project => (
                <div key={project.id} className="flex justify-between items-center p-4">
                  <div>
                    <div className="font-medium">{project.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Last updated: {new Date(project.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleOpenProject(project.id)}
                    className="ml-2 bg-green-600 hover:bg-green-700"
                  >
                    Open Project
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttributeExtraction;
