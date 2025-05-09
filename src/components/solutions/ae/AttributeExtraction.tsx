
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, ArrowUpRight, Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Project {
  id: string;
  name: string;
  created_at: string;
}

const AttributeExtraction: React.FC = () => {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // Create a new project locally without backend calls
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProjectName.trim()) {
      toast.error("Project name is required");
      return;
    }
    
    try {
      setIsCreating(true);
      
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
      setCreateDialogOpen(false);
      
      // Navigate to the new project
      navigate(`/ae/project/${newProject.id}`);
    } catch (error: any) {
      console.error("Error creating project:", error);
      toast.error(error.message || "Failed to create project");
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleOpenProject = (projectId: string) => {
    console.log("Opening project:", projectId);
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
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Create a new attribute enrichment project to organize your extraction jobs.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateProject}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    placeholder="Enter project name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    required
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  This project will be created locally without backend storage.
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating || !newProjectName.trim()}>
                  {isCreating ? "Creating..." : "Create Project"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {projects.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Projects Yet</CardTitle>
              <CardDescription>
                Create your first attribute enrichment project to get started.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Create Project
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Projects</CardTitle>
              <CardDescription>
                Manage your attribute enrichment projects
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                          {new Date(project.created_at).toLocaleDateString()}
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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AttributeExtraction;
