
import React, { useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface WorkspaceFormProps {
  workspace?: {
    id: string;
    name: string;
    description: string | null;
  };
  onComplete?: () => void;
}

const WorkspaceForm: React.FC<WorkspaceFormProps> = ({ 
  workspace, 
  onComplete 
}) => {
  const { createWorkspace, updateWorkspace } = useWorkspace();
  const [name, setName] = useState(workspace?.name || "");
  const [description, setDescription] = useState(workspace?.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(workspace);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!name.trim()) {
      setError("Workspace name is required");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let success = false;
      
      if (isEditing && workspace) {
        const result = await updateWorkspace(workspace.id, name, description);
        success = result;
      } else {
        console.log("Creating workspace with name:", name, "description:", description);
        const result = await createWorkspace(name, description);
        console.log("Create workspace result:", result);
        success = !!result;
      }
      
      if (success && onComplete) {
        onComplete();
      }
    } catch (error: any) {
      console.error("Form submission error:", error);
      setError(error.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded">
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="workspace-name">Name</Label>
        <Input
          id="workspace-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter workspace name"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="workspace-description">Description</Label>
        <Textarea
          id="workspace-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter workspace description (optional)"
          rows={3}
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Processing...' : isEditing ? 'Update Workspace' : 'Create Workspace'}
      </Button>
    </form>
  );
};

export default WorkspaceForm;
