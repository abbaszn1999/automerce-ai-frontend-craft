
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
import { Loader2 } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

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
  const { callEdgeFunction } = useSupabase();
  const { currentWorkspace } = useWorkspace();
  
  const [project, setProject] = useState<AEProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("setup");

  // Fetch project details
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

        console.log("Fetching project details for:", projectId);
        // First try to fetch from the projects endpoint
        const projectData = await callEdgeFunction("projects", {
          query: { id: projectId }
        });
        
        if (projectData.project) {
          console.log("Project found via projects endpoint:", projectData.project);
          setProject(projectData.project);
          setIsLoading(false);
          return;
        }
        
        // Fallback to the legacy ae-projects endpoint
        console.log("Trying legacy endpoint for project:", projectId);
        const legacyData = await callEdgeFunction("ae-projects", {
          query: { projectId }
        });
        
        if (legacyData.projects && legacyData.projects.length > 0) {
          console.log("Project found via legacy endpoint:", legacyData.projects[0]);
          setProject(legacyData.projects[0]);
          setIsLoading(false);
          return;
        }
        
        // If we get here, no project was found
        throw new Error("Project not found");
        
      } catch (error: any) {
        console.error("Error fetching project:", error);
        setError(error.message || "Failed to load project");
        toast.error("Failed to load project");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProject();
  }, [projectId, callEdgeFunction, navigate]);

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <Loader2 className="h-10 w-10 animate-spin mr-2 text-primary" />
        <p className="text-lg">Loading project...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-bold mb-4">Error: {error || "Project not found"}</h2>
        <p className="mb-6 text-muted-foreground">
          We couldn't load the requested project. It may have been deleted or you might not have access to it.
        </p>
        <Button onClick={() => navigate("/")}>Back to Home</Button>
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
