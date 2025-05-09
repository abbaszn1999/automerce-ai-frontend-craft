
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSupabase } from "@/hooks/useSupabase";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, ArrowUpRight, Loader2, Plus, Trash2 } from "lucide-react";
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
  const { callEdgeFunction } = useSupabase();
  const { currentWorkspace, isLoading: isWorkspaceLoading } = useWorkspace();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const fetchProjects = async () => {
    if (!currentWorkspace) return;
    
    try {
      setIsLoading(true);
      console.log("Fetching AE projects for workspace:", currentWorkspace.id);
      
      // First, try getting all projects for this workspace from the modern projects endpoint
      const data = await callEdgeFunction("projects", {
        query: { 
          workspaceId: currentWorkspace.id,
          moduleType: "AI_ATTRIBUTE_ENRICHMENT"
        }
      });
      
      if (data && data.projects) {
        console.log("Projects found:", data.projects);
        setProjects(data.projects);
        return;
      }

      // Fallback to older ae-projects endpoint if needed
      const legacyData = await callEdgeFunction("ae-projects");
      
      if (legacyData && legacyData.projects) {
        console.log("Legacy projects found:", legacyData.projects);
        setProjects(legacyData.projects);
      } else {
        console.log("No projects found");
        setProjects([]);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (currentWorkspace) {
      fetchProjects();
    }
  }, [currentWorkspace]);
  
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentWorkspace) {
      toast.error("No workspace selected");
      return;
    }
    
    if (!newProjectName.trim()) {
      toast.error("Project name is required");
      return;
    }
    
    try {
      setIsCreating(true);
      console.log("Creating project in workspace:", currentWorkspace.id);
      
      // Attempt to create using the projects endpoint (preferred)
      try {
        const data = await callEdgeFunction("projects", {
          method: "POST",
          body: { 
            name: newProjectName.trim(),
            workspace_id: currentWorkspace.id,
            module_type: "AI_ATTRIBUTE_ENRICHMENT"
          }
        });
        
        if (data && data.project) {
          toast.success("Project created successfully");
          setNewProjectName("");
          setCreateDialogOpen(false);
          fetchProjects();
          return;
        }
      } catch (error) {
        console.error("Error creating project via projects endpoint:", error);
        // If projects endpoint fails, try legacy endpoint
      }
      
      // Fallback to legacy endpoint
      const data = await callEdgeFunction("ae-projects", {
        method: "POST",
        body: { name: newProjectName.trim() }
      });
      
      if (data && data.project) {
        toast.success("Project created successfully");
        setNewProjectName("");
        setCreateDialogOpen(false);
        fetchProjects();
      } else {
        throw new Error("Failed to create project");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project");
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleOpenProject = (projectId: string) => {
    navigate(`/ae/project/${projectId}`);
  };

  if (isWorkspaceLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2">Loading workspace...</p>
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No workspace available</AlertTitle>
          <AlertDescription>
            A workspace is required to manage projects. Please refresh the page or contact support if this issue persists.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2">Loading projects...</p>
      </div>
    );
  }

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
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  This project will be created in workspace: <strong>{currentWorkspace.name}</strong>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating || !newProjectName.trim()}>
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : "Create Project"}
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
