
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSupabase } from "@/hooks/useSupabase";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, ArrowUpRight, Loader2, Plus } from "lucide-react";
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
  const { getProjects, createProject } = useSupabase();
  const { currentWorkspace, isLoading: isWorkspaceLoading, refreshWorkspaces } = useWorkspace();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [projectFetchError, setProjectFetchError] = useState<string | null>(null);

  const fetchProjects = async () => {
    if (!currentWorkspace) {
      console.log("No workspace available, cannot fetch projects");
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setProjectFetchError(null);
      console.log("Fetching AE projects for workspace:", currentWorkspace.id);
      
      // Get all projects for this workspace with module type AI_ATTRIBUTE_ENRICHMENT
      const data = await getProjects(currentWorkspace.id, "AI_ATTRIBUTE_ENRICHMENT");
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (data.projects) {
        console.log("Projects found:", data.projects);
        setProjects(data.projects);
      } else {
        console.log("No projects found or invalid response format");
        setProjects([]);
      }
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      setProjectFetchError(error.message || "Failed to load projects. Please try again.");
      toast.error("Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // If workspace data has loaded and we have a current workspace, fetch projects
    if (!isWorkspaceLoading) {
      if (currentWorkspace) {
        console.log("Workspace ready, fetching projects");
        fetchProjects();
      } else {
        console.log("No workspace available yet, attempting to refresh workspaces");
        refreshWorkspaces().then(() => {
          console.log("Workspaces refreshed");
          setIsLoading(false);
        });
      }
    }
  }, [currentWorkspace, isWorkspaceLoading]);
  
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
      
      const data = await createProject(
        newProjectName.trim(),
        currentWorkspace.id,
        "AI_ATTRIBUTE_ENRICHMENT"
      );
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (data.project) {
        toast.success("Project created successfully");
        setNewProjectName("");
        setCreateDialogOpen(false);
        await fetchProjects();
        
        // Navigate to the new project
        console.log("Navigating to new project:", data.project.id);
        navigate(`/ae/project/${data.project.id}`);
      } else {
        throw new Error("Failed to create project: Invalid response format");
      }
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
        <Button onClick={() => refreshWorkspaces()}>
          Retry Loading Workspace
        </Button>
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
                    required
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

      {projectFetchError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            {projectFetchError}
            <Button variant="outline" size="sm" className="w-fit mt-2" onClick={fetchProjects}>
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

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
