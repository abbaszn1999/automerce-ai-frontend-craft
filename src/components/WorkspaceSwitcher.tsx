
import React, { useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { PlusCircle, ChevronDown, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";

const WorkspaceSwitcher: React.FC = () => {
  const { 
    workspaces, 
    currentWorkspace, 
    setCurrentWorkspace, 
    createWorkspace,
    isLoading 
  } = useWorkspace();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) {
      toast.error("Please enter a workspace name");
      return;
    }

    try {
      setIsCreating(true);
      const workspace = await createWorkspace(newWorkspaceName.trim());
      setCurrentWorkspace(workspace);
      setNewWorkspaceName("");
      setCreateDialogOpen(false);
      toast.success(`Workspace "${newWorkspaceName}" created successfully`);
    } catch (error) {
      console.error("Error creating workspace:", error);
      toast.error("Failed to create workspace");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <>
                <span className="truncate max-w-[120px]">
                  {currentWorkspace?.name || "Select Workspace"}
                </span>
                <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px]">
          {workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              className="cursor-pointer flex justify-between items-center"
              onClick={() => setCurrentWorkspace(workspace)}
            >
              <span className="truncate">{workspace.name}</span>
              {currentWorkspace?.id === workspace.id && (
                <span className="w-2 h-2 rounded-full bg-primary ml-2" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem
            className="cursor-pointer text-primary focus:text-primary flex items-center"
            onClick={() => setCreateDialogOpen(true)}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            <span>New Workspace</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
            <DialogDescription>
              Add a new workspace to organize your projects.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Workspace Name</Label>
              <Input
                id="workspace-name"
                placeholder="Enter workspace name"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateWorkspace();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateWorkspace}
              disabled={isCreating || !newWorkspaceName.trim()}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Workspace"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WorkspaceSwitcher;
