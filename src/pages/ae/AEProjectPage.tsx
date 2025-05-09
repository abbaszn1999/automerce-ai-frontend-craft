
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSupabase } from "@/hooks/useSupabase";
import { toast } from "@/components/ui/sonner";
import AESetupTab from "@/components/solutions/ae/tabs/AESetupTab";
import AEInputTab from "@/components/solutions/ae/tabs/AEInputTab";
import AEAttributesTab from "@/components/solutions/ae/tabs/AEAttributesTab";
import AEResultsTab from "@/components/solutions/ae/tabs/AEResultsTab";
import { Loader2, AlertCircle } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
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
  const { getProject } = useSupabase();
  const { currentWorkspace } = useWorkspace();
  
  const [project, setProject] = useState<AEProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("setup");
  const [fetchAttempts, setFetchAttempts] = useState(0);

  // Fetch project details with retry logic
  useEffect(() => {
    if (!projectId) {
      setError("No project ID provided");
      setIsLoading(false);
      return;
    }
    
    const fetchProject = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log(`Fetching project details for: ${projectId} (Attempt ${fetchAttempts + 1})`);
        const projectData = await getProject(projectId);
        
        // Check for error in the response
        if (projectData.error) {
          throw new Error(projectData.error || "Failed to load project");
        }
        
        if (projectData.project) {
          console.log("Project found:", projectData.project);
          setProject(projectData.project);
          setIsLoading(false);
          return;
        }
        
        // If we get here, no project was found
        throw new Error("Project not found");
        
      } catch (error: any) {
        console.error("Error fetching project:", error);
        setError(error.message || "Failed to load project");
        
        // If we've had fewer than 3 retries and there's no explicit "not found" message,
        // we'll try again after a delay
        if (fetchAttempts < 2 && !error.message?.includes("not found")) {
          console.log(`Will retry fetching project in ${(fetchAttempts + 1) * 1000}ms`);
          setTimeout(() => {
            setFetchAttempts(prev => prev + 1);
          }, (fetchAttempts + 1) * 1000);
        } else {
          toast.error("Failed to load project");
          setIsLoading(false);
        }
      }
    };
    
    fetchProject();
  }, [projectId, getProject, fetchAttempts]);

  const handleRetry = () => {
    setFetchAttempts(0); // Reset attempts counter to trigger a fresh fetch
  };

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
        <p className="text-lg">Loading project...</p>
        <p className="text-sm text-muted-foreground mt-2">Project ID: {projectId}</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Error loading project</AlertTitle>
          <AlertDescription>
            {error || "Project not found"}
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col gap-4">
          <Button onClick={handleRetry} className="w-fit">
            Try Again
          </Button>
          
          <Button onClick={() => navigate("/")} variant="outline" className="w-fit">
            Back to Home
          </Button>
          
          <div className="mt-4 p-4 bg-muted rounded-md">
            <h3 className="font-medium mb-2">Troubleshooting Tips:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Check that you're using the correct project ID</li>
              <li>Verify that you have permission to access this project</li>
              <li>Make sure the project hasn't been deleted</li>
              <li>Check your workspace permissions</li>
            </ul>
          </div>
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
