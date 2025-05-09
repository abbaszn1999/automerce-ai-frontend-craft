
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import AESetupTab from "@/components/solutions/ae/tabs/AESetupTab";
import AEInputTab from "@/components/solutions/ae/tabs/AEInputTab";
import AEAttributesTab from "@/components/solutions/ae/tabs/AEAttributesTab";
import AEResultsTab from "@/components/solutions/ae/tabs/AEResultsTab";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define project type
export interface AEProject {
  id: string;
  name: string;
  created_at: string;
  workspace_id?: string;
  module_type?: string;
}

const AEProjectPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<AEProject | null>(null);
  const [activeTab, setActiveTab] = useState("setup");

  // Simulate fetching project
  useEffect(() => {
    if (!projectId) {
      return;
    }
    
    // Create a mock project for the UI to display
    const mockProject: AEProject = {
      id: projectId,
      name: projectId.startsWith("local-") ? `Project ${projectId.slice(6)}` : `Project ${projectId}`,
      created_at: new Date().toISOString()
    };
    
    setProject(mockProject);
  }, [projectId]);

  if (!project) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Error loading project</AlertTitle>
          <AlertDescription>
            Project not found
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col gap-4">
          <Button onClick={() => navigate("/")} variant="outline" className="w-fit">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">
            Project ID: {projectId}
          </p>
        </div>
        <Button onClick={() => navigate("/")}>
          Back to Dashboard
        </Button>
      </div>

      <Tabs
        defaultValue="setup"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="attributes">Attributes</TabsTrigger>
          <TabsTrigger value="input">Input</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="setup">
          <AESetupTab projectId={projectId!} />
        </TabsContent>
        <TabsContent value="attributes">
          <AEAttributesTab projectId={projectId!} />
        </TabsContent>
        <TabsContent value="input">
          <AEInputTab projectId={projectId!} onJobCreated={() => setActiveTab("results")} />
        </TabsContent>
        <TabsContent value="results">
          <AEResultsTab projectId={projectId!} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AEProjectPage;
