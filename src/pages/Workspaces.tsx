
import React, { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Edit, User } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import WorkspaceForm from "../components/workspace/WorkspaceForm";
import { formatDate } from "../utils/utils";
import { useNavigate } from "react-router-dom";

const Workspaces: React.FC = () => {
  const { 
    workspaces, 
    fetchWorkspaces, 
    deleteWorkspace, 
    setCurrentWorkspace,
    isLoading
  } = useWorkspace();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleEditWorkspace = (workspace: any) => {
    setEditingWorkspace(workspace);
  };

  const handleDeleteWorkspace = async (id: string) => {
    await deleteWorkspace(id);
  };

  const handleSelectWorkspace = (workspace: any) => {
    setCurrentWorkspace(workspace);
    localStorage.setItem('currentWorkspaceId', workspace.id);
    navigate("/");
  };

  return (
    <AppLayout>
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Workspaces</h1>
            <p className="text-gray-500">
              Manage your workspaces and team members
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusCircle size={16} />
                <span>Create Workspace</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Workspace</DialogTitle>
              </DialogHeader>
              <WorkspaceForm onComplete={() => setIsCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : workspaces.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-4xl text-gray-300 mb-4">🏢</div>
              <h3 className="text-xl font-medium mb-2">No workspaces yet</h3>
              <p className="text-gray-500 mb-6 text-center max-w-md">
                Create your first workspace to start organizing your projects and team members
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Create Your First Workspace
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((workspace) => (
              <Card key={workspace.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="flex justify-between items-start">
                    <span className="truncate">{workspace.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    {workspace.description ? (
                      <p className="text-sm text-gray-600">{workspace.description}</p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No description</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div>Created {formatDate(workspace.created_at)}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => handleSelectWorkspace(workspace)}
                    >
                      Select
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditWorkspace(workspace)}
                    >
                      <Edit size={14} className="mr-1" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={14} className="mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Workspace</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{workspace.name}"? This action cannot be undone and will remove all projects and data associated with this workspace.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() => handleDeleteWorkspace(workspace.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Workspace Dialog */}
      <Dialog
        open={Boolean(editingWorkspace)}
        onOpenChange={(open) => {
          if (!open) setEditingWorkspace(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Workspace</DialogTitle>
          </DialogHeader>
          {editingWorkspace && (
            <WorkspaceForm
              workspace={editingWorkspace}
              onComplete={() => setEditingWorkspace(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Workspaces;
