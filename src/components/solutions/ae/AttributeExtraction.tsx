
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ArrowUpRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Project {
  id: string;
  name: string;
  created_at: string;
}

const AttributeExtraction: React.FC = () => {
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState("");
  
  // Load projects from localStorage on component mount
  useEffect(() => {
    const savedProjects = localStorage.getItem("ae-projects");
    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects));
      } catch (error) {
        console.error("Error loading saved projects:", error);
      }
    }
  }, []);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("ae-projects", JSON.stringify(projects));
  }, [projects]);
  
  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      toast.error("Project name is required");
      return;
    }
    
    try {
      // Create project locally
      const newProject = {
        id: `local-${Date.now()}`,
        name: newProjectName.trim(),
        created_at: new Date().toISOString()
      };
      
      // Add to local projects
      setProjects(prev => [...prev, newProject]);
      toast.success("Project created successfully");
      setNewProjectName("");
      
      // Navigate to the new project
      navigate(`/ae/project/${newProject.id}`);
    } catch (error: any) {
      console.error("Error creating project:", error);
      toast.error(error.message || "Failed to create project");
    }
  };
  
  const handleOpenProject = (projectId: string) => {
    navigate(`/ae/project/${projectId}`);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Attribute Enrichment</h1>
          <p className="text-muted-foreground">
            Extract and organize product attributes using AI
          </p>
        </div>
        
        <Button onClick={handleCreateProject}>
          <Plus className="h-4 w-4 mr-2" /> New Project
        </Button>
      </div>

      <div className="card shadow-sm border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Your Projects</h2>
        <p className="text-muted-foreground mb-6">Manage your attribute enrichment projects</p>
        
        <div className="mb-6 flex gap-4">
          <Input
            placeholder="Enter project name"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
            className="max-w-xs"
          />
          
          <Button onClick={handleCreateProject}>
            <Plus className="h-4 w-4 mr-2" /> New Project
          </Button>
        </div>
        
        {projects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No projects created yet. Create your first project above.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map(project => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">
                      {project.name}
                    </TableCell>
                    <TableCell>
                      {new Date(project.created_at).toLocaleDateString() !== "Invalid Date" 
                        ? new Date(project.created_at).toLocaleDateString() 
                        : "Invalid Date"}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenProject(project.id)}
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttributeExtraction;
