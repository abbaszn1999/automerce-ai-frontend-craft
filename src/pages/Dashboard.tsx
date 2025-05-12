
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { WorkspaceList, CreateWorkspaceDialog } from "@/components/workspace/WorkspaceManager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useState } from "react";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { currentWorkspace, workspaces } = useWorkspace();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Display welcome screen when no workspaces exist
  if (workspaces.length === 0) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome to Autommerce.ai</h1>
          <p className="text-gray-600 mt-2">
            Let's get started by creating your first workspace
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center max-w-md">
              <h2 className="text-xl font-semibold mb-4">Create a Workspace</h2>
              <p className="text-gray-600 mb-6">
                A workspace is where you'll organize all your projects and configurations.
                You can create multiple workspaces for different sites or purposes.
              </p>
              <Button size="lg" onClick={() => setShowCreateDialog(true)}>
                <Plus size={18} className="mr-2" /> Create Workspace
              </Button>
            </div>
          </CardContent>
        </Card>

        <CreateWorkspaceDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {currentWorkspace ? (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-bold">{currentWorkspace.name}</h1>
            {currentWorkspace.description && (
              <p className="text-gray-600 mt-2">{currentWorkspace.description}</p>
            )}
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-gray-500 mt-1">No projects created yet</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Feeds</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-gray-500 mt-1">No feeds configured</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Integrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-gray-500 mt-1">No active integrations</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Projects section would go here */}
        </>
      ) : (
        <WorkspaceList />
      )}
    </div>
  );
};

export default Dashboard;
