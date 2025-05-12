
import React, { useState, useEffect } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { PlusCircle, ChevronDown, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import WorkspaceForm from "./WorkspaceForm";
import { toast } from "sonner";

const WorkspaceSelector: React.FC = () => {
  const { workspaces, currentWorkspace, setCurrentWorkspace, isLoading } = useWorkspace();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showNoWorkspacesDialog, setShowNoWorkspacesDialog] = useState(false);
  const navigate = useNavigate();

  // Check if we need to show create workspace prompt
  useEffect(() => {
    if (!isLoading && workspaces.length === 0) {
      setShowNoWorkspacesDialog(true);
    } else {
      setShowNoWorkspacesDialog(false);
    }
  }, [workspaces, isLoading]);

  const handleWorkspaceChange = (workspace: any) => {
    setCurrentWorkspace(workspace);
    localStorage.setItem('currentWorkspaceId', workspace.id);
    toast.success(`Switched to workspace: ${workspace.name}`);
  };

  const handleManageWorkspaces = () => {
    navigate("/workspaces");
  };

  return (
    <>
      {/* Create First Workspace Dialog */}
      <Dialog open={showNoWorkspacesDialog} onOpenChange={setShowNoWorkspacesDialog}>
        <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Create Your First Workspace</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              You need at least one workspace to use Autommerce.ai. Create your first workspace now.
            </p>
            <WorkspaceForm 
              onComplete={() => {
                setShowNoWorkspacesDialog(false);
              }} 
            />
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 max-w-[200px]">
              <span className="truncate">
                {isLoading 
                  ? "Loading..." 
                  : currentWorkspace?.name || "Select Workspace"}
              </span>
              <ChevronDown size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
            {isLoading ? (
              <DropdownMenuItem disabled>Loading workspaces...</DropdownMenuItem>
            ) : workspaces.length > 0 ? (
              <>
                {workspaces.map((workspace) => (
                  <DropdownMenuItem 
                    key={workspace.id} 
                    onClick={() => handleWorkspaceChange(workspace)}
                    className={currentWorkspace?.id === workspace.id ? "bg-secondary" : ""}
                  >
                    <span className="truncate">{workspace.name}</span>
                  </DropdownMenuItem>
                ))}
              </>
            ) : (
              <DropdownMenuItem disabled>No workspaces available</DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <PlusCircle className="mr-2" size={16} />
                  Create New Workspace
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Workspace</DialogTitle>
                </DialogHeader>
                <WorkspaceForm onComplete={() => setIsDialogOpen(false)} />
              </DialogContent>
            </Dialog>
            <DropdownMenuItem onClick={handleManageWorkspaces}>
              <Settings className="mr-2" size={16} />
              Manage Workspaces
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};

export default WorkspaceSelector;
