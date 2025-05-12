
import React, { useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/utils/utils";
import { ChevronDown, Plus, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const WorkspaceSelector: React.FC = () => {
  const { workspaces, currentWorkspace, setCurrentWorkspaceById } = useWorkspace();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center justify-between w-full cursor-pointer">
            <span className="font-medium">
              {currentWorkspace ? currentWorkspace.name : "Select Workspace"}
            </span>
            <ChevronDown size={16} />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="workspace-dropdown">
          {workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              className="workspace-item"
              onClick={() => setCurrentWorkspaceById(workspace.id)}
            >
              {workspace.name}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem 
            className="workspace-item border-t"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus size={14} className="mr-2" /> Add Workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <CreateWorkspaceDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </>
  );
};

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateWorkspaceDialog: React.FC<CreateWorkspaceDialogProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createWorkspace } = useWorkspace();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const result = await createWorkspace(name, description);
    
    if (result) {
      setName("");
      setDescription("");
      onOpenChange(false);
    }
    
    setIsSubmitting(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Workspace</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="workspace-name">Workspace Name</Label>
            <Input
              id="workspace-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Workspace"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workspace-description">Description (Optional)</Label>
            <Textarea
              id="workspace-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the purpose of this workspace..."
              rows={3}
            />
          </div>
          <div className="pt-2 flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Workspace"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const WorkspaceList: React.FC = () => {
  const { workspaces, loading, currentWorkspace, setCurrentWorkspaceById } = useWorkspace();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Workspaces</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus size={18} className="mr-2" /> New Workspace
        </Button>
      </div>
      
      {workspaces.length === 0 ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center">
            <p className="text-lg font-medium mb-4">You don't have any workspaces yet</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              Create Your First Workspace
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace) => (
            <Card 
              key={workspace.id} 
              className={`overflow-hidden cursor-pointer transition-all ${
                currentWorkspace?.id === workspace.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setCurrentWorkspaceById(workspace.id)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-lg">{workspace.name}</h3>
                  <Settings size={18} className="text-gray-400" />
                </div>
                {workspace.description && (
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {workspace.description}
                  </p>
                )}
                <div className="text-xs text-gray-500">
                  Created: {formatDate(workspace.created_at)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <CreateWorkspaceDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </div>
  );
};
